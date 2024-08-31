import { z } from "zod";
export declare const PubsubMessageSignatureSchema: z.ZodObject<{
    signature: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    publicKey: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    type: z.ZodEnum<["ed25519"]>;
    signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
}, "strict", z.ZodTypeAny, {
    type: "ed25519";
    publicKey: Uint8Array;
    signature: Uint8Array;
    signedPropertyNames: [string, ...string[]];
}, {
    type: "ed25519";
    publicKey: Uint8Array;
    signature: Uint8Array;
    signedPropertyNames: [string, ...string[]];
}>;
export declare const EncryptedSchema: z.ZodObject<{
    ciphertext: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    iv: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    tag: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    type: z.ZodEnum<["ed25519-aes-gcm"]>;
}, "strict", z.ZodTypeAny, {
    type: "ed25519-aes-gcm";
    ciphertext: Uint8Array;
    iv: Uint8Array;
    tag: Uint8Array;
}, {
    type: "ed25519-aes-gcm";
    ciphertext: Uint8Array;
    iv: Uint8Array;
    tag: Uint8Array;
}>;
export declare const CommentIpfsWithCidDefinedAndOptionalSubplebbitAuthorSchema: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
    content: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    link: z.ZodOptional<z.ZodString>;
    linkWidth: z.ZodOptional<z.ZodNumber>;
    linkHeight: z.ZodOptional<z.ZodNumber>;
    linkHtmlTagName: z.ZodOptional<z.ZodEnum<["a", "img", "video", "audio"]>>;
    parentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}>, {
    signer: z.ZodObject<z.objectUtil.extendShape<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, {
        address: z.ZodString;
        publicKey: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
}>, {
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
}>, Pick<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "link" | "spoiler" | "content" | "title" | "linkWidth" | "linkHeight" | "linkHtmlTagName" | "parentCid">, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
}>, {
    depth: z.ZodNumber;
    postCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    thumbnailUrlWidth: z.ZodOptional<z.ZodNumber>;
    thumbnailUrlHeight: z.ZodOptional<z.ZodNumber>;
    previousCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}>, {
    cid: z.ZodEffects<z.ZodString, string, string>;
}>, {
    postCid: z.ZodEffects<z.ZodString, string, string>;
}>, {
    author: z.ZodObject<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">>;
}>, "strict", z.ZodTypeAny, {
    timestamp: number;
    signature: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    cid: string;
    depth: number;
    postCid: string;
    flair?: z.objectOutputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    link?: string | undefined;
    spoiler?: boolean | undefined;
    content?: string | undefined;
    title?: string | undefined;
    linkWidth?: number | undefined;
    linkHeight?: number | undefined;
    linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
    parentCid?: string | undefined;
    thumbnailUrl?: string | undefined;
    thumbnailUrlWidth?: number | undefined;
    thumbnailUrlHeight?: number | undefined;
    previousCid?: string | undefined;
}, {
    timestamp: number;
    signature: {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    };
    author: {
        address: string;
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
    } & {
        [k: string]: unknown;
    };
    subplebbitAddress: string;
    protocolVersion: string;
    cid: string;
    depth: number;
    postCid: string;
    flair?: z.objectInputType<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    link?: string | undefined;
    spoiler?: boolean | undefined;
    content?: string | undefined;
    title?: string | undefined;
    linkWidth?: number | undefined;
    linkHeight?: number | undefined;
    linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
    parentCid?: string | undefined;
    thumbnailUrl?: string | undefined;
    thumbnailUrlWidth?: number | undefined;
    thumbnailUrlHeight?: number | undefined;
    previousCid?: string | undefined;
}>;
export declare const VotePubsubMessageWithSubplebbitAuthorSchema: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, {
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
}>, {
    signer: z.ZodObject<z.objectUtil.extendShape<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, {
        address: z.ZodString;
        publicKey: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
}>, {
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
}>, Pick<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
}>, {
    author: z.ZodObject<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">>;
}>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, {
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
}>, {
    signer: z.ZodObject<z.objectUtil.extendShape<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, {
        address: z.ZodString;
        publicKey: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
}>, {
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
}>, Pick<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
}>, {
    author: z.ZodObject<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">>;
}>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, {
    commentCid: z.ZodEffects<z.ZodString, string, string>;
    vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
}>, {
    signer: z.ZodObject<z.objectUtil.extendShape<{
        type: z.ZodEnum<["ed25519"]>;
        privateKey: z.ZodString;
    }, {
        address: z.ZodString;
        publicKey: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
        previousCommentCid?: string | undefined;
        displayName?: string | undefined;
        wallets?: Record<string, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
                type: "eip191";
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
                type: z.ZodEnum<["eip191"]>;
            }, "strip", z.ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
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
}>, {
    signature: z.ZodObject<{
        type: z.ZodEnum<["ed25519", "eip191"]>;
        signature: z.ZodString;
        publicKey: z.ZodString;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strip", z.ZodTypeAny, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519" | "eip191";
        publicKey: string;
        signature: string;
        signedPropertyNames: [string, ...string[]];
    }>;
}>, Pick<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, {
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
}>, {
    author: z.ZodObject<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
            timestamp: number;
            signature: {
                type: "eip191";
                signature: string;
            };
        }, {
            address: string;
            timestamp: number;
            signature: {
                type: "eip191";
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
    }, {
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
    }>, z.ZodTypeAny, "passthrough">>;
}>, z.ZodTypeAny, "passthrough">>;
export declare const ChallengeRequestMessageSchema: z.ZodObject<z.objectUtil.extendShape<{
    challengeRequestId: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    signature: z.ZodObject<{
        signature: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        publicKey: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519"]>;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }>;
    protocolVersion: z.ZodString;
    userAgent: z.ZodString;
    timestamp: z.ZodNumber;
}, {
    type: z.ZodEnum<["CHALLENGEREQUEST"]>;
    encrypted: z.ZodObject<{
        ciphertext: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        iv: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        tag: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }>;
    acceptedChallengeTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}>, "strict", z.ZodTypeAny, {
    type: "CHALLENGEREQUEST";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    encrypted: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    };
    acceptedChallengeTypes?: string[] | undefined;
}, {
    type: "CHALLENGEREQUEST";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    encrypted: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    };
    acceptedChallengeTypes?: string[] | undefined;
}>;
export declare const DecryptedChallengeRequestSchema: z.ZodObject<{
    publication: z.ZodUnion<[z.ZodUnion<[z.ZodObject<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, {
        commentCid: z.ZodEffects<z.ZodString, string, string>;
        vote: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<0>, z.ZodLiteral<-1>]>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, Pick<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "author" | "subplebbitAddress" | "protocolVersion" | "commentCid" | "vote">, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
    }>, "strict", z.ZodTypeAny, {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, z.ZodObject<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, {
        commentCid: z.ZodEffects<z.ZodString, string, string>;
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        commentAuthor: z.ZodOptional<z.ZodObject<Pick<{
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
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, {
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
        reason: z.ZodOptional<z.ZodString>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "reason" | "commentCid" | "spoiler" | "content" | "deleted">, Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, {
        commentCid: z.ZodEffects<z.ZodString, string, string>;
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
        pinned: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodBoolean>;
        removed: z.ZodOptional<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        commentAuthor: z.ZodOptional<z.ZodObject<Pick<{
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
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, {
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
        reason: z.ZodOptional<z.ZodString>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "removed" | "reason" | "commentCid" | "spoiler" | "pinned" | "locked" | "commentAuthor">>, "strict", z.ZodTypeAny, {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        removed?: boolean | undefined;
        reason?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        commentAuthor?: z.objectOutputType<Pick<{
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
        deleted?: boolean | undefined;
    }, {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        removed?: boolean | undefined;
        reason?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        commentAuthor?: z.objectInputType<Pick<{
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
        deleted?: boolean | undefined;
    }>]>, z.ZodObject<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
        content: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        link: z.ZodOptional<z.ZodString>;
        linkWidth: z.ZodOptional<z.ZodNumber>;
        linkHeight: z.ZodOptional<z.ZodNumber>;
        linkHtmlTagName: z.ZodOptional<z.ZodEnum<["a", "img", "video", "audio"]>>;
        parentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, Pick<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "link" | "spoiler" | "content" | "title" | "linkWidth" | "linkHeight" | "linkHtmlTagName" | "parentCid">, "strict", z.ZodTypeAny, {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        link?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        title?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
        parentCid?: string | undefined;
    }, {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        link?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        title?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
        parentCid?: string | undefined;
    }>]>;
    challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, "strip", z.ZodTypeAny, {
    publication: {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    } | {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        link?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        title?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
        parentCid?: string | undefined;
    } | {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
        flair?: z.objectOutputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        removed?: boolean | undefined;
        reason?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        commentAuthor?: z.objectOutputType<Pick<{
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
        deleted?: boolean | undefined;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}, {
    publication: {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    } | {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        link?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        title?: string | undefined;
        linkWidth?: number | undefined;
        linkHeight?: number | undefined;
        linkHtmlTagName?: "audio" | "video" | "a" | "img" | undefined;
        parentCid?: string | undefined;
    } | {
        timestamp: number;
        signature: {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        };
        author: {
            address: string;
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
        subplebbitAddress: string;
        protocolVersion: string;
        commentCid: string;
        flair?: z.objectInputType<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        removed?: boolean | undefined;
        reason?: string | undefined;
        spoiler?: boolean | undefined;
        content?: string | undefined;
        pinned?: boolean | undefined;
        locked?: boolean | undefined;
        commentAuthor?: z.objectInputType<Pick<{
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
        deleted?: boolean | undefined;
    };
    challengeAnswers?: [string, ...string[]] | undefined;
    challengeCommentCids?: string[] | undefined;
}>;
export declare const ChallengeRequestMessageSignedPropertyNames: ("type" | "timestamp" | "protocolVersion" | "userAgent" | "challengeRequestId" | "encrypted" | "acceptedChallengeTypes")[];
export declare const ChallengeInChallengePubsubMessageSchema: z.ZodObject<{
    challenge: z.ZodString;
    type: z.ZodLazy<z.ZodString>;
    caseInsensitive: z.ZodLazy<z.ZodOptional<z.ZodBoolean>>;
}, "strict", z.ZodTypeAny, {
    type: string;
    challenge: string;
    caseInsensitive?: boolean | undefined;
}, {
    type: string;
    challenge: string;
    caseInsensitive?: boolean | undefined;
}>;
export declare const ChallengeMessageSchema: z.ZodObject<z.objectUtil.extendShape<{
    challengeRequestId: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    signature: z.ZodObject<{
        signature: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        publicKey: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519"]>;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }>;
    protocolVersion: z.ZodString;
    userAgent: z.ZodString;
    timestamp: z.ZodNumber;
}, {
    type: z.ZodEnum<["CHALLENGE"]>;
    encrypted: z.ZodObject<{
        ciphertext: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        iv: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        tag: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }>;
}>, "strict", z.ZodTypeAny, {
    type: "CHALLENGE";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    encrypted: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    };
}, {
    type: "CHALLENGE";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    encrypted: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    };
}>;
export declare const DecryptedChallengeSchema: z.ZodObject<{
    challenges: z.ZodArray<z.ZodObject<{
        challenge: z.ZodString;
        type: z.ZodLazy<z.ZodString>;
        caseInsensitive: z.ZodLazy<z.ZodOptional<z.ZodBoolean>>;
    }, "strict", z.ZodTypeAny, {
        type: string;
        challenge: string;
        caseInsensitive?: boolean | undefined;
    }, {
        type: string;
        challenge: string;
        caseInsensitive?: boolean | undefined;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    challenges: {
        type: string;
        challenge: string;
        caseInsensitive?: boolean | undefined;
    }[];
}, {
    challenges: {
        type: string;
        challenge: string;
        caseInsensitive?: boolean | undefined;
    }[];
}>;
export declare const ChallengeMessageSignedPropertyNames: ("type" | "timestamp" | "protocolVersion" | "userAgent" | "challengeRequestId" | "encrypted")[];
export declare const ChallengeAnswerMessageSchema: z.ZodObject<z.objectUtil.extendShape<{
    challengeRequestId: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    signature: z.ZodObject<{
        signature: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        publicKey: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519"]>;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }>;
    protocolVersion: z.ZodString;
    userAgent: z.ZodString;
    timestamp: z.ZodNumber;
}, {
    type: z.ZodEnum<["CHALLENGEANSWER"]>;
    encrypted: z.ZodObject<{
        ciphertext: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        iv: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        tag: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }>;
}>, "strict", z.ZodTypeAny, {
    type: "CHALLENGEANSWER";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    encrypted: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    };
}, {
    type: "CHALLENGEANSWER";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    encrypted: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    };
}>;
export declare const DecryptedChallengeAnswerSchema: z.ZodObject<{
    challengeAnswers: z.ZodArray<z.ZodString, "atleastone">;
}, "strict", z.ZodTypeAny, {
    challengeAnswers: [string, ...string[]];
}, {
    challengeAnswers: [string, ...string[]];
}>;
export declare const ChallengeAnswerMessageSignedPropertyNames: ("type" | "timestamp" | "protocolVersion" | "userAgent" | "challengeRequestId" | "encrypted")[];
export declare const ChallengeVerificationMessageSchema: z.ZodObject<z.objectUtil.extendShape<{
    challengeRequestId: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
    signature: z.ZodObject<{
        signature: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        publicKey: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519"]>;
        signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }, {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    }>;
    protocolVersion: z.ZodString;
    userAgent: z.ZodString;
    timestamp: z.ZodNumber;
}, {
    type: z.ZodEnum<["CHALLENGEVERIFICATION"]>;
    challengeSuccess: z.ZodBoolean;
    challengeErrors: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodUndefined]>, "many">>;
    reason: z.ZodOptional<z.ZodString>;
    encrypted: z.ZodOptional<z.ZodObject<{
        ciphertext: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        iv: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        tag: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>;
        type: z.ZodEnum<["ed25519-aes-gcm"]>;
    }, "strict", z.ZodTypeAny, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }, {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    }>>;
}>, "strict", z.ZodTypeAny, {
    type: "CHALLENGEVERIFICATION";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    challengeSuccess: boolean;
    encrypted?: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    } | undefined;
    challengeErrors?: (string | undefined)[] | undefined;
    reason?: string | undefined;
}, {
    type: "CHALLENGEVERIFICATION";
    timestamp: number;
    signature: {
        type: "ed25519";
        publicKey: Uint8Array;
        signature: Uint8Array;
        signedPropertyNames: [string, ...string[]];
    };
    protocolVersion: string;
    userAgent: string;
    challengeRequestId: Uint8Array;
    challengeSuccess: boolean;
    encrypted?: {
        type: "ed25519-aes-gcm";
        ciphertext: Uint8Array;
        iv: Uint8Array;
        tag: Uint8Array;
    } | undefined;
    challengeErrors?: (string | undefined)[] | undefined;
    reason?: string | undefined;
}>;
export declare const DecryptedChallengeVerificationSchema: z.ZodObject<{
    publication: z.ZodOptional<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
        content: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        link: z.ZodOptional<z.ZodString>;
        linkWidth: z.ZodOptional<z.ZodNumber>;
        linkHeight: z.ZodOptional<z.ZodNumber>;
        linkHtmlTagName: z.ZodOptional<z.ZodEnum<["a", "img", "video", "audio"]>>;
        parentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, Pick<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "link" | "spoiler" | "content" | "title" | "linkWidth" | "linkHeight" | "linkHtmlTagName" | "parentCid">, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
    }>, {
        depth: z.ZodNumber;
        postCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        thumbnailUrlWidth: z.ZodOptional<z.ZodNumber>;
        thumbnailUrlHeight: z.ZodOptional<z.ZodNumber>;
        previousCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }>, {
        cid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        postCid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        author: z.ZodObject<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">>;
    }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
        content: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        link: z.ZodOptional<z.ZodString>;
        linkWidth: z.ZodOptional<z.ZodNumber>;
        linkHeight: z.ZodOptional<z.ZodNumber>;
        linkHtmlTagName: z.ZodOptional<z.ZodEnum<["a", "img", "video", "audio"]>>;
        parentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, Pick<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "link" | "spoiler" | "content" | "title" | "linkWidth" | "linkHeight" | "linkHtmlTagName" | "parentCid">, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
    }>, {
        depth: z.ZodNumber;
        postCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        thumbnailUrlWidth: z.ZodOptional<z.ZodNumber>;
        thumbnailUrlHeight: z.ZodOptional<z.ZodNumber>;
        previousCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }>, {
        cid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        postCid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        author: z.ZodObject<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">>;
    }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
        content: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        link: z.ZodOptional<z.ZodString>;
        linkWidth: z.ZodOptional<z.ZodNumber>;
        linkHeight: z.ZodOptional<z.ZodNumber>;
        linkHtmlTagName: z.ZodOptional<z.ZodEnum<["a", "img", "video", "audio"]>>;
        parentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, Pick<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "link" | "spoiler" | "content" | "title" | "linkWidth" | "linkHeight" | "linkHtmlTagName" | "parentCid">, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
    }>, {
        depth: z.ZodNumber;
        postCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        thumbnailUrlWidth: z.ZodOptional<z.ZodNumber>;
        thumbnailUrlHeight: z.ZodOptional<z.ZodNumber>;
        previousCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }>, {
        cid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        postCid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        author: z.ZodObject<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">>;
    }>, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    publication?: z.objectOutputType<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
        content: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        link: z.ZodOptional<z.ZodString>;
        linkWidth: z.ZodOptional<z.ZodNumber>;
        linkHeight: z.ZodOptional<z.ZodNumber>;
        linkHtmlTagName: z.ZodOptional<z.ZodEnum<["a", "img", "video", "audio"]>>;
        parentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, Pick<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "link" | "spoiler" | "content" | "title" | "linkWidth" | "linkHeight" | "linkHtmlTagName" | "parentCid">, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
    }>, {
        depth: z.ZodNumber;
        postCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        thumbnailUrlWidth: z.ZodOptional<z.ZodNumber>;
        thumbnailUrlHeight: z.ZodOptional<z.ZodNumber>;
        previousCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }>, {
        cid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        postCid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        author: z.ZodObject<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">>;
    }>, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    publication?: z.objectInputType<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<Pick<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
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
        content: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        link: z.ZodOptional<z.ZodString>;
        linkWidth: z.ZodOptional<z.ZodNumber>;
        linkHeight: z.ZodOptional<z.ZodNumber>;
        linkHtmlTagName: z.ZodOptional<z.ZodEnum<["a", "img", "video", "audio"]>>;
        parentCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }>, {
        signer: z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodEnum<["ed25519"]>;
            privateKey: z.ZodString;
        }, {
            address: z.ZodString;
            publicKey: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
            previousCommentCid?: string | undefined;
            displayName?: string | undefined;
            wallets?: Record<string, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
                    type: "eip191";
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
                    type: z.ZodEnum<["eip191"]>;
                }, "strip", z.ZodTypeAny, {
                    type: "eip191";
                    signature: string;
                }, {
                    type: "eip191";
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
    }>, {
        signature: z.ZodObject<{
            type: z.ZodEnum<["ed25519", "eip191"]>;
            signature: z.ZodString;
            publicKey: z.ZodString;
            signedPropertyNames: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }, {
            type: "ed25519" | "eip191";
            publicKey: string;
            signature: string;
            signedPropertyNames: [string, ...string[]];
        }>;
    }>, Pick<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    }, "challengeAnswers" | "challengeCommentCids">>, "timestamp" | "signature" | "flair" | "author" | "subplebbitAddress" | "protocolVersion" | "link" | "spoiler" | "content" | "title" | "linkWidth" | "linkHeight" | "linkHtmlTagName" | "parentCid">, {
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
    }>, {
        depth: z.ZodNumber;
        postCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        thumbnailUrlWidth: z.ZodOptional<z.ZodNumber>;
        thumbnailUrlHeight: z.ZodOptional<z.ZodNumber>;
        previousCid: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }>, {
        cid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        postCid: z.ZodEffects<z.ZodString, string, string>;
    }>, {
        author: z.ZodObject<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, "passthrough", z.ZodTypeAny, z.objectOutputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">, z.objectInputType<z.objectUtil.extendShape<{
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
                timestamp: number;
                signature: {
                    type: "eip191";
                    signature: string;
                };
            }, {
                address: string;
                timestamp: number;
                signature: {
                    type: "eip191";
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
        }, {
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
        }>, z.ZodTypeAny, "passthrough">>;
    }>, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const ChallengeVerificationMessageSignedPropertyNames: ("type" | "timestamp" | "protocolVersion" | "userAgent" | "challengeRequestId" | "encrypted" | "challengeSuccess" | "challengeErrors" | "reason")[];
