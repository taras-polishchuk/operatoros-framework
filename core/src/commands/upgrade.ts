/**
 * operatoros upgrade — re-fetch an installed module.
 *
 * Workflow:
 * 1. Resolve the original source from operatoros.yaml's modules[] entry, OR
 *    fall back to a heuristic (look for `source:` in module.yaml comment).
 * 2. Backup current module to modules/<name>.bak-<timestamp>/.
 * 3. Re-install via `add` (validates + copies).
 *
 * v0.4.0-alpha limitation: source must be discoverable from operatoros.yaml
 * or env var OPERATOROS_MODULE_SOURCE_<NAME>. Phase 2.1 will add a proper
 * `.operatoros/state.json` to track original sources.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { heading, ok, info, fail } from "../lib/print";
import { findWorkspaceRoot, loadWorkspace } from "../lib/workspace";
import { addCommand } from "./add";

interface UpgradeOptions {}

export async function upgradeCommand(name: string | undefined, _opts: UpgradeOptions): Promise<void> {
  heading("OperatorOS upgrade");

  if (!name) {
    fail(`usage: operatoros upgrade <module-name>`);
    process.exit(1);
  }

  const root = await findWorkspaceRoot();
  if (!root) {
    fail(`no workspace found`);
    process.exit(1);
  }
  info(`workspace: ${root}`);

  const manifest = await loadWorkspace(root);
  if (!manifest.modules?.includes(name)) {
    fail(`module "${name}" not installed in this workspace`);
    process.exit(1);
  }

  // Resolve source: env var override, else we need it in operatoros.yaml or fallback.
  const sourceEnv = process.env[`OPERATOROS_MODULE_SOURCE_${name.toUpperCase().replace(/-/g, "_")}`];
  let source = sourceEnv;

  if (!source) {
    // Heuristic: look in operatoros.yaml under a `module_sources` map (v0.4.0+ convention).
    const yamlRaw = await fs.readFile(path.join(root, "operatoros.yaml"), "utf8");
    const { load: yamlLoad } = await import("js-yaml");
    const yamlObj = yamlLoad(yamlRaw) as { module_sources?: Record<string, string> };
    source = yamlObj.module_sources?.[name];
  }

  if (!source) {
    fail(`cannot determine source for "${name}"`);
    info(`hint: set OPERATOROS_MODULE_SOURCE_${name.toUpperCase().replace(/-/g, "_")}=<url>`);
    info(`hint: or add 'module_sources: { ${name}: <source> }' to operatoros.yaml`);
    info(`tip: use 'operatoros add <source>' for fresh installs`);
    process.exit(1);
  }

  // Backup current
  const target = path.join(root, "modules", name);
  if (!(await fs.pathExists(target))) {
    fail(`module directory missing: ${target}`);
    process.exit(1);
  }
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = `${target}.bak-${ts}`;
  await fs.move(target, backup);
  ok(`backed up → ${path.basename(backup)}`);

  // Re-install
  info(`re-installing from: ${source}`);
  await addCommand(source, { name });

  ok(`upgrade complete — backup preserved at ${path.basename(backup)}`);
  info(`to rollback: mv ${path.basename(backup)} ${name}`);
}