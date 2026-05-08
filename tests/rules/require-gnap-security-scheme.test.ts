import { describe, expect, it } from "vitest";
import { requireGnapSecurityScheme } from "../../src/rules/index.js";
import type { ValidationContext } from "../../src/types/validation.js";

function context(document: ValidationContext["document"]): ValidationContext {
  return { file: "inline.yaml", document };
}

describe("requireGnapSecurityScheme", () => {
  it("errors when no security scheme declares x-gnap", () => {
    const issues = requireGnapSecurityScheme(
      context({
        components: {
          securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer" }
          }
        }
      })
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_GNAP_SECURITY_SCHEME",
        severity: "error"
      })
    );
  });

  it("passes when a security scheme declares x-gnap", () => {
    const issues = requireGnapSecurityScheme(
      context({
        components: {
          securitySchemes: {
            openPaymentsGNAP: {
              type: "http",
              scheme: "bearer",
              "x-gnap": { grantEndpoint: "https://auth.wallet.example" }
            }
          }
        }
      })
    );

    expect(issues).toEqual([]);
  });
});
