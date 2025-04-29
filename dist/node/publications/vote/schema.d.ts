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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
    vote: 0 | 1 | -1;
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
    vote: 0 | 1 | -1;
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
export declare const VoteSignedPropertyNames: ("vote" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid")[];
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
        address: string;
        privateKey: string;
        publicKey: string;
    }, {
        type: "ed25519";
        address: string;
        privateKey: string;
        publicKey: string;
    }>;
    timestamp: z.ZodNumber;
    protocolVersion: z.ZodString;
} & {
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    }, {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
}, "signature" | "vote" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, "strict", z.ZodTypeAny, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    vote: 0 | 1 | -1;
    timestamp: number;
    author: {
        address: string;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }> | undefined;
        avatar?: z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
}, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    vote: 0 | 1 | -1;
    timestamp: number;
    author: {
        address: string;
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }> | undefined;
        avatar?: z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
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
        address: string;
        privateKey: string;
        publicKey: string;
    }, {
        type: "ed25519";
        address: string;
        privateKey: string;
        publicKey: string;
    }>;
    timestamp: z.ZodNumber;
    protocolVersion: z.ZodString;
} & {
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    }, {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }, {
            address: string;
            signature: {
                type: "eip191";
                signature: string;
            };
            timestamp: number;
        }>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
}, "signature" | "vote" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, "vote" | "timestamp" | "protocolVersion" | "commentCid"> & {
    insertedAt: z.ZodNumber;
    authorSignerAddress: z.ZodString;
    extraProps: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    vote: 0 | 1 | -1;
    timestamp: number;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    authorSignerAddress: string;
    extraProps?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    vote: 0 | 1 | -1;
    timestamp: number;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    authorSignerAddress: string;
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
            address: string;
            privateKey: string;
            publicKey: string;
        }, {
            type: "ed25519";
            address: string;
            privateKey: string;
            publicKey: string;
        }>;
        timestamp: z.ZodNumber;
        protocolVersion: z.ZodString;
    } & {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        }, {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }, "signature" | "vote" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, "passthrough", z.ZodTypeAny, z.objectOutputType<Pick<{
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
            address: string;
            privateKey: string;
            publicKey: string;
        }, {
            type: "ed25519";
            address: string;
            privateKey: string;
            publicKey: string;
        }>;
        timestamp: z.ZodNumber;
        protocolVersion: z.ZodString;
    } & {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        }, {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }, "signature" | "vote" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, z.ZodTypeAny, "passthrough">, z.objectInputType<Pick<{
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
            address: string;
            privateKey: string;
            publicKey: string;
        }, {
            type: "ed25519";
            address: string;
            privateKey: string;
            publicKey: string;
        }>;
        timestamp: z.ZodNumber;
        protocolVersion: z.ZodString;
    } & {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        }, {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }>>>;
            avatar: z.ZodOptional<z.ZodObject<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }, "signature" | "vote" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    vote: {
        signature: {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        vote: 0 | 1 | -1;
        timestamp: number;
        author: {
            address: string;
            flair?: z.objectOutputType<{
                text: z.ZodString;
                backgroundColor: z.ZodOptional<z.ZodString>;
                textColor: z.ZodOptional<z.ZodString>;
                expiresAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }> | undefined;
            avatar?: z.objectOutputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}, {
    vote: {
        signature: {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        vote: 0 | 1 | -1;
        timestamp: number;
        author: {
            address: string;
            flair?: z.objectInputType<{
                text: z.ZodString;
                backgroundColor: z.ZodOptional<z.ZodString>;
                textColor: z.ZodOptional<z.ZodString>;
                expiresAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                signature: {
                    type: "eip191";
                    signature: string;
                };
                timestamp: number;
            }> | undefined;
            avatar?: z.objectInputType<{
                chainTicker: z.ZodString;
                address: z.ZodString;
                id: z.ZodString;
                timestamp: z.ZodNumber;
                signature: z.ZodObject<{
                    signature: z.ZodString;
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
                    signature: string;
                }>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}>;
export declare const VotePubsubReservedFields: string[];
