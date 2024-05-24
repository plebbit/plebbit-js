import { z } from "zod";
import {
    CreateVoteUserOptionsSchema,
    DecryptedChallengeRequestVoteSchema,
    LocalVoteOptionsAfterSigningSchema,
    VoteJsonSchema,
    VoteOptionsToSignSchema,
    VotePubsubMessageSchema
} from "./schema";
import { AuthorPubsubType } from "../../types";
import { SubplebbitAuthor } from "../comment/types";

export type LocalVoteOptions = z.infer<typeof LocalVoteOptionsAfterSigningSchema>;

export type DecryptedChallengeRequestVote = z.infer<typeof DecryptedChallengeRequestVoteSchema>;

// TODO move this to generic
export type ChallengeRequestVoteWithSubplebbitAuthor = VotePubsubMessage & {
    author: AuthorPubsubType & { subplebbit: SubplebbitAuthor | undefined };
};

export type VotePubsubMessage = z.infer<typeof VotePubsubMessageSchema>;
export type VoteTypeJson = z.infer<typeof VoteJsonSchema>;

export type CreateVoteOptions = z.infer<typeof CreateVoteUserOptionsSchema>;

export type VoteOptionsToSign = z.infer<typeof VoteOptionsToSignSchema>;
