# Demo Transcript

This transcript shows expected local, dry-run, and live-run output shapes. Replace example wallet URLs with your own Interledger Test Wallet play-money accounts before running live commands.

Do not paste private keys, access tokens, continuation tokens, `interact_ref` values, or production payment data into public logs.

## Local Validator Demo

Command:

```sh
pnpm gnap-openapi validate examples/valid/openpayments-gnap.yaml
```

Expected output:

```text
✓ examples/valid/openpayments-gnap.yaml is valid
No errors found.
```

Command:

```sh
pnpm gnap-openapi validate examples/invalid/missing-access-metadata.yaml
```

Expected output:

```text
✗ examples/invalid/missing-access-metadata.yaml is invalid

[error] MISSING_GNAP_ACCESS
Path: paths./outgoing-payments.post.x-gnap-access
Message: Operation createOutgoingPayment uses GNAP security but does not declare x-gnap-access.
Suggestion: Add x-gnap-access with type: outgoing-payment and actions: [create, read].
```

`pnpm` may append an `ELIFECYCLE` line because the invalid example exits with code 1. That is expected.

## Single-Account Readiness Dry Run

Command:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true TEST_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:check-account
```

Expected output:

```text
== Single-Account Open Payments Testnet Readiness ==
[warn] Testnet only. Play-money only. No production funds or real financial value.
[info] Wallet address under test
https://wallet.interledger-test.dev/alice

== Dry Run ==
[info] No network calls will be made.
[info] Would fetch wallet metadata
https://wallet.interledger-test.dev/alice

Readiness Summary

[warn] wallet metadata reachable: Not checked in dry-run mode.
  Suggestion: Run with DRY_RUN=false to fetch wallet address metadata.

[pass] testnet safety enabled: OPEN_PAYMENTS_TESTNET_ONLY is true.

[pass] private key present: PRIVATE_KEY is configured. The value is redacted.

[pass] KEY_ID configured: KEY_ID is configured.

[pass] KEY_ID matches wallet: KEY_ID appears to belong to the configured wallet address.

[fail] sender wallet configured: No sender wallet is configured for the full payment flow.
  Suggestion: Set SENDER_WALLET_ADDRESS before running pnpm live:send-testnet-payment.

[fail] receiver wallet configured: No receiver wallet is configured.
  Suggestion: Create or use a second verified test wallet before running the full payment flow.

[pass] ready for incoming-payment test: Likely yes. Single-account setup is sufficient for wallet readiness and incoming-payment checks.

[fail] ready for full payment test: No. Full payment flow requires a separate verified receiver wallet.
  Suggestion: Set RECEIVER_WALLET_ADDRESS after the second test wallet account is verified.
```

## Incoming Payment Dry Run

Command:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true SENDER_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice RECEIVER_WALLET_ADDRESS=https://wallet.interledger-test.dev/bob PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:create-incoming-payment
```

Expected output:

```text
== Create Testnet Incoming Payment ==
[warn] Testnet only. Play-money only. No production funds or real financial value.
[info] Requested amount
1.00 USD

== Dry Run ==
[info] No mutating grant or incoming-payment API calls will be made.
[info] Would request incoming-payment grant
{
  "access_token": {
    "access": [
      {
        "type": "incoming-payment",
        "actions": [
          "create",
          "read",
          "complete"
        ]
      }
    ]
  }
}
[info] Would create incoming payment
{
  "walletAddress": "https://wallet.interledger-test.dev/bob",
  "incomingAmount": {
    "value": "100",
    "assetCode": "USD",
    "assetScale": 2
  },
  "expiresAt": "2026-05-14T00:00:00.000Z",
  "metadata": {
    "description": "GNAP OpenAPI Reference Kit testnet incoming payment",
    "testnetOnly": true
  }
}
```

The `expiresAt` timestamp changes on each run.

## Full Payment Dry Run

