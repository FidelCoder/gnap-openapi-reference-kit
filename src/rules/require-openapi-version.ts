import { createError, createWarning, type ValidationIssue, type ValidationRule } from "../types/validation.js";

function parseVersion(version: string): { major: number; minor: number; patch: number } | undefined {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) {
    return undefined;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

export const requireOpenApiVersion: ValidationRule = (context): ValidationIssue[] => {
  const version = context.document.openapi;

  if (version === undefined || version === null || version === "") {
    return [
      createError({
        code: "MISSING_OPENAPI_VERSION",
        path: "openapi",
        message: "The document does not declare an OpenAPI version.",
        suggestion: "Add openapi: 3.1.0 or openapi: 3.2.0 at the document root."
      })
    ];
  }

  if (typeof version !== "string") {
    return [
      createWarning({
        code: "UNSUPPORTED_OPENAPI_VERSION",
        path: "openapi",
        message: "The OpenAPI version should be a string such as 3.1.0.",
        suggestion: "Use an OpenAPI 3.1.x or 3.2.x document for this reference kit."
      })
    ];
  }

  if (/^3\.(1|2)\.\d+(?:[-+].*)?$/.test(version)) {
    return [];
  }

  const parsed = parseVersion(version);
  const isBelow31 =
    parsed !== undefined && (parsed.major < 3 || (parsed.major === 3 && parsed.minor < 1));
  const message = isBelow31
    ? `OpenAPI ${version} is below 3.1.0, which limits newer JSON Schema and extension behavior.`
    : `OpenAPI ${version} is outside the v1 tested range for this reference kit.`;

  return [
    createWarning({
      code: "UNSUPPORTED_OPENAPI_VERSION",
      path: "openapi",
      message,
      suggestion: "Use OpenAPI 3.1.x or 3.2.x for GNAP/Open Payments examples."
    })
  ];
};
