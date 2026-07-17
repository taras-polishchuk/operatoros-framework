/**
 * operatoros add — install a module from a local path or git URL.
 *
 * Local: copy module.yaml + contents into workspace/modules/<name>/
 * Git:   shallow clone, then copy.
 *
 * Validates module.yaml against the module schema before installing.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
import { heading, ok, info, fail } from "../lib/print";
import { findWorkspaceRoot } from "../lib/workspace";
import { validateYaml } from "../lib/schema";

interface AddOptions {
  name?: string;
  pin?: string;
}

export async function addCommand(source: string, opts: AddOptions): Promise<void> {
  heading("OperatorOS add");

  const root = await findWorkspaceRoot();
  if (!root) {
    fail(`no workspace found (operatoros.yaml missing in current dir or parents)`);
    info(`run \`operatoros init --personal\` first`);
    process.exit(1);
  }
  info(`workspace: ${root}`);

  // Resolve source
  const isGit = /^https?:\/\/|git@|ssh:\/\//.test(source);
  let stagingDir: string;

  if (isGit) {
    info(`cloning: ${source}${opts.pin ? ` @ ${opts.pin}` : ""}`);
    stagingDir = await fs.mkdtemp(path.join("/tmp", "operatoros-add-"));
    try {
      const ref = opts.pin ? `--branch ${opts.pin}` : "";
      execSync(`git clone --depth 1 ${ref} ${JSON.stringify(source)} ${JSON.stringify(stagingDir)}`, {
        stdio: ["ignore", "ignore", "pipe"],
      });
    } catch (e: unknown) {
      fail(`git clone failed: ${(e as Error).message}`);
      await fs.remove(stagingDir);
      process.exit(1);
    }
  } else {
    // Smart resolution: source could be (a) path, (b) bare name.
    // (a) Path: contains '/', starts with '.' or '~'.
    // (b) Name: bare word. Try cwd/<name>, then workspace/modules/<name>.
    const looksLikePath =
      source.includes("/") ||
      source.startsWith(".") ||
      source.startsWith("~") ||
      source === ".." ||
      /^[A-Za-z]:[\\/]/.test(source); // Windows drive letter

    if (looksLikePath) {
      const localPath = path.resolve(source);
      if (!(await fs.pathExists(localPath))) {
        fail(`source not found: ${localPath}`);
        info(`hint: pass an absolute path, a relative path (./foo), or a git URL`);
        process.exit(1);
      }
      stagingDir = localPath;
      info(`local source: ${stagingDir}`);
    } else {
      // Bare name: try cwd/<name> and workspace/modules/<name>
      const candidates = [
        path.resolve(process.cwd(), source),
        path.join(root, "modules", source),
      ];
      const found = candidates.find((p) => fs.pathExistsSync(p));
      if (found) {
        stagingDir = found;
        info(`local source (resolved from name): ${stagingDir}`);
      } else {
        fail(`source not found: ${source}`);
        info(`Searched:`);
        for (const c of candidates) info(`  - ${c}`);
        info(`hint: pass an absolute or relative path (./modules/${source}), or install a git URL`);
        info(`hint: if you meant operatoros install <alias>, the alias is just 'add'`);
        process.exit(1);
      }
    }
  }

  // Locate module.yaml in staging
  let moduleYaml = path.join(stagingDir, "module.yaml");
  if (!(await fs.pathExists(moduleYaml))) {
    // If this looks like a checkout of operatoros-framework (git source),
    // try resolving a sibling `modules/<name>/` directory. This lets
    // visitor presets point at https://github.com/.../operatoros-framework
    // with `--pin v0.8.4` and pick up the matching modules/<name>/ subtree.
    const inferredName = opts.name ?? "";
    if (inferredName) {
      const treePath = path.join(stagingDir, "modules", inferredName, "module.yaml");
      if (await fs.pathExists(treePath)) {
        stagingDir = path.join(stagingDir, "modules", inferredName);
        moduleYaml = treePath;
        info(`resolved operatoros-framework module tree: ${stagingDir}`);
      }
    }
    if (!(await fs.pathExists(moduleYaml))) {
      fail(`${stagingDir} is not a valid OperatorOS module`);
      info(`expected ./module.yaml at the root of the source`);
      info(`see CONTRIBUTING.md for the module contract`);
      if (isGit) await fs.remove(stagingDir);
      process.exit(1);
    }
  }

  // Validate BEFORE copying
  info(`validating module.yaml`);
  const validation = await validateYaml(moduleYaml, "module");
  if (!validation.valid) {
    fail(`module.yaml invalid:`);
    for (const err of validation.errors) {
      console.error(`    ${err}`);
    }
    if (isGit) await fs.remove(stagingDir);
    process.exit(1);
  }
  ok(`module.yaml is valid`);

  // Determine module name (from --name flag, or from manifest, or from dir name)
  const name = opts.name ?? (await inferModuleName(stagingDir, source));
  const target = path.join(root, "modules", name);

  if (await fs.pathExists(target)) {
    fail(`module "${name}" already installed at ${target}`);
    if (isGit) await fs.remove(stagingDir);
    process.exit(1);
  }

  // Copy contents (NOT the staging dir itself, but its contents)
  await fs.copy(stagingDir, target, { overwrite: false });
  ok(`installed module "${name}" → modules/${name}/`);

  // Cleanup staging if git
  if (isGit) {
    await fs.remove(stagingDir);
  }

  // Update operatoros.yaml to register the module
  await registerModule(root, name);
  ok(`registered "${name}" in operatoros.yaml`);
}

async function inferModuleName(stagingDir: string, source: string): Promise<string> {
  // Try to read from module.yaml
  try {
    const raw = await fs.readFile(path.join(stagingDir, "module.yaml"), "utf8");
    const yaml = (await import("js-yaml")).load(raw) as { name?: string };
    if (yaml?.name) return String(yaml.name);
  } catch {
    /* ignore */
  }
  // Fallback: derive from URL or path
  const lastSegment = source.replace(/\/$/, "").split("/").pop() ?? "module";
  return lastSegment.replace(/\.git$/, "").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

async function registerModule(root: string, name: string): Promise<void> {
  const file = path.join(root, "operatoros.yaml");
  const raw = await fs.readFile(file, "utf8");
  const yaml = (await import("js-yaml")).load(raw) as { modules?: string[] };
  const modules = Array.isArray(yaml.modules) ? yaml.modules : [];
  if (!modules.includes(name)) modules.push(name);
  yaml.modules = modules;
  const dumped = (await import("js-yaml")).dump(yaml);
  await fs.writeFile(file, dumped);
}