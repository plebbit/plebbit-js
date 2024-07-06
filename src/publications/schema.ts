import { z } from "zod";

export const PublicationPublishingState = z.enum([
    "stopped",
    "resolving-subplebbit-address",
    "fetching-subplebbit-ipns",
    "fetching-subplebbit-ipfs",
    "publishing-challenge-request",
    "waiting-challenge",
    "waiting-challenge-answers",
    "publishing-challenge-answer",
    "waiting-challenge-verification",
    "failed",
    "succeeded"
]);

export const PublicationStateSchema = z.enum(["stopped", "publishing"]);
