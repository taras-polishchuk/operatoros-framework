/**
 * OperatorOS registry — fetches and queries the public module registry.
 *
 * The registry is a single JSON file hosted in the OperatorOS repo:
 *   https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/registry/modules.json
 *
 * Can be overridden via OPERATOROS_REGISTRY_URL for testing.
 */
import * as https from "https";
import { URL } from "url";

export interface RegistryModule {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  source: string;
  tags?: string[];
}

export interface Registry {
  $schema?: string;
  version: string;
  updated?: string;
  modules: RegistryModule[];
}

const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/registry/modules.json";

function getRegistryUrl(): string {
  return process.env.OPERATOROS_REGISTRY_URL ?? DEFAULT_REGISTRY_URL;
}

/**
 * Fetch the registry. Returns parsed JSON. Throws on network or parse error.
 */
export async function fetchRegistry(url: string = getRegistryUrl()): Promise<Registry> {
  // Support file:// URLs for offline testing and local fixtures.
  if (url.startsWith("file://")) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.resolve(url.slice("file://".length));
    const body = await fs.readFile(filePath, "utf8");
    return JSON.parse(body) as Registry;
  }

  return new Promise((resolve, reject) => {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      reject(new Error(`unsupported registry protocol: ${u.protocol}`));
      return;
    }
    const lib = u.protocol === "https:" ? require("https") : require("http");
    const opts = {
      method: "GET",
      hostname: u.hostname,
      path: u.pathname + u.search,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      headers: { "User-Agent": "operatoros-core/0.4.0-alpha" },
    };

    const req = lib.request(opts, (res: import("http").IncomingMessage) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchRegistry(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`registry fetch returned HTTP ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => {
        try {
          const body = Buffer.concat(chunks).toString("utf8");
          const parsed = JSON.parse(body) as Registry;
          resolve(parsed);
        } catch (e) {
          reject(new Error(`registry parse failed: ${(e as Error).message}`));
        }
      });
    });

    req.on("error", (err: Error) => reject(new Error(`registry fetch failed: ${err.message}`)));
    req.setTimeout(15000, () => {
      req.destroy(new Error("registry fetch timeout"));
    });
    req.end();
  });
}

/**
 * Search the registry for modules matching a query.
 * Matches against name, description, and tags (case-insensitive substring).
 */
export function searchRegistry(registry: Registry, query: string): RegistryModule[] {
  const q = query.toLowerCase().trim();
  if (!q) return registry.modules;
  return registry.modules.filter((m) => {
    if (m.name.toLowerCase().includes(q)) return true;
    if (m.description.toLowerCase().includes(q)) return true;
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true;
    return false;
  });
}

/**
 * Look up a single module by name. Returns undefined if not found.
 */
export function findModule(registry: Registry, name: string): RegistryModule | undefined {
  return registry.modules.find((m) => m.name === name);
}