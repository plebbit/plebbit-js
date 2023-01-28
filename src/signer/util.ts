const {Ed25519PublicKey, Ed25519PrivateKey} = require('libp2p-crypto/src/keys/ed25519-class')
const PeerId = require("peer-id");
// const jose = require("jose");
const assert = require('assert')
const ed = require('@noble/ed25519')
const {fromString: uint8ArrayFromString} = require('uint8arrays/from-string')
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')

// export const generatePrivateKeyPem = async (): Promise<string> => {
//     const keyPair = await generateKeyPair();
//     const privateKeyPem = await getPrivateKeyPemFromKeyPair(keyPair);
//     return privateKeyPem.trim();
// };

export const generatePrivateKey = async (): Promise<string> => {
  const privateKeyBuffer = ed.utils.randomPrivateKey()
  const privateKeyBase64 = uint8ArrayToString(privateKeyBuffer, 'base64')
  return privateKeyBase64
}

// export const getPlebbitAddressFromPrivateKeyPem = async (privateKeyPem): Promise<string> => {
//     validatePrivateKeyPem(privateKeyPem);
//     const peerId = await getPeerIdFromPrivateKeyPem(privateKeyPem);
//     return peerId.toB58String().trim();
// };

export const getPlebbitAddressFromPrivateKey = async (privateKeyBase64) => {
  const peerId = await getPeerIdFromPrivateKey(privateKeyBase64)
  return peerId.toB58String().trim()
}

// export const getPlebbitAddressFromPublicKeyPem = async (publicKeyPem: string): Promise<string> => {
//     validatePublicKeyPem(publicKeyPem);
//     const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
//     return peerId.toB58String().trim();
// };

export const getPlebbitAddressFromPublicKey = async (publicKeyBase64) => {
  const peerId = await getPeerIdFromPublicKey(publicKeyBase64)
  return peerId.toB58String().trim()
}

// export const getIpfsKeyFromPrivateKeyPem = async (privateKeyPem: string, password = "") => {
//     validatePrivateKeyPem(privateKeyPem);
//     // you can optionally encrypt the PEM by providing a password
//     // https://en.wikipedia.org/wiki/PKCS_8
//     const keyPair = await libp2pCrypto.keys.import(privateKeyPem, password);
//     return keyPair.bytes;
// };

export const getIpfsKeyFromPrivateKey = async (privateKeyBase64) => {
  assert(privateKeyBase64 && typeof privateKeyBase64 === 'string', `getIpfsKeyFromPrivateKey privateKeyBase64 not a string`)
  let privateKeyBuffer
  try {
    privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  }
  catch (e) {
    e.message = `getIpfsKeyFromPrivateKey privateKeyBase64 invalid: ${e.message}`
    throw e
  }
  assert.equal(privateKeyBuffer.length, 32, `getIpfsKeyFromPrivateKey privateKeyBase64 ed25519 private key length not 32 bytes (${privateKeyBuffer.length} bytes)`)
  const publicKeyBuffer = await ed.getPublicKey(privateKeyBuffer)

  // ipfs ed25519 private keys format are private (32 bytes) + public (32 bytes) (64 bytes total)
  const privateAndPublicKeyBuffer = new Uint8Array(64)
  privateAndPublicKeyBuffer.set(privateKeyBuffer)
  privateAndPublicKeyBuffer.set(publicKeyBuffer, 32)

  const ed25519PrivateKeyInstance = new Ed25519PrivateKey(privateAndPublicKeyBuffer, publicKeyBuffer)
  // the "ipfs key" adds a suffix, then the private key, then the public key, it is not the raw private key
  return ed25519PrivateKeyInstance.bytes
}

// export const getPublicKeyPemFromPrivateKeyPem = async (privateKeyPem, password = ""): Promise<string> => {
//     validatePrivateKeyPem(privateKeyPem);
//     // you can optionally encrypt the PEM by providing a password
//     // https://en.wikipedia.org/wiki/PKCS_8
//     const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, password);
//     const publicKeyPem = await getPublicKeyPemFromKeyPair(keyPair);
//     return publicKeyPem.trim();
// };

export const getPublicKeyFromPrivateKey = async (privateKeyBase64) => {
  assert(privateKeyBase64 && typeof privateKeyBase64 === 'string', `getPublicKeyFromPrivateKey privateKeyBase64 not a string`)
  let privateKeyBuffer
  try {
    privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  }
  catch (e) {
    e.message = `getPublicKeyFromPrivateKey privateKeyBase64 invalid: ${e.message}`
    throw e
  }
  assert.equal(privateKeyBuffer.length, 32, `getPublicKeyFromPrivateKey privateKeyBase64 ed25519 private key length not 32 bytes (${privateKeyBuffer.length} bytes)`)
  const publicKeyBuffer = await ed.getPublicKey(privateKeyBuffer)
  return uint8ArrayToString(publicKeyBuffer, 'base64')
}

