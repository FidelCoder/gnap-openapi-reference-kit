import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderJsonReport, renderTextReport, validateOpenApiFile } from "../src/index.js";

describe("validateOpenApiFile", () => {
  it("passes the main valid Open Payments example", async () => {
    const result = await validateOpenApiFile("examples/valid/openpayments-gnap.yaml");

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("fails invalid examples with actionable issue codes", async () => {
    const result = await validateOpenApiFile("examples/invalid/missing-access-metadata.yaml");

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_GNAP_ACCESS",
        path: "paths./outgoing-payments.post.x-gnap-access",
        severity: "error"
      })
    );
  });

  it("keeps warning-only results valid", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "gnap-openapi-"));
    const file = path.join(directory, "missing-proof.yaml");

    await writeFile(
      file,
      `
openapi: 3.1.0
info:
  title: Missing Proof Warning
  version: 0.1.0
components:
  securitySchemes:
    openPaymentsGNAP:
      type: http
      scheme: bearer
      x-gnap:
        grantEndpoint: https://auth.wallet.example
paths: {}
`
    );

    const result = await validateOpenApiFile(file);
    expect(result.valid).toBe(true);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "MISSING_GNAP_PROOF",
        severity: "warning"
      })
    );
  });

  it("renders text and JSON reports", async () => {
    const result = await validateOpenApiFile("examples/invalid/invalid-access-action.yaml");

    const text = renderTextReport(result);
    const json = JSON.parse(renderJsonReport(result));

    expect(text).toContain("[error] INVALID_GNAP_ACCESS_ACTION");
    expect(json.issues[0].code).toBe("INVALID_GNAP_ACCESS_ACTION");
  });
});
