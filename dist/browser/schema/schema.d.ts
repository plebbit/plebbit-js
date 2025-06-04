import { z } from "zod";
export declare const CreateSignerSchema: z.ZodObject<{
    type: z.ZodEnum<["ed25519"]>;
    privateKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "ed25519";
    privateKey: string;
}, {
    type: "ed25519";
    privateKey: string;
}>;
export declare const SignerWithAddressPublicKeySchema: z.ZodObject<{
    type: z.ZodEnum<["ed25519"]>;
    privateKey: z.ZodString;
} & {
    address: z.ZodString;
    publicKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "ed25519";
    privateKey: string;
    address: string;
    publicKey: string;
}, {
    type: "ed25519";
    privateKey: string;
    address: string;
    publicKey: string;
}>;
export declare const SignerWithAddressPublicKeyShortAddressSchema: z.ZodObject<{
    type: z.ZodEnum<["ed25519"]>;
    privateKey: z.ZodString;
} & {
    address: z.ZodString;
    publicKey: z.ZodString;
} & {
    shortAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "ed25519";
    privateKey: string;
    address: string;
    publicKey: string;
    shortAddress: string;
}, {
    type: "ed25519";
    privateKey: string;
    address: string;
    publicKey: string;
    shortAddress: string;
}>;
export declare const SubplebbitAddressSchema: z.ZodString;
export declare const AuthorAddressSchema: z.ZodString;
export declare const PlebbitTimestampSchema: z.ZodNumber;
export declare const ProtocolVersionSchema: z.ZodString;
export declare const UserAgentSchema: z.ZodString;
export declare const CidStringSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const CidPathSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const AuthorAvatarNftSchema: z.ZodObject<{
    chainTicker: z.ZodString;
    address: z.ZodString;
    id: z.ZodString;
    timestamp: z.ZodNumber;
    signature: z.ZodObject<{
        signature: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        signature: string;
    }, {
        type: string;
        signature: string;
    }>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    chainTicker: z.ZodString;
    address: z.ZodString;
    id: z.ZodString;
    timestamp: z.ZodNumber;
    signature: z.ZodObject<{
        signature: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        signature: string;
    }, {
        type: string;
        signature: string;
    }>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    chainTicker: z.ZodString;
    address: z.ZodString;
    id: z.ZodString;
    timestamp: z.ZodNumber;
    signature: z.ZodObject<{
        signature: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        signature: string;
    }, {
        type: string;
        signature: string;
    }>;
}, z.ZodTypeAny, "passthrough">>;
export declare const FlairSchema: z.ZodObject<{
    text: z.ZodString;
    backgroundColor: z.ZodOptional<z.ZodString>;
    textColor: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    text: z.ZodString;
    backgroundColor: z.ZodOptional<z.ZodString>;
    textColor: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    text: z.ZodString;
    backgroundColor: z.ZodOptional<z.ZodString>;
    textColor: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">>;
export declare const AuthorPubsubSchema: z.ZodObject<{
    address: z.ZodString;
    previousCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    displayName: z.ZodOptional<z.ZodString>;
    wallets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        address: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }>>>;
    avatar: z.ZodOptional<z.ZodObject<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough">>>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    address: string;
    previousCommentCid?: string | undefined;
    displayName?: string | undefined;
    wallets?: Record<string, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }> | undefined;
    avatar?: z.objectOutputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    address: string;
    previousCommentCid?: string | undefined;
    displayName?: string | undefined;
    wallets?: Record<string, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }> | undefined;
    avatar?: z.objectInputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const ChallengeAnswerStringSchema: z.ZodString;
