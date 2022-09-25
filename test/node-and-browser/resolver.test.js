const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

let plebbit;
const subplebbitAddress = signers[0].address;
const mockComments = [];

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("Comments with Authors as domains", async () => {
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
    });
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

            mockPost.once("challengeverification", async (challengeVerificationMessage, updatedComment) => {
                expect(updatedComment.author.address).to.equal("plebbit.eth");
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                mockComments.push(updatedComment);

                resolve();
            });
        });
    });

    it(`.publish() throws error when signer points to a different address than plebbit-author-address`, async () => {
        await assert.isRejected(
            plebbit.createComment({
                author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.eth" },
                signer: signers[7], // plebbit.eth resolves to signers[6], this should give us an error
                content: `Mock post - ${Date.now()}`,
                title: "Mock post title",
                subplebbitAddress: subplebbitAddress
            })
        );
    });

    it(`challengeverification fails to pass if plebbit-author-address points to a different address than signer`, async () => {
        return new Promise(async (resolve) => {
            // There are two mocks of resovleAuthorAddressIfNeeded, one return undefined on testgibbreish.eth (server side) and this one returns signers[6]
            // The purpose is to test whether server rejects publications that has different plebbit-author-address and signer address
            plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
                if (authorAddress === "testgibbreish.eth") return signers[6].address;
                return authorAddress;
            };
            const mockPost = await plebbit.createComment({
                author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
                signer: signers[6],
                content: `Mock comment - ${Date.now()}`,
                title: "Mock post Title",
                subplebbitAddress: subplebbitAddress
            });

            await mockPost.publish();
            expect(mockPost.author.address).to.equal("testgibbreish.eth");

            mockPost.once("challengeverification", async (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
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
