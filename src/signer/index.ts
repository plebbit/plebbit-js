import { CreateSignerOptions, SignerType } from "../types";
import {
    generatePrivateKeyPem,
    getPublicKeyPemFromPrivateKeyPem,
    getPlebbitAddressFromPrivateKeyPem,
    getIpfsKeyFromPrivateKeyPem
} from "./util";
export { Signature, verifyComment, verifySubplebbit, verifyVote } from "./signatures";
export { encrypt, decrypt } from "./encryption";

export class Signer implements SignerType {
    readonly type: "rsa";
    readonly privateKey: string;
    private publicKey?: string;
    private address?: string;
    private ipfsKey?: Uint8Array;
    ipnsKeyName?: string;

    constructor(props: Pick<SignerType, "privateKey" | "type" | "ipnsKeyName">) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.ipnsKeyName = props.ipnsKeyName;
    }
    async getPublicKey() {
        if (!this.publicKey) this.publicKey = await getPublicKeyPemFromPrivateKeyPem(this.privateKey);
        return this.publicKey;
    }
    async getAddress() {
        if (!this.address) this.address = await getPlebbitAddressFromPrivateKeyPem(this.privateKey);
        return this.address;
    }
    async getIpfsKey() {
        if (!this.ipfsKey) this.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKeyPem(this.privateKey));
        return this.ipfsKey;
    }
}

export const createSigner = async (createSignerOptions: CreateSignerOptions = {}) => {
    let { privateKey, type: signerType } = createSignerOptions;
    if (privateKey) {
        if (signerType !== "rsa") throw Error("invalid signer createSignerOptions.type, not 'rsa'");
    } else {
        privateKey = await generatePrivateKeyPem();
        signerType = "rsa";
    }
    if (typeof signerType !== "string") throw Error("createSignerOptions does not include type");

    return new Signer({
        privateKey: privateKey,
        type: signerType
    });
};
