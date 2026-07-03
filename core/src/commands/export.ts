/**
 * operatoros export — pack workspace into a portable bundle.
 *
 * Default: tar.gz, deny-list secrets.
 * Honors the workspace's export.deny patterns (if set in preset).
 */
import * as fs from "fs-extra";
import * as path from "path";
import { createWriteStream } from "fs";
import { createGzip } from "zlib";
import * as tar from "tar";
import { pipeline } from "stream/promises";
import { heading, ok, info, fail } from "../lib/print";
import { findWorkspaceRoot, loadWorkspace } from "../lib/workspace";
import { runHooks } from "../lib/hooks";

interface ExportOptions {
  bundle: string;
  out?: string;
  includeSecrets?: boolean;
}

const DEFAULT_DENY = [
  "vault/**",
  "**/.env",
  "**/.env.*",
  "**/*.sqlite",
  "**/*.sqlite-wal",
  "**/*.sqlite-shm",
  "**/id_rsa",
  "**/id_rsa.pub",
  "**/secrets.yaml",
];

function globToRegex(pattern: string): RegExp {
  // Convert glob to regex. Supports:
  //   **  → matches any chars including /
  //   *   → matches any chars except /
  //   ?   → matches single char except /
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "\x00DOUBLESTAR\x00")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]")
    .replace(/\x00DOUBLESTAR\x00/g, ".*");
  return new RegExp(`^${escaped}$`);
}

export async function exportCommand(opts: ExportOptions): Promise<void> {
  heading("OperatorOS export");

  const root = await findWorkspaceRoot();
  if (!root) {
    fail(`no workspace found`);
    process.exit(1);
  }
  info(`workspace: ${root}`);

  const manifest = await loadWorkspace(root);
  info(`workspace name: ${manifest.name}`);

  // Hooks: pre-export (these can snapshot state, run checks, etc.)
  const hooks = (manifest as { settings?: { hooks?: Record<string, string[]> } }).settings?.hooks;
  await runHooks("pre-export", hooks, root);

  // Build deny list
  const deny: string[] = [...DEFAULT_DENY];
  if (!opts.includeSecrets) {
    info(`secrets excluded (--include-secrets to override)`);
  } else {
    deny.length = 0; // include everything
    warn("INCLUDE_SECRETS: bundle will contain vault and .env files");
  }

  const denyRegexes = deny.map(globToRegex);

  // Output file
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultName = `${manifest.name}-${ts}.${opts.bundle}`;
  const outPath = path.resolve(opts.out ?? path.join(root, "..", defaultName));

  info(`bundle: ${outPath}`);

  // Walk workspace, filter entries
  const entries: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith(".")) continue;
      const full = path.join(dir, item.name);
      const rel = path.relative(root, full).split(path.sep).join("/");
      // Deny if path matches OR any parent directory matches a `**`-style deny.
      const isDenied = (p: string): boolean => {
        if (denyRegexes.some((re) => re.test(p) || re.test(`./${p}`))) return true;
        // Walk up — if any ancestor is fully denied (e.g. "vault/**"), this is denied too.
        const parts = p.split("/");
        for (let i = parts.length - 1; i > 0; i--) {
          const ancestor = parts.slice(0, i).join("/");
          if (denyRegexes.some((re) => re.test(ancestor + "/x") || re.test(`${ancestor}/**`))) {
            return true;
          }
        }
        return false;
      };
      if (isDenied(rel)) continue;
      entries.push(full);
      if (item.isDirectory()) await walk(full);
    }
  };
  await walk(root);
  info(`entries: ${entries.length} (after deny-list filter)`);

  // Pack
  await fs.ensureDir(path.dirname(outPath));

  if (opts.bundle === "tar.gz") {
    // Tar's recursive-directory behavior means passing a directory path
    // adds ALL its contents — defeating our deny-list filter.
    // Fix: pass only file entries (skip directories entirely so tar can't recurse).
    const filesToPack = entries.filter((e) => fs.statSync(e).isFile());
    const finalList = filesToPack.map((f) =>
      path.relative(root, f).split(path.sep).join("/")
    );

    await tar.create(
      {
        gzip: true,
        file: outPath,
        cwd: root,
        portable: true,
      },
      finalList
    );
  } else if (opts.bundle === "zip") {
    fail(`zip bundle not implemented — use --bundle tar.gz`);
    process.exit(1);
  } else {
    fail(`unknown bundle format: ${opts.bundle}`);
    process.exit(1);
  }

  const stat = await fs.stat(outPath);
  ok(`wrote ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`);

  // Hooks: post-export (these can upload, notify, etc.)
  await runHooks("post-export", hooks, root);
}

function warn(msg: string) {
  console.warn(`  ! ${msg}`);
}