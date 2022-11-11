const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { generateMockPost, generateMockComment } = require("../../dist/node/test/test-util");
const { messages, codes } = require("../../dist/node/errors");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

let plebbit;
const subplebbitAddress = signers[0].address;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

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

        it(`comment = await createComment(await createComment)`, async () => {
            const props = {
                content: `test comment = await createComment(await createComment) ${Date.now()}`,
                subplebbitAddress,
                author: {
                    address: signers[4].address,
                    displayName: `Mock Author - comment = await createComment(await createComment)`
                },
                signer: signers[4],
                timestamp: 2345324
            };
            const comment = await plebbit.createComment(props);

            const nestedComment = await plebbit.createComment(comment);

            expect(comment.content).to.equal(props.content);
            expect(comment.subplebbitAddress).to.equal(props.subplebbitAddress);
            expect(JSON.stringify(comment.author)).to.equal(JSON.stringify(props.author));
            expect(comment.timestamp).to.equal(props.timestamp);

            expect(comment.toJSON()).to.deep.equal(nestedComment.toJSON());
        });

        it("Subplebbit reject a comment under a non existent parent", async () => {
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
                    expect(challengeVerificationMessage.reason).to.be.equal(messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST);
                    expect(challengeVerificationMessage.publication).to.be.undefined;
                    expect(challengeVerificationMessage.encryptedPublication).to.be.undefined;

                    resolve();
                });
            });
        });

        it(".publish() throws if publication has invalid signature", async () => {
            const mockComment = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
            mockComment.signature.signature = mockComment.signature.signature.slice(1); // Corrupts signature by deleting one key
            await assert.isRejected(mockComment.publish(), messages.ERR_SIGNATURE_IS_INVALID);
        });

        it(`Subplebbit reject a reply with a timestamp earlier than parent`, async () => {
            return new Promise(async (resolve) => {
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                expect(subplebbit.lastPostCid).to.be.a("string");
                const parentPost = await plebbit.getComment(subplebbit.lastPostCid);
                expect(parentPost.timestamp).to.be.a("number");
                const reply = await generateMockComment(parentPost, plebbit, signers[0], false, { timestamp: parentPost.timestamp - 1 });
                expect(reply.timestamp).to.be.lessThan(parentPost.timestamp);
                await reply.publish();
                reply.once("challengeverification", async (challengeVerificationMessage, updatedComment) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    expect(challengeVerificationMessage.reason).to.equal(messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                    expect(challengeVerificationMessage.publication).to.be.undefined;
                    expect(challengeVerificationMessage.encryptedPublication).to.be.undefined;
                    resolve();
                });
            });
        });

        it(`Fail to publish a comment without author.address`);
        it(`Fail to publish a comment with non valid signature.signedPropertyNames`);
    });
});
