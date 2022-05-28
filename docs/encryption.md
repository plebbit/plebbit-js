### Plebbit encryption types:

- 'aes-ecb':

```js
const PeerId = require('peer-id')
const jose = require('jose')
const {fromString: uint8ArrayFromString} = require('uint8arrays/from-string')
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')
const forge = require('node-forge')
const libp2pCrypto = require('libp2p-crypto')

const generateKeyPair = async () => {
  const keyPair = await libp2pCrypto.keys.generateKeyPair('RSA', 2048)
  return keyPair
}

const getPrivateKeyPemFromKeyPair = async (keyPair, password = '') => {
  // you can optionally encrypt the PEM by providing a password
  // https://en.wikipedia.org/wiki/PKCS_8
  const privateKeyPem = await keyPair.export(password, 'pkcs-8')
  return privateKeyPem
}

const getKeyPairFromPrivateKeyPem = async (privateKeyPem, password = '') => {
  // you can optionally encrypt the PEM by providing a password
  // https://en.wikipedia.org/wiki/PKCS_8
  const keyPair = await libp2pCrypto.keys.import(privateKeyPem, password)
  return keyPair
}

const getIpfsKeyFromPrivateKeyPem = async (privateKeyPem, password = '') => {
  // you can optionally encrypt the PEM by providing a password
  // https://en.wikipedia.org/wiki/PKCS_8
  const keyPair = await libp2pCrypto.keys.import(privateKeyPem, password)
  return keyPair.bytes
}

const getPublicKeyPemFromKeyPair = async (keyPair) => {
  // https://en.wikipedia.org/wiki/PKCS_8
  const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RS256', {extractable: true})
  const publicKeyPem = await jose.exportSPKI(publicKeyFromJsonWebToken)
  return publicKeyPem
}

const getPublicKeyPemFromPrivateKeyPem = async (privateKeyPem, password = '') => {
  // you can optionally encrypt the PEM by providing a password
  // https://en.wikipedia.org/wiki/PKCS_8
  const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, password)
  return getPublicKeyPemFromKeyPair(keyPair)
}

let publicKeyRsaConstructor
const getPublicKeyRsaConstructor = async () => {
  // we are forced to do this because publicKeyRsaConstructor isn't public
  if (!publicKeyRsaConstructor) {
    const keyPair = await libp2pCrypto.keys.generateKeyPair('RSA', 2048)
    // get the constuctor for the PublicKeyRsaInstance
    publicKeyRsaConstructor = keyPair.public.constructor
  }
  return publicKeyRsaConstructor
}

const getPeerIdFromPublicKeyPem = async (publicKeyPem) => {
  const publicKeyFromPem = await jose.importSPKI(publicKeyPem, 'RS256', {extractable: true})
  const jsonWebToken = await jose.exportJWK(publicKeyFromPem)
  const PublicKeyRsa = await getPublicKeyRsaConstructor()
  const publicKeyRsaInstance = new PublicKeyRsa(jsonWebToken)
  const peerId = await PeerId.createFromPubKey(publicKeyRsaInstance.bytes)
  return peerId
}

const getPeerIdFromPrivateKeyPem = async (privateKeyPem) => {
  const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem)
  const peerId = await PeerId.createFromPubKey(keyPair.public.bytes)
  return peerId
}

const generatePrivateKeyPem = async (privateKeyPem) => {
  const keyPair = await generateKeyPair()
  privateKeyPem = await getPrivateKeyPemFromKeyPair(keyPair)
  return privateKeyPem
}

const getPlebbitAddressFromPrivateKeyPem = async (privateKeyPem) => {
  const peerId = await getPeerIdFromPrivateKeyPem(privateKeyPem)
  return peerId.toB58String() 
}

const generateKeyAesEcb = async () => {
    // key should be 16 bytes for AES ECB 128
    return libp2pCrypto.randomBytes(16);
};

const encryptStringAesEcb = async (stringToEncrypt, key) => {
    // node-forge takes in buffers and string weirdly in the browser so use hex instead
    const keyAsForgeBuffer = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");
    const cipher = forge.cipher.createCipher("AES-ECB", keyAsForgeBuffer);
    cipher.start();
    cipher.update(forge.util.createBuffer(stringToEncrypt, "utf8"));
    cipher.finish();
    const encryptedBase64 = uint8ArrayToString(uint8ArrayFromString(cipher.output.toHex(), "base16"), "base64");
    return encryptedBase64;
};

const decryptStringAesEcb = async (encryptedString, key) => {
    // node-forge takes in buffers and string weirdly in the browser so use hex instead
    const keyAsForgeBuffer = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");
    const cipher = forge.cipher.createDecipher("AES-ECB", keyAsForgeBuffer);
    cipher.start();
    cipher.update(forge.util.createBuffer(uint8ArrayFromString(encryptedString, "base64")));
    cipher.finish();
    const decrypted = cipher.output.toString();
    return decrypted;
};

const encryptBufferRsa = async (stringToEncrypt, publicKeyPem) => {
    const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
    const encryptedKeyBase64 = uint8ArrayToString(await peerId.pubKey.encrypt(stringToEncrypt), "base64");
    return encryptedKeyBase64;
};

const decryptBufferRsa = async (encryptedStringBase64, privateKeyPem, privateKeyPemPassword = "") => {
    const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, privateKeyPemPassword);
    const decrypted = await keyPair.decrypt(uint8ArrayFromString(encryptedStringBase64, "base64"));
    return decrypted;
};

const encrypt = async (stringToEncrypt, publicKeyPem) => {
    // generate key of the cipher and encrypt the string using AES ECB 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)
    const key = await generateKeyAesEcb(); // not secure to reuse keys with ECB, generate new one each time
    const encryptedBase64 = await encryptStringAesEcb(stringToEncrypt, key);

    // encrypt the AES ECB key with public key
    const encryptedKeyBase64 = await encryptBufferRsa(key, publicKeyPem);
    return { encrypted: encryptedBase64, encryptedKey: encryptedKeyBase64, type: "aes-ecb" };
};

const decrypt = async (encryptedString, encryptedKey, privateKeyPem, privateKeyPemPassword = "") => {
    // decrypt key
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const key = await decryptBufferRsa(encryptedKey, privateKeyPem);

    // decrypt string using AES ECB 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)
    const decrypted = await decryptStringAesEcb(encryptedString, key);
    return decrypted;
};

// encrypt a publication
;(async () => {
  const authorPrivateKeyPem = await generatePrivateKeyPem()
  const authorAddress = await getPlebbitAddressFromPrivateKeyPem(authorPrivateKeyPem)
  const publication = {
    subplebbitAddress: 'memes.eth',
    author: {address: authorAddress}, 
    timestamp: Math.round(Date.now() / 1000),
    parentCid: 'some cid...', 
    content: 'some content...',
  }

  // test large content
  let i = 1000
  while (i--) {
    publication.content += 'some content...'
  }

  const subplebbitEncryptionPrivateKeyPem = await generatePrivateKeyPem()
  const subplebbitEncryptionPublicKeyPem = await getPublicKeyPemFromPrivateKeyPem(subplebbitEncryptionPrivateKeyPem)

  // author encrypts his publication using subplebbit owner public key
  const {encrypted, encryptedKey} = await encrypt(JSON.stringify(publication), subplebbitEncryptionPublicKeyPem)

  // subplebbit owner decrypts publication with his own private key
  const decryptedPublication = JSON.parse(await decrypt(encrypted, encryptedKey, subplebbitEncryptionPrivateKeyPem))
  console.log({encrypted, encryptedKey, decryptedPublication})
})()
```
