# GNAP OpenAPI Extension Vocabulary

This project proposes an experimental OpenAPI extension vocabulary for describing GNAP metadata in OpenAPI documents. It is a reference model, not an official OpenAPI or Interledger specification.

The vocabulary has two extension points:

- `x-gnap` on an OpenAPI security scheme.
- `x-gnap-access` on protected operations.

## `x-gnap`

`x-gnap` describes authorization-server-level GNAP metadata. It is attached to a normal OpenAPI security scheme so existing tools can still recognize that the operation uses bearer-style authorization.

```yaml
components:
  securitySchemes:
    openPaymentsGNAP:
      type: http
      scheme: bearer
      description: GNAP-issued access token for Open Payments resources.
      x-gnap:
        grantEndpoint: https://auth.wallet.example
        supportsInteraction: true
        supportsContinuation: true
        proof:
          method: httpsig
          alg: ed25519
```

Required in v1:

- `grantEndpoint`: absolute URL where grant negotiation begins.

Optional in v1:

- `supportsInteraction`: whether redirect/user interaction is supported.
- `supportsContinuation`: whether grant continuation is supported.
- `proof.method`: expected proof mechanism. Allowed values are `httpsig`, `jws`, and `none`.
- `proof.alg`: proof algorithm hint.

## `x-gnap-access`

`x-gnap-access` maps an API operation to the GNAP access object needed to call it.

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

Required in v1:

- `type`: one of `incoming-payment`, `outgoing-payment`, `quote`, or `wallet-address`.
- `actions`: non-empty array using `create`, `read`, `list`, `complete`, or `cancel`.

Possible later fields:

- `identifier`: a wallet address, payment URL, or other resource identifier.
- `limits`: amount or resource limits that constrain the requested grant.

## Limitations

The vocabulary is intentionally small. It does not model every GNAP feature, does not define a production authorization protocol, and does not replace HTTP Message Signatures libraries. The goal is to make the missing OpenAPI metadata concrete enough to validate and discuss.
