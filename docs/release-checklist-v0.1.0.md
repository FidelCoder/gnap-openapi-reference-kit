# v0.1.0 Release Checklist

Use this checklist before tagging the first public review release.

## Scope

- [ ] The release is framed as experimental and reference-only.
- [ ] The repo does not claim official OpenAPI, GNAP, Interledger, Open Payments, or Kiota adoption.
- [ ] The repo does not implement a production wallet, payment processor, GNAP server, or real-money flow.
- [ ] Optional live examples are clearly testnet/play-money only.

## Local Verification

- [ ] `pnpm install` completes.
- [ ] `pnpm test` passes without `.env` and without network.
- [ ] `pnpm build` passes.
- [ ] `pnpm gnap-openapi validate examples/valid/openpayments-gnap.yaml` passes.
- [ ] `pnpm gnap-openapi validate examples/invalid/missing-access-metadata.yaml` fails with `MISSING_GNAP_ACCESS`.

## Live Dry-Run Verification

- [ ] `pnpm live:check-account` dry-run validates config and makes no network calls.
- [ ] `pnpm live:inspect-wallet` dry-run validates config and makes no network calls.
- [ ] `pnpm live:create-incoming-payment` dry-run prints planned grant/payment bodies and makes no mutating calls.
- [ ] `pnpm live:send-testnet-payment` dry-run prints planned flow and makes no network calls.

Suggested single-account dry-run:

```sh
DRY_RUN=true OPEN_PAYMENTS_TESTNET_ONLY=true TEST_WALLET_ADDRESS=https://wallet.interledger-test.dev/alice PRIVATE_KEY=placeholder KEY_ID=https://wallet.interledger-test.dev/alice/keys/1 PAYMENT_AMOUNT_VALUE=100 PAYMENT_AMOUNT_ASSET_CODE=USD PAYMENT_AMOUNT_ASSET_SCALE=2 pnpm live:check-account
```

## Optional Live Evidence

- [ ] At least one `pnpm live:check-account` run has been captured with redacted output.
- [ ] If two test wallets are available, one full play-money run has been captured with redacted output.
- [ ] `docs/grant-execution-proof.md` has been copied outside the repo or filled only with safe, redacted testnet evidence.
- [ ] No real credentials, tokens, approval URLs, or `interact_ref` values are committed.

## Documentation

- [ ] README explains what the project is and is not.
- [ ] README links to extension vocabulary, validation rules, Open Payments mapping, Kiota readiness, design decisions, roadmap, demo transcript, and proof template.
- [ ] `docs/gnap-openapi-extension-vocabulary.md` explains `x-gnap` and `x-gnap-access`.
- [ ] `docs/validation-rules.md` lists current issue codes and behavior.
- [ ] `docs/open-payments-flow-mapping.md` maps Open Payments operations to GNAP access.
- [ ] `docs/kiota-readiness-report.md` explains future SDK consumption.
- [ ] `docs/roadmap.md` describes near-term milestones.
- [ ] `docs/demo-transcript.md` shows expected command output.

## Repository Hygiene

- [ ] `.gitignore` excludes `.env` files and generated output.
- [ ] `examples/live-open-payments/.env.example` contains placeholders only.
- [ ] No real wallet credentials are present in tracked files.
- [ ] GitHub issue templates are present.
- [ ] The working tree is clean before tagging.

## Tagging

- [ ] Version in `package.json` is correct.
- [ ] Changelog or release notes summarize the public review baseline.
- [ ] Tag is created: `git tag v0.1.0`.
- [ ] Tag is pushed: `git push origin v0.1.0`.
- [ ] GitHub release notes include testnet-only safety language.
