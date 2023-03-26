declare const shouldExcludePublication: (subplebbitChallenge: any, publication: any, subplebbit: any) => boolean;
declare const shouldExcludeChallengeSuccess: (subplebbitChallenge: any, challengeResults: any) => boolean;
declare const shouldExcludeChallengeCommentCids: (subplebbitChallenge: any, challengeRequestMessage: any, plebbit: any) => Promise<boolean>;
export { shouldExcludeChallengeCommentCids, shouldExcludePublication, shouldExcludeChallengeSuccess };
