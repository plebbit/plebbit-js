import { z } from "zod";
import {
    CreateVoteUserOptionsSchema,
    LocalVoteOptionsAfterSigningSchema,
    VoteChallengeRequestToEncryptSchema,
    VoteOptionsToSignSchema,
    VotePubsubMessagePublicationSchema
} from "./schema";
import Vote from "./vote";
import { AuthorTypeWithCommentUpdate, JsonOfClass } from "../../types";

export type LocalVoteOptions = z.infer<typeof LocalVoteOptionsAfterSigningSchema>;

export type VotePubsubMessagePublication = z.infer<typeof VotePubsubMessagePublicationSchema>;

export type CreateVoteOptions = z.infer<typeof CreateVoteUserOptionsSchema>;

export type VoteChallengeRequestToEncryptType = z.infer<typeof VoteChallengeRequestToEncryptSchema>;

export type VoteOptionsToSign = z.infer<typeof VoteOptionsToSignSchema>;

export type VoteJson = JsonOfClass<Vote>;

export interface VotePubsubMessageWithSubplebbitAuthor extends VotePubsubMessagePublication {
    author: AuthorTypeWithCommentUpdate;
}
