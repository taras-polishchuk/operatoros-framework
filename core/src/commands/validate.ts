/**
 * operatoros validate — validate a YAML file against a JSON-Schema.
 */
import * as path from "path";
import * as fs from "fs-extra";
import { heading, ok, fail, dim } from "../lib/print";
import { validateYaml, inferSchema } from "../lib/schema";

interface ValidateOptions {
  schema?: string;
}

export async function validateCommand(target: string, opts: ValidateOptions): Promise<void> {
  heading("OperatorOS validate");

  const file = path.resolve(target);
  if (!(await fs.pathExists(file))) {
    fail(`file not found: ${file}`);
    process.exit(1);
  }

  const schemaName = opts.schema ?? inferSchema(file);
  dim(`schema: ${schemaName}`);

  const result = await validateYaml(file, schemaName);

  if (result.valid) {
    ok(`${file} — valid against "${schemaName}" schema`);
    return;
  }

  fail(`${file} — INVALID against "${schemaName}" schema`);
  for (const err of result.errors) {
    console.error(`    ${err}`);
  }
  process.exit(1);
}