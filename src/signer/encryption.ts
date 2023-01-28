import forge from "node-forge";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { getPeerIdFromPublicKey } from "./util";
import { Encrypted } from "../types";
import assert from 'assert'
import * as ed from '@noble/ed25519'

// const validateArgumentNotEmptyString = (value, propertyName, functionName) => {
//     if (typeof value !== "string") throw Error(`function '${functionName}' argument '${propertyName}': '${value}' not a string`);
//     if (value.length === 0) throw Error(`function '${functionName}' argument '${propertyName}': '${value}' empty string`);
// };

// export const generateKeyAesCbc = async () => {
//     // key should be 16 bytes for AES CBC 128
//     return libp2pCrypto.randomBytes(16);
// };

// export const encryptStringAesCbc = async (stringToEncrypt, key) => {
//     // node-forge takes in buffers and string weirdly in the browser so use hex instead
//     const keyAsForgeBuffer = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");
//     // use the key as initializaton vector because we don't need an iv since we never reuse keys
//     const iv = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");

//     const cipher = forge.cipher.createCipher("AES-CBC", keyAsForgeBuffer);
//     cipher.start({ iv });
//     cipher.update(forge.util.createBuffer(stringToEncrypt, "utf8"));
//     cipher.finish();
//     const encryptedBase64 = uint8ArrayToString(uint8ArrayFromString(cipher.output.toHex(), "base16"), "base64");
//     return encryptedBase64;
// };

const isProbablyBuffer = (arg) => arg && typeof arg !== "string" && typeof arg !== "number";

const uint8ArrayToNodeForgeBuffer = (uint8Array) => {
  const forgeBuffer = forge.util.createBuffer()
  for (const byte of uint8Array) {
    forgeBuffer.putByte(byte)
  }
  return forgeBuffer
}

// NOTE: never pass the last param 'iv', only for used for testing
export const encryptStringAesGcm = async (plaintext, key, iv?) => {
  assert(plaintext && typeof plaintext === 'string', `encryptStringAesGcm plaintext '${plaintext}' not a string`)
  if (!isProbablyBuffer(key)) throw Error(`encryptStringAesGcm invalid key '${key}' not buffer`)

  // use random 12 bytes uint8 array for iv
  if (!iv) {
    iv = ed.utils.randomPrivateKey().slice(0, 12)
  } 

  // node-forge doesn't accept uint8Array
  const keyAsForgeBuffer = uint8ArrayToNodeForgeBuffer(key)
  const ivAsForgeBuffer = uint8ArrayToNodeForgeBuffer(iv)

  const cipher = forge.cipher.createCipher('AES-GCM', keyAsForgeBuffer)
  cipher.start({iv: ivAsForgeBuffer})
  cipher.update(forge.util.createBuffer(plaintext, 'utf8'))
  cipher.finish()

  return {
    ciphertext: uint8ArrayFromString(cipher.output.toHex(), 'base16'),
    iv,
    // AES-GCM has authentication tag https://en.wikipedia.org/wiki/Galois/Counter_Mode
    tag: uint8ArrayFromString(cipher.mode.tag.toHex(), 'base16')
  }
}

// export const decryptStringAesCbc = async (encryptedString, key) => {
//     // node-forge takes in buffers and string weirdly in the browser so use hex instead
//     const keyAsForgeBuffer = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");
//     // use the key as initializaton vector because we don't need an iv since we never reuse keys
//     const iv = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");

//     const cipher = forge.cipher.createDecipher("AES-CBC", keyAsForgeBuffer);
//     cipher.start({ iv });
//     cipher.update(forge.util.createBuffer(uint8ArrayFromString(encryptedString, "base64")));
//     cipher.finish();
//     const decrypted = cipher.output.toString();
//     return decrypted;
// };

