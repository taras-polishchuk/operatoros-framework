/**
 * operatoros apply — apply a preset to the current workspace.
 *
 * Reads presets/<name>/preset.yaml, validates against preset schema,
 * then installs each declared module (local or git source).
 */
import * as fs from "fs-extra";
import * as path from "path";
import { heading, ok, info, fail } from "../lib/print";
import { findWorkspaceRoot, loadWorkspace } from "../lib/workspace";
import { validateYaml } from "../lib/schema";
import { extractHooks, runHooks } from "../lib/hooks";

interface ApplyOptions {}

export async function applyCommand(presetArg: string | undefined, _opts: ApplyOptions): Promise<void> {
  heading("OperatorOS apply");

  const root = await findWorkspaceRoot();
  if (!root) {
    fail(`no workspace found (operatoros.yaml missing)`);
    info(`run \`operatoros init --personal\` first`);
    process.exit(1);
  }
  info(`workspace: ${root}`);

  // Resolve preset name: arg, or default from manifest
  let presetName = presetArg;
  if (!presetName) {
    const manifest = await loadWorkspace(root);
    presetName = manifest.preset;
    if (!presetName) {
      fail(`no preset name provided and operatoros.yaml has no preset field`);
      info(`usage: operatoros apply <preset-name>`);
      process.exit(1);
    }
    info(`using default preset from manifest: ${presetName}`);
  }

  const presetDir = path.join(root, "presets", presetName);
  const presetYaml = path.join(presetDir, "preset.yaml");
  if (!(await fs.pathExists(presetYaml))) {
    fail(`preset not found: ${presetYaml}`);
    process.exit(1);
  }

  // Validate preset
  info(`validating preset`);
  const validation = await validateYaml(presetYaml, "preset");
  if (!validation.valid) {
    fail(`preset.yaml invalid:`);
    for (const err of validation.errors) console.error(`    ${err}`);
    process.exit(1);
  }
  ok(`preset.yaml is valid`);

  // Load modules list
  const raw = await fs.readFile(presetYaml, "utf8");
  const { load: yamlLoad } = await import("js-yaml");
  const preset = yamlLoad(raw) as {
    modules?: Array<{ name: string; source?: string; pin?: string }>;
    settings?: { hooks?: Record<string, string[]> };
  };

  // Hooks: pre-apply
  await runHooks("pre-apply", extractHooks({ settings: preset.settings }), root);

  const modules = preset.modules ?? [];
  if (modules.length === 0) {
    info(`preset has no modules to install`);
  } else {
    info(`modules to install: ${modules.length}`);

    let installed = 0;
    for (const mod of modules) {
      if (!mod.source) {
        info(`skipping ${mod.name} — no source`);
        continue;
      }
      // Resolve relative sources against workspace root (not cwd).
      // Convention: `./foo` is relative to workspace root.
      let resolvedSource = mod.source;
      if (resolvedSource.startsWith("./")) {
        resolvedSource = path.join(root, resolvedSource.slice(2));
      }
      info(`installing ${mod.name} from ${resolvedSource}`);
      try {
        const { addCommand } = await import("./add");
        await addCommand(resolvedSource, { name: mod.name, pin: mod.pin });
        installed += 1;
      } catch (e) {
        fail(`failed to install ${mod.name}: ${(e as Error).message}`);
        process.exit(1);
      }
    }
    ok(`installed ${installed}/${modules.length} modules from preset "${presetName}"`);
  }

  // Hooks: post-apply
  await runHooks("post-apply", extractHooks({ settings: preset.settings }), root);
}