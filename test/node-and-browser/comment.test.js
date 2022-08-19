const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { timestamp } = require("../../dist/node/util");
const { signPublication, verifyPublication } = require("../../dist/node/signer");
const { generateMockPost, generateMockComment } = require("../../dist/node/test-util");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

let plebbit;
const updateInterval = 100;
const subplebbitAddress = signers[0].address;

describe("comment (node and browser)", async () => {
    describe("createComment", async () => {
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
        it("Can sign and verify a comment with randomly generated key", async () => {
            const comment = {
                subplebbitAddress: subplebbitAddress,
                author: { address: signers[0].address },
                timestamp: timestamp(),
                title: "Test post signature",
                content: "some content..."
            };
            const signature = await signPublication(comment, signers[0], plebbit, "comment");
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment, plebbit, "comment");
            expect(isVerified).to.be.true;
        });

        it("Can sign and verify a comment with an imported key", async () => {
            const signer = await plebbit.createSigner({ privateKey: signers[1].privateKey, type: "rsa" });
            const comment = {
                subplebbitAddress: subplebbitAddress,
                author: { address: signer.address },
                timestamp: timestamp(),
                title: "Test post signature",
                content: "some content..."
            };
            const signature = await signPublication(comment, signer, plebbit, "comment");
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment, plebbit, "comment");
            expect(isVerified).to.be.true;
            expect(signedComment.signature.publicKey).to.be.equal(signers[1].publicKey, "Generated public key should be same as provided");
        });

        it("Throws an error when a user attempts to publish a comment under a non existent parent", async () => {
            return new Promise(async (resolve) => {
                const comment = await plebbit.createComment({
                    parentCid: "gibberish", // invalid parentCid,
                    author: { displayName: `Mock Author - ${Date.now()}` },
                    signer: signers[0],
                    content: `Mock comment - ${Date.now()}`,
                    subplebbitAddress: subplebbitAddress
                });
                await comment.publish();
                comment.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    expect(challengeVerificationMessage.reason).to.be.a("string");
                    resolve();
                });
            });
        });

        it("Publishing a comment with invalid signature fails", async () => {
            const mockComment = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
            mockComment.signature.signature = mockComment.signature.signature.slice(1); // Corrupts signature by deleting one key
            await assert.isRejected(mockComment.publish());
        });

        it(`Fail to publish a reply with a timestamp earlier than parent`, async () => {
            return new Promise(async (resolve) => {
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                await subplebbit.update(updateInterval);
                await subplebbit.stop();
                const parentPost = await plebbit.getComment(subplebbit.lastPostCid);
                const reply = await generateMockComment(parentPost, plebbit, signers[0], false, { timestamp: parentPost.timestamp - 1 });
                await reply.publish();
                reply.once("challengeverification", async (challengeVerificationMessage, updatedComment) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    expect(challengeVerificationMessage.reason).to.be.a("string");
                    resolve();
                });
            });
        });

        it(`Fail to publish a comment without author.address`);
        it(`Fail to publish a comment with non valid signature.signedPropertyNames`);
    });
});
