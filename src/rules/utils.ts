import type { OpenApiDocument, OpenApiRecord } from "../types/openapi.js";

export const operationMethods = ["get", "post", "put", "patch", "delete"] as const;

export interface OperationEntry {
  pathName: string;
  method: string;
  operation: OpenApiRecord;
  operationPath: string;
}

export function isRecord(value: unknown): value is OpenApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getSecuritySchemes(document: OpenApiDocument): Record<string, unknown> {
  const components = isRecord(document.components) ? document.components : undefined;
  const securitySchemes = components?.securitySchemes;
  return isRecord(securitySchemes) ? securitySchemes : {};
}

export function getGnapSecuritySchemeNames(document: OpenApiDocument): Set<string> {
  const names = new Set<string>();

  for (const [name, scheme] of Object.entries(getSecuritySchemes(document))) {
    if (isRecord(scheme) && Object.hasOwn(scheme, "x-gnap")) {
      names.add(name);
    }
  }

  return names;
}

export function* getGnapSecuritySchemes(document: OpenApiDocument): Generator<{
  name: string;
  scheme: OpenApiRecord;
  gnap: unknown;
  path: string;
}> {
  for (const [name, scheme] of Object.entries(getSecuritySchemes(document))) {
    if (isRecord(scheme) && Object.hasOwn(scheme, "x-gnap")) {
      yield {
        name,
        scheme,
        gnap: scheme["x-gnap"],
        path: `components.securitySchemes.${name}.x-gnap`
      };
    }
  }
}

export function* getOperations(document: OpenApiDocument): Generator<OperationEntry> {
  if (!isRecord(document.paths)) {
    return;
  }

  for (const [pathName, pathItem] of Object.entries(document.paths)) {
    if (!isRecord(pathItem)) {
      continue;
    }

    for (const method of operationMethods) {
      const operation = pathItem[method];
      if (!isRecord(operation)) {
        continue;
      }

      yield {
        pathName,
        method,
        operation,
        operationPath: `paths.${pathName}.${method}`
      };
    }
  }
}

export function getOperationId(operation: OpenApiRecord): string {
  return typeof operation.operationId === "string" && operation.operationId.trim().length > 0
    ? operation.operationId
    : "unnamed operation";
}

export function operationUsesGnapSecurity(
  operation: OpenApiRecord,
  document: OpenApiDocument,
  gnapSecuritySchemeNames = getGnapSecuritySchemeNames(document)
): boolean {
  const security = Object.hasOwn(operation, "security") ? operation.security : document.security;

  if (!Array.isArray(security)) {
    return false;
  }

  return security.some((securityRequirement) => {
    if (!isRecord(securityRequirement)) {
      return false;
    }

    return Object.keys(securityRequirement).some((schemeName) =>
      gnapSecuritySchemeNames.has(schemeName)
    );
  });
}

export function getGnapAccess(operation: OpenApiRecord): unknown {
  return operation["x-gnap-access"];
}
