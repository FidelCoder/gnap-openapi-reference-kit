# Optional Live Open Payments Testnet Examples

This directory contains optional live examples for running GNAP-secured Open Payments flows against Interledger testnet APIs.

These scripts are separate from the core validator. The validator remains deterministic, local-only, and does not require wallet credentials, private keys, network access, or live Open Payments APIs.

## Testnet-Only Warning

Use these scripts only with Interledger Test Wallet play-money accounts.

These examples are:

- testnet only
- play-money only
- not production payment infrastructure
- not real financial value
- not instructions for sending real funds

Do not use production wallet accounts, production provider URLs, production keys, or real-money credentials with this repo.

## What This Proves

The live layer demonstrates the real Open Payments/GNAP sequence that the reference OpenAPI metadata is designed to describe:

1. Wallet address discovery.
2. GNAP grant request for `incoming-payment`.
3. Incoming payment creation.
4. GNAP grant request for `quote`.
5. Quote creation.
6. Interactive outgoing-payment grant.
7. Human approval URL handling.
8. Grant continuation after approval.
9. Outgoing payment creation.
10. Terminal output showing IDs, URLs, asset details, and status.

## Prerequisites

- Node.js and pnpm.
- Interledger Test Wallet play-money accounts.
- Developer keys for the wallet identity used by the script.
- A local `.env` file created from `.env.example`.

The Interledger Test Wallet provides play-money wallet accounts and developer keys. Use only test wallet accounts.

## Create Test Wallet Accounts

Create two testnet wallet addresses:

- sender wallet address, for example `https://wallet.interledger-test.dev/alice`
- receiver wallet address, for example `https://wallet.interledger-test.dev/bob`

The exact path depends on the test wallet account names you create.

## Generate Developer Keys

Generate developer keys in the test wallet UI for the wallet identity that will run the script.

For the standalone incoming payment script, the simplest setup is to use credentials for the receiver wallet.

For the full send flow, the simplest setup is to use credentials for the sender wallet, because the sender must approve the outgoing-payment grant.

The SDK accepts `PRIVATE_KEY` as either the private key material or a path to the private key file, matching the Open Payments SDK behavior.

## Configure Environment

Create a local `.env` file:

```sh
cp examples/live-open-payments/.env.example examples/live-open-payments/.env
```

Edit `examples/live-open-payments/.env`:

```sh
SENDER_WALLET_ADDRESS=https://wallet.interledger-test.dev/YOUR_SENDER_WALLET
RECEIVER_WALLET_ADDRESS=https://wallet.interledger-test.dev/YOUR_RECEIVER_WALLET
PRIVATE_KEY=BASE64_OR_PATH_FROM_TEST_WALLET_DEVELOPER_KEYS
KEY_ID=https://wallet.interledger-test.dev/YOUR_WALLET/keys/YOUR_KEY_ID
PAYMENT_AMOUNT_VALUE=100
PAYMENT_AMOUNT_ASSET_CODE=USD
PAYMENT_AMOUNT_ASSET_SCALE=2
OPEN_PAYMENTS_TESTNET_ONLY=true
OPEN_BROWSER_ON_INTERACTION=false
DRY_RUN=false
LOG_LEVEL=info
```

Do not commit `.env`. It is ignored by Git.

## Inspect Wallet Addresses

