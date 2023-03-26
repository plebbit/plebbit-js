declare function ChallengeFileFactory(subplebbitChallengeSettings: any): {
    getChallenge: (subplebbitChallengeSettings: any, challengeRequestMessage: any, challengeIndex: any) => Promise<{
        challenge: any;
        verify: (_answer: any) => Promise<{
            success: boolean;
            error?: undefined;
        } | {
            success: boolean;
            error: string;
        }>;
        type: string;
    }>;
    optionInputs: {
        option: string;
        label: string;
        description: string;
    }[];
    type: string;
};
export default ChallengeFileFactory;