// export const getKeyPairFromPrivateKeyPem = async (privateKeyPem, password = "") => {
//     validatePrivateKeyPem(privateKeyPem);
//     // you can optionally encrypt the PEM by providing a password
//     // https://en.wikipedia.org/wiki/PKCS_8
//     const keyPair = await libp2pCrypto.keys.import(privateKeyPem, password);
//     return keyPair;
// };

// export const getPeerIdFromPublicKeyPem = async (publicKeyPem) => {
//     validatePublicKeyPem(publicKeyPem);
//     const publicKeyFromPem = await jose.importSPKI(publicKeyPem, "RS256", { extractable: true });
//     const jsonWebToken = await jose.exportJWK(publicKeyFromPem);
//     const PublicKeyRsa = await getPublicKeyRsaConstructor();
//     const publicKeyRsaInstance = new PublicKeyRsa(jsonWebToken);
//     const peerId = await PeerId.createFromPubKey(publicKeyRsaInstance.bytes);
//     return peerId;
// };

export const getPeerIdFromPrivateKey = async (privateKeyBase64) => {
  const ipfsKey = await getIpfsKeyFromPrivateKey(privateKeyBase64)
  // the PeerId private key is not a raw private key, it's an "ipfs key"
  const peerId = await PeerId.createFromPrivKey(ipfsKey)
  return peerId
}

export const getPeerIdFromPublicKey = async (publicKeyBase64) => {
  assert(publicKeyBase64 && typeof publicKeyBase64 === 'string', `getPeerIdFromPublicKey publicKeyBase64 '${publicKeyBase64}' not a string`)
  let publicKeyBuffer
  try {
    publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, 'base64')
  }
  catch (e) {
    e.message = `getPeerIdFromPublicKey publicKeyBase64 invalid: ${e.message}`
    throw e
  }
  assert.equal(publicKeyBuffer.length, 32, `getPeerIdFromPublicKey publicKeyBase64 '${publicKeyBase64}' ed25519 public key length not 32 bytes (${publicKeyBuffer.length} bytes)`)

  // the PeerId public key is not a raw public key, it adds a suffix
  const ed25519PublicKeyInstance = new Ed25519PublicKey(publicKeyBuffer)
  const peerId = await PeerId.createFromPubKey(ed25519PublicKeyInstance.bytes)
  return peerId
}

// const generateKeyPair = async () => {
//     const keyPair = await libp2pCrypto.keys.generateKeyPair("RSA", 2048);
//     return keyPair;
// };

// const getPrivateKeyPemFromKeyPair = async (keyPair, password = "") => {
//     // you can optionally encrypt the PEM by providing a password
//     // https://en.wikipedia.org/wiki/PKCS_8
//     const privateKeyPem = await keyPair.export(password, "pkcs-8");
//     return privateKeyPem.trim();
// };

// const getPublicKeyPemFromKeyPair = async (keyPair) => {
//     // https://en.wikipedia.org/wiki/PKCS_8
//     const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, "RS256", { extractable: true });
//     const publicKeyPem = await jose.exportSPKI(publicKeyFromJsonWebToken);
//     return publicKeyPem.trim();
// };

// let publicKeyRsaConstructor;
// const getPublicKeyRsaConstructor = async () => {
//     // we are forced to do this because publicKeyRsaConstructor isn't public
//     if (!publicKeyRsaConstructor) {
//         const keyPair = await libp2pCrypto.keys.generateKeyPair("RSA", 2048);
//         // get the constuctor for the PublicKeyRsaInstance
//         publicKeyRsaConstructor = keyPair.public.constructor;
//     }
//     return publicKeyRsaConstructor;
// };

// const getPeerIdFromPrivateKeyPem = async (privateKeyPem) => {
//     validatePrivateKeyPem(privateKeyPem);
//     const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem);
//     const peerId = await PeerId.createFromPubKey(keyPair.public.bytes);
//     return peerId;
// };

// const validatePrivateKeyPem = (privateKeyPem) => {
//     if (typeof privateKeyPem !== "string") throw Error(`invalid encrypted private key pem '${privateKeyPem}' not a string`);
//     if (!privateKeyPem.startsWith("-----BEGIN ENCRYPTED PRIVATE KEY-----"))
//         throw Error(`invalid encrypted private key pem '${privateKeyPem}' not encrypted private key pem`);
// };

// const validatePublicKeyPem = (publicKeyPem) => {
//     if (typeof publicKeyPem !== "string") throw Error(`invalid public key pem '${publicKeyPem}' not a string`);
//     if (!publicKeyPem.startsWith("-----BEGIN PUBLIC KEY-----")) throw Error(`invalid public key pem '${publicKeyPem}' not public key pem`);
// };
