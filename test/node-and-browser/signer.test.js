const Plebbit = require("../../dist/node");
const fixtureSigners = require("../fixtures/signers");
const authorSignerFixture = fixtureSigners[1];
const fixtureComment = require("../fixtures/publications").comment;
const { signPublication, verifyComment } = require("../../dist/node/signer");
const {
    signBufferRsa,
    verifyBufferRsa,
    SIGNED_PROPERTY_NAMES,
    verifyCommentUpdate,
    verifyChallengeRequest
} = require("../../dist/node/signer/signatures");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { toString } = require("uint8arrays/to-string");
const { fromString } = require("uint8arrays/from-string");
const { Buffer } = require("buffer");
const { messages } = require("../../dist/node/errors");
const { verifyPage } = require("../../dist/node/signer/signatures");
const signers = require("../fixtures/signers");
const { generateMockPost } = require("../../dist/node/test/test-util");

const updateInterval = 100;
if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

let plebbit;

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

describe("signer (node and browser)", async () => {
    let authorSigner, randomSigner;

    before(async function () {
        authorSigner = await plebbit.createSigner({ privateKey: authorSignerFixture.privateKey, type: "rsa" });
        randomSigner = await plebbit.createSigner();
    });

    describe("signBufferRsa and verifyBufferRsa", () => {
        const string = "1111111111111111";
        const uint8array = fromString(string);
        const buffer = Buffer.from(string);
        let bufferSignature, uint8arraySignature;

        before(async () => {
            bufferSignature = await signBufferRsa(buffer, authorSigner.privateKey);
            uint8arraySignature = await signBufferRsa(uint8array, authorSigner.privateKey);
        });

        it("can't sign strings", async () => {
            //signBufferRsa should not be used to sign strings it dosn't encode properly in the browser
            await assert.isRejected(signBufferRsa(string, authorSigner.privateKey));
        });

        it("can't sign undefined", async () => {
            await assert.isRejected(signBufferRsa(undefined, authorSigner.privateKey));
        });

        it("can sign buffers and uint8arrays", () => {
            let uint8arrayString, bufferString, expectedSignature;
            // to string has different behavior in the browser for `Buffer`
            // in general using `Buffer.from()` should be avoided
            if (typeof window === "undefined") {
                uint8arrayString = toString(uint8arraySignature, "hex");
                bufferString = bufferSignature.toString("hex");
                expectedSignature =
                    "4ab1cdbed187e4940e6d8ae85aee40ff0adf1745df5267d148456980ad6863885acc31203b6dc73b36ccb3dd6ad168d019e922c9cc2cb305bc779936ef2c0b7bf95cf9c5ea770a5e6ebe8e2f5c42117f8ebe33fb4590c0119cf7ee1e98a6411365dc065c02e26bb5b9887607d80ce571e908488f11e54125588ea4f0171d98932618d54067e59b54377e68f2fc78c48ab686a3df0e02eae487389561d2a6fe99f0da15a490eaa31d79ca4b9211ef21a35e00633f02613b0c2388f27ebbb1b064dc80e206e6e00069284fe3051b3581c2f9c4e80ba259578ac386fe3127e31e88272b32c008cbce01406dd7bbd39e64c18ec45d9ee600b7af690f114aa306b99b";
            } else {
                uint8arrayString = uint8arraySignature.toString();
                bufferString = bufferSignature.toString();
                expectedSignature =
                    "74,177,205,190,209,135,228,148,14,109,138,232,90,238,64,255,10,223,23,69,223,82,103,209,72,69,105,128,173,104,99,136,90,204,49,32,59,109,199,59,54,204,179,221,106,209,104,208,25,233,34,201,204,44,179,5,188,119,153,54,239,44,11,123,249,92,249,197,234,119,10,94,110,190,142,47,92,66,17,127,142,190,51,251,69,144,192,17,156,247,238,30,152,166,65,19,101,220,6,92,2,226,107,181,185,136,118,7,216,12,229,113,233,8,72,143,17,229,65,37,88,142,164,240,23,29,152,147,38,24,213,64,103,229,155,84,55,126,104,242,252,120,196,138,182,134,163,223,14,2,234,228,135,56,149,97,210,166,254,153,240,218,21,164,144,234,163,29,121,202,75,146,17,239,33,163,94,0,99,63,2,97,59,12,35,136,242,126,187,177,176,100,220,128,226,6,230,224,0,105,40,79,227,5,27,53,129,194,249,196,232,11,162,89,87,138,195,134,254,49,39,227,30,136,39,43,50,192,8,203,206,1,64,109,215,187,211,158,100,193,142,196,93,158,230,0,183,175,105,15,17,74,163,6,185,155";
            }
            expect(bufferString).to.equal(uint8arrayString);
            expect(uint8arrayString).to.equal(expectedSignature);
            expect(bufferString).to.equal(expectedSignature);
        });

        it("can verify signature", async () => {
            expect(await verifyBufferRsa(uint8array, uint8arraySignature, authorSigner.publicKey)).to.equal(true);
            expect(await verifyBufferRsa(buffer, bufferSignature, authorSigner.publicKey)).to.equal(true);
            expect(await verifyBufferRsa(buffer, bufferSignature, randomSigner.publicKey)).to.equal(false);
        });
    });

    describe("sign and verify publication", () => {
        let authorSignature, signedPublication;
        const expectedAuthorSignature = {
            signature:
                "IMff4G8CPJPS3O3zRYkqh160BU3dLCd9Is6F348yNkUBzMEstH2u6+PMfyULQeJQzspz+bEU6iq/b7QwRAvQKClV6kHXK0R5Yzfop7cDHD3v0uqTVwxbtbINOm6dbjO1iThOeP7ULSXzLEP0obVyy51v3xBqKfrdG8NMQd/VuU6rtxmRJQwJdPHEhjDFQ3QxtoOUnrGTUVED0eX22gORjxb1uW5vJ+T/63frIJ9gBgCYRA8luCmTt59hZRusmh0n21zIQmxIdRebmdwR15wI7hmrppqcH1e5Fm+MCVRu7JLySsP4r5DJ2PECw9gobq1am6F4SuUXZBbQaxq36QZk9Q",
            publicKey: authorSignerFixture.publicKey,
            type: "rsa",
            signedPropertyNames: SIGNED_PROPERTY_NAMES.comment
        };

        before(async () => {
            authorSignature = await signPublication(fixtureComment, authorSigner, plebbit, "comment");
            signedPublication = { ...fixtureComment, signature: authorSignature };
        });

        it(`Comment from previous plebbit-js versions can be verified`, async () => {
            // CID: QmSC6fG7CPfVVif2fsKS1i4zi2DYpSkSrMksyCyZJZW8X8
            //prettier-ignore
            const comment = {"subplebbitAddress":"QmRcyUK7jUhFyPTEvwWyfGZEAaSoDugNJ8PZSC4PWRjUqd","timestamp":1661902265,"signature":{"signature":"js6v39xc7y8yiFlj7DuBVIXiEgdNQcEdD3EXElOjX4ZkQP/b9TbqPulpfQ+EeGLq8UFnhfd2lJXDYvDx25ku8fyKR4fIFTMY9WDId3bHuDiWgbtgfA6+RRTL4eV9Ld2FVNLdsR2DCSxlcAvCc+M2rzzGDEQCZ85GbkCNBZ9jOypOEO1dW626jc41Q/6ddmI8nSV5iFDfw1jyvNE8JElWs5v7S58YcYO3CN0PlHEZgZ9dnfBkO9FihaFp25QDZgZJrXxCmPwQFRiNMe9Wlz7IeEEzop3TZ+PyExpbEG50rcyltkYUJ3LVxJfEQD/ZZ/Im3gTESLadz3aRWfjgfZ/L3A","publicKey":"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxJS1ZMx9uqCFdiauIH5e\nJho2CtarYP3zAFzqvbPm1pBLm738I4DotkzvVIbgFHRu7a2wgq0+bUjwg4yX3z7N\nFjetiBaT+hEIMFYKyobsv65ebInsqMYIPNVbn380xLzb5zMyPEL6pBuvGdmQZlRD\ngXDuHiCh66IPLizd8KGWJMSQXOcAhLt+NRcdHSSCLkibcQOHs52dKc0qYvGHd25h\nKPs+dE4d/A86aLRSD5w/yGwiJA8Jn+nLFbOLiEf775L6tOO35OF6PHiXo21BTl0o\nS4Eh9DIlPT7fNhEg+HhQFoQ7VHQLq76OVYpXBCnhIRUaPko5EgjNfrqwG6R1lPZF\nkwIDAQAB\n-----END PUBLIC KEY-----","type":"rsa","signedPropertyNames":["subplebbitAddress","author","timestamp","content","title","link","parentCid"]},"author":{"address":"QmXGrdUi1PbSaApyDHbSoPdx2HkGsBAvTGFDTKoFrpuFxq"},"protocolVersion":"1.0.0","content":"Check the title\n","title":"I'll stick to reddit. Thank you very much.","ipnsName":"k2k4r8nz40czmblfjgzo79tmex2wuo4y8zwi51843fac1rrx823g7lk8","depth":0};

            const verification = await verifyComment(comment, plebbit);
            expect(verification).to.deep.equal({ valid: true });
        });

        it(`CommentUpdate from previous plebbit-js versions can be verified`, async () => {
            //prettier-ignore
            const update = {"upvoteCount":0,"downvoteCount":0,"replyCount":0,"replies":{"pages":{},"subplebbit":{"address":"Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW"}},"updatedAt":1666425163,"protocolVersion":"1.0.0","signature":{"signature":"eZk+MoWtIkF9+0NHTLY8q8vKjAhYNiASBjK2dI2uf7CcDQhTTEzTVTXU7BdsdWyrXw1R59M22hQ5KTDxnvOkbAnON3a6jcwEKo/bX5dgnrimI2D2qPQ4zqN4IFa1LpvzJXIv5jolIwUUm14NuBc9wjbPEAoyds8R6x3BVzeR9y7Un28tqQ7wiK6x/elu8bByXXbaA2vtxRWdAQSQNNpTdJtyX8YgO+W/Sj1hnrBVQ17xoTH0ZaPo9ardKjuGuuX4hBxK0sqF2p3yc/RhQEP1PH6+a2fPHrS6wz1eHMJAbp84MOzk9ReEt+AbL9l6OJOhVFmdtX/KGfjL/hce3L7KVg","publicKey":"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0X1KiwSRPW1CSMhyQhjz\n/c0tFxZ3Axr99etLxHkUhPPshxUe+clgqCGcN9HpOwuy+5uPUtBNDJb76lljwZr6\n3MeMiV8sXsxOY88yyiRHbEpOPgS4/dDpBh+2XZnnCtAen08Ob4/fA8q5Izyo1cSb\n8YclUgH5AIqJsleVsl32zK1UzIuYeY5Czzv4cEAa1/11y1b9ZCOIW/ziNK3y3iBQ\nJXdexhWWVQSA6DzNGDb+G6gObOXD0VLCsldZSHGIjY2vZuE/5/IKHo52l7U1RA9u\n0Txtm3TCretEhExrU3RmhWiL05/6qcp0UB7VYlh9Eh4njsGLK78YwvRlLnKdqPx9\nGwIDAQAB\n-----END PUBLIC KEY-----","type":"rsa","signedPropertyNames":["author","spoiler","pinned","locked","removed","moderatorReason","flair","upvoteCount","downvoteCount","replies","updatedAt","replyCount","authorEdit"]}};
            const verification = await verifyCommentUpdate(update);
            expect(verification).to.deep.equal({ valid: true });
        });

        it(`author.address(domain) gets corrected to signer.address if it's not pointing to signer.address, during validation process`);

        it(
            `Comment signature will be invalidated if comment.author.address (domain) points to different address, and overrideAuthorAddressIfInvalid=false`
        );
        it(`Valid vote signature gets validated correctly`);

        it(`Invalid vote signature gets invalidated correctly`);

        it(`Comment with CommentUpdate json, with invalid author address will be corrected to derived address`);

        it(`Subplebbit with domain that does not match public key will get invalidated`);

        it(`Subplebbit with address that does not match public key will be invalidated`);

        it(`Pre-defined signature is validated correctly`, async () => {
            const fixtureWithSignature = { ...fixtureComment, signature: expectedAuthorSignature };
            const verification = await verifyComment(fixtureWithSignature, plebbit, "comment");
            expect(verification).to.deep.equal({ valid: true });
        });

        it("signPublication author signature is correct", async () => {
            expect(authorSignature).not.to.equal(undefined);
            expect(authorSignature.signature).to.equal(expectedAuthorSignature.signature);
            expect(authorSignature.publicKey).to.equal(expectedAuthorSignature.publicKey);
            expect(authorSignature.type).to.equal(expectedAuthorSignature.type);
            expect(authorSignature.signedPropertyNames).to.deep.equal(expectedAuthorSignature.signedPropertyNames);
        });

        it(`signPublication throws with invalid author`, async () => {
            // Trying to sign a publication with author.address !== randomSigner.address
            // should throw an error
            await assert.isRejected(signPublication(fixtureComment, randomSigner, plebbit, "comment"));
        });

        it("verifyComment success with correct author signature", async () => {
            const verification = await verifyComment(signedPublication, plebbit, "comment");
            expect(verification).to.deep.equal({ valid: true });
        });

        it("verifyComment failure with wrong signature", async () => {
            const invalidSignature = {
                signature:
                    "DdjseJWstPGtXZkKges4XaZ2pw4MqfVbWjqaZ4t4PzPNlbUsCQKp4H4SDNYNG1iDokKOvux4O6ng2k/0sU78W7XSR2RAcxSiyMV5TeK7JHsiwB8/uUZZa+4jObTO5CG2GyjwhG94lDNUzWh/xtEDKuxYQjYd0Zr9Q8vcGzLTXfbDVGof9qqfE1m6rM9o6UYdhag8QpJtpxpF5RFZOKP2xyqDXyiQTqvtv1FP8XFnwbKjCgT5/stv+WCVjEdzggaG2Ox7k8KJhXwGY6TSTZmB43kBEtSvoAwxCvp+o/xbyUiS9Qfr5ySe6YeCEgACnnMIuHeG2EbQyFKIAV4mTFxGSQ",
                publicKey:
                    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxAGJeGuWd7CBbei6MfOl\nFvX5sPf7tzU3SIeQlTsc4GNjV+Jn/y5nqnVHPFK38NUJIuYjaTlH4OoZv/CI4ze5\nBz6ZIxijd6wIgweHvCCuhhRKaLRl+BoGDCVU5SjEEi3NdeNnNRbSKlBv4v8l2Vdt\ngkt9iUelRyd8UmkRt7nSND1dPTdPE4tfyO2eAg2dNQ1ItWWhgW17Z3lPV1VwNhjU\nqGa8wt7M2Mse3vu2dprRtGs/3UeSvf4i9i3NaF+M7NhplB8t0KlmqSpy7ChX5MvQ\nv4tJ1c7MlG3Dzryt2I9xSueINVlWPTqBAR4HePcURET5h/0b4pajM61QICCq3X1d\n5QIDAQAB\n-----END PUBLIC KEY-----",
                type: "rsa",
                signedPropertyNames: SIGNED_PROPERTY_NAMES.comment
            };

            const wronglySignedPublication = { ...signedPublication, signature: invalidSignature };
            const verification = await verifyComment(wronglySignedPublication, plebbit, "comment");
            expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_NOT_VALID });
        });

        it("can sign a comment with author.displayName = undefined", async () => {
            const signer = await plebbit.createSigner();

            const comment = await plebbit.createComment({
                title: "comment title",
                content: "comment content",
                subplebbitAddress: signer.address,
                signer,
                author: { address: signer.address }
            });
            const res = await verifyComment(comment, plebbit);
            expect(res).to.deep.equal({ valid: true });
        });
    });
});

