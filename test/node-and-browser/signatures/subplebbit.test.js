const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../../dist/node/errors");
const { verifySubplebbit, signSubplebbit } = require("../../../dist/node/signer/signatures");
const { mockPlebbit } = require("../../../dist/node/test/test-util");
const lodash = require("lodash");

describe("Sign subplebbit", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Can sign and validate fixture subplebbit correctly`, async () => {
        const subFixture = lodash.cloneDeep(require("../../fixtures/valid_subplebbit.json"));
        const subFixtureClone = lodash.cloneDeep(subFixture);
        delete subFixtureClone["signature"];
        const signature = await signSubplebbit(subFixtureClone, signers[0]);
        expect(signature).to.deep.equal(subFixture.signature);
    });
    it(`Can sign and validate live subplebbit correctly`, async () => {
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const subplebbitToSign = lodash.cloneDeep(subplebbit.toJSONIpfs());

        delete subplebbitToSign["signature"];
        subplebbitToSign.signature = await signSubplebbit(subplebbitToSign, signers[0], plebbit);
        expect(subplebbitToSign.signature).to.deep.equal(subplebbit.signature);

        const verification = await verifySubplebbit(subplebbitToSign, plebbit.resolveAuthorAddresses, plebbit._clientsManager);
        expect(verification).to.deep.equal({ valid: true });
    });
});

describe("Verify subplebbit", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });

    it(`Can validate live subplebbit`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(
            await verifySubplebbit(loadedSubplebbit.toJSONIpfs(), plebbit.resolveAuthorAddresses, plebbit._clientsManager)
        ).to.deep.equal({ valid: true });
    });
    it(`Valid subplebbit fixture is validated correctly`, async () => {
        const sub = lodash.cloneDeep(require("../../fixtures/valid_subplebbit.json"));
        expect(await verifySubplebbit(sub, plebbit.resolveAuthorAddresses, plebbit._clientsManager)).to.deep.equal({ valid: true });
    });
    it(`Subplebbit with domain that does not match public key will get invalidated`, async () => {
        // plebbit.eth -> signers[3]
        const tempPlebbit = await mockPlebbit();
        tempPlebbit._clientsManager.resolveSubplebbitAddressIfNeeded = (address) =>
            address === "plebbit.eth" ? signers[4].address : address;
        const sub = await plebbit.getSubplebbit("plebbit.eth");
        const verification = await verifySubplebbit(sub.toJSONIpfs(), tempPlebbit.resolveAuthorAddresses, tempPlebbit._clientsManager);
        // Subplebbit posts will be invalid because the resolved address of sub will be used to validate posts
        expect(verification.valid).to.be.false;
    });

    it(`Invalidate a subplebbit signature if subplebbit.posts has an invalid page`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(signers[0].address);

        const subJson = loadedSubplebbit.toJSONIpfs();
        expect(await verifySubplebbit(subJson, plebbit.resolveAuthorAddresses, plebbit._clientsManager)).to.deep.equal({ valid: true });

        subJson.posts.pages.hot.comments[0].comment.content += "1234"; // Invalidate signature
        expect(await verifySubplebbit(subJson, plebbit.resolveAuthorAddresses, plebbit._clientsManager)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SUBPLEBBIT_POSTS_INVALID
        });
    });
});
