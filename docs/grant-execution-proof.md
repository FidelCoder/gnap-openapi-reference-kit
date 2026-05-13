# Grant Execution Proof Template

Use this template to document optional Interledger Test Wallet evidence for grant reviewers or maintainers.

This document is a template. Do not commit real private keys, access tokens, continuation tokens, `interact_ref` values, production wallet details, or real-money payment data.

## Safety Statement

- Environment: Interledger Test Wallet testnet
- Value type: play-money only
- Production funds used: no
- Real financial value: no
- Private keys committed: no
- Network actions were explicitly invoked by the operator: yes/no

## Run Metadata

- Date:
- Operator:
- Git commit:
- Node version:
- pnpm version:
- Command:
- Mode: `DRY_RUN=true` or `DRY_RUN=false`

## Configuration Summary

Do not paste secrets.

- `OPEN_PAYMENTS_TESTNET_ONLY=true`: yes/no
- `ALLOW_NON_TESTNET_URLS=true`: yes/no
- Sender wallet address:
- Receiver wallet address:
- Single test wallet address, if applicable:
- Asset code:
- Asset scale:
- Amount value:
- Private key present: yes/no
- Key ID configured: yes/no
- Key ID appears to match wallet: yes/no/warn

## Local Validation Evidence

Paste output:

```text
pnpm test
```

Paste output:

```text
pnpm build
```

Paste output:

```text
pnpm gnap-openapi validate examples/valid/openpayments-gnap.yaml
```

Paste output:

```text
pnpm gnap-openapi validate examples/invalid/missing-access-metadata.yaml
```

The invalid example should fail with `MISSING_GNAP_ACCESS`.

## Single-Account Readiness Evidence

Command:

```sh
pnpm live:check-account
```

Paste redacted output:

```text

```

Readiness results:

- Wallet metadata reachable: yes/no
- Testnet safety enabled: yes/no
- Private key present: yes/no
- KEY_ID configured: yes/no
- KEY_ID matches wallet: pass/warn/fail
- Ready for incoming-payment test: likely yes/no
- Ready for full payment test: likely yes/no

## Incoming Payment Evidence

Command:

```sh
pnpm live:create-incoming-payment
```

Paste redacted output:

```text

```

Returned testnet values:

- Receiver wallet address:
- Resource server:
- Incoming payment ID:
- Incoming amount:
- Expires at:
- Grant/access token value redacted: yes

## Full Payment Evidence

Command:

```sh
pnpm live:send-testnet-payment
```

Paste redacted output:

```text

```

Returned testnet values:

- Sender wallet address:
- Receiver wallet address:
- Incoming payment ID:
- Quote ID:
- Outgoing payment ID:
- Outgoing payment status:
- Requested receive amount:
- Quoted debit amount:
- Test Wallet UI/history confirms play-money movement: yes/no

## Redaction Checklist

Before sharing this proof, confirm:

- Private key removed.
- Access token values removed.
- Continuation token values removed.
- `interact_ref` removed.
- Approval URL removed or sanitized.
- Any personal account names removed if needed.
- Only testnet/play-money resource IDs remain.

## Reviewer Notes

- What did this run prove?
- What failed or needs follow-up?
- Any issue links:
- Any screenshots stored outside Git:
