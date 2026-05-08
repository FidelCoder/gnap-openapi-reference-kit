#!/usr/bin/env node
import { Command } from "commander";
import { validateOpenApiFile } from "./index.js";
import { renderJsonReport } from "./reporter/json-reporter.js";
import { renderTextReport } from "./reporter/text-reporter.js";

const program = new Command();

program
  .name("gnap-openapi")
  .description("Validate experimental GNAP metadata in OpenAPI documents.")
  .version("0.1.0");

program
  .command("validate")
  .argument("<file>", "OpenAPI YAML or JSON file to validate")
  .option("--format <format>", "Output format: text or json", "text")
  .action(async (file: string, options: { format: string }) => {
    const format = options.format.toLowerCase();

    if (!["text", "json"].includes(format)) {
      process.stderr.write(`Unsupported format "${options.format}". Use "text" or "json".\n`);
      process.exitCode = 1;
      return;
    }

    const result = await validateOpenApiFile(file);
    const output = format === "json" ? renderJsonReport(result) : renderTextReport(result);
    process.stdout.write(output);

    if (!result.valid) {
      process.exitCode = 1;
    }
  });

await program.parseAsync(process.argv);
