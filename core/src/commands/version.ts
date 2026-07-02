/**
 * operatoros version — print version + git info if available.
 */
import { execSync } from "child_process";
import { version as pkgVersion } from "../../package.json";
import { heading } from "../lib/print";

export function versionCommand(): void {
  heading("OperatorOS version");
  console.log(`  operatoros-core: ${pkgVersion}`);

  try {
    const sha = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    console.log(`  git: ${branch} @ ${sha}`);
  } catch {
    console.log(`  git: (not a git repo or git unavailable)`);
  }

  console.log(`  node: ${process.version}`);
  console.log(`  platform: ${process.platform}-${process.arch}`);
}