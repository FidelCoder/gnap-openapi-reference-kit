# Validation Rules

The CLI validates local OpenAPI YAML or JSON files and emits actionable issues. A document is valid when it has no `error` severity issues. Warnings are shown but do not fail the file.

## OpenAPI Version

Code: `MISSING_OPENAPI_VERSION`

Errors when the root `openapi` field is missing.

Code: `UNSUPPORTED_OPENAPI_VERSION`

Warns when the document is below OpenAPI 3.1.0 or outside the v1 tested range. OpenAPI 3.1.x and 3.2.x pass.

## GNAP Security Scheme

Code: `MISSING_GNAP_SECURITY_SCHEME`

Errors when `components.securitySchemes` has no entry with `x-gnap`.

## Grant Endpoint

Code: `MISSING_GNAP_GRANT_ENDPOINT`

Errors when a GNAP security scheme omits `x-gnap.grantEndpoint`.

Code: `INVALID_GNAP_GRANT_ENDPOINT`

Errors when `grantEndpoint` is empty, not a string, or not an absolute URL.

## Operation Access Metadata

Code: `MISSING_GNAP_ACCESS`

Errors when an operation uses a GNAP security scheme but does not declare `x-gnap-access`.

Code: `MISSING_GNAP_ACCESS_TYPE`

Errors when `x-gnap-access.type` is missing or empty.

Code: `MISSING_GNAP_ACCESS_ACTIONS`

Errors when `x-gnap-access.actions` is missing.

Code: `INVALID_GNAP_ACCESS_ACTIONS`

Errors when `x-gnap-access.actions` is not a non-empty array.

## Access Vocabulary

Code: `INVALID_GNAP_ACCESS_TYPE`

Errors when an access type is not one of `incoming-payment`, `outgoing-payment`, `quote`, or `wallet-address`.

Code: `INVALID_GNAP_ACCESS_ACTION`

Errors when an action is not one of `create`, `read`, `list`, `complete`, or `cancel`.

## Proof Metadata

Code: `MISSING_GNAP_PROOF`

Warns when `x-gnap.proof` or `x-gnap.proof.method` is missing.

Code: `INVALID_GNAP_PROOF_METHOD`

Errors when `proof.method` is not one of `httpsig`, `jws`, or `none`.

## Example Output

```text
✗ examples/invalid/missing-access-metadata.yaml is invalid

[error] MISSING_GNAP_ACCESS
Path: paths./outgoing-payments.post.x-gnap-access
Message: Operation createOutgoingPayment uses GNAP security but does not declare x-gnap-access.
Suggestion: Add x-gnap-access with type: outgoing-payment and actions: [create, read].
```
