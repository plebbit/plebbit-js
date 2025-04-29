export declare const CreateSubplebbitEditPublicationOptionsSchema: import("zod").ZodObject<{
    signer: import("zod").ZodObject<{
        type: import("zod").ZodEnum<["ed25519"]>;
        privateKey: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        type: "ed25519";
        privateKey: string;
    }, {
        type: "ed25519";
        privateKey: string;
    }>;
    author: import("zod").ZodOptional<import("zod").ZodObject<{
        address: import("zod").ZodOptional<import("zod").ZodString>;
        previousCommentCid: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodString, string, string>>>;
        displayName: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        wallets: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
            address: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
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
        avatar: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        flair: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
    }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
        address: import("zod").ZodOptional<import("zod").ZodString>;
        previousCommentCid: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodString, string, string>>>;
        displayName: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        wallets: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
            address: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
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
        avatar: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        flair: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
    }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
        address: import("zod").ZodOptional<import("zod").ZodString>;
        previousCommentCid: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodString, string, string>>>;
        displayName: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        wallets: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
            address: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
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
        avatar: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        flair: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
    }, import("zod").ZodTypeAny, "passthrough">>>;
    subplebbitAddress: import("zod").ZodString;
    protocolVersion: import("zod").ZodOptional<import("zod").ZodString>;
    timestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
    challengeRequest: import("zod").ZodOptional<import("zod").ZodObject<{
        challengeAnswers: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "atleastone">>;
        challengeCommentCids: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEffects<import("zod").ZodString, string, string>, "many">>;
    }, "strip", import("zod").ZodTypeAny, {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    }, {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    }>>;
} & {
    subplebbitEdit: import("zod").ZodObject<{
        address: import("zod").ZodOptional<import("zod").ZodString>;
        description: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        title: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        pubsubTopic: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        rules: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>>;
        features: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        suggested: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        flairs: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodArray<import("zod").ZodObject<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">>, "many">>>>;
        settings: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            fetchThumbnailUrls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            fetchThumbnailUrlsProxyUrl: import("zod").ZodOptional<import("zod").ZodString>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEffects<import("zod").ZodObject<{
                path: import("zod").ZodOptional<import("zod").ZodString>;
                name: import("zod").ZodOptional<import("zod").ZodString>;
                options: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
                exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">>, "atleastone">>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strict", import("zod").ZodTypeAny, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }, {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }>, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }, {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }>, "many">>;
        }, "strict", import("zod").ZodTypeAny, {
            challenges?: {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        }, {
            challenges?: {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        }>>>;
        roles: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<[import("zod").ZodObject<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough">>, import("zod").ZodUndefined]>>>>;
    }, "strict", import("zod").ZodTypeAny, {
        address?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        pubsubTopic?: string | undefined;
        roles?: Record<string, import("zod").objectOutputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined> | undefined;
        rules?: string[] | undefined;
        features?: import("zod").objectOutputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectOutputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
        settings?: {
            challenges?: {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        } | undefined;
    }, {
        address?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        pubsubTopic?: string | undefined;
        roles?: Record<string, import("zod").objectInputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined> | undefined;
        rules?: string[] | undefined;
        features?: import("zod").objectInputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectInputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
        settings?: {
            challenges?: {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        } | undefined;
    }>;
}, "strict", import("zod").ZodTypeAny, {
    signer: {
        type: "ed25519";
        privateKey: string;
    };
    subplebbitAddress: string;
    subplebbitEdit: {
        address?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        pubsubTopic?: string | undefined;
        roles?: Record<string, import("zod").objectOutputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined> | undefined;
        rules?: string[] | undefined;
        features?: import("zod").objectOutputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectOutputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
        settings?: {
            challenges?: {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        } | undefined;
    };
    timestamp?: number | undefined;
    author?: import("zod").objectOutputType<{
        address: import("zod").ZodOptional<import("zod").ZodString>;
        previousCommentCid: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodString, string, string>>>;
        displayName: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        wallets: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
            address: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
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
        avatar: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        flair: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
    }, import("zod").ZodTypeAny, "passthrough"> | undefined;
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
    subplebbitEdit: {
        address?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        pubsubTopic?: string | undefined;
        roles?: Record<string, import("zod").objectInputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined> | undefined;
        rules?: string[] | undefined;
        features?: import("zod").objectInputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectInputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
        settings?: {
            challenges?: {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        } | undefined;
    };
    timestamp?: number | undefined;
    author?: import("zod").objectInputType<{
        address: import("zod").ZodOptional<import("zod").ZodString>;
        previousCommentCid: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodString, string, string>>>;
        displayName: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        wallets: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
            address: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
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
        avatar: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            chainTicker: import("zod").ZodString;
            address: import("zod").ZodString;
            id: import("zod").ZodString;
            timestamp: import("zod").ZodNumber;
            signature: import("zod").ZodObject<{
                signature: import("zod").ZodString;
                type: import("zod").ZodEnum<["eip191"]>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "eip191";
                signature: string;
            }, {
                type: "eip191";
                signature: string;
            }>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        flair: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
    }, import("zod").ZodTypeAny, "passthrough"> | undefined;
    protocolVersion?: string | undefined;
    challengeRequest?: {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    } | undefined;
}>;
export declare const SubplebbitEditPublicationSignedPropertyNames: ("timestamp" | "author" | "subplebbitAddress" | "protocolVersion" | "subplebbitEdit")[];
export declare const SubplebbitEditPubsubMessagePublicationSchema: import("zod").ZodObject<Pick<{
    subplebbitAddress: import("zod").ZodString;
    challengeRequest: import("zod").ZodOptional<import("zod").ZodObject<{
        challengeAnswers: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "atleastone">>;
        challengeCommentCids: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEffects<import("zod").ZodString, string, string>, "many">>;
    }, "strip", import("zod").ZodTypeAny, {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    }, {
        challengeAnswers?: [string, ...string[]] | undefined;
        challengeCommentCids?: string[] | undefined;
    }>>;
    subplebbitEdit: import("zod").ZodObject<{
        address: import("zod").ZodOptional<import("zod").ZodString>;
        description: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        title: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        pubsubTopic: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
        rules: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>>;
        features: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        suggested: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough">>>>;
        flairs: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodArray<import("zod").ZodObject<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">>, "many">>>>;
        settings: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodObject<{
            fetchThumbnailUrls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            fetchThumbnailUrlsProxyUrl: import("zod").ZodOptional<import("zod").ZodString>;
            challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEffects<import("zod").ZodObject<{
                path: import("zod").ZodOptional<import("zod").ZodString>;
                name: import("zod").ZodOptional<import("zod").ZodString>;
                options: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
                exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">>, "atleastone">>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strict", import("zod").ZodTypeAny, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }, {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }>, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }, {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }>, "many">>;
        }, "strict", import("zod").ZodTypeAny, {
            challenges?: {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        }, {
            challenges?: {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        }>>>;
        roles: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<[import("zod").ZodObject<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough">>, import("zod").ZodUndefined]>>>>;
    }, "strict", import("zod").ZodTypeAny, {
        address?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        pubsubTopic?: string | undefined;
        roles?: Record<string, import("zod").objectOutputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined> | undefined;
        rules?: string[] | undefined;
        features?: import("zod").objectOutputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectOutputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectOutputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
        settings?: {
            challenges?: {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                exclude?: [import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                }, import("zod").ZodTypeAny, "passthrough">, ...import("zod").objectOutputType<{
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
            }[] | undefined;
            fetchThumbnailUrls?: boolean | undefined;
            fetchThumbnailUrlsProxyUrl?: string | undefined;
        } | undefined;
    }, {
        address?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        pubsubTopic?: string | undefined;
        roles?: Record<string, import("zod").objectInputType<{
            role: import("zod").ZodEnum<["owner", "admin", "moderator"]>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined> | undefined;
        rules?: string[] | undefined;
        features?: import("zod").objectInputType<{
            noVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilers: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noSpoilerReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPolls: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noCrossposts: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            anonymousAuthors: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noNestedReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            safeForWork: import("zod").ZodOptional<import("zod").ZodBoolean>;
            authorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requireAuthorFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            postFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostFlairs: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownImages: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noMarkdownVideos: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownImageReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            markdownVideoReplies: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noPostDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noReplyDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noUpvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            noDownvotes: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLink: import("zod").ZodOptional<import("zod").ZodBoolean>;
            requirePostLinkIsMedia: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        suggested?: import("zod").objectInputType<{
            primaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            secondaryColor: import("zod").ZodOptional<import("zod").ZodString>;
            avatarUrl: import("zod").ZodOptional<import("zod").ZodString>;
            bannerUrl: import("zod").ZodOptional<import("zod").ZodString>;
            backgroundUrl: import("zod").ZodOptional<import("zod").ZodString>;
            language: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod").ZodTypeAny, "passthrough"> | undefined;
        flairs?: Record<string, import("zod").objectInputType<{
            text: import("zod").ZodString;
            backgroundColor: import("zod").ZodOptional<import("zod").ZodString>;
            textColor: import("zod").ZodOptional<import("zod").ZodString>;
            expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod").ZodTypeAny, "passthrough">[]> | undefined;
        settings?: {
            challenges?: {
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
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
                        reply: import("z