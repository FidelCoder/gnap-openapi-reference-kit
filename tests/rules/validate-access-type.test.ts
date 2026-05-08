import { describe, expect, it } from "vitest";
import { validateAccessType } from "../../src/rules/index.js";
import type { ValidationContext } from "../../src/types/validation.js";

function context(type: string): ValidationContext {
  return {
    file: "inline.yaml",
    document: {
      components: {
        securitySchemes: {
          openPaymentsGNAP: {
            type: "http",
            scheme: "bearer",
            "x-gnap": { grantEndpoint: "https://auth.wallet.example" }
          }
        }
      },
      paths: {
        "/payments": {
          post: {
            operationId: "createPayment",
            security: [{ openPaymentsGNAP: [] }],
            "x-gnap-access": { type, actions: ["create"] }
          }
        }
      }
    }
  };
}

describe("validateAccessType", () => {
  it("errors for an unknown access type", () => {
    const issues = validateAccessType(context("payment"));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_GNAP_ACCESS_TYPE",
        severity: "error"
      })
    );
  });

  it("passes for allowed access types", () => {
    expect(validateAccessType(context("incoming-payment"))).toEqual([]);
    expect(validateAccessType(context("outgoing-payment"))).toEqual([]);
    expect(validateAccessType(context("quote"))).toEqual([]);
    expect(validateAccessType(context("wallet-address"))).toEqual([]);
  });
});
