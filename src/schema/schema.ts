import { z } from "zod";
import { isIpfsCid } from "../util";
import { messages } from "../errors";
import {
    CommentEditSignedPropertyNames,
    CommentEditSignedPropertyNamesUnion,
    JsonSignature,
    VoteSignedPropertyNames,
    VoteSignedPropertyNamesUnion
} from "../signer/constants";
import * as remeda from "remeda";
import { ProtocolVersion } from "../types";

// TODO add validation for private key here
export const CreateSignerSchema = z.object({ type: z.enum(["ed25519"]), privateKey: z.string() });

const SignerWithAddressPublicKeySchema = CreateSignerSchema.extend({
    address: z.string(), // TODO add validation for signer address here
    publicKey: z.string() // TODO add validation for public key here
});

const SubplebbitAddressSchema = z.string(); // TODO add a regex for checking if it's a domain or IPNS address
const ShortSubplebbitAddressSchema = z.string();

const PlebbitTimestampSchema = z.number().positive(); // Math.round(Date.now() / 1000)  - Unix timestamp

export const ProtocolVersionSchema = z.string();

const WalletSchema = z.object({
    address: z.string(),
    timestamp: PlebbitTimestampSchema,
    signature: z.object({ signature: z.string().startsWith("0x"), type: z.enum(["eip191"]) })
});

const CommentCidSchema = z.string().refine((arg) => isIpfsCid(arg), messages.ERR_CID_IS_INVALID);

const ChainTickerSchema = z.string(); // chain ticker can be anything for now

const AuthorWalletsSchema = z.record(ChainTickerSchema, WalletSchema);

export const AuthorAvatarNftSchema = z.object({
    chainTicker: ChainTickerSchema,
    address: z.string(),
    id: z.string(),
    timestamp: PlebbitTimestampSchema,
    signature: WalletSchema.shape.signature
});

export const AuthorFlairSchema = z.object({
    text: z.string(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    expiresAt: PlebbitTimestampSchema.optional()
});

// When author creates their publication, this is publication.author
export const AuthorPubsubSchema = z.object({
    address: z.string(), // TODO add a regex for checking if it's domain or 12D... address
    previousCommentCid: z.string().optional(),
    displayName: z.string().optional(),
    wallets: AuthorWalletsSchema.optional(),
    avatar: AuthorAvatarNftSchema.optional(),
    flair: AuthorFlairSchema.optional()
});

const CreatePublicationUserOptionsSchema = z.object({
    signer: CreateSignerSchema,
    author: AuthorPubsubSchema.partial().optional(),
    subplebbitAddress: SubplebbitAddressSchema,
    protocolVersion: ProtocolVersionSchema.optional(),
    timestamp: PlebbitTimestampSchema.optional(),
    challengeAnswers: z.string().array().optional(),
    challengeCommentCids: z.string().array().optional()
});

export const JsonSignatureSchema = z.object({
    type: z.enum(["ed25519"]),
    signature: z.string(), // base64, TODO add validation
    publicKey: z.string(), // base64, TODO add validation
    signedPropertyNames: z.string().array() // TODO add validation
});

const AuthorPubsubJsonSchema = AuthorPubsubSchema.extend({ shortAddress: z.string() });

// Common stuff here
const PublicationBaseBeforeSigning = z.object({
    signer: SignerWithAddressPublicKeySchema,
    timestamp: PlebbitTimestampSchema,
    author: AuthorPubsubSchema,
    protocolVersion: ProtocolVersionSchema
});

// Challenge requests and pubsub here

// Should be extended to add publication, which should be defined with every type (vote, comment, edit)
const DecryptedChallengeRequestBaseSchema = CreatePublicationUserOptionsSchema.pick({ challengeAnswers: true, challengeCommentCids: true });

// Create Vote section here

export const CreateVoteUserOptionsSchema = CreatePublicationUserOptionsSchema.extend({
    commentCid: CommentCidSchema,
    vote: z.union([z.literal(1), z.literal(0), z.literal(-1)])
}).strict();

export const VoteOptionsToSignSchema = CreateVoteUserOptionsSchema.merge(PublicationBaseBeforeSigning);

export const LocalVoteOptionsAfterSigningSchema = VoteOptionsToSignSchema.extend({ signature: JsonSignatureSchema }).merge(
    DecryptedChallengeRequestBaseSchema
);

const votePickOptions = <Record<VoteSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...VoteSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);

export const VotePubsubMessageSchema = LocalVoteOptionsAfterSigningSchema.pick(votePickOptions).strict();

