import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import { mockRemotePlebbit, describeSkipIfRpc, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import { messages } from "../../../dist/node/errors.js";
import { verifySubplebbit, signSubplebbit, cleanUpBeforePublishing, _signJson } from "../../../dist/node/signer/signatures.js";
import * as remeda from "remeda";
import validSubplebbitFixture from "../../fixtures/signatures/subplebbit/valid_subplebbit_ipfs.json" with { type: "json" };
import { removeUndefinedValuesRecursively } from "../../../dist/node/util.js";

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc.concurrent("Sign subplebbit", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Can sign and validate fixture subplebbit correctly`, async () => {
        const subFixture = remeda.clone(validSubplebbitFixture);
        const subFixtureClone = remeda.clone(subFixture);
        delete subFixtureClone["signature"];
        const signature = await signSubplebbit({ subplebbit: subFixtureClone, signer: signers[0] });
        expect(signature.signature).to.equal(subFixture.signature.signature);
        expect(signature.publicKey).to.equal(subFixture.signature.publicKey);
        expect(signature.signedPropertyNames.sort()).to.deep.equal(subFixture.signature.signedPropertyNames.sort());
        expect(signature.type).to.equal(subFixture.signature.type);
    });
    it(`Can sign and validate live subplebbit correctly`, async () => {
        const subplebbit = await plebbit.getSubplebbit({ address: signers[0].address });
        const subjsonIpfs = subplebbit.toJSONIpfs();
        const subplebbitToSign = { ...cleanUpBeforePublishing(subjsonIpfs), posts: removeUndefinedValuesRecursively(subjsonIpfs.posts) };
        delete subplebbitToSign["signature"];
        subplebbitToSign.signature = await signSubplebbit({ subplebbit: subplebbitToSign, signer: signers[0] });
        expect(subplebbitToSign.signature).to.deep.equal(subplebbit.signature);

        const verification = await verifySubplebbit({
            subplebbit: subplebbitToSign,
            subplebbitIpnsName: signers[0].address,
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: plebbit._clientsManager,
            overrideAuthorAddressIfInvalid: false,
            validatePages: true,
            cacheIfValid: false
        });
        expect(verification).to.deep.equal({ valid: true });
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc.concurrent("Verify subplebbit", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Can validate live subplebbit`, async () => {
        const loadedSubplebbit = await plebbit.createSubplebbit({ address: signers[0].address });
        await loadedSubplebbit.update();
        await resolveWhenConditionIsTrue({ toUpdate: loadedSubplebbit, predicate: () => typeof loadedSubplebbit.updatedAt === "number" });

        expect(
            await verifySubplebbit({
                subplebbit: loadedSubplebbit.toJSONIpfs(),
                subplebbitIpnsName: signers[0].address,
                resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
                clientsManager: plebbit._clientsManager,
                overrideAuthorAddressIfInvalid: false,
                validatePages: true,
                cacheIfValid: false
            })
        ).to.deep.equal({ valid: true });
    });
    it(`Valid subplebbit fixture is validated correctly`, async () => {
        const sub = remeda.clone(validSubplebbitFixture);
        expect(
            await verifySubplebbit({
                subplebbit: sub,
                subplebbitIpnsName: signers[0].address,
                resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
                clientsManager: plebbit._clientsManager,
                overrideAuthorAddressIfInvalid: false,
                validatePages: true,
                cacheIfValid: false
            })
        ).to.deep.equal({ valid: true });
    });
    it(`Subplebbit with domain that does not match public key will get invalidated`, async () => {
        // plebbit.eth -> signers[3]
        const tempPlebbit = await mockRemotePlebbit();
        tempPlebbit._clientsManager.resolveSubplebbitAddressIfNeeded = (address) =>
            address === "plebbit.eth" ? signers[4].address : address;
        const sub = await plebbit.createSubplebbit({ address: "plebbit.eth" });
        await sub.update();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        const verification = await verifySubplebbit({
            subplebbit: sub.toJSONIpfs(),
            subplebbitIpnsName: signers[4].address,
            resolveAuthorAddresses: tempPlebbit.resolveAuthorAddresses,
            clientsManager: tempPlebbit._clientsManager,
            overrideAuthorAddressIfInvalid: false,
            validatePages: true,
            cacheIfValid: false
        });
        // Subplebbit posts will be invalid because the resolved address of sub will be used to validate posts
        expect(verification.valid).to.be.false;
        await tempPlebbit.destroy();
    });

    it(`subplebbit signature is invalid if subplebbit.posts has an invalid comment signature `, async () => {
        const loadedSubplebbit = await plebbit.createSubplebbit({ address: signers[0].address });
        await loadedSubplebbit.update();
        await resolveWhenConditionIsTrue({ toUpdate: loadedSubplebbit, predicate: () => typeof loadedSubplebbit.updatedAt === "number" });

        await loadedSubplebbit.stop();
        const subJson = remeda.clone(loadedSubplebbit.toJSONIpfs());
        expect(
            await verifySubplebbit({
                subplebbit: subJson,
                subplebbitIpnsName: signers[0].address,
                resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
                clientsManager: plebbit._clientsManager,
                overrideAuthorAddressIfInvalid: false,
                validatePages: false
            })
        ).to.deep.equal({
            valid: true
        });

        subJson.posts.pages.hot.comments[0].comment.content += "1234"; // Invalidate signature
        expect(
            await verifySubplebbit({
                subplebbit: subJson,
                subplebbitIpnsName: signers[0].address,
                resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
                clientsManager: plebbit._clientsManager,
                overrideAuthorAddressIfInvalid: false,
                validatePages: false
            })
        ).to.deep.equal({
            valid: false,
            reason: messages.ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID
        });
    });

    it(`subplebbit signature is valid if subplebbit.posts has a comment.author.address who resolves to an invalid address (overrideAuthorAddressIfInvalid=true)`, async () => {
        // Publish a comment with ENS domain here

        const subIpfs = remeda.clone(validSubplebbitFixture); // This json has only one comment with plebbit.eth
        const commentWithEnsCid = subIpfs.posts.pages.hot.comments.find(
            (commentPage) => commentPage.comment.author.address === "plebbit.eth"
        ).commentUpdate.cid;
        expect(commentWithEnsCid).to.be.a("string");

        const getLatestComment = () => subIpfs.posts.pages.hot.comments.find((comment) => comment.commentUpdate.cid === commentWithEnsCid);

        const tempPlebbit = await mockRemotePlebbit();

        const originalResolveAuthor = plebbit._clientsManager.resolveAuthorAddressIfNeeded;
        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "plebbit.eth" ? signers[7].address : originalResolveAuthor(authorAddress);

        expect(getLatestComment().comment.author.address).to.equal("plebbit.eth");
        expect(
            await verifySubplebbit({
                subplebbit: subIpfs,
                subplebbitIpnsName: signers[0].address,
                resolveAuthorAddresses: tempPlebbit.resolveAuthorAddresses,
                clientsManager: tempPlebbit._clientsManager,
                overrideAuthorAddressIfInvalid: true,
                validatePages: true
            })
        ).to.deep.equal({
            valid: true
        });

        // The author.address should be overridden here
        expect(getLatestComment().comment.author.address).to.equal(signers[6].address);
        await tempPlebbit.destroy();
    });

    it(`A subplebbit record is rejected if it includes a field not in signature.signedPropertyNames`, async () => {
        const tempPlebbit = await mockRemotePlebbit();

        const subFixture = remeda.clone(validSubplebbitFixture);
        const subFixtureClone = remeda.clone(subFixture);
        subFixtureClone.extraProp = "1234";
        const signature = await signSubplebbit({ subplebbit: subFixtureClone, signer: signers[0] });
        expect(signature.signature).to.equal(subFixture.signature.signature);
        expect(signature.publicKey).to.equal(subFixture.signature.publicKey);
        expect(signature.signedPropertyNames.sort()).to.deep.equal(subFixture.signature.signedPropertyNames.sort());
        expect(signature.type).to.equal(subFixture.signature.type);

        expect(signature.signedPropertyNames).to.not.include("extraProp");

        const validation = await verifySubplebbit({
            subplebbit: subFixtureClone,
            subplebbitIpnsName: signers[0].address,
            resolveAuthorAddresses: tempPlebbit.resolveAuthorAddresses,
            clientsManager: tempPlebbit._clientsManager,
            overrideAuthorAddressIfInvalid: true,
            validatePages: true
        });
        expect(validation).to.deep.equal({
            valid: false,
            reason: messages.ERR_SUBPLEBBIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
        });
        await tempPlebbit.destroy();
    });

    it(`A subplebbit record is accepted if it includes an extra prop as long as it's in signature.signedPropertyNames`, async () => {
        const tempPlebbit = await mockRemotePlebbit();

        const subFixture = remeda.clone(validSubplebbitFixture);
        const subFixtureClone = remeda.clone(subFixture);
        subFixtureClone.extraProp = "1234";
        const signature = await _signJson([...subFixture.signature.signedPropertyNames, "extraProp"], subFixtureClone, signers[0]);
        expect(signature.signedPropertyNames).to.include("extraProp");

        subFixtureClone.signature = signature;

        const validation = await verifySubplebbit({
            subplebbit: subFixtureClone,
            subplebbitIpnsName: signers[0].address,
            resolveAuthorAddresses: tempPlebbit.resolveAuthorAddresses,
            clientsManager: tempPlebbit._clientsManager,
            overrideAuthorAddressIfInvalid: true,
            validatePages: true
        });
        expect(validation).to.deep.equal({
            valid: true
        });
        await tempPlebbit.destroy();
    });
});
