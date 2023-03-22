import { messages } from "./errors";

export class PlebbitError extends Error {
    code: keyof typeof messages;
    message: string;
    stack?: string;
    details: {}; // Used to hold key-value of related props. Could be cid of a comment that failed to update
    constructor(code: keyof typeof messages, details: {}) {
        super(messages[code]);
        this.code = code;
        this.message = messages[code];
        this.details = details;
    }

    toString() {
        return `${this.constructor.name}: ${this.code}: ${this.message}: ${JSON.stringify(this.details)}`;
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
