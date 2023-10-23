const Plebbit = require("../../../dist/node");
const { verifyPage } = require("../../../dist/node/signer/signatures");
const { messages } = require("../../../dist/node/errors");
const { expect } = require("chai");
const signers = require("../../fixtures/signers");
const lodash = require("lodash");
const { commentValidationCache, commentUpdateValidationCache } = require("../../../dist/node/constants");

const { mockPlebbit } = require("../../../dist/node/test/test-util");

const subAddress = "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR";

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const verifyPageJsonAlongWithObject = async (pageJson, plebbit, subplebbit, parentCid, overrideAuthorAddressIsInvalid) => {
    commentValidationCache.clear();
    commentUpdateValidationCache.clear();
    const pageObjRes = await verifyPage(
        JSON.parse(JSON.stringify(pageJson)),
        plebbit.resolveAuthorAddresses,
        plebbit._clientsManager,
        subplebbit.address,
        parentCid,
        overrideAuthorAddressIsInvalid
    );
    commentValidationCache.clear();
    commentUpdateValidationCache.clear();
    const pageJsonRes = await verifyPage(
        pageJson,
        plebbit.resolveAuthorAddresses,
        plebbit._clientsManager,
        subplebbit.address,
        parentCid,
        overrideAuthorAddressIsInvalid
    );
    commentValidationCache.clear();
    commentUpdateValidationCache.clear();
    expect(pageObjRes).to.deep.equal(pageJsonRes);
    return pageObjRes;
};

//prettier-ignore
if (!process.env["USE_RPC"]) // RPC tests don't need to run this because clients of RPC trust RPC response and won't validate
describe(`verify pages`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(subAddress);
    });

    it(`Can validate page from live subplebbit`, async () => {
        const page = JSON.parse(await plebbit.fetchCid(subplebbit.posts.pageCids.new, plebbit));
        const pageVerification = await verifyPageJsonAlongWithObject(page, plebbit, subplebbit, undefined);
        expect(pageVerification).to.deep.equal({ valid: true });
    });

    it(`Page from previous plebbit-js versions can be validated`, async () => {
        const page = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
        const verification = await verifyPageJsonAlongWithObject(page, plebbit, subplebbit, undefined);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyPage will validate a page with comment.author.address (domain) that resolves to address different than author's. It will also override the domain with actual address (overrideAuthorAddress=true)`, async () => {
        // verifyPage would override the incorrect domain
        const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
        const commentWithDomainAddressIndex = invalidPage.comments.findIndex((comment) =>
            plebbit.resolver.isDomain(comment.comment.author.address)
        );
        expect(commentWithDomainAddressIndex).to.be.greaterThanOrEqual(0);

        const tempPlebbit = await mockPlebbit();

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
        const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
        const commentWithDomainAddressIndex = invalidPage.comments.findIndex((comment) =>
            plebbit.resolver.isDomain(comment.comment.author.address)
        );
        expect(commentWithDomainAddressIndex).to.be.greaterThanOrEqual(0);

        const tempPlebbit = await mockPlebbit();

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
            const page = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const verificaiton = await verifyPageJsonAlongWithObject(page, plebbit, subplebbit, undefined);
            expect(verificaiton).to.deep.equal({ valid: true });
        });

        // TODO when comment.flair is implemented
        it(`comment.flair (original)`);
        it("comment.content (author has never modified comment.content before))", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithNoEditIndex = invalidPage.comments.findIndex((comment) => !comment.update.edit?.content);
            invalidPage.comments[commentWithNoEditIndex].comment.content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`comment.content (when author has modified comment.content before)`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithEditIndex = invalidPage.comments.findIndex((comment) => comment.update.edit?.content);
            expect(commentWithEditIndex).to.be.greaterThanOrEqual(commentWithEditIndex);
            invalidPage.comments[commentWithEditIndex].comment.content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`commentUpdate.edit.content`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithEditIndex = invalidPage.comments.findIndex((comment) => comment.update.edit?.content);
            invalidPage.comments[commentWithEditIndex].update.edit.content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`commentUpdate.edit.spoiler`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithSpoilerIndex = invalidPage.comments.findIndex((comment) => comment.update.edit?.spoiler);
            expect(commentWithSpoilerIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithSpoilerIndex].update.edit.spoiler =
                !invalidPage.comments[commentWithSpoilerIndex].update.edit.spoiler;
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`commentUpdate.edit.deleted`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithDeletedIndex = invalidPage.comments.findIndex((comment) => comment.update.edit);
            expect(commentWithDeletedIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithDeletedIndex].update.edit.deleted = !Boolean(
                invalidPage.comments[commentWithDeletedIndex].update.edit.deleted
            );
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`comment.link`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithLinkIndex = invalidPage.comments.findIndex((comment) => comment.comment.link);
            expect(commentWithLinkIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithLinkIndex].comment.link = "https://differentLinkzz.com";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`comment.parentCid`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithRepliesIndex = invalidPage.comments.findIndex((comment) => comment.update.replyCount > 0);
            expect(commentWithRepliesIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithRepliesIndex].update.replies.pages.topAll.comments[0].comment.parentCid += "123"; // Should invalidate page
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_PARENT_CID_NOT_AS_EXPECTED });
        });
        it(`comment.subplebbitAddress`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].comment.subplebbitAddress += "1234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB });
        });
        it("comment.timestamp", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].comment.timestamp += 1;
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`comment.author.address (ed25519)`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].comment.author.address = "12D3KooWJJcSwMHrFvsFL7YCNDLD93kBczEfkHpPNdxcjZwR2X2Y"; // Random address
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE });
        });
        it(`comment.author.previousCommentCid`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].comment.author.previousCommentCid += "1";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`comment.author.displayName`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].comment.author.displayName += "1";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("comment.author.wallets", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithWalletsIndex = invalidPage.comments.findIndex((comment) => comment.comment.author.wallets);
            expect(commentWithWalletsIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithWalletsIndex].comment.author.wallets += "12234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("comment.author.avatar", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithAvatarIndex = invalidPage.comments.findIndex((comment) => comment.comment.author.avatar);
            expect(commentWithAvatarIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithAvatarIndex].comment.author.avatar.id += "12234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subplebbit, undefined);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
    });
});
