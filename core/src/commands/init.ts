/**
 * operatoros init — scaffold a new workspace.
 *
 * --preset picks from canonical presets in presets-canonical/.
 * Currently only `personal` exists. Falls back to `personal` if no flag given.
 *
 * Canonical presets ship embedded in the ncc bundle (see src/embedded-assets.ts).
 * Dev mode falls back to filesystem lookup.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { heading, ok, info, fail } from "../lib/print";
import { WORKSPACE_FILENAME, WORKSPACE_LAYOUT } from "../lib/workspace";
import { version as CORE_VERSION } from "../../package.json";

interface InitOptions {
  personal?: boolean;
  preset?: string;
  target?: string;
  force?: boolean;
}

function readCanonicalPreset(name: string): string | null {
  // 1. Embedded (ncc bundle)
  const embedded = (globalThis as { __embeddedPresets?: Record<string, string> })
    .__embeddedPresets;
  if (embedded && embedded[name]) {
    return embedded[name];
  }
  // 2. Filesystem (dev mode)
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, "presets-canonical", name, "preset.yaml");
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate, "utf8");
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export async function initCommand(opts: InitOptions): Promise<void> {
  heading("OperatorOS init");

  const target = path.resolve(opts.target ?? process.cwd());
  const preset = opts.preset ?? "personal";

  if (await fs.pathExists(path.join(target, WORKSPACE_FILENAME))) {
    if (!opts.force) {
      fail(`workspace already exists at ${target} (use --force to overwrite)`);
      process.exit(1);
    }
  }

  info(`target: ${target}`);
  info(`preset: ${preset}`);

  for (const folder of WORKSPACE_LAYOUT) {
    await fs.ensureDir(path.join(target, folder));
  }
  ok(`created layout: ${WORKSPACE_LAYOUT.join(", ")}/`);

  const presetContent = readCanonicalPreset(preset);
  if (!presetContent) {
    fail(`preset "${preset}" not found`);
    info(`available: ${Object.keys(
      (globalThis as { __embeddedPresets?: Record<string, string> }).__embeddedPresets ?? {}
    ).join(", ") || "(none — install issue)"}`);
    process.exit(1);
  }
  ok(`using canonical preset: ${preset} (${presetContent.length} bytes)`);

  const manifest = renderManifest(preset);
  await fs.writeFile(path.join(target, WORKSPACE_FILENAME), manifest);
  ok(`created ${WORKSPACE_FILENAME}`);

  const presetDir = path.join(target, "presets", preset);
  await fs.ensureDir(presetDir);
  await fs.writeFile(path.join(presetDir, "preset.yaml"), presetContent);
  ok(`created presets/${preset}/preset.yaml`);

  await fs.writeFile(
    path.join(target, "presets", "README.md"),
    `# presets/\n\nThis workspace's active preset is **${preset}** (declared in \`operatoros.yaml\`).\n\nOnly the \`personal\` preset ships with OperatorOS today. Add more by editing \`operatoros.yaml\` and running \`operatoros apply <name>\`.\n`
  );
  ok(`created presets/README.md`);

  await fs.writeFile(
    path.join(target, "schemas", "README.md"),
    `# schemas/\n\nSchemas for this workspace are validated against the OperatorOS Core schemas. The Core binary bundles them internally; see the framework repo at https://github.com/taras-polishchuk/operatoros-framework/tree/main/schemas.\n\nRun \`operatoros validate <path>\` to check any workspace/module/preset against its schema.\n`
  );
  ok(`created schemas/README.md`);

  await fs.writeFile(
    path.join(target, "state", "README.md"),
    `# state/\n\nMutable runtime state for this workspace. Should be in \`.gitignore\`.\n`
  );
  ok(`created state/README.md`);

  await fs.writeFile(
    path.join(target, "vault", "README.md"),
    `# vault/\n\nEncrypted secrets storage. Never commit this directory.\n\nOperatorOS Core's \`export\` command will deny-list this folder by default.\n`
  );
  ok(`created vault/README.md`);

  await fs.writeFile(
    path.join(target, "modules", "README.md"),
    `# modules/\n\nModules extend your workspace. Install one with:\n\n    operatoros add <path-or-url>   # from local path or git URL\n\nModules declare their contract via \`module.yaml\` at the root.\n`
  );
  ok(`created modules/README.md`);

  // bootstrap.md — the AI-agent entry point. Follows the five-section contract
  // documented in methodology/04-agent-bootstrap.md. This is a DEFAULT starting
  // point; the user is expected to customize it for their real workspace.
  const bootstrapPath = path.join(target, "bootstrap.md");
  if (!(await fs.pathExists(bootstrapPath)) || opts.force) {
    // Per B2 amendment: if the `bootstrap-md` module is installed, delegate
    // to it. Otherwise fall back to the in-binary generator (no behavior
    // change for users who haven't installed the module).
    const bootstrapMdModule = path.join(target, "modules", "bootstrap-md");
    const useModule = await fs.pathExists(path.join(bootstrapMdModule, "module.yaml"));
    if (useModule) {
      // Delegate to the module via `operatoros run`. This is best-effort:
      // if the module's render fails, fall back to the in-binary generator
      // so init never blocks on a broken module.
      const { spawn } = await import("child_process");
      const result = await new Promise<{ code: number }>((resolve) => {
        const child = spawn(
          process.execPath,
          [path.join(__dirname, "..", "cli.js"), "run", "bootstrap-md", "render",
           "--target", target, "--out", bootstrapPath],
          { stdio: "inherit" }
        );
        child.on("close", (code) => resolve({ code: code ?? 1 }));
        child.on("error", () => resolve({ code: 1 }));
      });
      if (result.code === 0) {
        ok(`created bootstrap.md (via bootstrap-md module)`);
      } else {
        await fs.writeFile(bootstrapPath, renderBootstrap());
        ok(`created bootstrap.md (in-binary fallback — module render failed)`);
      }
    } else {
      await fs.writeFile(bootstrapPath, renderBootstrap());
      ok(`created bootstrap.md (in-binary fallback — install bootstrap-md module for higher-fidelity render)`);
    }
  } else {
    info(`bootstrap.md already exists — left untouched (use --force to regenerate)`);
  }

  // .operatoros/index.json — Workspace Catalog. Single explicit invocation.
  // Per brief §6: catalog is durable metadata only (no usage tracking, no
  // telemetry). Catalog is generated on init so `doctor` and `stats` work
  // immediately without a separate `index` step.
  const { buildCatalog } = await import("../lib/catalog");
  const catalogPath = await buildCatalog(target);
  ok(`created catalog at ${path.relative(target, catalogPath)}`);

  console.log("\n  next steps:");
  console.log("    $ operatoros validate operatoros.yaml");
  console.log("    $ operatoros add <path-to-your-first-module>  # see CONTRIBUTING.md");
  console.log("    $ operatoros doctor   # check workspace health");
  console.log("    $ operatoros stats    # see catalog statistics");
  console.log("");
}

function renderManifest(preset: string): string {
  return `# operatoros.yaml — workspace manifest
# generated by operatoros-core
version: "0.2"
name: personal-workspace
preset: ${preset}
modules: []
module_sources: {}
created_at: "${new Date().toISOString()}"
operatoros_version: "${CORE_VERSION}"
`;
}

/**
 * Render the default bootstrap.md — the AI-agent entry point.
 *
 * Follows the five-section contract in methodology/04-agent-bootstrap.md:
 *   1. Always read first   2. Read when relevant   3. Discover on demand
 *   4. Never read          5. Onboarding
 *
 * This is a DEFAULT. The generated paths are placeholders the user replaces
 * with their real workspace structure. It intentionally contains no
 * mission-specific detail, no inline system-graph, and no private data.
 */
