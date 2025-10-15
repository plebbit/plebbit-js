import "./zod-error-map.js";
import * as PlebbitClass from "./plebbit/plebbit.js";
import type { InputPlebbitOptions } from "./types.js";
import { shortifyAddress, shortifyCid } from "./util.js";
declare const Plebbit: {
    (plebbitOptions?: InputPlebbitOptions): Promise<PlebbitClass.Plebbit>;
    setNativeFunctions: (newNativeFunctions: Partial<import("./types.js").NativeFunctions>) => void;
    nativeFunctions: {
        node: import("./types.js").NativeFunctions;
        browser: import("./types.js").NativeFunctions;
    };
    getShortCid: typeof shortifyCid;
    getShortAddress: typeof shortifyAddress;
    challenges: Record<string, import("zod/v4/core").$InferInnerFunctionType<import("zod").ZodTuple<readonly [import("zod").ZodObject<{
        path: import("zod").ZodOptional<import("zod").ZodString>;
        name: import("zod").ZodOptional<import("zod").ZodString>;
        options: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
        exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                addresses: import("zod").ZodArray<import("zod").ZodString>;
                maxCommentCids: import("zod").ZodNumber;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod/v4/core").$strict>>;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
            role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<{
                owner: "owner";
                admin: "admin";
                moderator: "moderator";
            }>, import("zod").ZodString]>>>;
            address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
            rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
            rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
            publicationType: import("zod").ZodOptional<import("zod").ZodObject<{
                post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                subplebbitEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod/v4/core").$loose>>;
        }, import("zod/v4/core").$loose>>>;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        pendingApproval: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod/v4/core").$strict>], null>, import("zod").ZodObject<{
        optionInputs: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            option: import("zod").ZodString;
            label: import("zod").ZodString;
            default: import("zod").ZodOptional<import("zod").ZodString>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            placeholder: import("zod").ZodOptional<import("zod").ZodString>;
            required: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod/v4/core").$loose>>>;
        type: import("zod").ZodString;
        challenge: import("zod").ZodOptional<import("zod").ZodString>;
        caseInsensitive: import("zod").ZodOptional<import("zod").ZodBoolean>;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        getChallenge: import("zod").ZodFunction<import("zod").ZodTuple<readonly [import("zod").ZodObject<{
            path: import("zod").ZodOptional<import("zod").ZodString>;
            name: import("zod").ZodOptional<import("zod").ZodString>;
            options: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
            exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString>;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod/v4/core").$strict>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<{
                    owner: "owner";
                    admin: "admin";
                    moderator: "moderator";
                }>, import("zod").ZodString]>>>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    subplebbitEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod/v4/core").$loose>>;
            }, import("zod/v4/core").$loose>>>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            pendingApproval: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod/v4/core").$strict>, import("zod").ZodCustom<import("./pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, import("./pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>, import("zod").ZodNumber, import("zod").ZodCustom<import("./runtime/node/subplebbit/local-subplebbit.js").LocalSubplebbit, import("./runtime/node/subplebbit/local-subplebbit.js").LocalSubplebbit>], null>, import("zod").ZodPromise<import("zod").ZodUnion<[import("zod").ZodObject<{
            challenge: import("zod").ZodString;
            verify: import("zod").ZodFunction<import("zod").ZodTuple<readonly [import("zod").ZodLazy<import("zod").ZodString>], null>, import("zod").ZodPromise<import("zod").ZodUnion<[import("zod").ZodObject<{
                success: import("zod").ZodLiteral<true>;
            }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                success: import("zod").ZodLiteral<false>;
                error: import("zod").ZodString;
            }, import("zod/v4/core").$strip>]>>>;
            type: import("zod").ZodString;
            caseInsensitive: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod/v4/core").$strict>, import("zod").ZodUnion<[import("zod").ZodObject<{
            success: import("zod").ZodLiteral<true>;
        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
            success: import("zod").ZodLiteral<false>;
            error: import("zod").ZodString;
        }, import("zod/v4/core").$strip>]>]>>>;
    }, import("zod/v4/core").$strict>>>;
};
export default Plebbit;
export declare const setNativeFunctions: (newNativeFunctions: Partial<import("./types.js").NativeFunctions>) => void;
export declare const nativeFunctions: {
    node: import("./types.js").NativeFunctions;
    browser: import("./types.js").NativeFunctions;
};
export declare const getShortCid: typeof shortifyCid;
export declare const getShortAddress: typeof shortifyAddress;
export declare const challenges: Record<string, import("zod/v4/core").$InferInnerFunctionType<import("zod").ZodTuple<readonly [import("zod").ZodObject<{
    path: import("zod").ZodOptional<import("zod").ZodString>;
    name: import("zod").ZodOptional<import("zod").ZodString>;
    options: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
    exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
        subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
            addresses: import("zod").ZodArray<import("zod").ZodString>;
            maxCommentCids: import("zod").ZodNumber;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod/v4/core").$strict>>;
        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
        challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
        role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<{
            owner: "owner";
            admin: "admin";
            moderator: "moderator";
        }>, import("zod").ZodString]>>>;
        address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
        rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
        rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
        publicationType: import("zod").ZodOptional<import("zod").ZodObject<{
            post: import("zod").ZodOptional<import("zod").ZodBoolean>;
            reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
            vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
            commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
            commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
            subplebbitEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod/v4/core").$loose>>;
    }, import("zod/v4/core").$loose>>>;
    description: import("zod").ZodOptional<import("zod").ZodString>;
    pendingApproval: import("zod").ZodOptional<import("zod").ZodBoolean>;
}, import("zod/v4/core").$strict>], null>, import("zod").ZodObject<{
    optionInputs: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
        option: import("zod").ZodString;
        label: import("zod").ZodString;
        default: import("zod").ZodOptional<import("zod").ZodString>;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        placeholder: import("zod").ZodOptional<import("zod").ZodString>;
        required: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod/v4/core").$loose>>>;
    type: import("zod").ZodString;
    challenge: import("zod").ZodOptional<import("zod").ZodString>;
    caseInsensitive: import("zod").ZodOptional<import("zod").ZodBoolean>;
    description: import("zod").ZodOptional<import("zod").ZodString>;
    getChallenge: import("zod").ZodFunction<import("zod").ZodTuple<readonly [import("zod").ZodObject<{
        path: import("zod").ZodOptional<import("zod").ZodString>;
        name: import("zod").ZodOptional<import("zod").ZodString>;
        options: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
        exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                addresses: import("zod").ZodArray<import("zod").ZodString>;
                maxCommentCids: import("zod").ZodNumber;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod/v4/core").$strict>>;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
            role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<{
                owner: "owner";
                admin: "admin";
                moderator: "moderator";
            }>, import("zod").ZodString]>>>;
            address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
            rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
            rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
            publicationType: import("zod").ZodOptional<import("zod").ZodObject<{
                post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                subplebbitEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod/v4/core").$loose>>;
        }, import("zod/v4/core").$loose>>>;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        pendingApproval: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod/v4/core").$strict>, import("zod").ZodCustom<import("./pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, import("./pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>, import("zod").ZodNumber, import("zod").ZodCustom<import("./runtime/node/subplebbit/local-subplebbit.js").LocalSubplebbit, import("./runtime/node/subplebbit/local-subplebbit.js").LocalSubplebbit>], null>, import("zod").ZodPromise<import("zod").ZodUnion<[import("zod").ZodObject<{
        challenge: import("zod").ZodString;
        verify: import("zod").ZodFunction<import("zod").ZodTuple<readonly [import("zod").ZodLazy<import("zod").ZodString>], null>, import("zod").ZodPromise<import("zod").ZodUnion<[import("zod").ZodObject<{
            success: import("zod").ZodLiteral<true>;
        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
            success: import("zod").ZodLiteral<false>;
            error: import("zod").ZodString;
        }, import("zod/v4/core").$strip>]>>>;
        type: import("zod").ZodString;
        caseInsensitive: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod/v4/core").$strict>, import("zod").ZodUnion<[import("zod").ZodObject<{
        success: import("zod").ZodLiteral<true>;
    }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
        success: import("zod").ZodLiteral<false>;
        error: import("zod").ZodString;
    }, import("zod/v4/core").$strip>]>]>>>;
}, import("zod/v4/core").$strict>>>;
