import { Challenge, ChallengeResult, SubplebbitChallenge } from '../../../../subplebbit/types';
import { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from '../../../../types';
import { Subplebbit } from '../../../../subplebbit/subplebbit';
declare const shouldExcludePublication: (subplebbitChallenge: SubplebbitChallenge, publication: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor["publication"], subplebbit: Subplebbit) => boolean;
declare const shouldExcludeChallengeSuccess: (subplebbitChallenge: SubplebbitChallenge, challengeResults: (Challenge | ChallengeResult)[]) => boolean;
declare const shouldExcludeChallengeCommentCids: (subplebbitChallenge: any, challengeRequestMessage: any, plebbit: any) => Promise<boolean>;
export { shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess };
