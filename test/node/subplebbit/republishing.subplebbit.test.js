import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    publishRandomReply,
    setExtraPropOnCommentAndSign,
    generateMockPost,
    waitTillReplyInParentPages,
    publishWithExpectedResult,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    describeSkipIfRpc,
    findCommentInPage,
    resolveWhenConditionIsTrue,
    waitTillPostInSubplebbitPages
} from "../../../dist/node/test/test-util";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

// This test file will be focused on republishing of comments/subplebbit/commentupdate/pages to the network
// if the ipfs repo is lost, the sub should re-publish everything again
// Part of that is re-constructing commentIpfs which is something will we will be testing for

describeSkipIfRpc(`Migration to a new IPFS repo`, async () => {
    let subBeforeMigration;
    let subAfterMigration;
    let plebbitDifferentIpfs;
    let remotePlebbit;
    let postWithExtraProps;
    before(async () => {
        const plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subBeforeMigration = await createSubWithNoChallenge({}, plebbit);
        await subBeforeMigration.start();
        await resolveWhenConditionIsTrue(subBeforeMigration, () => typeof subBeforeMigration.updatedAt === "number");
        const post = await publishRandomPost(subBeforeMigration.address, plebbit);
        await publishRandomReply(post, plebbit);
        // publish a post with extra prop here
        postWithExtraProps = await generateMockPost(subBeforeMigration.address, plebbit);
        const extraProps = { extraProp: "1234" };
        await setExtraPropOnCommentAndSign(postWithExtraProps, extraProps, true);

        await publishWithExpectedResult(postWithExtraProps, true);
        const reply = await publishRandomReply(postWithExtraProps, plebbit);

        await waitTillPostInSubplebbitPages(postWithExtraProps, plebbit);

        await subBeforeMigration.stop();

        plebbitDifferentIpfs = await mockPlebbit({ kuboRpcClientsOptions: ["http://localhost:15004/api/v0"] }); // Different IPFS repo

        subAfterMigration = await createSubWithNoChallenge({ address: subBeforeMigration.address }, plebbitDifferentIpfs);
        expect(subAfterMigration.updatedAt).to.equal(subBeforeMigration.updatedAt);
        await subAfterMigration.start(); // should migrate everything here
        await resolveWhenConditionIsTrue(subAfterMigration, () => subAfterMigration.updatedAt !== subBeforeMigration.updatedAt);
        await waitTillPostInSubplebbitPages(postWithExtraProps, remotePlebbit);
        await waitTillReplyInParentPages(reply, remotePlebbit);
    });
    it(`Subplebbit IPNS is republished`, async () => {
        const subLoaded = await remotePlebbit.getSubplebbit(subAfterMigration.address);
        expect(subLoaded).to.be.a("object");
        expect(subLoaded.posts).to.be.a("object");
        // If we can load the subplebbit IPNS that means it has been republished by the new IPFS repo
    });

    it(`Posts' IPFS are repinned`, async () => {
        const subLoaded = await remotePlebbit.getSubplebbit(subAfterMigration.address);
        const postFromPage = subLoaded.posts.pages.hot.comments[0];
        const postIpfs = JSON.parse(await remotePlebbit.fetchCid(postFromPage.cid));
        expect(postIpfs.subplebbitAddress).to.equal(subAfterMigration.address); // Make sure it was loaded correctly
    });

    it(`Post with extra prop can be fetched from its cid`, async () => {
        const loadedPost = await remotePlebbit.getComment(postWithExtraProps.cid);
        expect(loadedPost.extraProp).to.equal("1234");
    });

    it(`Post with extra prop retains its extra prop in pages`, async () => {
        const loadedSub = await remotePlebbit.getSubplebbit(postWithExtraProps.subplebbitAddress);
        const loadedPost = await findCommentInPage(postWithExtraProps.cid, loadedSub.posts.pageCids.new, loadedSub.posts);
        expect(loadedPost.extraProp).to.equal("1234");
    });

    it(`Comments' IPFS are repinned`, async () => {
        const subLoaded = await remotePlebbit.getSubplebbit(subAfterMigration.address);
        const postFromPage = subLoaded.posts.pages.hot.comments[0];
        const commentIpfs = JSON.parse(await remotePlebbit.fetchCid(postFromPage.replies.pages.topAll.comments[0].cid));
        expect(commentIpfs.subplebbitAddress).to.equal(subAfterMigration.address); // Make sure it was loaded correctly
    });
    it(`Comments' CommentUpdate are republished`, async () => {
        const subLoaded = await remotePlebbit.getSubplebbit(subAfterMigration.address);
        const postFromPage = subLoaded.posts.pages.hot.comments[0];

        const postWithRemotePlebbit = await remotePlebbit.createComment({ cid: postFromPage.cid });
        postWithRemotePlebbit.update();
        await new Promise((resolve) => postWithRemotePlebbit.once("update", resolve)); // CommentIpfs update
        expect(postWithRemotePlebbit.replyCount).to.be.undefined;
        await new Promise((resolve) => postWithRemotePlebbit.once("update", resolve)); // CommentUpdate update
        expect(postWithRemotePlebbit.replyCount).to.be.a("number");
        expect(postWithRemotePlebbit.upvoteCount).to.be.a("number");
        await postWithRemotePlebbit.stop();
    });
});
