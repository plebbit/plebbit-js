import { describeSkipIfRpc } from "../../../helpers/conditional-tests.js";
import { it, expect, vi } from "vitest";
import { createCommunityWithDefaultDb, getPageGenerator, regenerateAllCommentUpdates, seedComments } from "./page-sorts-test-util.js";

import type { PageIpfs } from "../../../../dist/node/pages/types.js";

// A post's nested and flat reply sorts are generated in one pass and share one serialized-entry cache (issue #351).
// A reply under the post is loaded once per shape: with its reply tree for the nested sorts, without `replies` for the
// flat sorts. The cache must not hand the nested JSON to the flat page: a flat page entry carrying `replies` is
// what test/node/publications/comment/replies/replies.test.ts "flat sorts include nested replies and hide nested
// replies fields" caught in CI, and this is the same failure without a live community.

// Small enough that the preloaded sort overflows it, so generation takes the full path where pages are built from
// the cache (the single-chunk shortcut resolves entries directly and never sees the cache).
const PRELOAD_BUDGET = 2 * 1024;

type AddSpy = { mock: { calls: [string][]; results: { value: Promise<{ cid: string }> }[] } };

async function pagesAddedForSort(addSpy: AddSpy, pageCids: string[] | undefined): Promise<PageIpfs[]> {
    expect(pageCids, "the flat sort must have been generated through IPFS pages").to.be.an("array").that.is.not.empty;
    const pages: PageIpfs[] = [];
    for (const pageCid of pageCids!) {
        let found: PageIpfs | undefined;
        for (let i = 0; i < addSpy.mock.calls.length; i++) {
            const { cid } = await addSpy.mock.results[i].value;
            if (cid === pageCid) found = JSON.parse(addSpy.mock.calls[i][0]) as PageIpfs;
        }
        expect(found, `page ${pageCid} must have been added through the fake IPFS client`).to.exist;
        pages.push(found!);
    }
    return pages;
}

describeSkipIfRpc("flat reply sorts share the serialized-entry cache with nested sorts (issue #351)", () => {
    it("a flat page entry never carries the nested sorts' replies, and is sized without them", async () => {
        const context = await createCommunityWithDefaultDb();
        try {
            const { cidOf } = await seedComments(context.community, [
                {
                    label: "post",
                    children: Array.from({ length: 6 }, (_, i) => ({
                        label: `reply-${i}`,
                        contentBytes: 400,
                        // two replies carry a subtree, so their nested entries have `replies` and their flat entries do not
                        children: i < 2 ? [{ label: `reply-${i}-child`, contentBytes: 400 }] : undefined
                    }))
                }
            ]);
            await regenerateAllCommentUpdates(context.community);

            const post = context.community._dbHandler.queryComment(cidOf("post"))!;
            const ipfsClient = context.community._clientsManager.getDefaultKuboRpcClient()._client as unknown as {
                add: (content: string) => Promise<{ cid: string; path: string; size: number }>;
            };
            const addSpy = vi.spyOn(ipfsClient, "add") as unknown as AddSpy;

            const generated = await getPageGenerator(context.community).generatePostPages(post, PRELOAD_BUDGET);
            if (!generated || "singlePreloadedPage" in generated) throw new Error("expected the full generation path");

            // The nested sorts did see the subtrees: the cache holds JSON with `replies` for reply-0 and reply-1
            const nestedPages = await pagesAddedForSort(addSpy, generated.allPageCids.new);
            const nestedWithReplies = nestedPages.flatMap((page) => page.comments).filter((entry) => entry.commentUpdate.replies);
            expect(nestedWithReplies.map((entry) => entry.comment.content?.slice(0, 7)).sort()).to.deep.equal(["reply-0", "reply-1"]);

            for (const flatSortName of ["newFlat", "oldFlat"]) {
                const flatPages = await pagesAddedForSort(addSpy, generated.allPageCids[flatSortName]);
                const flatEntries = flatPages.flatMap((page) => page.comments);
                // flattened: the depth-2 children are entries of their own
                expect(flatEntries.filter((entry) => entry.comment.depth === 2)).to.have.length(2);
                for (const entry of flatEntries)
                    expect(
                        entry.commentUpdate.replies,
                        `${flatSortName} entry ${entry.comment.content?.slice(0, 13)} must not carry replies`
                    ).to.be.undefined;
            }
        } finally {
            await context.cleanup();
        }
    });
});
