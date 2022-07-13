import { Plebbit } from "../plebbit";
import { Signer } from ".";
import { SignedPropertyNames } from "../types";
export declare const SIGNED_PROPERTY_NAMES: Record<"COMMENT" | "COMMENT_EDIT" | "COMMENT_UPDATE" | "VOTE" | "SUBPLEBBIT", SignedPropertyNames>;
export declare class Signature {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: SignedPropertyNames;
    constructor(props: Signature);
    toJSON?(): {
        signature: string;
        publicKey: string;
        type: "rsa";
        signedPropertyNames: SignedPropertyNames;
    };
}
export declare const signBufferRsa: (bufferToSign: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
export declare const verifyBufferRsa: (bufferToSign: any, bufferSignature: any, publicKeyPem: any) => Promise<any>;
export declare function signPublication(publication: any, signer: Signer, plebbit: Plebbit, signedPropertyNames: SignedPropertyNames): Promise<Signature>;
export declare function verifyPublication(publication: any, plebbit: Plebbit, overrideAuthorAddressIfInvalid?: boolean): Promise<(string | boolean)[]>;
