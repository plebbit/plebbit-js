import { z } from "zod";
import { CreateVoteUserOptionsSchema, VoteChallengeRequestToEncryptSchema, VotePubsubMessagePublicationSchema, VoteSignedPropertyNames, VoteTablesRowSchema } from "./schema";
import Vote from "./vote";
import type { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";
import type { JsonSignature, SignerType } from "../../signer/types";
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
export type VotesTableRow = z.infer<typeof VoteTablesRowSchema>;
export type VotesTableRowInsert = VotesTableRow;
