import { Encrypted } from "./constants";
export declare const encryptStringAesGcm: (plaintext: any, key: any, iv?: any) => Promise<{
    ciphertext: Uint8Array;
    iv: any;
    tag: Uint8Array;
}>;
export declare const decryptStringAesGcm: (ciphertext: any, key: any, iv: any, tag: any) => Promise<any>;
export declare const encryptEd25519AesGcm: (plaintext: any, privateKeyBase64: any, publicKeyBase64: any) => Promise<Encrypted>;
export declare const decryptEd25519AesGcm: (encrypted: Encrypted, privateKeyBase64: any, publicKeyBase64: any) => Promise<any>;
