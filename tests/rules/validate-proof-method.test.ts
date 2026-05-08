import { describe, expect, it } from "vitest";
import { validateProofMethod } from "../../src/rules/index.js";
import type { ValidationContext } from "../../src/types/validation.js";

function context(gnap: unknown): ValidationContext {
  return {
    file: "inline.yaml",
    document: {
      components: {
        securitySchemes: {
          openPaymentsGNAP: {
            type: "http",
            scheme: "bearer",
            "x-gnap": gnap
          }
        }
      }
    }
  };
}

describe("validateProofMethod", () => {
  it("warns when proof metadata is missing", () => {
    const issues = validateProofMethod(context({ grantEndpoint: "https://auth.wallet.example" }));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_GNAP_PROOF",
        severity: "warning"
      })
    );
  });

  it("errors when proof method is unknown", () => {
    const issues = validateProofMethod(
      context({
        grantEndpoint: "https://auth.wallet.example",
        proof: { method: "magic" }
      })
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_GNAP_PROOF_METHOD",
        severity: "error"
      })
    );
  });

  it("passes for allowed proof methods", () => {
    expect(
      validateProofMethod(
        context({
          grantEndpoint: "https://auth.wallet.example",
          proof: { method: "httpsig" }
        })
      )
    ).toEqual([]);
    expect(
      validateProofMethod(
        context({
          grantEndpoint: "https://auth.wallet.example",
          proof: { method: "jws" }
        })
      )
    ).toEqual([]);
    expect(
      validateProofMethod(
        context({
          grantEndpoint: "https://auth.wallet.example",
          proof: { method: "none" }
        })
      )
    ).toEqual([]);
  });
});
