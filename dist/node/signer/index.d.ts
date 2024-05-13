import { CreateSignerOptions, SignerType } from "./constants.js";
export { verifyComment, verifySubplebbit, verifyVote } from "./signatures.js";
export { encryptEd25519AesGcm, decryptEd25519AesGcm, decryptEd25519AesGcmPublicKeyBuffer } from "./encryption.js";
export declare class Signer implements SignerType {
    type: "ed25519";
    privateKey: string;
    publicKey?: string;
    address: string;
    shortAddress: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;
    constructor(props: SignerType);
}
export declare class SignerWithPublicKeyAddress extends Signer {
    publicKey: string;
    constructor(props: SignerType & {
        publicKey: string;
    });
}
export declare const createSigner: (createSignerOptions?: CreateSignerOptions) => Promise<SignerWithPublicKeyAddress>;
