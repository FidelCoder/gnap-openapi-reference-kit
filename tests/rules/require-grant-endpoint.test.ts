import { describe, expect, it } from "vitest";
import { requireGrantEndpoint } from "../../src/rules/index.js";
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

describe("requireGrantEndpoint", () => {
  it("errors when grantEndpoint is missing", () => {
    const issues = requireGrantEndpoint(context({}));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_GNAP_GRANT_ENDPOINT",
        path: "components.securitySchemes.openPaymentsGNAP.x-gnap.grantEndpoint"
      })
    );
  });

  it("errors when grantEndpoint is not a URL", () => {
    const issues = requireGrantEndpoint(context({ grantEndpoint: "not a url" }));

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_GNAP_GRANT_ENDPOINT"
      })
    );
  });

  it("passes with an absolute URL", () => {
    const issues = requireGrantEndpoint(context({ grantEndpoint: "https://auth.wallet.example" }));

    expect(issues).toEqual([]);
  });
});
