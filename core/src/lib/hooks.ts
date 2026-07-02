/**
 * Hooks system — runs user-defined shell commands at lifecycle events.
 *
 * Hooks are declared in operatoros.yaml under `settings.hooks`:
 *
 *   settings:
 *     hooks:
 *       pre-init:
 *         - "echo 'about to init'"
 *       post-apply:
 *         - "./scripts/notify-discord.sh"
 *         - "operatoros run notify send 'applied'"
 *       pre-export:
 *         - "./scripts/snapshot-state.sh"
 *       post-export:
 *         - "./scripts/upload.sh"
 *
 * Each hook is a shell command string. Failed hooks abort the operation
 * (configurable per-hook via `{ continueOnError: true }` in v0.5).
 */
import { spawn } from "child_process";
import * as path from "path";

export type HookEvent = "pre-init" | "post-init" | "pre-apply" | "post-apply" | "pre-export" | "post-export";

export type Hooks = Partial<Record<HookEvent, string[]>>;

/**
 * Run all hooks for an event. Returns when all complete.
 * Throws if any hook exits non-zero.
 */
export async function runHooks(
  event: HookEvent,
  hooks: Hooks | undefined,
  cwd: string
): Promise<void> {
  if (!hooks) return;
  const commands = hooks[event];
  if (!commands || commands.length === 0) return;

  for (const cmd of commands) {
    await runOne(cmd, event, cwd);
  }
}

function runOne(cmd: string, event: HookEvent, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      cwd,
      shell: true,
      stdio: "inherit",
      env: { ...process.env, OPERATOROS_HOOK_EVENT: event },
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`hook "${event}" failed (cmd: ${cmd}, exit ${code})`));
    });
    child.on("error", (err) => reject(err));
  });
}

/**
 * Extract hooks config from a manifest.
 */
export function extractHooks(manifest: { settings?: { hooks?: Hooks } } | undefined): Hooks | undefined {
  return manifest?.settings?.hooks;
}

/**
 * Re-export for convenience — path of workspace root for spawn.
 */
export const hookCwd = (root: string): string => path.resolve(root);