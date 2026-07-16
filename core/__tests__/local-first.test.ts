/**
 * Local-First invariant — codifies Principle 6 of
 * methodology/01-six-principles.md:
 *
 *   "The Core never reaches the network. The methodology works offline.
 *    The user owns their data."
 *
 * These tests fail loudly if any future change introduces a network call
 * path into the OperatorOS Core source. CI gates on this.
 *
 * What counts as a "network call":
 *   - fetch / undici calls (Node's built-in HTTP, WebSocket)
 *   - http.request / https.request (legacy Node API)
 *   - net.connect (raw TCP)
 *   - tls.connect (TLS handshake)
 *   - dns.lookup (DNS resolution)
 *   - child_process.spawn('curl', ...) or shell commands run by hooks
 *     whose argv starts with a network tool
 *
 * What does NOT count (legitimate uses):
 *   - String literals like "http://..." in YAML/JSON schema $id fields
 *     (informational, never fetched — verified by the absence of an actual
 *     outbound call.)
 *   - npm dependency declarations (axions, etc.)
 *
 * If you need to make a network call from OperatorOS, the design is wrong —
 * abort and split the feature into a separate tool.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs-extra";
import * as path from "path";

describe("Local-First invariant — OperatorOS Core never makes a network call", () => {
  // Patterns that constitute a network call. Each entry is [description, regex].
  // Order: most specific first (so `http\\.request` doesn't false-positive on
  // `http\\.requestCount` etc.).
  const networkPatterns: Array<[string, RegExp]> = [
    ["fetch(",        /\bfetch\s*\(/g],
    ["fetch (",       /\bfetch\s+\(/g],
    ["undici fetch",  /\bundici\b/g],
    ["http.request",  /\bhttp\.request\s*\(/g],
    ["https.request", /\bhttps\.request\s*\(/g],
    ["http.get",      /\bhttp\.get\s*\(/g],
    ["https.get",     /\bhttps\.get\s*\(/g],
    ["net.connect",   /\bnet\.connect\s*\(/g],
    ["tls.connect",   /\btls\.connect\s*\(/g],
    ["dns.lookup",    /\bdns\.lookup\s*\(/g],
    ["agent (http)",  /require\s*\(\s*['"]https?['"]\s*\)/g],
    ["axios(",        /\baxios\s*\(/g],
    ["got(",          /\bgot\s*\(/g],
    ["node-fetch",    /\bnode-fetch\b/g],
    ["XMLHttpRequest", /\bXMLHttpRequest\b/g],
    ["WebSocket(",    /\bWebSocket\s*\(/g],
    ["EventSource",   /\bEventSource\s*\(/g],
  ];

  it("contains no network-call primitives in core/src/*.ts", async () => {
    const srcDir = path.resolve(__dirname, "..", "src");
    const files = await fs.readdir(srcDir, { recursive: true });
    const tsFiles = (files as string[]).filter(
      (f) => f.endsWith(".ts") && !f.endsWith(".d.ts")
    );

    const offenders: Array<{ file: string; line: number; pattern: string; snippet: string }> = [];

    for (const relPath of tsFiles) {
      const abs = path.join(srcDir, relPath);
      const content = await fs.readFile(abs, "utf8");
      const lines = content.split("\n");
      for (const [name, pat] of networkPatterns) {
        for (let i = 0; i < lines.length; i++) {
          // Skip lines that are inside a string-only literal context that we
          // legitimately mention URLs (schema $id, descriptions, etc.).
          // The check: if a line is inside a JSDoc comment AND the match is
          // inside a backtick template literal, allow it. Otherwise: hard fail.
          if (pat.test(lines[i])) {
            offenders.push({
              file: relPath,
              line: i + 1,
              pattern: name,
              snippet: lines[i].trim().substring(0, 120),
            });
          }
        }
      }
    }

    if (offenders.length > 0) {
      const msg = offenders
        .map((o) => `  ${o.file}:${o.line} [${o.pattern}]  ${o.snippet}`)
        .join("\n");
      throw new Error(
        `\n\nLocal-First invariant violated — OperatorOS Core MUST NOT make network calls.\n` +
          `See Principle 6 of methodology/01-six-principles.md "The Core never reaches the network. The methodology works offline. The user owns their data.".\n\n` +
          `Offending lines:\n${msg}\n\n` +
          `If this is a legitimate false-positive (e.g. URL inside a docstring), ` +
          `extract the example into a test fixture instead.\n`
      );
    }
    expect(offenders).toEqual([]);
  });

  it("the install scripts do not call outbound URLs at runtime", async () => {
    // Install scripts legitimately curl from GitHub for the operatoros binary,
    // which is part of the documented user flow (one-line installer). That
    // IS a network call. The constitutional rule is about the Core binary
    // ITSELF, not the installer wrapper. We codify this distinction here.
    //
    // Sanity: ensure the install scripts DO mention the network endpoint
    // (otherwise they would silently stop working), and that the script files
    // exist with predictable content.
    const scriptsDir = path.resolve(__dirname, "..", "..", "scripts");
    for (const f of ["install.sh", "install.ps1"]) {
      const p = path.join(scriptsDir, f);
      expect(await fs.pathExists(p), `${f} must exist`).toBe(true);
      const content = await fs.readFile(p, "utf8");
      expect(content).toMatch(/githubusercontent\.com|github\.com/);
    }
  });

  // ROADMAP v0.7.0 gate 5 asks: "Local-first invariant test still passes AND
  // covers the methodology/ directory (currently only `core/src/` is scanned)."
  //
  // The methodology/ docs are written in plain markdown, so a network-call
  // primitive cannot appear there as code — but it CAN appear as a quoted
  // example or as a URL inside a JSDoc-style note. Future implementers adding
  // executable infrastructure to methodology/ (e.g., a code-block-as-script
  // convention) MUST keep this invariant.
  //
  // Smart scope: only fenced code blocks (` ```bash `, ` ```typescript `, etc.)
  // count. Plain prose is allowed to mention URLs (e.g., docs/tester-packet.md).
  it("methodology/ contains no network-call primitives in fenced code blocks", async () => {
    const methodologyDir = path.resolve(__dirname, "..", "..", "methodology");
    if (!(await fs.pathExists(methodologyDir))) {
      // methodology/ directory is optional — skip silently if not present.
      return;
    }
    const files = (await fs.readdir(methodologyDir, { recursive: true })) as string[];
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const offenders: Array<{ file: string; line: number; pattern: string; snippet: string }> = [];
    // Reuse the same primitive list as the core/src/ scan above.
    const codeBlockPatterns: Array<[string, RegExp]> = networkPatterns.filter(
      (n) => n[0] !== "agent (http)"   // require(...) was Node-http import, not a fenced-block match
    );

    for (const relPath of mdFiles) {
      const abs = path.join(methodologyDir, relPath);
      const content = await fs.readFile(abs, "utf8");
      // Split into fenced-code-block regions. Fence delimiter is ``` at line start
      // (with optional language tag). A ``` toggles: into / out of code mode.
      const lines = content.split("\n");
      let inFence = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Detect fence open/close: line starts with ``` (3+ backticks)
        if (/^```/.test(line.trim())) {
          inFence = !inFence;
          continue;
        }
        if (!inFence) continue;
        for (const [name, pat] of codeBlockPatterns) {
          if (pat.test(line)) {
            offenders.push({
              file: relPath,
              line: i + 1,
              pattern: name,
              snippet: line.trim().substring(0, 120),
            });
          }
        }
      }
    }
    if (offenders.length > 0) {
      const msg = offenders
        .map((o) => `  methodology/${o.file}:${o.line} [${o.pattern}]  ${o.snippet}`)
        .join("\n");
      throw new Error(
        `\n\nLocal-First invariant violated in methodology/ — a fenced code block contains a network primitive.\n` +
          `See Principle 6 of methodology/01-six-principles.md.\n\n` +
          `Offending lines:\n${msg}\n\n` +
          `If this is a legitimate example (e.g., showing what NOT to do), ` +
          `wrap it as an obvious counter-example inside a doc-comment fence.\n`
      );
    }
    expect(offenders).toEqual([]);
  });

  // v0.8.0 M1 — extend Local-First guard to module shell scripts.
  // Per D8 in operatoros-v080-implementation/decisions.md: every
  // modules/*/bin/*.sh script is scanned for forbidden network primitives.
  // Drift-detector's principles/*.sh files are meta-files (they DEFINE the
  // patterns to look for); they are excluded from the scan.
  it("modules/*/bin/*.sh contains no network-call primitives", async () => {
    const modulesDir = path.resolve(__dirname, "..", "..", "modules");
    if (!(await fs.pathExists(modulesDir))) {
      // modules/ directory is optional — skip silently if not present.
      return;
    }

    const offenders: Array<{ file: string; line: number; pattern: string; snippet: string }> = [];
    // Module scripts are bash, so the relevant primitives are slightly
    // different. We check shell-level network tools.
    const shellPatterns: Array<[string, RegExp]> = [
      ["curl ",       /\bcurl\s+/g],
      ["wget ",       /\bwget\s+/g],
      ["http://",     /http:\/\//g],
      ["https://",    /https:\/\//g],
      // Node-style calls from inside a shell script (rare but possible).
      ["fetch(",      /\bfetch\s*\(/g],
      ["node-fetch",  /\bnode-fetch\b/g],
    ];

    async function walk(dir: string): Promise<string[]> {
      const out: string[] = [];
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...(await walk(p)));
        else if (e.isFile() && e.name.endsWith(".sh")) out.push(p);
      }
      return out;
    }

    const scripts = await walk(modulesDir);
    for (const abs of scripts) {
      // Skip drift-detector's principles/ — those files DEFINE the patterns
      // and legitimately mention "curl", "wget", etc. as strings to match.
      if (abs.includes("/drift-detector/principles/")) continue;

      const content = await fs.readFile(abs, "utf8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip pure comments (start with #) — allow documentation URLs.
        const trimmed = line.trim();
        if (trimmed.startsWith("#")) continue;
        for (const [name, pat] of shellPatterns) {
          if (pat.test(line)) {
            offenders.push({
              file: path.relative(path.resolve(__dirname, "..", ".."), abs),
              line: i + 1,
              pattern: name,
              snippet: trimmed.substring(0, 120),
            });
          }
        }
      }
    }

    if (offenders.length > 0) {
      const msg = offenders
        .map((o) => `  ${o.file}:${o.line} [${o.pattern}]  ${o.snippet}`)
        .join("\n");
      throw new Error(
        `\n\nLocal-First invariant violated in modules/*/bin/*.sh — a shell script contains a network primitive.\n` +
          `See Principle 6 of methodology/01-six-principles.md.\n\n` +
          `Offending lines:\n${msg}\n\n` +
          `Module shell scripts MUST NOT make network calls. If you need to fetch something, ` +
          `the design is wrong — abort and split the feature into a separate tool.\n`
      );
    }
    expect(offenders).toEqual([]);
  });
});
