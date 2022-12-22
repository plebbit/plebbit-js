const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../../dist/node/errors");
const { verifySubplebbit, signSubplebbit } = require("../../../dist/node/signer/signatures");
const { mockPlebbit } = require("../../../dist/node/test/test-util");
const stringify = require("safe-stable-stringify");

const signSubplebbitJsonAlongWithObject = async (subplebbitJson, signer, plebbit) => {
    const subplebbitJsonSignature = await signSubplebbit(JSON.parse(JSON.stringify(subplebbitJson)), signer);
    const subplebbitObj = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(subplebbitJson)));
    expect(subplebbitJson.encryption).to.deep.equal(subplebbitObj.encryption);
    const subplebbitObjSignature = await signSubplebbit(subplebbitObj, signer);
    expect(subplebbitJsonSignature).to.deep.equal(subplebbitObjSignature);
    return subplebbitJsonSignature;
};

const verifySubplebbitJsonAlongWithObject = async (subplebbitJson, plebbit) => {
    const subplebbitObjRes = await verifySubplebbit(await plebbit.createSubplebbit(subplebbitJson), plebbit);
    const subplebbitJsonRes = await verifySubplebbit(subplebbitJson, plebbit);
    expect(subplebbitObjRes).to.deep.equal(subplebbitJsonRes);
    return subplebbitObjRes;
};

describe("Sign subplebbit", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = (address) => (address === "plebbit.eth" ? signers[3].address : address);
    });
    it(`Can sign and validate fixture subplebbit correctly`, async () => {
        const subFixture = JSON.parse(JSON.stringify(require("../../fixtures/valid_subplebbit.json")));
        const subFixtureClone = JSON.parse(JSON.stringify(subFixture));
        delete subFixtureClone["signature"];
        const signature = await signSubplebbitJsonAlongWithObject(subFixtureClone, signers[0], plebbit);
        expect(stringify(signature)).to.equal(stringify(subFixture.signature));
    });
    it(`Can sign and validate live subplebbit correctly`, async () => {
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const subplebbitToSign = JSON.parse(JSON.stringify(subplebbit.toJSON()));

        delete subplebbitToSign["signature"];
        subplebbitToSign.signature = await signSubplebbitJsonAlongWithObject(subplebbitToSign, signers[0], plebbit);
        expect(stringify(subplebbitToSign.signature)).to.equal(stringify(subplebbit.signature));

        const verification = await verifySubplebbitJsonAlongWithObject(subplebbitToSign, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });
});

describe("Verify subplebbit", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = (address) => (address === "plebbit.eth" ? signers[3].address : address);
    });

    it(`Can validate live subplebbit`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(await verifySubplebbitJsonAlongWithObject(loadedSubplebbit, plebbit)).to.deep.equal({ valid: true });
    });
    it(`Valid subplebbit fixture is validated correctly`, async () => {
        const sub = JSON.parse(JSON.stringify(require("../../fixtures/valid_subplebbit.json")));
        expect(await verifySubplebbitJsonAlongWithObject(sub, plebbit)).to.deep.equal({ valid: true });
    });
    it(`Subplebbit with domain that does not match public key will get invalidated`, async () => {
        // plebbit.eth -> signers[3]
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveSubplebbitAddressIfNeeded = (address) => (address === "plebbit.eth" ? signers[4].address : address);
        const sub = await plebbit.getSubplebbit("plebbit.eth");
        const verification = await verifySubplebbitJsonAlongWithObject(sub.toJSON(), tempPlebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY });
    });

    it(`Invalidate a subplebbit signature if subplebbit.posts has an invalid page`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(signers[0].address);

        const subJson = loadedSubplebbit.toJSON();
        expect(await verifySubplebbitJsonAlongWithObject(subJson, plebbit)).to.deep.equal({ valid: true });

        subJson.posts.pages.hot.comments[0].content += "1234"; // Invalidate signature
        expect(await verifySubplebbitJsonAlongWithObject(subJson, plebbit)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SUBPLEBBIT_POSTS_INVALID
        });
    });
});
