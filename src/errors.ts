export enum messages {
    ERR_ENS_RESOLVER_NOT_FOUND = "ENS resolver is not found",
    ERR_ENS_TXT_RECORD_NOT_FOUND = "ENS resolver did not find the text record",
    ERR_SUB_SIGNER_NOT_DEFINED = "Subplebbit signer is not defined",
    ERR_SUB_ALREADY_STARTED = "Subplebbit already started",
    ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS = "subplebbit-address is pointing to a different address than subplebbit.signer.address",
    ERR_SUB_CAN_EITHER_RUN_OR_UPDATE = "Subplebbit can either sync through .start() or update, but not both",
    ERR_FAILED_TO_VERIFY_SIGNATURE = "Failed to verify signature",
    ERR_PUBLICATION_MISSING_FIELD = "Publication is missing field(s)",
    ERR_COMMENT_UPDATE_MISSING_IPNS_NAME = "Can't update comment without a defined IPNS name (comment.ipnsName)",
    ERR_SUBPLEBBIT_MISSING_FIELD = "Subplebbit is missing field needed for publishing",
    ERR_INVALID_SUBPLEBBIT_ADDRESS = "Subplebbit address is incorrect. Address should be either a domain or CID",
    ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID = "subplebbit-address resolves to an invalid CID",
    ERR_CID_IS_INVALID = "CID is invalid",
    ERR_SUB_HAS_NO_DB_CONFIG = "Subplebbit has no db config",
    ERR_DATA_PATH_IS_NOT_DEFINED = "plebbitOptions.dataPath needs to be defined with native functions"
}

export enum codes {
    ERR_ENS_RESOLVER_NOT_FOUND = "ERR_ENS_RESOLVER_NOT_FOUND",
    ERR_ENS_TXT_RECORD_NOT_FOUND = "ERR_ENS_TXT_RECORD_NOT_FOUND",
    ERR_SUB_SIGNER_NOT_DEFINED = "ERR_SUB_SIGNER_NOT_DEFINED",
    ERR_SUB_ALREADY_STARTED = "ERR_SUB_ALREADY_STARTED",
    ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS = "ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS",
    ERR_SUB_CAN_EITHER_RUN_OR_UPDATE = "ERR_SUB_CAN_EITHER_RUN_OR_UPDATE",
    ERR_FAILED_TO_VERIFY_SIGNATURE = "ERR_FAILED_TO_VERIFY_SIGNATURE",
    ERR_PUBLICATION_MISSING_FIELD = "ERR_PUBLICATION_MISSING_FIELD",
    ERR_COMMENT_UPDATE_MISSING_IPNS_NAME = "ERR_COMMENT_UPDATE_MISSING_IPNS_NAME",
    ERR_SUBPLEBBIT_MISSING_FIELD = "ERR_SUBPLEBBIT_MISSING_FIELD",
    ERR_INVALID_SUBPLEBBIT_ADDRESS = "ERR_INVALID_SUBPLEBBIT_ADDRESS",
    ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID = "ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID",
    ERR_CID_IS_INVALID = "ERR_CID_IS_INVALID",
    ERR_SUB_HAS_NO_DB_CONFIG = "ERR_SUB_HAS_NO_DB_CONFIG",
    ERR_DATA_PATH_IS_NOT_DEFINED = "ERR_DATA_PATH_IS_NOT_DEFINED"
}
