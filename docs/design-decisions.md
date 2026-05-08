# Design Decisions

## Use OpenAPI Extensions

GNAP is not currently a first-class OpenAPI security model. OpenAPI extensions let this project prototype the missing metadata without waiting for a formal specification change.

## Keep the Validator Separate From Kiota

The first milestone is a reference and validation toolkit. Keeping it separate from Kiota makes the metadata inspectable, testable, and easier to discuss before SDK generation behavior is attempted.

## Use Open Payments as the Proving Ground

Open Payments gives the project realistic operations, access objects, and multi-step flows. It keeps the work grounded while still leaving the extension vocabulary generic enough to discuss beyond one API.

## Avoid a GNAP Server in v1

A full GNAP authorization server would make the project much broader. This repo instead models grant requests and responses as local fixtures so validation stays deterministic and easy to review.

## Keep Examples Compact

The examples are intentionally small. Their job is to prove how the metadata hangs together, not to replace official Open Payments specifications or SDKs.

## Treat Proof Metadata Carefully

`x-gnap.proof` is useful for SDK readiness, but missing proof metadata is only a warning in v1. That lets early examples remain valid while still nudging authors toward more complete descriptions.
