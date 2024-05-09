// import this file at the very top of index.ts to polyfill
// stuff for browsers

// fix "ReferenceError: process is not defined" in "assert" package
if (window.process === undefined) {
    const processPolyfill: any = {};
    // @ts-ignore
    window.process = processPolyfill;
}
if (window.process.env === undefined) {
    window.process.env = {};
}

// polyfill digest function, in case the we're loading plebbit-js in browser on an insecure origin

import { sha512 } from "js-sha512";
import { sha256 } from "js-sha256";
// Check if running in browser, and if webcrypto is not loaded
// If it's not loaded it means we're running from an insecure origin
if (window && !window?.crypto?.subtle) {
    console.log("window.crypto.subtle is not set, attempting to polyfill window.crypto.subtle.digest");

    //@ts-expect-error
    if (!window.crypto) window.crypto = {}; // to handle vitest in plebbit-react-hooks
    //@ts-expect-error
    window.crypto.subtle = {
        //@ts-expect-error
        digest: (hashMethod, arrayBuffer) => {
            if (hashMethod === "SHA-512") return sha512.digest(arrayBuffer);
            else if (hashMethod?.name === "SHA-256") return sha256.digest(arrayBuffer);
            else {
                console.error(`Received an unsupported hash method (${hashMethod}) in the polyfill. Throwing`);
                throw Error("Unsupported digest " + hashMethod);
            }
        }
    };
}

// must export a function and call it or this file isn't read
export default () => {};
