// NOTE: Ed25519PublicKey, Ed25519PrivateKey are not public apis, could break when upgrading libp2p-crypto
const {Ed25519PublicKey, Ed25519PrivateKey} = require('libp2p-crypto/src/keys/ed25519-class')
const PeerId = require("peer-id");
const ed = require('@noble/ed25519')
const {fromString: uint8ArrayFromString} = require('uint8arrays/from-string')
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')

export const generatePrivateKey = async (): Promise<string> => {
  const privateKeyBuffer = ed.utils.randomPrivateKey()
  const privateKeyBase64 = uint8ArrayToString(privateKeyBuffer, 'base64')
  return privateKeyBase64
}

export const getPlebbitAddressFromPrivateKey = async (privateKeyBase64) => {
  const peerId = await getPeerIdFromPrivateKey(privateKeyBase64)
  return peerId.toB58String().trim()
}

export const getPlebbitAddressFromPublicKey = async (publicKeyBase64) => {
  const peerId = await getPeerIdFromPublicKey(publicKeyBase64)
  return peerId.toB58String().trim()
}

export const getIpfsKeyFromPrivateKey = async (privateKeyBase64) => {
  if (!privateKeyBase64 || typeof privateKeyBase64 !== 'string') throw Error(`getIpfsKeyFromPrivateKey privateKeyBase64 not a string`)
  let privateKeyBuffer
  try {
    privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  }
  catch (e) {
    e.message = `getIpfsKeyFromPrivateKey privateKeyBase64 invalid: ${e.message}`
    throw e
  }
  if (privateKeyBuffer.length !== 32) throw Error(`getIpfsKeyFromPrivateKey privateKeyBase64 ed25519 private key length not 32 bytes (${privateKeyBuffer.length} bytes)`)
  const publicKeyBuffer = await ed.getPublicKey(privateKeyBuffer)

  // ipfs ed25519 private keys format are private (32 bytes) + public (32 bytes) (64 bytes total)
  const privateAndPublicKeyBuffer = new Uint8Array(64)
  privateAndPublicKeyBuffer.set(privateKeyBuffer)
  privateAndPublicKeyBuffer.set(publicKeyBuffer, 32)

  const ed25519PrivateKeyInstance = new Ed25519PrivateKey(privateAndPublicKeyBuffer, publicKeyBuffer)
  // the "ipfs key" adds a suffix, then the private key, then the public key, it is not the raw private key
  return ed25519PrivateKeyInstance.bytes
}

export const getPublicKeyFromPrivateKey = async (privateKeyBase64) => {
  if (!privateKeyBase64 || typeof privateKeyBase64 !== 'string') throw Error(`getPublicKeyFromPrivateKey privateKeyBase64 not a string`)
  let privateKeyBuffer
  try {
    privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64')
  }
  catch (e) {
    e.message = `getPublicKeyFromPrivateKey privateKeyBase64 invalid: ${e.message}`
    throw e
  }
  if (privateKeyBuffer.length !== 32) throw Error(`getPublicKeyFromPrivateKey privateKeyBase64 ed25519 private key length not 32 bytes (${privateKeyBuffer.length} bytes)`)
  const publicKeyBuffer = await ed.getPublicKey(privateKeyBuffer)
  return uint8ArrayToString(publicKeyBuffer, 'base64')
}

export const getPeerIdFromPrivateKey = async (privateKeyBase64) => {
  const ipfsKey = await getIpfsKeyFromPrivateKey(privateKeyBase64)
  // the PeerId private key is not a raw private key, it's an "ipfs key"
  const peerId = await PeerId.createFromPrivKey(ipfsKey)
  return peerId
}

export const getPeerIdFromPublicKey = async (publicKeyBase64) => {
  if (!publicKeyBase64 || typeof publicKeyBase64 !== 'string') throw Error(`getPeerIdFromPublicKey publicKeyBase64 '${publicKeyBase64}' not a string`)
  let publicKeyBuffer
  try {
    publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, 'base64')
  }
  catch (e) {
    e.message = `getPeerIdFromPublicKey publicKeyBase64 invalid: ${e.message}`
    throw e
  }
  if (publicKeyBuffer.length !== 32) throw Error(`getPeerIdFromPublicKey publicKeyBase64 '${publicKeyBase64}' ed25519 public key length not 32 bytes (${publicKeyBuffer.length} bytes)`)

  // the PeerId public key is not a raw public key, it adds a suffix
  const ed25519PublicKeyInstance = new Ed25519PublicKey(publicKeyBuffer)
  const peerId = await PeerId.createFromPubKey(ed25519PublicKeyInstance.bytes)
  return peerId
}
