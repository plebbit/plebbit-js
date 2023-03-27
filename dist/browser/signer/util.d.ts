import PeerId from "peer-id";
export declare const generatePrivateKey: () => Promise<string>;
export declare const getPlebbitAddressFromPrivateKey: (privateKeyBase64: any) => Promise<string>;
export declare const getPlebbitAddressFromPublicKey: (publicKeyBase64: any) => Promise<string>;
export declare const getIpfsKeyFromPrivateKey: (privateKeyBase64: any) => Promise<any>;
export declare const getPublicKeyFromPrivateKey: (privateKeyBase64: any) => Promise<string>;
export declare const getPeerIdFromPrivateKey: (privateKeyBase64: any) => Promise<PeerId>;
export declare const getPeerIdFromPublicKey: (publicKeyBase64: any) => Promise<PeerId>;
