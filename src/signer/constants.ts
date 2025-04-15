// Signer section

import type { CreatePublicationOptions } from "../types.js";

export const keysToOmitFromSignedPropertyNames = <(keyof Pick<CreatePublicationOptions, "signer" | "challengeRequest">)[]>[
    "signer",
    "challengeRequest"
];
