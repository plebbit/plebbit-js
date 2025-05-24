import { z } from "zod";
export declare const CreateVoteUserOptionsSchema: z.ZodObject<{
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
} & {
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
}, "strict", z.ZodTypeAny, {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
    vote: 0 | 1 | -1;
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
    commentCid: string;
    vote: 0 | 1 | -1;
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
export declare const VoteSignedPropertyNames: ("timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote")[];
export declare const VotePubsubMessagePublicationSchema: z.ZodObject<Pick<{
    subplebbitAddress: z.ZodString;
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
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
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
    protocolVersion: z.ZodString;
} & {
    signature: z.ZodObject<{
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
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
    }, z.ZodTypeAny, "passthrough">>;
}, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, "strict", z.ZodTypeAny, {
    timestamp: number;
    signature: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
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
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    vote: 0 | 1 | -1;
}, {
    timestamp: number;
    signature: {
        type: string;
        publicKey: string;
        signature: string;
        signedPropertyNames: string[];
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
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    vote: 0 | 1 | -1;
}>;
export declare const VoteTablesRowSchema: z.ZodObject<Pick<Pick<{
    subplebbitAddress: z.ZodString;
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
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
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
    protocolVersion: z.ZodString;
} & {
    signature: z.ZodObject<{
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
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
    }, z.ZodTypeAny, "passthrough">>;
}, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, "timestamp" | "protocolVersion" | "commentCid" | "vote"> & {
    insertedAt: z.ZodNumber;
    authorSignerAddress: z.ZodString;
    extraProps: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    timestamp: number;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    authorSignerAddress: string;
    vote: 0 | 1 | -1;
    extraProps?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    timestamp: number;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    authorSignerAddress: string;
    vote: 0 | 1 | -1;
    extraProps?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const VoteChallengeRequestToEncryptSchema: z.ZodObject<{
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
} & {
    vote: z.ZodObject<Pick<{
        subplebbitAddress: z.ZodString;
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
        commentCid: z.ZodEffects<z.ZodString, string, string>;
        vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
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
        protocolVersion: z.ZodString;
    } & {
        signature: z.ZodObject<{
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
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        }, z.ZodTypeAny, "passthrough">>;
    }, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, "passthrough", z.ZodTypeAny, z.objectOutputType<Pick<{
        subplebbitAddress: z.ZodString;
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
        commentCid: z.ZodEffects<z.ZodString, string, string>;
        vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
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
        protocolVersion: z.ZodString;
    } & {
        signature: z.ZodObject<{
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
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        }, z.ZodTypeAny, "passthrough">>;
    }, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, z.ZodTypeAny, "passthrough">, z.objectInputType<Pick<{
        subplebbitAddress: z.ZodString;
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
        commentCid: z.ZodEffects<z.ZodString, string, string>;
        vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
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
        protocolVersion: z.ZodString;
    } & {
        signature: z.ZodObject<{
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
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        }, z.ZodTypeAny, "passthrough">>;
    }, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    vote: {
        timestamp: number;
        signature: {
            type: string;
            publicKey: string;
            signature: string;
            signedPropertyNames: string[];
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
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
        vote: 0 | 1 | -1;
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}, {
    vote: {
        timestamp: number;
        signature: {
            type: string;
            publicKey: string;
            signature: string;
            signedPropertyNames: string[];
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
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
        vote: 0 | 1 | -1;
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}>;
export declare const VotePubsubReservedFields: string[];
