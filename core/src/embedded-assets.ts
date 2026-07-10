/**
 * Embedded assets runtime — installed by `scripts/embed-assets.js`.
 *
 * This module exists for one reason: in the ncc/webpack single-file binary
 * build, top-level statements in cli.ts get wrapped in IIFEs that execute
 * lazily on first import. By exposing a function called eagerly from cli.ts
 * (`installEmbeddedAssets()`), we guarantee the assignment runs before any
 * other code reads the globals.
 *
 * In dev mode (`tsc` + `node dist/cli.js`), this file compiles to a no-op.
 * Presets and schemas are read directly from disk via init.ts's filesystem
 * fallback. The `scripts/embed-assets.js` step (run before `ncc build`) is
 * what turns this no-op into the inlined literal — that script replaces
 * the function body below with the JSON-serialized presets/schemas map.
 */
export function installEmbeddedAssets(): void {
  // Dev-mode no-op. The ncc build replaces this body via
  // scripts/embed-assets.js with inlined preset YAML + schema JSON literals.
}