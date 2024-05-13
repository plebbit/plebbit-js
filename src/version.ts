import { ProtocolVersion } from "./types.js";

const protocolVersion: ProtocolVersion = "1.0.0";
const plebbitJsVersion = "0.0.1";
export default {
    PLEBBIT_JS_VERSION: plebbitJsVersion,
    DB_VERSION: 14,
    PROTOCOL_VERSION: protocolVersion,
    USER_AGENT: `/plebbit-js:${plebbitJsVersion}/`
};
