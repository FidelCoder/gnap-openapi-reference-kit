import { isFinalizedGrantWithAccessToken, type GrantRequest } from "@interledger/open-payments";
import { createLiveOpenPaymentsClient } from "./client.js";
import { loadLiveOpenPaymentsConfig } from "./config.js";
import { createLiveLogger } from "./logger.js";
import { formatAmount } from "./utils.js";

function incomingPaymentGrantRequest(): Omit<GrantRequest, "client"> {
  return {
    access_token: {
      access: [
        {
          type: "incoming-payment",
          actions: ["create", "read", "complete"]
        }
      ]
    }
  };
}

function incomingPaymentRequest(config: ReturnType<typeof loadLiveOpenPaymentsConfig>) {
  return {
    walletAddress: config.receiverWalletAddress,
    incomingAmount: config.amount,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    metadata: {
      description: "GNAP OpenAPI Reference Kit testnet incoming payment",
      testnetOnly: true
    }
  };
}

async function main(): Promise<void> {
  const config = loadLiveOpenPaymentsConfig();
  const logger = createLiveLogger({
    level: config.logLevel,
    secrets: [config.privateKey]
  });

  logger.section("Create Testnet Incoming Payment");
  logger.warn("Testnet only. Play-money only. No production funds or real financial value.");
  logger.info("Requested amount", formatAmount(config.amount));

  const plannedGrantRequest = incomingPaymentGrantRequest();
  const plannedIncomingPaymentRequest = incomingPaymentRequest(config);

  if (config.safety.dryRun) {
    logger.section("Dry Run");
    logger.info("No mutating grant or incoming-payment API calls will be made.");
    logger.info("Would request incoming-payment grant", plannedGrantRequest);
    logger.info("Would create incoming payment", plannedIncomingPaymentRequest);
    return;
  }

  const client = await createLiveOpenPaymentsClient(config, config.receiverWalletAddress);
  const receiverWalletAddress = await client.walletAddress.get({
    url: config.receiverWalletAddress
  });

  logger.info("Receiver resource server", receiverWalletAddress.resourceServer);
  logger.info("Receiver auth server", receiverWalletAddress.authServer);

  const grant = await client.grant.request(
    { url: receiverWalletAddress.authServer },
    plannedGrantRequest
  );

  if (!isFinalizedGrantWithAccessToken(grant)) {
    throw new Error(
      "Incoming-payment grant was not finalized with an access token. This script expects a non-interactive finalized incoming-payment grant."
    );
  }

  const incomingPayment = await client.incomingPayment.create(
    {
      url: receiverWalletAddress.resourceServer,
      accessToken: grant.access_token.value
    },
    plannedIncomingPaymentRequest
  );

  logger.section("Incoming Payment Created");
  logger.info("grant manage URL", grant.access_token.manage ?? "(not provided)");
  logger.info("incoming payment id", incomingPayment.id);
  logger.info("receiver wallet address", incomingPayment.walletAddress);
  logger.info("amount", formatAmount(config.amount));
  logger.info("expiresAt", incomingPayment.expiresAt ?? "(not provided)");
  logger.info("resource server", receiverWalletAddress.resourceServer);
  logger.success("Incoming payment testnet flow complete.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
