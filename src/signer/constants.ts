// Signer section

import type { CreatePublicationOptions } from "../types";

export const keysToOmitFromSignedPropertyNames = <(keyof Pick<CreatePublicationOptions, "signer" | "challengeRequest">)[]>[
    "signer",
    "challengeRequest"
];
