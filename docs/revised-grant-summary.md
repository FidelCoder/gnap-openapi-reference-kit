# GNAP OpenAPI Reference Kit for Open Payments

## Problem

Open Payments uses GNAP authorization, but GNAP is not represented as a first-class OpenAPI security model today. This leaves a gap for API documentation, validation, and SDK generation tools. A generated client can see that an operation is protected, but it cannot reliably infer which GNAP grant request, access type, actions, interaction flow, or proof requirements are needed before calling the operation.

That gap makes Open Payments harder to document, validate, and eventually support in SDK tooling such as Kiota authentication providers.

## Proposed Solution

GNAP OpenAPI Reference Kit proposes an experimental OpenAPI extension vocabulary:

- `x-gnap` for GNAP authorization-server metadata on OpenAPI security schemes.
- `x-gnap-access` for operation-level GNAP access requirements.

The project validates those extensions with a TypeScript CLI and uses compact Open Payments examples as the proving ground.

The goal is not to create a new payment app. The goal is to make the missing GNAP/OpenAPI metadata concrete, inspectable, testable, and useful for future tooling discussion.

## Why This Aligns With GNAP In OpenAPI

GNAP authorization is negotiated dynamically, but OpenAPI documents still need a way to describe the authorization metadata that an API client or SDK generator should understand.

This project demonstrates that GNAP metadata can be represented through OpenAPI extensions without requiring immediate changes to the OpenAPI Specification itself. It gives maintainers and tooling contributors a practical artifact to review:

- security scheme metadata,
- operation access requirements,
- validation rules,
- Open Payments examples,
- workflow examples,
- SDK-readiness documentation.

## Why This Is Not Another HTTP Signatures Library

This project does not implement HTTP Message Signatures and does not replace existing signing libraries.

HTTP signatures are relevant to GNAP/Open Payments proof-of-possession behavior, but this repository focuses on describing and validating API metadata in OpenAPI. The optional live testnet examples use the official Open Payments SDK rather than implementing signing from scratch.

## What Exists Now

The repository currently contains:

- TypeScript CLI validator.
- YAML/JSON OpenAPI parser.
- Text and JSON reporters.
- `x-gnap` and `x-gnap-access` reference model.
- Validation rules with actionable diagnostics.
- Valid and invalid Open Payments OpenAPI examples.
- GNAP/Open Payments JSON fixtures.
- Arazzo workflow examples.
- Documentation for validation rules, extension vocabulary, Open Payments mapping, design decisions, and Kiota readiness.
- Optional Interledger Test Wallet testnet scripts.
- Dry-run safety for live scripts.
- Single-account readiness command for users who only have one verified test wallet.
- GitHub issue templates and release/reviewer docs.

## What Grant Funding Would Support Next

Grant funding would support the next stage of standards-aware refinement and reviewer evidence:

- Complete a documented full Interledger Test Wallet play-money transaction and capture redacted proof.
- Expand schema coverage for `x-gnap` and `x-gnap-access`.
- Add more Open Payments access examples and negative validation cases.
- Improve Arazzo workflow validation.
- Produce a Kiota-readiness design artifact showing how generated clients could consume GNAP metadata.
- Gather feedback from Open Payments, GNAP, OpenAPI, and SDK tooling contributors.
- Harden docs and examples into a public review package.

## Expected Outcomes

Expected outcomes include:

- A concrete reference vocabulary for GNAP metadata in OpenAPI.
- A validator that proves the metadata can be checked locally.
- Open Payments examples that show realistic access requirements.
- A documented path from OpenAPI metadata to future SDK auth-provider behavior.
- A grant/reviewer evidence package that distinguishes completed work, dry-run proof, and pending full testnet transaction proof.

The project remains experimental and reference-oriented. It does not claim official adoption and does not provide production payment infrastructure.
