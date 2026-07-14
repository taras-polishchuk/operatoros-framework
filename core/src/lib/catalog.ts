/**
 * catalog.ts — Workspace Catalog library (v0.7.0 GATE: Workspace Catalog)
 *
 * Scope (per design brief §6, strict):
 *   - Reads workspace root filesystem
 *   - Writes .operatoros/index.json (single canonical location)
 *   - Catalog contains ONLY durable metadata: path/type/size/mtime/content_hash/indexed_at
 *   - NO background processes; NO filesystem watchers; NO usage telemetry
 *   - Catalog is refreshed by explicit `operatoros index` invocation only
 *
 * Out of scope (deliberate, per brief):
 *   - opened_count, last_access, file usage tracking
 *   - IDE plugin emission, hooks-driven auto-refresh
 *   - Background daemon
 *
 * Module is composed (Principle 4): catalog is composed of
 *   - scan()         : filesystem walker
 *   - buildCatalog() : scan + emit
 *   - readCatalog()  : consumer-side loader with staleness detection
 *   - isCatalogStale(): pure function over entries + filesystem (testable in isolation)
 *
 * Errors: this library throws on write failures and on malformed catalog JSON.
 * It does NOT throw on missing catalog — readCatalog returns null instead.
 */
import * as fs from "fs-extra";
import * as path from "path";
import * as crypto from "crypto";

export const CATALOG_DIR = ".operatoros";
export const CATALOG_FILE = "index.json";

/**
 * Catalog entry shape (mirrors schemas/catalog.schema.json).
 */
export interface CatalogEntry {
  path: string;
  type: "file" | "directory" | "symlink";
  size: number;
  mtime: string;
  content_hash: string;
  indexed_at: string;
}

/**
 * Top-level catalog shape.
 */
export interface Catalog {
  indexed_at: string;
  entries: CatalogEntry[];
}

/**
 * Read result. `stale` is set when at least one entry's mtime exceeds
 * the catalog's indexed_at — meaning someone modified the filesystem
 * without rebuilding the catalog.
 */
export interface CatalogReadResult {
  indexed_at: string;
  entries: CatalogEntry[];
  stale: boolean;
}

/**
 * Directories that must NEVER appear in catalog entries — denylist.
 * Mirrors `LOCAL_FIRST_EXCLUDES` in core/src/lib/export.ts and the workspace
 * tar deny-list pattern. Two locations of authority on disk, one logical rule.
 */
export const CATALOG_EXCLUDES = [
  ".git",
  "node_modules",
  "dist",
  "dist-bin",
  "build",
  ".svelte-kit",
  ".vite",
  ".cache",
  ".operatoros", // the catalog directory itself — never index self
];

/**
 * Compute SHA-256 hex digest of a file's contents. Returns "" for non-files.
 */
async function hashFile(absPath: string, type: CatalogEntry["type"]): Promise<string> {
  if (type !== "file") return "";
  const data = await fs.readFile(absPath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Recursive walker. Yields absolute paths of every entry under `root`,
 * respecting CATALOG_EXCLUDES.
 */
async function* walk(root: string): AsyncGenerator<string> {
  async function* recurse(dir: string): AsyncGenerator<string> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (CATALOG_EXCLUDES.includes(e.name)) continue;
      const abs = path.join(dir, e.name);
      yield abs;
      if (e.isDirectory()) {
        yield* recurse(abs);
      }
    }
  }
  yield* recurse(root);
}

/**
 * Build a single CatalogEntry from an absolute path. Pure-ish (filesystem IO only).
 */
async function buildEntry(abs: string, root: string, indexedAt: string): Promise<CatalogEntry> {
  const stat = await fs.lstat(abs);
  let type: CatalogEntry["type"] = "file";
  if (stat.isDirectory()) type = "directory";
  else if (stat.isSymbolicLink()) type = "symlink";
  // symlink targets: don't follow — content_hash is "". This matches schema's [""] allowance.
  const content_hash = await hashFile(abs, type);
  return {
    path: path.relative(root, abs),
    type,
    size: type === "directory" ? 0 : stat.size,
    mtime: stat.mtime.toISOString(),
    content_hash,
    indexed_at: indexedAt,
  };
}

/**
 * Build the catalog for `root`, writing to root/.operatoros/index.json.
 * Returns the absolute path of the written catalog.
 */
export async function buildCatalog(root: string): Promise<string> {
  const indexedAt = new Date().toISOString();
  const entries: CatalogEntry[] = [];
  for await (const abs of walk(root)) {
    entries.push(await buildEntry(abs, root, indexedAt));
  }
  // Sort entries by path for deterministic output (helps tests + git diff stability)
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const catalog: Catalog = { indexed_at: indexedAt, entries };
  const catalogPath = path.join(root, CATALOG_DIR, CATALOG_FILE);
  await fs.ensureDir(path.dirname(catalogPath));
  await fs.writeJson(catalogPath, catalog, { spaces: 2 });
  return catalogPath;
}

/**
 * Pure staleness check (testable in isolation). Compares catalog entries against
 * fresh filesystem scan. Stale = any path has different mtime/content_hash,
 * or any fresh path is missing from catalog, or any catalog path is gone.
 *
 * The catalog is the source of truth for what was scanned. `freshEntries` is
 * either provided explicitly (readCatalog reuses buildCatalog internally) or
 * computed via scanFresh (a public helper for tests and consumers).
 */
export function isCatalogStale(catalog: Catalog, freshEntries: CatalogEntry[]): boolean {
  const csByPath = new Map(catalog.entries.map((e) => [e.path, e]));
  const fsByPath = new Map(freshEntries.map((e) => [e.path, e]));

  // Catalog path no longer exists OR has changed
  for (const [p, ce] of csByPath) {
    const fe = fsByPath.get(p);
    if (!fe) return true;
    if (fe.mtime !== ce.mtime) return true;
    if (fe.content_hash !== ce.content_hash) return true;
    if (fe.size !== ce.size) return true;
  }
  // New path appeared since catalog was built
  for (const p of fsByPath.keys()) {
    if (!csByPath.has(p)) return true;
  }
  return false;
}

/**
 * Scan the workspace and return fresh entries WITHOUT writing the catalog.
 * Read-only; mirrors buildCatalog()'s walker minus the write step.
 */
export async function scanFresh(root: string): Promise<CatalogEntry[]> {
  const indexedAt = new Date().toISOString();
  const entries: CatalogEntry[] = [];
  for await (const abs of walk(root)) {
    entries.push(await buildEntry(abs, root, indexedAt));
  }
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return entries;
}

/**
 * Read the catalog at root/.operatoros/index.json. Returns null when missing.
 * When present, computes and reports staleness (via fresh filesystem scan).
 */
export async function readCatalog(root: string): Promise<CatalogReadResult | null> {
  const catalogPath = path.join(root, CATALOG_DIR, CATALOG_FILE);
  if (!(await fs.pathExists(catalogPath))) return null;
  const raw = await fs.readFile(catalogPath, "utf8");
  const catalog: Catalog = JSON.parse(raw);
  const fresh = await scanFresh(root);
  return {
    indexed_at: catalog.indexed_at,
    entries: catalog.entries,
    stale: isCatalogStale(catalog, fresh),
  };
}
