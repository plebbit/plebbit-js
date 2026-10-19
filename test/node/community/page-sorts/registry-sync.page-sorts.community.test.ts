import { describeSkipIfRpc } from "../../../helpers/conditional-tests.js";
import { it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    syncChallengesWithRegistry,
    syncPageSortsWithRegistry
} from "../../../../dist/node/runtime/node/community/local-community/registry-sync.js";
import { createCommunityWithDefaultDb, regenerateAllCommentUpdates, seedComments, type CommunityContext } from "./page-sorts-test-util.js";

import type { ChallengeFileFactoryInput, PageSortFileFactoryInput } from "../../../../dist/node/community/types.js";

// Issues #410 and #411: a consumer (bitsocial-cli's `page-sort install` / `challenge install`) replaces a factory in the
// registry of a running node. The community must pick the new one up on its next cycle: re-resolve the sorts,
// regenerate every CommentUpdate the way a settings.pages edit does, and republish the record with fresh
// community.pageSorts / community.challenges. An unchanged registry must change nothing.

const SORT_NAME = "registrySyncSort";
const CHALLENGE_NAME = "registrySyncChallenge";

const makePageSort = (version: string): PageSortFileFactoryInput =>
    (() => ({
        sortName: "registrySync",
        description: `registry sync sort ${version}`,
        score: ({ comment }: { comment: { timestamp: number } }) => (version === "v1" ? comment.timestamp : -comment.timestamp)
    })) as unknown as PageSortFileFactoryInput;

const makeChallenge = (version: string): ChallengeFileFactoryInput =>
    (() => ({
        type: "text/plain",
        description: `registry sync challenge ${version}`,
        getChallenge: async () => ({ success: true })
    })) as unknown as ChallengeFileFactoryInput;