Dry run, with no network calls:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true SENDER_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice RECEIVER_WALLET_ADDRESS=https://wallet.interledger-test.dev/bob PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:inspect-wallet
```

Live run:

```sh
pnpm live:inspect-wallet
```

This fetches public wallet address metadata and prints:

- `id`
- `publicName`
- `assetCode`
- `assetScale`
- `authServer`
- `resourceServer`

## Create Incoming Payment

Dry run:

```sh
DRY_RUN=true pnpm live:create-incoming-payment
```

Live run:

```sh
pnpm live:create-incoming-payment
```

This requests an `incoming-payment` grant, creates an incoming payment on the receiver resource server, and prints the incoming payment ID, wallet address, amount, expiry, and resource server.

## Send A Testnet Payment

Dry run:

```sh
DRY_RUN=true pnpm live:send-testnet-payment
```

Live run:

```sh
pnpm live:send-testnet-payment
```

The full flow:

1. Fetch sender wallet address.
2. Fetch receiver wallet address.
3. Request receiver incoming-payment grant.
4. Create receiver incoming payment.
5. Request sender quote grant.
6. Create quote.
7. Request sender outgoing-payment grant.
8. Print approval URL.
9. Human approves in the test wallet.
10. CLI asks for `interact_ref` from the final redirect URL.
11. Continue the grant.
12. Create outgoing payment.
13. Print final IDs and status.

## Interactive Approval

Outgoing payment grants usually require human approval.

The script prints an approval URL. Open it in a browser, approve the play-money outgoing-payment grant, then copy the `interact_ref` query parameter from the final redirect URL and paste it into the terminal.

Set this if you want the script to try to open the approval URL automatically:

```sh
OPEN_BROWSER_ON_INTERACTION=true
```

The configured redirect URI is `https://client.example/callback`, because this repo does not run a production callback server. That is intentional for the reference demo. The important value is the `interact_ref` in the final redirect URL.

## Dry Run Behavior

`DRY_RUN=true` validates configuration and prints planned operations.

- `live:inspect-wallet` makes no network calls.
- `live:create-incoming-payment` does not request grants or create resources.
- `live:send-testnet-payment` does not fetch wallets, request grants, create quotes, create incoming payments, or create outgoing payments.

Dry run is designed for safe review and CI-like local checks without credentials beyond placeholders.

## Expected Output

Wallet inspection prints wallet public metadata:

```text
Sender wallet address
  id: https://wallet.interledger-test.dev/alice
  publicName: Alice Test Wallet
  assetCode: USD
  assetScale: 2
  authServer: https://...
  resourceServer: https://...
```

The full send flow prints:

```text
== Final Summary ==
[info] sender wallet address
[info] receiver wallet address
[info] incoming payment id
[info] quote id
[info] outgoing payment id
[info] outgoing payment status
[info] requested receive amount
[info] quoted debit amount
[ok] Testnet payment flow complete.
```

## Troubleshooting

Missing `PRIVATE_KEY`:
The config loader fails before any network call. Add a test wallet developer key or a path to the key file.

Invalid `KEY_ID`:
Use the key ID URL shown by the test wallet developer key setup.

Wallet address not found:
Check the sender and receiver wallet address URLs and confirm they exist in the Interledger Test Wallet.

Grant not finalized:
The script expected a finalized grant with an access token. Confirm the grant type and wallet permissions.

Interaction required but not approved:
Open the approval URL, approve the testnet grant, then paste the `interact_ref` from the redirect URL.

Quote creation failed:
Check that the sender wallet can quote against the incoming payment and that asset details are compatible.

Outgoing payment rejected:
Confirm the outgoing-payment grant was approved, the quote has not expired, and the debit amount is within the grant limit.

Asset mismatch:
Use amount asset details that match the wallet asset code and scale.

Expired incoming payment:
Run the flow again. Incoming payments created by these scripts use a short expiry for safety.

Non-testnet URL rejected:
The v1 live examples reject URLs that do not contain `interledger-test`. This protects against accidental production usage.

Network unavailable:
Retry when the network and Interledger testnet services are reachable.

## Why This Matters

The core repo proposes `x-gnap` and `x-gnap-access` metadata for OpenAPI. These live examples show the real protocol behavior behind that metadata: grant requests, access types, action sets, continuation, and protected resource calls.

That makes the Kiota-readiness story more concrete. A future generated client could use operation-level `x-gnap-access` metadata to understand which grant to request before calling an Open Payments operation.
