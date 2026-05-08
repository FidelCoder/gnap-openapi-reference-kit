import { describe, expect, it } from "vitest";
import { requireOperationAccessMetadata } from "../../src/rules/index.js";
import type { ValidationContext } from "../../src/types/validation.js";

function baseOperation(operation: Record<string, unknown>): ValidationContext {
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
        "/outgoing-payments": {
          post: {
            operationId: "createOutgoingPayment",
            security: [{ openPaymentsGNAP: [] }],
            ...operation
          }
        }
      }
    }
  };
}

describe("requireOperationAccessMetadata", () => {
  it("requires x-gnap-access on GNAP-protected operations", () => {
    const issues = requireOperationAccessMetadata(baseOperation({}));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_GNAP_ACCESS",
        path: "paths./outgoing-payments.post.x-gnap-access"
      })
    );
  });

  it("requires access type", () => {
    const issues = requireOperationAccessMetadata(
      baseOperation({ "x-gnap-access": { actions: ["create"] } })
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_GNAP_ACCESS_TYPE"
      })
    );
  });

  it("requires a non-empty actions array", () => {
    const issues = requireOperationAccessMetadata(
      baseOperation({ "x-gnap-access": { type: "outgoing-payment", actions: [] } })
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_GNAP_ACCESS_ACTIONS"
      })
    );
  });
});
