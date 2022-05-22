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
const { expect } = require("chai");
const { toString } = require("uint8arrays/to-string");
const { fromString } = require("uint8arrays/from-string");

describe("signer (node and browser)", async () => {
    let plebbit, authorSigner, randomSigner;

    before(async function () {
        plebbit = await Plebbit();
        authorSigner = await plebbit.createSigner({ privateKey: authorSignerFixture.privateKey, type: "rsa" });
        randomSigner = await plebbit.createSigner();
    });

    describe("sign and verify publication", () => {
        let authorSignature, randomSignature, signedPublication;

        before(async () => {
            authorSignature = await signPublication(fixtureComment, authorSigner);
            randomSignature = await signPublication(fixtureComment, randomSigner);
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

        it("verifyPublication success with correct author signature", async () => {
            const verification = await verifyPublication(signedPublication);
            expect(verification).to.deep.equal([true]);
        });

        it("verifyPublication failure with wrong signature", async () => {
            const wronglySignedPublication = { ...signedPublication, signature: randomSignature };
            const verification = await verifyPublication(wronglySignedPublication);
            expect(verification).to.deep.equal([
                false,
                "AssertionError [ERR_ASSERTION]: comment.author.address doesn't match comment.signature.publicKey"
            ]);
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
