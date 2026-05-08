import { loadOpenApi } from "./parser/load-openapi.js";
import { runRules } from "./rules/index.js";
import { createError, type ValidationResult } from "./types/validation.js";

export async function validateOpenApiFile(filePath: string): Promise<ValidationResult> {
  try {
    const document = await loadOpenApi(filePath);
    const issues = runRules({ file: filePath, document });

    return {
      file: filePath,
      valid: !issues.some((issue) => issue.severity === "error"),
      issues
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      file: filePath,
      valid: false,
      issues: [
        createError({
          code: "LOAD_OPENAPI_FAILED",
          path: "$",
          message,
          suggestion: "Check that the file exists, uses .yaml, .yml, or .json, and contains valid OpenAPI."
        })
      ]
    };
  }
}

export { loadOpenApi } from "./parser/load-openapi.js";
export { renderJsonReport } from "./reporter/json-reporter.js";
export { renderTextReport } from "./reporter/text-reporter.js";
export * from "./types/gnap-extension.js";
export * from "./types/openapi.js";
export * from "./types/validation.js";
