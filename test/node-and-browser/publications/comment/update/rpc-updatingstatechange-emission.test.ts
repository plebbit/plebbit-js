import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { addStringToIpfs, getAvailablePKCConfigsToTestAgainst } from "../../../../../dist/node/test/test-util.js";

import type { PKC as PKCType } from "../../../../../dist/node/pkc/pkc.js";
import type { PKCError } from "../../../../../dist/node/pkc-error.js";
import type { Comment } from "../../../../../dist/node/publications/comment/comment.js";

// Issue #364, comment side: over RPC, Comment._handleErrorEventFromRpc applied the error's
// details.newUpdatingState without emitting, so the server's follow-up updatingstatechange
// notification for that state was dropped as a duplicate and clients never saw "waiting-retry"
// after a retriable error, while a non-RPC client does. The "failed" case is a guard: the server
// stops a comment before emitting a non-retriable error, so no newUpdatingState is attached there.

const STATE_WAIT_MS = 10_000;

const waitForUpdatingStateEvent = (comment: Comment, recorded: string[], state: string) =>
    new Promise<boolean>((resolve) => {
        if (recorded.includes(state)) return resolve(true);
        const timer = setTimeout(() => {
            comment.removeListener("updatingstatechange", listener);
            resolve(false);
        }, STATE_WAIT_MS);
        const listener = (newState: string) => {
            if (newState !== state) return;
            clearTimeout(timer);
            comment.removeListener("updatingstatechange", listener);
            resolve(true);
        };
        comment.on("updatingstatechange", listener);
    });

// Not run on remote-ipfs-gateway: the gateway client retries an invalid community signature
// silently (no error event) and wraps record errors in a gateway error, by design; the bug is
// RPC-only and Kubo/libp2p-js serve as the non-RPC control
getAvailablePKCConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs", "remote-pkc-rpc"] }).map((config) => {
    describe.concurrent(`comment updatingstatechange is emitted for every updating state (issue #364) - ${config.name}`, () => {
        let pkc: PKCType;
        beforeAll(async () => {
            pkc = await config.pkcInstancePromise();
        });
        afterAll(async () => {
            await pkc.destroy();
        });

        it(`emits updatingstatechange("failed") after a non-retriable CommentIpfs error`, async () => {
            const cidOfInvalidJson = await addStringToIpfs("<html>not a comment " + Math.random());
            const comment = await pkc.createComment({ cid: cidOfInvalidJson });
            const recorded: string[] = [];
            comment.on("updatingstatechange", (state: string) => recorded.push(state));
            try {
                const errorPromise = new Promise<PKCError>((resolve) => comment.once("error", (e) => resolve(e as PKCError)));
                await comment.update();
                const error = await errorPromise;
                expect(error.code).to.equal("ERR_INVALID_JSON");
                const emitted = await waitForUpdatingStateEvent(comment, recorded, "failed");
                expect(emitted, `recorded updatingstatechange events: ${JSON.stringify(recorded)}`).to.equal(true);
            } finally {
                await comment.stop();
            }
        });

        it(`emits updatingstatechange("waiting-retry") after a retriable CommentIpfs error`, async () => {
            // Own instance so the shortened timeout does not leak into the concurrent case. Over RPC
            // the server's own comment-ipfs timeout applies instead, so that run takes ~60s
            const retryPkc = await config.pkcInstancePromise();
            retryPkc._timeouts["comment-ipfs"] = 1000;
            const nonExistentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // no node has this block, so every fetch times out and retries
            const comment = await retryPkc.createComment({ cid: nonExistentCid });
            const recorded: string[] = [];
            const errors: PKCError[] = [];
            comment.on("updatingstatechange", (state: string) => recorded.push(state));
            try {
                const errorPromise = new Promise<PKCError>((resolve) =>
                    comment.on("error", (e) => {
                        errors.push(e as PKCError);
                        resolve(e as PKCError);
                    })
                );
                await comment.update();
                await errorPromise;
                const emitted = await waitForUpdatingStateEvent(comment, recorded, "waiting-retry");
                expect(
                    emitted,
                    `recorded updatingstatechange events: ${JSON.stringify(recorded)}, errors: ${errors.map((e) => e.code)}`
                ).to.equal(true);
            } finally {
                await comment.stop();
                await retryPkc.destroy();
            }
        });
    });
});
