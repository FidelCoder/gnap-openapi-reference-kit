import { redactSecret } from "./utils.js";

export type DiagnosticStatus = "pass" | "warn" | "fail";

export interface DiagnosticResult {
  status: DiagnosticStatus;
  label: string;
  message: string;
  suggestion?: string;
}

export interface ReadinessSummary {
  walletMetadataReachable?: DiagnosticResult;
  testnetSafety: DiagnosticResult;
  privateKeyPresent: DiagnosticResult;
  keyIdConfigured: DiagnosticResult;
  keyIdMatchesWallet: DiagnosticResult;
  senderWalletConfigured: DiagnosticResult;
  receiverWalletConfigured: DiagnosticResult;
  incomingPaymentReady: DiagnosticResult;
  fullPaymentReady: DiagnosticResult;
}

export interface ReadinessSummaryInput {
  walletAddress: string;
  keyId: string;
  privateKey: string;
  testnetOnly: boolean;
  senderWalletAddress?: string;
  receiverWalletAddress?: string;
  walletMetadataReachable?: boolean;
  walletMetadataError?: string;
}

export function getSingleWalletAddress(config: {
  testWalletAddress?: string;
  senderWalletAddress?: string;
}): string {
  const walletAddress = config.testWalletAddress ?? config.senderWalletAddress;

  if (!walletAddress) {
    throw new Error(
      "TEST_WALLET_ADDRESS or SENDER_WALLET_ADDRESS is required for the single-account readiness check."
    );
  }

  return walletAddress;
}

export function assessKeyIdAgainstWallet(
  keyId: string,
  walletAddress: string
): DiagnosticResult {
  if (!keyId.trim()) {
    return {
      status: "fail",
      label: "KEY_ID configured",
      message: "No KEY_ID was provided.",
      suggestion: "Set KEY_ID to the developer key URL from the Interledger Test Wallet."
    };
  }

  try {
    const keyUrl = new URL(keyId);
    const walletUrl = new URL(walletAddress);
    const walletPath = walletUrl.pathname.endsWith("/")
      ? walletUrl.pathname
      : `${walletUrl.pathname}/`;

    if (keyUrl.hostname !== walletUrl.hostname) {
      return {
        status: "fail",
        label: "KEY_ID matches wallet",
        message: "KEY_ID is on a different host than the wallet address.",
        suggestion: "Use a developer key generated for the same Interledger Test Wallet account."
      };
    }

    if (!keyUrl.pathname.startsWith(walletPath)) {
      return {
        status: "warn",
        label: "KEY_ID matches wallet",
        message: "KEY_ID uses the same host but does not appear under the wallet address path.",
        suggestion:
          "Confirm the developer key belongs to this wallet before running mutating live examples."
      };
    }

    return {
      status: "pass",
      label: "KEY_ID matches wallet",
      message: "KEY_ID appears to belong to the configured wallet address."
    };
  } catch {
    return {
      status: "fail",
      label: "KEY_ID matches wallet",
      message: "KEY_ID or wallet address is not a valid URL.",
      suggestion: "Use URL values such as https://wallet.interledger-test.dev/alice/keys/1."
    };
  }
}

function result(
  status: DiagnosticStatus,
  label: string,
  message: string,
  suggestion?: string
): DiagnosticResult {
  return { status, label, message, suggestion };
}

