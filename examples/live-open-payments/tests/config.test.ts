import { describe, expect, it } from "vitest";
import {
  getRedactedConfig,
  loadLiveOpenPaymentsConfig,
  loadSingleAccountReadinessConfig
} from "../src/config.js";

function validEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    SENDER_WALLET_ADDRESS: "https://wallet.interledger-test.dev/alice",
    RECEIVER_WALLET_ADDRESS: "https://wallet.interledger-test.dev/bob",
    PRIVATE_KEY: "test-private-key",
    KEY_ID: "https://wallet.interledger-test.dev/alice/keys/1",
    PAYMENT_AMOUNT_VALUE: "100",
    PAYMENT_AMOUNT_ASSET_CODE: "USD",
    PAYMENT_AMOUNT_ASSET_SCALE: "2",
    OPEN_PAYMENTS_TESTNET_ONLY: "true",
    OPEN_BROWSER_ON_INTERACTION: "false",
    DRY_RUN: "false",
    LOG_LEVEL: "info",
    ...overrides
  };
}

describe("loadLiveOpenPaymentsConfig", () => {
  it("loads a valid testnet configuration", () => {
    const config = loadLiveOpenPaymentsConfig({
      env: validEnv(),
      loadDotenvFile: false
    });

    expect(config.senderWalletAddress).toBe("https://wallet.interledger-test.dev/alice");
    expect(config.amount).toEqual({
      value: "100",
      assetCode: "USD",
      assetScale: 2
    });
  });

  it("rejects missing required environment variables", () => {
    expect(() =>
      loadLiveOpenPaymentsConfig({
        env: {},
        loadDotenvFile: false
      })
    ).toThrow(/Missing required environment variable SENDER_WALLET_ADDRESS/);
  });

  it("rejects non-testnet wallet URLs by default", () => {
    expect(() =>
      loadLiveOpenPaymentsConfig({
        env: validEnv({
          SENDER_WALLET_ADDRESS: "https://wallet.example/alice"
        }),
        loadDotenvFile: false
      })
    ).toThrow(/testnet-only/);
  });

  it("allows non-testnet URLs only with an explicit override", () => {
    const config = loadLiveOpenPaymentsConfig({
      env: validEnv({
        SENDER_WALLET_ADDRESS: "https://wallet.example/alice",
        RECEIVER_WALLET_ADDRESS: "https://wallet.example/bob",
        KEY_ID: "https://wallet.example/alice/keys/1",
        ALLOW_NON_TESTNET_URLS: "true"
      }),
      loadDotenvFile: false
    });

    expect(config.safety.allowNonTestnetUrls).toBe(true);
  });

  it("requires the testnet-only safety flag", () => {
    expect(() =>
      loadLiveOpenPaymentsConfig({
        env: validEnv({ OPEN_PAYMENTS_TESTNET_ONLY: "false" }),
        loadDotenvFile: false
      })
    ).toThrow(/OPEN_PAYMENTS_TESTNET_ONLY must be true/);
  });

  it("redacts private key values when exposing config for logging", () => {
    const config = loadLiveOpenPaymentsConfig({
      env: validEnv({ PRIVATE_KEY: "super-secret-private-key" }),
      loadDotenvFile: false
    });

    expect(getRedactedConfig(config).privateKey).toBe("[REDACTED]");
  });
});

describe("loadSingleAccountReadinessConfig", () => {
  it("loads single-account config without requiring a receiver wallet", () => {
    const config = loadSingleAccountReadinessConfig({
      env: {
        TEST_WALLET_ADDRESS: "https://wallet.interledger-test.dev/alice",
        PRIVATE_KEY: "test-private-key",
        KEY_ID: "https://wallet.interledger-test.dev/alice/keys/1",
        OPEN_PAYMENTS_TESTNET_ONLY: "true"
      },
      loadDotenvFile: false
    });

    expect(config.testWalletAddress).toBe("https://wallet.interledger-test.dev/alice");
    expect(config.receiverWalletAddress).toBeUndefined();
  });

  it("ignores two-wallet values when TEST_WALLET_ADDRESS selects single-account mode", () => {
    const config = loadSingleAccountReadinessConfig({
      env: validEnv({
        TEST_WALLET_ADDRESS: "https://wallet.interledger-test.dev/test"
      }),
      loadDotenvFile: false
    });

    expect(config.testWalletAddress).toBe("https://wallet.interledger-test.dev/test");
    expect(config.senderWalletAddress).toBeUndefined();
    expect(config.receiverWalletAddress).toBeUndefined();
  });
});
