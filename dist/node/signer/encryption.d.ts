export declare const generateKeyAesEcb: () => Promise<Uint8Array>;
export declare const encryptStringAesEcb: (stringToEncrypt: any, key: any) => Promise<string>;
export declare const decryptStringAesEcb: (encryptedString: any, key: any) => Promise<any>;
export declare const encryptBufferRsa: (stringToEncrypt: any, publicKeyPem: any) => Promise<string>;
export declare const decryptBufferRsa: (encryptedStringBase64: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
export declare const encrypt: (stringToEncrypt: any, publicKeyPem: any) => Promise<{
    encrypted: string;
    encryptedKey: string;
    type: string;
}>;
export declare const decrypt: (encryptedString: any, encryptedKey: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
