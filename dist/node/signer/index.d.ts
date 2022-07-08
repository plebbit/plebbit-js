import { CreateSignerOptions } from "../types";
export { signPublication, verifyPublication, Signature } from "./signatures";
export { encrypt, decrypt } from "./encryption";
export declare class Signer {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Uint8Array;
    usage?: "comment" | "subplebbit";
    ipnsKeyName?: string;
    constructor(props: Signer);
}
export declare const createSigner: (createSignerOptions?: CreateSignerOptions) => Promise<Signer>;
