import assert from "assert";
import { CreateSignerOptions, SignersTableRow, SignerType } from "../types";
import { generatePrivateKey, getPublicKeyFromPrivateKey, getPlebbitAddressFromPrivateKey } from "./util";
export { verifyComment, verifySubplebbit, verifyVote } from "./signatures";
export { encryptEd25519AesGcm as encrypt, decryptEd25519AesGcm as decrypt } from "./encryption";

export class Signer implements SignerType {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;

    constructor(props: SignerType) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.ipnsKeyName = props.ipnsKeyName;

        this.ipfsKey =
            props.ipfsKey?.constructor?.name === "Object"
                ? new Uint8Array(Object.values(props.ipfsKey))
                : props.ipfsKey
                ? new Uint8Array(props.ipfsKey)
                : undefined;
    }

    toJSONSignersTableRow(): SignersTableRow {
        assert(this.type && this.privateKey && this.ipnsKeyName);
        return { type: this.type, privateKey: this.privateKey, ipnsKeyName: this.ipnsKeyName };
    }
}

export const createSigner = async (createSignerOptions: CreateSignerOptions = {}) => {
    let { privateKey, type: signerType } = createSignerOptions;
    if (privateKey) {
        if (signerType !== "rsa") throw Error("invalid signer createSignerOptions.type, not 'rsa'");
    } else {
        privateKey = await generatePrivateKey();
        signerType = "rsa";
    }
    if (typeof signerType !== "string") throw Error("createSignerOptions does not include type");

    const [publicKey, address] = await Promise.all([getPublicKeyFromPrivateKey(privateKey), getPlebbitAddressFromPrivateKey(privateKey)]);

    return new Signer({
        type: signerType,
        publicKey,
        address,
        privateKey
    });
};
