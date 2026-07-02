/**
 * operatoros install — install a module by registry name.
 *
 * Looks up <name> in the public registry, then delegates to `add` with the source.
 */
import { heading, ok, info, fail } from "../lib/print";
import { findModule, fetchRegistry } from "../lib/registry";
import { addCommand } from "./add";

interface InstallOptions {}

export async function installCommand(name: string | undefined, _opts: InstallOptions): Promise<void> {
  heading("OperatorOS install");

  if (!name) {
    fail(`usage: operatoros install <module-name>`);
    process.exit(1);
  }

  info("fetching registry...");
  let registry;
  try {
    registry = await fetchRegistry();
  } catch (e) {
    fail((e as Error).message);
    process.exit(1);
  }

  const mod = findModule(registry, name);
  if (!mod) {
    fail(`module "${name}" not found in registry`);
    info(`hint: operatoros search ${name}`);
    process.exit(1);
  }

  ok(`found: ${mod.name} ${mod.version}`);
  info(`description: ${mod.description}`);
  info(`source: ${mod.source}`);

  // Delegate to add (handles git/local + validate + register).
  await addCommand(mod.source, { name: mod.name });
}