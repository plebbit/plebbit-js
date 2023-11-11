import { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from '../../../../types';
import { ChallengeResult, Exclude, SubplebbitChallenge } from "../../../../subplebbit/types";
declare const testRateLimit: (exclude: Exclude, publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"]) => boolean;
declare const addToRateLimiter: (subplebbitChallenges: SubplebbitChallenge[], publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"], challengeSuccess: ChallengeResult["success"]) => void;
export { addToRateLimiter, testRateLimit };
