import { afterEach, beforeEach, expect, it } from "vitest";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { mockGatewayPKC } from "../../../dist/node/test/test-util.js";
import { nativeFunctions, setNativeFunctions } from "../../../dist/node/runtime/node/util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import type { PKC } from "../../../dist/node/pkc/pkc.js";

// Gateway bodies are read as a stream of byte chunks (`_fetchWithLimit`) so the download can be
// capped at maxFileSizeBytes. Each chunk used to be decoded on its own, so a multi-byte UTF-8
// character that straddled two reads was replaced with U+FFFD. The re-encoded text then hashed
// to a different CID than the bytes the gateway served and the fetch failed with
// ERR_CALCULATED_CID_DOES_NOT_MATCH. Seen in CI on a ~345KB page whose emoji title sat on a
// chunk boundary (backward.compatibility.commentupdate, chrome-remote-ipfs-gateway).

const emoji = "\u{1F482}"; // 4 bytes in UTF-8
const content = JSON.stringify({ title: `thank you, I'll let myself out.\n${emoji}\n`, padding: "x".repeat(64) });
const contentBytes = new TextEncoder().encode(content);
const emojiByteOffset = content.indexOf(emoji); // every char before the emoji is ASCII, so char offset == byte offset

// Serves `bytes` as one Response whose body arrives in the given slices
const streamedResponse = (bytes: Uint8Array, splitAt: number[]) => {
    const bounds = [0, ...splitAt, bytes.length];
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            for (let i = 0; i < bounds.length - 1; i++) controller.enqueue(bytes.slice(bounds[i], bounds[i + 1]));
            controller.close();
        }
    });
    return new Response(stream, { status: 200, headers: { "content-type": "application/json" } });
};

// The gateway client is in-process only; under a PKC RPC client the gateway fetch and the
// native fetch override both live in the RPC server.
describeSkipIfRpc("gateway body streaming keeps multi-byte characters split across reads", () => {
    let pkc: PKC;
    let cid: string;
    const originalFetch = nativeFunctions.fetch;

    beforeEach(async () => {
        cid = await calculateIpfsHash(content);
        pkc = await mockGatewayPKC();
    });

    afterEach(async () => {
        setNativeFunctions({ fetch: originalFetch });
        await pkc.destroy();
    });

    const splits: Record<string, number[]> = {
        "3|1 split inside the emoji": [emojiByteOffset + 3],
        "1|3 split inside the emoji": [emojiByteOffset + 1],
        "one byte per read across the emoji": [emojiByteOffset + 1, emojiByteOffset + 2, emojiByteOffset + 3]
    };

    for (const [name, splitAt] of Object.entries(splits)) {
        it(`fetchCid returns the exact body and verifies its CID with a ${name}`, async () => {
            setNativeFunctions({ fetch: async () => streamedResponse(contentBytes, splitAt) });
            const { content: fetched } = await pkc.fetchCid({ cid });
            expect(fetched).to.equal(content);
            expect(fetched.includes("�"), "no replacement characters").to.be.false;
        });
    }

    it("_fetchWithLimit returns the exact text when every byte arrives in its own read", async () => {
        const everyByte = Array.from({ length: contentBytes.length - 1 }, (_, i) => i + 1);
        setNativeFunctions({ fetch: async () => streamedResponse(contentBytes, everyByte) });
        const { resText } = await pkc._clientsManager._fetchWithLimit("http://localhost:18080/ipfs/" + cid, {
            cache: "no-store",
            signal: new AbortController().signal,
            maxFileSizeBytes: 1024 * 1024
        });
        expect(resText).to.equal(content);
    });
});
