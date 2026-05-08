import type { ValidationContext, ValidationIssue, ValidationRule } from "../types/validation.js";
import { requireGnapExtension } from "./require-gnap-extension.js";
import { requireGnapSecurityScheme } from "./require-gnap-security-scheme.js";
import { requireGrantEndpoint } from "./require-grant-endpoint.js";
import { requireOpenApiVersion } from "./require-openapi-version.js";
import { requireOperationAccessMetadata } from "./require-operation-access-metadata.js";
import { validateAccessActions } from "./validate-access-actions.js";
import { validateAccessType } from "./validate-access-type.js";
import { validateProofMethod } from "./validate-proof-method.js";

export const rules: ValidationRule[] = [
  requireOpenApiVersion,
  requireGnapSecurityScheme,
  requireGrantEndpoint,
  requireOperationAccessMetadata,
  validateAccessType,
  validateAccessActions,
  validateProofMethod
];

export function runRules(context: ValidationContext): ValidationIssue[] {
  return rules.flatMap((rule) => rule(context));
}

export {
  requireGnapExtension,
  requireGnapSecurityScheme,
  requireGrantEndpoint,
  requireOpenApiVersion,
  requireOperationAccessMetadata,
  validateAccessActions,
  validateAccessType,
  validateProofMethod
};
