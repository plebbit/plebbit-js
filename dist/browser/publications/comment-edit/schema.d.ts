import { z } from "zod";
export declare const AuthorCommentEditOptionsSchema: z.ZodObject<{
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    content: z.ZodOptional<z.ZodString>;
    deleted: z.ZodOptional<z.ZodBoolean>;
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
    spoiler: z.ZodOptional<z.ZodBoolean>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    commentCid: string;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    reason?: string | undefined;
}, {
    commentCid: string;
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    reason?: string | undefined;
}>;
export declare const CreateCommentEditOptionsSchema: z.ZodObject<{
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
    content: z.ZodOptional<z.ZodString>;
    deleted: z.ZodOptional<z.ZodBoolean>;
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
    spoiler: z.ZodOptional<z.ZodBoolean>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
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
    deleted?: boolean | undefined;
    reason?: string | undefined;
}, {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    commentCid: string;
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
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
    deleted?: boolean | undefined;
    reason?: string | undefined;
}>;
export declare const CommentEditSignedPropertyNames: ("flair" | "spoiler" | "nsfw" | "content" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "deleted" | "reason")[];
export declare const CommentEditPubsubMessagePublicationSchema: z.ZodObject<Pick<{
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
    content: z.ZodOptional<z.ZodString>;
    deleted: z.ZodOptional<z.ZodBoolean>;
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
    spoiler: z.ZodOptional<z.ZodBoolean>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
} & {
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
    }, "strict", z.ZodTypeAny, {
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
    }, {
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
    }>;
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
}, "signature" | "flair" | "spoiler" | "nsfw" | "content" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "deleted" | "reason">, "strict", z.ZodTypeAny, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
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
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    reason?: string | undefined;
}, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
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
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    reason?: string | undefined;
}>;
export declare const CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema: z.ZodObject<{
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
    spoiler: z.ZodOptional<z.ZodBoolean>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    content: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    subplebbitAddress: z.ZodString;
    protocolVersion: z.ZodString;
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    deleted: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
} & {
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
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
    spoiler: z.ZodOptional<z.ZodBoolean>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    content: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    subplebbitAddress: z.ZodString;
    protocolVersion: z.ZodString;
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    deleted: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
} & {
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
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
    spoiler: z.ZodOptional<z.ZodBoolean>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    content: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    subplebbitAddress: z.ZodString;
    protocolVersion: z.ZodString;
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    deleted: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
} & {
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
}, z.ZodTypeAny, "passthrough">>;
export declare const CommentEditsTableRowSchema: z.ZodObject<Pick<{
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
    content: z.ZodOptional<z.ZodString>;
    deleted: z.ZodOptional<z.ZodBoolean>;
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
    spoiler: z.ZodOptional<z.ZodBoolean>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
} & {
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
    }, "strict", z.ZodTypeAny, {
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
    }, {
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
    }>;
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
}, "signature" | "flair" | "spoiler" | "nsfw" | "content" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "deleted" | "reason"> & {
    insertedAt: z.ZodNumber;
    authorSignerAddress: z.ZodString;
    isAuthorEdit: z.ZodBoolean;
    extraProps: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
    id: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    timestamp: number;
    id: number;
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
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    authorSignerAddress: string;
    isAuthorEdit: boolean;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    reason?: string | undefined;
    extraProps?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    timestamp: number;
    id: number;
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
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    authorSignerAddress: string;
    isAuthorEdit: boolean;
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    content?: string | undefined;
    deleted?: boolean | undefined;
    reason?: string | undefined;
    extraProps?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const CommentEditChallengeRequestToEncryptSchema: z.ZodObject<{
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
} & {
    commentEdit: z.ZodObject<{
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
        spoiler: z.ZodOptional<z.ZodBoolean>;
        nsfw: z.ZodOptional<z.ZodBoolean>;
        content: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
        subplebbitAddress: z.ZodString;
        protocolVersion: z.ZodString;
        commentCid: z.ZodEffects<z.ZodString, string, string>;
        deleted: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
    } & {
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
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        spoiler: z.ZodOptional<z.ZodBoolean>;
        nsfw: z.ZodOptional<z.ZodBoolean>;
        content: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
        subplebbitAddress: z.ZodString;
        protocolVersion: z.ZodString;
        commentCid: z.ZodEffects<z.ZodString, string, string>;
        deleted: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
    } & {
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
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        spoiler: z.ZodOptional<z.ZodBoolean>;
        nsfw: z.ZodOptional<z.ZodBoolean>;
        content: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
        subplebbitAddress: z.ZodString;
        protocolVersion: z.ZodString;
        commentCid: z.ZodEffects<z.ZodString, string, string>;
        deleted: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
    } & {
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
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    commentEdit: {
        signature: {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
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
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        content?: string | undefined;
        deleted?: boolean | undefined;
        reason?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}, {
    commentEdit: {
        signature: {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
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
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        content?: string | undefined;
        deleted?: boolean | undefined;
        reason?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}>;
export declare const CommentEditReservedFields: string[];
