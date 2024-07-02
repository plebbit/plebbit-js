import { z } from "zod";
import {
    AuthorAddressSchema,
    CommentCidSchema,
    CreateSignerSchema,
    FlairSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    ShortSubplebbitAddressSchema,
    SignerWithAddressPublicKeySchema,
    SignerWithAddressPublicKeyShortAddressSchema,
    SubplebbitAddressSchema
} from "../schema/schema.js";
import { PostsPagesIpfsSchema, PostsPagesJsonSchema } from "../pages/schema.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";

// Other props of Subplebbit Ipfs here
export const SubplebbitEncryptionSchema = z.object({
    type: z.enum(["ed25519-aes-gcm"]), // https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    publicKey: SignerWithAddressPublicKeySchema.shape.publicKey // 32 bytes base64 string (same as subplebbit.signer.publicKey)
});

export const SubplebbitRoleSchema = z.object({
    role: z.enum(["owner", "admin", "moderator"])
});

export const SubplebbitSuggestedSchema = z.object({
    // values suggested by the sub owner, the client/user can ignore them without breaking interoperability
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    avatarUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    backgroundUrl: z.string().optional(),
    language: z.string().optional()
    // TODO: menu links, wiki pages, sidebar widgets
});

export const SubplebbitFeaturesSchema = z.object({
    // any boolean that changes the functionality of the sub, add "no" in front if doesn't default to false
    noVideos: z.boolean().optional(), // Not implemented
    noSpoilers: z.boolean().optional(), // Not implemented. Author can't comment.spoiler = true their own comments
    noImages: z.boolean().optional(), // Not implemented
    noVideoReplies: z.boolean().optional(), // Not implemented
    noSpoilerReplies: z.boolean().optional(), // Not implemented
    noImageReplies: z.boolean().optional(), // Not implemented
    noPolls: z.boolean().optional(), // Not impllemented
    noCrossposts: z.boolean().optional(), // Not implemented
    noUpvotes: z.boolean().optional(), // Not implemented
    noDownvotes: z.boolean().optional(), // Not implemented
    noAuthors: z.boolean().optional(), // Not implemented. No authors at all, like 4chan
    anonymousAuthors: z.boolean().optional(), // Not implemented. Authors are given anonymous ids inside threads, like 4chan
    noNestedReplies: z.boolean().optional(), // Not implemented. No nested replies, like old school forums and 4chan
    safeForWork: z.boolean().optional(), // Not implemented
    authorFlairs: z.boolean().optional(), // Not implemented. Authors can choose their own author flairs (otherwise only mods can)
    requireAuthorFlairs: z.boolean().optional(), // Not implemented. Force authors to choose an author flair before posting
    postFlairs: z.boolean().optional(), // Not implemented. Authors can choose their own post flairs (otherwise only mods can)
    requirePostFlairs: z.boolean().optional(), // Not implemented. Force authors to choose a post flair before posting
    noMarkdownImages: z.boolean().optional(), // Not implemented. Don't embed images in text posts markdown
    noMarkdownVideos: z.boolean().optional(), // Not implemented. Don't embed videos in text posts markdown
    markdownImageReplies: z.boolean().optional(), // Not implemented
    markdownVideoReplies: z.boolean().optional(), // Not implemented
    requirePostLink: z.boolean().optional(), // post.link must be defined and a valid https url
    requirePostLinkIsMedia: z.boolean().optional() // post.link must be of media (audio, video, image)
});

export const ChallengeExcludeSubplebbitSchema = z.object({
    addresses: SubplebbitAddressSchema.array(), // list of subplebbit addresses that can be used to exclude, plural because not a condition field like 'role'
    maxCommentCids: z.number().nonnegative(), // maximum amount of comment cids that will be fetched to check
    postScore: z.number().int().optional(),
    replyScore: z.number().int().optional(),
    firstCommentTimestamp: PlebbitTimestampSchema.optional() // exclude if author account age is greater or equal than now - firstCommentTimestamp
});

