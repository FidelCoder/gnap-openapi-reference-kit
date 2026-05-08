import { describe, expect, it } from "vitest";
import { validateAccessActions } from "../../src/rules/index.js";
import type { ValidationContext } from "../../src/types/validation.js";

function context(actions: unknown[]): ValidationContext {
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
            "x-gnap-access": { type: "outgoing-payment", actions }
          }
        }
      }
    }
  };
}

describe("validateAccessActions", () => {
  it("errors for an unknown action", () => {
    const issues = validateAccessActions(context(["approve"]));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_GNAP_ACCESS_ACTION",
        path: "paths./payments.post.x-gnap-access.actions.0"
      })
    );
  });

  it("passes for allowed actions", () => {
    const issues = validateAccessActions(context(["create", "read", "list", "complete", "cancel"]));

    expect(issues).toEqual([]);
  });
});
