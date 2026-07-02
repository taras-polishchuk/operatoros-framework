/**
 * Pretty-printed console output — minimal chalk usage.
 */
import chalk from "chalk";

export const ok = (msg: string) => console.log(`  ${chalk.green("✓")} ${msg}`);
export const info = (msg: string) => console.log(`  ${chalk.blue("i")} ${msg}`);
export const warn = (msg: string) => console.warn(`  ${chalk.yellow("!")} ${msg}`);
export const fail = (msg: string) => console.error(`  ${chalk.red("✗")} ${msg}`);
export const heading = (msg: string) => console.log(chalk.bold.cyan(`\n${msg}\n`));
export const dim = (msg: string) => console.log(`  ${chalk.dim(msg)}`);