export const ChallengeExcludeSchema = z.object({
    subplebbit: ChallengeExcludeSubplebbitSchema.optional(),
    postScore: z.number().int().optional(),
    replyScore: z.number().int().optional(),
    firstCommentTimestamp: PlebbitTimestampSchema.optional(),
    challenges: z.number().nonnegative().array().optional(),
    post: z.boolean().optional(),
    reply: z.boolean().optional(),
    vote: z.boolean().optional(),
    role: SubplebbitRoleSchema.shape.role.array().optional(),
    address: AuthorAddressSchema.array().optional(),
    rateLimit: z.number().nonnegative().int().optional(),
    rateLimitChallengeSuccess: z.boolean().optional()
});

export const SubplebbitChallengeSchema = z.object({
    exclude: ChallengeExcludeSchema.array().optional(),
    description: z.string().optional(), // TODO eventually use ChallengeFile.description
    challenge: z.string().optional(), // TODO eventually use ChallengeFile.challenge
    type: z.string().optional() // TODO eventually use ChallengeFile.type
});

// Subplebbit actual schemas here

export const SubplebbitIpfsSchema = z
    .object({
        posts: PostsPagesIpfsSchema.optional(),
        challenges: SubplebbitChallengeSchema.array(),
        signature: JsonSignatureSchema,
        encryption: SubplebbitEncryptionSchema,
        address: SubplebbitAddressSchema,
        createdAt: PlebbitTimestampSchema,
        updatedAt: PlebbitTimestampSchema,
        pubsubTopic: z.string().optional(),
        statsCid: CommentCidSchema,
        protocolVersion: ProtocolVersionSchema,
        postUpdates: z.record(z.string(), CommentCidSchema).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        roles: z.record(AuthorAddressSchema, SubplebbitRoleSchema).optional(),
        rules: z.string().array().optional(),
        lastPostCid: CommentCidSchema.optional(),
        lastCommentCid: CommentCidSchema.optional(),
        features: SubplebbitFeaturesSchema.optional(),
        suggested: SubplebbitSuggestedSchema.optional(),
        flairs: z.record(z.enum(["post", "author"], FlairSchema.array())).optional()
    })
    .strict();

// If you're trying to create a subplebbit instance with any props, all props are optional except address

export const CreateRemoteSubplebbitOptionsSchema = SubplebbitIpfsSchema.partial()
    .merge(SubplebbitIpfsSchema.pick({ address: true }))
    .strict();

export const RemoteSubplebbitJsonSchema = SubplebbitIpfsSchema.omit({ posts: true })
    .extend({
        shortAddress: ShortSubplebbitAddressSchema,
        posts: PostsPagesJsonSchema.optional()
    })
    .strict();

// Local Subplebbit schemas

export const SubplebbitChallengeSettingSchema = z
    .object({
        // the private settings of the challenge (subplebbit.settings.challenges)
        path: z.string().optional(), // (only if name is undefined) the path to the challenge js file, used to get the props ChallengeFile {optionInputs, type, getChallenge}
        name: z.string().optional(), // (only if path is undefined) the challengeName from Plebbit.challenges to identify it
        options: z.record(z.string(), z.string()).optional(), //{ [optionPropertyName: string]: string } the options to be used to the getChallenge function, all values must be strings for UI ease of use
        exclude: ChallengeExcludeSchema.array().optional(), // singular because it only has to match 1 exclude, the client must know the exclude setting to configure what challengeCommentCids to send
        description: z.string().optional() // describe in the frontend what kind of challenge the user will receive when publishing
    })
    .refine((challengeData) => challengeData.path || challengeData.name, "Path or name of challenge has to be defined");

export const SubplebbitSettingsSchema = z.object({
    fetchThumbnailUrls: z.boolean().optional(),
    fetchThumbnailUrlsProxyUrl: z.string().optional(), // TODO should we validate this url?
    challenges: z.null().or(z.undefined()).or(SubplebbitChallengeSettingSchema.array()) // If set to null or undefined it will remove all challenges
});

