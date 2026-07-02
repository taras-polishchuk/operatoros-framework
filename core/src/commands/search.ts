/**
 * operatoros search — search the public module registry.
 *
 * Usage: operatoros search [query]
 * If no query, lists all modules.
 */
import { heading, ok, info, fail } from "../lib/print";
import { fetchRegistry, searchRegistry } from "../lib/registry";

interface SearchOptions {}

export async function searchCommand(query: string | undefined, _opts: SearchOptions): Promise<void> {
  heading("OperatorOS search");

  info("fetching registry...");
  let registry;
  try {
    registry = await fetchRegistry();
  } catch (e) {
    fail((e as Error).message);
    info("tip: set OPERATOROS_REGISTRY_URL to a mirror if upstream is unavailable");
    process.exit(1);
  }

  const results = searchRegistry(registry, query ?? "");
  if (results.length === 0) {
    info(`no modules match "${query ?? ""}"`);
    info(`total modules in registry: ${registry.modules.length}`);
    return;
  }

  ok(`${results.length} match${results.length === 1 ? "" : "es"}`);
  console.log();
  for (const m of results) {
    console.log(`  ${m.name}  ${m.version}`);
    console.log(`    ${m.description}`);
    if (m.tags && m.tags.length > 0) {
      console.log(`    tags: ${m.tags.join(", ")}`);
    }
    console.log(`    source: ${m.source}`);
    console.log();
  }
  info(`install with: operatoros install <name>`);
}