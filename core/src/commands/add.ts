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
    const localPath = path.resolve(source);
    if (!(await fs.pathExists(localPath))) {
      fail(`source not found: ${localPath}`);
      process.exit(1);
    }
    stagingDir = localPath;
    info(`local source: ${stagingDir}`);
  }

  // Locate module.yaml in staging
  const moduleYaml = path.join(stagingDir, "module.yaml");
  if (!(await fs.pathExists(moduleYaml))) {
    fail(`module.yaml not found at root of source`);
    if (isGit) await fs.remove(stagingDir);
    process.exit(1);
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