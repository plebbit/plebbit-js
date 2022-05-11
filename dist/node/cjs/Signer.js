"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Signer = exports.Signature = void 0;
exports.decrypt = decrypt;
exports.encrypt = encrypt;
exports.getAddressFromPublicKeyPem = getAddressFromPublicKeyPem;
exports.signPublication = signPublication;
exports.verifyPublication = verifyPublication;

var crypto = _interopRequireWildcard(require("libp2p-crypto"));

var _ipfsCore = require("ipfs-core");

var _Util = require("./Util.js");

var _cborg = require("cborg");

var _toString = require("uint8arrays/to-string");

var _fromString = require("uint8arrays/from-string");

var jose = _interopRequireWildcard(require("jose"));

var _nodeForge = _interopRequireDefault(require("node-forge"));

var _assert = _interopRequireDefault(require("assert"));

var _Publication = _interopRequireDefault(require("./Publication.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// note: postCid is not included because it's written by the sub owner, not the author
class Signer {
  constructor(props) {
    this.type = props.type;
    this.privateKey = props.privateKey;
    this.publicKey = props.publicKey;
    this.address = props.address;
    this.ipfsKey = Buffer.from(props.ipfsKey);
  }

  toJSON() {
    return {
      "type": this.type,
      "privateKey": this.privateKey,
      "publicKey": this.publicKey,
      "address": this.address,
      "ipfsKey": this.ipfsKey
    };
  }

}

exports.Signer = Signer;

class Signature {
  constructor(props) {
    this.signature = props["signature"];
    this.publicKey = props["publicKey"];
    this.type = props["type"];
    this.signedPropertyNames = props["signedPropertyNames"];
  }

  toJSON() {
    return {
      "signature": this.signature,
      "publicKey": this.publicKey,
      "type": this.type,
      "signedPropertyNames": this.signedPropertyNames
    };
  }

}

exports.Signature = Signature;
let publicKeyRsaConstructor;

async function getPublicKeyRsaConstructor() {
  // we are forced to do this because publicKeyRsaConstructor isn't public
  if (!publicKeyRsaConstructor) {
    const keyPair = await crypto.keys.generateKeyPair('RSA', 2048); // get the constructor for the PublicKeyRsaInstance

    publicKeyRsaConstructor = keyPair.public.constructor;
  }

  return publicKeyRsaConstructor;
}

async function getPeerIdFromPublicKeyPem(publicKeyPem) {
  const publicKeyFromPem = await jose.importSPKI(publicKeyPem, 'RS256', {
    extractable: true
  });
  const jsonWebToken = await jose.exportJWK(publicKeyFromPem);
  const PublicKeyRsa = await getPublicKeyRsaConstructor();
  const publicKeyRsaInstance = new PublicKeyRsa(jsonWebToken);
  return await _ipfsCore.PeerId.createFromPubKey(publicKeyRsaInstance.bytes);
}

async function getAddressFromPublicKeyPem(publicKeyPem) {
  return (await getPeerIdFromPublicKeyPem(publicKeyPem)).toB58String();
}

function getFieldsToSign(publication) {
  if (publication.hasOwnProperty("vote")) return ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];else if (publication.commentCid) // CommentEdit
    return ["subplebbitAddress", "content", "commentCid", "editTimestamp", "editReason", "deleted", "spoiler", "pinned", "locked", "removed", "moderatorReason"];else if (publication.title) // Post
    return ["subplebbitAddress", "author", "timestamp", "content", "title", "link"];else if (publication.content) // Comment
    return ["subplebbitAddress", "author", "timestamp", "parentCid", "content"];
}

async function signPublication(publication, signer) {
  const keyPair = await crypto.keys.import(signer.privateKey, "");
  const fieldsToSign = getFieldsToSign(publication);
  const publicationSignFields = (0, _Util.keepKeys)(publication, fieldsToSign);
  const commentEncoded = (0, _cborg.encode)(publicationSignFields);
  const signatureData = (0, _toString.toString)(await keyPair.sign(commentEncoded), 'base64');
  return new Signature({
    "signature": signatureData,
    "publicKey": signer.publicKey,
    "type": signer.type,
    "signedPropertyNames": fieldsToSign
  });
} // Return [verification (boolean), reasonForFailing (string)]


async function verifyPublication(publication) {
  const verifyAuthor = async (signature, author) => {
    const peerId = await getPeerIdFromPublicKeyPem(signature.publicKey);

    _assert.default.equal(peerId.equals(_ipfsCore.PeerId.createFromB58String(author.address)), true, "comment.author.address doesn't match comment.signature.publicKey");
  };

  const verifyPublicationSignature = async (signature, publicationToBeVerified) => {
    const peerId = await getPeerIdFromPublicKeyPem(signature.publicKey);
    const commentWithFieldsToSign = (0, _Util.keepKeys)(publicationToBeVerified, signature.signedPropertyNames);
    const commentEncoded = (0, _cborg.encode)(commentWithFieldsToSign);
    const signatureIsValid = await peerId.pubKey.verify(commentEncoded, (0, _fromString.fromString)(signature.signature, 'base64'));

    _assert.default.equal(signatureIsValid, true, "Signature is invalid");
  };

  try {
    if (publication.originalContent) {
      // This is a comment/post that has been edited, and we need to verify both signature and editSignature
      publication.author ? await verifyAuthor(publication.signature, publication.author) : undefined;
      const publicationJson = publication instanceof _Publication.default ? publication.toJSON() : publication;
      const originalSignatureObj = { ...publicationJson,
        "content": publication.originalContent
      };
      await verifyPublicationSignature(publication.signature, originalSignatureObj);
      const editedSignatureObj = { ...publicationJson,
        "commentCid": publication.cid
      };
      await verifyPublicationSignature(publication.editSignature, editedSignatureObj);
    } else if (publication.commentCid && publication.content) {
      // Verify CommentEdit
      await verifyPublicationSignature(publication.editSignature, publication);
    } else {
      publication.author ? await verifyAuthor(publication.signature, publication.author) : undefined;
      await verifyPublicationSignature(publication.signature, publication);
    }

    return [true];
  } catch (e) {
    return [false, String(e)];
  }
}

async function encrypt(stringToEncrypt, publicKeyPem) {
  // generate key of the cipher and encrypt the string using AES ECB 128
  // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)
  const key = _nodeForge.default.random.getBytesSync(16); // not secure to reuse keys with ECB, generate new one each time


  const cipher = _nodeForge.default.cipher.createCipher('AES-ECB', key);

  cipher.start();
  cipher.update(_nodeForge.default.util.createBuffer(stringToEncrypt));
  cipher.finish();
  const encryptedBase64 = (0, _toString.toString)((0, _fromString.fromString)(cipher.output.toHex(), 'base16'), 'base64'); // encrypt the AES ECB key with public key

  const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
  const encryptedKeyBase64 = (0, _toString.toString)(await peerId.pubKey.encrypt(key), 'base64');
  return {
    encryptedString: encryptedBase64,
    encryptedKey: encryptedKeyBase64,
    type: 'aes-ecb'
  };
}

async function decrypt(encryptedString, encryptedKey, privateKeyPem, privateKeyPemPassword = '') {
  // decrypt key
  // you can optionally encrypt the PEM by providing a password
  // https://en.wikipedia.org/wiki/PKCS_8
  const keyPair = await crypto.keys.import(privateKeyPem, privateKeyPemPassword);
  const key = await keyPair.decrypt((0, _fromString.fromString)(encryptedKey, 'base64')); // decrypt string using AES ECB 128
  // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)

  const cipher = _nodeForge.default.cipher.createDecipher('AES-ECB', key.toString());

  cipher.start();
  cipher.update(_nodeForge.default.util.createBuffer((0, _fromString.fromString)(encryptedString, 'base64')));
  cipher.finish();
  return cipher.output.toString();
}