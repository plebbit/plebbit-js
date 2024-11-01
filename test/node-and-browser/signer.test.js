import { mockPlebbit } from "../../dist/node/test/test-util.js";
import fixtureSigners from "../fixtures/signers.js";
import { signBufferEd25519, verifyBufferEd25519 } from "../../dist/node/signer/signatures.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
const authorSignerFixture = fixtureSigners[1];

describe("signer (node and browser)", async () => {
    let plebbit, authorSigner, randomSigner;
    before(async () => {
        plebbit = await mockPlebbit();
        authorSigner = await plebbit.createSigner({ privateKey: authorSignerFixture.privateKey, type: "ed25519" });
        randomSigner = await plebbit.createSigner();
    });

    describe("signBufferEd25519 and verifyBufferEd25519", () => {
        const string = "1111111111111111";
        const uint8array = uint8ArrayFromString(string);
        const buffer = Buffer.from(string);
        let bufferSignature, uint8arraySignature;

        before(async () => {
            bufferSignature = await signBufferEd25519(buffer, authorSigner.privateKey);
            uint8arraySignature = await signBufferEd25519(uint8array, authorSigner.privateKey);
            expect(bufferSignature).to.deep.equal(uint8arraySignature);
        });

        it("can't sign strings", async () => {
            //signBufferEd25519 should not be used to sign strings it dosn't encode properly in the browser
            await assert.isRejected(signBufferEd25519(string, authorSigner.privateKey));
        });

        it("can't sign undefined", async () => {
            await assert.isRejected(signBufferEd25519(undefined, authorSigner.privateKey));
        });

        it("can sign buffers and uint8arrays", () => {
            let uint8arrayString = uint8arraySignature.toString();
            let bufferString = bufferSignature.toString();
            let expectedSignature =
                "145,1,1,240,84,73,54,189,181,56,211,49,33,29,69,96,42,76,229,31,153,64,25,84,193,191,86,237,128,166,113,158,104,201,52,143,51,223,220,198,152,31,5,98,158,146,248,126,84,220,27,176,156,108,230,198,109,197,196,165,254,220,230,8";

            expect(bufferString).to.equal(uint8arrayString);
            expect(uint8arrayString).to.equal(expectedSignature);
            expect(bufferString).to.equal(expectedSignature);
        });

        it("can verify signature", async () => {
            expect(await verifyBufferEd25519(uint8array, uint8arraySignature, authorSigner.publicKey)).to.equal(true);
            expect(await verifyBufferEd25519(buffer, bufferSignature, authorSigner.publicKey)).to.equal(true);
            expect(await verifyBufferEd25519(buffer, bufferSignature, randomSigner.publicKey)).to.equal(false);
        });
    });
});
