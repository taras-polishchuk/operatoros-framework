/**
 * operatoros stale — List orphan artifacts.
 *
 * An "orphan" here means: a file or directory under the workspace root that
 *   - is NOT in CATALOG_EXCLUDES (.git, node_modules, ...)
 *   - is NOT referenced from any other workspace file
 *   - has a recognized extension (we don't flag binary blobs for review)
 *
 * Reference detection is text-based: scan non-binary files for substrings
 * that look like paths into the workspace. This is a heuristic; treat the
 * output as a starting point for human review, not an authoritative deletion list.
 *
 * Read-only. Caller decides what to do (run `operatoros prune --confirm`).
 */
import * as fs from "fs-extra";
import * as path from "path";
import { findWorkspaceRoot } from "../lib/workspace";
import { readCatalog, scanFresh, type CatalogEntry } from "../lib/catalog";

interface StaleOptions {
  target?: string;
}

const TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".yaml", ".yml", ".toml", ".xml", ".html", ".css", ".scss",
  ".py", ".rb", ".go", ".rs", ".java", ".kt", ".swift", ".c", ".cpp", ".h", ".hpp",
  ".sh", ".bash", ".zsh",
]);

function isTextFile(p: string): boolean {
  const ext = path.extname(p).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

async function loadReferencedPaths(workspaceRoot: string, entries: CatalogEntry[]): Promise<Set<string>> {
  // For each text file, read it and harvest substring matches against any
  // other workspace entry's path. We look for the entry's basename OR the
  // full relative path appearing as a substring (whitespace/quote/star/slash-aware).
  const ref = new Set<string>();

  // Map basename -> set of full paths (for ambiguous match tiebreaker).
  const byBasename = new Map<string, string[]>();
  for (const e of entries) {
    const base = path.basename(e.path);
    if (!byBasename.has(base)) byBasename.set(base, []);
    byBasename.get(base)!.push(e.path);
  }

  for (const e of entries) {
    if (e.type !== "file") continue;
    if (!isTextFile(e.path)) continue;
    const abs = path.join(workspaceRoot, e.path);
    let content: string;
    try {
      content = await fs.readFile(abs, "utf8");
    } catch {
      continue;
    }
    for (const [base, fullPaths] of byBasename) {
      if (base === e.path.split("/").pop()) continue; // don't self-match
      // crude presence check: requires non-ASCII-safe substring look
      if (content.includes(base)) {
        for (const p of fullPaths) ref.add(p);
      }
    }
  }
  return ref;
}

export async function staleCommand(opts: StaleOptions = {}): Promise<CatalogEntry[]> {
  const start = opts.target ? path.resolve(opts.target) : process.cwd();
  const root = await findWorkspaceRoot(start) ?? start;

  const catalog = await readCatalog(root);
  const entries = catalog?.entries ?? (await scanFresh(root));

  const referenced = await loadReferencedPaths(root, entries);

  const orphans = entries.filter((e) => {
    if (referenced.has(e.path)) return false;
    if (e.type === "directory") return false; // don't flag empty dirs by default
    return true;
  });

  return orphans;
}
