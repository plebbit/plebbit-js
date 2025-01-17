import { z } from "zod";
import {
    AuthorAddressSchema,
    ChallengeAnswerStringSchema,
    CidStringSchema,
    CreateSignerSchema,
    FlairSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    SignerWithAddressPublicKeySchema,
    SubplebbitAddressSchema
} from "../schema/schema.js";
import { PostsPagesIpfsSchema } from "../pages/schema.js";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import * as remeda from "remeda";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../pubsub-messages/types.js";
import { messages } from "../errors.js";
import { nonNegativeIntStringSchema } from "../schema.js";

// Other props of Subplebbit Ipfs here
export const SubplebbitEncryptionSchema = z
    .object({
        type: z.enum(["ed25519-aes-gcm"]), // https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
        publicKey: SignerWithAddressPublicKeySchema.shape.publicKey // 32 bytes base64 string (same as subplebbit.signer.publicKey)
    })
    .passthrough();

export const SubplebbitRoleSchema = z
    .object({
        role: z.enum(["owner", "admin", "moderator"])
    })
    .passthrough();

export const PubsubTopicSchema = z.string().min(1);

export const SubplebbitSuggestedSchema = z
    .object({
        // values suggested by the sub owner, the client/user can ignore them without breaking interoperability
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        avatarUrl: z.string().url().optional(),
        bannerUrl: z.string().url().optional(),
        backgroundUrl: z.string().url().optional(),
        language: z.string().optional()
        // TODO: menu links, wiki pages, sidebar widgets
    })
    .passthrough();

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
        noPostUpvotes: z.boolean().optional(), // Not allowed to publish a vote=1 to comment with depth = 0
        noReplyUpvotes: z.boolean().optional(), // not allowed to publish a vote=1 to comment with depth > 0
        noPostDownvotes: z.boolean().optional(), // not allowed to publish a vote=-1 to comment with depth = 0
        noReplyDownvotes: z.boolean().optional(), // not allowed to publish a vote=-1 to comment with depth > 0
        noUpvotes: z.boolean().optional(), // Not allowed to publish a vote=1
        noDownvotes: z.boolean().optional(), // Not allowed to publish a vote=-1
        requirePostLink: z.boolean().optional(), // post.link must be defined and a valid https url
        requirePostLinkIsMedia: z.boolean().optional() // post.link must be of media (audio, video, image)
    })
    .passthrough();

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
    .passthrough(); // should be flexible

export const ChallengeResultSchema = z.object({ success: z.literal(true) }).or(z.object({ success: z.literal(false), error: z.string() }));

export const ChallengeFromGetChallengeSchema = z
    .object({
        challenge: z.string(), // e.g. '2 + 2'
        verify: z
            .function()
            .args(z.lazy(() => ChallengeAnswerStringSchema))
            .returns(z.promise(ChallengeResultSchema)), // args is answer
        type: z.string().min(1)
    })
    .strict();

export const ResultOfGetChallengeSchema = ChallengeFromGetChallengeSchema.or(ChallengeResultSchema);

export const ChallengeExcludeSubplebbitSchema = z
    .object({
        addresses: SubplebbitAddressSchema.array().nonempty(), // list of subplebbit addresses that can be used to exclude, plural because not a condition field like 'role'
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
        challenges: z.number().nonnegative().int().array().nonempty().optional(),
        post: z.boolean().optional(),
        reply: z.boolean().optional(),
        vote: z.boolean().optional(),
        commentModeration: z.boolean().optional(),
        commentEdit: z.boolean().optional(),
        role: SubplebbitRoleSchema.shape.role.array().nonempty().optional(),
        address: AuthorAddressSchema.array().nonempty().optional(),
        rateLimit: z.number().nonnegative().int().optional(),
        rateLimitChallengeSuccess: z.boolean().optional()
    })
    .passthrough()
    .refine(
        (args) => [args.post, args.vote, args.reply, args.commentModeration, args.commentEdit].filter((pub) => pub === true).length <= 1,
        messages.ERR_CAN_NOT_SET_EXCLUDE_TO_HAVE_MORE_THAN_ONE_PUBLICATION
    );

export const SubplebbitChallengeSettingSchema = z
    .object({
        // the private settings of the challenge (subplebbit.settings.challenges)
        path: z.string().optional(), // (only if name is undefined) the path to the challenge js file, used to get the props ChallengeFile {optionInputs, type, getChallenge}
        name: z.string().optional(), // (only if path is undefined) the challengeName from Plebbit.challenges to identify it
        options: z.record(z.string(), z.string()).optional(), //{ [optionPropertyName: string]: string } the options to be used to the getChallenge function, all values must be strings for UI ease of use
        exclude: ChallengeExcludeSchema.array().nonempty().optional(), // singular because it only has to match 1 exclude, the client must know the exclude setting to configure what challengeCommentCids to send
        description: z.string().optional() // describe in the frontend what kind of challenge the user will receive when publishing
    })
    .strict()
    .refine((challengeData) => challengeData.path || challengeData.name, "Path or name of challenge has to be defined");

