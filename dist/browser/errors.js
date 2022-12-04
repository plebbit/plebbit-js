"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = void 0;
var messages;
(function (messages) {
    messages["ERR_ENS_RESOLVER_NOT_FOUND"] = "ENS resolver is not found";
    messages["ERR_ENS_TXT_RECORD_NOT_FOUND"] = "ENS resolver did not find the text record";
    messages["ERR_SUB_SIGNER_NOT_DEFINED"] = "Subplebbit signer is not defined";
    messages["ERR_SUB_ALREADY_STARTED"] = "Subplebbit already started";
    messages["ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS"] = "subplebbit-address is pointing to a different address than subplebbit.signer.address";
    messages["ERR_SUB_CAN_EITHER_RUN_OR_UPDATE"] = "Subplebbit can either sync through .start() or update, but not both";
    messages["ERR_PUBLICATION_MISSING_FIELD"] = "Publication is missing field(s)";
    messages["ERR_COMMENT_UPDATE_MISSING_IPNS_NAME"] = "Can't update comment without a defined IPNS name (comment.ipnsName)";
    messages["ERR_SUBPLEBBIT_MISSING_FIELD"] = "Subplebbit is missing field needed for publishing";
    messages["ERR_INVALID_SUBPLEBBIT_ADDRESS"] = "Subplebbit address is incorrect. Address should be either a domain or CID";
    messages["ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID"] = "subplebbit-address resolves to an invalid CID";
    messages["ERR_CID_IS_INVALID"] = "CID is invalid";
    messages["ERR_SUB_HAS_NO_DB_CONFIG"] = "Subplebbit has no db config";
    messages["ERR_DATA_PATH_IS_NOT_DEFINED"] = "plebbitOptions.dataPath needs to be defined with native functions";
    messages["ERR_IPNS_IS_INVALID"] = "IPNS is invalid";
    messages["ERR_OVER_DOWNLOAD_LIMIT"] = "The file size is larger than download limit";
    messages["ERR_GENERATED_CID_DOES_NOT_MATCH"] = "The CID generated from loaded content does not match the provided CID";
    // Sign errors
    messages["ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER"] = "comment.author.address does not match signer.address";
    // Verify Signature errors
    messages["ERR_SIGNATURE_IS_INVALID"] = "Signature of publication is invalid";
    messages["ERR_AUTHOR_NOT_MATCHING_SIGNATURE"] = "comment.author.address doesn't match comment.signature.publicKey";
    messages["ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY"] = "subplebbit.address.publicKey doesn't equal subplebbit.signature.publicKey";
    messages["ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT"] = "comment.content is not set to the latest comment.authorEdit.content";
    messages["ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT"] = "Comment update is not signed by the subplebbit";
    messages["ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR"] = "Author edit is not signed by original author of comment";
    messages["ERR_SUBPLEBBIT_POSTS_INVALID"] = "subplebbit.posts signature is invalid";
    // getPage errors
    messages["ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB"] = "Comment in page should be under the same subplebbit";
    messages["ERR_PARENT_CID_NOT_AS_EXPECTED"] = "Comment under parent comment/post should have parentCid initialized";
    // Subplebbit rejections of publications
    messages["ERR_UNAUTHORIZED_COMMENT_EDIT"] = "Current author is not the original author nor a mod. Can't edit the comment due to lack of authorization";
    messages["ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT"] = "Rejecting post/comment because its timestamp is earlier than its parent";
    messages["ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST"] = "The parent of this comment does not exist";
    messages["ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED"] = "The parent cid of this comment is not defined";
})(messages = exports.messages || (exports.messages = {}));
