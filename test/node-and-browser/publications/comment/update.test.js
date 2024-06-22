import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    mockRemotePlebbit,
    publishRandomPost,
    publishRandomReply,
    mockRemotePlebbitIpfsOnly,
    isRpcFlagOn,
    mockGatewayPlebbit
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { cleanUpBeforePublishing, verifyComment, verifyCommentUpdate } from "../../../../dist/node/signer/signatures.js";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describe(`comment.update`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`plebbit.createComment({cid}).update() fetches comment ipfs and update correctly when cid is the cid of a post`, async () => {
        const originalPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false);

        const recreatedPost = await plebbit.createComment({ cid: originalPost.cid });

        recreatedPost.update();

        await new Promise((resolve) => recreatedPost.once("update", resolve));
        // Comment ipfs props should be defined now, but not CommentUpdate
        expect(recreatedPost.updatedAt).to.be.undefined;

        expect(recreatedPost.toJSONIpfs()).to.deep.equal(originalPost.toJSONIpfs());

        await new Promise((resolve) => recreatedPost.once("update", resolve));
        await recreatedPost.stop();
        expect(recreatedPost.updatedAt).to.be.a("number");
    });

    it(`plebbit.createComment({cid}).update() fetches comment ipfs and update correctly when cid is the cid of a reply`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

        const reply = await publishRandomReply(
            subplebbit.posts.pages.hot.comments.find((post) => post.replyCount > 0),
            plebbit,
            {},
            true
        );

        const recreatedReply = await plebbit.createComment({ cid: reply.cid });

        recreatedReply.update();

        await new Promise((resolve) => recreatedReply.once("update", resolve));
        // Comment ipfs props should be defined now, but not CommentUpdate
        expect(recreatedReply.updatedAt).to.be.undefined;

        expect(recreatedReply.toJSONIpfs()).to.deep.equal(reply.toJSONIpfs());

        await new Promise((resolve) => recreatedReply.once("update", resolve));
        await recreatedReply.stop();

        expect(recreatedReply.updatedAt).to.be.a("number");
    });

    it(`comment.stop() stops comment updates`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const comment = await plebbit.createComment({ cid: subplebbit.posts.pages.hot.comments[0].cid });
        await comment.update();
        await new Promise((resolve) => comment.once("update", resolve));
        await comment.stop();
        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval + 1));
        let updatedHasBeenCalled = false;
        comment.updateOnce = comment._setUpdatingState = async () => {
            updatedHasBeenCalled = true;
        };

        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval + 1));
        expect(updatedHasBeenCalled).to.be.false;
    });

    it(`comment.update() is working as expected after calling comment.stop()`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const comment = await plebbit.createComment({ cid: subplebbit.posts.pages.hot.comments[0].cid });

        await comment.update();
        await new Promise((resolve) => comment.once("update", resolve)); // CommentIpfs Update
        await new Promise((resolve) => comment.once("update", resolve)); // CommentUpdate update

        await comment.stop();

        await comment.update();

        await publishRandomReply(comment, plebbit, {}, false);
        await new Promise((resolve) => comment.once("update", resolve));
        await comment.stop();
    });

    it(`comment.update() is working as expected after comment.publish()`, async () => {
        const post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        await post.update();
        await new Promise((resolve) => post.once("update", resolve));
        if (!post.updatedAt) await new Promise((resolve) => post.once("update", resolve));
        expect(post.updatedAt).to.be.a("number");
        await post.stop();
    });
});

const addCommentIpfsWithInvalidSignatureToIpfs = async () => {
    const plebbit = await mockRemotePlebbitIpfsOnly();
    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

    const postJson = cleanUpBeforePublishing(subplebbit.posts.pages.hot.comments[0].toJSONIpfs());

    postJson.title += "1234"; // Invalidate signature

    expect(await verifyComment(postJson, true, plebbit._clientsManager, false)).to.deep.equal({
        valid: false,
        reason: messages.ERR_SIGNATURE_IS_INVALID
    });

    const postWithInvalidSignatureCid = (
        await (await mockRemotePlebbitIpfsOnly())._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(postJson))
    ).path;

    return postWithInvalidSignatureCid;
};

