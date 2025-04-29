import type { Encrypted } from "./types.js";
export declare const encryptStringAesGcm: (plaintext: string, key: Uint8Array, iv?: Uint8Array) => Promise<{
    ciphertext: Uint8Array<ArrayBufferLike>;
    iv: Uint8Array<ArrayBufferLike>;
    tag: Uint8Array<ArrayBufferLike>;
}>;
export declare const decryptStringAesGcm: (ciphertext: Uint8Array, key: Uint8Array, iv: Uint8Array, tag: Uint8Array) => Promise<string>;
export declare const encryptEd25519AesGcm: (plaintext: string, privateKeyBase64: string, publicKeyBase64: string) => Promise<{
    type: "ed25519-aes-gcm";
    ciphertext: Uint8Array<ArrayBuffer>;
    iv: Uint8Array<ArrayBuffer>;
    tag: Uint8Array<ArrayBuffer>;
}>;
export declare const encryptEd25519AesGcmPublicKeyBuffer: (plaintext: string, privateKeyBase64: string, publicKeyBuffer: Uint8Array) => Promise<{
    type: "ed25519-aes-gcm";
    ciphertext: Uint8Array<ArrayBuffer>;
    iv: Uint8Array<ArrayBuffer>;
    tag: Uint8Array<ArrayBuffer>;
}>;
export declare const decryptEd25519AesGcm: (encrypted: Encrypted, privateKeyBase64: string, publicKeyBase64: string) => Promise<string>;
export declare const decryptEd25519AesGcmPublicKeyBuffer: (encrypted: Encrypted, privateKeyBase64: string, publicKeyBuffer: Uint8Array) => Promise<string>;
