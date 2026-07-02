#!/usr/bin/env node
/**
 * OperatorOS Core CLI — main entry point.
 *
 * Implements the OperatorOS framework spec defined in this repo's schemas/ directory.
 * CLI surface:
 *   operatoros init [--personal | --preset <name>] [--target <path>]
 *   operatoros validate <path>
 *   operatoros add <module-path-or-url>
 *   operatoros export --bundle tar.gz [--out <path>]
 *   operatoros version
 */
import { Command } from "commander";
import { initCommand } from "./commands/init";
import { validateCommand } from "./commands/validate";
import { addCommand } from "./commands/add";
import { exportCommand } from "./commands/export";
import { versionCommand } from "./commands/version";

const program = new Command();

program
  .name("operatoros")
  .description("OperatorOS Core — CLI runtime for personal operating systems")
  .version("0.2.0-alpha");

program
  .command("init")
  .description("Initialize a new OperatorOS workspace")
  .option("-p, --personal", "scaffold a personal workspace (default preset)")
  .option("--preset <name>", "use a specific preset (e.g., personal, team)")
  .option("-t, --target <path>", "target directory (default: current dir)")
  .option("-f, --force", "overwrite existing files")
  .action(initCommand);

program
  .command("validate <path>")
  .description("Validate a workspace/module/preset against its JSON-Schema")
  .option("--schema <name>", "schema name (workspace, module, preset)")
  .action(validateCommand);

program
  .command("add <source>")
  .description("Install a module from a local path or git URL")
  .option("-n, --name <name>", "override module name")
  .option("--pin <ref>", "git ref (branch/tag/sha) when source is a git URL")
  .action(addCommand);

program
  .command("export")
  .description("Export the current workspace")
  .option("-b, --bundle <format>", "bundle format (tar.gz, zip)", "tar.gz")
  .option("-o, --out <path>", "output file path")
  .option("--include-secrets", "include secret files (default: deny-list)")
  .action(exportCommand);

program
  .command("version")
  .description("Print OperatorOS Core version")
  .action(versionCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(`\n✗ ${err.message ?? err}`);
  process.exit(1);
});