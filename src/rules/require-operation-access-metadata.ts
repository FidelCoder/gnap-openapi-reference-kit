import { createError, type ValidationIssue, type ValidationRule } from "../types/validation.js";
import {
  getGnapAccess,
  getGnapSecuritySchemeNames,
  getOperationId,
  getOperations,
  isRecord,
  operationUsesGnapSecurity
} from "./utils.js";

export const requireOperationAccessMetadata: ValidationRule = (context): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const gnapSchemeNames = getGnapSecuritySchemeNames(context.document);

  for (const entry of getOperations(context.document)) {
    if (!operationUsesGnapSecurity(entry.operation, context.document, gnapSchemeNames)) {
      continue;
    }

    const operationId = getOperationId(entry.operation);
    const access = getGnapAccess(entry.operation);
    const accessPath = `${entry.operationPath}.x-gnap-access`;

    if (!isRecord(access)) {
      issues.push(
        createError({
          code: "MISSING_GNAP_ACCESS",
          path: accessPath,
          message: `Operation ${operationId} uses GNAP security but does not declare x-gnap-access.`,
          suggestion:
            "Add x-gnap-access with type: outgoing-payment and actions: [create, read]."
        })
      );
      continue;
    }

    if (typeof access.type !== "string" || access.type.trim().length === 0) {
      issues.push(
        createError({
          code: "MISSING_GNAP_ACCESS_TYPE",
          path: `${accessPath}.type`,
          message: `Operation ${operationId} does not declare x-gnap-access.type.`,
          suggestion:
            "Set x-gnap-access.type to one of: incoming-payment, outgoing-payment, quote, wallet-address."
        })
      );
    }

    if (access.actions === undefined) {
      issues.push(
        createError({
          code: "MISSING_GNAP_ACCESS_ACTIONS",
          path: `${accessPath}.actions`,
          message: `Operation ${operationId} does not declare x-gnap-access.actions.`,
          suggestion: "Add a non-empty actions array, for example: actions: [create, read]."
        })
      );
      continue;
    }

    if (!Array.isArray(access.actions) || access.actions.length === 0) {
      issues.push(
        createError({
          code: "INVALID_GNAP_ACCESS_ACTIONS",
          path: `${accessPath}.actions`,
          message: `Operation ${operationId} must declare x-gnap-access.actions as a non-empty array.`,
          suggestion: "Use actions such as [create], [read], or [create, read]."
        })
      );
    }
  }

  return issues;
};
