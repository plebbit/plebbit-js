import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    addStringToIpfs,
    itSkipIfRpc,
    isPlebbitFetchingUsingGateways
} from "../../../../dist/node/test/test-util.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { describe, it } from "vitest";
const subplebbitSigner = signers[0];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent(`plebbit.getComment - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });
        it("post props are loaded correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            expect(subplebbit.lastPostCid).to.be.a("string"); // Part of setting up test-server.js to publish a test post
            const expectedPostProps = JSON.parse(await plebbit.fetchCid(subplebbit.lastPostCid));
            const loadedPost = await plebbit.getComment(subplebbit.lastPostCid);
            expect(loadedPost.author.subplebbit).to.be.undefined;

            // make sure these generated props are the same as the instance one
            expectedPostProps.author.shortAddress = loadedPost.author.shortAddress;
            expectedPostProps.cid = loadedPost.cid;

            for (const key of Object.keys(expectedPostProps))
                expect(deterministicStringify(expectedPostProps[key])).to.equal(deterministicStringify(loadedPost[key]));
        });

        it("reply props are loaded correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            const reply = subplebbit.posts.pages.hot.comments.find((comment) => comment.replies).replies.pages.best.comments[0];
            expect(reply).to.exist;
            const expectedReplyProps = JSON.parse(await plebbit.fetchCid(reply.cid));
            expect(expectedReplyProps.postCid).to.be.a("string");
            expect(expectedReplyProps.postCid).to.equal(expectedReplyProps.parentCid);
            expect(expectedReplyProps.protocolVersion).to.be.a("string");
            expect(expectedReplyProps.depth).to.equal(1);
            expect(expectedReplyProps.subplebbitAddress).to.equal(subplebbit.address);
            expect(expectedReplyProps.timestamp).to.be.a("number");
            expect(expectedReplyProps.signature).to.be.a("object");
            expect(expectedReplyProps.author).to.be.a("object");
            expect(expectedReplyProps.author.address).to.be.a("string");
            expect(expectedReplyProps.protocolVersion).to.be.a("string");
            expectedReplyProps.cid = reply.cid;
            if (!expectedReplyProps.author.address.includes("."))
                // only shorten address when it's not a domain
                expectedReplyProps.author.shortAddress = expectedReplyProps.author.address.slice(8).slice(0, 12);
            else expectedReplyProps.author.shortAddress = expectedReplyProps.author.address;

            const loadedReply = await plebbit.getComment(reply.cid);
            expect(loadedReply.constructor.name).to.equal("Comment");
            if (loadedReply.author.subplebbit) delete loadedReply.author.subplebbit; // If it's running on RPC then it will fetch both CommentIpfs and CommentUpdate
            for (const key of Object.keys(expectedReplyProps))
                expect(deterministicStringify(expectedReplyProps[key])).to.equal(deterministicStringify(loadedReply[key]));
        });

        it(`plebbit.getComment is not fetching comment updates in background after fulfilling its promise`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            const comment = await plebbit.getComment(loadedSubplebbit.posts.pages.hot.comments[0].cid);
            let updatedHasBeenCalled = false;
            comment.updateOnce = comment._setUpdatingState = async () => {
                updatedHasBeenCalled = true;
            };
            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 2));
            expect(updatedHasBeenCalled).to.be.false;
        });

        it(`plebbit.getComment should throw immeditely if it finds a non retriable error`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);

            const commentIpfsOfInvalidSignature = JSON.parse(await plebbit.fetchCid(subplebbit.posts.pages.hot.comments[0].cid)); // comment ipfs

            commentIpfsOfInvalidSignature.content += "1234"; // make signature invalid
            const commentIpfsInvalidSignatureCid = await addStringToIpfs(JSON.stringify(commentIpfsOfInvalidSignature));

            try {
                await plebbit.getComment(commentIpfsInvalidSignatureCid);
                expect.fail("should not succeed");
            } catch (e) {
                expect(e.code).to.equal("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID");
            }
        });

        itSkipIfRpc(`plebbit.getComment times out if commentCid does not exist`, async () => {
            const commentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // random cid doesn't exist anywhere
            const customPlebbit = await config.plebbitInstancePromise();
            customPlebbit._timeouts["comment-ipfs"] = 100;
            try {
                await customPlebbit.getComment(commentCid);
                expect.fail("should not succeed");
            } catch (e) {
                if (isPlebbitFetchingUsingGateways(customPlebbit)) {
                    expect(e.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS");
                    expect(e.details.gatewayToError["http://localhost:18080"].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
                } else expect(e.code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
            }
            await customPlebbit.destroy();
        });
    });
});
