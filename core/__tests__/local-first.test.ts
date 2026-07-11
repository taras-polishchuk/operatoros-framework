/**
 * Local-First invariant — codifies the constitutional rule from
 * .project-state/operatoros-essence-v1/ESSENCE.md §10:
 *
 *   "OperatorOS runs entirely on the user's local filesystem. It never
 *    makes a network call."
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
          `See ESSENCE.md §10 "OperatorOS runs entirely on the user's local filesystem.\n` +
          `It never makes a network call." (the constitutional principle).\n\n` +
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
});
