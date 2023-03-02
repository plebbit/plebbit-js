import { SingersTableRowInsert } from "../types";
import { CreateSignerOptions, SignerType } from "./constants";
export { verifyComment, verifySubplebbit, verifyVote } from "./signatures";
export { encryptEd25519AesGcm as encrypt, decryptEd25519AesGcm as decrypt } from "./encryption";
export declare class Signer implements SignerType {
    type: "ed25519";
    privateKey: string;
    publicKey?: string;
    address: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;
    constructor(props: SignerType);
    toJSONSignersTableRow(): SingersTableRowInsert;
}
export declare const createSigner: (createSignerOptions?: CreateSignerOptions) => Promise<Signer>;
