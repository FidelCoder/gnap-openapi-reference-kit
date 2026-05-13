# Project Roadmap

This roadmap is grant-review oriented. It describes the path from the current reference kit to a stronger review package for GNAP/OpenAPI, Open Payments, Arazzo, and SDK tooling contributors.

The project is experimental and does not claim official adoption by OpenAPI, GNAP, Interledger, Open Payments, or Kiota.

## Phase 1: Reference Model And Validator

Status: completed

Completed work:

- Proposed `x-gnap` OpenAPI security-scheme extension.
- Proposed `x-gnap-access` operation-level extension.
- TypeScript CLI validator.
- YAML/JSON parser.
- Text and JSON reporters.
- Validation rules for OpenAPI version, GNAP security schemes, grant endpoints, operation access metadata, access types, access actions, and proof methods.
- Valid and invalid Open Payments examples.
- Rule tests and validator tests.

Review value:

- Demonstrates that GNAP metadata can be represented and validated in OpenAPI without changing the OpenAPI Specification in the first milestone.

## Phase 2: Testnet Harness

Status: completed dry-run, pending full live transaction proof

Completed work:

- Optional live Open Payments scripts under `examples/live-open-payments/`.
- Testnet-only safety enforcement.
- Dry-run mode for non-mutating request planning.
- Wallet inspection script.
- Incoming payment creation script.
- Full send-testnet-payment script.
- Single-account readiness script for users with only one verified test wallet.
- Documentation and demo transcript for expected dry-run/live-run output.

Pending proof:

- A completed `DRY_RUN=false` Interledger Test Wallet play-money transaction.
- Redacted evidence with incoming payment ID, quote ID, outgoing payment ID, status, and wallet history confirmation.

Review value:

- Shows the practical protocol sequence behind the OpenAPI metadata while keeping live network usage optional.

## Phase 3: Community Review And Spec Refinement

Status: next

Planned work:

- Gather feedback from Open Payments maintainers, GNAP reviewers, OpenAPI practitioners, and SDK tooling contributors.
- Refine names and shapes for `x-gnap` and `x-gnap-access`.
- Add clearer limitations and compatibility notes.
- Add issue-driven examples for reviewer concerns.
- Separate stable reference guidance from experimental ideas.

Review value:

- Turns the reference vocabulary into a more credible proposal for wider discussion.

## Phase 4: Kiota-Readiness Research And Auth-Provider Design

Status: planned

Planned work:

- Expand the Kiota-readiness report into a concrete auth-provider design note.
- Map `x-gnap-access` metadata to generated operation middleware requirements.
- Document how grant negotiation, interaction, continuation, and request signing could be surfaced in generated clients.
- Prototype a metadata extraction output that SDK tools could consume.

Non-goal:

- Do not fork or modify Kiota in this phase.

Review value:

- Gives SDK tooling contributors a precise bridge from OpenAPI metadata to generated-client authorization behavior.

## Phase 5: Arazzo Workflow Expansion And Validation

Status: planned

Planned work:

- Expand Arazzo workflow examples for incoming payment, outgoing payment, donation, and checkout.
- Validate that workflow operation IDs exist in referenced OpenAPI examples.
- Add workflow fixtures for interaction-required and continuation paths.
- Document how Arazzo complements `x-gnap-access` operation metadata.

Review value:

- Shows how multi-step Open Payments flows can be described alongside operation-level GNAP authorization metadata.

## Continuing Principles

- Keep the core validator deterministic and local-only.
- Keep live network examples optional.
- Keep examples compact and inspectable.
- Avoid production payment claims.
- Avoid real credentials in the repository.
- Keep errors actionable for API authors.
