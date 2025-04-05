import { mockRemotePlebbit, describeSkipIfRpc } from "../../../dist/node/test/test-util.js";
import { verifyPage } from "../../../dist/node/signer/signatures.js";
import { messages } from "../../../dist/node/errors.js";
import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import * as remeda from "remeda";
import { v4 as uuidV4 } from "uuid";

import validPageIpfsFixture from "../../fixtures/valid_page.json" assert { type: "json" };

const subAddress = "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR";

const verifyPageJsonAlongWithObject = async (pageJson, plebbit, subplebbit, parentCid, overrideAuthorAddressIsInvalid) => {
    // randomize pageCid so that we don't rely on cache
    const pageObjRes = await verifyPage({
        pageCid: uuidV4(),
        page: JSON.parse(JSON.stringify(pageJson)),
        resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
        clientsManager: plebbit._clientsManager,
        subplebbit: subplebbit,
        parentComment: { cid: parentCid },
        overrideAuthorAddressIfInvalid: overrideAuthorAddressIsInvalid,
        validatePages: true,
        validateUpdateSignature: true
    });
    const pageJsonRes = await verifyPage({
        pageCid: uuidV4(),
        page: pageJson,
        resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
        clientsManager: plebbit._clientsManager,
        subplebbit: subplebbit,
        parentComment: { cid: parentCid },
        overrideAuthorAddressIfInvalid: overrideAuthorAddressIsInvalid,
        validatePages: true,
        validateUpdateSignature: true
    });
    expect(pageObjRes).to.deep.equal(pageJsonRes);
    return pageObjRes;
};

// RPC tests don't need to run this because clients of RPC trust RPC response and won't validate

