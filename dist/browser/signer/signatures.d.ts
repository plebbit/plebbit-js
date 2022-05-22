export declare class Signature {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: string[];
    constructor(props: any);
    toJSON(): {
        signature: string;
        publicKey: string;
        type: "rsa";
        signedPropertyNames: string[];
    };
}
export declare function signPublication(publication: any, signer: any): Promise<Signature>;
export declare function verifyPublication(publication: any): Promise<(string | boolean)[]>;
