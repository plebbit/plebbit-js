"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plebbit = void 0;
const util_1 = __importDefault(require("./runtime/node/util"));
const comment_1 = require("./comment");
const post_1 = __importDefault(require("./post"));
const subplebbit_1 = require("./subplebbit");
const util_2 = require("./util");
const vote_1 = __importDefault(require("./vote"));
const ipfs_http_client_1 = require("ipfs-http-client");
const assert_1 = __importDefault(require("assert"));
const signer_1 = require("./signer");
const resolver_1 = require("./resolver");
const tinycache_1 = __importDefault(require("tinycache"));
const debugs = (0, util_2.getDebugLevels)("plebbit");
class Plebbit {
    constructor(options = {}) {
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = this.ipfsHttpClientOptions ? (0, ipfs_http_client_1.create)(this.ipfsHttpClientOptions) : undefined;
        this.pubsubHttpClientOptions = options["pubsubHttpClientOptions"] || "https://pubsubprovider.xyz/api/v0";
        this.pubsubIpfsClient = options["pubsubHttpClientOptions"]
            ? (0, ipfs_http_client_1.create)(options["pubsubHttpClientOptions"])
            : this.ipfsClient
                ? this.ipfsClient
                : (0, ipfs_http_client_1.create)(this.pubsubHttpClientOptions);
        this.dataPath = options["dataPath"] || util_1.default.getDefaultDataPath();
        this.resolver = new resolver_1.Resolver({ plebbit: this, blockchainProviders: options["blockchainProviders"] });
        this._memCache = new tinycache_1.default();
    }
    _init(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options["ipfsGatewayUrl"])
                this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
            else {
                try {
                    let gatewayFromNode = yield this.ipfsClient.config.get("Addresses.Gateway");
                    debugs.TRACE(`Gateway from node: ${JSON.stringify(gatewayFromNode)}`);
                    if (Array.isArray(gatewayFromNode))
                        gatewayFromNode = gatewayFromNode[0];
                    const splits = gatewayFromNode.toString().split("/");
                    this.ipfsGatewayUrl = `http://${splits[2]}:${splits[4]}`;
                    debugs.DEBUG(`plebbit.ipfsGatewayUrl retrieved from IPFS node: ${this.ipfsGatewayUrl}`);
                }
                catch (e) {
                    this.ipfsGatewayUrl = "https://cloudflare-ipfs.com";
                    debugs.ERROR(`${e.msg}: Failed to retrieve gateway url from ipfs node, will default to ${this.ipfsGatewayUrl}`);
                }
            }
        });
    }
    getSubplebbit(subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(typeof subplebbitAddress === "string");
            (0, assert_1.default)(subplebbitAddress.length > 0);
            const resolvedSubplebbitAddress = yield this.resolver.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
            (0, assert_1.default)(typeof resolvedSubplebbitAddress === "string" && resolvedSubplebbitAddress.length > 0, "Resolved address of a subplebbit needs to be defined");
            const subplebbitJson = yield (0, util_2.loadIpnsAsJson)(resolvedSubplebbitAddress, this);
            return new subplebbit_1.Subplebbit(Object.assign(Object.assign({}, subplebbitJson), { address: subplebbitAddress }), this);
        });
    }
    getComment(cid) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentJson = yield (0, util_2.loadIpfsFileAsJson)(cid, this);
            const subplebbit = yield this.getSubplebbit(commentJson["subplebbitAddress"]);
            const publication = commentJson["title"]
                ? new post_1.default(Object.assign(Object.assign({}, commentJson), { postCid: cid, cid: cid }), subplebbit)
                : new comment_1.Comment(Object.assign(Object.assign({}, commentJson), { cid: cid }), subplebbit);
            const [signatureIsVerified, failedVerificationReason] = yield (0, signer_1.verifyPublication)(publication, this);
            assert_1.default.equal(signatureIsVerified, true, `Signature of comment/post ${cid} is invalid due to reason=${failedVerificationReason}`);
            return publication;
        });
    }
    signPublication(createPublicationOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (createPublicationOptions.author && !createPublicationOptions.author.address) {
                createPublicationOptions.author.address = createPublicationOptions.signer.address;
                debugs.DEBUG(`createPublicationOptions did not provide author.address, will define it to signer.address (${createPublicationOptions.signer.address})`);
            }
            const commentSignature = yield (0, signer_1.signPublication)(createPublicationOptions, createPublicationOptions.signer, this);
            return Object.assign(Object.assign({}, createPublicationOptions), { signature: commentSignature });
        });
    }
    defaultTimestampIfNeeded(createPublicationOptions) {
        if (!createPublicationOptions.timestamp) {
            const defaultTimestamp = (0, util_2.timestamp)();
            debugs.DEBUG(`User hasn't provided a timestamp in options, defaulting to (${defaultTimestamp})`);
            createPublicationOptions.timestamp = defaultTimestamp;
        }
        return createPublicationOptions;
    }
    createComment(createCommentOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentSubplebbit = { plebbit: this };
            if (!createCommentOptions.signer)
                return createCommentOptions.title
                    ? new post_1.default(createCommentOptions, commentSubplebbit)
                    : new comment_1.Comment(createCommentOptions, commentSubplebbit);
            createCommentOptions = this.defaultTimestampIfNeeded(createCommentOptions);
            const commentProps = yield this.signPublication(createCommentOptions);
            return commentProps.title ? new post_1.default(commentProps, commentSubplebbit) : new comment_1.Comment(commentProps, commentSubplebbit);
        });
    }
    createSubplebbit(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new subplebbit_1.Subplebbit(options, this);
        });
    }
    createVote(createVoteOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const subplebbit = { plebbit: this };
            if (!createVoteOptions.signer)
                return new vote_1.default(createVoteOptions, subplebbit);
            createVoteOptions = this.defaultTimestampIfNeeded(createVoteOptions);
            const voteProps = yield this.signPublication(createVoteOptions);
            return new vote_1.default(voteProps, subplebbit);
        });
    }
    createCommentEdit(createCommentEditOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!createCommentEditOptions.signer)
                // User just wants to instantiate a CommentEdit object, not publish
                return new comment_1.CommentEdit(createCommentEditOptions, { plebbit: this });
            if (!createCommentEditOptions.editTimestamp) {
                const defaultTimestamp = (0, util_2.timestamp)();
                debugs.DEBUG(`User hasn't provided any editTimestamp for their CommentEdit, defaulted to (${defaultTimestamp})`);
                createCommentEditOptions.editTimestamp = defaultTimestamp;
            }
            const commentEditProps = Object.assign(Object.assign({}, createCommentEditOptions), { editSignature: yield (0, signer_1.signPublication)(createCommentEditOptions, createCommentEditOptions.signer, this) });
            return new comment_1.CommentEdit(commentEditProps, { plebbit: this });
        });
    }
    createSigner(createSignerOptions = {}) {
        return (0, signer_1.createSigner)(createSignerOptions);
    }
}
exports.Plebbit = Plebbit;
