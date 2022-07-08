import Publication from "../publication";
import { Plebbit } from "../plebbit";
import { Signer } from ".";
export declare class Signature {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: string[];
    constructor(props: Signature);
    toJSON?(): {
        signature: string;
        publicKey: string;
        type: "rsa";
        signedPropertyNames: string[];
    };
}
export declare const signBufferRsa: (bufferToSign: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
export declare const verifyBufferRsa: (bufferToSign: any, bufferSignature: any, publicKeyPem: any) => Promise<any>;
export declare function signPublication(publication: Publication, signer: Signer, plebbit: Plebbit): Promise<Signature>;
export declare function verifyPublication(publication: any, plebbit: Plebbit, overrideAuthorAddressIfInvalid?: boolean): Promise<(string | boolean)[]>;
