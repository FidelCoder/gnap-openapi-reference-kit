import { allowedAccessActions } from "../types/gnap-extension.js";
import { createError, type ValidationIssue, type ValidationRule } from "../types/validation.js";
import {
  getGnapAccess,
  getGnapSecuritySchemeNames,
  getOperationId,
  getOperations,
  isRecord,
  operationUsesGnapSecurity
} from "./utils.js";

export const validateAccessActions: ValidationRule = (context): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const allowed = new Set<string>(allowedAccessActions);
  const gnapSchemeNames = getGnapSecuritySchemeNames(context.document);

  for (const entry of getOperations(context.document)) {
    if (!operationUsesGnapSecurity(entry.operation, context.document, gnapSchemeNames)) {
      continue;
    }

    const access = getGnapAccess(entry.operation);
    if (!isRecord(access) || !Array.isArray(access.actions) || access.actions.length === 0) {
      continue;
    }

    access.actions.forEach((action, index) => {
      if (typeof action !== "string" || !allowed.has(action)) {
        issues.push(
          createError({
            code: "INVALID_GNAP_ACCESS_ACTION",
            path: `${entry.operationPath}.x-gnap-access.actions.${index}`,
            message: `Operation ${getOperationId(entry.operation)} uses unknown GNAP access action "${String(action)}".`,
            suggestion: `Use one of: ${allowedAccessActions.join(", ")}.`
          })
        );
      }
    });
  }

  return issues;
};
