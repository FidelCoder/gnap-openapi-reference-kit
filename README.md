# GNAP OpenAPI Reference Kit

GNAP OpenAPI Reference Kit is an experimental reference toolkit for describing and validating GNAP-secured Open Payments APIs in OpenAPI.

Open Payments uses GNAP authorization, but GNAP is not currently represented as a first-class OpenAPI security scheme. This makes it harder for SDK generators and developer tools to understand how protected payment operations should request and use authorization.

This project proposes a lightweight OpenAPI extension vocabulary using `x-gnap` and `x-gnap-access`, provides Open Payments examples, validates those examples with a TypeScript CLI, and documents how this metadata could inform future SDK generation work such as Kiota authentication support.

This is not a production wallet or authorization server. It is a reference kit for improving the developer experience around GNAP, OpenAPI, and Open Payments.

## Status

The project is a v1 reference implementation. It validates local OpenAPI YAML and JSON files only. It does not make network calls, execute payments, handle real money, or use real credentials.

## Installation

```sh
pnpm install
pnpm build
```

## Usage

Validate a local OpenAPI file:

```sh
pnpm gnap-openapi validate examples/valid/openpayments-gnap.yaml
```

Use JSON output:

```sh
pnpm gnap-openapi validate examples/valid/openpayments-gnap.yaml --format json
```

Run the test suite:

```sh
pnpm test
```

## Example Output

Valid file:

```text
✓ examples/valid/openpayments-gnap.yaml is valid
No errors found.
```

Invalid file:

```text
✗ examples/invalid/missing-access-metadata.yaml is invalid

[error] MISSING_GNAP_ACCESS
Path: paths./outgoing-payments.post.x-gnap-access
Message: Operation createOutgoingPayment uses GNAP security but does not declare x-gnap-access.
Suggestion: Add x-gnap-access with type: outgoing-payment and actions: [create, read].
```

## Extension Model

`x-gnap` is attached to an OpenAPI security scheme:

```yaml
components:
  securitySchemes:
    openPaymentsGNAP:
      type: http
      scheme: bearer
      x-gnap:
        grantEndpoint: https://auth.wallet.example
        supportsInteraction: true
        supportsContinuation: true
        proof:
          method: httpsig
          alg: ed25519
```

`x-gnap-access` is attached to protected operations:

```yaml
paths:
  /outgoing-payments:
    post:
      operationId: createOutgoingPayment
      security:
        - openPaymentsGNAP: []
      x-gnap-access:
        type: outgoing-payment
        actions:
          - create
          - read
```

## Project Layout

- `src/`: TypeScript CLI, parser, validation rules, and reporters.
- `examples/`: compact valid and invalid OpenAPI examples.
- `fixtures/`: local-only GNAP and Open Payments JSON fixtures.
- `arazzo/`: workflow examples for incoming payment, outgoing payment, donation, and checkout flows.
- `docs/`: extension vocabulary, validation rules, flow mapping, Kiota readiness, and design notes.
- `tests/`: parser, validator, fixture, and rule tests.

## Validation Rules

The CLI currently checks:

- OpenAPI version presence and supported range.
- At least one `x-gnap` security scheme.
- Required and valid `x-gnap.grantEndpoint`.
- Required operation-level `x-gnap-access` for GNAP-protected operations.
- Allowed access types and actions.
- Proof method warnings and validation.

Warnings do not make a file invalid. Errors do.

## Examples And Fixtures

The Open Payments examples use placeholder URLs only:

- `https://wallet.example/alice`
- `https://auth.wallet.example`
- `https://resource.wallet.example`
- `https://client.example/callback`

Fixtures are illustrative, local-only JSON files. They are useful for documentation and tests, but they are not executable payment instructions and contain no real secrets.

## Documentation

- [GNAP OpenAPI extension vocabulary](docs/gnap-openapi-extension-vocabulary.md)
- [Open Payments flow mapping](docs/open-payments-flow-mapping.md)
- [Validation rules](docs/validation-rules.md)
- [Kiota readiness report](docs/kiota-readiness-report.md)
- [Design decisions](docs/design-decisions.md)

## Roadmap

1. Add JSON Schema for `x-gnap` and `x-gnap-access`.
2. Add more conformance-style fixtures for grants and operation access.
3. Prototype generated-client auth behavior using Kiota concepts.
4. Gather feedback from Open Payments, OpenAPI, and SDK implementers.

## Non-Goals

This project does not implement a GNAP authorization server, an Open Payments wallet, a payment processor, HTTP Message Signatures, official OpenAPI changes, or production SDK generation.
