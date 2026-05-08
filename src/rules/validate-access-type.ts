import { allowedAccessTypes } from "../types/gnap-extension.js";
import { createError, type ValidationIssue, type ValidationRule } from "../types/validation.js";
import {
  getGnapAccess,
  getGnapSecuritySchemeNames,
  getOperationId,
  getOperations,
  isRecord,
  operationUsesGnapSecurity
} from "./utils.js";

export const validateAccessType: ValidationRule = (context): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const allowed = new Set<string>(allowedAccessTypes);
  const gnapSchemeNames = getGnapSecuritySchemeNames(context.document);

  for (const entry of getOperations(context.document)) {
    if (!operationUsesGnapSecurity(entry.operation, context.document, gnapSchemeNames)) {
      continue;
    }

    const access = getGnapAccess(entry.operation);
    if (!isRecord(access) || typeof access.type !== "string" || access.type.trim().length === 0) {
      continue;
    }

    if (!allowed.has(access.type)) {
      issues.push(
        createError({
          code: "INVALID_GNAP_ACCESS_TYPE",
          path: `${entry.operationPath}.x-gnap-access.type`,
          message: `Operation ${getOperationId(entry.operation)} uses unknown GNAP access type "${access.type}".`,
          suggestion: `Use one of: ${allowedAccessTypes.join(", ")}.`
        })
      );
    }
  }

  return issues;
};
