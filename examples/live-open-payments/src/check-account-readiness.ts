import { createUnauthenticatedClient, type WalletAddress } from "@interledger/open-payments";
import { loadSingleAccountReadinessConfig } from "./config.js";
import {
  buildReadinessSummary,
  formatReadinessSummary,
  getSingleWalletAddress
} from "./diagnostics.js";
import { createLiveLogger } from "./logger.js";

function printWalletMetadata(walletAddress: WalletAddress): void {
  process.stdout.write("\nWallet Metadata\n");
  process.stdout.write(`  id: ${walletAddress.id}\n`);
  process.stdout.write(`  publicName: ${walletAddress.publicName ?? "(not set)"}\n`);
  process.stdout.write(`  assetCode: ${walletAddress.assetCode}\n`);
  process.stdout.write(`  assetScale: ${walletAddress.assetScale}\n`);
  process.stdout.write(`  authServer: ${walletAddress.authServer}\n`);
  process.stdout.write(`  resourceServer: ${walletAddress.resourceServer}\n`);
}

async function main(): Promise<void> {
  const config = loadSingleAccountReadinessConfig();
  const walletAddress = getSingleWalletAddress(config);
  const logger = createLiveLogger({
    level: config.logLevel,
    secrets: [config.privateKey]
  });

  logger.section("Single-Account Open Payments Testnet Readiness");
  logger.warn("Testnet only. Play-money only. No production funds or real financial value.");
  logger.info("Wallet address under test", walletAddress);

  if (config.safety.dryRun) {
    logger.section("Dry Run");
    logger.info("No network calls will be made.");
    logger.info("Would fetch wallet metadata", walletAddress);

    const summary = buildReadinessSummary({
      walletAddress,
      keyId: config.keyId,
      privateKey: config.privateKey,
      testnetOnly: config.safety.testnetOnly,
      senderWalletAddress: config.senderWalletAddress,
      receiverWalletAddress: config.receiverWalletAddress
    });

    process.stdout.write(`\n${formatReadinessSummary(summary, [config.privateKey])}\n`);
    return;
  }

  const client = await createUnauthenticatedClient({
    logLevel: config.logLevel
  });

  try {
    const metadata = await client.walletAddress.get({ url: walletAddress });
    printWalletMetadata(metadata);

    const summary = buildReadinessSummary({
      walletAddress,
      keyId: config.keyId,
      privateKey: config.privateKey,
      testnetOnly: config.safety.testnetOnly,
      senderWalletAddress: config.senderWalletAddress,
      receiverWalletAddress: config.receiverWalletAddress,
      walletMetadataReachable: true
    });

    process.stdout.write(`\n${formatReadinessSummary(summary, [config.privateKey])}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const summary = buildReadinessSummary({
      walletAddress,
      keyId: config.keyId,
      privateKey: config.privateKey,
      testnetOnly: config.safety.testnetOnly,
      senderWalletAddress: config.senderWalletAddress,
      receiverWalletAddress: config.receiverWalletAddress,
      walletMetadataReachable: false,
      walletMetadataError: message
    });

    process.stdout.write(`\n${formatReadinessSummary(summary, [config.privateKey])}\n`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
