import type { Challenge, ChallengeResult, SubplebbitChallenge, SubplebbitSettings } from "../../../../../subplebbit/types.js";
import type { DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../../pubsub-messages/types.js";
import { LocalSubplebbit } from "../../local-subplebbit.js";
import { Plebbit } from "../../../../../plebbit/plebbit.js";
declare const shouldExcludePublication: (subplebbitChallenge: SubplebbitChallenge, request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit) => boolean;
declare const shouldExcludeChallengeSuccess: (subplebbitChallenge: NonNullable<SubplebbitSettings["challenges"]>[0], subplebbitChallengeIndex: number, challengeResults: (Challenge | ChallengeResult)[]) => boolean;
declare const shouldExcludeChallengeCommentCids: (subplebbitChallenge: SubplebbitChallenge, challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, plebbit: Plebbit) => Promise<boolean>;
export { shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess };
