import { CreateSignerOptions, SignerType } from "../types";
import { generatePrivateKeyPem, getPublicKeyPemFromPrivateKeyPem, getPlebbitAddressFromPrivateKeyPem } from "./util";
export { Signature, verifyComment, verifySubplebbit, verifyVote } from "./signatures";
export { encrypt, decrypt } from "./encryption";

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

    const [publicKey, address] = await Promise.all([
        getPublicKeyPemFromPrivateKeyPem(privateKey),
        getPlebbitAddressFromPrivateKeyPem(privateKey)
    ]);

    return new Signer({
        type: signerType,
        publicKey,
        address,
        privateKey
    });
};
