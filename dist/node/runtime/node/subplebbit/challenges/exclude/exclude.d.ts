import { Challenge, ChallengeResult, SubplebbitChallenge } from "../../../../../subplebbit/types.js";
import { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../types.js";
import { LocalSubplebbit } from "../../local-subplebbit.js";
import { Plebbit } from "../../../../../plebbit.js";
declare const shouldExcludePublication: (subplebbitChallenge: SubplebbitChallenge, publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"], subplebbit: LocalSubplebbit) => boolean;
declare const shouldExcludeChallengeSuccess: (subplebbitChallenge: SubplebbitChallenge, challengeResults: (Challenge | ChallengeResult)[]) => boolean;
declare const shouldExcludeChallengeCommentCids: (subplebbitChallenge: SubplebbitChallenge, challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, plebbit: Plebbit) => Promise<boolean>;
export { shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess };
