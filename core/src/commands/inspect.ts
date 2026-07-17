/**
 * operatoros inspect — Three-section workspace report.
 *
 * Per implementation plan §4.1 (v0.8.0 M1, Stream A):
 *   1. What's here (file inventory using catalog.ts)
 *   2. How an AI agent would describe it cold (cold-read narrative)
 *   3. What's structurally missing for full OperatorOS alignment (gap analysis)
 *
 * Behavior:
 *   - Pure read: never writes to the target directory.
 *   - No network calls (Local-First invariant).
 *   - Output formats: `md` (default), `json`, `terminal`.
 *   - `--no-bootstrap`: do not recommend or mention bootstrap.md; pure inventory.
 *
 * Edge cases handled:
 *   - Empty directory: all 3 sections produce "none found yet" markers.
 *   - `.operatoros/` exists: section 1 reads catalog for fast inventory.
 *   - Workspace without operatoros.yaml: still inspectable; flags absence in section 3.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { heading } from "../lib/print";
import { findWorkspaceRoot, loadWorkspace, WORKSPACE_LAYOUT } from "../lib/workspace";
import { readCatalog, scanFresh, CatalogEntry } from "../lib/catalog";

export type InspectFormat = "md" | "json" | "terminal";

export interface InspectOptions {
  target?: string;
  format?: InspectFormat;
  noBootstrap?: boolean;
}

export interface InspectReport {
  target: string;
  generatedAt: string;
  workspaceRoot: string | null;
  format: InspectFormat;
  inventory: {
    totalEntries: number;
    byType: Record<string, number>;
    catalogIndexedAt: string | null;
    catalogStale: boolean;
  };
  coldRead: string;
  gaps: GapFinding[];
}

export interface GapFinding {
  code: string;
  level: "error" | "warning" | "info";
  message: string;
}

/**
 * Compute by-type counts from a fresh scan.
 */
function tallyByType(entries: CatalogEntry[]): Record<string, number> {
  const tally: Record<string, number> = { file: 0, directory: 0, symlink: 0 };
  for (const e of entries) tally[e.type]++;
  return tally;
}

/**
 * Build the cold-read narrative (section 2) — describes the workspace as an
 * AI agent handed the directory with no prior knowledge would describe it.
 *
 * No file content is read; only paths, types, sizes. Output is intentionally
 * conservative — facts, not guesses.
 */
function buildColdRead(
  root: string,
  entries: CatalogEntry[],
  topLevelDirs: string[],
  manifestPresent: boolean,
  bootstrapPresent: boolean,
  identityPresent: boolean
): string {
  const lines: string[] = [];
  const fileCount = entries.filter((e) => e.type === "file").length;
  const dirCount = entries.filter((e) => e.type === "directory").length;
  const totalSize = entries
    .filter((e) => e.type === "file")
    .reduce((s, e) => s + e.size, 0);

  lines.push(`This directory contains ${fileCount} files across ${dirCount} subdirectories, occupying ${totalSize} bytes in total.`);
  lines.push("");

  if (topLevelDirs.length === 0) {
    lines.push("There are no top-level subdirectories; the workspace is flat.");
  } else {
    lines.push(`Top-level organization: ${topLevelDirs.join(", ")}.`);
    const sorted = [...topLevelDirs].sort();
    if (sorted.includes("modules") && sorted.includes("presets") && sorted.includes("schemas")) {
      lines.push("The presence of `modules/`, `presets/`, and `schemas/` suggests this is an OperatorOS-managed workspace.");
    } else if (sorted.includes("src") || sorted.includes("lib") || sorted.includes("tests") || sorted.includes("__tests__")) {
      lines.push("Source-tree organization (`src/`, `lib/`, `tests/`) suggests a software project rather than a personal OperatorOS workspace.");
    }
  }

  if (manifestPresent) {
    lines.push("An `operatoros.yaml` manifest is present at the workspace root — this directory is an initialized OperatorOS workspace.");
  } else {
    lines.push("No `operatoros.yaml` manifest found — this directory is not yet an OperatorOS workspace.");
  }

  if (bootstrapPresent) {
    lines.push("A `bootstrap.md` file is present, indicating a documented AI-onboarding tier.");
  } else {
    lines.push("No `bootstrap.md` — there is no AI-facing always-read tier.");
  }

  if (identityPresent) {
    lines.push("An `IDENTITY.md` file is present, indicating a documented engineer identity.");
  } else {
    lines.push("No `IDENTITY.md` — there is no canonical engineer identity document.");
  }

  return lines.join("\n");
}