describe.only(`Verify pubsub messages`, async () => {
    describe("challengerequest", async () => {
        it(`valid challengerequest fixture from previous version can be validated`);
        it(`Valid ChallengeRequest gets validated correctly`, async () => {
            const comment = await generateMockPost(signers[0].address, plebbit, signers[5]);
            try {
                await comment.publish();
            } catch (e) {}
            // comment.challenge (ChallengeRequest) should be defined now
            expect(comment.challenge).to.be.a("object");
            const verificaiton = await verifyChallengeRequest(comment.challenge);
            expect(verificaiton).to.deep.equal({ valid: true });
        });

        it(`Subplebbit responds to a challenge request with invalid signature if signature of challenge request is invalid`, async () => {
            return new Promise(async (resolve) => {
                const tempPlebbit = await Plebbit(plebbit);
                const comment = await generateMockPost(signers[0].address, tempPlebbit, signers[6]);

                await Promise.all([new Promise((resolve) => comment.once("challengeverification", resolve)), comment.publish()]);

                // comment.challenge (ChallengeRequest) should be defined now
                expect(comment.challenge).to.be.a("object");
                const invalidSignature = JSON.parse(JSON.stringify(comment.challenge));
                invalidSignature.encryptedPublication.encrypted = invalidSignature.encryptedPublication.encrypted.slice(1); // Signature should be invalid after
                const verificaiton = await verifyChallengeRequest(invalidSignature);
                expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });

                await tempPlebbit.pubsubIpfsClient.pubsub.publish(
                    comment.subplebbit.pubsubTopic,
                    fromString(JSON.stringify(invalidSignature))
                );
                await tempPlebbit.pubsubIpfsClient.pubsub.subscribe(comment.subplebbit.pubsubTopic, (pubsubMsg) => {
                    const msgParsed = JSON.parse(toString(pubsubMsg["data"]));
                    if (
                        msgParsed.type === "CHALLENGEVERIFICATION" &&
                        msgParsed.challengeRequestId === invalidSignature.challengeRequestId
                    ) {
                        expect(msgParsed.challengeSuccess).to.be.false;
                        expect(msgParsed.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
                        expect(msgParsed.publication).to.be.undefined;
                        expect(msgParsed.encryptedPublication).to.be.undefined;
                        tempPlebbit.pubsubIpfsClient.pubsub.unsubscribe();
                        resolve();
                    }
                });
            });
        });
    });

    describe("challengeanswer", async () => {
        it(`Valid ChallengeAnswer gets validated correctly`);
        it(`Invalid ChallengeAnswer gets invalidated correctly`);
        it(`Subplebbit responds to a challenge answer with invalid signature if signature of challenge answer is invalid`);
    });
});
describe(`verify pages`, async () => {
    let subplebbit;
    before(async () => {
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
        subplebbit._updateIntervalMs = updateInterval;
    });

    after(async () => {
        await subplebbit.stop();
    });

    it(`Can validate page from live subplebbit`, async () => {
        const page = subplebbit.posts.pages.hot;
        const pageVerification = await verifyPage(page, plebbit, subplebbit.address);
        expect(pageVerification).to.deep.equal({ valid: true });
    });

    it(`Page from previous plebbit-js versions can be validated`, async () => {
        const page = require("../fixtures/valid_page.json");
        const verification = await verifyPage(page, plebbit, "QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8");
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`A page with comment.content modified by sub owner will be invalidated`, async () => {
        const invalidPage = JSON.parse(JSON.stringify(require("../fixtures/valid_page.json")));
        invalidPage.comments[0].content = "Content modified by sub illegally";
        const verification = await verifyPage(invalidPage, plebbit, "QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8");
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`Page with comment.author modified by sub owner will be invalidated`, async () => {
        const invalidPage = JSON.parse(JSON.stringify(require("../fixtures/valid_page.json")));
        invalidPage.comments[0].author.address = "invalidAddress.eth";
        const verification = await verifyPage(invalidPage, plebbit, "QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8");
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`Page with an edited comment modified by sub owner will be invalidated`);

    it(`Page with comment.flair (original) modified by sub owner will be invalidated`);

    it.skip(`A page with comment.author.avatar can be valid`, async () => {
        const page = require("../fixtures/valid_page.json");
        const verification = await verifyPage(page, plebbit, "QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8");
        expect(verification).to.deep.equal({ valid: true });
    });

    it("Page will be invalidated if comment has invalid signature", async () => {
        const invalidPage = JSON.parse(JSON.stringify(require("../fixtures/valid_page.json")));
        invalidPage.comments[0].timestamp -= 1; // Should make signature invalid
        const verification = await verifyPage(invalidPage, plebbit, subplebbit.address);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`Page will be invalidated if comment.author.address (plebbit address) does not match public key of author`, async () => {
        const invalidPage = JSON.parse(JSON.stringify(require("../fixtures/valid_page.json")));

        invalidPage.comments[0].author.address.slice();
        const invalidAuthor = invalidPage.comments[0].author.address;

        invalidPage.comments[0].author.address = invalidAuthor.slice(0, invalidAuthor.length / 2);

        const verification = await verifyPage(invalidPage, plebbit, subplebbit.address);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it.skip(`Page will be valid even if comment.author.address (domain) does not match public key of author (overrideAuthorAddress=true)`, async () => {
        // verifyPage would override the incorrect domain

        const signer = await plebbit.createSigner(signers[6]);
        const newDomain = `plebbit${Math.round(Date.now() / 1000)}.eth`;
        plebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) => (authorAddress === newDomain ? signer.address : authorAddress);
        const comment = await plebbit.createComment({
            subplebbitAddress: subplebbit.address,
            title: `Test title ${Date.now()}`,
            content: `Test content ${Date.now()}`,
            signer,
            author: { address: newDomain } // This domain would resolve plebbit-author-address to a different public key
        });
        await comment.publish();
        await Promise.all([new Promise((resolve) => subplebbit.once("update", resolve)), subplebbit.update()]);
        const pageFromPosts = JSON.parse(JSON.stringify(subplebbit.posts.pages.hot));

        expect(pageFromPosts.comments.some((comment) => comment.author.address === newDomain)).to.be.true;

        plebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === newDomain
                ? signers[7].address // Change from signers[6] to 7
                : authorAddress;

        const verification = await verifyPage(pageFromPosts, plebbit, subplebbit.address);
        expect(verification).to.deep.equal({ valid: true });

        // We're expecting that verifyPage has overridden domain with signer address
        expect(pageFromPosts.comments.some((comment) => comment.author.address === newDomain)).to.be.false;
        expect(pageFromPosts.comments.some((comment) => comment.author.address === signer.address)).to.be.true;

        const page = await subplebbit.posts.getPage(subplebbit.posts.pageCids.hot); // getPage calls verifyPage, so no need to call it
        expect(page.comments.some((comment) => comment.author.address === newDomain)).to.be.false;
        expect(page.comments.some((comment) => comment.author.address === signer.address)).to.be.true;
    });
});
