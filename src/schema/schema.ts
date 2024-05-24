import { z } from "zod";
import { isIpfsCid } from "../util";
import { messages } from "../errors";
import { CommentIpfsWithCidSchema, CommentUpdateSchema, CommentWithCommentUpdateJsonSchema } from "../publications/comment/schema";

// TODO add validation for private key here
export const CreateSignerSchema = z.object({ type: z.enum(["ed25519"]), privateKey: z.string() });

const SignerWithAddressPublicKeySchema = CreateSignerSchema.extend({
    address: z.string(), // TODO add validation for signer address here
    publicKey: z.string() // TODO add validation for public key here
});

export const SubplebbitAddressSchema = z.string(); // TODO add a regex for checking if it's a domain or IPNS address
export const ShortSubplebbitAddressSchema = z.string();

export const ShortAuthorAddressSchema = z.string();

export const PlebbitTimestampSchema = z.number().positive().int(); // Math.round(Date.now() / 1000)  - Unix timestamp

export const ProtocolVersionSchema = z.string();

const WalletSchema = z.object({
    address: z.string(),
    timestamp: PlebbitTimestampSchema,
    signature: z.object({ signature: z.string().startsWith("0x"), type: z.enum(["eip191"]) })
});

export const CommentCidSchema = z.string().refine((arg) => isIpfsCid(arg), messages.ERR_CID_IS_INVALID); // TODO should change name to CidStringSchema
export const ShortCidSchema = z.string().length(12);

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

export const CreatePublicationUserOptionsSchema = z.object({
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

export const AuthorJsonBaseSchema = z.object({ shortAddress: ShortAuthorAddressSchema });

export const AuthorPubsubJsonSchema = AuthorPubsubSchema.merge(AuthorJsonBaseSchema);

// Common stuff here
export const PublicationBaseBeforeSigning = z.object({
    signer: SignerWithAddressPublicKeySchema,
    timestamp: PlebbitTimestampSchema,
    author: AuthorPubsubSchema,
    protocolVersion: ProtocolVersionSchema
});

// Challenge requests and pubsub here

// Should be extended to add publication, which should be defined with every type (vote, comment, edit)
export const DecryptedChallengeRequestBaseSchema = CreatePublicationUserOptionsSchema.pick({
    challengeAnswers: true,
    challengeCommentCids: true
});

// Pages schema here

export const ReplySortNameSchema = z.enum(["topAll", "new", "old", "controversialAll"]);

export const PageIpfsSchema = z.object({
    comments: z.object({ comment: CommentIpfsWithCidSchema, update: CommentUpdateSchema }).array(),
    nextCid: CommentCidSchema.optional()
});

const PageJsonSchema = z.object({
    comments: CommentWithCommentUpdateJsonSchema.array(),
    nextCid: CommentCidSchema.optional()
});

// need to prevent infinite recursion here
export const RepliesPagesIpfsSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageIpfsSchema), // should be partial
    pageCids: z.record(ReplySortNameSchema, CommentCidSchema)
});

export const RepliesPagesJsonSchema = z.object({
    pages: z.record(ReplySortNameSchema, PageJsonSchema),
    pageCids: RepliesPagesIpfsSchema.shape.pageCids
});