export const DecryptedChallengeRequestVoteSchema = DecryptedChallengeRequestBaseSchema.extend({
    publication: VotePubsubMessageSchema
}).strict();

export const VoteJsonSchema = VotePubsubMessageSchema.extend({
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

export const CreateVoteFunctionArgumentSchema = CreateVoteUserOptionsSchema.or(VotePubsubMessageSchema)
    .or(DecryptedChallengeRequestVoteSchema)
    .or(VoteJsonSchema);

// Comment schemas here
const SubplebbitAuthorSchema = z
    .object({
        postScore: z.number().positive(),
        replyScore: z.number().positive(),
        banExpiresAt: PlebbitTimestampSchema.optional(),
        flair: AuthorFlairSchema.optional(),
        firstCommentTimeStamp: PlebbitTimestampSchema,
        lastCommentCid: CommentCidSchema
    })
    .strict();

// Comment edit schemas here

export const AuthorCommentEditOptionsSchema = z
    .object({
        commentCid: CommentCidSchema,
        content: z.string().optional(), // TODO Should use CommentIpfsSchema.content later on
        deleted: z.boolean().optional(),
        flair: AuthorFlairSchema.optional(),
        spoiler: z.boolean().optional(),
        reason: z.string().optional()
    })
    .strict();

export const CommentAuthorSchema = SubplebbitAuthorSchema.pick({ banExpiresAt: true, flair: true });
export const ModeratorCommentEditOptionsSchema = z
    .object({
        commentCid: CommentCidSchema,
        flair: AuthorFlairSchema.optional(),
        spoiler: z.boolean().optional(),
        pinned: z.boolean().optional(),
        locked: z.boolean().optional(),
        removed: z.boolean().optional(),
        reason: z.string().optional(),
        commentAuthor: CommentAuthorSchema.optional()
    })
    .strict();

// I have to explicitly include the cast here, it may be fixed in the future
const uniqueModFields = <["pinned", "locked", "removed", "commentAuthor"]>(
    remeda.difference(remeda.keys.strict(ModeratorCommentEditOptionsSchema.shape), remeda.keys.strict(AuthorCommentEditOptionsSchema.shape))
);

const uniqueAuthorFields = <["content", "deleted"]>(
    remeda.difference(remeda.keys.strict(AuthorCommentEditOptionsSchema.shape), remeda.keys.strict(ModeratorCommentEditOptionsSchema.shape))
);

const CreateCommentEditAuthorPublicationSchema = CreatePublicationUserOptionsSchema.merge(AuthorCommentEditOptionsSchema);
const CreateCommentEditModeratorPublicationSchema = CreatePublicationUserOptionsSchema.merge(ModeratorCommentEditOptionsSchema);

// Before signing, and after filling the missing props of CreateCommentEditUserOptions
export const CommentEditModeratorOptionsToSignSchema = CreateCommentEditModeratorPublicationSchema.merge(PublicationBaseBeforeSigning);
export const CommentEditAuthorOptionsToSignSchema = CreateCommentEditAuthorPublicationSchema.merge(PublicationBaseBeforeSigning);

// after signing, and before initializing the local comment edit props
export const LocalCommentEditAfterSigningSchema = CommentEditModeratorOptionsToSignSchema.merge(
    CommentEditAuthorOptionsToSignSchema
).extend({
    signature: JsonSignatureSchema
});

// ChallengeRequest.publication
const editPubsubPickOptions = <Record<CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...CommentEditSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);
export const AuthorCommentEditPubsubSchema = LocalCommentEditAfterSigningSchema.pick(remeda.omit(editPubsubPickOptions, uniqueModFields));
export const ModeratorCommentEditPubsubSchema = LocalCommentEditAfterSigningSchema.pick(
    remeda.omit(editPubsubPickOptions, uniqueAuthorFields)
);
export const CommentEditPubsubMessageSchema = AuthorCommentEditPubsubSchema.merge(ModeratorCommentEditPubsubSchema);

export const DecryptedChallengeRequestCommentEditSchema = DecryptedChallengeRequestBaseSchema.extend({
    publication: CommentEditPubsubMessageSchema
}).strict();

export const CommentEditJsonSchema = CommentEditPubsubMessageSchema.extend({
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

export const CreateCommentEditFunctionArgumentSchema = CreateCommentEditAuthorPublicationSchema.or(
    CreateCommentEditModeratorPublicationSchema
)
    .or(CommentEditPubsubMessageSchema)
    .or(DecryptedChallengeRequestCommentEditSchema)
    .or(CommentEditJsonSchema);
