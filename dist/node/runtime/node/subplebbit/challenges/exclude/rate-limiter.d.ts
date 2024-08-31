import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import type { ChallengeResult, Exclude, SubplebbitChallenge } from "../../../../../subplebbit/types.js";
declare const testRateLimit: (exclude: Exclude, publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]) => boolean;
declare const addToRateLimiter: (subplebbitChallenges: SubplebbitChallenge[], publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"], challengeSuccess: ChallengeResult["success"]) => void;
export { addToRateLimiter, testRateLimit };
