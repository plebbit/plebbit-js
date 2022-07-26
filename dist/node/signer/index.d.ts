import { CreateSignerOptions, SignerType } from "../types";
export { signPublication, verifyPublication, Signature } from "./signatures";
export { encrypt, decrypt } from "./encryption";
export declare class Signer implements SignerType {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Uint8Array;
    usage?: "comment" | "subplebbit";
    ipnsKeyName?: string;
    constructor(props: SignerType);
}
export declare const createSigner: (createSignerOptions?: CreateSignerOptions) => Promise<Signer>;
