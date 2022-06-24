export declare const generatePrivateKeyPem: () => Promise<any>;
export declare const getPlebbitAddressFromPrivateKeyPem: (privateKeyPem: any) => Promise<string>;
export declare const getPlebbitAddressFromPublicKeyPem: (publicKeyPem: any) => Promise<string>;
export declare const getIpfsKeyFromPrivateKeyPem: (privateKeyPem: any, password?: string) => Promise<any>;
export declare const getPublicKeyPemFromPrivateKeyPem: (privateKeyPem: any, password?: string) => Promise<any>;
export declare const getKeyPairFromPrivateKeyPem: (privateKeyPem: any, password?: string) => Promise<any>;
export declare const getPeerIdFromPublicKeyPem: (publicKeyPem: any) => Promise<any>;
