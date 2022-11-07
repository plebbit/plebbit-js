const { verifyPage } = require("../../../dist/node/signer/signatures");
const { messages } = require("../../../dist/node/errors");
const { expect } = require("chai");
const signers = require("../../fixtures/signers");

const Plebbit = require("../../../dist/node");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const updateInterval = 100;

let subplebbit, plebbit;
before(async () => {
    plebbit = await Plebbit({
        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
        pubsubHttpClientOptions: `http://localhost:5002/api/v0`
    });
    plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
        if (authorAddress === "plebbit.eth") return signers[6].address;
        else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
        return authorAddress;
    };
    subplebbit = await plebbit.getSubplebbit(signers[0].address);
    subplebbit._updateIntervalMs = updateInterval;
    subplebbit.update();
});

after(async () => {
    await subplebbit.stop();
});

describe(`verify pages`, async () => {
    it(`Can validate page from live subplebbit`, async () => {
        const page = subplebbit.posts.pages.hot;
        const pageVerification = await verifyPage(page, plebbit, subplebbit.address);
        expect(pageVerification).to.deep.equal({ valid: true });
    });

    it(`Page from previous plebbit-js versions can be validated`, async () => {
        const page = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
        const verification = await verifyPage(page, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyPage will validate a page with comment.author.address (domain) that resolves to address different than author's. It will also override the domain with actual address`, async () => {
        // verifyPage would override the incorrect domain
        const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
        const commentWithDomainAddressIndex = invalidPage.comments.findIndex((comment) =>
            plebbit.resolver.isDomain(comment.author.address)
        );

        const tempPlebbit = await Plebbit(plebbit);

        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === invalidPage.comments[commentWithDomainAddressIndex].author.address ? signers[3] : authorAddress; // Resolve to wrong address intentionally. Correct address would be signers[6].address

        const verification = await verifyPage(invalidPage, tempPlebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c"); // comments[commentWithDomainAddressIndex] author address should be modified after
        expect(verification).to.deep.equal({ valid: true });
        expect(invalidPage.comments[commentWithDomainAddressIndex].author.address).to.equal(signers[6].address);
    });

    describe(`A sub owner changing any of comment fields in page will invalidate`, async () => {
        before(async () => {
            const page = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            expect(await verifyPage(page, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c")).to.deep.equal({ valid: true });
        });
        it("content (author has never modified comment.content before))", async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            const commentWithNoEditIndex = invalidPage.comments.findIndex((comment) => !comment.authorEdit?.content);
            invalidPage.comments[commentWithNoEditIndex].content = "Content modified by sub illegally";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`content (when author has modified comment.content before)`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            const commentWithEditIndex = invalidPage.comments.findIndex((comment) => comment.authorEdit?.content);
            invalidPage.comments[commentWithEditIndex].content = "Content modified by sub illegally";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT });
        });

        it(`authorEdit.content`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            const commentWithEditIndex = invalidPage.comments.findIndex((comment) => comment.authorEdit?.content);
            invalidPage.comments[commentWithEditIndex].authorEdit.content = "Content modified by sub illegally";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });

        it(`link`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            const commentWithLinkIndex = invalidPage.comments.findIndex((comment) => comment.link);
            invalidPage.comments[commentWithLinkIndex].link = "https://differentLinkzz.com";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`parentCid`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            const commentWithRepliesIndex = invalidPage.comments.findIndex((comment) => comment.replyCount > 0);
            invalidPage.comments[commentWithRepliesIndex].replies.pages.topAll.comments[0].parentCid += "123"; // Should invalidate page
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_PARENT_CID_NOT_AS_EXPECTED });
        });
        it(`subplebbitAddress`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            invalidPage.comments[0].subplebbitAddress += "1234";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB });
        });
        it("timestamp", async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            invalidPage.comments[0].timestamp += 1;
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`author.address`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            invalidPage.comments[0].author.address = "invalidAddress.eth";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`author.previousCommentCid`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            invalidPage.comments[0].author.previousCommentCid += "1";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it(`author.displayName`, async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            invalidPage.comments[0].author.displayName += "1";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("author.wallets", async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            const commentWithWalletsIndex = invalidPage.comments.findIndex((comment) => comment.author.wallets);
            invalidPage.comments[commentWithWalletsIndex].author.wallets += "12234";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
        it("author.avatar", async () => {
            const invalidPage = JSON.parse(JSON.stringify(require("../../fixtures/valid_page.json")));
            const commentWithAvatarIndex = invalidPage.comments.findIndex((comment) => comment.author.avatar);
            invalidPage.comments[commentWithAvatarIndex].author.avatar.id += "12234";
            const verification = await verifyPage(invalidPage, plebbit, "QmbdJpNU6cAgSXHjUNnSBrUZGBtStKPkdwKyiffqRy1x6c");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
        });
    });
});
