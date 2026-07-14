/**
 * operatoros stats — Workspace statistics.
 *
 * Returns counts and sizes by artifact type. Reads catalog if available
 * (fast); falls back to fresh filesystem scan if catalog absent.
 *
 * Read-only. No filesystem writes.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { findWorkspaceRoot } from "../lib/workspace";
import { readCatalog, scanFresh, type CatalogEntry } from "../lib/catalog";

export interface WorkspaceStats {
  fileCount: number;
  directoryCount: number;
  symlinkCount: number;
  byType: { file: number; directory: number; symlink: number };
  totalSize: number;
  catalogIndexedAt?: string;
  catalogStale?: boolean;
  scannedDirect: boolean;
}

interface StatsOptions {
  target?: string;
}

async function gatherEntries(target: string): Promise<{ entries: CatalogEntry[]; fromCatalog: boolean; stale?: boolean; indexedAt?: string }> {
  const root = await findWorkspaceRoot(target);
  if (root) {
    const catalog = await readCatalog(root);
    if (catalog) {
      return {
        entries: catalog.entries,
        fromCatalog: true,
        stale: catalog.stale,
        indexedAt: catalog.indexed_at,
      };
    }
  }
  const entries = await scanFresh(target);
  return { entries, fromCatalog: false };
}

export async function statsCommand(opts: StatsOptions = {}): Promise<WorkspaceStats> {
  const start = opts.target ? path.resolve(opts.target) : process.cwd();
  const { entries, fromCatalog, stale, indexedAt } = await gatherEntries(start);

  const byType = { file: 0, directory: 0, symlink: 0 };
  let totalSize = 0;
  for (const e of entries) {
    byType[e.type]++;
    if (e.type === "file") totalSize += e.size;
  }

  return {
    fileCount: byType.file,
    directoryCount: byType.directory,
    symlinkCount: byType.symlink,
    byType,
    totalSize,
    catalogIndexedAt: fromCatalog ? indexedAt : undefined,
    catalogStale: fromCatalog ? stale : undefined,
    scannedDirect: !fromCatalog,
  };
}
