### Message signature types:

- 'rsa':

```js
const libp2pCrypto = require('libp2p-crypto')
const cborg = require('cborg')
const PeerId = require('peer-id')
const jose = require('jose')
const assert = require('assert')
const {fromString: uint8ArrayFromString} = require('uint8arrays/from-string')
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')

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

const getPublicKeyPemFromKeyPair = async (keyPair) => {
  // https://en.wikipedia.org/wiki/PKCS_8
  const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RSA256')
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
  const publicKeyFromPem = await jose.importSPKI(publicKeyPem, 'RSA256')
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

const verifyCommentSignature = async (comment) => {
  const peerId = await getPeerIdFromPublicKeyPem(comment.signature.publicKey)
  assert(peerId.equals(PeerId.createFromB58String(comment.author.address)), `comment.author.address doesn't match comment.signature.publicKey`)

  // note: postCid is not included because it's written by the sub owner, not the author
  const {subplebbitAddress, author, timestamp, parentCid, content, title, link} = comment
  const fieldsToVerify = cborg.encode({subplebbitAddress, author, timestamp, parentCid, content, title, link})
  const signatureIsValid = await peerId.pubKey.verify(fieldsToVerify, uint8ArrayFromString(comment.signature.signature, 'base64'))
  assert(signatureIsValid, `comment.signature invalid`)
}

const createCommentSignature = async (comment, signer) => {
  // private and public key PEM are https://en.wikipedia.org/wiki/PKCS_8
  const keyPair = await getKeyPairFromPrivateKeyPem(signer.privateKey)
  const {subplebbitAddress, author, timestamp, parentCid, content, title, link} = comment
  const fieldsToSign = cborg.encode({subplebbitAddress, author, timestamp, parentCid, content, title, link})
  const signature = uint8ArrayToString(await keyPair.sign(fieldsToSign), 'base64')
  const publicKey = await getPublicKeyPemFromKeyPair(keyPair)
  const type = 'rsa'
  return {signature, publicKey, type}
}

const createSigner = async (privateKeyPem) => {
  if (!privateKeyPem) {
    const keyPair = await generateKeyPair()
    privateKeyPem = await getPrivateKeyPemFromKeyPair(keyPair)
  }
  const type = 'rsa'
  return {privateKey: privateKeyPem, type}
}

const getAddressFromSigner = async (signer) => {
  const peerId = await getPeerIdFromPrivateKeyPem(signer.privateKey)
  return peerId.toB58String() 
}

const encrypt = async (stringToEncrypt, publicKeyPem) => {
  // https://en.wikipedia.org/wiki/PKCS_8
  const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem)
  const encrypted = await peerId.pubKey.encrypt(stringToEncrypt)
  return uint8ArrayToString(encrypted, 'base64')
}

const decrypt = async (encryptedString, privateKeyPem, privateKeyPemPassword = '') => {
  // you can optionally encrypt the PEM by providing a password
  // https://en.wikipedia.org/wiki/PKCS_8
  const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, privateKeyPemPassword)
  const decrypted = await keyPair.decrypt(uint8ArrayFromString(encryptedString, 'base64'))
  return decrypted.toString()
}

// sign a comment
;(async () => {
  const signer = await createSigner()
  const authorAddress = await getAddressFromSigner(signer)
  const comment = {
    subplebbitAddress: 'memes.eth',
    author: {address: authorAddress}, 
    timestamp: Math.round(Date.now() / 1000),
    parentCid: 'some cid...', 
    content: 'some content...',
  }
  const signature = await createCommentSignature(comment, signer)
  const signedComment = {...comment, signature}
  await verifyCommentSignature(signedComment)
})()

// encrypt a publication
;(async () => {
  const authorAddress = await getAddressFromSigner(await createSigner())
  const publication = {
    subplebbitAddress: 'memes.eth',
    author: {address: authorAddress}, 
    timestamp: Math.round(Date.now() / 1000),
    parentCid: 'some cid...', 
    content: 'some content...',
  }

  const subplebbitEncryptionPrivateKeyPem = (await createSigner()).privateKey
  const subplebbitEncryptionPublicKeyPem = await getPublicKeyPemFromPrivateKeyPem(subplebbitEncryptionPrivateKeyPem)

  // author encrypts his publication using subplebbit owner public key
  const encryptedPublication = await encrypt(JSON.stringify(publication), subplebbitEncryptionPublicKeyPem)

  // subplebbit owner decrypts publication with his own private key
  const decryptedPublication = JSON.parse(await decrypt(encryptedPublication, subplebbitEncryptionPrivateKeyPem))
})()
```
