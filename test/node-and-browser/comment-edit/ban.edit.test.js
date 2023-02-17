const signers = require("../../fixtures/signers");
const { mockPlebbit, generateMockPost, publishRandomPost, publishWithExpectedResult } = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { timestamp } = require("../../../dist/node/util");
const { default: waitUntil } = require("async-wait-until");

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe(`Banning authors`, async () => {
    let plebbit, commentToBeBanned, authorBanExpiresAt;

    before(async () => {
        plebbit = await mockPlebbit();
        commentToBeBanned = await publishRandomPost(subplebbitAddress, plebbit);
        await commentToBeBanned.update();
        authorBanExpiresAt = timestamp() + 30; // Ban stays for 30 seconds
    });

    after(async () => {
        await commentToBeBanned.stop();
    });

    it(`Mod can ban an author for a comment`, async () => {
        const banCommentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeBanned.subplebbitAddress,
            commentCid: commentToBeBanned.cid,
            commentAuthor: { banExpiresAt: authorBanExpiresAt },
            signer: roles[2].signer
        });
        expect(banCommentEdit.commentAuthor.banExpiresAt).to.equal(authorBanExpiresAt);
        await publishWithExpectedResult(banCommentEdit, true);
    });

    it(`Banned author can't publish`, async () => {
        const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, false, {
            signer: commentToBeBanned.signer
        });
        await publishWithExpectedResult(newCommentByBannedAuthor, false, messages.ERR_AUTHOR_IS_BANNED);
    });

    it(`A new CommentUpdate with comment.author.banExpiresAt is published`, async () => {
        await waitUntil(() => typeof commentToBeBanned.author.banExpiresAt === "number", { timeout: 200000 });
        expect(commentToBeBanned.author.banExpiresAt).to.equals(authorBanExpiresAt);
    });

    it(`Regular author can't ban another author`, async () => {
        const tryToBanComment = await publishRandomPost(subplebbitAddress, plebbit);

        const banCommentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: tryToBanComment.subplebbitAddress,
            commentCid: tryToBanComment.cid,
            commentAuthor: { banExpiresAt: authorBanExpiresAt + 1000 },
            signer: await plebbit.createSigner()
        });
        await publishWithExpectedResult(banCommentEdit, false, messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
    });

    it(`Banned author can publish after authorBanExpiresAt ends`, async () => {
        await new Promise((resolve) => setTimeout(resolve, (authorBanExpiresAt - timestamp()) * 1000.0 + 1000));
        expect(timestamp()).to.be.greaterThan(authorBanExpiresAt);
        const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, false, {
            signer: commentToBeBanned.signer
        });
        await publishWithExpectedResult(newCommentByBannedAuthor, true);
    });
});
