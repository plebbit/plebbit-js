import { z } from "zod";
import { isIpfsCid } from "../util";
import { messages } from "../errors";
import { JsonSignature, VoteSignedPropertyNames, VoteSignedPropertyNamesUnion } from "../signer/constants";
import * as remeda from "remeda";
import { ProtocolVersion } from "../types";

// Options as inputed by user when they call await Plebbit(options)
// const plebbitUserOptions = z.object({
//     ipfsGatewayUrls: z.array(z.string().url()).optional(),
//     ipfsHttpClientsOptions
// });

// TODO add validation for private key here
export const CreateSignerSchema = z.object({ type: z.enum(["ed25519"]), privateKey: z.string() }).strict();

const SignerWithAddressSchema = CreateSignerSchema.extend({
    address: z.string() // TODO add validation for signer address here
});

const SubplebbitAddressSchema = z.string(); // TODO add a regex for checking if it's a domain or IPNS address

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

// Challenge requests and pubsub here

// Should be extended to add publication, which should be defined with every type (vote, comment, edit)
const DecryptedChallengeRequestBaseSchema = CreatePublicationUserOptionsSchema.pick({ challengeAnswers: true, challengeCommentCids: true });

// Create Vote section here

export const CreateVoteUserOptionsSchema = CreatePublicationUserOptionsSchema.extend({
    commentCid: CommentCidSchema,
    vote: z.union([z.literal(1), z.literal(0), z.literal(-1)])
}).strict();

export const VoteOptionsToSignSchema = CreateVoteUserOptionsSchema.extend({
    signer: SignerWithAddressSchema,
    timestamp: PlebbitTimestampSchema,
    author: AuthorPubsubSchema,
    protocolVersion: ProtocolVersionSchema
});

const LocalVoteOptionsSchema = VoteOptionsToSignSchema.extend({ signature: JsonSignatureSchema }).merge(
    DecryptedChallengeRequestBaseSchema
);

const pickOptions = <Record<VoteSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...VoteSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);

export const VotePubsubMessageSchema = LocalVoteOptionsSchema.pick(pickOptions).strict();

export const DecryptedChallengeRequestVoteSchema = DecryptedChallengeRequestBaseSchema.extend({ publication: VotePubsubMessageSchema }).strict();

export const CreateVoteFunctionArgumentSchema =
    CreateVoteUserOptionsSchema.or(VotePubsubMessageSchema).or(DecryptedChallengeRequestVoteSchema);
// Options as inputted by user to create a new comment and sign
