import { allowedProofMethods } from "../types/gnap-extension.js";
import { createError, createWarning, type ValidationIssue, type ValidationRule } from "../types/validation.js";
import { getGnapSecuritySchemes, isRecord } from "./utils.js";

export const validateProofMethod: ValidationRule = (context): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const allowed = new Set<string>(allowedProofMethods);

  for (const { name, gnap, path } of getGnapSecuritySchemes(context.document)) {
    if (!isRecord(gnap) || !Object.hasOwn(gnap, "proof")) {
      issues.push(
        createWarning({
          code: "MISSING_GNAP_PROOF",
          path: `${path}.proof`,
          message: `GNAP security scheme ${name} does not declare proof metadata.`,
          suggestion: "Add x-gnap.proof.method, for example: httpsig."
        })
      );
      continue;
    }

    const proof = gnap.proof;
    if (!isRecord(proof) || typeof proof.method !== "string" || proof.method.trim().length === 0) {
      issues.push(
        createWarning({
          code: "MISSING_GNAP_PROOF",
          path: `${path}.proof.method`,
          message: `GNAP security scheme ${name} does not declare x-gnap.proof.method.`,
          suggestion: `Use one of: ${allowedProofMethods.join(", ")}.`
        })
      );
      continue;
    }

    if (!allowed.has(proof.method)) {
      issues.push(
        createError({
          code: "INVALID_GNAP_PROOF_METHOD",
          path: `${path}.proof.method`,
          message: `GNAP security scheme ${name} uses unknown proof method "${proof.method}".`,
          suggestion: `Use one of: ${allowedProofMethods.join(", ")}.`
        })
      );
    }
  }

  return issues;
};
