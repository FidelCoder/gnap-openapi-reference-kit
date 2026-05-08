import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { redactSecret } from "./utils.js";

export type LiveLogLevel = "debug" | "info" | "warn" | "error";

export interface LiveOpenPaymentsConfig {
  senderWalletAddress: string;
  receiverWalletAddress: string;
  privateKey: string;
  keyId: string;
  amount: {
    value: string;
    assetCode: string;
    assetScale: number;
  };
  safety: {
    testnetOnly: boolean;
    allowNonTestnetUrls: boolean;
    dryRun: boolean;
    openBrowserOnInteraction: boolean;
  };
  logLevel: LiveLogLevel;
}

export interface LoadConfigOptions {
  env?: NodeJS.ProcessEnv;
  loadDotenvFile?: boolean;
}

const liveRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const liveEnvPath = resolve(liveRoot, ".env");

function readRequired(env: NodeJS.ProcessEnv, name: string, errors: string[]): string {
  const value = env[name]?.trim();
  if (!value) {
    errors.push(`Missing required environment variable ${name}.`);
    return "";
  }

  return value;
}

function parseBoolean(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function validateUrl(name: string, value: string, errors: string[]): void {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) {
      errors.push(`${name} must use http or https.`);
    }
  } catch {
    errors.push(`${name} must be a valid absolute URL.`);
  }
}

function validateTestnetUrl(name: string, value: string, allowNonTestnetUrls: boolean, errors: string[]): void {
  if (allowNonTestnetUrls || value.includes("interledger-test")) {
    return;
  }

  errors.push(
    `${name} must point at an Interledger testnet wallet URL containing "interledger-test". ` +
      "These v1 live examples are testnet-only. Set ALLOW_NON_TESTNET_URLS=true only for a controlled non-production sandbox."
  );
}

function validatePaymentAmount(
  value: string,
  assetCode: string,
  assetScaleText: string,
  errors: string[]
): number {
  if (!/^[1-9]\d*$/.test(value)) {
    errors.push("PAYMENT_AMOUNT_VALUE must be a positive integer string.");
  }

  if (!/^[A-Z][A-Z0-9]*$/.test(assetCode)) {
    errors.push("PAYMENT_AMOUNT_ASSET_CODE must be a non-empty uppercase string.");
  }

  if (!/^\d+$/.test(assetScaleText)) {
    errors.push("PAYMENT_AMOUNT_ASSET_SCALE must be a non-negative integer.");
    return 0;
  }

  return Number(assetScaleText);
}

export function loadLiveOpenPaymentsConfig(
  options: LoadConfigOptions = {}
): LiveOpenPaymentsConfig {
  if (options.loadDotenvFile !== false) {
    loadDotenv({ path: liveEnvPath, quiet: true });
  }

  const env = options.env ?? process.env;
  const errors: string[] = [];

  const senderWalletAddress = readRequired(env, "SENDER_WALLET_ADDRESS", errors);
  const receiverWalletAddress = readRequired(env, "RECEIVER_WALLET_ADDRESS", errors);
  const privateKey = readRequired(env, "PRIVATE_KEY", errors);
  const keyId = readRequired(env, "KEY_ID", errors);
  const value = readRequired(env, "PAYMENT_AMOUNT_VALUE", errors);
  const assetCode = readRequired(env, "PAYMENT_AMOUNT_ASSET_CODE", errors);
  const assetScaleText = readRequired(env, "PAYMENT_AMOUNT_ASSET_SCALE", errors);

  const testnetOnly = parseBoolean(env.OPEN_PAYMENTS_TESTNET_ONLY);
  const allowNonTestnetUrls = parseBoolean(env.ALLOW_NON_TESTNET_URLS);
  const dryRun = parseBoolean(env.DRY_RUN);
  const openBrowserOnInteraction = parseBoolean(env.OPEN_BROWSER_ON_INTERACTION);
  const logLevel = (env.LOG_LEVEL?.trim().toLowerCase() || "info") as LiveLogLevel;

  if (!testnetOnly) {
    errors.push(
      "OPEN_PAYMENTS_TESTNET_ONLY must be true. The live examples are testnet-only, play-money-only demos and must not be used for production funds."
    );
  }

  if (!["debug", "info", "warn", "error"].includes(logLevel)) {
    errors.push("LOG_LEVEL must be one of: debug, info, warn, error.");
  }

  if (senderWalletAddress) {
    validateUrl("SENDER_WALLET_ADDRESS", senderWalletAddress, errors);
    validateTestnetUrl("SENDER_WALLET_ADDRESS", senderWalletAddress, allowNonTestnetUrls, errors);
  }

  if (receiverWalletAddress) {
    validateUrl("RECEIVER_WALLET_ADDRESS", receiverWalletAddress, errors);
    validateTestnetUrl("RECEIVER_WALLET_ADDRESS", receiverWalletAddress, allowNonTestnetUrls, errors);
  }

  if (keyId) {
    validateUrl("KEY_ID", keyId, errors);
    validateTestnetUrl("KEY_ID", keyId, allowNonTestnetUrls, errors);
  }

  const assetScale = validatePaymentAmount(value, assetCode, assetScaleText, errors);

  if (errors.length > 0) {
    const redactedErrors = errors.map((error) => redactSecret(error, [privateKey]));
    throw new Error(`Invalid live Open Payments configuration:\n- ${redactedErrors.join("\n- ")}`);
  }

  return {
    senderWalletAddress,
    receiverWalletAddress,
    privateKey,
    keyId,
    amount: {
      value,
      assetCode,
      assetScale
    },
    safety: {
      testnetOnly,
      allowNonTestnetUrls,
      dryRun,
      openBrowserOnInteraction
    },
    logLevel
  };
}

export function getRedactedConfig(config: LiveOpenPaymentsConfig): Omit<LiveOpenPaymentsConfig, "privateKey"> & {
  privateKey: string;
} {
  return {
    ...config,
    privateKey: redactSecret(config.privateKey, [config.privateKey])
  };
}
