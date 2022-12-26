import { ProtocolVersion } from "./types";

const protocolVersion: ProtocolVersion = "1.0.0";
const plebbitJsVersion = "0.0.1";
export default {
    PLEBBIT_JS_VERSION: plebbitJsVersion,
    DB_VERSION: 5,
    PROTOCOL_VERSION: protocolVersion,
    USER_AGENT: `/plebbit-js:${plebbitJsVersion}/`
};
