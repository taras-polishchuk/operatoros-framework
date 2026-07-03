#!/usr/bin/env node
/**
 * scripts/embed-assets.js — read all canonical assets (presets, schemas) and
 * inject them into src/embedded-assets.ts at build time.
 *
 * The runtime file (src/embedded-assets.ts) is loaded eagerly from cli.ts via
 * `import { installEmbeddedAssets } from "./embedded-assets"; installEmbeddedAssets();`.
 * This guarantees the globals are set before any other code reads them, unlike
 * top-level statements in cli.ts which ncc/webpack wraps in IIFEs.
 *
 * Run before `ncc build`.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

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
const schemaNames = ["workspace", "module", "preset"];
for (const name of schemaNames) {
  const file = path.join(root, "schemas", `${name}.schema.json`);
  if (fs.existsSync(file)) schemas[name] = JSON.parse(fs.readFileSync(file, "utf8"));
}

const target = path.join(root, "core", "src", "embedded-assets.ts");
let body = fs.readFileSync(target, "utf8");

const replacement = `(globalThis as unknown as { __embeddedPresets: Record<string,string> }).__embeddedPresets = ${JSON.stringify(presets, null, 2)};
(globalThis as unknown as { __embeddedSchemas: Record<string,object> }).__embeddedSchemas = ${JSON.stringify(schemas, null, 2)};`;

body = body.replace(
  /\/\/ __EMBEDDED_RUNTIME__\n[\s\S]*?\/\/ __EMBEDDED_RUNTIME_END__/,
  replacement
);

fs.writeFileSync(target, body);
console.log(
  `injected ${Object.keys(presets).length} presets + ${Object.keys(schemas).length} schemas into src/embedded-assets.ts`
);