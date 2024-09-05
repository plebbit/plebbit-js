// Create Vote section here

import { z } from "zod";
import {
    ChallengeRequestToEncryptBaseSchema,
    CidStringSchema,
    CreatePublicationUserOptionsSchema,
    JsonSignatureSchema,
    PlebbitTimestampSchema,
    PublicationBaseBeforeSigning,
    SignerWithAddressPublicKeySchema
} from "../../schema/schema.js";
import * as remeda from "remeda";
import type { VoteSignedPropertyNamesUnion } from "../../signer/types";
import { keysToOmitFromSignedPropertyNames } from "../../signer/constants.js";

export const CreateVoteUserOptionsSchema = CreatePublicationUserOptionsSchema.extend({
    commentCid: CidStringSchema,
    vote: z.union([z.literal(1), z.literal(0), z.literal(-1)])
}).strict();

export const VoteOptionsToSignSchema = CreateVoteUserOptionsSchema.merge(PublicationBaseBeforeSigning);

export const LocalVoteOptionsAfterSigningSchema = VoteOptionsToSignSchema.extend({ signature: JsonSignatureSchema }).merge(
    ChallengeRequestToEncryptBaseSchema
);

export const VoteSignedPropertyNames = remeda.keys.strict(
    remeda.omit(CreateVoteUserOptionsSchema.shape, keysToOmitFromSignedPropertyNames)
);

const votePickOptions = <Record<VoteSignedPropertyNamesUnion | "signature", true>>(
    remeda.mapToObj([...VoteSignedPropertyNames, "signature"], (x) => [x, true])
);

// Will be used by the sub when parsing request.publication
export const VotePubsubMessagePublicationSchema = LocalVoteOptionsAfterSigningSchema.pick(votePickOptions)
    .merge(z.object({ author: LocalVoteOptionsAfterSigningSchema.shape.author.passthrough() }))
    .strict();

export const VoteTablesRowSchema = VotePubsubMessagePublicationSchema.pick({
    commentCid: true,
    protocolVersion: true,
    timestamp: true,
    vote: true
}).extend({
    insertedAt: PlebbitTimestampSchema,
    authorSignerAddress: SignerWithAddressPublicKeySchema.shape.address,
    extraProps: z.object({}).passthrough().optional()
});

export const VotePubsubReservedFields = remeda.difference(
    [
        ...remeda.keys.strict(VoteTablesRowSchema.shape),
        ...remeda.keys.strict(ChallengeRequestToEncryptBaseSchema.shape),
        "shortSubplebbitAddress",
        "state",
        "publishingState",
        "signer",
        "clients"
    ],
    remeda.keys.strict(VotePubsubMessagePublicationSchema.shape)
);

export const VoteChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: VotePubsubMessagePublicationSchema.passthrough()
});

export const CreateVoteFunctionArgumentSchema =
    CreateVoteUserOptionsSchema.or(VotePubsubMessagePublicationSchema).or(VoteChallengeRequestToEncryptSchema);
