import { describe, expect, it } from "vitest";
import {
  formatAmount,
  isProbablyTestnetWalletUrl,
  redactSecret
} from "../src/utils.js";

describe("live Open Payments utils", () => {
  it("redacts explicit private key values", () => {
    const result = redactSecret("PRIVATE_KEY=abc123 and abc123 again", ["abc123"]);

    expect(result).toBe("PRIVATE_KEY=[REDACTED] and [REDACTED] again");
  });

  it("redacts PEM private key blocks", () => {
    const result = redactSecret(`-----BEGIN PRIVATE KEY-----
abc123
-----END PRIVATE KEY-----`);

    expect(result).toBe("[REDACTED_PRIVATE_KEY]");
  });

  it("formats integer amounts using asset scale", () => {
    expect(formatAmount({ value: "100", assetCode: "USD", assetScale: 2 })).toBe("1.00 USD");
    expect(formatAmount({ value: "5", assetCode: "USD", assetScale: 2 })).toBe("0.05 USD");
    expect(formatAmount({ value: "7", assetCode: "JPY", assetScale: 0 })).toBe("7 JPY");
  });

  it("identifies Interledger testnet wallet URLs", () => {
    expect(isProbablyTestnetWalletUrl("https://wallet.interledger-test.dev/alice")).toBe(true);
    expect(isProbablyTestnetWalletUrl("https://wallet.example/alice")).toBe(false);
    expect(isProbablyTestnetWalletUrl("not a url")).toBe(false);
  });
});
