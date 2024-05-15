// import this file at the very top of index.ts to polyfill
// stuff for browsers
// nothing to polyfill in node
import { setGlobalDispatcher, Agent } from "undici";
import Logger from "@plebbit/plebbit-logger";
if (Number(process.versions.node.split(".")[0]) >= 18) {
    // We're on node 18+, we need to change the timeout of the body globally
    // Should be removed at some point once kubo-rpc-client fixes their problem with node 18+
    const log = Logger("plebbit-js:polyfill");
    log("Patching up the global body timeout");
    setGlobalDispatcher(new Agent({ bodyTimeout: Infinity }));
}
// must export a function and call it or this file isn't read
export default () => { };
//# sourceMappingURL=polyfill.js.map