function renderBootstrap(): string {
  return `# Bootstrap — personal-workspace

> Generated by operatoros-core v${CORE_VERSION} on ${new Date().toISOString().slice(0, 10)}.
> This is a DEFAULT starting point. Customize it for your real workspace, then
> stop regenerating it — see methodology/04-agent-bootstrap.md §"Generated vs hand-written".
>
> This file is the front door for any AI agent (Claude, GPT, Hermes, Aider)
> entering this workspace. Read it top to bottom; it should stay ~1-2K tokens.

## 1. Always read first
- \`IDENTITY.md\`: who owns this workspace, what they do, what they care about.
- \`operatoros.yaml\`: the workspace manifest — active preset and installed modules.
- \`bootstrap.md\`: this file — how to navigate the workspace and when to ask.
- \`presets/<active-preset>/preset.yaml\`: which modules this workspace composes.

## 2. Read when relevant
- \`modules/<module>/module.yaml\`: read before running or modifying that module.
- \`state/\`: read only when a task needs current runtime state.
- \`schemas/README.md\`: read before authoring a new config or module.

## 3. Discover on demand
- \`modules/**/README.md\`: search when you need a module's usage but it's not in scope yet.
- \`presets/**/*.yaml\`: search when composing or comparing presets.

## 4. Never read
- \`vault/**\`: secrets. Never read, never print, never commit.
- \`state/**/*.log\`: runtime noise; ignore unless explicitly debugging.
- \`node_modules/**\`, \`dist/**\`, \`.git/**\`: dependencies and build output.

## 5. Onboarding
- If \`IDENTITY.md\` is missing or lacks \`onboarding_complete: true\`, run the interview
  before starting real work.
- Interview script: methodology/05-onboarding-interview.md (five questions).
- Write the answers to \`IDENTITY.md\` and set \`onboarding_complete: true\`.
`;
}