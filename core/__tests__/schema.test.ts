/**
 * Tests for the JSON-Schema validator and glob-to-regex logic.
 */
import { describe, it, expect } from "vitest";

describe("globToRegex", () => {
  function globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "\x00DOUBLESTAR\x00")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, "[^/]")
      .replace(/\x00DOUBLESTAR\x00/g, ".*");
    return new RegExp("^" + escaped + "$");
  }

  it("matches simple paths with **", () => {
    const re = globToRegex("vault/**");
    expect(re.test("vault/secret.txt")).toBe(true);
    expect(re.test("vault/sub/deep.txt")).toBe(true);
    expect(re.test("vault/")).toBe(true);
  });

  it("matches with .sqlite extension anywhere", () => {
    const re = globToRegex("**/*.sqlite");
    expect(re.test("state/data.sqlite")).toBe(true);
    expect(re.test("a/b/c/data.sqlite")).toBe(true);
    expect(re.test("data.sqlite")).toBe(false); // requires at least one slash prefix
  });

  it("escapes regex metachars", () => {
    const re = globToRegex("**/.env");
    expect(re.test(".env")).toBe(false); // requires path prefix
    expect(re.test("modules/foo/.env")).toBe(true);
    expect(re.test("a.b.c/.env")).toBe(true);
  });
});

describe("validateYaml", () => {
  it("loads workspace schema", async () => {
    const { getValidator } = await import("../src/lib/schema");
    const validate = await getValidator("workspace");
    expect(validate).toBeDefined();
  });

  it("rejects invalid workspace", async () => {
    const { validateYaml } = await import("../src/lib/schema");
    const path = await import("path");
    const fs = await import("fs-extra");
    const tmp = path.join("/tmp", "test-invalid-ws-" + Date.now() + ".yaml");
    await fs.writeFile(tmp, "version: 'wrong'\nname: 'BAD NAME'");
    const result = await validateYaml(tmp, "workspace");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
    await fs.remove(tmp);
  });
});

describe("inferSchema", () => {
  it("infers workspace from operatoros.yaml", async () => {
    const { inferSchema } = await import("../src/lib/schema");
    expect(inferSchema("/foo/bar/operatoros.yaml")).toBe("workspace");
    expect(inferSchema("/foo/bar/workspace.yaml")).toBe("workspace");
  });

  it("infers module from module.yaml", async () => {
    const { inferSchema } = await import("../src/lib/schema");
    expect(inferSchema("/foo/bar/modules/journal/module.yaml")).toBe("module");
    expect(inferSchema("/foo/bar/module.yaml")).toBe("module");
  });

  it("infers preset from preset.yaml", async () => {
    const { inferSchema } = await import("../src/lib/schema");
    expect(inferSchema("/foo/bar/presets/personal/preset.yaml")).toBe("preset");
    expect(inferSchema("/foo/bar/preset.yaml")).toBe("preset");
  });
});