"use strict";
// import this file at the very top of index.ts to polyfill
// stuff for browsers
Object.defineProperty(exports, "__esModule", { value: true });
// fix "ReferenceError: process is not defined" in "assert" package
if (window.process === undefined) {
    const processPolyfill = {};
    // @ts-ignore
    window.process = processPolyfill;
}
if (window.process.env === undefined) {
    window.process.env = {};
}
// must export a function and call it or this file isn't read
exports.default = () => { };
