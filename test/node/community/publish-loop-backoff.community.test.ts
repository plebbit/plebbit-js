import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mockPKC, createSubWithNoChallenge, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import { PKCError } from "../../../dist/node/pkc-error.js";

import type { PKC as PKCType } from "../../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";

// A sync cycle that fails leaves the update trigger set. The publish loop used to wake on it at its next 100ms tick, so
// a community whose every cycle fails (issue #430: a renamed community failing its own page check) retried and emitted
// the same error about ten times a second. It now waits the full publishInterval after a failed cycle.
// Skipped under RPC because it stubs a method on the LocalCommunity instance, which lives in the RPC server
describeSkipIfRpc(`Publish loop after a failed sync cycle`, async () => {
    let pkc: PKCType;
    let community: LocalCommunity;

    beforeAll(async () => {
        pkc = await mockPKC();
        community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });
    });

    afterAll(async () => {
        await community.delete();
        await pkc.destroy();
    });

    it(`retries at most once per publishInterval and emits an error for every failed cycle`, async () => {
        const errors: Error[] = [];
        const onError = (e: Error) => errors.push(e);
        community.on("error", onError);
        const originalValidate = community._validateCommunitySizeSchemaAndSignatureBeforePublishing.bind(community);
        community._validateCommunitySizeSchemaAndSignatureBeforePublishing = async () => {
            throw new PKCError("ERR_LOCAL_COMMUNITY_PRODUCED_INVALID_SIGNATURE", { reason: "stubbed by publish-loop-backoff test" });
        };
        try {
            await community.edit({ title: "trigger a failing cycle " + Date.now() });
            const watchMs = pkc.publishInterval * 3.5;
            await new Promise((resolve) => setTimeout(resolve, watchMs));
            const failedCycles = errors.filter((e) => (e as PKCError).code === "ERR_LOCAL_COMMUNITY_PRODUCED_INVALID_SIGNATURE").length;
            expect(failedCycles).to.be.greaterThan(0);
            // one failure right away, then one per publishInterval
            expect(failedCycles).to.be.at.most(Math.ceil(watchMs / pkc.publishInterval) + 1);
        } finally {
            community._validateCommunitySizeSchemaAndSignatureBeforePublishing = originalValidate;
            community.removeListener("error", onError);
        }
        // and recovers on the next cycle once the cause is gone
        const updatedAtBeforeRecovery = community.updatedAt!;
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => community.updatedAt! > updatedAtBeforeRecovery });
        expect(community.startedState).to.not.equal("failed");
    });
});

// The backoff after a failed cycle must not hold back a new trigger: an owner who calls edit() to fix whatever made the
// cycle fail should see the edit published on the next tick, not a full publishInterval later. A large publishInterval
// separates the two outcomes.
// Skipped under RPC because it stubs a method on the LocalCommunity instance, which lives in the RPC server
describeSkipIfRpc(`Publish loop after a failed sync cycle, then an edit()`, async () => {
    const publishInterval = 6000;
    let pkc: PKCType;
    let community: LocalCommunity;

    beforeAll(async () => {
        pkc = await mockPKC({ publishInterval });
        community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });
    });

    afterAll(async () => {
        await community.delete();
        await pkc.destroy();
    });

    it(`publishes an edit made after a failed cycle without waiting a full publishInterval`, async () => {
        let failing = true;
        const originalValidate = community._validateCommunitySizeSchemaAndSignatureBeforePublishing.bind(community);
        community._validateCommunitySizeSchemaAndSignatureBeforePublishing = async (...args) => {
            if (failing)
                throw new PKCError("ERR_LOCAL_COMMUNITY_PRODUCED_INVALID_SIGNATURE", { reason: "stubbed by publish-loop-backoff test" });
            return originalValidate(...args);
        };
        try {
            const failedCycle = new Promise<void>((resolve) => community.once("error", () => resolve()));
            await community.edit({ title: "trigger a failing cycle " + Date.now() });
            await failedCycle;

            failing = false;
            const updateCidBeforeEdit = community.updateCid;
            const editedAt = Date.now();
            await community.edit({ title: "the owner's fix " + Date.now() });
            await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => community.updateCid !== updateCidBeforeEdit });
            const publishedAfterMs = Date.now() - editedAt;
            console.log(`edit after a failed cycle was published after ${publishedAfterMs}ms (publishInterval ${publishInterval}ms)`);
            expect(publishedAfterMs).to.be.lessThan(2000);
        } finally {
            community._validateCommunitySizeSchemaAndSignatureBeforePublishing = originalValidate;
        }
    });
});
