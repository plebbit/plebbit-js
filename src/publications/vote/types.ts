import { z } from "zod";
import {
    CreateVoteUserOptionsSchema,
    LocalVoteOptionsAfterSigningSchema,
    VoteChallengeRequestToEncryptSchema,
    VoteJsonSchema,
    VoteOptionsToSignSchema,
    VotePubsubMessageSchema
} from "./schema";
import { VotePubsubMessageWithSubplebbitAuthorSchema } from "../../pubsub-messages/schema";

export type LocalVoteOptions = z.infer<typeof LocalVoteOptionsAfterSigningSchema>;

export type VotePubsubMessageWithSubplebbitAuthor = z.infer<typeof VotePubsubMessageWithSubplebbitAuthorSchema>;

export type VotePubsubMessage = z.infer<typeof VotePubsubMessageSchema>;
export type VoteTypeJson = z.infer<typeof VoteJsonSchema>;

export type CreateVoteOptions = z.infer<typeof CreateVoteUserOptionsSchema>;

export type VoteChallengeRequestToEncryptType = z.infer<typeof VoteChallengeRequestToEncryptSchema>;

export type VoteOptionsToSign = z.infer<typeof VoteOptionsToSignSchema>;
