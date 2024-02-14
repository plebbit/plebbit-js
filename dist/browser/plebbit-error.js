import lodash from "lodash";
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
//# sourceMappingURL=plebbit-error.js.map