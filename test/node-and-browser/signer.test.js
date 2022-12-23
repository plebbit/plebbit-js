const Plebbit = require("../../dist/node");
const fixtureSigners = require("../fixtures/signers");
const authorSignerFixture = fixtureSigners[1];
const { signBufferRsa, verifyBufferRsa } = require("../../dist/node/signer/signatures");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { toString } = require("uint8arrays/to-string");
const { fromString } = require("uint8arrays/from-string");
const { Buffer } = require("buffer");
const { mockPlebbit } = require("../../dist/node/test/test-util");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("signer (node and browser)", async () => {
    let plebbit, authorSigner, randomSigner;
    before(async () => {
        plebbit = await mockPlebbit();
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
            expect(bufferSignature).to.deep.equal(uint8arraySignature);
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
});