export const SubplebbitEditOptionsSchema = SubplebbitIpfsSchema.pick({
    flairs: true,
    address: true,
    title: true,
    description: true,
    roles: true,
    rules: true,
    lastPostCid: true,
    lastCommentCid: true,
    pubsubTopic: true,
    features: true,
    suggested: true
})
    .extend({
        settings: SubplebbitSettingsSchema.optional()
    })
    .partial();

// These are the options to create a new local sub, provided by user

export const CreateNewLocalSubplebbitUserOptionsSchema = SubplebbitEditOptionsSchema.omit({ address: true })
    .extend({
        signer: CreateSignerSchema.optional()
    })
    .strict();

// This type will be stored in the db as the current state

export const InternalSubplebbitRecordSchema = SubplebbitIpfsSchema.extend({
    settings: SubplebbitEditOptionsSchema.shape.settings,
    signer: SignerWithAddressPublicKeySchema,
    _subplebbitUpdateTrigger: z.boolean(),
    _usingDefaultChallenge: z.boolean()
}).strict();

// This will be transmitted over RPC connection for local subs to RPC clients
export const RpcInternalSubplebbitRecordSchema = InternalSubplebbitRecordSchema.omit({
    signer: true,
    _subplebbitUpdateTrigger: true
})
    .extend({
        started: z.boolean(),
        signer: InternalSubplebbitRecordSchema.shape.signer.omit({ privateKey: true })
    })
    .strict();

export const RpcLocalSubplebbitJsonSchema = RpcInternalSubplebbitRecordSchema.omit({ posts: true })
    .extend({
        shortAddress: ShortSubplebbitAddressSchema,
        posts: PostsPagesJsonSchema.optional()
    })
    .strict();

export const LocalSubplebbitJsonSchema = RpcLocalSubplebbitJsonSchema; // Not sure if we need to modify it for now

// | CreateNewLocalSubplebbitUserOptions
// | CreateRemoteSubplebbitOptions
// | RemoteSubplebbitJsonType
// | SubplebbitIpfsType
// | InternalSubplebbitType
// | RemoteSubplebbit
// | RpcLocalSubplebbit
// | RpcRemoteSubplebbit
// | LocalSubplebbit = {}

export const SubplebbitOnlyAddressAndPageCidsSchema = z
    .object({
        address: SubplebbitAddressSchema,
        posts: z.object({
            pageCids: PostsPagesIpfsSchema.shape.pageCids
        })
    })
    .strict();

const SubplebbitClassSchema = z.custom<RemoteSubplebbit | RpcLocalSubplebbit | RpcRemoteSubplebbit | LocalSubplebbit>(
    (arg) =>
        arg instanceof RemoteSubplebbit ||
        arg instanceof RpcLocalSubplebbit ||
        arg instanceof RpcRemoteSubplebbit ||
        arg instanceof LocalSubplebbit // I think this is gonna throw in browsers
);

export const CreateRemoteSubplebbitFunctionArgumentSchema = CreateRemoteSubplebbitOptionsSchema.or(RemoteSubplebbitJsonSchema)
    .or(SubplebbitOnlyAddressAndPageCidsSchema)
    .or(SubplebbitIpfsSchema)
    .or(SubplebbitClassSchema);

export const CreateRpcSubplebbitFunctionArgumentSchema = CreateRemoteSubplebbitFunctionArgumentSchema.or(
    CreateNewLocalSubplebbitUserOptionsSchema
)
    .or(InternalSubplebbitRecordSchema)
    .or(SubplebbitClassSchema);

export const CreateSubplebbitFunctionArgumentsSchema = CreateNewLocalSubplebbitUserOptionsSchema.or(
    CreateRemoteSubplebbitFunctionArgumentSchema
)
    .or(InternalSubplebbitRecordSchema)
    .or(SubplebbitClassSchema);

// plebbit class schemas here

export const ListOfSubplebbitsSchema = SubplebbitAddressSchema.array();