export function buildReadinessSummary(input: ReadinessSummaryInput): ReadinessSummary {
  const walletMetadataReachable =
    input.walletMetadataReachable === undefined
      ? result(
          "warn",
          "wallet metadata reachable",
          "Not checked in dry-run mode.",
          "Run with DRY_RUN=false to fetch wallet address metadata."
        )
      : input.walletMetadataReachable
        ? result("pass", "wallet metadata reachable", "Wallet metadata was fetched successfully.")
        : result(
            "fail",
            "wallet metadata reachable",
            input.walletMetadataError ?? "Wallet metadata could not be fetched.",
            "Check the wallet address and testnet network availability."
          );

  const testnetSafety = input.testnetOnly
    ? result("pass", "testnet safety enabled", "OPEN_PAYMENTS_TESTNET_ONLY is true.")
    : result(
        "fail",
        "testnet safety enabled",
        "OPEN_PAYMENTS_TESTNET_ONLY is not true.",
        "Set OPEN_PAYMENTS_TESTNET_ONLY=true before running live examples."
      );

  const privateKeyPresent = input.privateKey.trim()
    ? result("pass", "private key present", "PRIVATE_KEY is configured. The value is redacted.")
    : result(
        "fail",
        "private key present",
        "PRIVATE_KEY is missing.",
        "Add a developer private key or key file path from the Interledger Test Wallet."
      );

  const keyIdConfigured = input.keyId.trim()
    ? result("pass", "KEY_ID configured", "KEY_ID is configured.")
    : result(
        "fail",
        "KEY_ID configured",
        "KEY_ID is missing.",
        "Set KEY_ID to the developer key URL from the Interledger Test Wallet."
      );

  const keyIdMatchesWallet = assessKeyIdAgainstWallet(input.keyId, input.walletAddress);

  const senderWalletConfigured = input.senderWalletAddress
    ? result("pass", "sender wallet configured", "SENDER_WALLET_ADDRESS is configured.")
    : result(
        "fail",
        "sender wallet configured",
        "No sender wallet is configured for the full payment flow.",
        "Set SENDER_WALLET_ADDRESS before running pnpm live:send-testnet-payment."
      );

  const receiverWalletConfigured = input.receiverWalletAddress
    ? result("pass", "receiver wallet configured", "RECEIVER_WALLET_ADDRESS is configured.")
    : result(
        "fail",
        "receiver wallet configured",
        "No receiver wallet is configured.",
        "Create or use a second verified test wallet before running the full payment flow."
      );

  const incomingPaymentReady =
    testnetSafety.status === "pass" &&
    privateKeyPresent.status === "pass" &&
    keyIdConfigured.status === "pass" &&
    keyIdMatchesWallet.status !== "fail" &&
    walletMetadataReachable.status !== "fail"
      ? result(
          "pass",
          "ready for incoming-payment test",
          "Likely yes. Single-account setup is sufficient for wallet readiness and incoming-payment checks."
        )
      : result(
          "fail",
          "ready for incoming-payment test",
          "Not yet. Fix failed readiness checks before creating incoming payments."
        );

  const fullPaymentReady =
    senderWalletConfigured.status === "pass" &&
    receiverWalletConfigured.status === "pass" &&
    incomingPaymentReady.status === "pass"
      ? result("pass", "ready for full payment test", "Likely yes. Sender and receiver are configured.")
      : result(
          "fail",
          "ready for full payment test",
          "No. Full payment flow requires a separate verified receiver wallet.",
          "Set RECEIVER_WALLET_ADDRESS after the second test wallet account is verified."
        );

  return {
    walletMetadataReachable,
    testnetSafety,
    privateKeyPresent,
    keyIdConfigured,
    keyIdMatchesWallet,
    senderWalletConfigured,
    receiverWalletConfigured,
    incomingPaymentReady,
    fullPaymentReady
  };
}

function formatResult(resultToFormat: DiagnosticResult, secrets: string[]): string {
  const lines = [`[${resultToFormat.status}] ${resultToFormat.label}: ${resultToFormat.message}`];

  if (resultToFormat.suggestion) {
    lines.push(`  Suggestion: ${resultToFormat.suggestion}`);
  }

  return redactSecret(lines.join("\n"), secrets);
}

export function formatReadinessSummary(summary: ReadinessSummary, secrets: string[] = []): string {
  const results = [
    summary.walletMetadataReachable,
    summary.testnetSafety,
    summary.privateKeyPresent,
    summary.keyIdConfigured,
    summary.keyIdMatchesWallet,
    summary.senderWalletConfigured,
    summary.receiverWalletConfigured,
    summary.incomingPaymentReady,
    summary.fullPaymentReady
  ].filter((item): item is DiagnosticResult => item !== undefined);

  return ["Readiness Summary", ...results.map((item) => formatResult(item, secrets))].join("\n\n");
}
