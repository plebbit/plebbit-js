const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../dist/node/errors");

let plebbit, subplebbit;
const subplebbitAddress = signers[0].address;
const mockComments = [];
if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

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
    subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
});

describe("Comments with Authors as domains", async () => {
    it(`post.author.address resolves correctly for author plebbit.eth `, async () => {
        return new Promise(async (resolve) => {
            // I've mocked plebbit.resolver.resolveAuthorAddressIfNeeded to return signers[6] address for plebbit.eth
            const mockPost = await plebbit.createComment({
                author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.eth" },
                signer: signers[6],
                content: `Mock post - ${Date.now()}`,
                title: "Mock post title",
                subplebbitAddress: subplebbitAddress
            });

            await mockPost.publish();
            expect(mockPost.author.address).to.equal("plebbit.eth");
            expect(await plebbit.resolver.resolveAuthorAddressIfNeeded(mockPost.author.address)).to.equal(signers[6].address);

            mockPost.once("challengeverification", async (challengeVerificationMessage, _) => {
                expect(mockPost.author.address).to.equal("plebbit.eth");
                expect(await plebbit.resolver.resolveAuthorAddressIfNeeded(mockPost.author.address)).to.equal(signers[6].address);
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
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "testgibbreish.eth" ? signers[6].address : authorAddress;
        const mockPost = await tempPlebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
            signer: signers[6],
            content: `Mock comment - ${Date.now()}`,
            title: "Mock post Title",
            subplebbitAddress
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
        plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
            if (authorAddress === "plebbit.eth") return signers[7].address;
            return authorAddress;
        };
        // verifyPublication in getComment should overwrite author.address to derived address
        const post = await plebbit.getComment(mockComments[mockComments.length - 1].cid);
        expect(post.author.address).to.equal(signers[6].address);
    });
});

describe(`Vote with authors as domains`, async () => {
    it(`Subplebbit rejects a Vote with author.address (domain) that resolves to a different signer`, async () => {
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "testgibbreish.eth" ? signers[6].address : authorAddress;
        const vote = await tempPlebbit.createVote({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
            signer: signers[6],
            commentCid: subplebbit.lastPostCid,
            vote: -1,
            subplebbitAddress
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
