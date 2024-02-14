import { Challenge, ChallengeResult, SubplebbitChallenge } from '../../../../../subplebbit/types.js';
import { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from '../../../../../types.js';
import { LocalSubplebbit } from '../../local-subplebbit.js';
declare const shouldExcludePublication: (subplebbitChallenge: SubplebbitChallenge, publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"], subplebbit: LocalSubplebbit) => boolean;
declare const shouldExcludeChallengeSuccess: (subplebbitChallenge: SubplebbitChallenge, challengeResults: (Challenge | ChallengeResult)[]) => boolean;
declare const shouldExcludeChallengeCommentCids: (subplebbitChallenge: any, challengeRequestMessage: any, plebbit: any) => Promise<boolean>;
export { shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess };
