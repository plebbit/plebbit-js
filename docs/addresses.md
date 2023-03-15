### Plebbit addresses:

- 'ed25519':

```js
const ed = require('@noble/ed25519')
const {fromString: uint8ArrayFromString} = require('uint8arrays/from-string')
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')
const {Ed25519PublicKey, Ed25519PrivateKey} = require('libp2p-crypto/src/keys/ed25519-class')
const PeerId = require('peer-id')

const generatePrivateKey = async () => {
  const privateKeyBuffer = ed.utils.randomPrivateKey()
  const privateKeyBase64 = uint8ArrayToString(privateKeyBuffer, 'base64')
  return privateKeyBase64
}

const getPublicKeyFromPrivateKey = async (privateKeyBase64) => {
  const privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  const publicKeyBuffer = await ed.getPublicKey(privateKeyBuffer)
  return uint8ArrayToString(publicKeyBuffer, 'base64')
}

const getIpfsKeyFromPrivateKey = async (privateKeyBase64) => {
  const privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  const publicKeyBuffer = await ed.getPublicKey(privateKeyBuffer)

  // ipfs ed25519 private keys format are private (32 bytes) + public (32 bytes) (64 bytes total)
  const privateAndPublicKeyBuffer = new Uint8Array(64)
  privateAndPublicKeyBuffer.set(privateKeyBuffer)
  privateAndPublicKeyBuffer.set(publicKeyBuffer, 32)

  const ed25519PrivateKeyInstance = new Ed25519PrivateKey(privateAndPublicKeyBuffer, publicKeyBuffer)
  // the "ipfs key" adds a suffix, then the private key, then the public key, it is not the raw private key
  return ed25519PrivateKeyInstance.bytes
} 

const getPeerIdFromPrivateKey = async (privateKeyBase64) => {
  const ipfsKey = await getIpfsKeyFromPrivateKey(privateKeyBase64)
  // the PeerId private key is not a raw private key, it's an "ipfs key"
  const peerId = await PeerId.createFromPrivKey(ipfsKey)
  return peerId
}

const getPeerIdFromPublicKey = async (publicKeyBase64) => {
  const publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, 'base64')

  // the PeerId public key is not a raw public key, it adds a suffix
  const ed25519PublicKeyInstance = new Ed25519PublicKey(publicKeyBuffer)
  const peerId = await PeerId.createFromPubKey(ed25519PublicKeyInstance.bytes)
  return peerId
}

const getPlebbitAddressFromPrivateKey = async (privateKeyBase64) => {
  const peerId = await getPeerIdFromPrivateKey(privateKeyBase64)
  return peerId.toB58String().trim()
}

const getPlebbitAddressFromPublicKey = async (publicKeyBase64) => {
  const peerId = await getPeerIdFromPublicKey(publicKeyBase64)
  return peerId.toB58String().trim()
}

;(async () => {
  // generate private key
  const privateKey = await generatePrivateKey()
  console.log({privateKey})

  // get public key from private key
  const publicKey = await getPublicKeyFromPrivateKey(privateKey)
  console.log({publicKey})

  // get PeerId from public key
  const peerIdFromPublicKey = await getPeerIdFromPublicKey(publicKey)
  console.log({peerIdFromPublicKey})

  // get PeerId from private key
  const peerIdFromPrivateKey = await getPeerIdFromPrivateKey(privateKey)
  console.log({peerIdFromPrivateKey})

  // get plebbit address from public key
  const plebbitAddressFromPublicKey = await getPlebbitAddressFromPublicKey(publicKey)
  console.log({plebbitAddressFromPublicKey})

  // get plebbit address from private key
  const plebbitAddressFromPrivateKey = await getPlebbitAddressFromPrivateKey(privateKey)
  console.log({plebbitAddressFromPrivateKey})

  // get ipfs key from private key
  const ipfsKey = await getIpfsKeyFromPrivateKey(privateKey)
  console.log({ipfsKey})
})()
```
