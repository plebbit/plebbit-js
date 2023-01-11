const signers = require("../../fixtures/signers");
const {
    mockPlebbit,
    publishRandomPost,
    generateMockComment,
    generateMockVote,
    publishRandomReply,
    publishWithExpectedResult
} = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");

const subplebbitAddress = signers[0].address;
const updateInterval = 300;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe(`Locking posts`, async () => {
    let plebbit, postToBeLocked, replyUnderPostToBeLocked;
    before(async () => {
        plebbit = await mockPlebbit();
        postToBeLocked = await publishRandomPost(subplebbitAddress, plebbit);

        await postToBeLocked.update();
        replyUnderPostToBeLocked = await publishRandomReply(postToBeLocked, plebbit);
    });
    after(async () => {
        await postToBeLocked.stop();
    });
    it(`Author can't lock their own post`, async () => {
        const lockedEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToBeLocked.subplebbitAddress,
            commentCid: postToBeLocked.cid,
            locked: true,
            signer: postToBeLocked.signer
        });
        await publishWithExpectedResult(lockedEdit, false, messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD);
    });
    it(`Regular author can't lock another author comment`, async () => {
        const lockedEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToBeLocked.subplebbitAddress,
            commentCid: postToBeLocked.cid,
            locked: true,
            signer: await plebbit.createSigner()
        });
        await publishWithExpectedResult(lockedEdit, false, messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
    });

    it(`Author can't publish a post with locked=true`);

    it(`Author can't publish a comment with locked=true`);

    it(`Mod Can't lock a reply`, async () => {
        // This is prior to locking the post
        const lockedEdit = await plebbit.createCommentEdit({
            subplebbitAddress: replyUnderPostToBeLocked.subplebbitAddress,
            commentCid: replyUnderPostToBeLocked.cid,
            locked: true,
            signer: roles[2].signer
        });
        await publishWithExpectedResult(lockedEdit, false, messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY);
    });

    it(`Mod can lock a post`, async () => {
        const lockedEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToBeLocked.subplebbitAddress,
            commentCid: postToBeLocked.cid,
            locked: true,
            moderatorReason: "To lock a post",
            signer: roles[2].signer
        });
        await publishWithExpectedResult(lockedEdit, true);
    });

    it(`A new CommentUpdate with locked=true is published`, async () => {
        await new Promise((resolve) => postToBeLocked.once("update", resolve));
        expect(postToBeLocked.locked).to.be.true;
        expect(postToBeLocked.moderatorReason).to.equal("To lock a post");
    });
    it(`subplebbit.posts includes locked post with locked=true`, async () => {
        const sub = await plebbit.getSubplebbit(postToBeLocked.subplebbitAddress);
        let lockedPostInPage = undefined;
        const isLockedInPage = async () => {
            const newPage = await sub.posts.getPage(sub.posts.pageCids.new);
            lockedPostInPage = newPage.comments.find((comment) => comment.cid === postToBeLocked.cid);
            return lockedPostInPage.locked === true;
        };
        if (!(await isLockedInPage())) {
            sub._updateIntervalMs = updateInterval;
            await sub.update();
            await new Promise((resolve) => sub.on("update", async () => (await isLockedInPage()) && resolve()));
            await sub.stop();
        }
        expect(lockedPostInPage.locked).to.be.true;
        expect(lockedPostInPage.moderatorReason).to.equal("To lock a post");
    });
    it(`Can't publish reply or vote on a locked post`, async () => {
        const [reply, vote] = [await generateMockComment(postToBeLocked, plebbit), await generateMockVote(postToBeLocked, 1, plebbit)];

        await Promise.all([reply, vote].map((pub) => publishWithExpectedResult(pub, false, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED)));
    });
    it(`Can't publish a reply or vote under a reply of a locked post`, async () => {
        const [reply, vote] = [
            await generateMockComment(replyUnderPostToBeLocked, plebbit),
            await generateMockVote(replyUnderPostToBeLocked, 1, plebbit)
        ];
        await Promise.all([reply, vote].map((pub) => publishWithExpectedResult(pub, false, messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED)));
    });
    it(`Mod can unlock a post`, async () => {
        const unlockEdit = await plebbit.createCommentEdit({
            subplebbitAddress: postToBeLocked.subplebbitAddress,
            commentCid: postToBeLocked.cid,
            locked: false,
            moderatorReason: "To unlock a post",
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unlockEdit, true);
    });
    it(`Unlocked post can receive replies and votes again`, async () => {
        const [reply, vote] = [
            await generateMockComment(replyUnderPostToBeLocked, plebbit),
            await generateMockVote(replyUnderPostToBeLocked, 1, plebbit)
        ];
        await Promise.all([reply, vote].map((pub) => publishWithExpectedResult(pub, true)));
    });
});
