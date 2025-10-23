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
        this.details = details ?? {};
        this.stack = this.injectDetailsIntoStack(this.stack);
    }

    override toString() {
        const formattedDetails = this.formatDetails();
        const detailsSuffix = formattedDetails ? ` Details: ${formattedDetails}` : "";
        const stackSuffix = this.stack ? `\nStack: ${this.stack}` : "";
        return `${this.constructor.name}: ${this.code}: ${this.message}${detailsSuffix}${stackSuffix}`;
    }

    toJSON() {
        return {
            name: this.constructor.name,
            code: this.code,
            message: this.message,
            stack: this.stack,
            details: this.details
        };
    }

    // Custom Node.js util.inspect formatting
    [Symbol.for("nodejs.util.inspect.custom")]() {
        const { stack, ...rest } = this.toJSON();
        return {
            ...rest,
            stack: typeof stack === "string" ? stack.split("\n") : stack
        };
    }

    // Chrome DevTools custom formatting
    [Symbol.for("devtools.formatter.header")]() {
        return [
            "div",
            { style: "color: #d32f2f; font-weight: bold;" },
            ["span", {}, `${this.constructor.name}: `],
            ["span", { style: "color: #1976d2; font-weight: normal;" }, this.code],
            ["span", { style: "color: #333; font-weight: normal; margin-left: 8px;" }, this.message]
        ];
    }

    [Symbol.for("devtools.formatter.hasBody")]() {
        return Object.keys(this.details).length > 0;
    }

    [Symbol.for("devtools.formatter.body")]() {
        const detailsEntries = Object.entries(this.details);
        if (detailsEntries.length === 0) {
            return ["div", {}, "No details available"];
        }

        return [
            "div",
            { style: "margin-top: 8px;" },
            ["div", { style: "font-weight: bold; color: #1976d2; margin-bottom: 4px;" }, "📋 Details:"],
            ...detailsEntries.map(([key, value]) => [
                "div",
                { style: "margin-left: 16px; margin-bottom: 2px;" },
                ["span", { style: "color: #666; font-weight: bold;" }, `${key}: `],
                ["span", { style: "color: #333;" }, typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)]
            ])
        ];
    }

    // Alternative string representation for better console display
    [Symbol.toPrimitive](hint: string) {
        if (hint === "string") {
            return this.toString();
        }
        return this.message;
    }

    private injectDetailsIntoStack(stack?: string) {
        if (!stack) {
            return stack;
        }
        const formattedDetails = this.formatDetails(true);
        if (!formattedDetails) {
            return stack;
        }
        const [firstLine, ...rest] = stack.split("\n");
        const detailsLines = formattedDetails.split("\n");
        const detailsBlock =
            detailsLines.length === 1
                ? `Details: ${detailsLines[0]}`
                : `Details:\n${detailsLines.map((line) => `  ${line}`).join("\n")}`;
        return [firstLine, detailsBlock, ...rest].join("\n");
    }

    private formatDetails(pretty = false): string | undefined {
        const details = this.details;
        if (details === undefined || details === null) {
            return undefined;
        }
        if (typeof details === "object" && !Array.isArray(details) && Object.keys(details).length === 0) {
            return undefined;
        }
        if (typeof details === "string") {
            return details;
        }
        try {
            return JSON.stringify(details, PlebbitError.jsonReplacer, pretty ? 2 : undefined);
        } catch {
            return String(details);
        }
    }

    private static jsonReplacer(_: string, value: unknown) {
        return typeof value === "bigint" ? value.toString() : value;
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
