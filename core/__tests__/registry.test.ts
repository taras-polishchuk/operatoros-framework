/**
 * Tests for the registry module (search, findModule).
 */
import { describe, it, expect, beforeEach } from "vitest";
import { fetchRegistry, searchRegistry, findModule } from "../src/lib/registry";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

const FIXTURE = {
  version: "0.2",
  updated: "2026-07-02",
  modules: [
    {
      name: "journal",
      version: "0.2.0",
      description: "Append-only timestamped journal entries",
      source: "./examples/journal",
      tags: ["journal", "notes", "starter"],
    },
    {
      name: "vault",
      version: "0.1.0",
      description: "Encrypted secrets storage",
      source: "https://example.com/vault",
      tags: ["secrets", "crypto"],
    },
    {
      name: "tmux-sessions",
      version: "0.1.0",
      description: "Declarative tmux session layouts",
      source: "https://example.com/tmux",
      tags: ["tmux", "dev"],
    },
  ],
};

describe("registry fixture helpers", () => {
  it("searchRegistry filters by name substring", () => {
    const r = searchRegistry(FIXTURE as never, "journal");
    expect(r.length).toBe(1);
    expect(r[0].name).toBe("journal");
  });

  it("searchRegistry filters by description substring (case-insensitive)", () => {
    const r = searchRegistry(FIXTURE as never, "ENCRYPTED");
    expect(r.length).toBe(1);
    expect(r[0].name).toBe("vault");
  });

  it("searchRegistry filters by tag", () => {
    const r = searchRegistry(FIXTURE as never, "starter");
    expect(r.length).toBe(1);
    expect(r[0].name).toBe("journal");
  });

  it("searchRegistry returns all modules when query is empty", () => {
    const r = searchRegistry(FIXTURE as never, "");
    expect(r.length).toBe(FIXTURE.modules.length);
  });

  it("searchRegistry returns empty array on no match", () => {
    const r = searchRegistry(FIXTURE as never, "nonexistent");
    expect(r.length).toBe(0);
  });

  it("findModule returns module by exact name", () => {
    const m = findModule(FIXTURE as never, "vault");
    expect(m?.version).toBe("0.1.0");
  });

  it("findModule returns undefined for unknown name", () => {
    const m = findModule(FIXTURE as never, "nope");
    expect(m).toBeUndefined();
  });
});

describe("fetchRegistry (file:// URL)", () => {
  let tmp: string;
  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "registry-test-"));
    await fs.writeFile(path.join(tmp, "reg.json"), JSON.stringify(FIXTURE));
  });

  it("reads registry from file:// URL", async () => {
    const r = await fetchRegistry(`file://${path.join(tmp, "reg.json")}`);
    expect(r.modules.length).toBe(3);
    expect(r.modules[0].name).toBe("journal");
  });
});