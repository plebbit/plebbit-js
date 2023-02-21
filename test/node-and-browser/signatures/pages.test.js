const { verifyPage } = require("../../../dist/node/signer/signatures");
const { messages } = require("../../../dist/node/errors");
const { expect } = require("chai");
const signers = require("../../fixtures/signers");
const { Page } = require("../../../dist/node/pages");
const lodash = require("lodash");

const Plebbit = require("../../../dist/node");
const { mockPlebbit } = require("../../../dist/node/test/test-util");

const subAddress = "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR";

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const verifyPageJsonAlongWithObject = async (pageJson, plebbit, subplebbitAddress) => {
    const pageObjRes = await verifyPage(new Page(JSON.parse(JSON.stringify(pageJson))), plebbit, subplebbitAddress);
    const pageJsonRes = await verifyPage(pageJson, plebbit, subplebbitAddress);
    expect(pageObjRes).to.deep.equal(pageJsonRes);
    return pageObjRes;
};

describe(`verify pages`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(subAddress);
    });

    it(`Can validate page from live subplebbit`, async () => {
        const page = subplebbit.posts.pages.hot;
        const pageVerification = await verifyPageJsonAlongWithObject(page, plebbit, subplebbit.address);
        expect(pageVerification).to.deep.equal({ valid: true });
    });

    it(`Page from previous plebbit-js versions can be validated`, async () => {
        const page = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
        const verification = await verifyPageJsonAlongWithObject(page, plebbit, subAddress);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyPage will validate a page with comment.author.address (domain) that resolves to address different than author's. It will also override the domain with actual address`, async () => {
        // verifyPage would override the incorrect domain
        const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
        const commentWithDomainAddressIndex = invalidPage.comments.findIndex((comment) =>
            plebbit.resolver.isDomain(comment.author.address)
        );
        expect(commentWithDomainAddressIndex).to.be.greaterThanOrEqual(0);

        const tempPlebbit = await Plebbit(plebbit);

        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === invalidPage.comments[commentWithDomainAddressIndex].author.address ? signers[3].address : authorAddress; // Resolve to wrong address intentionally. Correct address would be signers[6].address

        const verification = await verifyPageJsonAlongWithObject(invalidPage, tempPlebbit, subAddress); // comments[commentWithDomainAddressIndex] author address should be modified after
        expect(verification).to.deep.equal({ valid: true });
        expect(invalidPage.comments[commentWithDomainAddressIndex].author.address).to.equal(signers[6].address);
    });

    describe(`A sub owner changing any of comment fields in page will invalidate`, async () => {
        before(async () => {
            const page = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const verificaiton = await verifyPageJsonAlongWithObject(page, plebbit, subAddress);
            expect(verificaiton).to.deep.equal({ valid: true });
        });

        // TODO when comment.flair is implemented
        it(`flair (original)`);
        it("content (author has never modified comment.content before))", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithNoEditIndex = invalidPage.comments.findIndex((comment) => !comment.edit?.content);
            invalidPage.comments[commentWithNoEditIndex].content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`content (when author has modified comment.content before)`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithEditIndex = invalidPage.comments.findIndex((comment) => comment.edit?.content);
            invalidPage.comments[commentWithEditIndex].content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT });
        });

        it(`edit.content`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithEditIndex = invalidPage.comments.findIndex((comment) => comment.edit?.content);
            invalidPage.comments[commentWithEditIndex].edit.content = "Content modified by sub illegally";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`link`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithLinkIndex = invalidPage.comments.findIndex((comment) => comment.link);
            invalidPage.comments[commentWithLinkIndex].link = "https://differentLinkzz.com";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`parentCid`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithRepliesIndex = invalidPage.comments.findIndex((comment) => comment.replyCount > 0);
            invalidPage.comments[commentWithRepliesIndex].replies.pages.topAll.comments[0].parentCid += "123"; // Should invalidate page
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_PARENT_CID_NOT_AS_EXPECTED });
        });
        it(`subplebbitAddress`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].subplebbitAddress += "1234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB });
        });
        it("timestamp", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].timestamp += 1;
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`author.address (ed25519)`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].author.address = "12D3KooWJJcSwMHrFvsFL7YCNDLD93kBczEfkHpPNdxcjZwR2X2Y"; // Random address
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE });
        });
        it(`author.previousCommentCid`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].author.previousCommentCid += "1";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`author.displayName`, async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            invalidPage.comments[0].author.displayName += "1";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("author.wallets", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithWalletsIndex = invalidPage.comments.findIndex((comment) => comment.author.wallets);
            expect(commentWithWalletsIndex).to.be.greaterThanOrEqual(0);
            invalidPage.comments[commentWithWalletsIndex].author.wallets += "12234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("author.avatar", async () => {
            const invalidPage = lodash.cloneDeep(require("../../fixtures/valid_page.json"));
            const commentWithAvatarIndex = invalidPage.comments.findIndex((comment) => comment.author.avatar);
            invalidPage.comments[commentWithAvatarIndex].author.avatar.id += "12234";
            const verification = await verifyPageJsonAlongWithObject(invalidPage, plebbit, subAddress);
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
    });
});
