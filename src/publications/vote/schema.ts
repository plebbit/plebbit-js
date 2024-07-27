// Create Vote section here

import { z } from "zod";
import {
    AuthorPubsubJsonSchema,
    ChallengeRequestToEncryptBaseSchema,
    CidStringSchema,
    CreatePublicationUserOptionsSchema,
    JsonSignatureSchema,
    PublicationBaseBeforeSigning,
    ShortSubplebbitAddressSchema
} from "../../schema/schema";
import * as remeda from "remeda";
import { VoteSignedPropertyNamesUnion } from "../../signer/types";
import { keysToOmitFromSignature } from "../../signer/constants";

export const CreateVoteUserOptionsSchema = CreatePublicationUserOptionsSchema.extend({
    commentCid: CidStringSchema,
    vote: z.union([z.literal(1), z.literal(0), z.literal(-1)])
}).strict();

export const VoteOptionsToSignSchema = CreateVoteUserOptionsSchema.merge(PublicationBaseBeforeSigning);

export const LocalVoteOptionsAfterSigningSchema = VoteOptionsToSignSchema.extend({ signature: JsonSignatureSchema }).merge(
    ChallengeRequestToEncryptBaseSchema
);

export const VoteSignedPropertyNames = remeda.keys.strict(remeda.omit(CreateVoteUserOptionsSchema.shape, keysToOmitFromSignature));

const votePickOptions = <Record<VoteSignedPropertyNamesUnion | "signature" | "protocolVersion", true>>(
    remeda.mapToObj([...VoteSignedPropertyNames, "signature", "protocolVersion"], (x) => [x, true])
);

export const VotePubsubMessageSchema = LocalVoteOptionsAfterSigningSchema.pick(votePickOptions).strict();

export const VoteChallengeRequestToEncryptSchema = ChallengeRequestToEncryptBaseSchema.extend({
    publication: VotePubsubMessageSchema
}).strict();

export const VoteJsonSchema = VotePubsubMessageSchema.extend({
    shortSubplebbitAddress: ShortSubplebbitAddressSchema,
    author: AuthorPubsubJsonSchema
}).strict();

export const CreateVoteFunctionArgumentSchema = CreateVoteUserOptionsSchema.or(VotePubsubMessageSchema)
    .or(VoteChallengeRequestToEncryptSchema)
    .or(VoteJsonSchema);
