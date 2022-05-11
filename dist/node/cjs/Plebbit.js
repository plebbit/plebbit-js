"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Plebbit = void 0;

var _Comment = require("./Comment.js");

var _Post = _interopRequireDefault(require("./Post.js"));

var _Subplebbit = require("./Subplebbit.js");

var _Util = require("./Util.js");

var path = _interopRequireWildcard(require("path"));

var _Vote = _interopRequireDefault(require("./Vote.js"));

var _ipfsHttpClient = require("ipfs-http-client");

var _Signer = require("./Signer.js");

var crypto = _interopRequireWildcard(require("libp2p-crypto"));

var jose = _interopRequireWildcard(require("jose"));

var _assert = _interopRequireDefault(require("assert"));

var _process = _interopRequireDefault(require("process"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var _signPublication = /*#__PURE__*/new WeakSet();

class Plebbit {
  constructor(options = {}) {
    _classPrivateMethodInitSpec(this, _signPublication);

    this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options

    this.ipfsGatewayUrl = this.ipfsHttpClientOptions ? undefined : options["ipfsGatewayUrl"] || 'https://cloudflare-ipfs.com';
    this.pubsubHttpClientOptions = this.ipfsHttpClientOptions ? undefined : options["pubsubHttpClientOptions"] || 'https://pubsubprovider.xyz/api/v0';
    this.ipfsClient = (0, _ipfsHttpClient.create)(this.ipfsHttpClientOptions || this.pubsubHttpClientOptions);
    let defaultDataPath;
    this.dataPath = options["dataPath"] || path.join(_process.default.cwd(), ".plebbit");
  }

  async getSubplebbit(subplebbitAddress, subplebbitProps = {}) {
    const subplebbitJson = await (0, _Util.loadIpnsAsJson)(subplebbitAddress, this);
    return new _Subplebbit.Subplebbit({ ...subplebbitJson,
      ...subplebbitProps
    }, this);
  }

  async getComment(cid) {
    const commentJson = await (0, _Util.loadIpfsFileAsJson)(cid, this);
    const subplebbit = await this.getSubplebbit(commentJson["subplebbitAddress"]);
    const publication = commentJson["title"] ? new _Post.default({ ...commentJson,
      "postCid": cid,
      "cid": cid
    }, subplebbit) : new _Comment.Comment({ ...commentJson,
      "cid": cid
    }, subplebbit);
    const [signatureIsVerified, failedVerificationReason] = await (0, _Signer.verifyPublication)(publication);

    _assert.default.equal(signatureIsVerified, true, `Signature of comment/post ${cid} is invalid due to reason=${failedVerificationReason}`);

    return publication;
  }

  async createComment(createCommentOptions) {
    const commentSubplebbit = await this.getSubplebbit(createCommentOptions.subplebbitAddress); // TODO This should be fetched from cache

    if (!createCommentOptions.signer) return createCommentOptions.title ? new _Post.default(createCommentOptions, commentSubplebbit) : new _Comment.Comment(createCommentOptions, commentSubplebbit);
    if (!createCommentOptions.timestamp) createCommentOptions.timestamp = (0, _Util.timestamp)();
    const commentProps = await _classPrivateMethodGet(this, _signPublication, _signPublication2).call(this, createCommentOptions);
    return commentProps.title ? new _Post.default(commentProps, commentSubplebbit) : new _Comment.Comment(commentProps, commentSubplebbit);
  }

  async createSubplebbit(createSubplebbitOptions) {
    return new _Subplebbit.Subplebbit(createSubplebbitOptions, this);
  }

  async createVote(createVoteOptions) {
    const subplebbit = await this.getSubplebbit(createVoteOptions.subplebbitAddress);
    if (!createVoteOptions.signer) return new _Vote.default(createVoteOptions, subplebbit);
    if (!createVoteOptions.timestamp) createVoteOptions.timestamp = (0, _Util.timestamp)();
    const voteProps = await _classPrivateMethodGet(this, _signPublication, _signPublication2).call(this, createVoteOptions);
    return new _Vote.default(voteProps, subplebbit);
  }

  async createCommentEdit(createCommentEditOptions) {
    const commentSubplebbit = await this.getSubplebbit(createCommentEditOptions.subplebbitAddress);
    if (!createCommentEditOptions.signer) // User just wants to instantiate a CommentEdit object, not publish
      return new _Comment.CommentEdit(createCommentEditOptions, commentSubplebbit);
    if (!createCommentEditOptions.editTimestamp) createCommentEditOptions.editTimestamp = (0, _Util.timestamp)();
    const commentEditProps = { ...createCommentEditOptions,
      "editSignature": await (0, _Signer.signPublication)(createCommentEditOptions, createCommentEditOptions.signer)
    };
    return new _Comment.CommentEdit(commentEditProps, commentSubplebbit);
  }

  async createSigner(createSignerOptions) {
    if (!createSignerOptions || !createSignerOptions["privateKey"]) {
      const keyPair = await crypto.keys.generateKeyPair('RSA', 2048);
      const privateKey = await keyPair.export('', 'pkcs-8');
      const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RS256', {
        extractable: true
      });
      const publicKey = await jose.exportSPKI(publicKeyFromJsonWebToken);
      const address = await (0, _Signer.getAddressFromPublicKeyPem)(publicKey);
      const ipfsKey = keyPair.bytes;
      return new _Signer.Signer({
        "privateKey": privateKey,
        'type': 'rsa',
        'publicKey': publicKey,
        "address": address,
        "ipfsKey": ipfsKey
      });
    } else if (createSignerOptions["privateKey"]) {
      _assert.default.equal(createSignerOptions.type, "rsa", "We can only support RSA keys at the moment");

      const keyPair = await crypto.keys.import(createSignerOptions.privateKey, "");
      const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, 'RS256', {
        extractable: true
      });
      const publicKeyPem = await jose.exportSPKI(publicKeyFromJsonWebToken);
      const address = await (0, _Signer.getAddressFromPublicKeyPem)(publicKeyPem);
      const ipfsKey = keyPair.bytes;
      return new _Signer.Signer({ ...createSignerOptions,
        "publicKey": publicKeyPem,
        "address": address,
        "ipfsKey": ipfsKey
      });
    }
  }

}

exports.Plebbit = Plebbit;

async function _signPublication2(createPublicationOptions) {
  if (createPublicationOptions.author && !createPublicationOptions.author.address) createPublicationOptions.author.address = createPublicationOptions.signer.address;
  const commentSignature = await (0, _Signer.signPublication)(createPublicationOptions, createPublicationOptions.signer);
  return { ...createPublicationOptions,
    "signature": commentSignature
  };
}