describeSkipIfRpc(`verify pages`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(subAddress);
    });

    it(`Can validate page from live subplebbit`, async () => {
        const page = subplebbit._rawSubplebbitIpfs.posts.pages.hot;
        const pageVerification = await verifyPageJsonAlongWithObject(page, plebbit, subplebbit, undefined);
        expect(pageVerification).to.deep.equal({ valid: true });
    });

    it(`Page from previous plebbit-js versions can be validated`, async () => {
        const page = remeda.clone(validPageIpfsFixture);
        const verification = await verifyPageJsonAlongWithObject(page, plebbit, subplebbit, undefined);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyPage will validate a page with comment.author.address (domain) that resolves to address different than author's. It will also override the domain with actual address (overrideAuthorAddress=true)`, async () => {
        // verifyPage would override the incorrect domain
        const invalidPage = remeda.clone(validPageIpfsFixture);
        const commentWithDomainAddressIndex = invalidPage.comments.findIndex((pageComment) =>
            pageComment.comment.author.address.includes(".")
        );
        expect(commentWithDomainAddressIndex).to.be.greaterThanOrEqual(0);

        const tempPlebbit = await mockRemotePlebbit();

        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === invalidPage.comments[commentWithDomainAddressIndex].comment.author.address
                ? signers[3].address
                : authorAddress; // Resolve to wrong address intentionally. Correct address would be signers[6].address

        const overrideAuthorAddress = true;
        const verification = await verifyPageJsonAlongWithObject(invalidPage, tempPlebbit, subplebbit, undefined, overrideAuthorAddress); // comments[commentWithDomainAddressIndex] author address should be modified after
        expect(verification).to.deep.equal({ valid: true });
        expect(invalidPage.comments[commentWithDomainAddressIndex].comment.author.address).to.equal(signers[6].address);
    });

    it(`verifyPage will invalidate validate a page with comment.author.address (domain) that resolves to address different than author's (overrideAuthorAddress=false)`, async () => {
        const invalidPage = remeda.clone(validPageIpfsFixture);
        const commentWithDomainAddressIndex = invalidPage.comments.findIndex((pageComment) =>
            pageComment.comment.author.address.includes(".")
        );
        expect(commentWithDomainAddressIndex).to.be.greaterThanOrEqual(0);

        const tempPlebbit = await mockRemotePlebbit();

        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === invalidPage.comments[commentWithDomainAddressIndex].comment.author.address
                ? signers[3].address
                : authorAddress; // Resolve to wrong address intentionally. Correct address would be signers[6].address

        const overrideAuthorAddress = false;
        const verification = await verifyPageJsonAlongWithObject(invalidPage, tempPlebbit, subplebbit, undefined, overrideAuthorAddress); // comments[commentWithDomainAddressIndex] author address should be modified after
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE });
        expect(invalidPage.comments[commentWithDomainAddressIndex].comment.author.address).to.equal("plebbit.eth");
    });

    describe(`A sub owner changing any of comment fields in page will invalidate`, async () => {
        before(async () => {
            const page = remeda.clone(validPageIpfsFixture);
            const verificaiton = await verifyPageJsonAlongWithObject(page, plebbit, subplebbit, undefined);
            expect(verificaiton).to.deep.equal({ valid: true });
        });

        // TODO when comment.flair is implemented
        it(`comment.flair (original)`);
        it("comment.content (author has never modified comment.content before))", async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithNoEditIndex = invalidPage.comments.findIndex((pageComment) => !pageComment.commentUpdate.edit?.content);
            invalidPage.comments[commentWithNoEditIndex].comment.content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`comment.content (when author has modified comment.content before)`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithEditIndex = invalidPage.comments.findIndex((pageComment) => pageComment.commentUpdate.edit?.content);
            expect(commentWithEditIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithEditIndex].comment.content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`commentUpdate.edit.content`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithEditIndex = invalidPage.comments.findIndex((pageComment) => pageComment.commentUpdate.edit?.content);
            invalidPage.comments[commentWithEditIndex].commentUpdate.edit.content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`commentUpdate.edit.spoiler`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithSpoilerIndex = invalidPage.comments.findIndex((pageComment) => pageComment.commentUpdate.edit?.spoiler);
            expect(commentWithSpoilerIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithSpoilerIndex].commentUpdate.edit.spoiler =
                !invalidPage.comments[commentWithSpoilerIndex].commentUpdate.edit.spoiler;
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`commentUpdate.edit.deleted`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithDeletedIndex = invalidPage.comments.findIndex((pageComment) => pageComment.commentUpdate.edit);
            expect(commentWithDeletedIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithDeletedIndex].commentUpdate.edit.deleted = !Boolean(
                invalidPage.comments[commentWithDeletedIndex].commentUpdate.edit.deleted
            );
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`comment.link`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithLinkIndex = invalidPage.comments.findIndex((pageComment) => pageComment.comment.link);
            expect(commentWithLinkIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithLinkIndex].comment.link = "https://differentLinkzz.com";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`comment.parentCid`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithRepliesIndex = invalidPage.comments.findIndex((pageComment) => pageComment.commentUpdate.replyCount > 0);
            expect(commentWithRepliesIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithRepliesIndex].commentUpdate.replies.pages.topAll.comments[0].comment.parentCid += "123"; // Should invalidate page
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`comment.subplebbitAddress`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            invalidPage.comments[0].comment.subplebbitAddress += "1234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB });
        });
        it("comment.timestamp", async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            invalidPage.comments[0].comment.timestamp += 1;
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`comment.author.address (ed25519)`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            invalidPage.comments[0].comment.author.address = "12D3KooWJJcSwMHrFvsFL7YCNDLD93kBczEfkHpPNdxcjZwR2X2Y"; // Random address
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE });
        });
        it(`comment.author.previousCommentCid`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            invalidPage.comments[0].comment.author.previousCommentCid += "1";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`comment.author.displayName`, async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            invalidPage.comments[0].comment.author.displayName += "1";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("comment.author.wallets", async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithWalletsIndex = invalidPage.comments.findIndex((comment) => comment.comment.author.wallets);
            expect(commentWithWalletsIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithWalletsIndex].comment.author.wallets += "12234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("comment.author.avatar", async () => {
            const invalidPage = remeda.clone(validPageIpfsFixture);
            const commentWithAvatarIndex = invalidPage.comments.findIndex((comment) => comment.comment.author.avatar);
            expect(commentWithAvatarIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithAvatarIndex].comment.author.avatar.id += "12234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
    });
});
