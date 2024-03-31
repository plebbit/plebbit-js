export enum messages {
    ERR_SUB_SIGNER_NOT_DEFINED = "Subplebbit signer is not defined",
    ERR_SUB_CAN_EITHER_RUN_OR_UPDATE = "Subplebbit can either sync through .start() or update, but not both",
    ERR_PUBLICATION_MISSING_FIELD = "Publication is missing field(s)",
    ERR_SUBPLEBBIT_MISSING_FIELD = "Subplebbit is missing field needed for publishing",
    ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS = "The options sent to plebbit.createSubplebbit() is missing address or signer",
    ERR_INVALID_SUBPLEBBIT_ADDRESS = "Subplebbit address is incorrect. Address should be either a domain or IPNS",
    ERR_CID_IS_INVALID = "CID is invalid",
    ERR_DATA_PATH_IS_NOT_DEFINED = "plebbitOptions.dataPath needs to be defined with native functions",
    ERR_IPNS_IS_INVALID = "IPNS is invalid",

    // Plebbit errors
    ERR_PLEBBIT_MISSING_NATIVE_FUNCTIONS = "missing nativeFunctions required to create a subplebbit",
    ERR_CAN_NOT_RUN_A_SUB_WITH_NO_IPFS_NODE = "Can't run a subplebbit with plebbit.ipfsHttpClientOptions undefined",
    ERR_PLEBBIT_OPTION_NOT_ACCEPTED = "Option is not accepted on Plebbit constructor",
    ERR_CAN_NOT_CREATE_A_SUB = "Can't create a new sub with the current PlebbitOptions",
    ERR_SUB_ADDRESS_IS_PROVIDED_AS_NULL_OR_UNDEFINED = "User provided options.address in createSubplebbit that is either undefined or null",

    // Fetch errors
    ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY = "Failed to fetch IPFS file via gateway",
    ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS = "Failed to fetch an IPFS via IPFS P2P",
    ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY = "Failed to fetch IPNS through gateway",
    ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS = "Failed to fetch Subplebbit IPNS record from gateway(s)",
    ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS = "Failed to resolve IPNS through IPFS P2P",
    ERR_FAILED_TO_FETCH_GENERIC = "Failed to fetch",
    ERR_OVER_DOWNLOAD_LIMIT = "The file size is larger than download limit",
    ERR_CALCULATED_CID_DOES_NOT_MATCH = "The CID calculated from loaded content does not match the provided CID",
    ERR_FAILED_TO_FETCH_THUMBNAIL_URL_OF_LINK = "Failed to fetch the thumbnail url of the link",
    ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER = "Domain address has an uppercase letter. Subplebbit domain address should be lowercase",

    // Sign errors
    ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER = "comment.author.address does not match signer.address",
    ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 = "author.address is not a domain or B58",
    ERR_SIGNATURE_PUBLIC_KEY_IS_NOT_B58 = "The public key of the signature is not B58",

    // Verify Signature errors
    ERR_SIGNATURE_IS_INVALID = "Signature of publication is invalid",
    ERR_COMMENT_UPDATE_EDIT_SIGNATURE_IS_INVALID = "The author edit of comment (commentUpdate.edit) has an invalid signature",
    ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT = "The gateway has responded with a subplebbit record that does not correspond to the requested subplebbit",
    ERR_AUTHOR_NOT_MATCHING_SIGNATURE = "comment.author.address doesn't match comment.signature.publicKey",
    ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY = "subplebbit.address.publicKey doesn't equal subplebbit.signature.publicKey",
    ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT = "comment.content is not set to the latest comment.authorEdit.content",
    ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT = "Comment update is not signed by the subplebbit",
    ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR = "Author edit is not signed by original author of comment",
    ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT = "CommentUpdate.cid is different than comment.cid",
    ERR_CHALLENGE_MSG_SIGNER_IS_NOT_SUBPLEBBIT = "The signer of challenge pubsub message is not the subplebbit",
    ERR_CHALLENGE_VERIFICATION_MSG_SIGNER_IS_NOT_SUBPLEBBIT = "The signer of challenge verification pubsub message is not the subplebbit",
    ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE = "Challenge request id is not derived from signature.publicKey",
    ERR_CHALLENGE_SIGNATURE_IS_INVALID = "Received a challenge message with an invalid signature",
    ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID = "Received a challenge verification message with an invalid signature",
    ERR_LOCAL_SUBPLEBBIT_SIGNATURE_IS_INVALID = "Local subplebbit signature is invalid",
    ERR_SUBPLEBBIT_POSTS_INVALID = "subplebbit.posts signature is invalid",
    ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID = "CommentIpfs signature is invalid",
    ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID = "CommentUpdate signature is invalid",
    ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID = "Subplebbit signature is invalid",
    ERR_FAILED_TO_RESOLVE_SUBPLEBBIT_DOMAIN = "Failed to resolve the subplebbit domain address to use for verification",
    ERR_FAILED_TO_RESOLVE_AUTHOR_DOMAIN = "Failed to resolve the author domain address to use for verification",

    // getPage errors
    ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB = "Comment in page should be under the same subplebbit",
    ERR_PARENT_CID_NOT_AS_EXPECTED = "Comment under parent comment/post should have parentCid initialized",
    ERR_PAGE_SIGNATURE_IS_INVALID = "The signature of one of the comment in the page is invalid",

    // Subplebbit rejections of pubsub messages
    ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST = "Received a challenge answer without a prior challenge request",
    ERR_REUSED_PUBSUB_MSG_SIGNER = "Reusing a pubsub message signer is forbidden",
    ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED = "The timestamp of the pubsub message is outdated",

    // Subplebbit rejections of publications

    ERR_UNAUTHORIZED_COMMENT_EDIT = "The author of this edit is not a mod/admin/owner or an author of the original comment. Can't edit",
    ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT = "Rejecting post/comment because its timestamp is earlier than its parent",
    ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST = "The parent of this comment does not exist",
    ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED = "The parent cid of this comment is not defined",
    ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS = "The subplebbitAddress field of publication is not the same as the subplebbit being published to",
    ERR_AUTHOR_IS_BANNED = "Author is banned",
    ERR_PUBLICATION_HAS_NO_AUTHOR_ADDRESS = "Publication has no author.address",
    ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED = "The parent of this publication has been removed",
    ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED = "The parent of this publication has been deleted",
    ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED = "The post of this publication has been deleted",
    ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED = "The post of this publication has been removed",
    ERR_SUB_PUBLICATION_POST_IS_LOCKED = "The post of this publication has been locked",
    ERR_FORBIDDEN_AUTHOR_FIELD = "The author field includes a forbidden field",
    ERR_FORBIDDEN_COMMENT_FIELD = "The comment/post contains a forbidden field",
    ERR_FORBIDDEN_SIGNER_FIELD = "The publication includes a signer field which is forbidden",
    ERR_DUPLICATE_COMMENT = "Comment is duplicated",
    ERR_AUTHOR_ADDRESS_UNDEFINED = "author address is undefined",
    ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG = "Subplebbit failed to decrypt the pubsub message",
    ERR_COMMENT_OVER_ALLOWED_SIZE = "Comment size is over the allowed size",
    UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE = "An author attempted to change another author's vote",
    COMMENT_LINK_LENGTH_IS_OVER_LIMIT = "comment.link length is over the limit",
    INCORRECT_VOTE_VALUE = "The vote can only be 1 or 0 or -1",
    ERR_POST_HAS_INVALID_LINK_FIELD = "Publishing to the subplebbit requires a post with a valid link field",
    ERR_POST_LINK_IS_NOT_OF_MEDIA = "Publishing to the subplebbit requires a post with a link pointing to media (audio, video, image)",
    ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE = "Comment has no content, link or title",

    // Comment Edit errors
    ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY = "Can't lock replies. Only posts",
    ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD = "CommentEdit includes a field that cannot be used",
    ERR_PUBLISHING_EDIT_WITH_BOTH_MOD_AND_AUTHOR_FIELDS = "CommentEdit can't have both author and mod fields. Please publish a separate request for author and mod",

    // Resolver errors
    ERR_FAILED_TO_RESOLVE_TEXT_RECORD = "Failed to resolve text record",
    ERR_NO_CHAIN_PROVIDER_FOR_CHAIN_TICKER = "no chain provider options set for chain ticker",
    ERR_DOMAIN_TXT_RECORD_NOT_FOUND = "Domain resolver did not find the text record",
    ERR_DOMAIN_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS = "subplebbit-address text record of domain is pointing to a different address than subplebbit.signer.address",
    ERR_RESOLVED_TEXT_RECORD_TO_NON_IPNS = "Resolved the text record value to a string that is non IPNS",
    ERR_SUBPLEBBIT_DOMAIN_HAS_NO_TEXT_RECORD = "Domain resolver did not find the text record subplebbit-address",
    ERR_AUTHOR_DOMAIN_HAS_NO_TEXT_RECORD = "Domain resolver did not find the text record plebbit-autho-address",

    // Local sub errors
    ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE = "subplebbit.signer needs to be defined before proceeding",
    ERR_SUB_STATE_LOCKED = "The internal state of the subplebbit in DB is locked",
    ERR_SUB_CREATION_LOCKED = "Subplebbit creation is locked",
    ERR_SUB_ALREADY_STARTED = "Subplebbit already started",
    ERR_FAILED_TO_IMPORT_IPFS_KEY = "Subplebbit failed to import IPFS key",
    ERR_LOCAL_SUBPLEBBIT_PRODUCED_INVALID_RECORD = "The local subplebbit has produced a new IPNS record with invalid signature. This is a crticial error",

    // Pubsub errors
    ERR_PUBSUB_FAILED_TO_SUBSCRIBE = "Failed to subscribe on pubsub",
    ERR_PUBSUB_FAILED_TO_UNSUBSCRIBE = "Failed to unsubscribe on pubsub",
    ERR_PUBSUB_FAILED_TO_PUBLISH = "Failed to publish on pubsub",
    ERR_PUBSUB_DID_NOT_RECEIVE_RESPONSE_AFTER_PUBLISHING_CHALLENGE_REQUEST = "Did not receive response to challenge request in the specified time",
    ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS = "All pubsub providers throw an error and unable to publish or subscribe",
    ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER = "The challenge request has been published over the pubsub topic but no response was received",

    // RPC errors
    ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC = "Failed to open connection to RPC",
    ERR_FAILED_TO_CREATE_WS_RPC_SERVER = "Failed to create WebSocket RPC server",
    ERR_RPC_CLIENT_ATTEMPTING_TO_START_A_REMOTE_SUB = "Attempting to start a subplebbit that is not local",
    ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING = "RPC client is attempting to stop a local sub that is not running",
    ERR_RPC_CLIENT_TRYING_TO_STOP_REMOTE_SUB = "RPC client is attempting to stop a remote sub",
    ERR_RPC_CLIENT_TRYING_TO_EDIT_REMOTE_SUB = "RPC client is attempting to edit remote sub",
    ERR_RPC_CLIENT_TRYING_TO_DELETE_REMOTE_SUB = "RPC client is attempting to delete remote sub"
}