/**
 * Compute gap findings (section 3) — what is structurally missing for full
 * OperatorOS alignment.
 */
function computeGaps(
  root: string,
  manifestPresent: boolean,
  bootstrapPresent: boolean,
  identityPresent: boolean,
  noBootstrap: boolean,
  catalogIndexedAt: string | null,
  catalogStale: boolean
): GapFinding[] {
  const gaps: GapFinding[] = [];

  if (!manifestPresent) {
    gaps.push({
      code: "missing-manifest",
      level: "error",
      message: "no operatoros.yaml at workspace root — run `operatoros init` to scaffold one",
    });
  }

  const layoutDirs = WORKSPACE_LAYOUT;
  // We can't enumerate from entries directly since `findWorkspaceRoot` only
  // confirms the root. Check each layout dir explicitly.
  for (const folder of layoutDirs) {
    const abs = path.join(root, folder);
    if (!require("fs-extra").pathExistsSync(abs)) {
      gaps.push({
        code: "missing-layout",
        level: "warning",
        message: `missing required layout directory: ${folder}/`,
      });
    }
  }

  if (!noBootstrap && !bootstrapPresent) {
    gaps.push({
      code: "missing-bootstrap",
      level: "warning",
      message: "no bootstrap.md at workspace root — install the `bootstrap-md` module to generate one",
    });
  }

  if (!identityPresent) {
    gaps.push({
      code: "missing-identity",
      level: "warning",
      message: "no IDENTITY.md at workspace root — install the `identity-md` module to scaffold one",
    });
  }

  if (!catalogIndexedAt) {
    gaps.push({
      code: "missing-catalog",
      level: "info",
      message: "no workspace catalog found — run `operatoros index` to create one",
    });
  } else if (catalogStale) {
    gaps.push({
      code: "stale-catalog",
      level: "warning",
      message: `workspace catalog is stale (indexed_at: ${catalogIndexedAt}) — run \`operatoros index\` to refresh`,
    });
  }

  return gaps;
}

/**
 * Render report as Markdown (default).
 */
function renderMarkdown(r: InspectReport): string {
  const lines: string[] = [];
  lines.push(`# OperatorOS Inspect — ${r.workspaceRoot ?? r.target}`);
  lines.push("");
  lines.push(`> Generated: ${r.generatedAt}`);
  lines.push("");
  lines.push("## 1. What's here");
  lines.push("");
  lines.push(`- Total entries: **${r.inventory.totalEntries}**`);
  for (const [k, v] of Object.entries(r.inventory.byType)) {
    lines.push(`- ${k}: ${v}`);
  }
  if (r.inventory.catalogIndexedAt) {
    lines.push(
      `- catalog indexed_at: ${r.inventory.catalogIndexedAt}${r.inventory.catalogStale ? " (stale)" : ""}`
    );
  } else {
    lines.push("- catalog: not yet built");
  }
  lines.push("");
  lines.push("## 2. How an AI agent would describe it cold");
  lines.push("");
  lines.push(r.coldRead);
  lines.push("");
  lines.push("## 3. What's structurally missing");
  lines.push("");
  if (r.gaps.length === 0) {
    lines.push("_No gaps detected. The workspace is fully aligned with OperatorOS._");
  } else {
    for (const g of r.gaps) {
      lines.push(`- **[${g.level.toUpperCase()}] ${g.code}** — ${g.message}`);
    }
  }
  return lines.join("\n");
}

