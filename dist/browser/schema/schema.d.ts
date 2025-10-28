import { z } from "zod";
export declare const CreateSignerSchema: z.ZodObject<{
    type: z.ZodEnum<{
        ed25519: "ed25519";
    }>;
    privateKey: z.ZodString;
}, z.core.$strip>;
export declare const SignerWithAddressPublicKeySchema: z.ZodObject<{
    type: z.ZodEnum<{
        ed25519: "ed25519";
    }>;
    privateKey: z.ZodString;
    address: z.ZodString;
    publicKey: z.ZodString;
}, z.core.$strip>;
export declare const SignerWithAddressPublicKeyShortAddressSchema: z.ZodObject<{
    type: z.ZodEnum<{
        ed25519: "ed25519";
    }>;
    privateKey: z.ZodString;
    address: z.ZodString;
    publicKey: z.ZodString;
    shortAddress: z.ZodString;
}, z.core.$strip>;
export declare const SubplebbitAddressSchema: z.ZodString;
export declare const AuthorAddressSchema: z.ZodString;
export declare const PlebbitTimestampSchema: z.ZodNumber;
export declare const ProtocolVersionSchema: z.ZodString;
export declare const UserAgentSchema: z.ZodString;
export declare const CidStringSchema: z.ZodString;
export declare const CidPathSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare const AuthorAvatarNftSchema: z.ZodObject<{
    chainTicker: z.ZodString;
    address: z.ZodString;
    id: z.ZodString;
    timestamp: z.ZodNumber;
    signature: z.ZodObject<{
        signature: z.ZodString;
        type: z.ZodString;
    }, z.core.$strip>;
}, z.core.$loose>;
export declare const FlairSchema: z.ZodObject<{
    text: z.ZodString;
    backgroundColor: z.ZodOptional<z.ZodString>;
    textColor: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export declare const AuthorPubsubSchema: z.ZodObject<{
    address: z.ZodString;
    previousCommentCid: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    wallets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        address: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
    avatar: z.ZodOptional<z.ZodObject<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$loose>>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>>;
}, z.core.$strict>;
export declare const ChallengeAnswerStringSchema: z.ZodString;
export declare const ChallengeAnswersSchema: z.ZodArray<z.ZodString>;
export declare const CreatePublicationUserOptionsSchema: z.ZodObject<{
    signer: z.ZodObject<{
        type: z.ZodEnum<{
            ed25519: "ed25519";
        }>;
        privateKey: z.ZodString;
    }, z.core.$strip>;
    author: z.ZodOptional<z.ZodObject<{
        address: z.ZodOptional<z.ZodString>;
        previousCommentCid: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        wallets: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>>>;
        avatar: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$loose>>>;
        flair: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>;
    subplebbitAddress: z.ZodString;
    protocolVersion: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodNumber>;
    challengeRequest: z.ZodOptional<z.ZodObject<{
        challengeAnswers: z.ZodOptional<z.ZodArray<z.ZodString>>;
        challengeCommentCids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const JsonSignatureSchema: z.ZodObject<{
    type: z.ZodString;
    signature: z.ZodString;
    publicKey: z.ZodString;
    signedPropertyNames: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const PublicationBaseBeforeSigning: z.ZodObject<{
    signer: z.ZodObject<{
        type: z.ZodEnum<{
            ed25519: "ed25519";
        }>;
        privateKey: z.ZodString;
        address: z.ZodString;
        publicKey: z.ZodString;
    }, z.core.$strip>;
    timestamp: z.ZodNumber;
    author: z.ZodObject<{
        address: z.ZodString;
        previousCommentCid: z.ZodOptional<z.ZodString>;
        displayName: z.ZodOptional<z.ZodString>;
        wallets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            address: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>>;
        avatar: z.ZodOptional<z.ZodObject<{
            chainTicker: z.ZodString;
            address: z.ZodString;
            id: z.ZodString;
            timestamp: z.ZodNumber;
            signature: z.ZodObject<{
                signature: z.ZodString;
                type: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$loose>>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$strict>;
    protocolVersion: z.ZodString;
}, z.core.$strip>;
export declare const SubplebbitAuthorSchema: z.ZodObject<{
    postScore: z.ZodNumber;
    replyScore: z.ZodNumber;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>>;
    firstCommentTimestamp: z.ZodNumber;
    lastCommentCid: z.ZodString;
}, z.core.$loose>;
export declare const CommentAuthorSchema: z.ZodObject<{
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>>;
    banExpiresAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export declare const AuthorWithOptionalCommentUpdateSchema: z.ZodObject<{
    address: z.ZodString;
    previousCommentCid: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    wallets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        address: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
    avatar: z.ZodOptional<z.ZodObject<{
        chainTicker: z.ZodString;
        address: z.ZodString;
        id: z.ZodString;
        timestamp: z.ZodNumber;
        signature: z.ZodObject<{
            signature: z.ZodString;
            type: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$loose>>;
    flair: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>>;
    subplebbit: z.ZodOptional<z.ZodObject<{
        postScore: z.ZodNumber;
        replyScore: z.ZodNumber;
        banExpiresAt: z.ZodOptional<z.ZodNumber>;
        flair: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            backgroundColor: z.ZodOptional<z.ZodString>;
            textColor: z.ZodOptional<z.ZodString>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
        firstCommentTimestamp: z.ZodNumber;
        lastCommentCid: z.ZodString;
    }, z.core.$loose>>;
}, z.core.$strict>;
export declare const AuthorReservedFields: string[];
