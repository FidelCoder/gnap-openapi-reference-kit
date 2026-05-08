import { describe, expect, it } from "vitest";
import { requireOpenApiVersion } from "../../src/rules/index.js";
import type { ValidationContext } from "../../src/types/validation.js";

function context(document: ValidationContext["document"]): ValidationContext {
  return { file: "inline.yaml", document };
}

describe("requireOpenApiVersion", () => {
  it("errors when openapi is missing", () => {
    const issues = requireOpenApiVersion(context({}));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_OPENAPI_VERSION",
        severity: "error",
        path: "openapi"
      })
    );
  });

  it("passes OpenAPI 3.1.x and 3.2.x", () => {
    expect(requireOpenApiVersion(context({ openapi: "3.1.0" }))).toEqual([]);
    expect(requireOpenApiVersion(context({ openapi: "3.2.1" }))).toEqual([]);
  });

  it("warns for OpenAPI below 3.1.0", () => {
    const issues = requireOpenApiVersion(context({ openapi: "3.0.3" }));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "UNSUPPORTED_OPENAPI_VERSION",
        severity: "warning"
      })
    );
  });
});
