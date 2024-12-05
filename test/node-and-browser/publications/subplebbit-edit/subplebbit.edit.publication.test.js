import { messages } from "../../../../dist/node/errors";
import { getRemotePlebbitConfigs, publishWithExpectedResult, resolveWhenConditionIsTrue } from "../../../../dist/node/test/test-util.js";
import signers from "../../../fixtures/signers.js";
import { expect } from "chai";
import * as remeda from "remeda";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];
getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.createSubplebbitEdit - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Can parse edit args with no problems in plebbit.createSubplebbitEdit`, async () => {
            const description = "New description" + Math.random();
            const signer = await plebbit.createSigner();
            const subplebbitEdit = await plebbit.createSubplebbitEdit({ subplebbitEdit: { description }, subplebbitAddress, signer });

            expect(subplebbitEdit.subplebbitEdit.description).to.equal(description);
            expect(subplebbitEdit.subplebbitAddress).to.equal(subplebbitAddress);
            expect(subplebbitEdit.author.address).to.equal(signer.address);
        });

        it(`(subplebbitEdit: SubplebbitEdit) === plebbit.createSubplebbitEdit(JSON.parse(JSON.stringify(subplebbitEdit)))`, async () => {
            const description = "New description" + Math.random();
            const signer = await plebbit.createSigner();
            const subplebbitEdit = await plebbit.createSubplebbitEdit({ subplebbitEdit: { description }, subplebbitAddress, signer });
            const subplebbitEditFromStringifiedSubplebbitEdit = await plebbit.createSubplebbitEdit(
                JSON.parse(JSON.stringify(subplebbitEdit))
            );
            const jsonPropsToOmit = ["clients"];

            const subplebbitEditJson = remeda.omit(JSON.parse(JSON.stringify(subplebbitEdit)), jsonPropsToOmit);
            const stringifiedSubplebbitEditJson = remeda.omit(
                JSON.parse(JSON.stringify(subplebbitEditFromStringifiedSubplebbitEdit)),
                jsonPropsToOmit
            );
            expect(subplebbitEditJson.signer).to.be.a("object").and.to.deep.equal(stringifiedSubplebbitEditJson.signer); // make sure internal props like signer are copied properly
            expect(subplebbitEditJson).to.deep.equal(stringifiedSubplebbitEditJson);
        });

        it(`Can publish a SubplebbitEdit that was created from jsonfied SubplebbitEdit instance`, async () => {
            const description = "New description" + Math.random();
            const ownerSigner = await plebbit.createSigner(roles[0].signer);
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: { description },
                subplebbitAddress,
                signer: ownerSigner
            });
            const subplebbitEditFromStringifiedSubplebbitEdit = await plebbit.createSubplebbitEdit(
                JSON.parse(JSON.stringify(subplebbitEdit))
            );
            expect(subplebbitEdit.signer.address).to.equal(subplebbitEditFromStringifiedSubplebbitEdit.signer.address);
            const challengeRequestPromise = new Promise((resolve) =>
                subplebbitEditFromStringifiedSubplebbitEdit.once("challengerequest", resolve)
            );

            await publishWithExpectedResult(subplebbitEditFromStringifiedSubplebbitEdit, true);
            const challengerequest = await challengeRequestPromise;
            expect(challengerequest.subplebbitEdit).to.deep.equal(subplebbitEdit.toJSONPubsubMessagePublication());

            expect(subplebbitEdit.toJSONPubsubMessagePublication()).to.deep.equal(
                subplebbitEditFromStringifiedSubplebbitEdit.toJSONPubsubMessagePublication()
            );
            expect(subplebbitEdit.toJSONPubsubRequestToEncrypt()).to.deep.equal(
                subplebbitEditFromStringifiedSubplebbitEdit.toJSONPubsubRequestToEncrypt()
            );
        });
    });

    describe(`Editing a subplebbit remotely as a non admin/owner - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`A moderator publishing a SubplebbitEdit should fail`, async () => {
            const signer = await plebbit.createSigner(roles[2].signer);
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: { description: "Test desc from " + Math.random() },
                subplebbitAddress,
                signer
            });
            await publishWithExpectedResult(
                subplebbitEdit,
                false,
                messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_SUB_WITHOUT_BEING_OWNER_OR_ADMIN
            );
        });

        it(`A random author publishing a SubplebbitEdit should fail`, async () => {
            const signer = await plebbit.createSigner();
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: { description: "Test 12" + Math.random() },
                subplebbitAddress,
                signer
            });
            await publishWithExpectedResult(
                subplebbitEdit,
                false,
                messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_SUB_WITHOUT_BEING_OWNER_OR_ADMIN
            );
        });
    });

    describe(`Editing a sub remotely as a admin - ${config.name}`, async () => {
        let plebbit;

        let editProps;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Admin should not be able to publish SubplebbitEdit with edit.roles`, async () => {
            const adminSigner = await plebbit.createSigner(roles[1].signer);
            const authorAddress = (await plebbit.createSigner()).address;
            editProps = { description: "Test" + Math.random(), roles: { [authorAddress]: { role: "admin" } } };
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: editProps,
                subplebbitAddress,
                signer: adminSigner
            });
            await publishWithExpectedResult(subplebbitEdit, false, messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_OWNER_EXCLUSIVE_PROPS);
        });

        it(`Admin should not be able to publish SubplebbitEdit with edit.address`, async () => {
            const adminSigner = await plebbit.createSigner(roles[1].signer);
            editProps = { description: "Test" + Math.random(), address: "newaddress.eth" };
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: editProps,
                subplebbitAddress,
                signer: adminSigner
            });
            await publishWithExpectedResult(subplebbitEdit, false, messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_MODIFY_OWNER_EXCLUSIVE_PROPS);
        });

        it(`Admin should not be able to modify settings`, async () => {
            const adminSigner = await plebbit.createSigner(roles[1].signer);
            const editProps = { description: "Test" + Math.random(), settings: { fetchThumbnailUrls: true } };
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: editProps,
                subplebbitAddress,
                signer: adminSigner
            });
            await publishWithExpectedResult(subplebbitEdit, false, messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_NON_PUBLIC_PROPS);
        });

        it(`Admin should be able to modify subplebbit props via SubplebbitEdit`, async () => {
            const adminSigner = await plebbit.createSigner(roles[1].signer);
            editProps = { description: "Test" + Math.random() };
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: editProps,
                subplebbitAddress,
                signer: adminSigner
            });
            await publishWithExpectedResult(subplebbitEdit, true);
        });

        it(`Subplebbit should publish an update after the admin edits one of its props`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();
            await resolveWhenConditionIsTrue(sub, () => sub.description === editProps.description);
            await sub.stop();
            expect(sub.description).to.equal(editProps.description);
        });

        it(`Subplebbit edit props should be deep merged`);
    });

    describe(`Editing a sub remotely as an owner - ${config.name}`, async () => {
        let plebbit;

        let newRoleAddress;
        let editProps = {};

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`sub owner should be able to modify address`, async () => {
            const ownerSigner = await plebbit.createSigner(roles[0].signer);
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: { address: sub.address }, // we're not changing the address because it's a sub used by other tests as well. But if the test pass it means {address} was passed over to sub.edit which is enough for our testing
                subplebbitAddress,
                signer: ownerSigner
            });
            await publishWithExpectedResult(subplebbitEdit, true);
        });
        it(`Sub owner should be able to modify roles`, async () => {
            const ownerSigner = await plebbit.createSigner(roles[0].signer);
            newRoleAddress = (await plebbit.createSigner()).address;
            editProps = { ...editProps, description: "Test" + Math.random(), roles: { [newRoleAddress]: { role: "admin" } } };
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: editProps,
                subplebbitAddress,
                signer: ownerSigner
            });
            await publishWithExpectedResult(subplebbitEdit, true);
        });

        it(`Owner should not be able to modify settings`, async () => {
            const modSigner = await plebbit.createSigner(roles[0].signer);
            const editProps = { description: "Test" + Math.random(), settings: { fetchThumbnailUrls: true } };
            const subplebbitEdit = await plebbit.createSubplebbitEdit({
                subplebbitEdit: editProps,
                subplebbitAddress,
                signer: modSigner
            });
            await publishWithExpectedResult(subplebbitEdit, false, messages.ERR_SUBPLEBBIT_EDIT_ATTEMPTED_TO_NON_PUBLIC_PROPS);
        });

        it(`Subplebbit should publish an update after the owner edits one of its props`, async () => {
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub.update();
            await resolveWhenConditionIsTrue(sub, () => sub.description === editProps.description);
            await sub.stop();
            expect(sub.description).to.equal(editProps.description);
            expect(sub.roles[newRoleAddress].role).to.equal("admin");
            expect(Object.keys(sub.roles).length).to.be.above(1); // should not override other roles
        });

        it(`Subplebbit edit props should be deep merged`);
    });
});
