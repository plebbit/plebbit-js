console.log("In general schema");

import { z } from "zod";
import { isIpfsCid } from "../util.js";
import { messages } from "../errors.js";

// TODO add validation for private key here
export const CreateSignerSchema = z.object({ type: z.enum(["ed25519"]), privateKey: z.string() });

export const SignerWithAddressPublicKeySchema = CreateSignerSchema.extend({
    address: z.string(), // TODO add validation for signer address here
    publicKey: z.string() // TODO add validation for public key here
});

export const SubplebbitAddressSchema = z.string(); // TODO add a regex for checking if it's a domain or IPNS address
export const ShortSubplebbitAddressSchema = z.string();

export const AuthorAddressSchema = z.string();
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

export const AuthorAvatarNftSchema = z
    .object({
        chainTicker: ChainTickerSchema,
        address: z.string(),
        id: z.string(),
        timestamp: PlebbitTimestampSchema,
        signature: z.object({ signature: z.string().startsWith("0x"), type: z.enum(["eip191"]) })
    })
    .strict();

export const FlairSchema = z.object({
    text: z.string(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    expiresAt: PlebbitTimestampSchema.optional()
});

// When author creates their publication, this is publication.author
export const AuthorPubsubSchema = z.object({
    address: AuthorAddressSchema, // TODO add a regex for checking if it's domain or 12D... address
    previousCommentCid: CommentCidSchema.optional(),
    displayName: z.string().optional(),
    wallets: AuthorWalletsSchema.optional(),
    avatar: AuthorAvatarNftSchema.optional(),
    flair: FlairSchema.optional()
});

export const CreatePublicationUserOptionsSchema = z.object({
    signer: CreateSignerSchema,
    author: AuthorPubsubSchema.partial().optional(),
    subplebbitAddress: SubplebbitAddressSchema,
    protocolVersion: ProtocolVersionSchema.optional(),
    timestamp: PlebbitTimestampSchema.optional(),
    challengeAnswers: z.string().array().optional(),
    challengeCommentCids: CommentCidSchema.array().optional()
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

export const SubplebbitAuthorSchema = z
    .object({
        postScore: z.number(), // total post karma in the subplebbit
        replyScore: z.number(), // total reply karma in the subplebbit
        banExpiresAt: PlebbitTimestampSchema.optional(), // timestamp in second, if defined the author was banned for this comment
        flair: FlairSchema.optional(), // not part of the signature, mod can edit it after comment is published
        firstCommentTimestamp: PlebbitTimestampSchema, // timestamp of the first comment by the author in the subplebbit, used for account age based challenges
        lastCommentCid: CommentCidSchema // last comment by the author in the subplebbit, can be used with author.previousCommentCid to get a recent author comment history in all subplebbits
    })
    .strict();
export const CommentAuthorSchema = SubplebbitAuthorSchema.pick({ banExpiresAt: true, flair: true });

export const AuthorWithOptionalCommentUpdate = AuthorPubsubSchema.extend({
    subplebbit: SubplebbitAuthorSchema.optional() // (added by CommentUpdate) up to date author properties specific to the subplebbit it's in
});

// Challenge requests and pubsub here

// Should be extended to add publication, which should be defined with every type (vote, comment, edit)

export const ChallengeRequestToEncryptBaseSchema = CreatePublicationUserOptionsSchema.pick({
    challengeAnswers: true,
    challengeCommentCids: true
});
