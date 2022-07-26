import { Plebbit } from "../plebbit";
import { Signer } from ".";
import { PublicationTypeName, SignatureType, SignedPropertyNames } from "../types";
export declare const SIGNED_PROPERTY_NAMES: Record<PublicationTypeName, SignedPropertyNames>;
export declare class Signature implements SignatureType {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: SignedPropertyNames;
    constructor(props: SignatureType);
    toJSON(): {
        signature: string;
        publicKey: string;
        type: "rsa";
        signedPropertyNames: SignedPropertyNames;
    };
}
export declare const signBufferRsa: (bufferToSign: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
export declare const verifyBufferRsa: (bufferToSign: any, bufferSignature: any, publicKeyPem: any) => Promise<any>;
export declare function signPublication(publication: any, signer: Signer, plebbit: Plebbit, publicationType: PublicationTypeName): Promise<Signature>;
export declare function verifyPublication(publication: any, plebbit: Plebbit, publicationType: PublicationTypeName, overrideAuthorAddressIfInvalid?: boolean): Promise<[boolean, string | undefined]>;
