import signers from "../../../fixtures/signers.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadAllPages, getRemotePlebbitConfigs, addStringToIpfs } from "../../../../dist/node/test/test-util.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const fixtureSigner = signers[0];
const subplebbitSigner = signers[0];

getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.getComment - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        it("post props are loaded correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            expect(subplebbit.lastPostCid).to.be.a("string"); // Part of setting up test-server.js to publish a test post
            const expectedPostProps = JSON.parse(await plebbit.fetchCid(subplebbit.lastPostCid));
            expectedPostProps.cid = subplebbit.lastPostCid;
            const loadedPost = await plebbit.getComment(subplebbit.lastPostCid);
            expectedPostProps.author.shortAddress = expectedPostProps.author.address.slice(8).slice(0, 12);
            for (const key of Object.keys(expectedPostProps))
                expect(deterministicStringify(expectedPostProps[key])).to.equal(deterministicStringify(loadedPost[key]));
        });

        it("comment props are loaded correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
            const comment = newComments.filter((comment) => comment.replyCount > 0)[0]?.replies?.pages?.topAll?.comments[0];
            expect(comment).to.exist;
            const expectedCommentProps = JSON.parse(await plebbit.fetchCid(comment.cid));
            expect(expectedCommentProps.postCid).to.be.a("string");
            expect(expectedCommentProps.postCid).to.equal(expectedCommentProps.parentCid);
            expect(expectedCommentProps.protocolVersion).to.be.a("string");
            expect(expectedCommentProps.depth).to.equal(1);
            expect(expectedCommentProps.subplebbitAddress).to.equal(subplebbit.address);
            expect(expectedCommentProps.timestamp).to.be.a("number");
            expect(expectedCommentProps.signature).to.be.a("object");
            expect(expectedCommentProps.author).to.be.a("object");
            expect(expectedCommentProps.author.address).to.be.a("string");
            expect(expectedCommentProps.protocolVersion).to.be.a("string");
            expectedCommentProps.cid = comment.cid;
            expectedCommentProps.author.shortAddress = expectedCommentProps.author.address.slice(8).slice(0, 12);

            const loadedComment = await plebbit.getComment(comment.cid);
            expect(loadedComment.constructor.name).to.equal("Comment");
            if (loadedComment.author.subplebbit) delete loadedComment.author.subplebbit; // If it's running on RPC then it will fetch both CommentIpfs and CommentUpdate
            for (const key of Object.keys(expectedCommentProps))
                expect(deterministicStringify(expectedCommentProps[key])).to.equal(deterministicStringify(loadedComment[key]));
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

        it(`plebbit.getComment times out if commentCid does not exist`, async () => {
            const commentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // random cid doesn't exist anywhere
            const customPlebbit = await config.plebbitInstancePromise();
            customPlebbit._clientsManager.getGatewayTimeoutMs = () => 5 * 1000; // change timeout from 1min to 5s

            try {
                await customPlebbit.getComment(commentCid);
                expect.fail("should not succeed");
            } catch (e) {
                expect(["TimeoutError", "HTTPError"]).to.include(e.name);
            }
        });
    });
});
