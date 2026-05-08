import { randomUUID } from "node:crypto";
import {
  isFinalizedGrantWithAccessToken,
  isPendingGrant,
  type Grant,
  type GrantRequest,
  type GrantWithAccessToken,
  type PendingGrant
} from "@interledger/open-payments";
import { createLiveOpenPaymentsClient } from "./client.js";
import { loadLiveOpenPaymentsConfig } from "./config.js";
import { createLiveLogger } from "./logger.js";
import {
  formatAmount,
  maybeOpenBrowser,
  promptForInteractRef,
  requireUserStep
} from "./utils.js";

function incomingPaymentGrantRequest(): Omit<GrantRequest, "client"> {
  return {
    access_token: {
      access: [
        {
          type: "incoming-payment",
          actions: ["create", "read"]
        }
      ]
    }
  };
}

function quoteGrantRequest(): Omit<GrantRequest, "client"> {
  return {
    access_token: {
      access: [
        {
          type: "quote",
          actions: ["create", "read"]
        }
      ]
    }
  };
}

function outgoingPaymentGrantRequest(
  senderWalletAddressId: string,
  debitAmount: {
    value: string;
    assetCode: string;
    assetScale: number;
  }
): Omit<GrantRequest, "client"> {
  return {
    access_token: {
      access: [
        {
          type: "outgoing-payment",
          actions: ["create", "read", "list"],
          identifier: senderWalletAddressId,
          limits: {
            debitAmount
          }
        }
      ]
    },
    interact: {
      start: ["redirect"],
      finish: {
        method: "redirect",
        uri: "https://client.example/callback",
        nonce: randomUUID()
      }
    }
  };
}

async function finalizeOutgoingPaymentGrant(
  client: Awaited<ReturnType<typeof createLiveOpenPaymentsClient>>,
  pendingGrant: PendingGrant,
  openBrowserOnInteraction: boolean
): Promise<GrantWithAccessToken> {
  const redirectUrl = pendingGrant.interact.redirect;

  process.stdout.write("\nAPPROVAL URL\n");
  process.stdout.write(`${redirectUrl}\n\n`);
  requireUserStep(
    "Open the approval URL in your Interledger Test Wallet, approve the play-money outgoing-payment grant, then copy the interact_ref from the final redirect URL."
  );

  try {
    await maybeOpenBrowser(redirectUrl, openBrowserOnInteraction);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`[warn] Could not open browser automatically: ${message}\n`);
  }

  const interactRef = await promptForInteractRef();
  const continuedGrant = await client.grant.continue(
    {
      url: pendingGrant.continue.uri,
      accessToken: pendingGrant.continue.access_token.value
    },
    { interact_ref: interactRef }
  );

  if (!isFinalizedGrantWithAccessToken(continuedGrant)) {
    throw new Error(
      "Grant continuation did not return a finalized grant with an access token. Confirm that approval completed and the interact_ref was copied correctly."
    );
  }

  return continuedGrant;
}

async function ensureFinalizedOutgoingGrant(
  client: Awaited<ReturnType<typeof createLiveOpenPaymentsClient>>,
  grant: PendingGrant | Grant,
  openBrowserOnInteraction: boolean
): Promise<GrantWithAccessToken> {
  if (isFinalizedGrantWithAccessToken(grant)) {
    return grant;
  }

  if (isPendingGrant(grant)) {
    return finalizeOutgoingPaymentGrant(client, grant, openBrowserOnInteraction);
  }

  throw new Error("Outgoing-payment grant did not include an access token or an interaction URL.");
}

