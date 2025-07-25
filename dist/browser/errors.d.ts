export declare enum messages {
    ERR_SUB_SIGNER_NOT_DEFINED = "Subplebbit signer is not defined",
    ERR_SUB_CAN_EITHER_RUN_OR_UPDATE = "Subplebbit can either sync through .start() or update, but not both",
    ERR_PUBLICATION_MISSING_FIELD = "Publication is missing field(s)",
    ERR_SUBPLEBBIT_MISSING_FIELD = "Subplebbit is missing field needed for publishing",
    ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS = "The options sent to plebbit.createSubplebbit() is missing address or signer",
    ERR_INVALID_SUBPLEBBIT_ADDRESS_SCHEMA = "Subplebbit address is incorrect. Address should be either a domain or IPNS",
    ERR_CID_IS_INVALID = "CID is invalid",
    ERR_DATA_PATH_IS_NOT_DEFINED = "plebbitOptions.dataPath needs to be defined with native functions",
    ERR_SUB_OWNER_ATTEMPTED_EDIT_NEW_ADDRESS_THAT_ALREADY_EXISTS = "Subplebbit owner attempted to edit subplebbit.address to a new address that already exists",
    ERR_COMMENT_MISSING_IPFS_AND_UPDATE = "Comment is missing CommentIpfs and CommentUpdate",
    ERR_COMMENT_MISSING_CID = "Comment is missing cid",
    ERR_COMMENT_MISSING_IPFS = "Comment is missing CommentIpfs props",
    ERR_COMMENT_MISSING_UPDATE = "Comment is missing CommentUpdate props",
    ERR_NEED_TO_STOP_UPDATING_SUB_BEFORE_STARTING = "You need to stop updating the subplebbit before starting it",
    ERR_HELIAS_STOPPING_OR_STOPPED = "Helia is stopping or stopped already. You can't use any helia functions",
    ERR_FAILED_TO_DIAL_ANY_PUBSUB_PEERS_FROM_DELEGATED_ROUTERS = "Failed to dial and connect to any IPNS-Over-Pubsub peers from delegated routers",
    ERR_FETCH_OVER_IPNS_OVER_PUBSUB_RETURNED_UNDEFINED = "libp2p Fetch over IPNS-Over-Pubsub returned undefined when requested from a peer",
    ERR_FAILED_TO_DIAL_ANY_PEERS_PROVIDING_CID = "Failed to dial and connect to any peers providing a CID",
    ERR_GET_SUBPLEBBIT_TIMED_OUT = "plebbit.getSubplebbit() timed out",
    ERR_TIMEOUT_WAITING_FOR_PUBSUB_TOPIC_PEERS = "Timeout waiting for propagation of pubsub topic peers",
    ERR_TIMED_OUT_RM_MFS_FILE = "Timed out removing MFS paths. We may need to nuke the whole MFS directory and republish everything",
    ERR_ABORTED_RESOLVING_TEXT_RECORD = "Aborted resolving text record on domain",
    ERR_CALLED_SUBPLEBBIT_STOP_WITHOUT_UPDATE = "subplebbit.stop() called without calling update() first",
    ERR_PLEBBIT_MISSING_NATIVE_FUNCTIONS = "missing nativeFunctions required to create a subplebbit",
    ERR_CAN_NOT_RUN_A_SUB_WITH_NO_IPFS_NODE = "Can't run a subplebbit with plebbit.ipfsHttpClientOptions undefined",
    ERR_PLEBBIT_OPTION_NOT_ACCEPTED = "Option is not accepted on Plebbit constructor",
    ERR_FAILED_TO_GET_CONFIG_ON_KUBO_NODE = "Failed to get config on kubo node",
    ERR_FAILED_TO_SET_CONFIG_ON_KUBO_NODE = "Failed to set config on kubo node",
    ERR_FAILED_TO_SHUTDOWN_KUBO_NODE = "Failed to shutdown kubo node",
    ERR_CAN_NOT_CREATE_A_LOCAL_SUB = "Can't create a new local sub with the provided arguments",
    ERR_SUB_ADDRESS_IS_PROVIDED_AS_NULL_OR_UNDEFINED = "User provided options.address in createSubplebbit that is either undefined or null",
    ERR_UNABLE_TO_DERIVE_PUBSUB_COMMENT_PUBLICATION_FROM_JSONIFIED_COMMENT = "User provided a jsonfied (cloned) Comment and we're unable to derive request.comment from it. This is an implementation error",
    ERR_UNABLE_TO_DERIVE_PUBSUB_COMMENT_EDIT_PUBLICATION_FROM_JSONIFIED_COMMENT_EDIT = "User provided a jsonfied (cloned) CommentEdit and we're unable to derive request.commentEdit from it. This is an implementation error",
    ERR_UNABLE_TO_DERIVE_PUBSUB_COMMENT_MODERATION_PUBLICATION_FROM_JSONIFIED_COMMENT_MODERATION = "User provided a jsonfied (cloned) CommentModeration and we're unable to derive request.commentModeration from it. This is an implementation error",
    ERR_UNABLE_TO_DERIVE_PUBSUB_VOTE_PUBLICATION_FROM_JSONIFIED_VOTE = "User provided a jsonfied (cloned) Vote and we're unable to derive request.vote from it. This is an implementation error",
    ERR_UNABLE_TO_DERIVE_PUBSUB_SUBPLEBBIT_EDIT_PUBLICATION_FROM_JSONIFIED_SUBPLEBBIT_EDIT = "User provided a jsonfied (cloned) SubplebbitEdit and we're unable to derive request.subplebbitEdit from it. This is an implementation error",
    ERR_PLEBBIT_SQLITE_LONG_TERM_STORAGE_KEYV_ERROR = "Error in Keyv SQLITE adapter",
    ERR_PLEBBIT_IS_DESTROYED = "Plebbit instance has been destroyed. Create a new instance.",
    ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY = "Failed to fetch IPFS file via gateway",
    ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P = "Failed to fetch an IPFS CID via IPFS P2P",
    ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY = "Failed to fetch IPNS through gateway",
    ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS = "Failed to fetch Subplebbit IPNS record from gateway(s)",
    ERR_FETCH_OVER_IPNS_OVER_PUBSUB_FAILED = "Failed to fetch IPNS record over IPNS-Over-Pubsub using libp2p/fetch",
    ERR_LIBP2P_FETCH_IPNS_FROM_PEER_TIMEDOUT = "libp2p fetch IPNS from peer timed out",
    ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS = "Failed to fetch comment IPFS file from gateway(s)",
    ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_GATEWAYS = "Failed to fetch comment update IPFS file from gateway(s)",
    ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS = "Failed to fetch Page IPFS file from gateway(s)",
    ERR_FAILED_TO_FETCH_GENERIC_IPFS_FROM_GATEWAYS = "Failed to fetch IPFS file from gateways(s)",
    ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P = "Failed to resolve IPNS through IPFS P2P. It may have resolved IPNS name to an undefined CID",
    ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES = "Failed to fetch CommentUpdate from all post update timestamp ranges",
    ERR_SUBPLEBBIT_HAS_NO_POST_UPDATES = "Subplebbit has no postUpdates field and therefore can't fetch a commentUpdate",
    ERR_FAILED_TO_FETCH_GENERIC = "Failed to fetch",
    ERR_OVER_DOWNLOAD_LIMIT = "The file size is larger than download limit",
    ERR_CALCULATED_CID_DOES_NOT_MATCH = "The CID calculated from loaded content does not match the provided CID",
    ERR_FAILED_TO_FETCH_THUMBNAIL_URL_OF_LINK = "Failed to fetch the thumbnail url of the link",
    ERR_FAILED_TO_FETCH_THUMBNAIL_DIMENSION_OF_LINK = "Failed to fetch the thumbnail dimension of the link",
    ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER = "Domain address has an uppercase letter. Subplebbit domain address should be lowercase",
    ERR_GATEWAY_TIMED_OUT_OR_ABORTED = "Fetching from gateway has been aborted/timed out",
    ERR_FAILED_TO_PARSE_CID_FROM_IPNS_GATEWAY_RESPONSE = "Failed to parse the CID of IPNS file from x-ipfs-roots header",
    ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_SAME_INVALID_SUBPLEBBIT_RECORD = "Aborted the gateway request to load subplebbit record because it will give us an invalid record we already processed and validated before",
    ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_SAME_UPDATE_CID = "Aborted the gateway request to load subplebbit record because it will give us the same record we already have",
    ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_WE_ALREADY_LOADED_THIS_RECORD = "Aborted the gateway request to load subplebbit record because we already loaded this record before",
    ERR_GATEWAY_PROVIDED_INCORRECT_X_IPFS_ROOTS = "Gateway provided an x-ipfs-roots that doesn't correspond to body",
    ERR_REMOTE_SUBPLEBBIT_RECEIVED_ALREADY_PROCCESSED_RECORD = "We loaded a subplebbit record but it's a record we already consumed before",
    ERR_COMMENT_RECEIVED_ALREADY_PROCESSED_COMMENT_UPDATE = "We loaded a CommentUpdate but it's a record we already consumed",
    ERR_FETCH_CID_P2P_TIMEOUT = "Fetching CID via Kubo-rpc-client/helia P2P has timed out",
    ERR_RESOLVED_IPNS_P2P_TO_UNDEFINED = "Resolved IPNS name to undefined. Does this IPNS name exist?",
    ERR_IPNS_RESOLUTION_P2P_TIMEOUT = "IPNS resolution P2P timed out",
    ERR_NO_DEFAULT_IPFS_PROVIDER = "No default IPFS provider found. Make sure to define either kuboRpcClientOptions or libp2pJsClientOptions",
    ERR_NO_DEFAULT_PUBSUB_PROVIDER = "No default pubsub provider found. Make sure to define either pubsubKuboRpcClientOptions or libp2pJsClientOptions",
    ERR_NO_DEFAULT_KUBO_RPC_PUBSUB_PROVIDER = "No default kubo rpc pubsub provider found. Make sure to define pubsubKuboRpcClientOptions",
    ERR_NO_DEFAULT_KUBO_RPC_IPFS_PROVIDER = "No default kubo rpc ipfs provider found. Make sure to define kuboRpcClientOptions",
    ERR_CAN_NOT_HAVE_BOTH_KUBO_AND_LIBP2P_JS_CLIENTS_DEFINED = "Can't have both libp2pJsClientOptions and kuboRpcClientOptions or pubsubKuboRpcClientOptions defined. Please define only one of them",
    ERR_INVALID_PUBSUB_PROVIDER = "Couldn't find a kubo pubsub RPC with that url or a libp2pjs with that key",
    ERR_ADDED_COMMENT_IPFS_TO_IPFS_BUT_GOT_DIFFERENT_CID = "Added CommentIpfs to IPFS but we got a different cid than challengeVerification.commentUpdate.cid, should not happen",
    ERR_NO_PUBSUB_PROVIDERS_AVAILABLE_TO_PUBLISH_OVER_PUBSUB = "No pubsub providers available to publish over pubsub",
    ERR_INVALID_JSON = "The loaded file is not the expected json",
    ERR_INVALID_COMMENT_IPFS_SCHEMA = "The schema of Comment ipfs file is invalid",
    ERR_REPLY_HAS_NOT_DEFINED_POST_CID = "User attempted to create a reply without defining postCid",
    ERR_REPLY_POST_CID_IS_NOT_PARENT_OF_REPLY = "User's reply has reply.postCid that is not the post of the reply",
    ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA = "The loaded Subplebbit record has an invalid schema",
    ERR_INVALID_COMMENT_UPDATE_SCHEMA = "The schema of Comment Update is invalid",
    ERR_INVALID_PAGE_IPFS_SCHEMA = "The schema of Page ipfs file is invalid",
    ERR_INVALID_CHALLENGE_DECRYPTED_SCHEMA = "The schema of decrypted challenge.encrypted is invalid",
    ERR_INVALID_CHALLENGE_VERIFICATION_DECRYPTED_SCHEMA = "The schema of challengeverification.encryption is invalid",
    ERR_INVALID_RPC_ENCODED_CHALLENGE_REQUEST_PUBSUB_MSG_SCHEMA = "The rpc server transmitted an encoded challenge request pubsub message with invalid schema",
    ERR_INVALID_RPC_ENCODED_CHALLENGE_PUBSUB_MSG_SCHEMA = "The rpc server transmitted an encoded challenge pubsub message with invalid schema",
    ERR_INVALID_RPC_ENCODED_CHALLENGE_ANSWER_PUBSUB_MSG_SCHEMA = "The rpc server transmitted an encoded challenge answer pubsub message with invalid schema",
    ERR_INVALID_RPC_ENCODED_CHALLENGE_VERIFICATION_PUBSUB_MSG_SCHEMA = "The rpc server transmitted an enocded challenge verification pubsub message with invalid schema",
    ERR_INVALID_RPC_LOCAL_SUBPLEBBIT_UPDATE_SCHEMA = "RPC server has transmitted a local subplebbit update result with invalid schema",
    ERR_INVALID_RPC_SUBPLEBBIT_UPDATING_STATE_SCHEMA = "RPC server transmitted an invalid updating state schema",
    ERR_INVALID_RPC_SUBPLEBBIT_STARTED_STATE_SCHEMA = "RPC server transmitted an invalid started state schema",
    ERR_INVALID_RPC_ENCODED_CHALLENGE_REQUEST_WITH_SUBPLEBBIT_AUTHOR_PUBSUB_MSG_SCHEMA = "RPC server transmitted an invalid challenge request schema for RpcLocalSubplebbit",
    ERR_INVALID_RPC_REMOTE_SUBPLEBBIT_SCHEMA = "Invalid schema of remote subplebbit transmitted by RPC",
    ERR_INVALID_RPC_PUBLICATION_PUBLISHING_STATE_SCHEMA = "Invalid schema of publication.publishingState transmitted by RPC",
    ERR_INVALID_RPC_PUBLICATION_STATE_SCHEMA = "Invalid schema of publication.state transmitted by RPC",
    ERR_INVALID_CID_STRING_SCHEMA = "Invalid cid string schema",
    ERR_LOCAL_SUBPLEBIT_PRODUCED_INVALID_SCHEMA = "Local subplebbit produced a subplebbit record with invalid schema",
    ERR_INVALID_RPC_COMMENT_UPDATE_SCHEMA = "RPC server transmitted an update event with invalid schema",
    ERR_INVALID_RPC_COMMENT_UPDATING_STATE_SCHEMA = "RPC server transmitted a comment's updating state with invalid schema",
    ERR_INVALID_RPC_COMMENT_STATE_SCHEMA = "RPC server transmitted a comment state with invalid schema",
    ERR_INVALID_CREATE_SUBPLEBBIT_ARGS_SCHEMA = "User provided invalid schema of arguments for plebbit.createSubplebbit",
    ERR_INVALID_CREATE_COMMENT_EDIT_ARGS_SCHEMA = "User provided invalid schema of arguments for plebbit.createCommentEdit",
    ERR_INVALID_CREATE_VOTE_ARGS_SCHEMA = "User provided invalid schema of arguments for plebbit.createVote",
    ERR_INVALID_CREATE_COMMENT_MODERATION_ARGS_SCHEMA = "User provided an invalid schema of arguments for plebbit.createCommentModeration",
    ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA = "User provided an invalid schema of arguments for plebbit.createComment",
    ERR_INVALID_CREATE_REMOTE_SUBPLEBBIT_ARGS_SCHEMA = "User provided an invalid remote subplebbit schema",
    ERR_INVALID_CREATE_SUBPLEBBIT_EDIT_ARGS_SCHEMA = "User provided an invalid args to plebbit.createSubplebbitEdit",
    ERR_GENERIC_RPC_INVALID_SCHEMA = "The RPC server responded with invalid schema error",
    ERR_INVALID_NEW_WS_SERVER_SETTINGS_SCHEMA = "RPC client sent new settings with invalid schema",
    ERR_INVALID_CREATE_NEW_LOCAL_SUB_USER_OPTIONS = "User provided arguments to create a local sub with invalid schema",
    ERR_INVALID_COMMENT_EDIT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA = "RPC client sent an invalid schema for challenge request with commentEdit",
    ERR_INVALID_VOTE_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA = "RPC client sent an invalid schema for challenge request with vote",
    ERR_INVALID_COMMENT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA = "RPC client sent an invalid schema for challenge request with comment",
    ERR_INVALID_COMMENT_MODERATION_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA = "RPC client sent an invalid schema for challenge request with commentModeration",
    ERR_INVALID_SUBPLEBBIT_EDIT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA = "RPC client sent an invalid schema for challenge request with subplebbitEdit",
    ERR_SUBPLEBBIT_EDIT_OPTIONS_SCHEMA = "User sent a subplebbit edit options with invalid schema",
    ERR_INVALID_CHALLENGE_ANSWERS = "User sent challenge answers with invalid schema",
    ERR_INVALID_CREATE_PLEBBIT_WS_SERVER_OPTIONS_SCHEMA = "Invalid create arguments for Plebbit WS RPC server",
    ERR_INVALID_CREATE_PLEBBIT_ARGS_SCHEMA = "User sent arguments with invalid schema in an attempt to create a Plebbit instance",
    ERR_INVALID_CREATE_SUBPLEBBIT_WITH_RPC_ARGS_SCHEMA = "User provided invalid schema of arguments for plebbit.createSubplebbit while connected to RPC",
    ERR_CAN_NOT_SET_EXCLUDE_PUBLICATION_TO_EMPTY_OBJECT = "The subplebbit has subplebbit.settings.challenges[x].exclude[y].publicationType is set to an empty object. You should either choose which publication to exclude or remove exclude.publicationType",
    ERR_SUB_HAS_NO_INTERNAL_STATE = "The subplebbit has no internal state. This should never happen. Please report this bug.",
    ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER = "comment.author.address does not match signer.address",
    ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 = "author.address is not a domain or B58",
    ERR_SIGNATURE_PUBLIC_KEY_IS_NOT_B58 = "The public key of the signature is not B58",
    ERR_PUBLICATION_FAILED_TO_DECRYPT_CHALLENGE = "The publication received a challenge and failed to decrypt",
    ERR_SIGNATURE_IS_INVALID = "Signature of publication is invalid",
    ERR_SIGNATURE_HAS_NO_PUBLIC_KEY = "Signature of publication has no public key",
    ERR_COMMENT_UPDATE_EDIT_SIGNATURE_IS_INVALID = "The author edit of comment (commentUpdate.edit) has an invalid signature",
    ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED = "The subplebbit record address does not correspond to the requested subplebbit. requestedSubplebbit.address !== providedSubplebbit.address",
    ERR_AUTHOR_NOT_MATCHING_SIGNATURE = "comment.author.address doesn't match comment.signature.publicKey",
    ERR_SUBPLEBBIT_IPNS_NAME_DOES_NOT_MATCH_SIGNATURE_PUBLIC_KEY = "The IPNS name of subplebbit doesn't match subplebbit.signature.publicKey",
    ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT = "comment.content is not set to the latest comment.authorEdit.content",
    ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT = "Comment update is not signed by the subplebbit",
    ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR = "Author edit is not signed by original author of comment",
    ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT = "CommentUpdate.cid is different than comment.cid",
    ERR_CHALLENGE_MSG_SIGNER_IS_NOT_SUBPLEBBIT = "The signer of challenge pubsub message is not the subplebbit",
    ERR_CHALLENGE_VERIFICATION_MSG_SIGNER_IS_NOT_SUBPLEBBIT = "The signer of challenge verification pubsub message is not the subplebbit",
    ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE = "Challenge request id is not derived from signature.publicKey",
    ERR_CHALLENGE_SIGNATURE_IS_INVALID = "Received a challenge message with an invalid signature",
    ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID = "Received a challenge verification message with an invalid signature",
    ERR_LOCAL_SUBPLEBBIT_PRODUCED_INVALID_SIGNATURE = "Local subplebbit produced a new record with invalid signature",
    ERR_SUBPLEBBIT_POSTS_INVALID = "subplebbit.posts signature is invalid",
    ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID = "CommentIpfs signature is invalid",
    ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID = "CommentUpdate signature is invalid",
    ERR_COMMENT_UPDATE_RECORD_INCLUDES_RESERVED_FIELD = "CommentUpdate record includes a reserved field",
    ERR_SUBPLEBBIT_EDIT_HAS_RESERVED_FIELD = "SubplebbitEdit record includes a reserved field",
    ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID = "Subplebbit signature is invalid",
    ERR_SUBPLEBBIT_RECORD_INCLUDES_RESERVED_FIELD = "The SubplebbitIpfs record includes a reserved field",
    ERR_FAILED_TO_RESOLVE_SUBPLEBBIT_DOMAIN = "Failed to resolve the subplebbit domain address to use for verification",
    ERR_FAILED_TO_RESOLVE_AUTHOR_DOMAIN = "Failed to resolve the author domain address to use for verification",
    ERR_SUBPLEBBIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "SubplebbitIpfs record includes a field not included in signature.signedPropertyNames",
    ERR_VOTE_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "VotePubsubMessagePublication record includes a field that's not included in signature.signedPropertyNames",
    ERR_COMMENT_EDIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "CommentEditPubsubMessagePublication record includes a field that's not included in signature.signedPropertyNames",
    ERR_COMMENT_MODERATION_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "CommentModerationPubsubMessagePublication includes a field that's not included in signature.signedPropertyNames",
    ERR_COMMENT_PUBSUB_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "CommentPubsubMessagePublication includes a field that's not included in signature.signedPropertyNames",
    ERR_COMMENT_UPDATE_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "CommentUpdate record includes a field that's not included in signature.signedPropertyNames",
    ERR_CHALLENGE_REQUEST_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "ChallengeRequestPubsubMessage include a field that's not part of signature.signedPropertyNames",
    ERR_CHALLENGE_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "ChallengePubsubMessage includes a field that's not part of signature.signedPropertyNames",
    ERR_CHALLENGE_ANSWER_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "ChallengeAnswerPubsubMessage includes a field that's not part of signature.signedPropertyNames",
    ERR_CHALLENGE_VERIFICATION_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "ChallengeVerificationPubsubMessage includes a field that's not part of signature.signedPropertyNames",
    ERR_SUBPLEBBIT_EDIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES = "SubplebbitEditPubsubPublication includes a field that's not in signature.signedPropertyNames",
    ERR_SUB_CHANGED_COMMENT_PUBSUB_PUBLICATION_PROPS = "The sub changed CommentPubsubMessagePublication props in decryptedChallengeVerification.comment",
    ERR_SUB_SENT_CHALLENGE_VERIFICATION_WITH_INVALID_COMMENT = "The subplebbit sent an invalid decryptedChallengeVerification.comment",
    ERR_SUB_SENT_CHALLENGE_VERIFICATION_WITH_INVALID_COMMENTUPDATE = "The subplebbit sent an invalid decryptedChallengeVerification.commentUpdate",
    ERR_SUB_SENT_CHALLENGE_VERIFICATION_WITH_INVALID_CID = "The sub sent decryptedChallengeVerification with commentUpdate.cid that does not correspond to commentIpfs",
    ERR_PAGE_COMMENT_IS_INVALID = "validatePage has found a comment within a page that is invalid",
    ERR_PAGE_COMMENT_IS_A_REPLY_BUT_HAS_NO_PARENT_COMMENT_INSTANCE = "Page comment is a reply with depth greater than 0, but has no parent comment instance cid",
    ERR_PAGE_COMMENT_DEPTH_VALUE_IS_NOT_RELATIVE_TO_ITS_PARENT = "Page comment is a reply with a depth that's not relative to its direct parent",
    ERR_PAGE_COMMENT_PARENT_DOES_NOT_EXIST_IN_FLAT_PAGE = "The parent of a comment in a flat page does not exist",
    ERR_PAGE_COMMENT_POST_CID_IS_NOT_SAME_AS_POST_CID_OF_COMMENT_INSTANCE = "The post cid of reply in page is different than the post cid of the comment instance. Did the subplebbit instance put the wrong reply in this page?",
    ERR_REPLY_IN_FLAT_PAGE_HAS_NO_PARENT_CID = "Reply in flat page has no parent CID",
    ERR_PAGE_COMMENT_NO_WAY_TO_DERIVE_POST_CID = "Unable to derive post cid from page comment while verifying page",
    ERR_POSTS_PAGE_IS_INVALID = "The page of posts is invalid",
    ERR_REPLIES_PAGE_IS_INVALID = "The page of replies is invalid",
    ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_CID = "User attempted to validate replies page without providing parent comment cid. Make sure parent comment is properly loaded",
    ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_DEPTH = "User attempted to validate replies page without providing parent comment depth. Make sure parent comment is properly loaded",
    ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID = "User attempted to validate replies page without providing parent comment post cid. Make sure parent comment is properly loaded",
    ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_CID = "User attempted to get replies page without providing parent comment cid. Make sure parent comment is properly loaded",
    ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_DEPTH = "User attempted to get replies page without providing parent comment depth. Make sure parent comment is properly loaded",
    ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID = "User attempted to get replies page without providing parent comment post cid. Make sure parent comment is properly loaded",
    ERR_FAILED_TO_FIND_REPLY_COMMENT_UPDATE_WITHIN_PARENT_COMMENT_PAGE_CIDS = "Failed to find reply comment update within parent comment page cids",
    ERR_INVALID_COMMENT_IPFS = "The part of CommentIpfs in Comment or PageComment is invalid",
    ERR_COMMENT_MISSING_POST_CID = "Comment instance or PageComment has no postCid. postCid should always be defined if you have CommentIpfs",
    ERR_INVALID_COMMENT_UPDATE = "The part of CommentUpdate in Comment or PageComment is invalid",
    ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB = "Comment in page should be under the same subplebbit",
    ERR_PARENT_CID_OF_COMMENT_IN_PAGE_IS_NOT_CORRECT = "The parent cid of comment in page is not correct",
    ERR_PAGE_SIGNATURE_IS_INVALID = "The signature of one of the comment in the page is invalid",
    ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST = "Received a challenge answer without a prior challenge request",
    ERR_REUSED_PUBSUB_MSG_SIGNER = "Reusing a pubsub message signer is forbidden",
    ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED = "The timestamp of the pubsub message is outdated",
    ERR_UNAUTHORIZED_COMMENT_EDIT = "The author of this edit is not a mod/admin/owner or an author of the original comment. Can't edit",
    ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT = "Rejecting post/comment because its timestamp is earlier than its parent",
    ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB = "The parent of this publication does not exist within the subplebbit's records",
    ERR_SUB_PUBLICATION_PARENT_CID_NOT_DEFINED = "The parent cid of this publication is not defined. Make sure either commentCid or parentCid is defined",
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
    ERR_DUPLICATE_COMMENT_MODERATION = "CommentModeration is duplicated",
    ERR_DUPLICATE_COMMENT_EDIT = "CommentEdit is duplicated",
    ERR_AUTHOR_ADDRESS_UNDEFINED = "author address is undefined",
    ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG = "Subplebbit failed to decrypt the pubsub message",
    ERR_REQUEST_PUBLICATION_OVER_ALLOWED_SIZE = "request.publication size is over 40kb",
    UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE = "An author attempted to change another author's vote",
    COMMENT_LINK_LENGTH_IS_OVER_LIMIT = "comment.link length is over the limit",
    INCORRECT_VOTE_VALUE = "The vote can only be 1 or 0 or -1",
    ERR_COMMENT_HAS_INVALID_LINK_FIELD = "The comment arguments you provided contain an invalid .link",
    ERR_POST_LINK_IS_NOT_OF_MEDIA = "Publishing to the subplebbit requires a post with a link pointing to media (audio, video, image)",
    ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE = "Comment has no content, link or title",
    ERR_REQUEST_ENCRYPTED_IS_INVALID_JSON_AFTER_DECRYPTION = "request.encrypted is an invalid json after decrypting",
    ERR_REQUEST_ENCRYPTED_HAS_INVALID_SCHEMA_AFTER_DECRYPTING = "request.encrypted has an invalid schema after decrypting",
    ERR_CHALLENGE_REQUEST_ENCRYPTED_HAS_NO_PUBLICATION_AFTER_DECRYPTING = "request.encrypted has not defined vote, comment, commentEdit, or commentModeration. At least one of them need to be defined",
    ERR_CHALLENGE_REQUEST_ENCRYPTED_HAS_MULTIPLE_PUBLICATIONS_AFTER_DECRYPTING = "request.encrypted has multiple publication fields. The user is only allowed one publication per request",
    ERR_CHALLENGE_ANSWER_IS_INVALID_JSON = "challenganswer.challengeAnswers is an invalid json",
    ERR_CHALLENGE_ANSWER_IS_INVALID_SCHEMA = "challengeanswer.challengeAnswers is an invalid schema",
    ERR_COMMENT_HAS_RESERVED_FIELD = "CommentPubsubMessagePublication has a reserved field",
    ERR_VOTE_HAS_RESERVED_FIELD = "VotePubsubMessagePublication has a reserved field",
    ERR_COMMENT_EDIT_HAS_RESERVED_FIELD = "CommentEditPubsubMessagePublication has a reserved field",
    ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD = "request.publication.author has a reserved field",
    ERR_COMMENT_EDIT_CAN_NOT_EDIT_COMMENT_IF_NOT_ORIGINAL_AUTHOR = "CommentEditPubsubPublication is attempting to edit a comment while not being the original author of the comment",
    ERR_COMMENT_MODERATION_NO_COMMENT_TO_EDIT = "CommentModerationPubsubMessagePublication is attempting to moderate a comment that does not exist",
    ERR_COMMENT_EDIT_NO_COMMENT_TO_EDIT = "CommentEditPubsubMessagePublication is attempting to edit a comment that does not exist",
    ERR_COMMENT_MODERATION_HAS_RESERVED_FIELD = "CommentModerationPubsubMessagePublication has a reserved field",
    ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR = "CommentModerationPubsubMessagePublication signer is not a mod at this subplebbit",
    ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_OWNER_EXCLUSIVE_PROPS = "SubplebbitEdit attempted to modify props meant only for the owner to edit",
    ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_SUB_WITHOUT_BEING_OWNER_OR_ADMIN = "SubplebbitEdit attempted to modify subplebbit without being an owner or admin",
    ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_NON_PUBLIC_PROPS = "SubplebbitEdit attempted to modify non public props or non existent. SubplebbitEdit is only allowed to edit props from SubplebbitIpfs schema",
    ERR_PUBLICATION_TIMESTAMP_IS_NOT_IN_PROPER_RANGE = "Timestamp of publication is either too high or too low. It should be within 5 minutes range",
    ERR_NOT_ALLOWED_TO_PUBLISH_UPVOTES = "subplebbit.features.noUpvotes is true which means no upvotes can be published to this subplebbit",
    ERR_NOT_ALLOWED_TO_PUBLISH_DOWNVOTES = "subplebbit.features.noDownvotes is true which means no downvotes can be published to this subplebbit",
    ERR_NOT_ALLOWED_TO_PUBLISH_POST_DOWNVOTES = "subplebbit.features.noPostDownvotes is true which means no downvotes can be published to posts",
    ERR_NOT_ALLOWED_TO_PUBLISH_POST_UPVOTES = "subplebbit.features.noPostUpvotes is true which means no upvotes can be published to posts",
    ERR_NOT_ALLOWED_TO_PUBLISH_REPLY_DOWNVOTES = "subplebbit.features.noReplyDownvotes is true which means no downvotes can be published to replies (depth > 0)",
    ERR_NOT_ALLOWED_TO_PUBLISH_REPLY_UPVOTES = "subplebbit.features.noReplyUpvotes is true which means no upvotes can be published to replies (depth > 0)",
    ERR_THERE_IS_NO_PREVIOUS_VOTE_TO_CANCEL = "vote=0 is for canceling a previous vote, but the author doesn't have a previous vote on this comment",
    ERR_SUB_COMMENT_MOD_CAN_NOT_LOCK_REPLY = "Can't lock replies. Only posts",
    ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD = "CommentEdit includes a field that cannot be used",
    ERR_PUBLISHING_EDIT_WITH_BOTH_MOD_AND_AUTHOR_FIELDS = "CommentEdit can't have both author and mod fields. Please publish a separate request for author and mod",
    ERR_FAILED_TO_RESOLVE_TEXT_RECORD = "Failed to resolve text record",
    ERR_NO_CHAIN_PROVIDER_FOR_CHAIN_TICKER = "no chain provider options set for chain ticker",
    ERR_DOMAIN_TXT_RECORD_NOT_FOUND = "Domain resolver did not find the text record",
    ERR_DOMAIN_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS = "subplebbit-address text record of domain is pointing to a different address than subplebbit.signer.address",
    ERR_RESOLVED_TEXT_RECORD_TO_NON_IPNS = "Resolved the text record value to a string that is non IPNS",
    ERR_SUBPLEBBIT_DOMAIN_HAS_NO_TEXT_RECORD = "Domain resolver did not find the text record subplebbit-address",
    ERR_AUTHOR_DOMAIN_HAS_NO_TEXT_RECORD = "Domain resolver did not find the text record plebbit-autho-address",
    ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE = "subplebbit.signer needs to be defined before proceeding",
    ERR_SUB_STATE_LOCKED = "The internal state of the subplebbit in DB is locked",
    ERR_SUB_CREATION_LOCKED = "Subplebbit creation is locked",
    ERR_SUB_ALREADY_STARTED = "Subplebbit already started",
    ERR_FAILED_TO_IMPORT_IPFS_KEY = "Subplebbit failed to import IPFS key",
    ERR_LOCAL_SUBPLEBBIT_PRODUCED_INVALID_RECORD = "The local subplebbit has produced a new IPNS record with invalid signature. This is a crticial error",
    ERR_FAILED_TO_IMPORT_CHALLENGE_FILE_FACTORY = "Failed to import challenge file factory",
    ERR_FAILED_TO_IMPORT_CHALLENGE_FILE = "Failed to import challenge file",
    ERR_INVALID_RESULT_FROM_GET_CHALLENGE_FUNCTION = "invalid getChallenge response from subplebbit challenge",
    ERR_LOCAL_SUBPLEBBIT_RECORD_TOO_LARGE = "Local subplebbit has produced a record that is too large. This is a critical error and a bug in plebbit-js",
    ERR_CAN_NOT_LOAD_DB_IF_LOCAL_SUB_ALREADY_STARTED_IN_ANOTHER_PROCESS = "Can't load a local subplebbit that's already started in another process. You need to use the same Plebbit instance to load the subplebbit",
    ERR_CAN_NOT_EDIT_A_LOCAL_SUBPLEBBIT_THAT_IS_ALREADY_STARTED_IN_ANOTHER_PROCESS = "Can't edit a local subplebbit that's already started in another process. You need to use the same Plebbit instance to edit the subplebbit",
    CAN_NOT_LOAD_LOCAL_SUBPLEBBIT_IF_DB_DOES_NOT_EXIST = "Can't load the local sub because its DB does not exist in dataPath",
    ERR_SUB_START_FAILED_UNKNOWN_ERROR = "Subplebbit start failed with unknown error",
    ERR_SUB_ALREADY_STARTED_IN_SAME_PLEBBIT_INSTANCE = "Subplebbit already started in the same Plebbit instance. You can check plebbit._startedSubplebbits to see all started subplebbits",
    ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE = "Page generated is over expected size. This is a critical error and a bug in plebbit-js",
    ERR_PUBSUB_FAILED_TO_SUBSCRIBE = "Failed to subscribe on pubsub",
    ERR_PUBSUB_FAILED_TO_UNSUBSCRIBE = "Failed to unsubscribe on pubsub",
    ERR_PUBSUB_FAILED_TO_PUBLISH = "Failed to publish on pubsub",
    ERR_PUBSUB_DID_NOT_RECEIVE_RESPONSE_AFTER_PUBLISHING_CHALLENGE_REQUEST = "Did not receive response to challenge request in the specified time",
    ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS = "All pubsub providers throw an error and unable to publish or subscribe",
    ERR_CHALLENGE_REQUEST_RECEIVED_NO_RESPONSE_FROM_ANY_PROVIDER = "The challenge request has been published over the pubsub topic but no response was received",
    ERR_PUBLICATION_DID_NOT_RECEIVE_RESPONSE = "Publication did not receive any response to challenge request",
    ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC = "Failed to open connection to RPC",
    ERR_FAILED_TO_CREATE_WS_RPC_SERVER = "Failed to create WebSocket RPC server",
    ERR_RPC_CLIENT_ATTEMPTING_TO_START_A_REMOTE_SUB = "Attempting to start a subplebbit that is not local",
    ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING = "RPC client is attempting to stop a local sub that is not running",
    ERR_RPC_CLIENT_TRYING_TO_STOP_REMOTE_SUB = "RPC client is attempting to stop a remote sub",
    ERR_RPC_CLIENT_TRYING_TO_EDIT_REMOTE_SUB = "RPC client is attempting to edit remote sub",
    ERR_RPC_CLIENT_TRYING_TO_DELETE_REMOTE_SUB = "RPC client is attempting to delete remote sub",
    ERR_GENERIC_RPC_CLIENT_CALL_ERROR = "RPC client received an unknown error when executing call over websocket"
}
