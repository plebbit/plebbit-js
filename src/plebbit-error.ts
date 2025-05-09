import * as remeda from "remeda";
import { messages } from "./errors.js";
import { CustomError } from "ts-custom-error";
export class PlebbitError extends CustomError {
    code: keyof typeof messages;
    override message: messages;
    override stack?: string;
    details: Record<string, any> = {}; // Used to hold key-value of related props. Could be cid of a comment that failed to update
    constructor(code: keyof typeof messages, details?: any) {
        super(messages[code]);
        this.code = code;
        this.message = messages[code];
        this.details = details;
    }

    override toString() {
        return `${this.constructor.name}: ${this.code}: ${this.message}: ${JSON.stringify(this.details)}\nStack: ${this.stack}`;
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
    override details: { ipnsName: string; gatewayToError: Record<string, PlebbitError> } & { [key: string]: any }; // gatewayToError is a mapping of gateway url to its error

    constructor(details: FailedToFetchSubplebbitFromGatewaysError["details"]) {
        super("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", details);
        this.details = details;
    }
}

export class FailedToFetchCommentIpfsFromGatewaysError extends PlebbitError {
    override details: { commentCid: string; gatewayToError: Record<string, PlebbitError> } & { [key: string]: any }; // gatewayToError is a mapping of gateway url to its error

    constructor(details: FailedToFetchCommentIpfsFromGatewaysError["details"]) {
        super("ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS", details);
        this.details = details;
    }
}

export class FailedToFetchCommentUpdateFromGatewaysError extends PlebbitError {
    override details: { gatewayToError: Record<string, PlebbitError> } & { [key: string]: any }; // gatewayToError is a mapping of gateway url to its error

    constructor(details: FailedToFetchCommentUpdateFromGatewaysError["details"]) {
        super("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_GATEWAYS", details);
        this.details = details;
    }
}

export class FailedToFetchPageIpfsFromGatewaysError extends PlebbitError {
    override details: { pageCid: string; gatewayToError: Record<string, PlebbitError> } & { [key: string]: any }; // gatewayToError is a mapping of gateway url to its error

    constructor(details: FailedToFetchPageIpfsFromGatewaysError["details"]) {
        super("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS", details);
        this.details = details;
    }
}

export class FailedToFetchGenericIpfsFromGatewaysError extends PlebbitError {
    override details: { cid: string; gatewayToError: Record<string, PlebbitError> } & { [key: string]: any }; // gatewayToError is a mapping of gateway url to its error

    constructor(details: FailedToFetchGenericIpfsFromGatewaysError["details"]) {
        super("ERR_FAILED_TO_FETCH_GENERIC_IPFS_FROM_GATEWAYS", details);
        this.details = details;
    }
}