const createACommentUpdateWithInvalidSignature = async () => {
    const plebbit = await mockRemotePlebbitIpfsOnly();

    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

    const invalidCommentUpdateJson = subplebbit.posts.pages.hot.comments[0]._rawCommentUpdate;

    invalidCommentUpdateJson.updatedAt += 1234; // Invalidate CommentUpdate signature

    expect(
        await verifyCommentUpdate(
            invalidCommentUpdateJson,
            true,
            plebbit._clientsManager,
            subplebbit.address,
            { cid: subplebbit.posts.pages.hot.comments[0].cid, signature: subplebbit.posts.pages.hot.comments[0].signature },
            false
        )
    ).to.deep.equal({
        valid: false,
        reason: messages.ERR_SIGNATURE_IS_INVALID
    });
    return invalidCommentUpdateJson;
};

describe(`comment.update() emits errors if needed`, async () => {
    let invalidCommentIpfsCid;
    let commentUpdateWithInvalidSignatureJson;
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        invalidCommentIpfsCid = await addCommentIpfsWithInvalidSignatureToIpfs();
        commentUpdateWithInvalidSignatureJson = await createACommentUpdateWithInvalidSignature();
    });

    it(`plebbit.createComment({cid}).update() emits error if signature of CommentIpfs is invalid - IPFS P2P`, async () => {
        // A critical error, so it shouldn't keep on updating

        const createdComment = await plebbit.createComment({ cid: invalidCommentIpfsCid });

        const ipfsStates = [];
        const updatingStates = [];
        createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
        const ipfsUrl = Object.keys(createdComment.clients.ipfsClients)[0];
        createdComment.clients.ipfsClients[ipfsUrl].on("statechange", (state) => ipfsStates.push(state));
        let updateHasBeenEmitted = false;
        createdComment.once("update", () => (updateHasBeenEmitted = true));
        await createdComment.update();

        await new Promise((resolve) =>
            createdComment.once("error", (err) => {
                expect(err.code).to.equal("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID");
                resolve();
            })
        );

        // should stop updating by itself because of the critical error

        expect(createdComment.depth).to.be.undefined; // Make sure it did not use the props from the invalid CommentIpfs
        expect(createdComment.state).to.equal("stopped");
        expect(createdComment.updatingState).to.equal("failed");
        expect(updatingStates).to.deep.equal(["fetching-ipfs", "failed"]);
        expect(ipfsStates).to.deep.equal(["fetching-ipfs", "stopped"]);
        expect(updateHasBeenEmitted).to.be.false;
    });

    it(`plebbit.createComment({cid}).update() emits error if signature of CommentIpfs is invalid - IPFS Gateways`, async () => {
        // A critical error, so it shouldn't keep on updating

        const plebbit = await mockGatewayPlebbit();

        const createdComment = await plebbit.createComment({ cid: invalidCommentIpfsCid });

        const ipfsGatewayStates = [];
        const updatingStates = [];
        createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
        const ipfsGatewayUrl = Object.keys(createdComment.clients.ipfsGateways)[0];
        createdComment.clients.ipfsGateways[ipfsGatewayUrl].on("statechange", (state) => ipfsGatewayStates.push(state));
        let updateHasBeenEmitted = false;
        createdComment.once("update", () => (updateHasBeenEmitted = true));
        await createdComment.update();

        await new Promise((resolve) =>
            createdComment.once("error", (err) => {
                expect(err.code).to.equal("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID");
                resolve();
            })
        );

        // should stop updating by itself because of the critical error

        expect(createdComment.state).to.equal("stopped");
        expect(createdComment.updatingState).to.equal("failed");
        expect(updatingStates).to.deep.equal(["fetching-ipfs", "failed"]);
        expect(ipfsGatewayStates).to.deep.equal(["fetching-ipfs", "stopped"]);
        expect(updateHasBeenEmitted).to.be.false;
    });

    if (!isRpcFlagOn())
        it(`comment.update() emit an error if CommentUpdate signature is invalid - IPFS P2P`, async () => {
            // Should emit an error as well as continue the update loop

            const createdComment = await plebbit.createComment({
                cid: commentUpdateWithInvalidSignatureJson.cid
            });

            let loadingRetries = 0;
            let errorsEmittedCount = 0;
            let didItRetryAfterEmittingError = false;
            const originalFetch = createdComment._clientsManager._fetchCidP2P.bind(createdComment._clientsManager);
            createdComment._clientsManager._fetchCidP2P = (cidOrPath) => {
                if (cidOrPath.endsWith("/update")) {
                    loadingRetries++;
                    if (errorsEmittedCount > 0) didItRetryAfterEmittingError = true;
                    return JSON.stringify(commentUpdateWithInvalidSignatureJson);
                } else return originalFetch(cidOrPath);
            };

            const ipfsStates = [];
            const ipfsUrl = Object.keys(createdComment.clients.ipfsClients)[0];
            createdComment.clients.ipfsClients[ipfsUrl].on("statechange", (state) => ipfsStates.push(state));

            let updateHasBeenEmittedWithCommentUpdate = false;
            createdComment.once("update", () => (updateHasBeenEmittedWithCommentUpdate = Boolean(createdComment.updatedAt)));
            await createdComment.update();

            await new Promise((resolve) =>
                createdComment.on("error", (err) => {
                    expect(err.code).to.equal("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID");
                    errorsEmittedCount++;
                    resolve();
                })
            );

            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 4 + 1));

            expect(createdComment.updatedAt).to.be.undefined; // Make sure it didn't use the props from the invalid CommentUpdate
            expect(createdComment.state).to.equal("updating");
            expect(createdComment.updatingState).to.equal("failed");
            expect(didItRetryAfterEmittingError).to.be.true;
            expect(updateHasBeenEmittedWithCommentUpdate).to.be.false;
            expect(loadingRetries).to.be.above(2);
            expect(errorsEmittedCount).to.greaterThanOrEqual(2);

            await createdComment.stop();

            const expectedIpfsStates = [
                "fetching-ipfs", // when loading CommentIpfs at the beginning
                "stopped",
                ...new Array(loadingRetries) // when loading CommentUpdate for ${loadingRetries} amounts
                    .fill(["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "fetching-update-ipfs", "stopped"])
                    .flat()
            ];

            expect(ipfsStates).to.deep.equal(expectedIpfsStates);
        });

    it(`comment.update() emit an error and stops updating loop if gateway responded with a CommentIpfs that's not derived from its CID`, async () => {
        const gatewayUrl = "http://localhost:13415"; // This gateway responds with content that is not equivalent to its CID
        const plebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [gatewayUrl] });

        const cid = "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"; // Gateway will respond with random content for this cid
        const createdComment = await plebbit.createComment({ cid });

        const ipfsGatewayStates = [];
        const updatingStates = [];
        createdComment.on("updatingstatechange", () => updatingStates.push(createdComment.updatingState));
        const ipfsGatewayUrl = Object.keys(createdComment.clients.ipfsGateways)[0];
        createdComment.clients.ipfsGateways[ipfsGatewayUrl].on("statechange", (state) => ipfsGatewayStates.push(state));
        let updateHasBeenEmitted = false;
        createdComment.once("update", () => (updateHasBeenEmitted = true));
        await createdComment.update();

        await new Promise((resolve) =>
            createdComment.once("error", (err) => {
                expect(err.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS");
                expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_CALCULATED_CID_DOES_NOT_MATCH");
                resolve();
            })
        );

        // should stop updating by itself because of the critical error

        expect(createdComment.state).to.equal("stopped");
        expect(createdComment.updatingState).to.equal("failed");
        expect(updatingStates).to.deep.equal(["fetching-ipfs", "failed"]);
        expect(ipfsGatewayStates).to.deep.equal(["fetching-ipfs", "stopped"]);
        expect(updateHasBeenEmitted).to.be.false;
    });

    it(`comment.update() emit an error if CommentUpdate signature is invalid - IPFS Gateways`);

    it(`comment.update() emits error and stops updating loop if CommentIpfs is an invalid json - IPFS P2P`);
    it(`comment.update() emits error and stops updating loop if CommentIpfs is an invalid json - IPFS Gateways`);

    it(`comment.update() emits error and stops updating loop if CommentIpfs is an invalid schema - IPFS P2P`);
    it(`comment.update() emits error and stops updating loop if CommentIpfs is an invalid schema - IPFS Gateways`);

    it(`comment.update() emits error if CommentUpdate is an invalid json - IPFS Gateway`);
});
