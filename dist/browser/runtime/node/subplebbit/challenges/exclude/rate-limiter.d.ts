import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import type { ChallengeResult, Exclude, SubplebbitChallenge } from "../../../../../subplebbit/types.js";
declare const testRateLimit: (exclude: Exclude, request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => boolean;
declare const addToRateLimiter: (subplebbitChallenges: SubplebbitChallenge[], request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, challengeSuccess: ChallengeResult["success"]) => void;
export { addToRateLimiter, testRateLimit };
