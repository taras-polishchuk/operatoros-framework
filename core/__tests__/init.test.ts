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

  it("writes methodology/ with 7 embedded documents + README", async () => {
    const { initCommand } = await import("../src/commands/init");
    await initCommand({ personal: true, target: tmpDir });

    const methodologyDir = path.join(tmpDir, "methodology");
    expect(await fs.pathExists(methodologyDir)).toBe(true);
    expect(await fs.pathExists(path.join(methodologyDir, "README.md"))).toBe(true);

    // Per doc: must exist and be non-empty markdown
    const expected = [
      "01-six-principles.md",
      "02-doc-lifecycle.md",
      "03-token-economy.md",
      "04-agent-bootstrap.md",
      "05-onboarding-interview.md",
      "06-decisions-adr.md",
      "07-capability-selection.md",
    ];
    for (const name of expected) {
      const p = path.join(methodologyDir, name);
      expect(await fs.pathExists(p), `${name} should exist`).toBe(true);
      const content = await fs.readFile(p, "utf8");
      expect(content.length, `${name} should be non-empty`).toBeGreaterThan(100);
      expect(content.startsWith("#"), `${name} should start with markdown heading`).toBe(true);
    }

    // Verify a known marker survives round-trip (not blank-template)
    const principles = await fs.readFile(
      path.join(methodologyDir, "01-six-principles.md"),
      "utf8"
    );
    expect(principles).toMatch(/Single Authority/);
  });

  it("--force confirmation message references --force --yes (structural)", async () => {
    // The --force confirmation logic is in src/commands/init.ts. Verify
    // that the source code contains both the listing logic AND the
    // documented "--force --yes" recovery path. This is a structural
    // check that protects against refactor regressions where the
    // --force prompt is silently removed.
    const fsReal = await import("fs");
    const src = fsReal.readFileSync(
      "/home/taras/projects/operatoros/core/src/commands/init.ts",
      "utf8"
    );
    expect(src).toMatch(/collectExistingWorkspaceAssets/);
    expect(src).toMatch(/--force WILL OVERWRITE/);
    expect(src).toMatch(/--force --yes/);
  });

});