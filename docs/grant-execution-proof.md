# Grant Execution Proof

This document summarizes what the repository can prove today and how reviewers can verify it. It is written for Interledger reviewers, Open Payments maintainers, and SDK tooling contributors.

The project is experimental. It does not claim official OpenAPI, GNAP, Open Payments, Interledger, or Kiota adoption.

## What Currently Works

The repository currently includes:

- TypeScript CLI validator for local OpenAPI YAML and JSON files.
- Proposed `x-gnap` reference model for GNAP security-scheme metadata.
- Proposed `x-gnap-access` reference model for operation-level access requirements.
- Validation rules for OpenAPI version, GNAP security schemes, grant endpoints, operation access metadata, access types, access actions, and proof methods.
- Valid Open Payments-oriented OpenAPI examples.
- Invalid OpenAPI examples that intentionally trigger actionable diagnostics.
- GNAP/Open Payments JSON fixtures for grant and payment flows.
- Arazzo workflow examples for incoming payment, outgoing payment, donation, and checkout flows.
- Kiota-readiness documentation describing how future SDK tooling could consume the metadata.
- Optional live Open Payments testnet execution layer under `examples/live-open-payments/`.
- Dry-run safety for live examples.
- Testnet-only enforcement for live examples.
- Single-account readiness checks for cases where only one Interledger Test Wallet account is verified.

The core validator remains deterministic and local-only. Normal validation, tests, and builds do not require network access, wallet credentials, private keys, or live Open Payments APIs.

## Verification Commands

Run the local test suite:

```sh
pnpm test
```

Run the TypeScript build:

```sh
pnpm build
```

Validate the main valid Open Payments example:

```sh
pnpm gnap-openapi validate examples/valid/openpayments-gnap.yaml
```

Validate an intentionally invalid example:

```sh
pnpm gnap-openapi validate examples/invalid/missing-access-metadata.yaml
```

Expected result: the invalid example fails with `MISSING_GNAP_ACCESS`.

## Optional Live Dry-Run Verification

These commands validate the optional live harness without creating grants, payments, quotes, or outgoing payments.

Inspect wallet planning:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true SENDER_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice RECEIVER_WALLET_ADDRESS=https://wallet.interledger-test.dev/bob PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:inspect-wallet
```

Create incoming payment planning:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true SENDER_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice RECEIVER_WALLET_ADDRESS=https://wallet.interledger-test.dev/bob PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:create-incoming-payment
```

Full payment planning:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true SENDER_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice RECEIVER_WALLET_ADDRESS=https://wallet.interledger-test.dev/bob PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:send-testnet-payment
```

Single-account readiness planning:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true TEST_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:check-account
```

## Honesty Note

Dry-run outputs prove that the live harness validates configuration, enforces testnet-only safety, redacts secrets, and plans the expected Open Payments/GNAP request sequence.

Dry-run outputs are not proof of a completed testnet payment.

A completed testnet payment should be documented with:

- Incoming payment ID.
- Quote ID.
- Outgoing payment ID.
- Outgoing payment status.
- Asset details.
- Redacted terminal output.
- Confirmation from Interledger Test Wallet history.

Do not commit private keys, access tokens, continuation tokens, `interact_ref` values, approval URLs, or production payment data.

## Completed Testnet Payment Evidence Template

Use this section only after running `DRY_RUN=false` with Interledger Test Wallet play-money accounts.

- Date:
- Git commit:
- Command:
- Sender wallet address:
- Receiver wallet address:
- Incoming payment ID:
- Quote ID:
- Outgoing payment ID:
- Outgoing payment status:
- Requested receive amount:
- Quoted debit amount:
- Test Wallet history checked: yes/no
- Private keys/tokens redacted: yes/no
- Notes:

## Reviewer Interpretation

The current evidence is sufficient to inspect:

- How GNAP metadata can be represented in OpenAPI.
- How Open Payments operations map to GNAP access requirements.
- How invalid specs are detected.
- How fixtures model grant/payment flows.
- How Arazzo can describe multi-step Open Payments workflows.
- What Kiota-like SDK tooling would need in order to consume this metadata later.

The remaining live proof gap is a documented full testnet payment run with returned testnet IDs and wallet history confirmation.
