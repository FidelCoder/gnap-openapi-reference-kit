import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadOpenApi, validateOpenApiFile } from "../src/index.js";

describe("loadOpenApi", () => {
  it("loads a valid YAML OpenAPI file", async () => {
    const document = await loadOpenApi("examples/valid/openpayments-gnap.yaml");

    expect(document.openapi).toBe("3.1.0");
    expect(document.paths).toBeDefined();
  });

  it("loads a valid JSON OpenAPI file", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "gnap-openapi-"));
    const file = path.join(directory, "openapi.json");

    await writeFile(
      file,
      JSON.stringify({
        openapi: "3.1.0",
        info: { title: "JSON Example", version: "0.1.0" },
        components: {
          securitySchemes: {
            openPaymentsGNAP: {
              type: "http",
              scheme: "bearer",
              "x-gnap": {
                grantEndpoint: "https://auth.wallet.example",
                proof: { method: "httpsig" }
              }
            }
          }
        },
        paths: {}
      })
    );

    const document = await loadOpenApi(file);
    expect(document.openapi).toBe("3.1.0");
  });

  it("returns a useful validation result for a missing file", async () => {
    const result = await validateOpenApiFile("examples/valid/does-not-exist.yaml");

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "LOAD_OPENAPI_FAILED",
        severity: "error"
      })
    );
    expect(result.issues[0]?.message).toContain("OpenAPI file not found");
  });
});
