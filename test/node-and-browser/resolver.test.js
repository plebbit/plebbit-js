const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../dist/node/errors");
const { mockPlebbit, publishWithExpectedResult, publishRandomPost } = require("../../dist/node/test/test-util");

const mockComments = [];
if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("Comments with Authors as domains", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Sub accepts posts with author.address as a domain that resolves to comment signer `, async () => {
        // I've mocked plebbit.resolver.resolveAuthorAddressIfNeeded to return signers[6] address for plebbit.eth
        const mockPost = await plebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.eth" },
            signer: signers[6],
            content: `Mock post - ${Date.now()}`,
            title: "Mock post title",
            subplebbitAddress: signers[0].address
        });
        expect(await plebbit._clientsManager.resolveAuthorAddressIfNeeded(mockPost.author.address)).to.equal(signers[6].address);

        expect(mockPost.author.address).to.equal("plebbit.eth");

        await publishWithExpectedResult(mockPost, true);

        expect(mockPost.author.address).to.equal("plebbit.eth");
        expect(mockPost.ipnsKeyName).to.be.undefined;
        mockComments.push(mockPost);
    });

    it(`Subplebbit rejects a comment if plebbit-author-address points to a different address than signer`, async () => {
        // There are two mocks of resovleAuthorAddressIfNeeded, one return undefined on testgibbreish.eth (server side) and this one returns signers[6]
        // The purpose is to test whether server rejects publications that has different plebbit-author-address and signer address
        const tempPlebbit = await mockPlebbit();
        tempPlebbit.resolver._resolveEnsTxtRecord = async (authorAddress, txtRecordName) =>
            authorAddress === "testgibbreish.eth" ? signers[6].address : authorAddress;
        const mockPost = await tempPlebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
            signer: signers[6],
            content: `Mock comment - ${Date.now()}`,
            title: "Mock post Title",
            subplebbitAddress: signers[0].address
        });

        expect(mockPost.author.address).to.equal("testgibbreish.eth");

        await publishWithExpectedResult(mockPost, false, messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
        expect(mockPost.author.address).to.equal("testgibbreish.eth");
    });

    it(`getComment corrects author.address to derived address in case plebbit-author-address points to another address`, async () => {
        const tempPlebbit = await mockPlebbit();
        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = async (authorAddress) =>
            authorAddress === "plebbit.eth" ? signers[7].address : authorAddress;
        // verifyPublication in getComment should overwrite author.address to derived address
        const post = await tempPlebbit.getComment(mockComments[mockComments.length - 1].cid);
        expect(post.author.address).to.equal(signers[6].address);
    });
});

describe(`Vote with authors as domains`, async () => {
    let plebbit, subplebbit, comment;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
        comment = await publishRandomPost(subplebbit.address, plebbit, {}, false);
    });

    it(`Subplebbit rejects a Vote with author.address (domain) that resolves to a different signer`, async () => {
        const tempPlebbit = await mockPlebbit();
        tempPlebbit.resolver._resolveEnsTxtRecord = async (authorAddress, txtRecordName) =>
            authorAddress === "testgibbreish.eth" ? signers[6].address : authorAddress;
        const vote = await tempPlebbit.createVote({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
            signer: signers[6],
            commentCid: comment.cid,
            vote: -1,
            subplebbitAddress: subplebbit.address
        });
        expect(vote.author.address).to.equal("testgibbreish.eth");
        await publishWithExpectedResult(vote, false, messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
        expect(vote.author.address).to.equal("testgibbreish.eth");
    });
});
