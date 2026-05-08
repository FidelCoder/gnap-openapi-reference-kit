# Open Payments Flow Mapping

Open Payments is the proving ground for this reference kit because its operations depend on GNAP authorization and are concrete enough to validate.

## Roles

- Wallet address server: exposes wallet address metadata such as `https://wallet.example/alice`.
- Authorization server: negotiates grants at `https://auth.wallet.example`.
- Resource server: hosts protected Open Payments resources at `https://resource.wallet.example`.
- Client: requests grants and calls protected resource operations.

## Operation Mapping

| Open Payments concept | Example operation | GNAP access type | Common actions |
| --- | --- | --- | --- |
| Wallet address discovery | `discoverWalletAddress` | `wallet-address` | `read`, `list` |
| Incoming payment creation | `createIncomingPayment` | `incoming-payment` | `create`, `read` |
| Incoming payment status | `readIncomingPayment` | `incoming-payment` | `read` |
| Quote creation | `createQuote` | `quote` | `create`, `read` |
| Outgoing payment creation | `createOutgoingPayment` | `outgoing-payment` | `create`, `read` |
| Outgoing payment status | `readOutgoingPayment` | `outgoing-payment` | `read` |

## Grant Flow Shape

An outgoing payment flow can be described as:

1. Discover wallet address metadata.
2. Request a GNAP grant for `quote` and `outgoing-payment` access.
3. Handle interaction and continuation if required.
4. Create a quote.
5. Create an outgoing payment.
6. Read outgoing payment status.

The files under `fixtures/` show local-only JSON examples for grant requests, continuation, and payment request bodies. They are illustrative and contain no real credentials.
