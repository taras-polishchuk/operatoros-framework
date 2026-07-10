/**
 * operatoros apply — apply a preset to the current workspace.
 *
 * Reads presets/<name>/preset.yaml, validates against preset schema,
 * then installs each declared module (local or git source).
 */
import * as fs from "fs-extra";
import * as path from "path";
import { load as yamlLoad, dump as yamlDump } from "js-yaml";
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

  // Load preset YAML
  let raw = await fs.readFile(presetYaml, "utf8");

  // The preset YAML we read from the workspace may carry relative
  // `source:` paths (e.g. `../../examples/journal`) that resolve correctly
  // only against the canonical preset's location. Rewrite those to absolute
  // paths pointing at the canonical examples dir so `apply` keeps working
  // when the workspace has been moved, copied, or lives outside the repo.
  // If rewriting fails, fall back to the on-disk YAML as-is.
  info(`rewriting relative source paths (if any) to absolute`);
  let canonPresetYaml: string | null = null;
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, "presets-canonical", presetName, "preset.yaml");
    if (fs.existsSync(candidate)) { canonPresetYaml = candidate; break; }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (canonPresetYaml) {
    const parsed = yamlLoad(raw) as {
      modules?: Array<{ name: string; source?: string; pin?: string }>;
    };
    if (Array.isArray(parsed.modules)) {
      let rewritten = 0;
      for (const m of parsed.modules) {
        if (m.source && (m.source.startsWith("./") || m.source.startsWith("../"))) {
          // Resolve relative to the canonical preset.yaml's directory, not
          // to presets-canonical/ root — this is what the path was authored
          // against in presets-canonical/<name>/preset.yaml.
          m.source = path.resolve(path.dirname(canonPresetYaml), m.source);
          rewritten += 1;
        }
      }
      if (rewritten > 0) {
        raw = yamlDump(parsed);
        await fs.writeFile(presetYaml, raw);
        ok(`rewrote ${rewritten} module source(s) to absolute paths`);
      }
    }
  }

  // Load modules list
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
      // Resolve relative sources against the preset.yaml file's directory
      // (not cwd, not workspace root). Convention: `./foo` and `../foo`
      // are relative to where the preset lives; absolute paths and git
      // URLs are passed through verbatim. This makes `../../examples/journal`
      // resolve correctly when the preset sits in presets-canonical/<name>/.
      let resolvedSource = mod.source;
      if (resolvedSource.startsWith("./") || resolvedSource.startsWith("../")) {
        resolvedSource = path.resolve(presetDir, resolvedSource);
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