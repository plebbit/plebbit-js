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
} from "../../schema/schema";
import * as remeda from "remeda";
import { VoteSignedPropertyNamesUnion } from "../../signer/types";
import { keysToOmitFromSignedPropertyNames } from "../../signer/constants";

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

export const VotePubsubMessageSchema = LocalVoteOptionsAfterSigningSchema.pick(votePickOptions).strict();

export const VoteTablesRowSchema = VotePubsubMessageSchema.extend({
    authorAddress: VotePubsubMessageSchema.shape.author.shape.address,
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
    remeda.keys.strict(VotePubsubMessageSchema.shape)
);

export const VoteChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: VotePubsubMessageSchema.passthrough()
});

export const CreateVoteFunctionArgumentSchema =
    CreateVoteUserOptionsSchema.or(VotePubsubMessageSchema).or(VoteChallengeRequestToEncryptSchema);