export const decryptStringAesGcm = async (ciphertext, key, iv, tag) => {
  if (!isProbablyBuffer(ciphertext)) throw Error(`decryptStringAesGcm invalid ciphertext '${ciphertext}' not buffer`)
  if (!isProbablyBuffer(key)) throw Error(`decryptStringAesGcm invalid key '${key}' not buffer`)
  if (!isProbablyBuffer(iv)) throw Error(`decryptStringAesGcm invalid iv '${iv}' not buffer`)
  if (!isProbablyBuffer(tag)) throw Error(`decryptStringAesGcm invalid tag '${tag}' not buffer`)

  // node-forge doesn't accept uint8Array
  const keyAsForgeBuffer = uint8ArrayToNodeForgeBuffer(key)
  const ivAsForgeBuffer = uint8ArrayToNodeForgeBuffer(iv)
  const tagAsForgeBuffer = uint8ArrayToNodeForgeBuffer(tag)

  const cipher = forge.cipher.createDecipher('AES-GCM', keyAsForgeBuffer)
  cipher.start({iv: ivAsForgeBuffer, tag: tagAsForgeBuffer})
  cipher.update(forge.util.createBuffer(ciphertext))
  cipher.finish()
  const decrypted = cipher.output.toString()
  return decrypted
}

// export const encryptBufferRsa = async (stringToEncrypt, publicKeyPem) => {
//     validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encryptBufferRsa");
//     const peerId = await getPeerIdFromPublicKey(publicKeyPem);
//     const encryptedKeyBase64 = uint8ArrayToString(await peerId.pubKey.encrypt(stringToEncrypt), "base64");
//     return encryptedKeyBase64;
// };

// export const decryptBufferRsa = async (encryptedStringBase64, privateKeyPem, privateKeyPemPassword = "") => {
//     validateArgumentNotEmptyString(encryptedStringBase64, "encryptedStringBase64", "decryptBufferRsa");
//     validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decryptBufferRsa");
//     const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, privateKeyPemPassword);
//     const decrypted = await keyPair.decrypt(uint8ArrayFromString(encryptedStringBase64, "base64"));
//     return decrypted;
// };

// export const encrypt = async (stringToEncrypt, publicKeyPem): Promise<Encrypted> => {
//     validateArgumentNotEmptyString(stringToEncrypt, "stringToEncrypt", "encrypt");
//     validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encrypt");

//     // add random padding to prevent linking encrypted publications by sizes
//     // TODO: eventually use an algorithm to find the most anonymous padding length
//     const randomPaddingLength = Math.round(Math.random() * 5000);
//     let padding = "";
//     while (padding.length < randomPaddingLength) {
//         padding += " ";
//     }

//     // generate key of the cipher and encrypt the string using AES CBC 128
//     // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_block_chaining_(CBC)
//     const key = await generateKeyAesCbc(); // not secure to reuse keys because we don't use iv
//     const encryptedBase64 = await encryptStringAesCbc(stringToEncrypt + padding, key);

//     // encrypt the AES CBC key with public key
//     const encryptedKeyBase64 = await encryptBufferRsa(key, publicKeyPem);
//     return { encrypted: encryptedBase64, encryptedKey: encryptedKeyBase64, type: "aes-cbc" };
// };

export const encryptEd25519AesGcm = async (plaintext, privateKeyBase64, publicKeyBase64) => {
  assert(plaintext && typeof plaintext === 'string', `encryptEd25519AesGcm plaintext '${plaintext}' not a string`)
  assert(privateKeyBase64 && typeof privateKeyBase64 === 'string', `encryptEd25519AesGcm privateKeyBase64 not a string`)
  const privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  assert.equal(privateKeyBuffer.length, 32, `encryptEd25519AesGcm publicKeyBase64 ed25519 public key length not 32 bytes (${privateKeyBuffer.length} bytes)`)
  assert(publicKeyBase64 && typeof publicKeyBase64 === 'string', `encryptEd25519AesGcm publicKeyBase64 '${publicKeyBase64}' not a string`)  
  const publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, 'base64')
  assert.equal(publicKeyBuffer.length, 32, `encryptEd25519AesGcm publicKeyBase64 '${publicKeyBase64}' ed25519 public key length not 32 bytes (${publicKeyBuffer.length} bytes)`)

  // add random padding to prevent linking encrypted publications by sizes
  // TODO: eventually use an algorithm to find the most anonymous padding length
  const randomPaddingLength = Math.round(Math.random() * 5000)
  let padding = ''
  while (padding.length < randomPaddingLength) {
    padding += ' '
  }

  // compute the shared secret of the sender and recipient and use it as the encryption key
  // do not publish this secret https://datatracker.ietf.org/doc/html/rfc7748#section-6.1
  const aesGcmKey = await ed.getSharedSecret(privateKeyBuffer, publicKeyBuffer)
  // use 16 bytes key for AES-128
  const aesGcmKey16Bytes = aesGcmKey.slice(0, 16)

  // AES GCM using 128-bit key https://en.wikipedia.org/wiki/Galois/Counter_Mode
  const {ciphertext, iv, tag} = await encryptStringAesGcm(plaintext + padding, aesGcmKey16Bytes)

  const encryptedBase64: Encrypted = {
    ciphertext: uint8ArrayToString(ciphertext, 'base64'),
    iv: uint8ArrayToString(iv, 'base64'),
    // AES-GCM has authentication tag https://en.wikipedia.org/wiki/Galois/Counter_Mode
    tag: uint8ArrayToString(tag, 'base64'),
    type: 'ed25519-aes-gcm'
  }
  return encryptedBase64
}

