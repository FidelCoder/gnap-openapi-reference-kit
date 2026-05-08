import { createError, type ValidationIssue, type ValidationRule } from "../types/validation.js";
import { getGnapSecuritySchemes, isRecord } from "./utils.js";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const requireGrantEndpoint: ValidationRule = (context): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  for (const { name, gnap, path } of getGnapSecuritySchemes(context.document)) {
    if (!isRecord(gnap) || gnap.grantEndpoint === undefined) {
      issues.push(
        createError({
          code: "MISSING_GNAP_GRANT_ENDPOINT",
          path: `${path}.grantEndpoint`,
          message: `GNAP security scheme ${name} does not declare x-gnap.grantEndpoint.`,
          suggestion: "Add x-gnap.grantEndpoint, for example: https://auth.wallet.example."
        })
      );
      continue;
    }

    if (
      typeof gnap.grantEndpoint !== "string" ||
      gnap.grantEndpoint.trim().length === 0 ||
      !isValidUrl(gnap.grantEndpoint)
    ) {
      issues.push(
        createError({
          code: "INVALID_GNAP_GRANT_ENDPOINT",
          path: `${path}.grantEndpoint`,
          message: `GNAP security scheme ${name} has an invalid x-gnap.grantEndpoint.`,
          suggestion: "Use a non-empty absolute URL such as https://auth.wallet.example."
        })
      );
    }
  }

  return issues;
};
