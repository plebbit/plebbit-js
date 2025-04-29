import { z } from "zod";
export declare const ModeratorOptionsSchema: z.ZodObject<{
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
    pinned: z.ZodOptional<z.ZodBoolean>;
    locked: z.ZodOptional<z.ZodBoolean>;
    removed: z.ZodOptional<z.ZodBoolean>;
    purged: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodObject<Pick<{
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
    }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    author?: z.objectOutputType<Pick<{
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
    }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
    reason?: string | undefined;
    pinned?: boolean | undefined;
    locked?: boolean | undefined;
    removed?: boolean | undefined;
    purged?: boolean | undefined;
}, {
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    spoiler?: boolean | undefined;
    nsfw?: boolean | undefined;
    author?: z.objectInputType<Pick<{
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
    }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
    reason?: string | undefined;
    pinned?: boolean | undefined;
    locked?: boolean | undefined;
    removed?: boolean | undefined;
    purged?: boolean | undefined;
}>;
export declare const CreateCommentModerationOptionsSchema: z.ZodObject<{
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
    commentModeration: z.ZodObject<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>;
    commentCid: z.ZodEffects<z.ZodString, string, string>;
}, "strict", z.ZodTypeAny, {
    commentModeration: {
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        author?: z.objectOutputType<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
    };
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
    commentModeration: {
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        author?: z.objectInputType<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
    };
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
export declare const CommentModerationSignedPropertyNames: ("commentModeration" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid")[];
export declare const CommentModerationPubsubMessagePublicationSchema: z.ZodObject<Pick<{
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
    commentModeration: z.ZodObject<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>;
    commentCid: z.ZodEffects<z.ZodString, string, string>;
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
}, "signature" | "commentModeration" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, "strict", z.ZodTypeAny, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    commentModeration: {
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        author?: z.objectOutputType<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
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
}, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    commentModeration: {
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        author?: z.objectInputType<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
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
}>;
export declare const CommentModerationsTableRowSchema: z.ZodObject<Pick<{
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
    commentModeration: z.ZodObject<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        purged: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodObject<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>;
    commentCid: z.ZodEffects<z.ZodString, string, string>;
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
}, "signature" | "commentModeration" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid"> & {
    insertedAt: z.ZodNumber;
    id: z.ZodNumber;
    modSignerAddress: z.ZodString;
    extraProps: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    commentModeration: {
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        author?: z.objectOutputType<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
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
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    modSignerAddress: string;
    extraProps?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    signature: {
        type: "ed25519" | "eip191";
        signature: string;
        publicKey: string;
        signedPropertyNames: string[];
    };
    commentModeration: {
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        spoiler?: boolean | undefined;
        nsfw?: boolean | undefined;
        author?: z.objectInputType<Pick<{
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
        }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
        reason?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        removed?: boolean | undefined;
        purged?: boolean | undefined;
    } & {
        [k: string]: unknown;
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
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    commentCid: string;
    insertedAt: number;
    modSignerAddress: string;
    extraProps?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const CommentModerationChallengeRequestToEncryptSchema: z.ZodObject<{
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
} & {
    commentModeration: z.ZodObject<Pick<{
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
        commentModeration: z.ZodObject<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>;
        commentCid: z.ZodEffects<z.ZodString, string, string>;
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
    }, "signature" | "commentModeration" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, "passthrough", z.ZodTypeAny, z.objectOutputType<Pick<{
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
        commentModeration: z.ZodObject<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>;
        commentCid: z.ZodEffects<z.ZodString, string, string>;
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
    }, "signature" | "commentModeration" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, z.ZodTypeAny, "passthrough">, z.objectInputType<Pick<{
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
        commentModeration: z.ZodObject<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
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
            pinned: z.ZodOptional<z.ZodBoolean>;
            locked: z.ZodOptional<z.ZodBoolean>;
            removed: z.ZodOptional<z.ZodBoolean>;
            purged: z.ZodOptional<z.ZodBoolean>;
            reason: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodObject<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>;
        commentCid: z.ZodEffects<z.ZodString, string, string>;
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
    }, "signature" | "commentModeration" | "timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid">, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    commentModeration: {
        signature: {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        commentModeration: {
            flair?: z.objectOutputType<{
                text: z.ZodString;
                backgroundColor: z.ZodOptional<z.ZodString>;
                textColor: z.ZodOptional<z.ZodString>;
                expiresAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            spoiler?: boolean | undefined;
            nsfw?: boolean | undefined;
            author?: z.objectOutputType<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
            reason?: string | undefined;
            pinned?: boolean | undefined;
            locked?: boolean | undefined;
            removed?: boolean | undefined;
            purged?: boolean | undefined;
        } & {
            [k: string]: unknown;
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
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}, {
    commentModeration: {
        signature: {
            type: "ed25519" | "eip191";
            signature: string;
            publicKey: string;
            signedPropertyNames: string[];
        };
        commentModeration: {
            flair?: z.objectInputType<{
                text: z.ZodString;
                backgroundColor: z.ZodOptional<z.ZodString>;
                textColor: z.ZodOptional<z.ZodString>;
                expiresAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            spoiler?: boolean | undefined;
            nsfw?: boolean | undefined;
            author?: z.objectInputType<Pick<{
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
            }, "flair" | "banExpiresAt">, z.ZodTypeAny, "passthrough"> | undefined;
            reason?: string | undefined;
            pinned?: boolean | undefined;
            locked?: boolean | undefined;
            removed?: boolean | undefined;
            purged?: boolean | undefined;
        } & {
            [k: string]: unknown;
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
    } & {
        [k: string]: unknown;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}>;
export declare const CommentModerationReservedFields: string[];