// The registry is mutated in place, the way a consumer hot-swaps a package; a mocked pkc never reaches the RPC path.
describeSkipIfRpc("registry sync: page sorts (issue #411)", () => {
    let context: CommunityContext;
    let registry: Record<string, PageSortFileFactoryInput>;

    beforeEach(async () => {
        registry = { [SORT_NAME]: makePageSort("v1") };
        context = await createCommunityWithDefaultDb({ pageSorts: registry });
        registry = context.pkc.settings.pageSorts!;
        await context.community.edit({
            settings: { ...context.community.settings, pages: { posts: [{ name: SORT_NAME, preloaded: true }] } }
        });
        await context.community._dbHandler.initDbIfNeeded(); // edit() on a stopped community closes the db
        await seedComments(context.community, [{ label: "a" }, { label: "b", children: [{ label: "b1" }] }]);
        await regenerateAllCommentUpdates(context.community);
        await syncPageSortsWithRegistry(context.community); // first sync takes the baseline
        context.community._communityUpdateTrigger = false;
    });

    afterEach(async () => {
        await context.cleanup();
    });

    it("does nothing when the registry still holds the same factory", async () => {
        const forceUpdate = vi.spyOn(context.community._dbHandler, "forceUpdateOnAllComments");
        const resolvedBefore = context.community._pageSorts;
        await syncPageSortsWithRegistry(context.community);
        expect(forceUpdate).not.toHaveBeenCalled();
        expect(context.community._pageSorts).to.equal(resolvedBefore); // same instances, the factory did not run again
        expect(context.community._communityUpdateTrigger).to.equal(false);
    });

    it("re-resolves, regenerates every CommentUpdate and republishes when the factory is replaced", async () => {
        const forceUpdate = vi.spyOn(context.community._dbHandler, "forceUpdateOnAllComments");
        registry[SORT_NAME] = makePageSort("v2");
        await syncPageSortsWithRegistry(context.community);
        expect(context.community._pageSorts!.posts[0].file.description).to.equal("registry sync sort v2");
        expect(context.community.pageSorts?.posts?.registrySync?.description).to.equal("registry sync sort v2");
        expect(forceUpdate).toHaveBeenCalledTimes(1);
        expect(context.community._communityUpdateTrigger).to.equal(true);
    });

    it("reports a removed factory once and keeps publishing without it", async () => {
        const errors: unknown[] = [];
        context.community.on("error", (e) => errors.push(e));
        delete registry[SORT_NAME];
        await syncPageSortsWithRegistry(context.community);
        expect(context.community._pageSorts!.posts).to.have.length(0);
        expect(errors).to.have.length(1);
        expect(context.community._communityUpdateTrigger).to.equal(true);

        context.community._communityUpdateTrigger = false;
        await syncPageSortsWithRegistry(context.community); // still missing: nothing new to report or regenerate
        expect(errors).to.have.length(1);
        expect(context.community._communityUpdateTrigger).to.equal(false);
    });

    it("detects a factory replaced while the node was down (fresh process, persisted fingerprint)", async () => {
        // A restart: the in-memory snapshot is gone, only the fingerprint persisted in the db survives
        context.community._pageSorts = undefined;
        context.community._pageSortFactories = undefined;
        registry[SORT_NAME] = makePageSort("v2");
        const forceUpdate = vi.spyOn(context.community._dbHandler, "forceUpdateOnAllComments");
        await syncPageSortsWithRegistry(context.community);
        expect(forceUpdate).toHaveBeenCalledTimes(1);
        expect(context.community.pageSorts?.posts?.registrySync?.description).to.equal("registry sync sort v2");
        expect(context.community._communityUpdateTrigger).to.equal(true);
    });

    it("does not regenerate on a restart with the same factory code", async () => {
        context.community._pageSorts = undefined;
        context.community._pageSortFactories = undefined;
        registry[SORT_NAME] = makePageSort("v1"); // a new function object (re-imported), same source
        const forceUpdate = vi.spyOn(context.community._dbHandler, "forceUpdateOnAllComments");
        await syncPageSortsWithRegistry(context.community);
        expect(forceUpdate).not.toHaveBeenCalled();
        expect(context.community._communityUpdateTrigger).to.equal(false);
    });

    // A reload that lands while the sorts are being resolved (the sync awaits between looking the registry up and
    // installing the result) must not be recorded as already applied, or every later cycle compares equal and the
    // community keeps the old sort until a restart.
    it("picks up a factory replaced in the registry while the previous one was being resolved", async () => {
        const v1 = makePageSort("v1") as unknown as (args: unknown) => unknown;
        registry[SORT_NAME] = ((args: unknown) => {
            registry[SORT_NAME] = makePageSort("v2"); // the reload lands mid-resolve
            return v1(args);
        }) as unknown as PageSortFileFactoryInput;
        await syncPageSortsWithRegistry(context.community);
        expect(context.community._pageSorts!.posts[0].file.description).to.equal("registry sync sort v1");

        await syncPageSortsWithRegistry(context.community);
        expect(context.community._pageSorts!.posts[0].file.description).to.equal("registry sync sort v2");
    });
});

describeSkipIfRpc("registry sync: community.challenges (issue #410)", () => {
    let context: CommunityContext;
    let registry: Record<string, ChallengeFileFactoryInput>;

    beforeEach(async () => {
        context = await createCommunityWithDefaultDb({ challenges: { [CHALLENGE_NAME]: makeChallenge("v1") } });
        registry = context.pkc.settings.challenges!;
        await context.community.edit({ settings: { ...context.community.settings, challenges: [{ name: CHALLENGE_NAME }] } });
        await context.community._dbHandler.initDbIfNeeded();
        context.community._communityUpdateTrigger = false;
    });

    afterEach(async () => {
        await context.cleanup();
    });

    it("leaves the record alone when the challenge is unchanged", async () => {
        await syncChallengesWithRegistry(context.community);
        expect(context.community.challenges?.[0]?.description).to.equal("registry sync challenge v1");
        expect(context.community._communityUpdateTrigger).to.equal(false);
    });

    it("recomputes community.challenges and republishes when the factory is replaced", async () => {
        registry[CHALLENGE_NAME] = makeChallenge("v2");
        await syncChallengesWithRegistry(context.community);
        expect(context.community.challenges?.[0]?.description).to.equal("registry sync challenge v2");
        expect(context.community._communityUpdateTrigger).to.equal(true);
    });

    it("keeps the previous record when the factory is gone", async () => {
        delete registry[CHALLENGE_NAME];
        await syncChallengesWithRegistry(context.community);
        expect(context.community.challenges?.[0]?.description).to.equal("registry sync challenge v1");
        expect(context.community._communityUpdateTrigger).to.equal(false);
    });
});
