const signers = require("../../fixtures/signers");
const { mockPlebbit, generateMockPost, publishRandomPost, publishWithExpectedResult } = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { timestamp } = require("../../../dist/node/util");

const subplebbitAddress = signers[0].address;
const updateInterval = 300;
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
        authorBanExpiresAt = timestamp() + 6; // Ban stays for six seconds
    });

    after(async () => {
        await commentToBeBanned.stop();
    });

    it(`Mod can ban an author for a comment`, async () => {
        const modSigner = roles[2].signer;
        const banCommentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeBanned.subplebbitAddress,
            commentCid: commentToBeBanned.cid,
            commentAuthor: { banExpiresAt: authorBanExpiresAt },
            signer: modSigner
        });
        expect(banCommentEdit.commentAuthor.banExpiresAt).to.equal(authorBanExpiresAt);
        await publishWithExpectedResult(banCommentEdit, true);
        await new Promise((resolve) => commentToBeBanned.once("update", resolve));
        expect(commentToBeBanned.author.banExpiresAt).to.equals(authorBanExpiresAt);
        const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, commentToBeBanned.signer);
        await publishWithExpectedResult(newCommentByBannedAuthor, false, messages.ERR_AUTHOR_IS_BANNED);
    });

    it(`Banned author can publish after authorBanExpiresAt ends`, async () => {
        const waitTillAuthorBanExpiresEnds = (resolve) => {
            if (timestamp() > authorBanExpiresAt) resolve();
            else setTimeout(() => waitTillAuthorBanExpiresEnds(resolve), 100);
        };
        await new Promise(waitTillAuthorBanExpiresEnds);
        expect(timestamp()).to.be.greaterThan(authorBanExpiresAt);
        const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, commentToBeBanned.signer);
        await publishWithExpectedResult(newCommentByBannedAuthor, true);
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
});
