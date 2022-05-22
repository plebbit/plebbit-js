import { CreateSignerOptions } from "../types";
import {
    generatePrivateKeyPem,
    getPublicKeyPemFromPrivateKeyPem,
    getPlebbitAddressFromPrivateKeyPem,
    getIpfsKeyFromPrivateKeyPem
} from "./util";
import assert from "assert";
import { Buffer } from "buffer";
export { signPublication, verifyPublication, Signature } from "./signatures";
export { encrypt, decrypt } from "./encryption";

export class Signer {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Buffer;

    constructor(props) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.ipfsKey = Buffer.from(props.ipfsKey);
    }

    toJSON() {
        return {
            type: this.type,
            privateKey: this.privateKey,
            publicKey: this.publicKey,
            address: this.address,
            ipfsKey: this.ipfsKey
        };
    }
}

export const createSigner = async (createSignerOptions: CreateSignerOptions = {}) => {
    let { privateKey, type: signerType } = createSignerOptions;
    if (privateKey) {
        assert.equal(signerType, "rsa", "invalid signer createSignerOptions.type, not 'rsa'");
    } else {
        privateKey = await generatePrivateKeyPem();
        signerType = "rsa";
    }

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
