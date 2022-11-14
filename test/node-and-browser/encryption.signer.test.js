const Plebbit = require("../../dist/node");
const fixtureSigners = require("../fixtures/signers");
const authorSignerFixture = fixtureSigners[1];
const fixtureComment = require("../fixtures/publications").comment;
const { encrypt, decrypt } = require("../../dist/node/signer");
const {
    encryptBufferRsa,
    decryptBufferRsa,
    generateKeyAesCbc,
    encryptStringAesCbc,
    decryptStringAesCbc
} = require("../../dist/node/signer/encryption");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect } = chai;
const { toString } = require("uint8arrays/to-string");
const { fromString } = require("uint8arrays/from-string");
const { mockPlebbit } = require("../../dist/node/test/test-util");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("encryption", () => {
    let plebbit, authorSigner;

    before(async function () {
        plebbit = await mockPlebbit();
        authorSigner = await plebbit.createSigner({ privateKey: authorSignerFixture.privateKey, type: "rsa" });
    });

    describe("encrypt and decrypt aes-cbc key buffer with rsa", () => {
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

    describe("generate, encrypt and decrypt aes-cbc key buffer with rsa", () => {
        let key, encryptedKey;

        before(async () => {
            key = await generateKeyAesCbc();
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

    describe("encrypt and decrypt string with aes-cbc", async () => {
        describe("generated key", () => {
            let key, encryptedString;
            before(async () => {
                key = await generateKeyAesCbc();
                encryptedString = await encryptStringAesCbc(JSON.stringify(fixtureComment), key);
            });

            it("encrypted string is not empty", async () => {
                expect(encryptedString).to.be.a("string");
                expect(encryptedString).to.not.be.empty;
            });

            it("encrypted string can be decrypted", async () => {
                const decryptedString = await decryptStringAesCbc(encryptedString, key);
                expect(decryptedString).to.be.a("string");
                expect(decryptedString).to.not.be.empty;
                expect(JSON.stringify(fixtureComment)).to.equal(decryptedString);
            });
        });

        describe("fixed key", () => {
            // key must be 16 bytes for aes-cbc 128
            const key = fromString("1111111111111111");

            describe("encrypt the word 'string'", () => {
                const string = "string";
                let encryptedString;
                before(async () => {
                    encryptedString = await encryptStringAesCbc(string, key);
                });

                it("encrypted string is not empty", async () => {
                    const encryptedString = await encryptStringAesCbc(string, key);
                    expect(encryptedString).to.be.a("string");
                    expect(encryptedString).to.not.be.empty;

                    // base 64 aes-cbc 128 encrypted "string" with key "1111111111111111"
                    // should always return this value
                    expect(encryptedString).to.equal("1OXdTy9YFztlOz3lo4NXxw");
                });

                it("encrypted string can be decrypted", async () => {
                    const decryptedString = await decryptStringAesCbc(encryptedString, key);
                    expect(decryptedString).to.be.a("string");
                    expect(decryptedString).to.not.be.empty;
                    expect(string).to.equal(decryptedString);
                });
            });

            describe("encrypt an emoji", () => {
                const emoji = "🤡";
                let encryptedEmoji;
                before(async () => {
                    encryptedEmoji = await encryptStringAesCbc(emoji, key);
                });

                it("encrypted emoji is not empty", async () => {
                    const encryptedEmoji = await encryptStringAesCbc(emoji, key);
                    expect(encryptedEmoji).to.be.a("string");
                    expect(encryptedEmoji).to.not.be.empty;

                    // base 64 aes-cbc 128 encrypted "🤡" with key "1111111111111111"
                    // should always return this value
                    expect(encryptedEmoji).to.equal("ornXmW+KABncGYANn74jjQ");
                });

                it("encrypted emoji can be decrypted", async () => {
                    const decryptedEmoji = await decryptStringAesCbc(encryptedEmoji, key);
                    expect(decryptedEmoji).to.be.a("string");
                    expect(decryptedEmoji).to.not.be.empty;
                    expect(emoji).to.equal(decryptedEmoji);
                });
            });
        });
    });

    describe("encrypt and decrypt publication with rsa + aes-cbc", () => {
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
            expect(encryptedPublication.type).to.equal("aes-cbc");
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
