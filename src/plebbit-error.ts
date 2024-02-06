import lodash from "lodash";
import { messages } from "./errors.js";
import { CustomError } from "ts-custom-error";
export class PlebbitError extends CustomError {
    code: keyof typeof messages;
    message: messages;
    stack?: string;
    details: {}; // Used to hold key-value of related props. Could be cid of a comment that failed to update
    constructor(code: keyof typeof messages, details?: {}) {
        super(messages[code]);
        this.code = code;
        this.message = messages[code];
        this.details = details;
    }

    toString() {
        return `${this.constructor.name}: ${this.code}: ${this.message}: ${JSON.stringify(lodash.omit(this.details, "stack"))}`;
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
