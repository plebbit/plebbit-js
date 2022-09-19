import { Encrypted } from "../types";
export declare const generateKeyAesCbc: () => Promise<Uint8Array>;
export declare const encryptStringAesCbc: (stringToEncrypt: any, key: any) => Promise<string>;
export declare const decryptStringAesCbc: (encryptedString: any, key: any) => Promise<any>;
export declare const encryptBufferRsa: (stringToEncrypt: any, publicKeyPem: any) => Promise<string>;
export declare const decryptBufferRsa: (encryptedStringBase64: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
export declare const encrypt: (stringToEncrypt: any, publicKeyPem: any) => Promise<Encrypted>;
export declare const decrypt: (encryptedString: any, encryptedKey: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
