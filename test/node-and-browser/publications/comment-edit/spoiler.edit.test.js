import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { verifyCommentIpfs, verifyCommentUpdate } from "../../../../dist/node/signer/signatures.js";
import { describe, it } from "vitest";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent(`Authors can mark their own comment as spoiler - ${config.name}`, async () => {
        let plebbit, authorPost;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            authorPost = await publishRandomPost(subplebbitAddress, plebbit);
            await authorPost.update();
        });

        after(async () => {
            await authorPost.stop();
        });

        it(`Regular author can't mark another author comment as spoiler`, async () => {
            const spoilerEdit = await plebbit.createCommentEdit({
                subplebbitAddress: authorPost.subplebbitAddress,
                commentCid: authorPost.cid,
                spoiler: true,
                signer: await plebbit.createSigner()
            });
            await publishWithExpectedResult(spoilerEdit, false, messages.ERR_COMMENT_EDIT_CAN_NOT_EDIT_COMMENT_IF_NOT_ORIGINAL_AUTHOR);
        });

        it.sequential(`Author can mark their own comment as spoiler`, async () => {
            expect([false, undefined]).to.include(authorPost.spoiler);

            const spoilerEdit = await plebbit.createCommentEdit({
                subplebbitAddress: authorPost.subplebbitAddress,
                commentCid: authorPost.cid,
                spoiler: true,
                signer: authorPost.signer,
                reason: "Author marking their own comment as spoiler"
            });
            await publishWithExpectedResult(spoilerEdit, true);
        });
        it.sequential(`A new CommentUpdate is published with spoiler=true`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: authorPost, predicate: () => authorPost.spoiler === true });
            expect(authorPost.edit.spoiler).to.be.true;
            expect(authorPost.raw.commentUpdate.reason).to.be.undefined;
            expect(authorPost.raw.commentUpdate.spoiler).to.be.undefined;
            expect(authorPost.raw.commentUpdate.edit).to.exist;
            expect(authorPost.raw.commentUpdate.edit.reason).to.equal("Author marking their own comment as spoiler");
            expect(authorPost.raw.commentUpdate.edit.spoiler).to.be.true;

            expect(authorPost.reason).to.be.undefined; // reason is only for mods editing other authors' posts
            expect(authorPost.edit.reason).to.equal("Author marking their own comment as spoiler");

            expect(authorPost.spoiler).to.be.true;
        });

        it(`spoiler=true appears in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit({ address: authorPost.subplebbitAddress });
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(authorPost.cid, sub.posts);
            expect(commentInPage.spoiler).to.be.true;
        });

        it(`The new Comment with spoiler=true has valid signature`, async () => {
            const recreatedPost = await plebbit.createComment({ cid: authorPost.cid });
            await recreatedPost.update();
            await resolveWhenConditionIsTrue({ toUpdate: recreatedPost, predicate: () => typeof recreatedPost.updatedAt === "number" });

            await recreatedPost.stop();
            expect(recreatedPost.spoiler).to.be.true;

            const commentIpfsValidity = await verifyCommentIpfs({
                comment: recreatedPost.toJSONIpfs(),
                resolveAuthorAddresses: true,
                clientsManager: recreatedPost._clientsManager,
                overrideAuthorAddressIfInvalid: false
            });
            expect(commentIpfsValidity).to.deep.equal({ valid: true });

            const commentUpdateValidity = await verifyCommentUpdate({
                update: recreatedPost.raw.commentUpdate,
                resolveAuthorAddresses: true,
                clientsManager: recreatedPost._clientsManager,
                subplebbit: { address: recreatedPost.subplebbitAddress },
                comment: recreatedPost,
                overrideAuthorAddressIfInvalid: false,
                validatePages: true,
                validateUpdateSignature: true
            });
            expect(commentUpdateValidity).to.deep.equal({ valid: true });
        });

        it.sequential(`Author can unspoiler their own comment`, async () => {
            const unspoilerEdit = await plebbit.createCommentEdit({
                subplebbitAddress: authorPost.subplebbitAddress,
                commentCid: authorPost.cid,
                spoiler: false,
                signer: authorPost.signer,
                reason: "An author unspoilering their own comment"
            });
            await publishWithExpectedResult(unspoilerEdit, true);
        });
        it.sequential(`A new CommentUpdate is published with spoiler=false`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: authorPost, predicate: () => authorPost.spoiler === false });
            expect(authorPost.edit.spoiler).to.be.false;
            expect(authorPost.raw.commentUpdate.reason).to.be.undefined;
            expect(authorPost.raw.commentUpdate.spoiler).to.be.undefined;
            expect(authorPost.raw.commentUpdate.edit).to.exist;
            expect(authorPost.raw.commentUpdate.edit.reason).to.equal("An author unspoilering their own comment");
            expect(authorPost.raw.commentUpdate.edit.spoiler).to.be.false;

            expect(authorPost.edit.reason).to.equal("An author unspoilering their own comment");
            expect(authorPost.reason).to.be.undefined;

            expect(authorPost.spoiler).to.be.false;
        });

        it(`spoiler=false appears pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit({ address: authorPost.subplebbitAddress });
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(authorPost.cid, sub.posts);
            expect(commentInPage.spoiler).to.be.false;
        });
    });

    describe.concurrent(`Mods marking their own comment as spoiler - ${config.name}`, async () => {
        let plebbit, modPost;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer });
            await modPost.update();
        });

        after(async () => {
            await modPost.stop();
            await plebbit.destroy();
        });

        it.sequential(`Mod can mark their own comment as spoiler`, async () => {
            const spoilerEdit = await plebbit.createCommentEdit({
                subplebbitAddress: modPost.subplebbitAddress,
                commentCid: modPost.cid,
                spoiler: true,
                signer: roles[2].signer,
                reason: "Mod marking their own comment as spoiler"
            });
            await publishWithExpectedResult(spoilerEdit, true);
        });

        it.sequential(`A new CommentUpdate is published with spoiler=true`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: modPost, predicate: () => modPost.spoiler === true });
            expect(modPost.edit.spoiler).to.be.true;
            expect(modPost.raw.commentUpdate.reason).to.be.undefined;
            expect(modPost.raw.commentUpdate.spoiler).to.be.undefined;
            expect(modPost.raw.commentUpdate.edit).to.exist;
            expect(modPost.raw.commentUpdate.edit.reason).to.equal("Mod marking their own comment as spoiler");
            expect(modPost.raw.commentUpdate.edit.spoiler).to.be.true;

            expect(modPost.reason).to.be.undefined; // reason is defined only when it's a mod editing other authors' posts
            expect(modPost.edit.reason).to.equal("Mod marking their own comment as spoiler");
            expect(modPost.spoiler).to.be.true;
        });

        it(`spoiler=true appears in pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit({ address: modPost.subplebbitAddress });
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(modPost.cid, sub.posts);
            expect(commentInPage.spoiler).to.be.true;
        });

        it.sequential(`Mod can unspoiler their own comment`, async () => {
            const unspoilerEdit = await plebbit.createCommentEdit({
                subplebbitAddress: modPost.subplebbitAddress,
                commentCid: modPost.cid,
                spoiler: false,
                signer: roles[2].signer,
                reason: "Mod unspoilering their own comment"
            });
            await publishWithExpectedResult(unspoilerEdit, true);
        });

        it.sequential(`A new CommentUpdate is published with spoiler=false`, async () => {
            await resolveWhenConditionIsTrue({ toUpdate: modPost, predicate: () => modPost.spoiler === false });
            expect(modPost.edit.spoiler).to.be.false;
            expect(modPost.raw.commentUpdate.reason).to.be.undefined;
            expect(modPost.raw.commentUpdate.spoiler).to.be.undefined;
            expect(modPost.raw.commentUpdate.edit).to.exist;
            expect(modPost.raw.commentUpdate.edit.reason).to.equal("Mod unspoilering their own comment");
            expect(modPost.raw.commentUpdate.edit.spoiler).to.be.false;

            expect(modPost.reason).to.be.undefined;
            expect(modPost.edit.reason).to.equal("Mod unspoilering their own comment");
            expect(modPost.spoiler).to.be.false;
        });

        it(`spoiler=false appears pages of subplebbit`, async () => {
            const sub = await plebbit.getSubplebbit({ address: modPost.subplebbitAddress });
            const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(modPost.cid, sub.posts);
            expect(commentInPage.spoiler).to.be.false;
        });
    });
});
