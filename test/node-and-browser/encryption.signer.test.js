const Plebbit = require("../../dist/node");
const fixtureSigners = require("../fixtures/signers");
const authorSignerFixture = fixtureSigners[1];
const subplebbitSignerFixture = fixtureSigners[2];
const fixtureComment = require("../fixtures/publications").comment;
const { encrypt, decrypt } = require("../../dist/node/signer");
const {
    encryptStringAesGcm,
    decryptStringAesGcm
} = require("../../dist/node/signer/encryption");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect } = chai;
const {fromString: uint8ArrayFromString} = require('uint8arrays/from-string')
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')
const { mockPlebbit } = require("../../dist/node/test/test-util");
const ed = require('@noble/ed25519')

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe.only("encryption", () => {
    let plebbit, authorSigner;

    before(async function () {
        plebbit = await mockPlebbit();
        authorSigner = await plebbit.createSigner({ privateKey: authorSignerFixture.privateKey, type: "rsa" });
    });

    // describe("encrypt and decrypt aes-gcm key buffer with rsa", () => {
    //     // key must be 16 bytes
    //     const key = uint8ArrayFromString("1111111111111111");
    //     let encryptedKey;

    //     before(async () => {
    //         encryptedKey = await encryptBufferRsa(key, authorSignerFixture.publicKey);
    //     });

    //     it("encrypted key is string of correct length", () => {
    //         expect(encryptedKey).to.be.a("string");
    //         expect(encryptedKey).to.be.of.length(342);
    //     });

    //     it("encrypted key can be decrypted", async () => {
    //         const decryptedKey = await decryptBufferRsa(encryptedKey, authorSignerFixture.privateKey);
    //         expect(toString(key)).to.equal(toString(decryptedKey));
    //     });
    // });

    // describe("generate, encrypt and decrypt aes-gcm key buffer with rsa", () => {
    //     let key, encryptedKey;

    //     before(async () => {
    //         key = await generateKeyAesgcm();
    //         encryptedKey = await encryptBufferRsa(key, authorSignerFixture.publicKey);
    //     });

    //     it("generated key is Uint8Array of correct length", () => {
    //         expect(key).to.be.instanceof(Uint8Array);
    //         expect(key).to.be.of.length(16);
    //     });

    //     it("encrypted key is string of correct length", () => {
    //         expect(encryptedKey).to.be.a("string");
    //         expect(encryptedKey).to.be.of.length(342);
    //     });

    //     it("encrypted key can be decrypted", async () => {
    //         const decryptedKey = await decryptBufferRsa(encryptedKey, authorSignerFixture.privateKey);
    //         expect(toString(key)).to.equal(toString(decryptedKey));
    //     });
    // });

    describe("encrypt and decrypt string with aes-gcm", async () => {
        describe("generated key", () => {
            let key, ciphertext, iv, tag;
            before(async () => {
                // key must be 16 bytes for aes-gcm 128
                key = ed.utils.randomPrivateKey().slice(0, 16)
                const res = await encryptStringAesGcm(JSON.stringify(fixtureComment), key);
                ciphertext = res.ciphertext
                iv = res.iv
                tag = res.tag
            });

            it("ciphertext is not empty", async () => {
                expect(ciphertext.constructor.name).to.equal("Uint8Array");
                expect(ciphertext.length).to.not.equal(0)
            });

            it("iv is not empty", async () => {
                expect(iv.constructor.name).to.equal("Uint8Array");
                expect(iv.length).to.not.equal(0)
            });

            it("tag is not empty", async () => {
                expect(tag.constructor.name).to.equal("Uint8Array");
                expect(tag.length).to.not.equal(0)
            });

            it("encrypted string can be decrypted", async () => {
                const decryptedString = await decryptStringAesGcm(ciphertext, key, iv, tag);
                expect(decryptedString).to.be.a("string");
                expect(decryptedString).to.not.be.empty;
                expect(JSON.stringify(fixtureComment)).to.equal(decryptedString);
            });
        });

        describe("fixed key and iv", () => {
            // key must be 16 bytes for aes-gcm 128
            const key = uint8ArrayFromString("1111111111111111");
            // iv must be 12 bytes
            const iv = uint8ArrayFromString("111111111111");

            describe("encrypt the word 'string'", () => {
                const string = "string";
                let ciphertext, tag, resIv
                before(async () => {
                    const res = await encryptStringAesGcm(string, key, iv);
                    ciphertext = res.ciphertext
                    tag = res.tag
                    resIv = res.iv
                });

                it("ciphertext is correct", async () => {
                    expect(ciphertext.constructor.name).to.equal("Uint8Array");
                    expect(ciphertext.length).to.not.equal(0)
                    expect(uint8ArrayToString(ciphertext, 'base64')).to.equal("LjjTphzr");
                });

                it("iv is correct", async () => {
                    expect(resIv.constructor.name).to.equal("Uint8Array");
                    expect(resIv.length).to.not.equal(0)
                    expect(uint8ArrayToString(resIv)).to.equal(uint8ArrayToString(iv));
                });

                it("tag is correct", async () => {
                    expect(tag.constructor.name).to.equal("Uint8Array");
                    expect(tag.length).to.not.equal(0)
                    expect(uint8ArrayToString(tag, 'base64')).to.equal("A+d3AWJ0NM/4t1OwLs0/lw");
                });

                it("encrypted string can be decrypted", async () => {
                    const decryptedString = await decryptStringAesGcm(ciphertext, key, iv, tag);
                    expect(decryptedString).to.be.a("string");
                    expect(decryptedString).to.not.be.empty;
                    expect(string).to.equal(decryptedString);
                });
            });

            describe("encrypt an emoji", () => {
                const emoji = "🤡";
                let ciphertext, tag
                before(async () => {
                    const res = await encryptStringAesGcm(emoji, key, iv);
                    ciphertext = res.ciphertext
                    tag = res.tag
                });

                it("encrypted emoji is not empty", async () => {
                    expect(ciphertext.constructor.name).to.equal("Uint8Array");
                    expect(ciphertext.length).to.not.equal(0)

                    // base 64 aes-gcm 128 encrypted "🤡" with key "1111111111111111" and iv "111111111111"
                    // should always return this value
                    expect(uint8ArrayToString(ciphertext, 'base64')).to.equal("rdMFbg");
                });

                it("encrypted emoji can be decrypted", async () => {
                    const decryptedEmoji = await decryptStringAesGcm(ciphertext, key, iv, tag);
                    expect(decryptedEmoji).to.be.a("string");
                    expect(decryptedEmoji).to.not.be.empty;
                    expect(emoji).to.equal(decryptedEmoji);
                });
            });
        });
    });

    describe("encrypt and decrypt publication with ed25519 + aes-gcm", () => {
        let encryptedPublication;

        before(async () => {
            encryptedPublication = await encrypt(JSON.stringify(fixtureComment), authorSignerFixture.privateKey, subplebbitSignerFixture.publicKey);
        });

        it("encrypted publication has expected properties", async () => {
            expect(encryptedPublication).to.not.equal(undefined);
            expect(encryptedPublication.ciphertext).to.be.a("string");
            expect(encryptedPublication.ciphertext).to.not.be.empty;
            expect(encryptedPublication.iv).to.be.a("string");
            expect(encryptedPublication.iv).to.not.be.empty;
            expect(encryptedPublication.tag).to.be.a("string");
            expect(encryptedPublication.tag).to.not.be.empty;
            expect(encryptedPublication.type).to.equal("ed25519-aes-gcm");
        });

        it("encrypted publication can be decrypted", async () => {
            const decryptedPublicationString = await decrypt(
                encryptedPublication,
                subplebbitSignerFixture.privateKey,
                authorSignerFixture.publicKey
            );
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
