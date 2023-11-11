"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = void 0;
var messages;
(function (messages) {
    messages["ERR_SUB_SIGNER_NOT_DEFINED"] = "Subplebbit signer is not defined";
    messages["ERR_SUB_CAN_EITHER_RUN_OR_UPDATE"] = "Subplebbit can either sync through .start() or update, but not both";
    messages["ERR_PUBLICATION_MISSING_FIELD"] = "Publication is missing field(s)";
    messages["ERR_COMMENT_UPDATE_MISSING_IPNS_NAME"] = "Can't update comment without a defined IPNS name (comment.ipnsName)";
    messages["ERR_SUBPLEBBIT_MISSING_FIELD"] = "Subplebbit is missing field needed for publishing";
    messages["ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS"] = "The options sent to plebbit.createSubplebbit() is missing address or signer";
    messages["ERR_INVALID_SUBPLEBBIT_ADDRESS"] = "Subplebbit address is incorrect. Address should be either a domain or IPNS";
    messages["ERR_ENS_ADDRESS_HAS_NO_SUBPLEBBIT_ADDRESS_TEXT_RECORD"] = "The ENS address has no subplebbit-address text record that points to IPNS name";
    messages["ERR_ENS_AUTHOR_ADDRESS_POINTS_TO_INVALID_IPNS"] = "plebbit-author-address resolves to an invalid IPNS";
    messages["ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_IPNS"] = "subplebbit-address resolves to an invalid IPNS";
    messages["ERR_CID_IS_INVALID"] = "CID is invalid";
    messages["ERR_DATA_PATH_IS_NOT_DEFINED"] = "plebbitOptions.dataPath needs to be defined with native functions";
    messages["ERR_IPNS_IS_INVALID"] = "IPNS is invalid";
    // Plebbit errors
    messages["ERR_PLEBBIT_MISSING_NATIVE_FUNCTIONS"] = "missing nativeFunctions required to create a subplebbit";
    messages["ERR_CAN_NOT_RUN_A_SUB_WITH_NO_IPFS_NODE"] = "Can't run a subplebbit with plebbit.ipfsHttpClientOptions undefined";
    messages["ERR_PLEBBIT_OPTION_NOT_ACCEPTED"] = "Option is not accepted on Plebbit constructor";
    messages["ERR_CAN_NOT_CREATE_A_SUB"] = "Can't create a new sub with the current PlebbitOptions";
    // Fetch errors
    messages["ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"] = "Failed to fetch IPFS file via gateway";
    messages["ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS"] = "Failed to fetch an IPFS via IPFS P2P";
    messages["ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"] = "Failed to fetch IPNS through gateway";
    messages["ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS"] = "Failed to resolve IPNS through IPFS P2P";
    messages["ERR_FAILED_TO_FETCH_GENERIC"] = "Failed to fetch";
    messages["ERR_OVER_DOWNLOAD_LIMIT"] = "The file size is larger than download limit";
    messages["ERR_CALCULATED_CID_DOES_NOT_MATCH"] = "The CID calculated from loaded content does not match the provided CID";
    messages["ERR_FAILED_TO_FETCH_THUMBNAIL_URL_OF_LINK"] = "Failed to fetch the thumbnail url of the link";
    messages["ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER"] = "ENS address has an uppercase letter. Subplebbit ENS address should be lowercase";
    // Sign errors
    messages["ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER"] = "comment.author.address does not match signer.address";
    messages["ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58"] = "author.address is not a domain or B58";
    messages["ERR_SIGNATURE_PUBLIC_KEY_IS_NOT_B58"] = "The public key of the signature is not B58";
    // Verify Signature errors
    messages["ERR_SIGNATURE_IS_INVALID"] = "Signature of publication is invalid";
    messages["ERR_AUTHOR_NOT_MATCHING_SIGNATURE"] = "comment.author.address doesn't match comment.signature.publicKey";
    messages["ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY"] = "subplebbit.address.publicKey doesn't equal subplebbit.signature.publicKey";
    messages["ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT"] = "comment.content is not set to the latest comment.authorEdit.content";
    messages["ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT"] = "Comment update is not signed by the subplebbit";
    messages["ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR"] = "Author edit is not signed by original author of comment";
    messages["ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT"] = "CommentUpdate.cid is different than comment.cid";
    messages["ERR_CHALLENGE_MSG_SIGNER_IS_NOT_SUBPLEBBIT"] = "The signer of challenge pubsub message is not the subplebbit";
    messages["ERR_CHALLENGE_VERIFICATION_MSG_SIGNER_IS_NOT_SUBPLEBBIT"] = "The signer of challenge verification pubsub message is not the subplebbit";
    messages["ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE"] = "Challenge request id is not derived from signature.publicKey";
    messages["ERR_CHALLENGE_SIGNATURE_IS_INVALID"] = "Received a challenge message with an invalid signature";
    messages["ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID"] = "Received a challenge verification message with an invalid signature";
    messages["ERR_LOCAL_SUBPLEBBIT_SIGNATURE_IS_INVALID"] = "Local subplebbit signature is invalid";
    messages["ERR_SUBPLEBBIT_POSTS_INVALID"] = "subplebbit.posts signature is invalid";
    messages["ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID"] = "CommentIpfs signature is invalid";
    messages["ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID"] = "CommentUpdate signature is invalid";
    // getPage errors
    messages["ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB"] = "Comment in page should be under the same subplebbit";
    messages["ERR_PARENT_CID_NOT_AS_EXPECTED"] = "Comment under parent comment/post should have parentCid initialized";
    messages["ERR_PAGE_SIGNATURE_IS_INVALID"] = "The signature of one of the comment in the page is invalid";
    // Subplebbit rejections of pubsub messages
    messages["ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST"] = "Received a challenge answer without a prior challenge request";
    messages["ERR_REUSED_PUBSUB_MSG_SIGNER"] = "Reusing a pubsub message signer is forbidden";
    messages["ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED"] = "The timestamp of the pubsub message is outdated";
    // Subplebbit rejections of publications
    messages["ERR_UNAUTHORIZED_COMMENT_EDIT"] = "Can't edit the comment due to lack of authorization";
    messages["ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT"] = "Rejecting post/comment because its timestamp is earlier than its parent";
    messages["ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST"] = "The parent of this comment does not exist";
    messages["ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED"] = "The parent cid of this comment is not defined";
    messages["ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS"] = "The subplebbitAddress field of publication is not the same as the subplebbit being published to";
    messages["ERR_AUTHOR_IS_BANNED"] = "Author is banned";
    messages["ERR_PUBLICATION_HAS_NO_AUTHOR_ADDRESS"] = "Publication has no author.address";
    messages["ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED"] = "The parent of this publication has been removed";
    messages["ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED"] = "The parent of this publication has been deleted";
    messages["ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED"] = "The post of this publication has been deleted";
    messages["ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED"] = "The post of this publication has been removed";
    messages["ERR_SUB_PUBLICATION_POST_IS_LOCKED"] = "The post of this publication has been locked";
    messages["ERR_FORBIDDEN_AUTHOR_FIELD"] = "The author field includes a forbidden field";
    messages["ERR_FORBIDDEN_COMMENT_FIELD"] = "The comment/post contains a forbidden field";
    messages["ERR_FORBIDDEN_SIGNER_FIELD"] = "The publication includes a signer field which is forbidden";
    messages["ERR_DUPLICATE_COMMENT"] = "Comment is duplicated";
    messages["ERR_AUTHOR_ADDRESS_UNDEFINED"] = "author address is undefined";
    messages["ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG"] = "Subplebbit failed to decrypt the pubsub message";
    messages["ERR_COMMENT_OVER_ALLOWED_SIZE"] = "Comment size is over the allowed size";
    messages["UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE"] = "An author attempted to change another author's vote";
    messages["COMMENT_LINK_LENGTH_IS_OVER_LIMIT"] = "comment.link length is over the limit";
    // Comment Edit errors
    messages["ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY"] = "Can't lock replies. Only posts";
    messages["ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD"] = "CommentEdit includes a field that cannot be used";
    // Resolver errors
    messages["ERR_FAILED_TO_RESOLVE_TEXT_RECORD"] = "Failed to resolve text record";
    messages["ERR_NO_CHAIN_PROVIDER_FOR_CHAIN_TICKER"] = "no chain provider options set for chain ticker";
    messages["ERR_ENS_RESOLVER_NOT_FOUND"] = "ENS resolver is not found";
    messages["ERR_ENS_TXT_RECORD_NOT_FOUND"] = "ENS resolver did not find the text record";
    messages["ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS"] = "subplebbit-address is pointing to a different address than subplebbit.signer.address";
    // Local sub errors
    messages["ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE"] = "subplebbit.signer needs to be defined before proceeding";
    messages["ERR_SUB_STATE_LOCKED"] = "The internal state of the subplebbit in DB is locked";
    messages["ERR_SUB_CREATION_LOCKED"] = "Subplebbit creation is locked";
    messages["ERR_SUB_ALREADY_STARTED"] = "Subplebbit already started";
    messages["ERR_FAILED_TO_IMPORT_IPFS_KEY"] = "Subplebbit failed to import IPFS key";
    // Pubsub errors
    messages["ERR_PUBSUB_FAILED_TO_SUBSCRIBE"] = "Failed to subscribe on pubsub";
    messages["ERR_PUBSUB_FAILED_TO_UNSUBSCRIBE"] = "Failed to unsubscribe on pubsub";
    messages["ERR_PUBSUB_FAILED_TO_PUBLISH"] = "Failed to publish on pubsub";
    messages["ERR_PUBSUB_DID_NOT_RECEIVE_RESPONSE_AFTER_PUBLISHING_CHALLENGE_REQUEST"] = "Did not receive response to challenge request in the specified time";
    messages["ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS"] = "All pubsub providers throw an error and unable to publish or subscribe";
    messages["ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER"] = "The challenge request has been published over the pubsub topic but no response was received";
    // RPC errors
    messages["ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC"] = "Failed to open connection to RPC";
})(messages || (exports.messages = messages = {}));
//# sourceMappingURL=errors.js.map