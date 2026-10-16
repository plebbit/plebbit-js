import { describe, it, beforeAll, afterAll, expect } from "vitest";
import {
    publishStaticCommunityWithPostInPages,
    createStaticCommunityRecordForComment,
    getAvailablePKCConfigsToTestAgainst
} from "../../../dist/node/test/test-util.js";

import type { PKC as PKCType } from "../../../dist/node/pkc/pkc.js";
import type { PKCError } from "../../../dist/node/pkc-error.js";
import type { RemoteCommunity } from "../../../dist/node/community/remote-community.js";

// Issue #364: over RPC, RpcRemoteCommunity applies the state carried on the "update" event
// (runtimeFields.updatingState || "succeeded") and on the "error" event (details.newUpdatingState)
// without emitting, so the server's follow-up updatingstatechange notification for the same state
// is dropped as a duplicate. Clients then never see "succeeded", "failed" or "waiting-retry" (after
// a retriable error) as updatingstatechange events, while a non-RPC client does.

const STATE_WAIT_MS = 10_000;

const waitForUpdatingStateEvent = (community: RemoteCommunity, recorded: string[], state: string) =>
    new Promise<boolean>((resolve) => {
        if (recorded.includes(state)) return resolve(true);
        const timer = setTimeout(() => {
            community.removeListener("updatingstatechange", listener);
            resolve(false);
        }, STATE_WAIT_MS);
        const listener = (newState: string) => {
            if (newState !== state) return;
            clearTimeout(timer);
            community.removeListener("updatingstatechange", listener);
            resolve(true);
        };
        community.on("updatingstatechange", listener);
    });

getAvailablePKCConfigsToTestAgainst().map((config) => {
    describe.concurrent(`updatingstatechange is emitted for every updating state (issue #364) - ${config.name}`, () => {
        let pkc: PKCType;
        beforeAll(async () => {
            pkc = await config.pkcInstancePromise();
        });
        afterAll(async () => {
            await pkc.destroy();
        });

        it(`emits updatingstatechange("succeeded") after the first update`, async () => {
            const { communityAddress, ipnsObj } = await publishStaticCommunityWithPostInPages();
            const community = await pkc.createCommunity({ address: communityAddress });
            const recorded: string[] = [];
            community.on("updatingstatechange", (state: string) => recorded.push(state));
            try {
                const updatePromise = new Promise((resolve) => community.once("update", resolve));
                await community.update();
                await updatePromise;
                expect(community.updatingState).to.equal("succeeded");
                const emitted = await waitForUpdatingStateEvent(community, recorded, "succeeded");
                expect(emitted, `recorded updatingstatechange events: ${JSON.stringify(recorded)}`).to.equal(true);
            } finally {
                await community.stop();
                await ipnsObj.pkc.destroy();
            }
        });

        it(`emits updatingstatechange("failed") after a non-retriable error`, async () => {
            const { communityAddress } = await createStaticCommunityRecordForComment({ invalidateCommunitySignature: true });
            const community = await pkc.createCommunity({ address: communityAddress });
            const recorded: string[] = [];
            community.on("updatingstatechange", (state: string) => recorded.push(state));
            try {
                const errorPromise = new Promise<PKCError>((resolve) => community.once("error", (e) => resolve(e as PKCError)));
                await community.update();
                const error = await errorPromise;
                expect(error.code).to.equal("ERR_COMMUNITY_SIGNATURE_IS_INVALID");
                const emitted = await waitForUpdatingStateEvent(community, recorded, "failed");
                expect(emitted, `recorded updatingstatechange events: ${JSON.stringify(recorded)}`).to.equal(true);
            } finally {
                await community.stop();
            }
        });

        it(`emits updatingstatechange("waiting-retry") after a retriable error`, async () => {
            // Own instance so the shortened timeout does not leak into the concurrent cases. Over RPC
            // the server's own community-ipns timeout applies instead, so that run takes ~60s
            const retryPkc = await config.pkcInstancePromise();
            retryPkc._timeouts["community-ipns"] = 1000;
            const throwaway = await retryPkc.createSigner();
            // A freshly generated IPNS name that was never published: every resolve fails and retries
            const community = await retryPkc.createCommunity({ address: throwaway.address });
            const recorded: string[] = [];
            const errors: PKCError[] = [];
            community.on("updatingstatechange", (state: string) => recorded.push(state));
            try {
                const errorPromise = new Promise<PKCError>((resolve) =>
                    community.on("error", (e) => {
                        errors.push(e as PKCError);
                        resolve(e as PKCError);
                    })
                );
                await community.update();
                const error = await errorPromise;
                expect(error.details?.retriableError, JSON.stringify(error)).to.equal(true);
                const emitted = await waitForUpdatingStateEvent(community, recorded, "waiting-retry");
                expect(
                    emitted,
                    `recorded updatingstatechange events: ${JSON.stringify(recorded)}, errors: ${errors.map((e) => e.code)}`
                ).to.equal(true);
            } finally {
                await community.stop();
                await retryPkc.destroy();
            }
        });
    });
});
