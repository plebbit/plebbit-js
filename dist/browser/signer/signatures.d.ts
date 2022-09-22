import { Plebbit } from "../plebbit";
import { Signer } from ".";
import { PublicationsToSign, PublicationToVerify, SignatureType, SignatureTypes, SignedPropertyNames } from "../types";
export declare const SIGNED_PROPERTY_NAMES: Record<SignatureTypes, SignedPropertyNames>;
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
export declare function signPublication(publication: PublicationsToSign, signer: Signer, plebbit: Plebbit, signatureType: SignatureTypes): Promise<Signature>;
export declare function verifyPublication(publication: PublicationToVerify, plebbit: Plebbit, signatureType: SignatureTypes, overrideAuthorAddressIfInvalid?: boolean): Promise<[boolean, string | undefined]>;
