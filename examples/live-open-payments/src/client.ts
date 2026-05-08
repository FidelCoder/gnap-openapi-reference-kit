import {
  createAuthenticatedClient,
  createUnauthenticatedClient,
  type AuthenticatedClient,
  type UnauthenticatedClient
} from "@interledger/open-payments";
import type { LiveOpenPaymentsConfig } from "./config.js";

export async function createPublicOpenPaymentsClient(
  config: LiveOpenPaymentsConfig
): Promise<UnauthenticatedClient> {
  return createUnauthenticatedClient({
    logLevel: config.logLevel
  });
}

export async function createLiveOpenPaymentsClient(
  config: LiveOpenPaymentsConfig,
  walletAddressUrl = config.senderWalletAddress
): Promise<AuthenticatedClient> {
  return createAuthenticatedClient({
    walletAddressUrl,
    privateKey: config.privateKey,
    keyId: config.keyId,
    logLevel: config.logLevel
  });
}
