import { describe, expect, it } from "vitest";
import {
  assessKeyIdAgainstWallet,
  buildReadinessSummary,
  formatReadinessSummary,
  getSingleWalletAddress
} from "../src/diagnostics.js";

describe("single-account diagnostics", () => {
  it("selects TEST_WALLET_ADDRESS when present", () => {
    expect(
      getSingleWalletAddress({
        testWalletAddress: "https://wallet.interledger-test.dev/test",
        senderWalletAddress: "https://wallet.interledger-test.dev/sender"
      })
    ).toBe("https://wallet.interledger-test.dev/test");
  });

  it("falls back to SENDER_WALLET_ADDRESS", () => {
    expect(
      getSingleWalletAddress({
        senderWalletAddress: "https://wallet.interledger-test.dev/sender"
      })
    ).toBe("https://wallet.interledger-test.dev/sender");
  });

  it("fails clearly when both wallet addresses are missing", () => {
    expect(() => getSingleWalletAddress({})).toThrow(
      /TEST_WALLET_ADDRESS or SENDER_WALLET_ADDRESS is required/
    );
  });

  it("passes when KEY_ID appears under the wallet URL path", () => {
    const result = assessKeyIdAgainstWallet(
      "https://wallet.interledger-test.dev/alice/keys/1",
      "https://wallet.interledger-test.dev/alice"
    );

    expect(result.status).toBe("pass");
  });

  it("warns when KEY_ID shares host but not wallet path", () => {
    const result = assessKeyIdAgainstWallet(
      "https://wallet.interledger-test.dev/bob/keys/1",
      "https://wallet.interledger-test.dev/alice"
    );

    expect(result.status).toBe("warn");
  });

  it("fails when KEY_ID is unrelated to the wallet host", () => {
    const result = assessKeyIdAgainstWallet(
      "https://wallet.example/alice/keys/1",
      "https://wallet.interledger-test.dev/alice"
    );

    expect(result.status).toBe("fail");
  });

  it("marks full payment readiness failed when receiver wallet is missing", () => {
    const summary = buildReadinessSummary({
      walletAddress: "https://wallet.interledger-test.dev/alice",
      keyId: "https://wallet.interledger-test.dev/alice/keys/1",
      privateKey: "test-private-key",
      testnetOnly: true,
      senderWalletAddress: "https://wallet.interledger-test.dev/alice",
      walletMetadataReachable: true
    });

    expect(summary.fullPaymentReady.status).toBe("fail");
    expect(summary.fullPaymentReady.message).toMatch(/requires a separate verified receiver wallet/);
  });

  it("does not include the private key in formatted output", () => {
    const summary = buildReadinessSummary({
      walletAddress: "https://wallet.interledger-test.dev/alice",
      keyId: "https://wallet.interledger-test.dev/alice/keys/1",
      privateKey: "super-secret-private-key",
      testnetOnly: true,
      senderWalletAddress: "https://wallet.interledger-test.dev/alice",
      walletMetadataReachable: true
    });

    const output = formatReadinessSummary(summary, ["super-secret-private-key"]);

    expect(output).not.toContain("super-secret-private-key");
    expect(output).toContain("PRIVATE_KEY is configured");
  });
});
