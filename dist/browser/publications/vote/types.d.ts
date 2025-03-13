import { z } from "zod";
import { CreateVoteUserOptionsSchema, VoteChallengeRequestToEncryptSchema, VotePubsubMessagePublicationSchema, VoteSignedPropertyNames } from "./schema";
import Vote from "./vote";
import { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";
import { JsonSignature, SignerType } from "../../signer/types";
export type CreateVoteOptions = z.infer<typeof CreateVoteUserOptionsSchema>;
export type VoteChallengeRequestToEncryptType = z.infer<typeof VoteChallengeRequestToEncryptSchema>;
export type VoteJson = JsonOfClass<Vote>;
export interface VoteOptionsToSign extends Omit<VotePubsubMessagePublication, "signature"> {
    signer: SignerType;
}
export interface VoteSignature extends JsonSignature {
    signedPropertyNames: typeof VoteSignedPropertyNames;
}
export type VotePubsubMessagePublication = z.infer<typeof VotePubsubMessagePublicationSchema>;
export interface VotePubsubMessageWithSubplebbitAuthor extends VotePubsubMessagePublication {
    author: AuthorTypeWithCommentUpdate;
}
