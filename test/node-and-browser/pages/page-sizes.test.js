import { expect } from "chai";
import { addStringToIpfs, getRemotePlebbitConfigs, isPlebbitFetchingUsingGateways } from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";

import validPageFixture from "../../fixtures/valid_page.json" assert { type: "json" };

const subplebbitAddress = signers[0].address;

// Helper to create a mock page with specific size
async function createMockPageOfSize(baseSize, nextCid = null) {
    // Start with the valid page fixture
    const page = JSON.parse(JSON.stringify(validPageFixture));

    // Set the nextCid if provided
    if (nextCid) page.nextCid = nextCid;
    else delete page.nextCid;

    // Calculate current size
    const currentSize = new TextEncoder().encode(JSON.stringify(page)).length;

    // If current size is already too large, throw error
    if (currentSize > baseSize) {
        throw new Error(`Initial page size (${currentSize} bytes) already exceeds target size (${baseSize} bytes).`);
    }

    // If we need to increase size, duplicate comments
    if (currentSize < baseSize) {
        // Create a duplicate comment that we'll reuse (without modifying its content)
        const commentCopy = JSON.parse(JSON.stringify(page.comments[0]));

        // Calculate the size of a single comment plus the JSON comma and brackets overhead
        const singleCommentSize =
            new TextEncoder().encode(JSON.stringify([commentCopy])).length - new TextEncoder().encode(JSON.stringify([])).length;

        // Calculate how many comments we need to add, being more conservative
        const bytesNeeded = baseSize - currentSize;
        // Use a larger buffer (1KB) to ensure we don't exceed the limit
        const safetyBuffer = 1024;
        const commentsToAdd = Math.floor((bytesNeeded - safetyBuffer) / singleCommentSize);

        // Add the calculated number of comments at once using Array.fill
        page.comments.push(
            ...Array(commentsToAdd)
                .fill()
                .map(() => JSON.parse(JSON.stringify(commentCopy)))
        );

        // Final verification
        const finalSize = new TextEncoder().encode(JSON.stringify(page)).length;
        if (finalSize > baseSize) {
            throw new Error(`Generated page exceeds target size: ${finalSize} > ${baseSize} bytes`);
        }

        // We won't be able to hit the exact size without modifying content
        // So we'll accept being under the target size by a small margin
        const underSizeMargin = baseSize - finalSize;
        if (underSizeMargin > singleCommentSize * 2) {
            throw new Error(`Failed to reach close to target size: ${finalSize} < ${baseSize} bytes (gap: ${underSizeMargin} bytes)`);
        }
    }

    return page;
}

getRemotePlebbitConfigs().map((config) => {
    describe(`Page size loading tests - ${config.name}`, async () => {
        let plebbit, mockSubplebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        beforeEach(async () => {
            // Create a fresh mock subplebbit for each test
            mockSubplebbit = await plebbit.createSubplebbit({
                address: subplebbitAddress
            });
        });

        it("should correctly track page size expectations when loading pages with nextCid", async () => {
            // Create a chain of mock pages with increasing sizes
            const firstPageSize = 1024 * 1024; // 1MB
            const secondPageSize = 2 * 1024 * 1024; // 2MB
            const thirdPageSize = 4 * 1024 * 1024; // 4MB

            // Create pages in reverse order (third, second, first) since we need the CIDs
            const thirdPage = await createMockPageOfSize(thirdPageSize);
            const thirdPageCid = await addStringToIpfs(JSON.stringify(thirdPage));

            const secondPage = await createMockPageOfSize(secondPageSize, thirdPageCid);
            const secondPageCid = await addStringToIpfs(JSON.stringify(secondPage));

            const firstPage = await createMockPageOfSize(firstPageSize, secondPageCid);
            const firstPageCid = await addStringToIpfs(JSON.stringify(firstPage));

            // Set up the subplebbit's posts to point to our first page
            mockSubplebbit.posts.pageCids = { ...mockSubplebbit.posts.pageCids, hot: firstPageCid };

            // Load the first page
            const loadedFirstPage = await mockSubplebbit.posts.getPage(firstPageCid); // just to set the expectation for second page

            // Verify the size expectation for the second page is set correctly
            expect(mockSubplebbit.posts._clientsManager._pagesMaxSize[secondPageCid]).to.equal(secondPageSize);

            // Load the second page
            const loadedSecondPage = await mockSubplebbit.posts.getPage(secondPageCid);

            // Verify the size expectation for the third page is set correctly
            expect(mockSubplebbit.posts._clientsManager._pagesMaxSize[thirdPageCid]).to.equal(thirdPageSize);

            // Load the third page
            const loadedThirdPage = await mockSubplebbit.posts.getPage(thirdPageCid);

            // Verify the third page has no nextCid
            expect(loadedThirdPage.nextCid).to.be.undefined;
        });

        it("should throw an error when a page exceeds its expected size limit", async () => {
            // Create a chain of pages to establish size expectations
            const firstPageSize = 1024 * 1024; // 1MB
            const secondPageSize = 2 * 1024 * 1024; // 2MB

            // Create a normal first page
            const firstPage = await createMockPageOfSize(firstPageSize);
            const firstPageCid = await addStringToIpfs(JSON.stringify(firstPage));

            // Create an oversized second page (3MB instead of expected 2MB)
            const oversizedSecondPage = await createMockPageOfSize(3 * 1024 * 1024);
            const oversizedSecondPageCid = await addStringToIpfs(JSON.stringify(oversizedSecondPage));

            // Update the first page to point to the oversized second page
            firstPage.nextCid = oversizedSecondPageCid;
            const updatedFirstPageCid = await addStringToIpfs(JSON.stringify(firstPage));

            // Set up the subplebbit's posts to point to our first page
            mockSubplebbit.posts.pageCids = { ...mockSubplebbit.posts.pageCids, hot: updatedFirstPageCid };

            // Load the first page to establish size expectations
            await mockSubplebbit.posts.getPage(updatedFirstPageCid);

            // Verify the size expectation for the second page is set correctly
            expect(mockSubplebbit.posts._clientsManager._pagesMaxSize[oversizedSecondPageCid]).to.equal(secondPageSize);

            // Attempt to load the oversized second page - should throw an error
            try {
                await mockSubplebbit.posts.getPage(oversizedSecondPageCid);
                expect.fail("Should have thrown an error for oversized page");
            } catch (error) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(error.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
                    expect(error.details.gatewayToError["http://localhost:18080"].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                } else {
                    // fetching with kubo/helia
                    expect(error.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                }
            }
        });

        it("should throw an error when a first page exceeds the default 1MB limit", async () => {
            // Create an oversized first page (2MB instead of default 1MB)
            const oversizedFirstPage = await createMockPageOfSize(2 * 1024 * 1024);
            const oversizedFirstPageCid = await addStringToIpfs(JSON.stringify(oversizedFirstPage));

            // Set up the subplebbit's posts to point to our oversized first page
            mockSubplebbit.posts.pageCids = { ...mockSubplebbit.posts.pageCids, hot: oversizedFirstPageCid };

            // Attempt to load the oversized first page - should throw an error
            try {
                await mockSubplebbit.posts.getPage(oversizedFirstPageCid);
                expect.fail("Should have thrown an error for oversized first page");
            } catch (error) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(error.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
                    expect(error.details.gatewayToError["http://localhost:18080"].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                } else {
                    // fetching with kubo/helia
                    expect(error.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                }
            }
        });
    });
});
