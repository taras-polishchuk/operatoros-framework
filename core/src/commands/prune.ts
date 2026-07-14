/**
 * operatoros prune — Two-phase cleanup of orphan artifacts.
 *
 *   operatoros prune --dry-run    → list planned deletions, no writes
 *   operatoros prune --confirm    → requires explicit targets; refuses blanket deletion
 *
 * Safety guarantees:
 *   - dryRun is the DEFAULT and ONLY safe mode. --dry-run is on by default.
 *   - --confirm is required to actually delete. Without it, prune is a no-op.
 *   - Without an explicit target list, --confirm refuses to delete anything
 *     (blanket-deletion of all orphans is too dangerous for a single flag).
 *   - Files in CATALOG_EXCLUDES (.git, node_modules, ...) are never pruned.
 *   - Directories are pruned only when explicitly listed.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { heading, ok, info, fail } from "../lib/print";
import { findWorkspaceRoot } from "../lib/workspace";
import { staleCommand } from "./stale";
import { CATALOG_EXCLUDES } from "../lib/catalog";

interface PruneOptions {
  target?: string;
  dryRun?: boolean;
  confirm?: boolean;
  paths?: string[];
}

export interface PruneResult {
  planned: string[];
  deleted: string[];
  skipped: string[];
  dryRun: boolean;
}

function isExcluded(p: string): boolean {
  const parts = p.split("/");
  return parts.some((part) => CATALOG_EXCLUDES.includes(part));
}

export async function pruneCommand(opts: PruneOptions = {}): Promise<PruneResult> {
  heading("OperatorOS prune");
  const start = opts.target ? path.resolve(opts.target) : process.cwd();
  const root = await findWorkspaceRoot(start) ?? start;
  const dryRun = opts.dryRun !== false; // default dry-run ON

  if (dryRun) {
    info("DRY RUN — no files will be deleted. pass --confirm (with explicit paths) to delete.");
  } else {
    info("CONFIRM mode — files will be deleted.");
  }

  // 1. Resolve targets: explicit --paths OR stale-derived orphan list
  let targets: string[];
  if (opts.paths && opts.paths.length > 0) {
    targets = opts.paths;
  } else {
    info("computing orphan targets via `stale` (no explicit --paths provided)");
    const orphans = await staleCommand({ target: root });
    targets = orphans
      .filter((e) => !isExcluded(e.path))
      .map((e) => e.path);
  }

  // 2. Filter excluded paths defensively (even if --paths provided)
  const safe: string[] = [];
  const skipped: string[] = [];
  for (const t of targets) {
    if (isExcluded(t)) {
      skipped.push(t);
    } else {
      safe.push(t);
    }
  }

  const result: PruneResult = {
    planned: safe,
    deleted: [],
    skipped,
    dryRun,
  };

  // 3. Act: dry-run reports; confirm requires explicit & non-empty list
  if (dryRun) {
    info(`would delete ${safe.length} target(s):`);
    for (const p of safe) info(`  - ${p}`);
    if (skipped.length > 0) info(`skipped (excluded): ${skipped.length}`);
    return result;
  }

  // confirm mode
  if (!opts.confirm) {
    fail("refusing to delete without --confirm");
    info("usage: operatoros prune --paths p1 p2 ... --confirm");
    info("       operatoros prune --dry-run          # safe preview, no deletion");
    return result;
  }
  if (!opts.paths || opts.paths.length === 0) {
    fail("--confirm requires explicit --paths (no implicit blanket deletion)");
    info("run `operatoros prune --dry-run` first to preview, then re-run with --paths <list>");
    return result;
  }
  if (safe.length === 0) {
    fail("nothing to delete (all targets were in CATALOG_EXCLUDES)");
    return result;
  }

  for (const relPath of safe) {
    const abs = path.join(root, relPath);
    try {
      await fs.remove(abs);
      result.deleted.push(relPath);
      ok(`deleted ${relPath}`);
    } catch (e: any) {
      fail(`failed to delete ${relPath}: ${e.message ?? e}`);
    }
  }

  return result;
}