Command:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true SENDER_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice RECEIVER_WALLET_ADDRESS=https://wallet.interledger-test.dev/bob PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:send-testnet-payment
```

Expected output:

```text
== Send Open Payments Testnet Payment ==
[warn] Testnet only. Play-money only. No production funds or real financial value.
[info] Requested receive amount
1.00 USD

== Dry Run ==
[info] No wallet, grant, quote, incoming-payment, or outgoing-payment network calls will be made.
[info] Would fetch sender wallet
https://wallet.interledger-test.dev/alice
[info] Would fetch receiver wallet
https://wallet.interledger-test.dev/bob
[info] Would request incoming-payment grant
...
[info] Would create incoming payment
...
[info] Would request quote grant
...
[info] Would create quote
...
[info] Would request interactive outgoing-payment grant
...
[info] Would create outgoing payment
...
```

## Single-Account Live Readiness Output Shape

Command:

```sh
pnpm live:check-account
```

Expected output shape:

```text
== Single-Account Open Payments Testnet Readiness ==
[warn] Testnet only. Play-money only. No production funds or real financial value.
[info] Wallet address under test
https://wallet.interledger-test.dev/YOUR_WALLET

Wallet Metadata
  id: https://wallet.interledger-test.dev/YOUR_WALLET
  publicName: Your Test Wallet
  assetCode: USD
  assetScale: 2
  authServer: https://...
  resourceServer: https://...

Readiness Summary

[pass] wallet metadata reachable: Wallet metadata was fetched successfully.
[pass] testnet safety enabled: OPEN_PAYMENTS_TESTNET_ONLY is true.
[pass] private key present: PRIVATE_KEY is configured. The value is redacted.
[pass] KEY_ID configured: KEY_ID is configured.
[pass] KEY_ID matches wallet: KEY_ID appears to belong to the configured wallet address.
```

If only `TEST_WALLET_ADDRESS` is configured, full payment readiness should still fail until sender and receiver wallet addresses are configured.

## Full Live Payment Output Shape

Command:

```sh
pnpm live:send-testnet-payment
```

Expected output shape:

```text
== Send Open Payments Testnet Payment ==
[warn] Testnet only. Play-money only. No production funds or real financial value.

== Wallet Addresses ==
[info] sender
{
  "id": "https://wallet.interledger-test.dev/YOUR_SENDER",
  "assetCode": "USD",
  "assetScale": 2,
  "authServer": "https://...",
  "resourceServer": "https://..."
}
[info] receiver
{
  "id": "https://wallet.interledger-test.dev/YOUR_RECEIVER",
  "assetCode": "USD",
  "assetScale": 2,
  "authServer": "https://...",
  "resourceServer": "https://..."
}
[ok] Incoming payment created
https://...
[ok] Quote created
{
  "id": "https://...",
  "debitAmount": {
    "value": "100",
    "assetCode": "USD",
    "assetScale": 2
  },
  "receiveAmount": {
    "value": "100",
    "assetCode": "USD",
    "assetScale": 2
  }
}

APPROVAL URL
https://...

ACTION REQUIRED
Open the approval URL in your Interledger Test Wallet, approve the play-money outgoing-payment grant, then copy the interact_ref from the final redirect URL.

Paste interact_ref from the approval redirect URL:

== Final Summary ==
[info] sender wallet address
https://wallet.interledger-test.dev/YOUR_SENDER
[info] receiver wallet address
https://wallet.interledger-test.dev/YOUR_RECEIVER
[info] incoming payment id
https://...
[info] quote id
https://...
[info] outgoing payment id
https://...
[info] outgoing payment status
created
[info] requested receive amount
1.00 USD
[info] quoted debit amount
1.00 USD
[ok] Testnet payment flow complete.
```

Use returned testnet IDs and the Interledger Test Wallet UI as proof of a real play-money run. Redact approval URLs, tokens, and `interact_ref` values before sharing.
