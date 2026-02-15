declare const PlebbitJs: {
    Plebbit: {
        (plebbitOptions?: import("../../../../types.js").InputPlebbitOptions): Promise<import("../../../../plebbit/plebbit.js").Plebbit>;
        setNativeFunctions: (newNativeFunctions: Partial<import("../../../../types.js").NativeFunctions>) => void;
        nativeFunctions: {
            node: import("../../../../types.js").NativeFunctions;
            browser: import("../../../../types.js").NativeFunctions;
        };
        getShortCid: (params: import("../../../../clients/rpc-client/types.js").CidRpcParam) => string;
        getShortAddress: (params: import("../../../../clients/rpc-client/types.js").AuthorAddressRpcParam) => string;
        challenges: Record<string, import("zod/v4/core").$InferInnerFunctionType<import("zod").ZodTuple<readonly [import("zod").ZodObject<{
            challengeSettings: import("zod").ZodObject<{
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
                    postCount: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyCount: import("zod").ZodOptional<import("zod").ZodNumber>;
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
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strip>], null>, import("zod").ZodObject<{
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
                challengeSettings: import("zod").ZodObject<{
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
                        postCount: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyCount: import("zod").ZodOptional<import("zod").ZodNumber>;
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
                }, import("zod/v4/core").$strict>;
                challengeRequestMessage: import("zod").ZodCustom<import("../../../../pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, import("../../../../pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>;
                challengeIndex: import("zod").ZodNumber;
                subplebbit: import("zod").ZodCustom<import("../../../../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit, import("../../../../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit>;
            }, import("zod/v4/core").$strip>], null>, import("zod").ZodPromise<import("zod").ZodUnion<[import("zod").ZodObject<{
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
