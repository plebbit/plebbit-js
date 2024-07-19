import { z } from "zod";
import {
    AuthorAddressSchema,
    ChallengeAnswerStringSchema,
    CommentCidSchema,
    CreateSignerSchema,
    FlairSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    ShortSubplebbitAddressSchema,
    SignerWithAddressPublicKeySchema,
    SubplebbitAddressSchema
} from "../schema/schema.js";
import { PostsPagesIpfsSchema, PostsPagesJsonSchema } from "../pages/schema.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema } from "../pubsub-messages/schema.js";
import { ChainTickerSchema } from "../schema.js";

// Other props of Subplebbit Ipfs here
export const SubplebbitEncryptionSchema = z.object({
    type: z.enum(["ed25519-aes-gcm"]), // https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    publicKey: SignerWithAddressPublicKeySchema.shape.publicKey // 32 bytes base64 string (same as subplebbit.signer.publicKey)
});

export const SubplebbitRoleSchema = z.object({
    role: z.enum(["owner", "admin", "moderator"])
});

export const PubsubTopicSchema = z.string(); // TODO add validation

export const SubplebbitSuggestedSchema = z
    .object({
        // values suggested by the sub owner, the client/user can ignore them without breaking interoperability
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        avatarUrl: z.string().optional(),
        bannerUrl: z.string().optional(),
        backgroundUrl: z.string().optional(),
        language: z.string().optional()
        // TODO: menu links, wiki pages, sidebar widgets
    })
    .strict();

export const SubplebbitFeaturesSchema = z
    .object({
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
    })
    .strict();

// Local subplebbit challenge here (Challenges API)

export const ChallengeOptionInputSchema = z
    .object({
        option: z.string(), // option property name, e.g. characterCount
        label: z.string(), // option title, e.g. Character Count
        default: z.string().optional(), // option default value, e.g. "10"
        description: z.string().optional(), // e.g. Amount of characters of the captcha
        placeholder: z.string().optional(), // the value to display if the input field is empty, e.g. "10"
        required: z.boolean().optional() // If this is true, the challenge option is required, the challenge will throw without it
    })
    .strict();

export const ChallengeResultSchema = z.object({ success: z.literal(true) }).or(z.object({ success: z.literal(false), error: z.string() }));

const chainTickerValues = <`chain/${z.infer<typeof ChainTickerSchema>}`[]>ChainTickerSchema.options.map((ticker) => `chain/${ticker}`);

export const ChallengeFromGetChallengeSchema = z
    .object({
        challenge: z.string(), // e.g. '2 + 2'
        verify: z
            .function()
            .args(z.lazy(() => ChallengeAnswerStringSchema))
            .returns(z.promise(ChallengeResultSchema)), // args is answer
        type: z.enum(["image/png", "text/plain", ...chainTickerValues])
    })
    .strict();

export const ResultOfGetChallengeSchema = ChallengeFromGetChallengeSchema.or(ChallengeResultSchema);

export const ChallengeExcludeSubplebbitSchema = z
    .object({
        addresses: SubplebbitAddressSchema.array(), // list of subplebbit addresses that can be used to exclude, plural because not a condition field like 'role'
        maxCommentCids: z.number().nonnegative().int(), // maximum amount of comment cids that will be fetched to check
        postScore: z.number().int().optional(),
        replyScore: z.number().int().optional(),
        firstCommentTimestamp: PlebbitTimestampSchema.optional() // exclude if author account age is greater or equal than now - firstCommentTimestamp
    })
    .strict();

export const ChallengeExcludeSchema = z
    .object({
        subplebbit: ChallengeExcludeSubplebbitSchema.optional(),
        postScore: z.number().int().optional(),
        replyScore: z.number().int().optional(),
        firstCommentTimestamp: PlebbitTimestampSchema.optional(),
        challenges: z.number().nonnegative().int().array().optional(),
        post: z.boolean().optional(),
        reply: z.boolean().optional(),
        vote: z.boolean().optional(),
        role: SubplebbitRoleSchema.shape.role.array().optional(),
        address: AuthorAddressSchema.array().optional(),
        rateLimit: z.number().nonnegative().int().optional(),
        rateLimitChallengeSuccess: z.boolean().optional()
    })
    .strict();

export const SubplebbitChallengeSchema = z
    .object({
        exclude: ChallengeExcludeSchema.array().optional(),
        description: z.string().optional(), // TODO eventually use ChallengeFile.description
        challenge: z.string().optional(), // TODO eventually use ChallengeFile.challenge
        type: z.string().optional() // TODO eventually use ChallengeFile.type
    })
    .strict();

