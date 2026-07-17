#!/usr/bin/env node
/**
 * scripts/embed-assets.js — read all canonical assets (presets, schemas,
 * example modules, methodology documents) and inject them into
 * src/embedded-assets.ts at ncc-build time.
 *
 * The runtime file (src/embedded-assets.ts) is loaded eagerly from cli.ts via
 * `installEmbeddedAssets()`. This guarantees the globals are set before any
 * other code reads them, unlike top-level statements in cli.ts which ncc/webpack
 * wrap in IIFEs.
 *
 * Run before `ncc build`. Idempotent — re-running it is safe.
 *
 * Embedded at build time:
 *   - presets: { name: yaml-content }
 *   - schemas: { name: parsed-object }
 *   - examples: { name: { "module.yaml": yaml-content, "README.md": md-content } }
 *   - methodology: { "01-six-principles.md": markdown-content, ... }
 *
 * `methodology` is bootstrap payload — bundled into the binary so a
 * freshly-inited workspace can write out the methodology documents on
 * `init`. This solves the "dead link in bootstrap.md" gap: bootstrap.md
 * can reference `methodology/01-six-principles.md` and the visitor's
 * workspace will have that file physically present. See v0.8.7 audit.
 *
 * Invariant: src/embedded-assets.ts MUST contain the markers
 *   // __EMBEDDED_RUNTIME__
 *   // __EMBEDDED_RUNTIME_END__
 * on adjacent lines. If they are absent, this script exits non-zero so the
 * ncc build fails loudly. (Previously this script silently no-op'd when the
 * markers were missing — see .project-state/operatoros-micromissions-2026-07-10.)
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const target = path.join(root, "core", "src", "embedded-assets.ts");

// 1. Canonical presets — map { name: yaml-content }
const presets = {};
const presetsDir = path.join(root, "presets-canonical");
if (fs.existsSync(presetsDir)) {
  for (const name of fs.readdirSync(presetsDir)) {
    const file = path.join(presetsDir, name, "preset.yaml");
    if (fs.existsSync(file)) presets[name] = fs.readFileSync(file, "utf8");
  }
}

// 2. JSON Schemas — map { name: parsed-object }
const schemas = {};
const schemaNames = ["workspace", "module", "preset", "catalog"];
for (const name of schemaNames) {
  const file = path.join(root, "schemas", `${name}.schema.json`);
  if (fs.existsSync(file)) schemas[name] = JSON.parse(fs.readFileSync(file, "utf8"));
}

// 3. Example modules — map { name: { filename: content, ... } }
// Each example is a directory; we embed every regular file at its root
// (not recursive — examples are intentionally flat: module.yaml + README.md).
const examples = {};
const examplesDir = path.join(root, "examples");
if (fs.existsSync(examplesDir)) {
  for (const name of fs.readdirSync(examplesDir)) {
    const dir = path.join(examplesDir, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const files = {};
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isFile()) files[f] = fs.readFileSync(full, "utf8");
    }
    if (Object.keys(files).length > 0) examples[name] = files;
  }
}

// 4. Methodology documents — map { "NN-name.md": markdown-content, ... }
// Bundled as bootstrap payload so `init` can write them into the workspace.
// We exclude `v0.8.x-design/` subdirectory (design artifacts, not core
// methodology) and any `archive/` subdirectory (deprecated docs).
const methodology = {};
const methodologyDir = path.join(root, "methodology");
if (fs.existsSync(methodologyDir)) {
  // Top-level .md files only — methodology is intentionally flat: NN-name.md.
  for (const f of fs.readdirSync(methodologyDir)) {
    if (!f.endsWith(".md")) continue;
    const full = path.join(methodologyDir, f);
    if (fs.statSync(full).isFile()) methodology[f] = fs.readFileSync(full, "utf8");
  }
}

const replacement = `
  (globalThis as unknown as { __embeddedPresets: Record<string,string> }).__embeddedPresets = ${JSON.stringify(presets)};
  (globalThis as unknown as { __embeddedSchemas: Record<string,object> }).__embeddedSchemas = ${JSON.stringify(schemas)};
  (globalThis as unknown as { __embeddedExamples: Record<string,Record<string,string>> }).__embeddedExamples = ${JSON.stringify(examples)};
  (globalThis as unknown as { __embeddedMethodology: Record<string,string> }).__embeddedMethodology = ${JSON.stringify(methodology)};
`;

const body = fs.readFileSync(target, "utf8");
const markerOpen = "// __EMBEDDED_RUNTIME__";
const markerClose = "// __EMBEDDED_RUNTIME_END__";

if (!body.includes(markerOpen) || !body.includes(markerClose)) {
  console.error(
    `[embed-assets] FATAL: src/embedded-assets.ts is missing the runtime markers.\n` +
    `              Expected both: ${markerOpen}  and  ${markerClose}\n` +
    `              Restore them and re-run. (Do NOT hand-edit the body.)`
  );
  process.exit(1);
}

// Build the replacement body. Note: we strip each line first to avoid
// double-indenting from the template literal's own leading whitespace.
const indentedBody = replacement
  .trim()
  .split("\n")
  .map((line) => line.trim())
  .map((line, i) => (i === 0 ? line : `  ${line}`))
  .join("\n");

// Match exactly: `  ${markerOpen}` (preceded by anything) then any chars
// (non-greedy, including newlines) then `  ${markerClose}` on its own line
// (with leading 2-space indent). Tolerates empty body — `[\s\S]*?` allows
// 0 chars between. Skips the docstring occurrence of `${markerOpen}`
// because that occurrence is preceded by ` * \``, not by `  `.
//
// We use the FUNCTION form of `String.replace()` so `$&`, `$1`, etc. in
// the replacement string (which appear legitimately in JSON Schemas like
// `"$id": "..."`) are NOT treated as replacement patterns.
const re = new RegExp(`  ${markerOpen}[\\s\\S]*?  ${markerClose}`);
const replacementText = `  ${markerOpen}\n${indentedBody}\n  ${markerClose}`;
const updated = body.replace(re, () => replacementText);

// Idempotency check: if the replacement string equals the matched text
// byte-for-byte, `String.replace` will (correctly, per ECMAScript) skip
// substitution and return the original body unchanged. In that case the
// file is already up to date — this is the normal re-run case after the
// first successful inject.
if (updated === body) {
  console.log(
    `[embed-assets] no-op: src/embedded-assets.ts already has current ` +
      `preset+schema+example+methodology content (idempotent re-run).`
  );
  process.exit(0);
}

fs.writeFileSync(target, updated);
console.log(
  `[embed-assets] injected ${Object.keys(presets).length} presets + ` +
    `${Object.keys(schemas).length} schemas + ${Object.keys(examples).length} examples + ` +
    `${Object.keys(methodology).length} methodology docs ` +
    `into src/embedded-assets.ts`
);
