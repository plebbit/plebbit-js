import { expect } from "chai";
import {
    mockGatewayPlebbit,
    addStringToIpfs,
    getAvailablePlebbitConfigsToTestAgainst,
    isPlebbitFetchingUsingGateways,
    itSkipIfRpc
} from "../../../../dist/node/test/test-util.js";

import validModQueuePage from "../../../fixtures/valid_modqueue_page.json" with { type: "json" };

import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { Buffer } from "buffer";
import { messages } from "../../../../dist/node/errors.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";

const subplebbitAddressOfFixture = validModQueuePage.comments[0].comment.subplebbitAddress;

// need to test if comments with approved=false appear in any flattened pages, comment.replies, post.replies, subplebbit.posts
// same thing for pending comments

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe(`modQueue.getPage - ${config.name}`, async () => {
        it(`modQueue.getPage will throw if retrieved page is not equivalent to its CID - IPFS Gateway`, async () => {
            const gatewayUrl = "http://localhost:13415"; // a gateway that's gonna respond with invalid content
            const plebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [gatewayUrl], validatePages: true } });

            const sub = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });

            const invalidPageCid = "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"; // Gateway will respond with content that is not mapped to this cid
            sub.moderation.pageCids.pendingApproval = invalidPageCid; // need to hardcode it here so we can calculate max size
            try {
                await sub.moderation.getPage(invalidPageCid);
                expect.fail("Should fail");
            } catch (e) {
                expect(e.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
                expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_CALCULATED_CID_DOES_NOT_MATCH");
            }
            await plebbit.destroy();
        });
    });
});

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe("modQueue.getPage - " + config.name, () => {
        it(`subplebbit.moderation.getPage will throw if retrieved page has a comment with an signature `, async () => {
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: true } });

            const sub = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });

            const fixtureToInvalidate = JSON.parse(JSON.stringify(validModQueuePage));

            fixtureToInvalidate.comments[0].comment.content += "invalidate signature";

            const invalidPageCid = await addStringToIpfs(JSON.stringify(fixtureToInvalidate));
            sub.moderation.pageCids.pendingApproval = invalidPageCid; // need to hardcode it here so we can calculate max size

            try {
                await sub.moderation.getPage(invalidPageCid);
                expect.fail("should fail");
            } catch (e) {
                expect(e.code).to.equal("ERR_MOD_QUEUE_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
            }
            await plebbit.destroy();
        });

        it("Should fail getPage if a modqueue comment belongs to a different sub", async () => {
            // TODO: Ensure cross-sub comments cannot appear under another sub's modqueue
            // and that the operation fails or rejects with an appropriate error
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: true } });

            const sub = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });

            const invalidPage = JSON.parse(JSON.stringify(validModQueuePage));
            invalidPage.comments[0].comment.subplebbitAddress = "different-address";

            const invalidPageCid = await addStringToIpfs(JSON.stringify(invalidPage));
            sub.moderation.pageCids.pendingApproval = invalidPageCid; // need to hardcode it here so we can calculate max size

            try {
                await sub.moderation.getPage(invalidPageCid);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_MOD_QUEUE_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB);
            }
            await plebbit.destroy();
        });

        it("fails validation when calculated CID of CommentIpfs doesn't match commentUpdate.cid", async () => {
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: true } });

            const sub = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });

            const invalidPage = JSON.parse(JSON.stringify(validModQueuePage));
            // Modify the comment but keep the same commentUpdate.cid
            invalidPage.comments[0].commentUpdate.cid = invalidPage.comments[1].commentUpdate.cid;

            const invalidPageCid = await addStringToIpfs(JSON.stringify(invalidPage));
            sub.moderation.pageCids.pendingApproval = invalidPageCid; // need to hardcode it here so we can calculate max size

            try {
                await sub.moderation.getPage(invalidPageCid);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_MOD_QUEUE_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT);
            }
            await plebbit.destroy();
        });

        it("fails validation when a post has parentCid defined", async () => {
            const invalidPage = JSON.parse(JSON.stringify(validModQueuePage));
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: true } });

            const sub = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });

            invalidPage.comments.find((comment) => comment.comment.depth === 0).comment.parentCid =
                "QmYgRRQaybe12KWGnxjvaCetsxWutVRb9Piqcw8irgx9Xf"; // random cid unrelated to this comment. It's a post so it shouldn't have a postCid

            // Update the commentUpdate.cid to match the modified comment
            invalidPage.comments.find((comment) => comment.comment.depth === 0).commentUpdate.cid = await calculateIpfsHash(
                JSON.stringify(invalidPage.comments.find((comment) => comment.comment.depth === 0).comment)
            );

            const invalidPageCid = await addStringToIpfs(JSON.stringify(invalidPage));
            sub.moderation.pageCids.pendingApproval = invalidPageCid; // need to hardcode it here so we can calculate max size

            try {
                await sub.moderation.getPage(invalidPageCid);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_MOD_QUEUE_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT);
            }

            await plebbit.destroy();
        });

        it(`Fails validation when pending posts have postCid defined`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(validModQueuePage));
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: true } });

            const sub = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });

            const indexOfPost = invalidPage.comments.findIndex((comment) => comment.comment.depth === 0);
            expect(indexOfPost).to.be.greaterThanOrEqual(0);
            invalidPage.comments[indexOfPost].comment.postCid = "QmYgRRQaybe12KWGnxjvaCetsxWutVRb9Piqcw8irgx9Xf"; // random cid unrelated to this comment. It's a post so it shouldn't have a postCid

            // Update the commentUpdate.cid to match the modified comment
            invalidPage.comments[indexOfPost].commentUpdate.cid = await calculateIpfsHash(
                deterministicStringify(invalidPage.comments[indexOfPost].comment)
            );
            const invalidPageCid = await addStringToIpfs(JSON.stringify(invalidPage));
            sub.moderation.pageCids.pendingApproval = invalidPageCid; // need to hardcode it here so we can calculate max size

            try {
                await sub.moderation.getPage(invalidPageCid);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_MOD_QUEUE_PAGE_IS_INVALID");
                expect(e.details.signatureValidity.reason).to.equal(messages.ERR_PAGE_COMMENT_POST_HAS_POST_CID_DEFINED_WITH_DEPTH_0);
            }

            await plebbit.destroy();
        });

        it(`modQueue.getPage will throw if the first page is over 1mb`, async () => {
            const plebbit = await config.plebbitInstancePromise({ plebbitOptions: { validatePages: true } });

            const subplebbit = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });
            const page = JSON.parse(JSON.stringify(validModQueuePage));

            // Make sure the page is over 1MB
            // Keep adding comments until the page exceeds 1MB
            while (Buffer.byteLength(JSON.stringify(page)) <= 1024 * 1024) {
                page.comments.push(...page.comments);
            }

            // Verify the page is actually over 1MB
            const pageSizeInMB = Buffer.byteLength(JSON.stringify(page)) / (1024 * 1024);
            console.log(`Page size: ${pageSizeInMB.toFixed(2)}MB`);
            expect(pageSizeInMB).to.be.greaterThan(1, "Page should be larger than 1MB for this test");
            const pageCid = await addStringToIpfs(JSON.stringify(page));

            subplebbit.moderation.pageCids.pendingApproval = pageCid;

            try {
                await subplebbit.moderation.getPage(pageCid);
                expect.fail("Should have thrown");
            } catch (e) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(e.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                        expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                } else expect(e.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
            }
            await plebbit.destroy();
        });

        itSkipIfRpc("modQueue.getPage will throw a timeout error when request times out", async () => {
            // Create a plebbit instance with a very short timeout for page-ipfs
            const plebbit = await config.plebbitInstancePromise();

            plebbit._timeouts["page-ipfs"] = 100;

            // Create a comment with a CID that doesn't exist or will time out
            const nonExistentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // Random CID that doesn't exist

            const sub = await plebbit.createSubplebbit({ address: subplebbitAddressOfFixture });

            // Override the pageCid to use our non-existent CID
            sub.moderation.pageCids.pendingApproval = nonExistentCid;

            try {
                // This should time out
                await sub.moderation.getPage(nonExistentCid);
                expect.fail("Should have timed out");
            } catch (e) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(e.code).to.equal("ERR_FAILED_TO_FETCH_PAGE_IPFS_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                        expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
                } else {
                    expect(e.code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
                }
            }
            await plebbit.destroy();
        });
    });
});
