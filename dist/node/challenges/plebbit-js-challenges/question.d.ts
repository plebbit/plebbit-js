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
        success?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        challenge?: undefined;
        verify?: undefined;
        type?: undefined;
    } | {
        success: boolean;
        challenge?: undefined;
        verify?: undefined;
        type?: undefined;
        error?: undefined;
    }>;
    optionInputs: ({
        option: string;
        label: string;
        default: string;
        description: string;
        placeholder: string;
        required?: undefined;
    } | {
        option: string;
        label: string;
        default: string;
        description: string;
        placeholder: string;
        required: boolean;
    })[];
    type: string;
    challenge: any;
    description: string;
};
export default ChallengeFileFactory;
