/**
 * Tests for `operatoros inspect` — v0.8.0 M1 Stream A.
 *
 * Per implementation plan §4.1:
 *   (1) Empty dir produces non-empty report (3 sections with "none found yet" markers)
 *   (2) On a workspace with `.operatoros/` + `bootstrap.md`, "AI view" section
 *       agrees with bootstrap.md
 *   (3) `--format=json` parses cleanly
 *   (4) "missing" section flags the absence of `bootstrap.md` and `IDENTITY.md` precisely
 *
 * Plus: the inspect command must NEVER write to the target directory
 * (Local-First + non-destructive invariant).
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

describe("inspect command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "operatoros-inspect-test-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("(1) empty directory produces a non-empty report with all 3 sections", async () => {
    const { inspectCommand } = await import("../src/commands/inspect");

    // Capture stdout so we can read it back.
    const original = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: any) => {
      captured += chunk.toString();
      return true;
    }) as any;

    try {
      const report = await inspectCommand({ target: tmpDir, format: "json" });
      const json = JSON.parse(captured);

      // Report has all 3 conceptual sections.
      expect(report.inventory).toBeDefined();
      expect(report.coldRead).toBeDefined();
      expect(report.gaps).toBeDefined();

      // Empty dir: totalEntries can be 0 or include tmpDir itself depending on
      // the scanner. What matters is the cold-read narrative + gaps.
      expect(json.coldRead).toContain("directory");
      // gaps should at least flag missing-manifest in an empty dir.
      const codes = report.gaps.map((g: any) => g.code);
      expect(codes).toContain("missing-manifest");
    } finally {
      process.stdout.write = original;
    }
  });

  it("(2) workspace with bootstrap.md produces a cold-read that mentions it", async () => {
    const { inspectCommand } = await import("../src/commands/inspect");

    // Scaffold a minimal workspace.
    await fs.writeFile(
      path.join(tmpDir, "operatoros.yaml"),
      'version: "0.2"\nname: fixture\npreset: personal\n'
    );
    await fs.writeFile(
      path.join(tmpDir, "bootstrap.md"),
      "# Always Read\n\nThis is the bootstrap tier.\n"
    );
    await fs.writeFile(path.join(tmpDir, "IDENTITY.md"), "# IDENTITY\n\nEngineer identity.\n");
    await fs.ensureDir(path.join(tmpDir, "modules"));
    await fs.ensureDir(path.join(tmpDir, "presets"));

    const original = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: any) => {
      captured += chunk.toString();
      return true;
    }) as any;

    try {
      const report = await inspectCommand({ target: tmpDir, format: "json" });
      const json = JSON.parse(captured);

      // Cold-read should mention bootstrap.md presence.
      expect(report.coldRead).toMatch(/bootstrap\.md/);
      expect(report.coldRead).toMatch(/IDENTITY\.md/);
      expect(report.coldRead).toMatch(/operatoros\.yaml/);

      // Gaps should NOT include missing-bootstrap / missing-identity / missing-manifest.
      const codes = report.gaps.map((g: any) => g.code);
      expect(codes).not.toContain("missing-manifest");
      expect(codes).not.toContain("missing-bootstrap");
      expect(codes).not.toContain("missing-identity");

      // Sanity: at least one missing-layout gap (vault/ and schemas/).
      expect(codes).toContain("missing-layout");
    } finally {
      process.stdout.write = original;
    }
  });

  it("(3) --format=json output parses as valid JSON with the expected schema", async () => {
    const { inspectCommand } = await import("../src/commands/inspect");
    await fs.writeFile(
      path.join(tmpDir, "operatoros.yaml"),
      'version: "0.2"\nname: jfixture\npreset: personal\n'
    );

    const original = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: any) => {
      captured += chunk.toString();
      return true;
    }) as any;

    try {
      const report = await inspectCommand({ target: tmpDir, format: "json" });

      // captured stdout must be parseable JSON.
      const parsed = JSON.parse(captured);

      // Schema-validate the returned object too.
      expect(parsed.format).toBe("json");
      expect(parsed.inventory.totalEntries).toBeGreaterThanOrEqual(0);
      expect(parsed.inventory.byType).toBeDefined();
      expect(parsed.coldRead).toBeDefined();
      expect(Array.isArray(parsed.gaps)).toBe(true);

      // Returned report mirrors stdout JSON.
      expect(report.format).toBe("json");
      expect(report.inventory.totalEntries).toBe(parsed.inventory.totalEntries);
    } finally {
      process.stdout.write = original;
    }
  });

  it("(4) missing-section flags absence of bootstrap.md and IDENTITY.md by exact filename", async () => {
    const { inspectCommand } = await import("../src/commands/inspect");
    // Only operatoros.yaml — no bootstrap.md, no IDENTITY.md.
    await fs.writeFile(
      path.join(tmpDir, "operatoros.yaml"),
      'version: "0.2"\nname: k\npreset: personal\n'
    );

    const original = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: any) => {
      captured += chunk.toString();
      return true;
    }) as any;

    try {
      const report = await inspectCommand({ target: tmpDir, format: "json" });
      const json = JSON.parse(captured);

      const codes = report.gaps.map((g: any) => g.code);
      const messages = report.gaps.map((g: any) => g.message);

      // Code-based assertions.
      expect(codes).toContain("missing-bootstrap");
      expect(codes).toContain("missing-identity");

      // Message-based: gap messages name the exact filenames AND
      // include the install command (UX fix 2026-07-17).
      const joined = messages.join(" ");
      expect(joined).toContain("bootstrap.md");
      expect(joined).toContain("IDENTITY.md");
      expect(joined).toContain("operatoros add");
    } finally {
      process.stdout.write = original;
    }
  });

  it("(--no-bootstrap flag) does NOT emit missing-bootstrap gap", async () => {
    const { inspectCommand } = await import("../src/commands/inspect");
    await fs.writeFile(
      path.join(tmpDir, "operatoros.yaml"),
      'version: "0.2"\nname: nb\npreset: personal\n'
    );

    const original = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: any) => {
      captured += chunk.toString();
      return true;
    }) as any;

    try {
      const report = await inspectCommand({
        target: tmpDir,
        format: "json",
        noBootstrap: true,
      });
      const codes = report.gaps.map((g: any) => g.code);
      expect(codes).not.toContain("missing-bootstrap");
      // Other gaps still present.
      expect(codes).toContain("missing-identity");
    } finally {
      process.stdout.write = original;
    }
  });

  it("(non-destructive) inspect never writes to the target directory", async () => {
    const { inspectCommand } = await import("../src/commands/inspect");
    await fs.writeFile(
      path.join(tmpDir, "operatoros.yaml"),
      'version: "0.2"\nname: nd\npreset: personal\n'
    );

    // Snapshot of files before inspect.
    const before = new Set(await fs.readdir(tmpDir));

    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = (() => true) as any;

    try {
      await inspectCommand({ target: tmpDir, format: "json" });
    } finally {
      process.stdout.write = original;
    }

    // Snapshot of files after inspect.
    const after = new Set(await fs.readdir(tmpDir));
    expect(after).toEqual(before);
  });
});