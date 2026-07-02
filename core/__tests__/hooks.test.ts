/**
 * Tests for the hooks runner.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import { runHooks } from "../src/lib/hooks";

describe("hooks runner", () => {
  it("no-op when hooks is undefined", async () => {
    await runHooks("pre-init", undefined, "/tmp");
  });

  it("no-op when event has no commands", async () => {
    await runHooks("pre-init", { "post-apply": ["echo"] }, "/tmp");
  });

  it("runs command and succeeds", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "hook-test-"));
    const marker = path.join(tmp, "fired");
    await runHooks("post-init", { "post-init": [`touch ${marker}`] }, tmp);
    expect(await fs.pathExists(marker)).toBe(true);
    await fs.remove(tmp);
  });

  it("propagates non-zero exit code", async () => {
    let exitCaught = false;
    try {
      await runHooks("post-init", { "post-init": ["false"] }, "/tmp");
    } catch (e) {
      exitCaught = true;
      expect((e as Error).message).toMatch(/exit\s+1/);
    }
    expect(exitCaught).toBe(true);
  });

  it("runs multiple commands in order", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "hook-test-"));
    const a = path.join(tmp, "a");
    const b = path.join(tmp, "b");
    await runHooks("post-init", { "post-init": [`touch ${a}`, `touch ${b}`] }, tmp);
    expect(await fs.pathExists(a)).toBe(true);
    expect(await fs.pathExists(b)).toBe(true);
    await fs.remove(tmp);
  });

  it("sets OPERATOROS_HOOK_EVENT env var", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "hook-test-"));
    const log = path.join(tmp, "event.log");
    await runHooks("post-init", { "post-init": [`echo $OPERATOROS_HOOK_EVENT > ${log}`] }, tmp);
    const content = await fs.readFile(log, "utf8");
    expect(content.trim()).toBe("post-init");
    await fs.remove(tmp);
  });
});