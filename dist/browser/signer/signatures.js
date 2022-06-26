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
exports.verifyPublication = exports.signPublication = exports.verifyBufferRsa = exports.signBufferRsa = exports.Signature = void 0;
const util_1 = require("./util");
const cborg_1 = require("cborg");
const to_string_1 = require("uint8arrays/to-string");
const from_string_1 = require("uint8arrays/from-string");
const assert_1 = __importDefault(require("assert"));
const peer_id_1 = __importDefault(require("peer-id"));
const util_2 = require("../util");
const publication_1 = __importDefault(require("../publication"));
const debugs = (0, util_2.getDebugLevels)("signer:signatures");
class Signature {
    constructor(props) {
        this.signature = props["signature"];
        this.publicKey = props["publicKey"];
        this.type = props["type"];
        this.signedPropertyNames = props["signedPropertyNames"];
    }
    toJSON() {
        return {
            signature: this.signature,
            publicKey: this.publicKey,
            type: this.type,
            signedPropertyNames: this.signedPropertyNames
        };
    }
}
exports.Signature = Signature;
function getFieldsToSign(publication) {
    if (publication.hasOwnProperty("vote"))
        return ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];
    else if (publication.commentCid)
        // CommentEdit
        return [
            "subplebbitAddress",
            "content",
            "commentCid",
            "editTimestamp",
            "editReason",
            "deleted",
            "spoiler",
            "pinned",
            "locked",
            "removed",
            "moderatorReason"
        ];
    else if (publication.title)
        // Post
        return ["subplebbitAddress", "author", "timestamp", "content", "title", "link"];
    else if (publication.content)
        // Comment
        return ["subplebbitAddress", "author", "timestamp", "parentCid", "content"];
}
const isProbablyBuffer = (arg) => arg && typeof arg !== "string" && typeof arg !== "number";
const signBufferRsa = (bufferToSign, privateKeyPem, privateKeyPemPassword = "") => __awaiter(void 0, void 0, void 0, function* () {
    (0, assert_1.default)(isProbablyBuffer(bufferToSign), `signBufferRsa invalid bufferToSign '${bufferToSign}' not buffer`);
    const keyPair = yield (0, util_1.getKeyPairFromPrivateKeyPem)(privateKeyPem, privateKeyPemPassword);
    // do not use libp2p keyPair.sign to sign strings, it doesn't encode properly in the browser
    return yield keyPair.sign(bufferToSign);
});
exports.signBufferRsa = signBufferRsa;
const verifyBufferRsa = (bufferToSign, bufferSignature, publicKeyPem) => __awaiter(void 0, void 0, void 0, function* () {
    (0, assert_1.default)(isProbablyBuffer(bufferToSign), `verifyBufferRsa invalid bufferSignature '${bufferToSign}' not buffer`);
    (0, assert_1.default)(isProbablyBuffer(bufferSignature), `verifyBufferRsa invalid bufferSignature '${bufferSignature}' not buffer`);
    const peerId = yield (0, util_1.getPeerIdFromPublicKeyPem)(publicKeyPem);
    return yield peerId.pubKey.verify(bufferToSign, bufferSignature);
});
exports.verifyBufferRsa = verifyBufferRsa;
function signPublication(publication, signer, plebbit) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address) {
            const resolvedAddress = yield plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address);
            const derivedAddress = yield (0, util_1.getPlebbitAddressFromPrivateKeyPem)(signer.privateKey);
            assert_1.default.equal(resolvedAddress, derivedAddress, `author.address (${publication.author.address}) does not equate its resolved address (${resolvedAddress}) is invalid. For this publication to be signed, user needs to ensure plebbit-author-address points to same key used by signer (${derivedAddress})`);
        }
        const fieldsToSign = getFieldsToSign(publication);
        const publicationSignFields = (0, util_2.removeKeysWithUndefinedValues)((0, util_2.keepKeys)(publication, fieldsToSign));
        debugs.TRACE(`Fields to sign: ${JSON.stringify(fieldsToSign)}. Publication object to sign:  ${JSON.stringify(publicationSignFields)}`);
        const commentEncoded = (0, cborg_1.encode)(publicationSignFields); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
        const signatureData = (0, to_string_1.toString)(yield (0, exports.signBufferRsa)(commentEncoded, signer.privateKey), "base64");
        debugs.DEBUG(`Publication been signed, signature data is (${signatureData})`);
        return new Signature({
            signature: signatureData,
            publicKey: signer.publicKey,
            type: signer.type,
            signedPropertyNames: fieldsToSign
        });
    });
}
exports.signPublication = signPublication;
// Return [verification (boolean), reasonForFailing (string)]
function verifyPublication(publication, plebbit, overrideAuthorAddressIfInvalid = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const verifyAuthor = (signature, author) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const signaturePeerId = yield (0, util_1.getPeerIdFromPublicKeyPem)(signature.publicKey);
            let authorPeerId;
            try {
                // There are cases where author.address is a crypto domain so PeerId.createFromB58String crashes
                authorPeerId = peer_id_1.default.createFromB58String(author.address);
            }
            catch (_b) { }
            if (authorPeerId)
                assert_1.default.equal(signaturePeerId.equals(authorPeerId), true, "comment.author.address doesn't match comment.signature.publicKey");
            else if (overrideAuthorAddressIfInvalid && ((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address)) {
                // Meaning author is a domain, crypto one likely
                const resolvedAddress = yield plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address);
                if (resolvedAddress !== publication.author.address) {
                    // Means author.address is a crypto domain
                    const derivedAddress = yield (0, util_1.getPlebbitAddressFromPublicKeyPem)(publication.signature.publicKey);
                    if (resolvedAddress !== derivedAddress) {
                        // Means plebbit-author-address text record is resolving to another comment (oudated?)
                        // Will always use address derived from publication.signature.publicKey as truth
                        debugs.INFO(`domain (${publication.author.address}) resolved address (${resolvedAddress}) is invalid, changing publication.author.address to derived address ${derivedAddress}`);
                        publication.author.address = derivedAddress;
                    }
                }
            }
        });
        const verifyPublicationSignature = (signature, publicationToBeVerified) => __awaiter(this, void 0, void 0, function* () {
            const commentWithFieldsToSign = (0, util_2.keepKeys)(publicationToBeVerified, signature.signedPropertyNames);
            debugs.DEBUG(`signature.signedPropertyNames: [${signature.signedPropertyNames}], Attempt to verify a publication: ${JSON.stringify(commentWithFieldsToSign)}`);
            const commentEncoded = (0, cborg_1.encode)((0, util_2.removeKeysWithUndefinedValues)(commentWithFieldsToSign));
            const signatureIsValid = yield (0, exports.verifyBufferRsa)(commentEncoded, (0, from_string_1.fromString)(signature.signature, "base64"), signature.publicKey);
            assert_1.default.equal(signatureIsValid, true, "Signature is invalid");
        });
        try {
            if (publication.originalContent) {
                // This is a comment/post that has been edited, and we need to verify both signature and editSignature
                debugs.TRACE("Attempting to verify a comment that has been edited. Will verify comment.author,  comment.signature and comment.editSignature");
                const publicationJson = publication instanceof publication_1.default ? publication.toJSON() : publication;
                const originalSignatureObj = Object.assign(Object.assign({}, publicationJson), { content: publication.originalContent });
                debugs.TRACE(`Attempting to verify comment.signature`);
                yield verifyPublicationSignature(publication.signature, originalSignatureObj);
                debugs.TRACE(`Attempting to verify comment.editSignature`);
                const editedSignatureObj = Object.assign(Object.assign({}, publicationJson), { commentCid: publication.cid });
                yield verifyPublicationSignature(publication.editSignature, editedSignatureObj);
                // Verify author at the end since we might change author.address which will fail signature verification
                publication.author ? yield verifyAuthor(publication.signature, publication.author) : undefined;
            }
            else if (publication.commentCid && publication.content) {
                // Verify CommentEdit
                debugs.TRACE(`Attempting to verify CommentEdit`);
                yield verifyPublicationSignature(publication.editSignature, publication);
            }
            else {
                debugs.TRACE(`Attempting to verify post/comment/vote`);
                yield verifyPublicationSignature(publication.signature, publication);
                publication.author ? yield verifyAuthor(publication.signature, publication.author) : undefined;
            }
            debugs.TRACE("Publication has been verified");
            return [true];
        }
        catch (e) {
            debugs.WARN(`Failed to verify publication due to error: ${e}`);
            return [false, String(e)];
        }
    });
}
exports.verifyPublication = verifyPublication;
