const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../dist/node/errors");
const { mockPlebbit } = require("../../dist/node/test/test-util");

const mockComments = [];
if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("Comments with Authors as domains", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`post.author.address resolves correctly for author plebbit.eth `, async () => {
        return new Promise(async (resolve) => {
            // I've mocked plebbit.resolver.resolveAuthorAddressIfNeeded to return signers[6] address for plebbit.eth
            const mockPost = await plebbit.createComment({
                author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.eth" },
                signer: signers[6],
                content: `Mock post - ${Date.now()}`,
                title: "Mock post title",
                subplebbitAddress: await signers[0].getAddress()
            });

            await mockPost.publish();
            expect(mockPost.author.address).to.equal("plebbit.eth");
            expect(await plebbit.resolver.resolveAuthorAddressIfNeeded(mockPost.author.address)).to.equal(await signers[6].getAddress());

            mockPost.once("challengeverification", async (challengeVerificationMessage, _) => {
                expect(mockPost.author.address).to.equal("plebbit.eth");
                expect(await plebbit.resolver.resolveAuthorAddressIfNeeded(mockPost.author.address)).to.equal(
                    await signers[6].getAddress()
                );
                expect(mockPost.ipnsKeyName).to.be.undefined;
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                mockComments.push(mockPost);

                resolve();
            });
        });
    });

    it(`Subplebbit rejects a comment if plebbit-author-address points to a different address than signer`, async () => {
        // There are two mocks of resovleAuthorAddressIfNeeded, one return undefined on testgibbreish.eth (server side) and this one returns signers[6]
        // The purpose is to test whether server rejects publications that has different plebbit-author-address and signer address
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) =>
            authorAddress === "testgibbreish.eth" ? await signers[6].getAddress() : authorAddress;
        const mockPost = await tempPlebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
            signer: signers[6],
            content: `Mock comment - ${Date.now()}`,
            title: "Mock post Title",
            subplebbitAddress: await signers[0].getAddress()
        });

        await mockPost.publish();
        expect(mockPost.author.address).to.equal("testgibbreish.eth");

        await new Promise((resolve) => {
            mockPost.once("challengeverification", async (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.equal(messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
                resolve();
            });
        });
    });

    it(`getComment corrects author.address to derived address in case plebbit-author-address points to another address`, async () => {
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) =>
            authorAddress === "plebbit.eth" ? await signers[7].getAddress() : authorAddress;
        // verifyPublication in getComment should overwrite author.address to derived address
        const post = await tempPlebbit.getComment(mockComments[mockComments.length - 1].cid);
        expect(post.author.address).to.equal(await signers[6].getAddress());
    });
});

describe(`Vote with authors as domains`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(await signers[0].getAddress());
    });

    it(`Subplebbit rejects a Vote with author.address (domain) that resolves to a different signer`, async () => {
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) =>
            authorAddress === "testgibbreish.eth" ? await signers[6].getAddress() : authorAddress;
        const vote = await tempPlebbit.createVote({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
            signer: signers[6],
            commentCid: subplebbit.lastPostCid,
            vote: -1,
            subplebbitAddress: subplebbit.address
        });

        await vote.publish();
        expect(vote.author.address).to.equal("testgibbreish.eth");

        await new Promise((resolve) => {
            vote.once("challengeverification", async (challengeVerificationMessage, _) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.equal(messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);

                resolve();
            });
        });
    });
});
