import { z } from "zod";
import { isIpfsCid } from "../util.js";
import { messages } from "../errors.js";
import * as remeda from "remeda";

// TODO add validation for private key here
export const CreateSignerSchema = z.object({ type: z.enum(["ed25519"]), privateKey: z.string() });

export const SignerWithAddressPublicKeySchema = CreateSignerSchema.extend({
    address: z.string(), // TODO add validation for signer address here
    publicKey: z.string() // TODO add validation for public key here
});

export const SignerWithAddressPublicKeyShortAddressSchema = SignerWithAddressPublicKeySchema.extend({
    shortAddress: z.string().length(12)
});

export const SubplebbitAddressSchema = z.string().min(1); // TODO add a regex for checking if it's a domain or IPNS address

export const AuthorAddressSchema = z.string().min(1);

export const PlebbitTimestampSchema = z.number().positive().int(); // Math.round(Date.now() / 1000)

const regexSemverNumberedGroups =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export const ProtocolVersionSchema = z.string().regex(regexSemverNumberedGroups);

export const UserAgentSchema = z.string(); // TODO should use regex to validate

const WalletSchema = z.object({
    address: z.string(),
    timestamp: PlebbitTimestampSchema,
    signature: z.object({ signature: z.string().startsWith("0x"), type: z.enum(["eip191"]) })
});

export const CidStringSchema = z.string().refine((arg) => isIpfsCid(arg), messages.ERR_CID_IS_INVALID); // TODO should change name to CidStringSchema

// '/ipfs/QmeBYYTTmRNmwbcSVw5TpdxsmR26HeNs8P47FYXQZ65NS1' => 'QmeBYYTTmRNmwbcSVw5TpdxsmR26HeNs8P47FYXQZ65NS1'
export const CidPathSchema = z
    .string()
    .transform((arg) => arg.split("/")[2])
    .refine((arg) => isIpfsCid(arg), messages.ERR_CID_IS_INVALID);

const ChainTickerSchema = z.string().min(1); // chain ticker can be anything for now

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

export const FlairSchema = z
    .object({
        text: z.string(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        expiresAt: PlebbitTimestampSchema.optional()
    })
    .passthrough();

// When author creates their publication, this is publication.author
export const AuthorPubsubSchema = z
    .object({
        address: AuthorAddressSchema,
        previousCommentCid: CidStringSchema.optional(),
        displayName: z.string().optional(),
        wallets: AuthorWalletsSchema.optional(),
        avatar: AuthorAvatarNftSchema.optional(),
        flair: FlairSchema.optional()
    })
    .strict();

export const ChallengeAnswerStringSchema = z.string(); // TODO add validation for challenge answer

export const ChallengeAnswersSchema = ChallengeAnswerStringSchema.array().nonempty(); // for example ["1+1=2", "3+3=6"]
export const CreatePublicationUserOptionsSchema = z.object({
    signer: CreateSignerSchema,
    author: AuthorPubsubSchema.partial().optional(),
    subplebbitAddress: SubplebbitAddressSchema,
    protocolVersion: ProtocolVersionSchema.optional(),
    timestamp: PlebbitTimestampSchema.optional(),
    challengeAnswers: ChallengeAnswersSchema.optional(),
    challengeCommentCids: CidStringSchema.array().optional()
});

export const JsonSignatureSchema = z.object({
    type: z.enum(["ed25519", "eip191"]),
    signature: z.string(), // No need to validate here, it will be validated in verify signature function
    publicKey: z.string(),
    signedPropertyNames: z.string().array().nonempty()
});

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
        lastCommentCid: CidStringSchema // last comment by the author in the subplebbit, can be used with author.previousCommentCid to get a recent author comment history in all subplebbits
    })
    .passthrough();
export const CommentAuthorSchema = SubplebbitAuthorSchema.pick({ banExpiresAt: true, flair: true });

export const AuthorWithOptionalCommentUpdateSchema = AuthorPubsubSchema.extend({
    subplebbit: SubplebbitAuthorSchema.optional() // (added by CommentUpdate) up to date author properties specific to the subplebbit it's in
});

export const AuthorReservedFields = remeda.difference(
    remeda.unique([...remeda.keys.strict(AuthorWithOptionalCommentUpdateSchema.shape), "shortAddress"]),
    remeda.keys.strict(AuthorPubsubSchema.shape)
);

// Challenge requests and pubsub here

// Should be extended to add publication, which should be defined with every type (vote, comment, edit)

export const ChallengeRequestToEncryptBaseSchema = CreatePublicationUserOptionsSchema.pick({
    challengeAnswers: true,
    challengeCommentCids: true
});
