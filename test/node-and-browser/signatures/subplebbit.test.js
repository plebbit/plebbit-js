const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../../dist/node/errors");
const { verifySubplebbit, signSubplebbit } = require("../../../dist/node/signer/signatures");
const { mockPlebbit } = require("../../../dist/node/test/test-util");

describe("Sign subplebbit", async () => {
    let subplebbit, plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (address) =>
            address === "plebbit.eth" ? await signers[3].getAddress() : address;
        subplebbit = await plebbit.getSubplebbit(await signers[0].getAddress());
    });
    it(`Can sign and validate subplebbit correctly`, async () => {
        const subplebbitToSign = JSON.parse(JSON.stringify(subplebbit.toJSON()));
        const subSigner = signers[7]; // Random signer

        subplebbitToSign.posts.pages = {};
        subplebbitToSign.address = await subSigner.getAddress();
        subplebbitToSign.signature = await signSubplebbit(subplebbitToSign, subSigner);

        const verification = await verifySubplebbit(subplebbitToSign, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });
});

describe("Verify subplebbit", async () => {
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (address) =>
            address === "plebbit.eth" ? await signers[3].getAddress() : address;
        subplebbit = await plebbit.getSubplebbit(await signers[0].getAddress());
    });

    it(`Can validate live subplebbit`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(await signers[0].getAddress());
        expect(await verifySubplebbit(loadedSubplebbit, plebbit)).to.deep.equal({ valid: true });
    });
    it(`Valid subplebbit fixture is validated correctly`, async () => {
        const sub = JSON.parse(JSON.stringify(require("../../fixtures/valid_subplebbit.json")));
        expect(await verifySubplebbit(sub, plebbit)).to.deep.equal({ valid: true });
    });
    it(`Subplebbit with domain that does not match public key will get invalidated`, async () => {
        // plebbit.eth -> signers[3]
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveSubplebbitAddressIfNeeded = async (address) =>
            address === "plebbit.eth" ? await signers[4].getAddress() : address;
        const sub = await plebbit.getSubplebbit("plebbit.eth");
        const verification = await verifySubplebbit(sub.toJSON(), tempPlebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY });
    });

    it(`Invalidate a subplebbit signature if subplebbit.posts has an invalid page`, async () => {
        const sub = subplebbit.toJSON();
        expect(await verifySubplebbit(sub, plebbit)).to.deep.equal({ valid: true });

        sub.posts.pages.hot.comments[0].content += "1234"; // Invalidate signature
        expect(await verifySubplebbit(sub, plebbit)).to.deep.equal({ valid: false, reason: messages.ERR_SUBPLEBBIT_POSTS_INVALID });
    });
});
