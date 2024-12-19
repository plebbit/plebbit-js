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
    challenges: Record<string, (args_0: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        exclude?: import("zod").objectInputType<{
            subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                maxCommentCids: import("zod").ZodNumber;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, "strict", import("zod").ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
            post: import("zod").ZodOptional<import("zod").ZodBoolean>;
            reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
            vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
            role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
            rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
        description?: string | undefined;
        name?: string | undefined;
    }, ...args_1: unknown[]) => {
        type: string;
        getChallenge: (args_0: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: import("zod").objectInputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: string[];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }, args_1: import("./pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, args_2: number, args_3: import("./runtime/node/subplebbit/local-subplebbit.js").LocalSubplebbit, ...args_4: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        } | {
            type: string;
            challenge: string;
            verify: (args_0: string, ...args_1: unknown[]) => Promise<{
                success: true;
            } | {
                error: string;
                success: false;
            }>;
        }>;
        description?: string | undefined;
        optionInputs?: import("zod").objectOutputType<{
            option: import("zod").ZodString;
            label: import("zod").ZodString;
            default: import("zod").ZodOptional<import("zod").ZodString>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            placeholder: import("zod").ZodOptional<import("zod").ZodString>;
            required: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
        challenge?: string | undefined;
        caseInsensitive?: boolean | undefined;
    }>;
};
export default Plebbit;
export declare const setNativeFunctions: (newNativeFunctions: Partial<import("./types.js").NativeFunctions>) => void;
export declare const nativeFunctions: {
    node: import("./types.js").NativeFunctions;
    browser: import("./types.js").NativeFunctions;
};
export declare const getShortCid: typeof shortifyCid;
export declare const getShortAddress: typeof shortifyAddress;
export declare const challenges: Record<string, (args_0: {
    path?: string | undefined;
    options?: Record<string, string> | undefined;
    exclude?: import("zod").objectInputType<{
        subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
            addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
            maxCommentCids: import("zod").ZodNumber;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "strict", import("zod").ZodTypeAny, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }, {
            addresses: string[];
            maxCommentCids: number;
            postScore?: number | undefined;
            replyScore?: number | undefined;
            firstCommentTimestamp?: number | undefined;
        }>>;
        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
        challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
        role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
        address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
        rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
    description?: string | undefined;
    name?: string | undefined;
}, ...args_1: unknown[]) => {
    type: string;
    getChallenge: (args_0: {
        path?: string | undefined;
        options?: Record<string, string> | undefined;
        exclude?: import("zod").objectInputType<{
            subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                maxCommentCids: import("zod").ZodNumber;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, "strict", import("zod").ZodTypeAny, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }, {
                addresses: string[];
                maxCommentCids: number;
                postScore?: number | undefined;
                replyScore?: number | undefined;
                firstCommentTimestamp?: number | undefined;
            }>>;
            postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
            firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
            post: import("zod").ZodOptional<import("zod").ZodBoolean>;
            reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
            vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
            role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
            address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
            rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
        description?: string | undefined;
        name?: string | undefined;
    }, args_1: import("./pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, args_2: number, args_3: import("./runtime/node/subplebbit/local-subplebbit.js").LocalSubplebbit, ...args_4: unknown[]) => Promise<{
        success: true;
    } | {
        error: string;
        success: false;
    } | {
        type: string;
        challenge: string;
        verify: (args_0: string, ...args_1: unknown[]) => Promise<{
            success: true;
        } | {
            error: string;
            success: false;
        }>;
    }>;
    description?: string | undefined;
    optionInputs?: import("zod").objectOutputType<{
        option: import("zod").ZodString;
        label: import("zod").ZodString;
        default: import("zod").ZodOptional<import("zod").ZodString>;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        placeholder: import("zod").ZodOptional<import("zod").ZodString>;
        required: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
    challenge?: string | undefined;
    caseInsensitive?: boolean | undefined;
}>;
