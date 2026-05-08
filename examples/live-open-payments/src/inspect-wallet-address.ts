import type { WalletAddress } from "@interledger/open-payments";
import { createPublicOpenPaymentsClient } from "./client.js";
import { getRedactedConfig, loadLiveOpenPaymentsConfig } from "./config.js";
import { createLiveLogger } from "./logger.js";
import { formatAmount } from "./utils.js";

function printWalletAddress(label: string, walletAddress: WalletAddress): void {
  process.stdout.write(`\n${label}\n`);
  process.stdout.write(`  id: ${walletAddress.id}\n`);
  process.stdout.write(`  publicName: ${walletAddress.publicName ?? "(not set)"}\n`);
  process.stdout.write(`  assetCode: ${walletAddress.assetCode}\n`);
  process.stdout.write(`  assetScale: ${walletAddress.assetScale}\n`);
  process.stdout.write(`  authServer: ${walletAddress.authServer}\n`);
  process.stdout.write(`  resourceServer: ${walletAddress.resourceServer}\n`);
}

async function main(): Promise<void> {
  const config = loadLiveOpenPaymentsConfig();
  const logger = createLiveLogger({
    level: config.logLevel,
    secrets: [config.privateKey]
  });

  logger.section("Open Payments Testnet Wallet Inspection");
  logger.warn("Testnet only. Play-money only. No production funds or real financial value.");
  logger.info("Configured amount", formatAmount(config.amount));
  logger.debug("Redacted configuration", getRedactedConfig(config));

  if (config.safety.dryRun) {
    logger.section("Dry Run");
    logger.info("No network calls will be made.");
    logger.info("Would fetch sender wallet address", config.senderWalletAddress);
    logger.info("Would fetch receiver wallet address", config.receiverWalletAddress);
    return;
  }

  const client = await createPublicOpenPaymentsClient(config);
  const senderWalletAddress = await client.walletAddress.get({
    url: config.senderWalletAddress
  });
  const receiverWalletAddress = await client.walletAddress.get({
    url: config.receiverWalletAddress
  });

  printWalletAddress("Sender wallet address", senderWalletAddress);
  printWalletAddress("Receiver wallet address", receiverWalletAddress);
  logger.success("Wallet address inspection complete.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
