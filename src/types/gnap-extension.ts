export const allowedAccessTypes = [
  "incoming-payment",
  "outgoing-payment",
  "quote",
  "wallet-address"
] as const;

export const allowedAccessActions = [
  "create",
  "read",
  "list",
  "complete",
  "cancel"
] as const;

export const allowedProofMethods = ["httpsig", "jws", "none"] as const;

export type GnapAccessType = (typeof allowedAccessTypes)[number];
export type GnapAccessAction = (typeof allowedAccessActions)[number];
export type GnapProofMethod = (typeof allowedProofMethods)[number];
