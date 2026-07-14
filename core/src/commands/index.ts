/**
 * operatoros index — Rebuild the Workspace Catalog.
 *
 * Per design brief §6: this is the ONLY command that writes to the catalog.
 * Catalog content is durable metadata only (path/type/size/mtime/content_hash/indexed_at).
 * No background process, no hooks, no auto-refresh. Explicit invocation only.
 *
 * Out of scope:
 *   - opened_count, last_access (forbidden by brief §6)
 *   - filesystem watchers (forbidden)
 *   - IDE plugin hooks (forbidden)
 */
import * as fs from "fs-extra";
import * as path from "path";
import { heading, ok, info } from "../lib/print";
import { findWorkspaceRoot, loadWorkspace } from "../lib/workspace";
import { buildCatalog, CATALOG_FILE } from "../lib/catalog";

interface IndexOptions {
  target?: string;
}

export async function indexCommand(opts: IndexOptions = {}): Promise<void> {
  heading("OperatorOS index — Rebuild Workspace Catalog");

  const start = opts.target ? path.resolve(opts.target) : process.cwd();
  const root = await findWorkspaceRoot(start);
  if (!root) {
    info(`no operatoros.yaml found at or above ${start}`);
    info("running in directory scan mode; results will not be persisted to operatoros.yaml-managed workspace");
    // Even without operatoros.yaml, build the catalog so scan mode produces output.
    await buildCatalog(start);
    ok(`catalog written to ${path.join(start, ".operatoros", CATALOG_FILE)}`);
    return;
  }

  const ws = await loadWorkspace(root);
  info(`workspace: ${ws.name} (operatoros ${ws.operatoros_version ?? "unknown"})`);
  info(`root:      ${root}`);

  const catalogPath = await buildCatalog(root);
  ok(`catalog written to ${path.relative(root, catalogPath)}`);
}
