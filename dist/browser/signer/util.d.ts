export declare const generatePrivateKeyPem: () => Promise<string>;
export declare const getPlebbitAddressFromPrivateKeyPem: (privateKeyPem: any) => Promise<string>;
export declare const getPlebbitAddressFromPublicKeyPem: (publicKeyPem: string) => Promise<string>;
export declare const getIpfsKeyFromPrivateKeyPem: (privateKeyPem: string, password?: string) => Promise<any>;
export declare const getPublicKeyPemFromPrivateKeyPem: (privateKeyPem: any, password?: string) => Promise<string>;
export declare const getKeyPairFromPrivateKeyPem: (privateKeyPem: any, password?: string) => Promise<any>;
export declare const getPeerIdFromPublicKeyPem: (publicKeyPem: any) => Promise<any>;
