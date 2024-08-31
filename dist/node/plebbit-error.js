import * as remeda from "remeda";
import { messages } from "./errors.js";
import { CustomError } from "ts-custom-error";
export class PlebbitError extends CustomError {
    constructor(code, details) {
        super(messages[code]);
        this.code = code;
        this.message = messages[code];
        this.details = details;
    }
    toString() {
        return `${this.constructor.name}: ${this.code}: ${this.message}: ${JSON.stringify(remeda.omit(this.details, ["stack"]))}`;
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            stack: this.stack,
            details: this.details
        };
    }
}
export class FailedToFetchSubplebbitFromGatewaysError extends PlebbitError {
    constructor(details) {
        super("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", details);
        this.details = details;
    }
}
export class FailedToFetchCommentIpfsFromGatewaysError extends PlebbitError {
    constructor(details) {
        super("ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS", details);
        this.details = details;
    }
}
export class FailedToFetchCommentUpdateFromGatewaysError extends PlebbitError {
    constructor(details) {
        super("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_GATEWAYS", details);
        this.details = details;
    }
}
export class FailedToFetchPageIpfsFromGatewaysError extends PlebbitError {
    constructor(details) {
        super("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS", details);
        this.details = details;
    }
}
export class FailedToFetchGenericIpfsFromGatewaysError extends PlebbitError {
    constructor(details) {
        super("ERR_FAILED_TO_FETCH_GENERIC_IPFS_FROM_GATEWAYS", details);
        this.details = details;
    }
}
//# sourceMappingURL=plebbit-error.js.map