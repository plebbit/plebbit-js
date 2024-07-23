import { ProtocolVersionSchema, UserAgentSchema } from "./schema/schema.js";

const protocolVersion = ProtocolVersionSchema.parse("1.0.0");
const plebbitJsVersion = "0.0.1"; // TODO should be imported from package.json

const userAgent = UserAgentSchema.parse(`/plebbit-js:${plebbitJsVersion}/`);

export default {
    PLEBBIT_JS_VERSION: plebbitJsVersion,
    DB_VERSION: 15,
    PROTOCOL_VERSION: protocolVersion,
    USER_AGENT: userAgent
};
