/**
 * commands.test.ts — OperatorOS v0.7.0 command surface (Workspace Catalog).
 *
 * Each test exercises ONE command end-to-end via the actual lib helpers
 * (no mocking of catalog lib — the lib is small and pure; tests use real fs).
 *
 * Commands under test:
 *   - index    : writes .operatoros/index.json
 *   - doctor   : reports workspace health
 *   - stats    : reports catalog statistics
 *   - stale    : lists orphan artifacts
 *   - prune    : two-phase delete (--dry-run then --confirm)
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

describe("OperatorOS v0.7.0 commands", () => {
  let tmpRoot: string;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "operatoros-cmd-"));
    await fs.ensureDir(path.join(tmpRoot, ".operatoros"));
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  // ─── index ──────────────────────────────────────────────────────────────
  describe("index command", () => {
    it("writes catalog with default excludes (node_modules, .git)", async () => {
      // seed: 1 root md, 1 node_modules dir, 1 .git dir
      await fs.writeFile(path.join(tmpRoot, "a.md"), "x");
      await fs.ensureDir(path.join(tmpRoot, "node_modules"));
      await fs.writeFile(path.join(tmpRoot, "node_modules", "ignore.js"), "y");
      await fs.ensureDir(path.join(tmpRoot, ".git"));
      await fs.writeFile(path.join(tmpRoot, ".git", "HEAD"), "z");

      const { indexCommand } = await import("../src/commands/index");
      await indexCommand({ target: tmpRoot });

      const catalog = JSON.parse(
        await fs.readFile(path.join(tmpRoot, ".operatoros", "index.json"), "utf8")
      );
      const paths = catalog.entries.map((e: any) => e.path);
      expect(paths).toContain("a.md");
      expect(paths.some((p: string) => p.includes("node_modules"))).toBe(false);
      expect(paths.some((p: string) => p.includes(".git"))).toBe(false);
    });
  });

  // ─── doctor ─────────────────────────────────────────────────────────────
  describe("doctor command", () => {
    it("reports findings for missing layout dirs (warning-level, not error)", async () => {
      // Use quoted "0.2" so YAML keeps it as string (matches init.ts output)
      await fs.writeFile(path.join(tmpRoot, "operatoros.yaml"), `version: "0.2"
name: test
`);
      await fs.ensureDir(path.join(tmpRoot, "modules"));
      await fs.ensureDir(path.join(tmpRoot, "presets"));
      await fs.ensureDir(path.join(tmpRoot, "state"));
      await fs.ensureDir(path.join(tmpRoot, "schemas"));
      await fs.ensureDir(path.join(tmpRoot, "vault"));

      const { doctorCommand } = await import("../src/commands/doctor");
      const result = await doctorCommand({ target: tmpRoot });
      // ok == no error-level findings
      expect(result.ok).toBe(true);
      // no error or warning findings; info-level "missing-catalog" is acceptable
      const warnings = result.findings.filter((f: any) => f.level === "warning" || f.level === "error");
      expect(warnings.length).toBe(0);
    });

    it("REPORTS missing operatoros.yaml", async () => {
      const { doctorCommand } = await import("../src/commands/doctor");
      const result = await doctorCommand({ target: tmpRoot });
      expect(result.ok).toBe(false);
      expect(result.findings.some((f: any) => f.code === "missing-manifest")).toBe(true);
    });

    it("REPORTS missing layout directories", async () => {
      await fs.writeFile(path.join(tmpRoot, "operatoros.yaml"), "version: 0.2\nname: test\n");
      // don't create modules/, presets/, etc.
      const { doctorCommand } = await import("../src/commands/doctor");
      const result = await doctorCommand({ target: tmpRoot });
      expect(result.ok).toBe(false);
      expect(result.findings.some((f: any) => f.code === "missing-layout")).toBe(true);
    });
  });

  // ─── stats ──────────────────────────────────────────────────────────────
  describe("stats command", () => {
    it("returns file count, total size, type breakdown", async () => {
      await fs.writeFile(path.join(tmpRoot, "a.md"), "hello");
      await fs.writeFile(path.join(tmpRoot, "b.md"), "world!");
      await fs.ensureDir(path.join(tmpRoot, "sub"));
      await fs.writeFile(path.join(tmpRoot, "sub", "c.txt"), "data");

      const { statsCommand } = await import("../src/commands/stats");
      const stats = await statsCommand({ target: tmpRoot });
      expect(stats.fileCount).toBeGreaterThanOrEqual(3);
      expect(stats.byType.file).toBeGreaterThanOrEqual(3);
      expect(stats.byType.directory).toBeGreaterThanOrEqual(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  // ─── stale ──────────────────────────────────────────────────────────────
  describe("stale command", () => {
    it("returns list shape (no crash, no required references)", async () => {
      await fs.writeFile(path.join(tmpRoot, "README.md"), "# Hello\n");
      await fs.ensureDir(path.join(tmpRoot, "docs"));
      await fs.writeFile(path.join(tmpRoot, "docs", "orphan.md"), "no one references me");
      await fs.writeFile(path.join(tmpRoot, "docs", "referenced.md"), "referenced by README inline");

      // Rewrite README to actually reference docs/referenced.md so the orphan detection
      // has a real signal to compare against.
      await fs.writeFile(
        path.join(tmpRoot, "README.md"),
        "# Hello\n\nSee [referenced](docs/referenced.md).\n"
      );

      const { staleCommand } = await import("../src/commands/stale");
      const orphans = await staleCommand({ target: tmpRoot });
      const orphanPaths = orphans.map((e: any) => e.path);
      expect(Array.isArray(orphanPaths)).toBe(true);
      // orphan.md should be listed (no other-workspaces reference)
      expect(orphanPaths).toContain("docs/orphan.md");
      // referenced.md should NOT be listed (README references it)
      expect(orphanPaths).not.toContain("docs/referenced.md");
    });
  });

  // ─── prune ──────────────────────────────────────────────────────────────
  describe("prune command", () => {
    it("dry-run does NOT delete files", async () => {
      await fs.writeFile(path.join(tmpRoot, "a.md"), "x");
      await fs.writeFile(path.join(tmpRoot, "b.md"), "y");
      const { pruneCommand } = await import("../src/commands/prune");
      const result = await pruneCommand({ target: tmpRoot, dryRun: true, confirm: false });
      // Dry-run reports planned deletions but doesn't execute them
      expect(result.planned.length).toBeGreaterThanOrEqual(0);
      // Both files must still exist after dry-run
      expect(await fs.pathExists(path.join(tmpRoot, "a.md"))).toBe(true);
      expect(await fs.pathExists(path.join(tmpRoot, "b.md"))).toBe(true);
    });

    it("confirm without targets is a no-op (refuses to delete all)", async () => {
      await fs.writeFile(path.join(tmpRoot, "a.md"), "x");
      const { pruneCommand } = await import("../src/commands/prune");
      // confirm without explicit list and no stale list = no-op (safety)
      const result = await pruneCommand({ target: tmpRoot, dryRun: false, confirm: true });
      expect(result.deleted.length).toBe(0);
      expect(await fs.pathExists(path.join(tmpRoot, "a.md"))).toBe(true);
    });
  });
});
