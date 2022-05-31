import { CreateSignerOptions } from "../types";
export { signPublication, verifyPublication, Signature } from "./signatures";
export { encrypt, decrypt } from "./encryption";
export declare class Signer {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Uint8Array;
    constructor(props: any);
    toJSON(): {
        type: "rsa";
        privateKey: string;
        publicKey: string;
        address: string;
        ipfsKey: Uint8Array;
    };
}
export declare const createSigner: (createSignerOptions?: CreateSignerOptions) => Promise<Signer>;
