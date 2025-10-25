import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    getAvailablePlebbitConfigsToTestAgainst,
    iterateThroughPagesToFindCommentInParentPagesInstance
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { timestamp } from "../../../../dist/node/util.js";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe(`Banning authors`, async () => {
        let plebbit, commentToBeBanned, authorBanExpiresAt, reasonOfBan;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            commentToBeBanned = await publishRandomPost(subplebbitAddress, plebbit);
            await commentToBeBanned.update();
            authorBanExpiresAt = timestamp() + 10; // Ban stays for 10 seconds
            reasonOfBan = "Just so " + Date.now();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Mod can ban an author for a comment`, async () => {
            const banCommentMod = await plebbit.createCommentModeration({
                subplebbitAddress: commentToBeBanned.subplebbitAddress,
                commentCid: commentToBeBanned.cid,
                commentModeration: {
                    author: { banExpiresAt: authorBanExpiresAt },
                    reason: reasonOfBan
                },
                signer: roles[2].signer
            });
            expect(banCommentMod.commentModeration.author.banExpiresAt).to.equal(authorBanExpiresAt);
            await publishWithExpectedResult(banCommentMod, true);
        });

        it(`Banned author can't publish`, async () => {
            const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, false, {
                signer: commentToBeBanned.signer
            });
            await publishWithExpectedResult(newCommentByBannedAuthor, false, messages.ERR_AUTHOR_IS_BANNED);
        });

        it(`A new CommentUpdate with comment.author.banExpiresAt is published`, async () => {
            await resolveWhenConditionIsTrue(
                {
                    toUpdate: commentToBeBanned,
                    predicate: () => typeof commentToBeBanned.author.subplebbit?.banExpiresAt === "number",
                }
            );
            expect(commentToBeBanned.author.subplebbit.banExpiresAt).to.equals(authorBanExpiresAt);
            expect(commentToBeBanned.reason).to.equal(reasonOfBan);
        });

        it(`author.banExpires is included in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit(commentToBeBanned.subplebbitAddress);
            const postInSubplebbitPage = await iterateThroughPagesToFindCommentInParentPagesInstance(commentToBeBanned.cid, sub.posts);
            expect(postInSubplebbitPage.author.subplebbit.banExpiresAt).to.be.a("number");
        });

        it(`Regular author can't ban another author`, async () => {
            const tryToBanComment = await publishRandomPost(subplebbitAddress, plebbit);

            const banCommentEdit = await plebbit.createCommentModeration({
                subplebbitAddress: tryToBanComment.subplebbitAddress,
                commentCid: tryToBanComment.cid,
                commentModeration: { author: { banExpiresAt: authorBanExpiresAt + 1000 } },
                signer: await plebbit.createSigner()
            });
            await publishWithExpectedResult(banCommentEdit, false, messages.ERR_COMMENT_MODERATION_ATTEMPTED_WITHOUT_BEING_MODERATOR);
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
});
