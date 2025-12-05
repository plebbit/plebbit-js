import { expect } from "chai";
import {
    createSubWithNoChallenge,
    forcePagesToUsePageCidsOnly,
    getAvailablePlebbitConfigsToTestAgainst,
    iterateThroughPageCidToFindComment,
    loadAllPagesBySortName,
    mockPlebbit,
    publishRandomPost,
    resolveWhenConditionIsTrue,
    waitTillPostInSubplebbitPages
} from "../../../../dist/node/test/test-util.js";
import { POSTS_SORT_TYPES } from "../../../../dist/node/pages/util.js";
import { testPageCommentsIfSortedCorrectly } from "../../../node-and-browser/pages/pages-test-util.js";
import * as remeda from "remeda";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { describe, it } from "vitest";

const plebbitLoadingConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

describe("local subplebbit.posts pagination coverage", () => {
    plebbitLoadingConfigs.forEach((plebbitConfig) => {
        describe.sequential(`with ${plebbitConfig.name}`, () => {
            let plebbit, subplebbit, newPost, cleanup;
            let subPostsBySortName;

            before(async () => {
                ({ plebbit, subplebbit, newPost, cleanup } = await createLocalSubplebbitWithPageCids(plebbitConfig));
                subPostsBySortName = {};

                for (const sortName of Object.keys(POSTS_SORT_TYPES)) {
                    subPostsBySortName[sortName] = await loadAllPagesBySortName(sortName, subplebbit.posts);
                }
            });

            after(async () => {
                if (cleanup) await cleanup();
                else {
                    await subplebbit?.stop?.().catch(() => {});
                    await plebbit?.destroy?.().catch(() => {});
                }
            });

            it(`Newly published post appears on all pages`, async () => {
                expect(Object.keys(subplebbit.posts.pageCids)).to.not.be.empty;

                for (const preloadedPageSortName of Object.keys(subplebbit.posts.pages)) {
                    const allPostsUnderPreloadedSortName = await loadAllPagesBySortName(preloadedPageSortName, subplebbit.posts);
                    const postInPreloadedPage = allPostsUnderPreloadedSortName.find((postInPage) => postInPage.cid === newPost.cid);
                    expect(postInPreloadedPage).to.exist;
                }

                for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
                    const postInPage = await iterateThroughPageCidToFindComment(newPost.cid, pageCid, subplebbit.posts);
                    expect(postInPage).to.exist;
                }
            });

            it(`All pageCids exists except preloaded`, () => {
                expect(Object.keys(subplebbit.posts.pageCids)).to.not.be.empty;
                const preloadedSorts = Object.keys(subplebbit.posts.pages);

                const pageCidsWithoutPreloaded = Object.keys(subplebbit.posts.pageCids).filter(
                    (pageCid) => !preloadedSorts.includes(pageCid)
                );
                expect(pageCidsWithoutPreloaded.length).to.be.greaterThan(0);
                expect(pageCidsWithoutPreloaded.sort()).to.deep.equal(Object.keys(subplebbit.posts.pageCids).sort());

                const allSortsWithoutPreloaded = Object.keys(POSTS_SORT_TYPES).filter((sortName) => !preloadedSorts.includes(sortName));
                expect(allSortsWithoutPreloaded.length).to.be.greaterThan(0);
                expect(allSortsWithoutPreloaded.sort()).to.deep.equal(Object.keys(subplebbit.posts.pageCids).sort());
            });

            Object.keys(POSTS_SORT_TYPES).map((sortName) =>
                it(`${sortName} pages are sorted correctly if there's more than a single page`, async () => {
                    const posts = subPostsBySortName[sortName];

                    await testPageCommentsIfSortedCorrectly(posts, sortName, subplebbit);
                })
            );

            it(`posts are the same within all pages`, () => {
                expect(Object.keys(subPostsBySortName)).to.not.be.empty;
                const pagesByTimeframe = remeda.groupBy(Object.entries(POSTS_SORT_TYPES), ([_, sort]) => sort.timeframe);

                for (const pagesGrouped of Object.values(pagesByTimeframe)) {
                    const pages = pagesGrouped.map(([sortName, _]) => subPostsBySortName[sortName]);
                    if (pages.some((page) => !page)) continue;
                    if (pages.length === 1) continue; // there's only a single page under this timeframe, not needed to verify against other pages
                    expect(pages.length).to.be.greaterThanOrEqual(2);
                    expect(pages.map((page) => page.length).every((val, i, arr) => val === arr[0])).to.be.true; // All pages are expected to have the same length

                    for (const comment of pages[0]) {
                        const otherPageComments = pages.map((page) => page.find((c) => c.cid === comment.cid));
                        expect(otherPageComments.length).to.equal(pages.length);
                        for (const otherPageComment of otherPageComments) expect(comment).to.deep.equal(otherPageComment);
                    }
                }
            });

            it(`The PageIpfs.comments.comment always correspond to PageIpfs.comment.commentUpdate.cid`, async () => {
                const pageCids = Object.values(subplebbit.posts.pageCids);
                expect(pageCids.length).to.be.greaterThan(0);

                for (const pageCid of pageCids) {
                    const pageIpfs = JSON.parse(await plebbit.fetchCid({cid: pageCid})); // will have PageIpfs type

                    for (const commentInPageIpfs of pageIpfs.comments) {
                        const calculatedCid = await calculateIpfsHash(JSON.stringify(commentInPageIpfs.comment));
                        expect(calculatedCid).to.equal(commentInPageIpfs.commentUpdate.cid);
                    }
                }
            });
        });
    });
});

async function createLocalSubplebbitWithPageCids(plebbitConfig) {
    const publisherPlebbit = await mockPlebbit();
    const publisherSubplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    await publisherSubplebbit.start();

    await resolveWhenConditionIsTrue({
        toUpdate: publisherSubplebbit,
        predicate: () => typeof publisherSubplebbit.updatedAt === "number"
    });
    const latestPost = await publishRandomPost(publisherSubplebbit.address, publisherPlebbit);
    await waitTillPostInSubplebbitPages(latestPost, publisherPlebbit);

    await forcePagesToUsePageCidsOnly({
        subplebbit: publisherSubplebbit,
        forcedPreloadedPageSizeBytes: 1,
        subplebbitPostsCommentProps: { content: `local pagination coverage ${plebbitConfig.name}` }
    });

    await resolveWhenConditionIsTrue({
        toUpdate: publisherSubplebbit,
        predicate: () =>
            Object.keys(publisherSubplebbit.posts.pageCids).length > 0 && Boolean(publisherSubplebbit.posts.pages.hot?.comments?.length)
    });

    const plebbitFromConfig = await plebbitConfig.plebbitInstancePromise();
    const subplebbit = await plebbitFromConfig.getSubplebbit({address: publisherSubplebbit.address});
    await subplebbit.update();
    await resolveWhenConditionIsTrue({
        toUpdate: subplebbit,
        predicate: () => Object.keys(subplebbit.posts.pageCids).length > 0 && Boolean(subplebbit.posts.pages.hot?.comments?.length)
    });

    const cleanup = async () => {
        await subplebbit?.stop?.().catch(() => {});
        await publisherSubplebbit?.stop?.().catch(() => {});
        await publisherSubplebbit?.delete?.().catch(() => {});

        const plebbitsToDestroy = new Set([plebbitFromConfig, publisherPlebbit]);
        for (const instance of plebbitsToDestroy) await instance?.destroy?.().catch(() => {});
    };

    return { plebbit: plebbitFromConfig, subplebbit, newPost: latestPost, cleanup };
}