/**
 * Render report as plain terminal output (human-readable, no markdown chars).
 */
function renderTerminal(r: InspectReport): string {
  const lines: string[] = [];
  lines.push(`OperatorOS Inspect — ${r.workspaceRoot ?? r.target}`);
  lines.push(`Generated: ${r.generatedAt}`);
  lines.push("");
  lines.push("1. What's here");
  lines.push(`   - Total entries: ${r.inventory.totalEntries}`);
  for (const [k, v] of Object.entries(r.inventory.byType)) {
    lines.push(`   - ${k}: ${v}`);
  }
  if (r.inventory.catalogIndexedAt) {
    lines.push(
      `   - catalog indexed_at: ${r.inventory.catalogIndexedAt}${r.inventory.catalogStale ? " (stale)" : ""}`
    );
  } else {
    lines.push("   - catalog: not yet built");
  }
  lines.push("");
  lines.push("2. How an AI agent would describe it cold");
  lines.push("");
  for (const ln of r.coldRead.split("\n")) lines.push(`   ${ln}`);
  lines.push("");
  lines.push("3. What's structurally missing");
  lines.push("");
  if (r.gaps.length === 0) {
    lines.push("   No gaps detected.");
  } else {
    for (const g of r.gaps) {
      lines.push(`   [${g.level.toUpperCase()}] ${g.code}: ${g.message}`);
    }
  }
  return lines.join("\n");
}

/**
 * Main entry point for the `operatoros inspect` command.
 */
export async function inspectCommand(opts: InspectOptions = {}): Promise<InspectReport> {
  const start = opts.target ? path.resolve(opts.target) : process.cwd();
  const root = (await findWorkspaceRoot(start)) ?? start;
  const format: InspectFormat = opts.format ?? "md";

  // Read catalog if present; otherwise do a fresh scan (no write).
  const catalog = await readCatalog(root);
  const entries: CatalogEntry[] = catalog ? catalog.entries : await scanFresh(root);

  const byType = tallyByType(entries);

  // Top-level directories (relative to root, no slash, sorted)
  const topLevelDirs = Array.from(
    new Set(
      entries
        .filter((e) => e.type === "directory")
        .map((e) => e.path.split("/")[0])
    )
  ).sort();

  // File presence flags
  const manifestPresent = entries.some(
    (e) => e.type === "file" && e.path === "operatoros.yaml"
  );
  const bootstrapPresent = entries.some(
    (e) => e.type === "file" && e.path === "bootstrap.md"
  );
  const identityPresent = entries.some(
    (e) => e.type === "file" && e.path === "IDENTITY.md"
  );

  const coldRead = buildColdRead(
    root,
    entries,
    topLevelDirs,
    manifestPresent,
    bootstrapPresent,
    identityPresent
  );
  const gaps = computeGaps(
    root,
    manifestPresent,
    bootstrapPresent,
    identityPresent,
    !!opts.noBootstrap,
    catalog ? catalog.indexed_at : null,
    catalog ? catalog.stale : false
  );

  const report: InspectReport = {
    target: start,
    workspaceRoot: (await findWorkspaceRoot(start)) ?? null,
    generatedAt: new Date().toISOString(),
    format,
    inventory: {
      totalEntries: entries.length,
      byType,
      catalogIndexedAt: catalog ? catalog.indexed_at : null,
      catalogStale: catalog ? catalog.stale : false,
    },
    coldRead,
    gaps,
  };

  if (format === "json") {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else if (format === "terminal") {
    process.stdout.write(renderTerminal(report) + "\n");
  } else {
    heading("OperatorOS inspect");
    process.stdout.write(renderMarkdown(report) + "\n");
  }

  return report;
}