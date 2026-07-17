/**
 * operatoros run — execute a command from an installed module.
 *
 * Usage: operatoros run <module-name> <command> [args...]
 *
 * Reads <workspace>/modules/<module>/module.yaml and dispatches to
 * the named command's `run` field via child_process.spawn.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { spawn } from "child_process";
import { heading, ok, info, fail } from "../lib/print";
import { findWorkspaceRoot } from "../lib/workspace";
import { validateYaml } from "../lib/schema";

interface RunOptions {
  target?: string;
  [key: string]: unknown; // passThrough from Commander
}

export async function runCommand(
  moduleName: string | undefined,
  command: string | undefined,
  args: string[],
  opts: RunOptions
): Promise<void> {
  heading("OperatorOS run");

  if (!moduleName || !command) {
    fail(`usage: operatoros run <module> <command> [args...]`);
    info(`example: operatoros run bootstrap-md render --target .`);
    process.exit(1);
  }

  const root = await findWorkspaceRoot(opts.target);
  if (!root) {
    fail(`no workspace found (operatoros.yaml missing in current dir or parents${opts.target ? `: ${opts.target}` : ""})`);
    info(`hint: pass --target <path> or run inside an OperatorOS workspace`);
    process.exit(1);
  }
  info(`workspace: ${root}`);

  const moduleDir = path.join(root, "modules", moduleName);
  const moduleYaml = path.join(moduleDir, "module.yaml");
  if (!(await fs.pathExists(moduleYaml))) {
    fail(`module not installed: ${moduleName}`);
    info(`hint: operatoros add <path-to-source-with-${moduleName}-module.yaml>`);
    info(`hint: or: operatoros add /home/taras/projects/operatoros/modules/${moduleName}`);
    process.exit(1);
  }

  // Validate module
  const validation = await validateYaml(moduleYaml, "module");
  if (!validation.valid) {
    fail(`module.yaml invalid`);
    for (const err of validation.errors) console.error(`    ${err}`);
    process.exit(1);
  }

  // Load command
  const raw = await fs.readFile(moduleYaml, "utf8");
  const { load: yamlLoad } = await import("js-yaml");
  const mod = yamlLoad(raw) as {
    commands?: Record<string, { run: string; description?: string }>;
    settings?: Record<string, unknown>;
  };

  const cmd = mod.commands?.[command];
  if (!cmd) {
    fail(`unknown command "${command}" on module "${moduleName}"`);
    if (mod.commands) {
      info(`available commands: ${Object.keys(mod.commands).join(", ")}`);
    }
    process.exit(1);
  }

  info(`module: ${moduleName}`);
  info(`command: ${command} — ${cmd.description ?? "(no description)"}`);

  // Build command line: `run` template with positional args substituted.
  // Convention: $1, $2, ... $@ (all) — shell-like.
  let cmdLine = cmd.run;
  if (args.length > 0) {
    cmdLine = cmdLine.replace(/\$@/g, args.map(shellEscape).join(" "));
    for (let i = 0; i < args.length; i++) {
      cmdLine = cmdLine.replace(new RegExp(`\\$${i + 1}\\b`, "g"), shellEscape(args[i]));
    }
  }
  // Also append any trailing args that weren't substituted (e.g. when `run`
  // template doesn't reference $@ but the user passed args).
  const substituted = /\$[0-9@]/.test(cmd.run);
  if (!substituted && args.length > 0) {
    cmdLine = `${cmdLine} ${args.map(shellEscape).join(" ")}`;
  }
  info(`exec: ${cmdLine}`);

  // Build env: parent env + module settings (uppercased + SCREAMING_SNAKE).
  // Settings declared in module.yaml are injected as env vars so `run`
  // templates can reference them like shell vars (e.g. `$DEFAULT_MINUTES`).
  // Scalars only — non-scalar values (objects/arrays) are stringified via
  // JSON for transparency rather than silently dropped.
  // Plus auto-injected workspace context: WORKSPACE_ROOT and MODULE_DIR,
  // so module scripts can resolve relative paths without depending on
  // the cwd they happen to be spawned in.
  const baseEnv = { ...process.env };
  const moduleEnv: Record<string, string> = {};
  if (mod.settings && typeof mod.settings === "object") {
    for (const [k, v] of Object.entries(mod.settings)) {
      const envKey = k.replace(/[^A-Za-z0-9]+/g, "_").toUpperCase();
      if (envKey.length === 0) continue;
      moduleEnv[envKey] = typeof v === "string" ? v : JSON.stringify(v);
    }
  }
  moduleEnv.WORKSPACE_ROOT = root;
  moduleEnv.MODULE_DIR = moduleDir;

  // Spawn shell
  const child = spawn(cmdLine, {
    cwd: moduleDir,
    shell: true,
    stdio: "inherit",
    env: { ...baseEnv, ...moduleEnv },
  });

  return new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        ok(`completed`);
        resolve();
      } else {
        fail(`exit code ${code}`);
        reject(new Error(`module command exited with code ${code}`));
      }
    });
    child.on("error", (err) => {
      fail(`spawn failed: ${err.message}`);
      reject(err);
    });
  });
}

function shellEscape(s: string): string {
  // Conservative POSIX shell escaping.
  if (/^[a-zA-Z0-9_\-./:=]+$/.test(s)) return s;
  return `'${s.replace(/'/g, "'\\''")}'`;
}