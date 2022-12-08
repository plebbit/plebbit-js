import { CreateSignerOptions, SignerType } from "../types";
export { Signature, verifyComment, verifySubplebbit, verifyVote } from "./signatures";
export { encrypt, decrypt } from "./encryption";
export declare class Signer implements SignerType {
    readonly type: "rsa";
    readonly privateKey: string;
    private publicKey?;
    private address?;
    private ipfsKey?;
    ipnsKeyName?: string;
    constructor(props: Pick<SignerType, "privateKey" | "type" | "ipnsKeyName">);
    getPublicKey(): Promise<string>;
    getAddress(): Promise<string>;
    getIpfsKey(): Promise<Uint8Array>;
}
export declare const createSigner: (createSignerOptions?: CreateSignerOptions) => Promise<Signer>;
