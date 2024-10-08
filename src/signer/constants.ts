// Signer section

import type { CreatePublicationOptions } from "../types";

export const keysToOmitFromSignedPropertyNames = <(keyof Pick<CreatePublicationOptions, "signer" | "pubsubMessage">)[]>[
    "signer",
    "pubsubMessage"
];