export const ChallengeFileSchema = z
    .object({
        // the result of the function exported by the challenge file
        optionInputs: ChallengeOptionInputSchema.array().nonempty().optional(), // the options inputs fields to display to the user
        type: ChallengeFromGetChallengeSchema.shape.type,
        challenge: ChallengeFromGetChallengeSchema.shape.challenge.optional(), // some challenges can be static and asked before the user publishes, like a password for example
        caseInsensitive: z.boolean().optional(), // challenge answer capitalization is ignored, informational only option added by the challenge file
        description: z.string().optional(), // describe what the challenge does to display in the UI
        getChallenge: z
            .function()
            .args(
                SubplebbitChallengeSettingSchema, // challenge settings
                z.custom<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>(), // challenge request to process, no need to validate because extra props may be there
                z.number().int().nonnegative(), // challenge index
                z.custom<LocalSubplebbit>() // the local subplebbit instance
            )
            .returns(z.promise(ResultOfGetChallengeSchema))
    })
    .strict();

export const SubplebbitChallengeSchema = z
    .object({
        exclude: ChallengeExcludeSchema.array().nonempty().optional(),
        description: ChallengeFileSchema.shape.description,
        challenge: ChallengeFileSchema.shape.challenge,
        type: ChallengeFileSchema.shape.type,
        caseInsensitive: ChallengeFileSchema.shape.caseInsensitive
    })
    .passthrough();
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
        statsCid: CidStringSchema,
        protocolVersion: ProtocolVersionSchema,
        postUpdates: z.record(nonNegativeIntStringSchema, CidStringSchema).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        roles: z.record(AuthorAddressSchema, SubplebbitRoleSchema).optional(),
        rules: z.string().array().optional(),
        lastPostCid: CidStringSchema.optional(),
        lastCommentCid: CidStringSchema.optional(),
        features: SubplebbitFeaturesSchema.optional(),
        suggested: SubplebbitSuggestedSchema.optional(),
        flairs: z.record(z.string(), FlairSchema.array()).optional()
    })
    .strict();

export const SubplebbitSignedPropertyNames = remeda.keys.strict(remeda.omit(SubplebbitIpfsSchema.shape, ["signature"]));

// This is object transmitted by RPC server to RPC client when it's fetching a remote subplebbit
export const RpcRemoteSubplebbitUpdateEventResultSchema = z.object({
    subplebbit: SubplebbitIpfsSchema.passthrough(),
    updateCid: CidStringSchema
});
// If you're trying to create a subplebbit instance with any props, all props are optional except address

export const CreateRemoteSubplebbitOptionsSchema = SubplebbitIpfsSchema.partial()
    .merge(SubplebbitIpfsSchema.pick({ address: true }))
    .extend({
        posts: SubplebbitIpfsSchema.shape.posts.or(PostsPagesIpfsSchema.pick({ pageCids: true })),
        updateCid: CidStringSchema.optional()
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

const SubplebbitRoleToEditSchema = SubplebbitRoleSchema.or(z.undefined()); // when we pass undefined we're removing the role

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

// | CreateNewLocalSubplebbitUserOptions
// | CreateRemoteSubplebbitOptions
// | RemoteSubplebbitJsonType
// | SubplebbitIpfsType
// | InternalSubplebbitType
// | RemoteSubplebbit
// | RpcLocalSubplebbit
// | RpcRemoteSubplebbit
// | LocalSubplebbit = {}

export const CreateRemoteSubplebbitFunctionArgumentSchema = CreateRemoteSubplebbitOptionsSchema.or(SubplebbitIpfsSchema.passthrough());

export const CreateRpcSubplebbitFunctionArgumentSchema = CreateRemoteSubplebbitFunctionArgumentSchema.or(
    CreateNewLocalSubplebbitUserOptionsSchema
);

export const CreateSubplebbitFunctionArgumentsSchema = CreateNewLocalSubplebbitUserOptionsSchema.or(
    CreateRemoteSubplebbitFunctionArgumentSchema
);

// plebbit.listSubplebbits()

export const ListOfSubplebbitsSchema = SubplebbitAddressSchema.array();

// Reserved fields

// TODO should make the array of class props typed
export const SubplebbitIpfsReservedFields = remeda.difference(
    [
        "cid",
        "shortCid",
        "updateCid",
        "shortUpdateCid",
        "shortAddress",
        "shortSubplebbitAddress",
        "deleted",
        "signer",
        "state",
        "clients",
        "startedState",
        "settings",
        "editable",
        "publishingState",
        "updatingState",
        "started"
    ],
    remeda.keys.strict(SubplebbitIpfsSchema.shape)
);
