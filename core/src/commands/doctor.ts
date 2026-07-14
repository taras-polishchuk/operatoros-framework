/**
 * operatoros doctor — Workspace diagnostics.
 *
 * Reports on workspace structure, manifest validity, and layout completeness.
 * Read-only: never modifies the filesystem.
 *
 * Findings are typed (codes) so consumers can branch programmatically:
 *   - "missing-manifest"   : no operatoros.yaml at workspace root
 *   - "missing-layout"     : required layout directories absent
 *   - "stale-catalog"      : .operatoros/index.json present but stale
 *   - "missing-catalog"    : no catalog (informational — not a failure)
 *   - "schema-invalid"     : operatoros.yaml does not validate against workspace.schema.json
 */
import * as fs from "fs-extra";
import * as path from "path";
import { findWorkspaceRoot, loadWorkspace, WORKSPACE_LAYOUT } from "../lib/workspace";
import { readCatalog } from "../lib/catalog";
import { validateYaml } from "../lib/schema";

export interface DoctorFinding {
  code: string;
  level: "error" | "warning" | "info";
  message: string;
}

export interface DoctorResult {
  ok: boolean;
  findings: DoctorFinding[];
}

interface DoctorOptions {
  target?: string;
}

export async function doctorCommand(opts: DoctorOptions = {}): Promise<DoctorResult> {
  const start = opts.target ? path.resolve(opts.target) : process.cwd();
  const findings: DoctorFinding[] = [];

  const root = await findWorkspaceRoot(start);
  if (!root) {
    findings.push({
      code: "missing-manifest",
      level: "error",
      message: `no operatoros.yaml found at or above ${start}`,
    });
    return { ok: false, findings };
  }

  // Schema validation of operatoros.yaml
  try {
    await loadWorkspace(root);
    const v = await validateYaml(path.join(root, "operatoros.yaml"), "workspace");
    if (!v.valid) {
      for (const err of v.errors) {
        findings.push({
          code: "schema-invalid",
          level: "error",
          message: `operatoros.yaml: ${err}`,
        });
      }
    }
  } catch (e: any) {
    findings.push({
      code: "schema-invalid",
      level: "error",
      message: `operatoros.yaml parse error: ${e.message ?? String(e)}`,
    });
  }

  // Layout completeness
  for (const folder of WORKSPACE_LAYOUT) {
    const abs = path.join(root, folder);
    if (!(await fs.pathExists(abs))) {
      findings.push({
        code: "missing-layout",
        level: "warning",
        message: `missing required layout directory: ${folder}/`,
      });
    }
  }

  // Catalog freshness
  const catalog = await readCatalog(root);
  if (!catalog) {
    findings.push({
      code: "missing-catalog",
      level: "info",
      message: "no workspace catalog found — run `operatoros index` to create one",
    });
  } else if (catalog.stale) {
    findings.push({
      code: "stale-catalog",
      level: "warning",
      message: `workspace catalog is stale (indexed_at: ${catalog.indexed_at}) — run \`operatoros index\` to refresh`,
    });
  }

  const okFlag = findings.every((f) => f.level !== "error");
  return { ok: okFlag, findings };
}