async function main(): Promise<void> {
  const config = loadLiveOpenPaymentsConfig();
  const logger = createLiveLogger({
    level: config.logLevel,
    secrets: [config.privateKey]
  });

  logger.section("Send Open Payments Testnet Payment");
  logger.warn("Testnet only. Play-money only. No production funds or real financial value.");
  logger.info("Requested receive amount", formatAmount(config.amount));

  if (config.safety.dryRun) {
    logger.section("Dry Run");
    logger.info("No wallet, grant, quote, incoming-payment, or outgoing-payment network calls will be made.");
    logger.info("Would fetch sender wallet", config.senderWalletAddress);
    logger.info("Would fetch receiver wallet", config.receiverWalletAddress);
    logger.info("Would request incoming-payment grant", incomingPaymentGrantRequest());
    logger.info("Would create incoming payment", {
      walletAddress: config.receiverWalletAddress,
      incomingAmount: config.amount
    });
    logger.info("Would request quote grant", quoteGrantRequest());
    logger.info("Would create quote", {
      walletAddress: config.senderWalletAddress,
      receiver: "incoming-payment-id-from-previous-step",
      method: "ilp"
    });
    logger.info("Would request interactive outgoing-payment grant", {
      type: "outgoing-payment",
      actions: ["create", "read", "list"],
      testnetOnly: true
    });
    logger.info("Would create outgoing payment", {
      walletAddress: config.senderWalletAddress,
      quoteId: "quote-id-from-previous-step"
    });
    return;
  }

  const client = await createLiveOpenPaymentsClient(config, config.senderWalletAddress);
  const senderWalletAddress = await client.walletAddress.get({
    url: config.senderWalletAddress
  });
  const receiverWalletAddress = await client.walletAddress.get({
    url: config.receiverWalletAddress
  });

  logger.section("Wallet Addresses");
  logger.info("sender", {
    id: senderWalletAddress.id,
    assetCode: senderWalletAddress.assetCode,
    assetScale: senderWalletAddress.assetScale,
    authServer: senderWalletAddress.authServer,
    resourceServer: senderWalletAddress.resourceServer
  });
  logger.info("receiver", {
    id: receiverWalletAddress.id,
    assetCode: receiverWalletAddress.assetCode,
    assetScale: receiverWalletAddress.assetScale,
    authServer: receiverWalletAddress.authServer,
    resourceServer: receiverWalletAddress.resourceServer
  });

  const incomingGrant = await client.grant.request(
    { url: receiverWalletAddress.authServer },
    incomingPaymentGrantRequest()
  );
  if (!isFinalizedGrantWithAccessToken(incomingGrant)) {
    throw new Error("Incoming-payment grant was not finalized with an access token.");
  }

  const incomingPayment = await client.incomingPayment.create(
    {
      url: receiverWalletAddress.resourceServer,
      accessToken: incomingGrant.access_token.value
    },
    {
      walletAddress: receiverWalletAddress.id,
      incomingAmount: config.amount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      metadata: {
        description: "GNAP OpenAPI Reference Kit testnet payment receiver",
        testnetOnly: true
      }
    }
  );

  logger.success("Incoming payment created", incomingPayment.id);

  const quoteGrant = await client.grant.request(
    { url: senderWalletAddress.authServer },
    quoteGrantRequest()
  );
  if (!isFinalizedGrantWithAccessToken(quoteGrant)) {
    throw new Error("Quote grant was not finalized with an access token.");
  }

  const quote = await client.quote.create(
    {
      url: senderWalletAddress.resourceServer,
      accessToken: quoteGrant.access_token.value
    },
    {
      walletAddress: senderWalletAddress.id,
      receiver: incomingPayment.id,
      method: "ilp"
    }
  );

  logger.success("Quote created", {
    id: quote.id,
    debitAmount: quote.debitAmount,
    receiveAmount: quote.receiveAmount,
    expiresAt: quote.expiresAt ?? "(not provided)"
  });

  const outgoingGrant = await client.grant.request(
    { url: senderWalletAddress.authServer },
    outgoingPaymentGrantRequest(senderWalletAddress.id, quote.debitAmount)
  );
  const finalizedOutgoingGrant = await ensureFinalizedOutgoingGrant(
    client,
    outgoingGrant,
    config.safety.openBrowserOnInteraction
  );

  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: senderWalletAddress.resourceServer,
      accessToken: finalizedOutgoingGrant.access_token.value
    },
    {
      walletAddress: senderWalletAddress.id,
      quoteId: quote.id,
      metadata: {
        description: "GNAP OpenAPI Reference Kit testnet payment",
        testnetOnly: true
      }
    }
  );

  logger.section("Final Summary");
  logger.info("sender wallet address", senderWalletAddress.id);
  logger.info("receiver wallet address", receiverWalletAddress.id);
  logger.info("incoming payment id", incomingPayment.id);
  logger.info("quote id", quote.id);
  logger.info("outgoing payment id", outgoingPayment.id);
  logger.info("outgoing payment status", outgoingPayment.failed ? "failed" : "created");
  logger.info("requested receive amount", formatAmount(config.amount));
  logger.info("quoted debit amount", formatAmount(quote.debitAmount));
  logger.success("Testnet payment flow complete.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
