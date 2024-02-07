import signers from "../../fixtures/signers.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { messages } from "../../../dist/node/errors.js";
import { verifySubplebbit, signSubplebbit } from "../../../dist/node/signer/signatures.js";
import { mockRemotePlebbit, isRpcFlagOn } from "../../../dist/node/test/test-util.js";
import lodash from "lodash";
import validSubplebbitFixture from "../../fixtures/valid_subplebbit.json" assert { type: "json" };
import validSubplebbitWithEnsCommentsFixture from "../../fixtures/valid_subplebbit_with_ens_comments.json" assert { type: "json" };

// prettier-ignore
if (!isRpcFlagOn()) // Clients of RPC will trust the response of RPC and won't validate
describe("Sign subplebbit", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it(`Can sign and validate fixture subplebbit correctly`, async () => {
        const subFixture = lodash.cloneDeep(validSubplebbitFixture);
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

// prettier-ignore
if (!isRpcFlagOn()) // Clients of RPC will trust the response of RPC and won't validate
describe("Verify subplebbit", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`Can validate live subplebbit`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(
            await verifySubplebbit(loadedSubplebbit.toJSONIpfs(), plebbit.resolveAuthorAddresses, plebbit._clientsManager)
        ).to.deep.equal({ valid: true });
    });
    it(`Valid subplebbit fixture is validated correctly`, async () => {
        const sub = lodash.cloneDeep(validSubplebbitFixture);
        expect(await verifySubplebbit(sub, plebbit.resolveAuthorAddresses, plebbit._clientsManager)).to.deep.equal({ valid: true });
    });
    it(`Subplebbit with domain that does not match public key will get invalidated`, async () => {
        // plebbit.eth -> signers[3]
        const tempPlebbit = await mockRemotePlebbit();
        tempPlebbit._clientsManager.resolveSubplebbitAddressIfNeeded = (address) =>
            address === "plebbit.eth" ? signers[4].address : address;
        const sub = await plebbit.getSubplebbit("plebbit.eth");
        const verification = await verifySubplebbit(sub.toJSONIpfs(), tempPlebbit.resolveAuthorAddresses, tempPlebbit._clientsManager);
        // Subplebbit posts will be invalid because the resolved address of sub will be used to validate posts
        expect(verification.valid).to.be.false;
    });

    it(`subplebbit signature is invalid if subplebbit.posts has an invalid comment signature `, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(signers[0].address);

        const subJson = loadedSubplebbit.toJSONIpfs();
        expect(await verifySubplebbit(subJson, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false)).to.deep.equal({
            valid: true
        });

        subJson.posts.pages.hot.comments[0].comment.content += "1234"; // Invalidate signature
        expect(await verifySubplebbit(subJson, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID
        });
    });

    it(`subplebbit signature is valid if subplebbit.posts has a comment.authorAddress who resolves to an invalid address (overrideAuthorAddressIfInvalid=true)`, async () => {
        // Publish a comment with ENS domain here

        const subJson = lodash.cloneDeep(validSubplebbitWithEnsCommentsFixture); // This json has only one comment with plebbit.eth
        const commentWithEnsCid = subJson.posts.pages.hot.comments.find((comment) => comment.comment.author.address === "plebbit.eth")
            .comment.cid;

        const getLatestComment = () => subJson.posts.pages.hot.comments.find((comment) => comment.comment.cid === commentWithEnsCid);

        const tempPlebbit = await mockRemotePlebbit();

        const originalResolveAuthor = plebbit._clientsManager.resolveAuthorAddressIfNeeded;
        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "plebbit.eth" ? signers[7].address : originalResolveAuthor(authorAddress);

        expect(getLatestComment().comment.author.address).to.equal("plebbit.eth");
        expect(await verifySubplebbit(subJson, tempPlebbit.resolveAuthorAddresses, tempPlebbit._clientsManager, true)).to.deep.equal({
            valid: true
        });

        // The author.address should be overridden here
        expect(getLatestComment().comment.author.address).to.equal(signers[6].address);
    });
});
