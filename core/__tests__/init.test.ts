/**
 * Tests for workspace initialization — verify the init scaffold produces
 * a valid workspace that round-trips through validate.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

describe("init command scaffold", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "operatoros-init-test-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("creates the standard layout", async () => {
    const { initCommand } = await import("../src/commands/init");
    // commander passes options as first arg; we mock minimal shape
    await initCommand({ personal: true, target: tmpDir });
    const layout = ["modules", "presets", "state", "schemas", "vault"];
    for (const folder of layout) {
      expect(await fs.pathExists(path.join(tmpDir, folder))).toBe(true);
    }
  });

  it("writes a valid operatoros.yaml", async () => {
    const { initCommand } = await import("../src/commands/init");
    await initCommand({ personal: true, target: tmpDir });
    const yamlPath = path.join(tmpDir, "operatoros.yaml");
    expect(await fs.pathExists(yamlPath)).toBe(true);
    const content = await fs.readFile(yamlPath, "utf8");
    expect(content).toMatch(/version:\s*"0\.2"/);
    expect(content).toMatch(/preset:\s*personal/);
  });

  it("writes a valid preset.yaml", async () => {
    const { initCommand } = await import("../src/commands/init");
    await initCommand({ personal: true, target: tmpDir });
    const presetPath = path.join(tmpDir, "presets", "personal", "preset.yaml");
    expect(await fs.pathExists(presetPath)).toBe(true);
    const content = await fs.readFile(presetPath, "utf8");
    expect(content).toMatch(/name:\s*personal/);
    expect(content).toMatch(/deny:/);
  });

  it("round-trips through validate", async () => {
    const { initCommand } = await import("../src/commands/init");
    await initCommand({ personal: true, target: tmpDir });

    const { validateYaml } = await import("../src/lib/schema");
    const wsResult = await validateYaml(path.join(tmpDir, "operatoros.yaml"), "workspace");
    expect(wsResult.valid).toBe(true);

    const presetResult = await validateYaml(
      path.join(tmpDir, "presets", "personal", "preset.yaml"),
      "preset"
    );
    expect(presetResult.valid).toBe(true);
  });

  it("rejects --force=false when workspace exists", async () => {
    const { initCommand } = await import("../src/commands/init");
    await initCommand({ personal: true, target: tmpDir });
    await expect(
      initCommand({ personal: true, target: tmpDir, force: false })
    ).rejects.toBeDefined();
  });
});