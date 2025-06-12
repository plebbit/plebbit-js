declare const PlebbitJs: {
    Plebbit: {
        (plebbitOptions?: import("../../../../types.js").InputPlebbitOptions): Promise<import("../../../../plebbit/plebbit.js").Plebbit>;
        setNativeFunctions: (newNativeFunctions: Partial<import("../../../../types.js").NativeFunctions>) => void;
        nativeFunctions: {
            node: import("../../../../types.js").NativeFunctions;
            browser: import("../../../../types.js").NativeFunctions;
        };
        getShortCid: typeof import("../../../../util.js").shortifyCid;
        getShortAddress: typeof import("../../../../util.js").shortifyAddress;
        challenges: Record<string, (args_0: {
            path?: string | undefined;
            options?: Record<string, string> | undefined;
            exclude?: [import("zod").objectInputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectInputType<{
                subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                    addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                    maxCommentCids: import("zod").ZodNumber;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, "strict", import("zod").ZodTypeAny, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }, {
                    addresses: [string, ...string[]];
                    maxCommentCids: number;
                    postScore?: number | undefined;
                    replyScore?: number | undefined;
                    firstCommentTimestamp?: number | undefined;
                }>>;
                postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>>;
            }, import("zod").ZodTypeAny, "passthrough">[]] | undefined;
            description?: string | undefined;
            name?: string | undefined;
        }, ...args: unknown[]) => {
            type: string;
            getChallenge: (args_0: {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectInputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">>>;
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectInputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "atleastone">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: [string, ...string[]];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodEnum<["owner", "admin", "moderator"]>, import("zod").ZodString]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    publicationType: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodObject<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">>, import("zod").objectOutputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                        post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentEdit: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        commentModeration: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod").ZodTypeAny, "passthrough">>>;
                }, import("zod").ZodTypeAny, "passthrough">[]] | undefined;
                description?: string | undefined;
                name?: string | undefined;
            }, args_1: import("../../../../pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, args_2: number, args_3: import("../../../../runtime/node/subplebbit/local-subplebbit.js").LocalSubplebbit, ...args: unknown[]) => Promise<{
                success: true;
            } | {
                success: false;
                error: string;
            } | {
                type: string;
                challenge: string;
                verify: (args_0: string, ...args: unknown[]) => Promise<{
                    success: true;
                } | {
                    success: false;
                    error: string;
                }>;
                caseInsensitive?: boolean | undefined;
            }>;
            description?: string | undefined;
            optionInputs?: [import("zod").objectOutputType<{
                option: import("zod").ZodString;
                label: import("zod").ZodString;
                default: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                placeholder: import("zod").ZodOptional<import("zod").ZodString>;
                required: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
                option: import("zod").ZodString;
                label: import("zod").ZodString;
                default: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                placeholder: import("zod").ZodOptional<import("zod").ZodString>;
                required: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">[]] | undefined;
            challenge?: string | undefined;
            caseInsensitive?: boolean | undefined;
        }>;
    };
};
/**
 * replace PlebbitJs with a different implementation, for
 * example to mock it during unit tests, to add mock content
 * for developing the front-end or to add a PlebbitJs with
 * desktop privileges in the Electron build.
 */
export declare function setPlebbitJs(_Plebbit: any): void;
export declare function restorePlebbitJs(): void;
export default PlebbitJs;
