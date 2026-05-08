# Kiota Readiness Report

This project does not modify Kiota and does not generate SDKs in v1. It shows what metadata a future Kiota authentication provider or generation extension would need in order to reason about GNAP-secured Open Payments operations.

## What Kiota Could Consume Later

`x-gnap` could tell generated client infrastructure:

- where grant negotiation starts,
- whether user interaction may be required,
- whether continuation is expected,
- what proof mechanism is expected for protected calls.

`x-gnap-access` could tell operation-level code:

- what access type to request before calling an operation,
- which actions the operation needs,
- whether multiple operations can share a grant because their access requirements overlap.

## Possible Generated Client Behavior

A future client could inspect an operation such as `createOutgoingPayment`, find `x-gnap-access.type: outgoing-payment`, request a grant with actions like `create` and `read`, then attach the resulting token and proof to the API request.

The current project stops before that step. It validates metadata and documents how it could be consumed.

## Gaps Before SDK Support

- A precise GNAP-to-OpenAPI extension contract would need review.
- Token proof binding and HTTP Message Signatures behavior would need implementation outside this validator.
- Kiota would need an auth provider capable of grant negotiation, interaction handling, continuation, token storage, and request signing.
- SDK tests would need generated-client fixtures across at least one target language.

## Recommended Future Work

1. Stabilize the extension vocabulary with implementer feedback.
2. Add JSON Schema for `x-gnap` and `x-gnap-access`.
3. Prototype a Kiota authentication provider against the example specs.
4. Add conformance fixtures that pair OpenAPI operations with expected GNAP grant requests.