export declare const ChallengeAnswersSchema: z.ZodArray<z.ZodString, "atleastone">;
export declare const CreatePublicationUserOptionsSchema: z.ZodObject<{
    signer: z.ZodObject<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
    }>;
    author: z.ZodOptional<z.ZodObject<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough">>>;
    subplebbitAddress: z.ZodString;
    protocolVersion: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodNumber>;
    challengeRequest: z.ZodOptional<z.ZodObject<{
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "strip", z.ZodTypeAny, {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    }, {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    timestamp?: number | undefined;
    author?: z.objectOutputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
}, {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    timestamp?: number | undefined;
    author?: z.objectInputType<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
}>;
export declare const JsonSignatureSchema: z.ZodObject<{
    type: z.ZodString;
    signature: z.ZodString;
    publicKey: z.ZodString;
    signedPropertyNames: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: string;
    publicKey: string;
    signature: string;
    signedPropertyNames: string[];
}, {
    type: string;
    publicKey: string;
    signature: string;
    signedPropertyNames: string[];
}>;
export declare const PublicationBaseBeforeSigning: z.ZodObject<{
    signer: z.ZodObject<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    } & {
        address: z.ZodString;
        publicKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    }>;
    timestamp: z.ZodNumber;
    author: z.ZodObject<{
        address: z.ZodString;
        previousCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        displayName: z.ZodOptional<z.ZodString>;
        wallets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">>>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "strict", z.ZodTypeAny, {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }, {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }>;
    protocolVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    signer: {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    };
    protocolVersion: string;
}, {
    timestamp: number;
    signer: {
        type: "ed25519";
        privateKey: string;
        address: string;
        publicKey: string;
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: string;
                signature: string;
            };
        }> | undefined;
        avatar?: z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                signature: string;
            }, {
                type: string;
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    };
    protocolVersion: string;
}>;
export declare const SubplebbitAuthorSchema: z.ZodObject<{
    postScore: z.ZodNumber;
    replyScore: z.ZodNumber;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
    firstCommentTimestamp: z.ZodNumber;
    lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    postScore: z.ZodNumber;
    replyScore: z.ZodNumber;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
    firstCommentTimestamp: z.ZodNumber;
    lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    postScore: z.ZodNumber;
    replyScore: z.ZodNumber;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
    firstCommentTimestamp: z.ZodNumber;
    lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
}, z.ZodTypeAny, "passthrough">>;
export declare const CommentAuthorSchema: z.ZodObject<Pick<{
    postScore: z.ZodNumber;
    replyScore: z.ZodNumber;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
    firstCommentTimestamp: z.ZodNumber;
    lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
}, "flair" | "banExpiresAt">, "passthrough", z.ZodTypeAny, z.objectOutputType<Pick<{
    postScore: z.ZodNumber;
    replyScore: z.ZodNumber;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
    firstCommentTimestamp: z.ZodNumber;
    lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
}, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">, z.objectInputType<Pick<{
    postScore: z.ZodNumber;
    replyScore: z.ZodNumber;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
    firstCommentTimestamp: z.ZodNumber;
    lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
}, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>;
export declare const AuthorWithOptionalCommentUpdateSchema: z.ZodObject<{
    address: z.ZodString;
    previousCommentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    displayName: z.ZodOptional<z.ZodString>;
    wallets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        address: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }>>>;
    avatar: z.ZodOptional<z.ZodObject<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough">>>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>>;
} & {
    subplebbit: z.ZodOptional<z.ZodObject<{
        postScore: z.ZodNumber;
        replyScore: z.ZodNumber;
        banExpiresAt: z.ZodOptional<z.ZodNumber>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>;
        firstCommentTimestamp: z.ZodNumber;
        lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        postScore: z.ZodNumber;
        replyScore: z.ZodNumber;
        banExpiresAt: z.ZodOptional<z.ZodNumber>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>;
        firstCommentTimestamp: z.ZodNumber;
        lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        postScore: z.ZodNumber;
        replyScore: z.ZodNumber;
        banExpiresAt: z.ZodOptional<z.ZodNumber>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>;
        firstCommentTimestamp: z.ZodNumber;
        lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    address: string;
    previousCommentCid?: string | undefined;
    displayName?: string | undefined;
    wallets?: Record<string, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }> | undefined;
    avatar?: z.objectOutputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    subplebbit?: z.objectOutputType<{
        postScore: z.ZodNumber;
        replyScore: z.ZodNumber;
        banExpiresAt: z.ZodOptional<z.ZodNumber>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>;
        firstCommentTimestamp: z.ZodNumber;
        lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    address: string;
    previousCommentCid?: string | undefined;
    displayName?: string | undefined;
    wallets?: Record<string, {
        address: string;
        timestamp: number;
        signature: {
            type: string;
            signature: string;
        };
    }> | undefined;
    avatar?: z.objectInputType<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            signature: string;
        }, {
            type: string;
            signature: string;
        }>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    subplebbit?: z.objectInputType<{
        postScore: z.ZodNumber;
        replyScore: z.ZodNumber;
        banExpiresAt: z.ZodOptional<z.ZodNumber>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>>;
        firstCommentTimestamp: z.ZodNumber;
        lastCommentCid: z.ZodEffects<z.ZodString, string, string>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const AuthorReservedFields: string[];
