/**
 * operatoros init — scaffold a new workspace.
 *
 * v0.4.0-alpha: --preset picks from canonical presets in presets-canonical/.
 * Falls back to "personal" if no flag given.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { heading, ok, info, fail } from "../lib/print";
import { WORKSPACE_FILENAME, WORKSPACE_LAYOUT } from "../lib/workspace";

interface InitOptions {
  personal?: boolean;
  preset?: string;
  target?: string;
  force?: boolean;
}

/**
 * Locate the operatoros-framework checkout (the canonical presets ship with it).
 * Used to copy presets-canonical/<name>/preset.yaml into the new workspace.
 */
function findCanonicalPresetsRoot(): string | null {
  // Walk up from the bundled binary location looking for presets-canonical/.
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, "presets-canonical");
    if (require("fs").existsSync(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export async function initCommand(opts: InitOptions): Promise<void> {
  heading("OperatorOS init");

  const target = path.resolve(opts.target ?? process.cwd());
  const preset = opts.preset ?? (opts.personal ? "personal" : "personal");

  if (await fs.pathExists(path.join(target, WORKSPACE_FILENAME))) {
    if (!opts.force) {
      fail(`workspace already exists at ${target} (use --force to overwrite)`);
      process.exit(1);
    }
  }

  info(`target: ${target}`);
  info(`preset: ${preset}`);

  // Create layout
  for (const folder of WORKSPACE_LAYOUT) {
    await fs.ensureDir(path.join(target, folder));
  }
  ok(`created layout: ${WORKSPACE_LAYOUT.join(", ")}/`);

  // Resolve canonical preset
  const canonicalRoot = findCanonicalPresetsRoot();
  let presetContent: string | null = null;
  if (canonicalRoot) {
    const canonical = path.join(canonicalRoot, "presets-canonical", preset, "preset.yaml");
    if (await fs.pathExists(canonical)) {
      presetContent = await fs.readFile(canonical, "utf8");
      ok(`using canonical preset: presets-canonical/${preset}/preset.yaml`);
    }
  }
  if (!presetContent) {
    fail(`preset "${preset}" not found`);
    if (canonicalRoot) {
      info(`available: ${await listPresets(canonicalRoot)}`);
    }
    info(`hint: --preset <name> from {minimal, personal, team-research, dev-machine}`);
    process.exit(1);
  }

  // Parse canonical preset to get modules list
  const { load: yamlLoad } = await import("js-yaml");
  const canonical = yamlLoad(presetContent) as {
    name: string;
    modules?: Array<{ name: string; source?: string; pin?: string }>;
    settings?: Record<string, unknown>;
  };

  // operatoros.yaml
  const manifest = renderManifest(preset);
  await fs.writeFile(path.join(target, WORKSPACE_FILENAME), manifest);
  ok(`created ${WORKSPACE_FILENAME}`);

  // presets/<name>/preset.yaml (copy of canonical)
  const presetDir = path.join(target, "presets", preset);
  await fs.ensureDir(presetDir);
  await fs.writeFile(path.join(presetDir, "preset.yaml"), presetContent);
  ok(`created presets/${preset}/preset.yaml`);

  // Note about modules in canonical (NOT installed by init — that's `apply`'s job)
  const modules = canonical.modules ?? [];
  if (modules.length > 0) {
    info(`preset declares ${modules.length} module(s): ${modules.map((m) => m.name).join(", ")}`);
    info(`run 'operatoros apply' to install them`);
  }

  // presets/README — index of installed vs canonical presets
  await fs.writeFile(
    path.join(target, "presets", "README.md"),
    `# presets/\n\nThis workspace's active preset is **${preset}** (declared in \`operatoros.yaml\`).\n\nCanonical presets shipped with OperatorOS:\n- minimal — bare workspace\n- personal — single-operator default (with journal example)\n- team-research — collaboration-oriented (with hooks example)\n- dev-machine — opinionated dev setup\n\nTo switch presets: edit \`operatoros.yaml\` preset field, then run \`operatoros apply\`.\n`
  );
  ok(`created presets/README.md`);

  // schemas/README
  await fs.writeFile(
    path.join(target, "schemas", "README.md"),
    `# schemas/\n\nSchemas for this workspace are validated against the OperatorOS Core schemas shipped in the framework repo:\n\n- https://github.com/taras-polishchuk/operatoros-framework/tree/main/schemas\n\nRun \`operatoros validate <path>\` to check any workspace/module/preset against its schema.\n`
  );
  ok(`created schemas/README.md`);

  // state/README
  await fs.writeFile(
    path.join(target, "state", "README.md"),
    `# state/\n\nMutable runtime state for this workspace. Should be in \`.gitignore\`.\n`
  );
  ok(`created state/README.md`);

  // vault/README
  await fs.writeFile(
    path.join(target, "vault", "README.md"),
    `# vault/\n\nEncrypted secrets storage. Never commit this directory.\n\nOperatorOS Core's \`export\` command will deny-list this folder by default.\n`
  );
  ok(`created vault/README.md`);

  // modules/README
  await fs.writeFile(
    path.join(target, "modules", "README.md"),
    `# modules/\n\nModules extend your workspace. Install one with:\n\n    operatoros install <name>     # from public registry\n    operatoros add <path-or-url>  # from local or git\n\nModules declare their contract via \`module.yaml\` at the root.\n`
  );
  ok(`created modules/README.md`);

  console.log("\n  next: cd into your workspace and run:");
  console.log("    $ operatoros apply                # install preset modules");
  console.log("    $ operatoros validate operatoros.yaml");
  console.log("    $ operatoros run <module> <cmd>\n");
}

async function listPresets(root: string): Promise<string> {
  const dir = path.join(root, "presets-canonical");
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((e) => !e.startsWith(".")).join(", ");
  } catch {
    return "(unreadable)";
  }
}

function renderManifest(preset: string): string {
  return `# operatoros.yaml — workspace manifest
# generated by operatoros-core v0.4.0-alpha
version: "0.2"
name: personal-workspace
preset: ${preset}
modules: []
module_sources: {}
created_at: "${new Date().toISOString()}"
operatoros_version: "0.4.0-alpha"
`;
}