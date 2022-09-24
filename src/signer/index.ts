import { CreateSignerOptions, SignerType } from "../types";
import {
    generatePrivateKeyPem,
    getPublicKeyPemFromPrivateKeyPem,
    getPlebbitAddressFromPrivateKeyPem,
    getIpfsKeyFromPrivateKeyPem
} from "./util";
export { signPublication, verifyPublication, Signature } from "./signatures";
export { encrypt, decrypt } from "./encryption";

export class Signer implements SignerType {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Uint8Array;
    usage?: "comment" | "subplebbit";
    ipnsKeyName?: string;

    constructor(props: SignerType) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.ipfsKey = props.ipfsKey ? new Uint8Array(props.ipfsKey) : undefined;
        this.usage = props.usage;
        this.ipnsKeyName = props.ipnsKeyName;
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

    const publicKeyPem = await getPublicKeyPemFromPrivateKeyPem(privateKey);
    const address = await getPlebbitAddressFromPrivateKeyPem(privateKey);
    const ipfsKey = await getIpfsKeyFromPrivateKeyPem(privateKey);

    return new Signer({
        privateKey: privateKey,
        type: signerType,
        publicKey: publicKeyPem,
        address: address,
        ipfsKey: ipfsKey
    });
};
