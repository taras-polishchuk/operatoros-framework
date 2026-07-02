/**
 * Workspace utilities — locate operatoros.yaml, resolve paths, manage state.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { load as yamlLoad } from "js-yaml";

export interface WorkspaceManifest {
  version: string;
  name: string;
  preset?: string;
  modules?: string[];
  created_at?: string;
  operatoros_version?: string;
}

export const WORKSPACE_FILENAME = "operatoros.yaml";

/**
 * Find operatoros.yaml by walking up from a starting directory.
 * Returns the workspace root or null.
 */
export async function findWorkspaceRoot(start: string = process.cwd()): Promise<string | null> {
  let dir = path.resolve(start);
  while (true) {
    const candidate = path.join(dir, WORKSPACE_FILENAME);
    if (await fs.pathExists(candidate)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Load and parse the workspace manifest.
 */
export async function loadWorkspace(root: string): Promise<WorkspaceManifest> {
  const file = path.join(root, WORKSPACE_FILENAME);
  if (!(await fs.pathExists(file))) {
    throw new Error(`workspace manifest not found at ${file}`);
  }
  const raw = await fs.readFile(file, "utf8");
  return yamlLoad(raw) as WorkspaceManifest;
}

/**
 * Standard workspace layout — folders + their purpose.
 */
export const WORKSPACE_LAYOUT = [
  "modules",
  "presets",
  "state",
  "schemas",
  "vault",
];

/**
 * Ensure the standard layout exists in the given root.
 */
export async function ensureLayout(root: string): Promise<string[]> {
  const created: string[] = [];
  for (const folder of WORKSPACE_LAYOUT) {
    const full = path.join(root, folder);
    if (!(await fs.pathExists(full))) {
      await fs.ensureDir(full);
      created.push(`${folder}/`);
    }
  }
  return created;
}