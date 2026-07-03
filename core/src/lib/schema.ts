/**
 * JSON-Schema validator — wraps ajv with OperatorOS conventions.
 *
 * Schemas live in this repo's schemas/ directory as JSON Schema 2020-12.
 * Loaded on demand; cached in-memory for the duration of one CLI invocation.
 */
import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import * as fs from "fs-extra";
import * as path from "path";
import { load as yamlLoad } from "js-yaml";

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  // Allow our schemas to reference the meta-schema URL without resolving it.
  validateSchema: false,
});
addFormats(ajv);

// Resolve schemas directory robustly across:
// 1. Embedded in the ncc bundle (production): __embeddedSchemas global
// 2. Dev: walk-up from this file looking for a `schemas/workspace.schema.json`
function resolveSchemaDir(): string {
  // Embedded schemas available — return a synthetic path (must satisfy ajv)
  // by storing them on globalThis for getValidator to read.
  const embedded = (globalThis as { __embeddedSchemas?: Record<string, object> })
    .__embeddedSchemas;
  if (process.env.OPERATOROS_DEBUG) {
    process.stderr.write(
      `DEBUG resolveSchemaDir: __embeddedSchemas=${typeof embedded} keys=${
        embedded ? Object.keys(embedded).join(",") : "n/a"
      }\n`
    );
  }
  if (embedded && embedded.workspace) {
    (globalThis as { __embeddedSchemaCache?: Record<string, object> }).__embeddedSchemaCache =
      embedded;
    return "__EMBEDDED__";
  }
  // Allow override via env (useful for tests and non-standard layouts).
  if (process.env.OPERATOROS_SCHEMAS_DIR) {
    return process.env.OPERATOROS_SCHEMAS_DIR;
  }
  // Walk up from this file looking for a `schemas/workspace.schema.json`.
  const path = require("path");
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, "schemas", "workspace.schema.json");
    if (require("fs").existsSync(candidate)) {
      return path.join(dir, "schemas");
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback to the historical relative path (works in dev).
  return path.resolve(__dirname, "..", "..", "..", "schemas");
}

const SCHEMA_DIR = resolveSchemaDir();
const cache = new Map<string, ValidateFunction>();

/**
 * Load a named schema. Tries (in order):
 * 1. Embedded cache (ncc bundle)
 * 2. Filesystem path under SCHEMA_DIR
 */
export async function getValidator(name: string): Promise<ValidateFunction> {
  if (cache.has(name)) return cache.get(name)!;

  // 1. Embedded cache (ncc bundle)
  const embeddedCache = (globalThis as { __embeddedSchemaCache?: Record<string, object> })
    .__embeddedSchemaCache;
  if (embeddedCache && embeddedCache[name]) {
    const validate = ajv.compile(embeddedCache[name]);
    cache.set(name, validate);
    return validate;
  }

  // 2. Filesystem
  const file = path.join(SCHEMA_DIR, `${name}.schema.json`);
  if (!(await fs.pathExists(file))) {
    throw new Error(`schema not found: ${file}`);
  }
  const raw = await fs.readFile(file, "utf8");
  const schema = JSON.parse(raw);
  const validate = ajv.compile(schema);
  cache.set(name, validate);
  return validate;
}

/**
 * Validate a YAML file against a named schema.
 * Returns { valid: true } or { valid: false, errors: [...] }.
 */
export async function validateYaml(
  filePath: string,
  schemaName: string
): Promise<{ valid: true } | { valid: false; errors: string[]; schema: string }> {
  const validate = await getValidator(schemaName);
  const raw = await fs.readFile(filePath, "utf8");
  const data = yamlLoad(raw);
  const valid = validate(data);
  if (valid) return { valid: true };
  const errors = (validate.errors ?? []).map(
    (e) => `${e.instancePath || "/"} ${e.message ?? ""}`.trim()
  );
  return { valid: false, errors, schema: schemaName };
}

/**
 * Infer the schema name from a file path.
 * /.../workspace.yaml → workspace
 * /.../modules/foo/module.yaml → module
 * /.../presets/bar/preset.yaml → preset
 */
export function inferSchema(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  if (/\/modules\/[^/]+\/module\.yaml$/.test(normalized) || normalized.endsWith("/module.yaml")) {
    return "module";
  }
  if (/\/presets\/[^/]+\/preset\.yaml$/.test(normalized) || normalized.endsWith("/preset.yaml")) {
    return "preset";
  }
  if (normalized.endsWith("operatoros.yaml") || normalized.endsWith("/workspace.yaml")) {
    return "workspace";
  }
  return "workspace";
}