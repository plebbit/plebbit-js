declare function ChallengeFileFactory(subplebbitChallengeSettings: any): {
    getChallenge: (subplebbitChallengeSettings: any, challengeRequestMessage: any, challengeIndex: any) => Promise<{
        success: boolean;
        error: any;
    }>;
    optionInputs: {
        option: string;
        label: string;
        default: string;
        description: string;
        placeholder: string;
    }[];
    type: string;
    description: string;
};
export default ChallengeFileFactory;