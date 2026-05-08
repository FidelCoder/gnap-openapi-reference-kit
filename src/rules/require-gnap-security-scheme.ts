import { createError, type ValidationIssue, type ValidationRule } from "../types/validation.js";
import { getGnapSecuritySchemeNames } from "./utils.js";

export const requireGnapSecurityScheme: ValidationRule = (context): ValidationIssue[] => {
  const gnapSchemeNames = getGnapSecuritySchemeNames(context.document);

  if (gnapSchemeNames.size > 0) {
    return [];
  }

  return [
    createError({
      code: "MISSING_GNAP_SECURITY_SCHEME",
      path: "components.securitySchemes",
      message: "No OpenAPI security scheme declares x-gnap metadata.",
      suggestion:
        "Add components.securitySchemes.openPaymentsGNAP with type: http, scheme: bearer, and x-gnap metadata."
    })
  ];
};
