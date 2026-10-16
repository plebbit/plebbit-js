// findMalformedUnicodeString (issue #387): a lone surrogate has no single byte representation, so a
// publication carrying one is rejected at validation. The walker has to find it wherever it sits.
import { describe, it, expect } from "vitest";
import { findMalformedUnicodeString } from "../../../dist/node/util.js";

const lone = "\ud800";
const pair = "😀"; // a valid surrogate pair (an emoji)

describe("findMalformedUnicodeString", () => {
    it("returns undefined for well-formed values", () => {
        expect(findMalformedUnicodeString("plain")).toBeUndefined();
        expect(findMalformedUnicodeString(`with ${pair} pair`)).toBeUndefined();
        expect(findMalformedUnicodeString("")).toBeUndefined();
        expect(findMalformedUnicodeString("\u0000�")).toBeUndefined();
        expect(findMalformedUnicodeString({ a: [{ b: "x" }], n: 1, t: true, z: null })).toBeUndefined();
        expect(findMalformedUnicodeString(undefined)).toBeUndefined();
    });

    it("finds a lone high or low surrogate in a string", () => {
        expect(findMalformedUnicodeString(`a ${lone} b`)).toBe(`a ${lone} b`);
        expect(findMalformedUnicodeString("\udc00")).toBe("\udc00");
        expect(findMalformedUnicodeString("\udc00\ud800")).toBe("\udc00\ud800"); // reversed pair is two lone surrogates
    });

    it("finds it nested in arrays and objects, and in object keys", () => {
        expect(findMalformedUnicodeString({ author: { displayName: `n ${lone}` } })).toBe(`n ${lone}`);
        expect(findMalformedUnicodeString(["ok", ["deeper", { k: lone }]])).toBe(lone);
        expect(findMalformedUnicodeString({ [`key ${lone}`]: "value" })).toBe(`key ${lone}`);
    });
});