export const SubplebbitChallengeSettingSchema = z
    .object({
        // the private settings of the challenge (subplebbit.settings.challenges)
        path: z.string().optional(), // (only if name is undefined) the path to the challenge js file, used to get the props ChallengeFile {optionInputs, type, getChallenge}
        name: z.string().optional(), // (only if path is undefined) the challengeName from Plebbit.challenges to identify it
        options: z.record(z.string(), z.string()).optional(), //{ [optionPropertyName: string]: string } the options to be used to the getChallenge function, all values must be strings for UI ease of use
        exclude: ChallengeExcludeSchema.array().optional(), // singular because it only has to match 1 exclude, the client must know the exclude setting to configure what challengeCommentCids to send
        description: z.string().optional() // describe in the frontend what kind of challenge the user will receive when publishing
    })
    .strict()
    .refine((challengeData) => challengeData.path || challengeData.name, "Path or name of challenge has to be defined");

export const ChallengeFileSchema = z
    .object({
        // the result of the function exported by the challenge file
        optionInputs: ChallengeOptionInputSchema.array().optional(), // the options inputs fields to display to the user
        type: ChallengeFromGetChallengeSchema.shape.type,
        challenge: ChallengeFromGetChallengeSchema.shape.challenge.optional(), // some challenges can be static and asked before the user publishes, like a password for example
        caseInsensitive: z.boolean().optional(), // challenge answer capitalization is ignored, informational only option added by the challenge file
        description: z.string().optional(), // describe what the challenge does to display in the UI
        getChallenge: z
            .function()
            .args(
                SubplebbitChallengeSettingSchema, // challenge settings
                z.lazy(() => DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema), // challenge request to process
                z.number().int().nonnegative(), // challenge index
                z.custom<LocalSubplebbit>((data) => data instanceof LocalSubplebbit) // the local subplebbit instance
            )
            .returns(z.promise(ResultOfGetChallengeSchema))
    })
    .strict();

export const ChallengeFileFactorySchema = z.function().args(SubplebbitChallengeSettingSchema).returns(ChallengeFileSchema);

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
        pubsubTopic: PubsubTopicSchema.optional(),
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

export const SubplebbitSettingsSchema = z
    .object({
        fetchThumbnailUrls: z.boolean().optional(),
        fetchThumbnailUrlsProxyUrl: z.string().optional(), // TODO should we validate this url?
        challenges: SubplebbitChallengeSettingSchema.array().optional() // If empty array it will remove all challenges
    })
    .strict();

const SubplebbitRoleToEditSchema = SubplebbitRoleSchema.or(z.null()); // when we pass null we're removing the role

const SubplebbitRolesToEditSchema = z.record(AuthorAddressSchema, SubplebbitRoleToEditSchema);

export const SubplebbitEditOptionsSchema = SubplebbitIpfsSchema.pick({
    flairs: true,
    address: true,
    title: true,
    description: true,
    roles: true,
    rules: true,
    pubsubTopic: true,
    features: true,
    suggested: true
})
    .extend({
        settings: SubplebbitSettingsSchema.optional(),
        roles: SubplebbitRolesToEditSchema.optional()
    })
    .partial()
    .strict();

// These are the options to create a new local sub, provided by user

export const CreateNewLocalSubplebbitUserOptionsSchema = SubplebbitEditOptionsSchema.omit({ address: true })
    .extend({
        signer: CreateSignerSchema.optional(),
        roles: SubplebbitIpfsSchema.shape.roles
    })
    .strict();

// These are the options that go straight into _createLocalSub, create a new brand local sub. This is after parsing of plebbit-js
export const CreateNewLocalSubplebbitParsedOptionsSchema = CreateNewLocalSubplebbitUserOptionsSchema.extend({
    address: SignerWithAddressPublicKeySchema.shape.address,
    signer: SignerWithAddressPublicKeySchema
}).strict();

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

export const RpcUpdateResultSchema = SubplebbitIpfsSchema.or(RpcInternalSubplebbitRecordSchema);

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
).or(InternalSubplebbitRecordSchema);

// plebbit.listSubplebbits()

export const ListOfSubplebbitsSchema = SubplebbitAddressSchema.array();

// Schema of states

export const StartedStateSchema = z.enum(["stopped", "publishing-ipns", "failed", "succeeded"]);

export const UpdatingStateSchema = z.enum([
    ...StartedStateSchema.options,
    "stopped",
    "resolving-address",
    "fetching-ipns",
    "fetching-ipfs",
    "failed",
    "succeeded"
]);
