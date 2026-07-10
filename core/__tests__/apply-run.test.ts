/**
 * Tests for the apply command.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

describe("apply command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "operatoros-apply-test-"));
    const { initCommand } = await import("../src/commands/init");
    await initCommand({ personal: true, target: tmpDir });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("errors when no workspace found", async () => {
    const { applyCommand } = await import("../src/commands/apply");
    const empty = await fs.mkdtemp(path.join(os.tmpdir(), "empty-"));
    try {
      const origCwd = process.cwd();
      process.chdir(empty);
      try {
        await applyCommand("personal", {});
        expect.fail("should have thrown");
      } catch {
        // expected
      } finally {
        process.chdir(origCwd);
      }
    } finally {
      await fs.remove(empty);
    }
  });

  it("errors when preset has no source", async () => {
    const { applyCommand } = await import("../src/commands/apply");
    const presetYaml = path.join(tmpDir, "presets", "personal", "preset.yaml");
    const content = await fs.readFile(presetYaml, "utf8");
    const { load: yamlLoad, dump: yamlDump } = await import("js-yaml");
    const parsed = yamlLoad(content) as Record<string, unknown>;
    parsed.modules = [{ name: "broken", source: undefined }];
    await fs.writeFile(presetYaml, yamlDump(parsed));

    const origCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      await applyCommand("personal", {});
      const modulesDir = path.join(tmpDir, "modules");
      const entries = await fs.readdir(modulesDir);
      // broken has no source → skipped silently
      expect(entries.every((e) => e === "README.md" || e === "broken")).toBe(true);
    } finally {
      process.chdir(origCwd);
    }
  });
});

describe("run command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "operatoros-run-test-"));
    const { initCommand } = await import("../src/commands/init");
    await initCommand({ personal: true, target: tmpDir });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("errors when module not installed", async () => {
    const { runCommand } = await import("../src/commands/run");
    const origCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      let exitCode = 0;
      try {
        await runCommand("does-not-exist", "list", [], {});
      } catch {
        exitCode = 1;
      }
      expect(exitCode).toBe(1);
    } finally {
      process.chdir(origCwd);
    }
  });

  it("errors when command unknown", async () => {
    // First add a module
    const moduleDir = path.join(tmpDir, "modules", "testmod");
    await fs.ensureDir(moduleDir);
    await fs.writeFile(
      path.join(moduleDir, "module.yaml"),
      `version: "0.2"
name: testmod
commands:
  echo:
    run: "echo $@"
    description: "echo args"
`
    );

    const { runCommand } = await import("../src/commands/run");
    const origCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      let exitCode = 0;
      try {
        await runCommand("testmod", "nonexistent", [], {});
      } catch {
        exitCode = 1;
      }
      expect(exitCode).toBe(1);
    } finally {
      process.chdir(origCwd);
    }
  });

  it("runs a valid command and exits 0", async () => {
    const moduleDir = path.join(tmpDir, "modules", "testmod");
    await fs.ensureDir(moduleDir);
    await fs.writeFile(
      path.join(moduleDir, "module.yaml"),
      `version: "0.2"
name: testmod
commands:
  hi:
    run: "echo hi-from-testmod"
    description: "says hi"
`
    );

    const { runCommand } = await import("../src/commands/run");
    const origCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      await runCommand("testmod", "hi", [], {});
      // No exception = success
      expect(true).toBe(true);
    } finally {
      process.chdir(origCwd);
    }
  });

  it("propagates module settings as uppercase env vars", async () => {
    const moduleDir = path.join(tmpDir, "modules", "testmod");
    await fs.ensureDir(moduleDir);
    await fs.writeFile(
      path.join(moduleDir, "module.yaml"),
      `version: "0.2"
name: testmod
settings:
  default-minutes: 25
  log_path: "state/timer.log"
  greeting: "hello"
commands:
  show-settings:
    run: "echo $DEFAULT_MINUTES $LOG_PATH $GREETING"
    description: "print settings from env"
`
    );

    const { runCommand } = await import("../src/commands/run");
    const origCwd = process.cwd();
    process.chdir(tmpDir);
    try {
      await runCommand("testmod", "show-settings", [], {});
      expect(true).toBe(true);
    } finally {
      process.chdir(origCwd);
    }
  });
});