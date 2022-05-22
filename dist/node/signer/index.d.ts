/// <reference types="node" />
import {CreateSignerOptions} from "../types";
import {Buffer} from "buffer";

export {signPublication, verifyPublication, Signature} from "./signatures";
export {encrypt, decrypt} from "./encryption";

export declare class Signer {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Buffer;

    constructor(props: any);

    toJSON(): {
        type: "rsa";
        privateKey: string;
        publicKey: string;
        address: string;
        ipfsKey: Buffer;
    };
}

export declare const createSigner: (createSignerOptions?: CreateSignerOptions) => Promise<Signer>;
