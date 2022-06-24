const Plebbit = require("../../dist/node");
const fixtureSigners = require("../fixtures/signers");
const authorSignerFixture = fixtureSigners[1];
const fixtureComment = require("../fixtures/publications").comment;
const { signPublication, verifyPublication, encrypt, decrypt } = require("../../dist/node/signer");
const {
    encryptBufferRsa,
    decryptBufferRsa,
    generateKeyAesEcb,
    encryptStringAesEcb,
    decryptStringAesEcb
} = require("../../dist/node/signer/encryption");
const { signBufferRsa, verifyBufferRsa } = require("../../dist/node/signer/signatures");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { toString } = require("uint8arrays/to-string");
const { fromString } = require("uint8arrays/from-string");
const { Buffer } = require("buffer");

describe("signer (node and browser)", async () => {
    let plebbit, authorSigner, randomSigner;

    before(async function () {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
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
        let authorSignature, randomSignature, signedPublication;

        before(async () => {
            authorSignature = await signPublication(fixtureComment, authorSigner, plebbit);
            signedPublication = { ...fixtureComment, signature: authorSignature };
        });

        it("signPublication author signature is correct", async () => {
            const expectedAuthorSignature = {
                signature:
                    "CLHDdRwTWbRL8VgYBAN5ll1ZvhDEnq+WCm8hhlAOqQ/8dgE3r7qfqhFn3tlDCavPW1dYFJ2OkrSgENR/ubXfgeLFwkQYyBOg5P8ReNyEExgN2MrHjbbFcC22GIY48rpl1/9ZPBvm7I7jImMGgL7/ZSnESYsn9nvFYVeYMUB/xRaRYHF6VJe6Kh7r1P5O7qa16h82ud3HlhvGsYd3o5saFdy2rSsoq6+ILwEnjauahTKLLYECVN5RTGUw/6wwBVWH+5qlE66+libD2/UKQe4cP+mgdv9qrIMVx1FT48hJtdSNxowIR1tXPsaWBf8I9YRN/hr5WLH6fSh7XT+qG3NOhA",
                publicKey: authorSignerFixture.publicKey,
                type: "rsa",
                signedPropertyNames: ["subplebbitAddress", "author", "timestamp", "parentCid", "content"]
            };
            expect(authorSignature).not.to.equal(undefined);
            expect(authorSignature.signature).to.equal(expectedAuthorSignature.signature);
            expect(authorSignature.publicKey).to.equal(expectedAuthorSignature.publicKey);
            expect(authorSignature.type).to.equal(expectedAuthorSignature.type);
            expect(authorSignature.signedPropertyNames).to.deep.equal(expectedAuthorSignature.signedPropertyNames);
        });

        it(`signPublication throws with invalid author`, async () => {
            // Trying to sign a publication with author.address !== randomSigner.address
            // should throw an error
            try {
                randomSignature = await signPublication(fixtureComment, randomSigner, plebbit);
                expect.fail("Signing a publication with author.address !== randomSigner.address should throw an error");
            } catch {}
        });

        it("verifyPublication success with correct author signature", async () => {
            const verification = await verifyPublication(signedPublication);
            expect(verification).to.deep.equal([true]);
        });

        it("verifyPublication failure with wrong signature", async () => {
            const invalidSignature = {
                signature:
                    "DdjseJWstPGtXZkKges4XaZ2pw4MqfVbWjqaZ4t4PzPNlbUsCQKp4H4SDNYNG1iDokKOvux4O6ng2k/0sU78W7XSR2RAcxSiyMV5TeK7JHsiwB8/uUZZa+4jObTO5CG2GyjwhG94lDNUzWh/xtEDKuxYQjYd0Zr9Q8vcGzLTXfbDVGof9qqfE1m6rM9o6UYdhag8QpJtpxpF5RFZOKP2xyqDXyiQTqvtv1FP8XFnwbKjCgT5/stv+WCVjEdzggaG2Ox7k8KJhXwGY6TSTZmB43kBEtSvoAwxCvp+o/xbyUiS9Qfr5ySe6YeCEgACnnMIuHeG2EbQyFKIAV4mTFxGSQ",
                publicKey:
                    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxAGJeGuWd7CBbei6MfOl\nFvX5sPf7tzU3SIeQlTsc4GNjV+Jn/y5nqnVHPFK38NUJIuYjaTlH4OoZv/CI4ze5\nBz6ZIxijd6wIgweHvCCuhhRKaLRl+BoGDCVU5SjEEi3NdeNnNRbSKlBv4v8l2Vdt\ngkt9iUelRyd8UmkRt7nSND1dPTdPE4tfyO2eAg2dNQ1ItWWhgW17Z3lPV1VwNhjU\nqGa8wt7M2Mse3vu2dprRtGs/3UeSvf4i9i3NaF+M7NhplB8t0KlmqSpy7ChX5MvQ\nv4tJ1c7MlG3Dzryt2I9xSueINVlWPTqBAR4HePcURET5h/0b4pajM61QICCq3X1d\n5QIDAQAB\n-----END PUBLIC KEY-----",
                type: "rsa",
                signedPropertyNames: ["subplebbitAddress", "author", "timestamp", "parentCid", "content"]
            };

            const wronglySignedPublication = { ...signedPublication, signature: invalidSignature };
            const verification = await verifyPublication(wronglySignedPublication);
            expect(verification).to.deep.equal([
                false,
                "AssertionError [ERR_ASSERTION]: comment.author.address doesn't match comment.signature.publicKey"
            ]);
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
            const [validity, failedVerificationReason] = await verifyPublication(comment);
            expect(validity).to.be.true;
            expect(failedVerificationReason).to.be.undefined;
        });
    });

    describe("encryption", () => {
        describe("encrypt and decrypt aes-ecb key buffer with rsa", () => {
            // key must be 16 bytes
            const key = fromString("1111111111111111");
            let encryptedKey;

            before(async () => {
                encryptedKey = await encryptBufferRsa(key, authorSignerFixture.publicKey);
            });

            it("encrypted key is string of correct length", () => {
                expect(encryptedKey).to.be.a("string");
                expect(encryptedKey).to.be.of.length(342);
            });

            it("encrypted key can be decrypted", async () => {
                const decryptedKey = await decryptBufferRsa(encryptedKey, authorSignerFixture.privateKey);
                expect(toString(key)).to.equal(toString(decryptedKey));
            });
        });

        describe("generate, encrypt and decrypt aes-ecb key buffer with rsa", () => {
            let key, encryptedKey;

            before(async () => {
                key = await generateKeyAesEcb();
                encryptedKey = await encryptBufferRsa(key, authorSignerFixture.publicKey);
            });

            it("generated key is Uint8Array of correct length", () => {
                expect(key).to.be.instanceof(Uint8Array);
                expect(key).to.be.of.length(16);
            });

            it("encrypted key is string of correct length", () => {
                expect(encryptedKey).to.be.a("string");
                expect(encryptedKey).to.be.of.length(342);
            });

            it("encrypted key can be decrypted", async () => {
                const decryptedKey = await decryptBufferRsa(encryptedKey, authorSignerFixture.privateKey);
                expect(toString(key)).to.equal(toString(decryptedKey));
            });
        });

        describe("encrypt and decrypt string with aes-ecb", async () => {
            describe("generated key", () => {
                let key, encryptedString;
                before(async () => {
                    key = await generateKeyAesEcb();
                    encryptedString = await encryptStringAesEcb(JSON.stringify(fixtureComment), key);
                });

                it("encrypted string is not empty", async () => {
                    expect(encryptedString).to.be.a("string");
                    expect(encryptedString).to.not.be.empty;
                });

                it("encrypted string can be decrypted", async () => {
                    const decryptedString = await decryptStringAesEcb(encryptedString, key);
                    expect(decryptedString).to.be.a("string");
                    expect(decryptedString).to.not.be.empty;
                    expect(JSON.stringify(fixtureComment)).to.equal(decryptedString);
                });
            });

            describe("fixed key", () => {
                // key must be 16 bytes for aes-ecb 128
                const key = fromString("1111111111111111");

                describe("encrypt the word 'string'", () => {
                    const string = "string";
                    let encryptedString;
                    before(async () => {
                        encryptedString = await encryptStringAesEcb(string, key);
                    });

                    it("encrypted string is not empty", async () => {
                        const encryptedString = await encryptStringAesEcb(string, key);
                        expect(encryptedString).to.be.a("string");
                        expect(encryptedString).to.not.be.empty;

                        // base 64 aes-ecb 128 encrypted "string" with key "1111111111111111"
                        // should always return this value
                        expect(encryptedString).to.equal("ZaK4u0c9tJOhuKn5hlDeiA");
                    });

                    it("encrypted string can be decrypted", async () => {
                        const decryptedString = await decryptStringAesEcb(encryptedString, key);
                        expect(decryptedString).to.be.a("string");
                        expect(decryptedString).to.not.be.empty;
                        expect(string).to.equal(decryptedString);
                    });
                });

                describe("encrypt an emoji", () => {
                    const emoji = "🤡";
                    let encryptedEmoji;
                    before(async () => {
                        encryptedEmoji = await encryptStringAesEcb(emoji, key);
                    });

                    it("encrypted emoji is not empty", async () => {
                        const encryptedEmoji = await encryptStringAesEcb(emoji, key);
                        expect(encryptedEmoji).to.be.a("string");
                        expect(encryptedEmoji).to.not.be.empty;

                        // base 64 aes-ecb 128 encrypted "🤡" with key "1111111111111111"
                        // should always return this value
                        expect(encryptedEmoji).to.equal("Z2FhQoSm8IINBBpxl9OdfA");
                    });

                    it("encrypted emoji can be decrypted", async () => {
                        const decryptedEmoji = await decryptStringAesEcb(encryptedEmoji, key);
                        expect(decryptedEmoji).to.be.a("string");
                        expect(decryptedEmoji).to.not.be.empty;
                        expect(emoji).to.equal(decryptedEmoji);
                    });
                });
            });
        });

        describe("encrypt and decrypt publication with rsa + aes-ecb", () => {
            let encryptedPublication;

            before(async () => {
                encryptedPublication = await encrypt(JSON.stringify(fixtureComment), authorSignerFixture.publicKey);
            });

            it("encrypted publication has expected properties", async () => {
                expect(encryptedPublication).to.not.equal(undefined);
                expect(encryptedPublication.encrypted).to.be.a("string");
                expect(encryptedPublication.encrypted).to.not.be.empty;
                expect(encryptedPublication.encryptedKey).to.be.a("string");
                expect(encryptedPublication.encryptedKey).to.not.be.empty;
                expect(encryptedPublication.type).to.equal("aes-ecb");
            });

            it("encrypted publication can be decrypted", async () => {
                const decryptedPublicationString = await decrypt(
                    encryptedPublication.encrypted,
                    encryptedPublication.encryptedKey,
                    authorSignerFixture.privateKey
                );
                expect(encryptedPublication.encrypted).to.be.a("string");
                expect(encryptedPublication.encrypted).to.not.be.empty;
                let decryptedPublication;
                try {
                    decryptedPublication = JSON.parse(decryptedPublicationString);
                } catch (e) {
                    throw Error(`decrypted publication isn't valid JSON: ${e.message}`);
                }
                expect(decryptedPublication.subplebbitAddress).to.equal(fixtureComment.subplebbitAddress);
                expect(decryptedPublication.timestamp).to.equal(fixtureComment.timestamp);
                expect(decryptedPublication.content).to.equal(fixtureComment.content);
                expect(decryptedPublication.author?.address).to.equal(fixtureComment.author.address);
            });
        });
    });
});
