import { generatePrivateKey, getPublicKeyFromPrivateKey, getPlebbitAddressFromPrivateKey } from "./util.js";
import { shortifyAddress } from "../util.js";
export { verifyComment, verifySubplebbit, verifyVote } from "./signatures.js";
export { encryptEd25519AesGcm, decryptEd25519AesGcm, decryptEd25519AesGcmPublicKeyBuffer } from "./encryption.js";
export class Signer {
    constructor(props) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.shortAddress = shortifyAddress(this.address);
        this.ipnsKeyName = props.ipnsKeyName;
        this.ipfsKey =
            props.ipfsKey?.constructor?.name === "Object"
                ? new Uint8Array(Object.values(props.ipfsKey))
                : props.ipfsKey
                    ? new Uint8Array(props.ipfsKey)
                    : undefined;
    }
}
export const createSigner = async (createSignerOptions = {}) => {
    let { privateKey, type: signerType } = createSignerOptions;
    if (privateKey) {
        if (signerType !== "ed25519")
            throw Error("invalid signer createSignerOptions.type, not 'ed25519'");
    }
    else {
        privateKey = await generatePrivateKey();
        signerType = "ed25519";
    }
    if (typeof signerType !== "string")
        throw Error("createSignerOptions does not include type");
    const [publicKey, address] = await Promise.all([getPublicKeyFromPrivateKey(privateKey), getPlebbitAddressFromPrivateKey(privateKey)]);
    return new Signer({
        type: signerType,
        publicKey,
        address,
        privateKey
    });
};
//# sourceMappingURL=index.js.map