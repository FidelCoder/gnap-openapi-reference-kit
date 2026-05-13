# Project Roadmap

This roadmap keeps the project focused on its core thesis: make GNAP-secured Open Payments APIs representable, validatable, and ready for future SDK generation through OpenAPI.

The project is experimental. Roadmap items describe reference-kit work, not official OpenAPI, GNAP, Open Payments, or Kiota commitments.

## v0.1.0 Public Review Baseline

Status: in progress

Goals:

- Ship the TypeScript validator and CLI.
- Keep validation deterministic and local-only.
- Provide compact Open Payments OpenAPI examples.
- Provide invalid examples with actionable diagnostics.
- Provide local GNAP/Open Payments fixtures.
- Provide Arazzo workflow examples.
- Document the proposed `x-gnap` and `x-gnap-access` vocabulary.
- Provide optional live Interledger Test Wallet demos that are explicitly testnet/play-money only.
- Provide a single-account readiness path for users who do not yet have a second verified test wallet.

Exit criteria:

- `pnpm test` passes without credentials or network.
- `pnpm build` passes.
- Valid OpenAPI example passes.
- Invalid OpenAPI example fails with clear diagnostics.
- Optional live dry-runs run without network mutation.
- No real credentials or production payment instructions are committed.

## v0.2.0 Extension Hardening

Candidate scope:

- Add JSON Schema for `x-gnap`.
- Add JSON Schema for `x-gnap-access`.
- Add schema-backed validation while keeping friendly issue messages.
- Add more invalid examples for malformed extension objects.
- Add docs explaining how the schema and rule engine relate.

Non-goals:

- Do not claim the extension vocabulary is official.
- Do not replace the rule-based validator with opaque schema errors.

## v0.3.0 Open Payments Coverage

Candidate scope:

- Expand compact examples for wallet-address, incoming-payment, quote, and outgoing-payment variants.
- Add focused fixtures for grant continuation and interaction-required flows.
- Add Arazzo workflow checks that operation IDs exist in the referenced OpenAPI examples.
- Add conformance-style docs pairing operations with expected GNAP access requests.

Non-goals:

- Do not mirror the entire official Open Payments specification.
- Do not implement a production wallet.

## v0.4.0 Kiota Readiness Prototype

Candidate scope:

- Document a concrete mapping from `x-gnap-access` to generated client authentication hooks.
- Prototype a small metadata extractor that emits operation-to-access requirements.
- Add a sample auth-provider design note for future Kiota work.
- Add generated-client pseudocode examples without requiring a Kiota fork.

Non-goals:

- Do not modify Kiota directly in this repo.
- Do not generate production SDKs.

## v0.5.0 Live Testnet Evidence Package

Candidate scope:

- Stabilize live demo transcripts.
- Add grant execution proof templates for reviewer evidence.
- Add redaction guidance for terminal logs and screenshots.
- Add optional scripts for collecting non-secret testnet IDs into a local report.

Non-goals:

- Do not store real tokens or private keys.
- Do not encourage production or real-money usage.

## Backlog

- Add machine-readable validation rule metadata.
- Add SARIF or GitHub annotation output.
- Add CLI option to treat warnings as errors.
- Add docs for integrating the validator into CI.
- Add OpenAPI examples for multiple GNAP security schemes.
- Add tests for path-level security inheritance edge cases.
- Add examples for operation-level security overrides.
- Add docs for known limitations of HTTP Message Signatures metadata.