// export const decrypt = async (encryptedString, encryptedKey, privateKeyPem, privateKeyPemPassword = "") => {
//     validateArgumentNotEmptyString(encryptedString, "encryptedString", "decrypt");
//     validateArgumentNotEmptyString(encryptedKey, "encryptedKey", "decrypt");
//     validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decrypt");
//     // decrypt key
//     // you can optionally encrypt the PEM by providing a password
//     // https://en.wikipedia.org/wiki/PKCS_8
//     const key = await decryptBufferRsa(encryptedKey, privateKeyPem);

//     // decrypt string using AES CBC 128
//     // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_block_chaining_(CBC)
//     let decrypted = await decryptStringAesCbc(encryptedString, key);

//     // remove padding
//     decrypted = decrypted.replace(/ *$/, "");

//     return decrypted;
// };

export const decryptEd25519AesGcm = async (encrypted: Encrypted, privateKeyBase64, publicKeyBase64) => {
  assert(encrypted?.ciphertext && typeof encrypted?.ciphertext === 'string', `decryptEd25519AesGcm encrypted.ciphertext '${encrypted.ciphertext}' not a string`)
  const ciphertextBuffer = uint8ArrayFromString(encrypted.ciphertext, 'base64')
  assert(privateKeyBase64 && typeof privateKeyBase64 === 'string', `decryptEd25519AesGcm ${privateKeyBase64} privateKeyBase64 not a string`)
  const privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  assert.equal(privateKeyBuffer.length, 32, `decryptEd25519AesGcm publicKeyBase64 ed25519 public key length not 32 bytes (${privateKeyBuffer.length} bytes)`)
  assert(publicKeyBase64 && typeof publicKeyBase64 === 'string', `decryptEd25519AesGcm publicKeyBase64 '${publicKeyBase64}' not a string`)  
  const publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, 'base64')
  assert.equal(publicKeyBuffer.length, 32, `decryptEd25519AesGcm publicKeyBase64 '${publicKeyBase64}' ed25519 public key length not 32 bytes (${publicKeyBuffer.length} bytes)`)
  assert(encrypted?.iv && typeof encrypted?.iv === 'string', `decryptEd25519AesGcm encrypted.iv '${encrypted.iv}' not a string`)  
  const ivBuffer = uint8ArrayFromString(encrypted.iv, 'base64')
  assert(encrypted?.tag && typeof encrypted?.tag === 'string', `decryptEd25519AesGcm encrypted.tag '${encrypted.tag}' not a string`)  
  const tagBuffer = uint8ArrayFromString(encrypted.tag, 'base64')

  // compute the shared secret of the sender and recipient and use it as the encryption key
  // do not publish this secret https://datatracker.ietf.org/doc/html/rfc7748#section-6.1
  const aesGcmKey = await ed.getSharedSecret(privateKeyBuffer, publicKeyBuffer)
  // use 16 bytes key for AES-128
  const aesGcmKey16Bytes = aesGcmKey.slice(0, 16)

  // AES GCM using 128-bit key https://en.wikipedia.org/wiki/Galois/Counter_Mode 
  let decrypted = await decryptStringAesGcm(ciphertextBuffer, aesGcmKey16Bytes, ivBuffer, tagBuffer)

  // remove padding
  decrypted = decrypted.replace(/ *$/, '')

  return decrypted
}