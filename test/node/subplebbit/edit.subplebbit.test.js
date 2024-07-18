import {
    publishRandomPost,
    mockPlebbit,
    loadAllPages,
    createSubWithNoChallenge,
    mockRemotePlebbitIpfsOnly,
    resolveWhenConditionIsTrue,
    describeSkipIfRpc,
    describeIfRpc,
    mockRemotePlebbit
} from "../../../dist/node/test/test-util";
import { POSTS_SORT_TYPES } from "../../../dist/node/pages/util";
import { timestamp } from "../../../dist/node/util";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import fs from "fs";
import path from "path";
import * as remeda from "remeda";
import * as resolverClass from "../../../dist/node/resolver";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { v4 as uuidV4 } from "uuid";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describeSkipIfRpc(`subplebbit.edit`, async () => {
    let plebbit, subplebbit, postToPublishAfterEdit, ethAddress;
    before(async () => {
        const testEthRpc = `https://testEthRpc-${uuidV4()}.com`;
        plebbit = await mockPlebbit({ chainProviders: { eth: { urls: [testEthRpc], chainId: 1 } } }, true, false);
        subplebbit = await createSubWithNoChallenge({}, plebbit, 1000);
        ethAddress = `test-edit-${uuidV4()}.eth`;

        resolverClass.viemClients["eth" + testEthRpc] = {
            getEnsText: ({ name, key }) => {
                if (name === ethAddress && key === "subplebbit-address") return subplebbit.signer.address;
                else return null;
            }
        };

        await plebbit.resolveAuthorAddress("esteban.eth");
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await publishRandomPost(subplebbit.address, plebbit);
    });
    after(async () => {
        await subplebbit.stop();
    });

    [{ title: `Test subplebbit title edit ${Date.now()}` }, { description: `Test subplebbit description edit ${Date.now()}` }].map(
        (editArgs) =>
            it(`subplebbit.edit(${JSON.stringify(editArgs)})`, async () => {
                const [keyToEdit, newValue] = Object.entries(editArgs)[0];
                await subplebbit.edit(editArgs);
                expect(subplebbit[keyToEdit]).to.equal(newValue);
                const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
                await loadedSubplebbit.update();
                await resolveWhenConditionIsTrue(loadedSubplebbit, () => loadedSubplebbit[keyToEdit] === newValue);
                loadedSubplebbit.stop();
                expect(loadedSubplebbit[keyToEdit]).to.equal(newValue);
                expect(deterministicStringify(loadedSubplebbit.toJSON())).to.equal(deterministicStringify(subplebbit.toJSON()));
            })
    );

    it(`Sub is locked for start`, async () => {
        // Check for locks
        expect(await subplebbit.dbHandler.isSubStartLocked(subplebbit.signer.address)).to.be.true;
    });

    it(`Can edit a subplebbit to have ENS domain as address`, async () => {
        expect(subplebbit.posts.pages).to.not.deep.equal({});
        await subplebbit.edit({ address: ethAddress });
        expect(subplebbit.address).to.equal(ethAddress);
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.address).to.equal(ethAddress);
    });

    it(`plebbit.listSubplebbit includes the new ENS address, and not the old address`, async () => {
        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2)); // wait until db has been renamed
        const subs = await plebbit.listSubplebbits();
        expect(subs).to.include(ethAddress);
        expect(subs).to.not.include(subplebbit.signer.address);
    });

    it(`Local subplebbit resets posts after changing address`, async () => {
        expect(subplebbit.posts.pages).to.deep.equal({});
        expect(subplebbit.posts.pageCids).to.deep.equal({});
    });

    it(`Start locks are moved to the new address`, async () => {
        // Check for locks
        expect(fs.existsSync(path.join(subplebbit.plebbit.dataPath, "subplebbits", `${subplebbit.signer.address}.start.lock`))).to.be.false;
        expect(fs.existsSync(path.join(subplebbit.plebbit.dataPath, "subplebbits", `${ethAddress}.start.lock`))).to.be.true;
    });

    it(`Can load a subplebbit with ENS domain as address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(ethAddress);
        expect(loadedSubplebbit.address).to.equal(ethAddress);
        expect(deterministicStringify(loadedSubplebbit)).to.equal(deterministicStringify(subplebbit));
    });

    it(`remote subplebbit.posts is reset after changing address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(ethAddress);
        // subplebbit.posts should omit all comments that referenced the old subplebbit address
        // So in essence it be undefined
        expect(loadedSubplebbit.posts.pages).to.deep.equal({});
        expect(loadedSubplebbit.posts.pageCids).to.deep.equal({});
    });

    it(`Started Sub can receive publications on new ENS address`, async () => {
        postToPublishAfterEdit = await publishRandomPost(ethAddress, plebbit);
    });

    it(`Posts submitted to new sub address are shown in subplebbit.posts`, async () => {
        await resolveWhenConditionIsTrue(subplebbit, () =>
            subplebbit?.posts?.pages?.hot?.comments?.some((comment) => comment.cid === postToPublishAfterEdit.cid)
        );
        expect(Object.keys(subplebbit.posts.pageCids).sort()).to.deep.equal(Object.keys(POSTS_SORT_TYPES).sort());
        expect(Object.values(subplebbit.posts.pageCids)).to.deep.equal(
            new Array(Object.keys(subplebbit.posts.pageCids).length).fill(Object.values(subplebbit.posts.pageCids)[0])
        ); // All cids should be the same since it's just one post, so the sort result should be the same for all pages

        for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
            const pageComments = await loadAllPages(pageCid, subplebbit.posts);
            expect(pageComments.length).to.equal(1);
            expect(pageComments[0].cid).to.equal(postToPublishAfterEdit.cid);
        }
    });
});

describeSkipIfRpc(`Concurrency with subplebbit.edit`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    it("Two unstarted local sub instances can receive each other updates with subplebbit.update and edit", async () => {
        const subOne = await createSubWithNoChallenge({}, plebbit);
        // subOne is published now
        const subTwo = await createSubWithNoChallenge({ address: subOne.address }, plebbit);
        await subTwo.update();

        const newTitle = "Test new Title" + Date.now();
        await subOne.edit({ title: newTitle });
        expect(subOne.title).to.equal(newTitle);

        await new Promise((resolve) => subTwo.once("update", resolve));

        expect(subTwo.title).to.equal(newTitle);
        expect(deterministicStringify(subTwo.toJSON())).to.equal(deterministicStringify(subOne.toJSON()));

        subOne.stop();
        subTwo.stop();
    });

    [
        { address: `address-eth-${uuidV4()}-1.eth` },
        { rules: ["rule 1", "rule 2"] },
        { address: `address-eth-${uuidV4()}-2.eth`, rules: ["rule 1", "rule 2"] }
    ].map((editArgs) =>
        it(`edit subplebbit with multiple subplebbit instances running (${Object.keys(editArgs)})`, async () => {
            const ethRpcTest = `https://testEthRpc${uuidV4()}.com`;
            const plebbit = await mockPlebbit({ chainProviders: { eth: { urls: [ethRpcTest], chainId: 1 } } });
            // create subplebbit
            const subplebbitTitle = "subplebbit title" + timestamp();
            const subplebbit = await plebbit.createSubplebbit({ title: subplebbitTitle });
            if (editArgs.address)
                resolverClass.viemClients["eth" + ethRpcTest] = {
                    getEnsText: ({ name, key }) => {
                        if (name === editArgs.address && key === "subplebbit-address") return subplebbit.signer.address;
                        else return null;
                    }
                };

            // subplebbit is updating
            const updatingSubplebbit = await createSubWithNoChallenge({ address: subplebbit.address }, plebbit);
            expect(updatingSubplebbit.signer).to.be.a("object");
            expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
            await updatingSubplebbit.update();

            // start subplebbit
            const startedSubplebbit = await createSubWithNoChallenge({ address: subplebbit.address }, plebbit);
            await startedSubplebbit.start();

            expect(startedSubplebbit.title).to.equal(subplebbitTitle);

            let editIsFinished;
            const updateEventPromise = new Promise((resolve) =>
                updatingSubplebbit.on("update", (updatedSubplebbit) => editIsFinished && resolve(updatedSubplebbit))
            );

            const updateStartedSubEventPromise = new Promise((resolve) =>
                startedSubplebbit.on("update", (updatedSubplebbit) => editIsFinished && resolve(updatedSubplebbit))
            );

            // edit subplebbit
            console.log("editSubplebbit");
            const editedSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
            await editedSubplebbit.edit(editArgs);

            editIsFinished = true;
            const updatedSubplebbit = await updateEventPromise;
            updatingSubplebbit.removeAllListeners("update");
            expect(editedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(deterministicStringify(editedSubplebbit[editKey])).to.equal(deterministicStringify(editValue));

            // wait for subplebbit update
            // both started and updating subplebbit should now have the subplebbit edit
            console.log("wait for subplebbit update");

            expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(deterministicStringify(updatingSubplebbit[editKey])).to.equal(deterministicStringify(editValue));

            expect(updatedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(deterministicStringify(updatedSubplebbit[editKey])).to.equal(deterministicStringify(editValue));

            await updatingSubplebbit.stop();

            console.log("Before await updateStartedSubEventPromise");
            await updateStartedSubEventPromise;

            expect(startedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs)) {
                if (deterministicStringify(startedSubplebbit[editKey]) !== deterministicStringify(editValue))
                    await new Promise((resolve) => startedSubplebbit.once("update", resolve)); // Wait until the new props are included in the next update
                expect(deterministicStringify(startedSubplebbit[editKey])).to.equal(deterministicStringify(editValue));
            }

            await startedSubplebbit.stop();

            expect(subplebbit.rules).to.equal(undefined);

            const newlyCreatedSubplebbit = await plebbit.createSubplebbit({ address: startedSubplebbit.address });
            expect(newlyCreatedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(deterministicStringify(newlyCreatedSubplebbit[editKey])).to.equal(deterministicStringify(editValue));
        })
    );

    it(`Can edit a local sub address, then start it`, async () => {
        const ethRpcTest = `https://testEthRpc${uuidV4()}.com`;
        const customPlebbit = await mockPlebbit({ chainProviders: { eth: { urls: [ethRpcTest], chainId: 1 } } });
        const signer = await customPlebbit.createSigner();
        const domain = `edit-before-start-${uuidV4()}.eth`;

        const originalPlebbit = await mockPlebbit();

        resolverClass.viemClients["eth" + ethRpcTest] = {
            getEnsText: ({ name, key }) => {
                if (name === domain && key === "subplebbit-address") return signer.address;
                else return null;
            }
        };
        const sub = await createSubWithNoChallenge({ signer }, customPlebbit);
        await sub.edit({ address: domain });
        // Check for locks
        expect(await sub.dbHandler.isSubStartLocked(sub.signer.address)).to.be.false;
        expect(await sub.dbHandler.isSubStartLocked(domain)).to.be.false;

        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));

        expect(sub.address).to.equal(domain);
        // Check for locks
        expect(await sub.dbHandler.isSubStartLocked(sub.signer.address)).to.be.false;
        expect(await sub.dbHandler.isSubStartLocked(domain)).to.be.true;

        await publishRandomPost(sub.address, customPlebbit);
        await sub.stop();
    });
});

describe(`Edit misc`, async () => {
    it(`Can edit subplebbit.address to a new domain even if subplebbit-address text record does not exist`, async () => {
        const customPlebbit = await mockPlebbit();
        const newSub = await customPlebbit.createSubplebbit();
        // Has no subplebbit-address text record
        await newSub.edit({ address: "no-sub-address.eth" });
        expect(newSub.address).to.equal("no-sub-address.eth");
        await newSub.delete();
    });

    it(`Can edit subplebbit.address to a new domain even if subplebbit-address text record does not match subplebbit.signer.address`, async () => {
        const customPlebbit = await mockPlebbit();
        const newSub = await customPlebbit.createSubplebbit();

        // Should not match signer.address
        await newSub.edit({ address: "different-signer.eth" });
        expect(newSub.address).to.equal("different-signer.eth");
        await newSub.delete();
    });

    it.skip(`Setting sub.settings.challenges[0].exclude.rateLimit to a string doesn't corrupt the signature`, async () => {
        // This test is not needed because zod will throw if you tried to set rateLimit to a string
        const customPlebbit = await mockPlebbit();
        const remotePlebbit = await mockRemotePlebbit();
        const newSub = await customPlebbit.createSubplebbit();
        await newSub.start();
        await resolveWhenConditionIsTrue(newSub, () => newSub.updatedAt); // wait until it publishes an ipns record
        await assert.isFulfilled(remotePlebbit.getSubplebbit(newSub.address)); // no problem with signature

        const newSettings = remeda.clone(newSub.settings);
        newSettings.challenges[0].exclude[0].rateLimit = "123";
        newSettings.challenges[0].exclude[0].firstCommentTimestamp = "123";

        await newSub.edit({ settings: newSettings });
        expect(newSub.challenges[0].exclude[0].rateLimit).to.equal("123");
        expect(newSub.settings.challenges[0].exclude[0].rateLimit).to.equal("123");
        expect(newSub.settings.challenges[0].exclude[0].firstCommentTimestamp).to.equal("123");

        await new Promise((resolve) => newSub.once("update", resolve));
        const newSubRemote = await remotePlebbit.getSubplebbit(newSub.address);
        expect(newSubRemote.challenges[0].exclude[0].rateLimit).to.equal("123");

        await newSub.delete();
    });
});

describe(`Editing subplebbit.roles`, async () => {
    let plebbit, sub, remotePlebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbit();
        sub = await plebbit.createSubplebbit();
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => Boolean(sub.updatedAt));
    });

    after(async () => {
        await sub.delete();
    });

    it(`Setting sub.roles[author-address] to null removes the role`, async () => {
        const authorAddress = "hello.eth";
        const secondAuthorAddress = "hello2.eth";
        await sub.edit({ roles: { [authorAddress]: { role: "admin" }, [secondAuthorAddress]: { role: "moderator" } } });

        expect(sub.roles[authorAddress].role).to.equal("admin");
        expect(sub.roles[secondAuthorAddress].role).to.equal("moderator");

        await new Promise((resolve) => sub.once("update", resolve));

        let remoteSub = await remotePlebbit.getSubplebbit(sub.address);
        expect(remoteSub.roles[authorAddress].role).to.equal("admin");
        expect(remoteSub.roles[secondAuthorAddress].role).to.equal("moderator");

        await sub.edit({ roles: { [authorAddress]: null, [secondAuthorAddress]: { role: "moderator" } } });
        expect(sub.roles[authorAddress]).to.be.undefined;
        expect(sub.roles[secondAuthorAddress].role).to.equal("moderator");

        await new Promise((resolve) => sub.once("update", resolve));

        remoteSub = await remotePlebbit.getSubplebbit(sub.address);
        expect(remoteSub.roles[authorAddress]).to.be.undefined;
        expect(remoteSub.roles[secondAuthorAddress].role).to.equal("moderator");

        // Now set the other author role to null, this should set subplebbit.roles to undefined
        await sub.edit({ roles: { [authorAddress]: null, [secondAuthorAddress]: null } });
        expect(sub.roles).to.deep.equal({}); // {} after edit, but will be undefined after publishing because we remove any empty objects {} before publishing to IPFS

        await new Promise((resolve) => sub.once("update", resolve));
        expect(sub.roles).to.be.undefined;

        remoteSub = await remotePlebbit.getSubplebbit(sub.address);
        expect(remoteSub.roles).to.be.undefined;
    });

    it.skip(`Setting sub.roles.[author-address.eth].role to null doesn't corrupt the signature`, async () => {
        // This test is not needed anymore because zod will catch it
        const newSub = await createSubWithNoChallenge({}, plebbit);
        await newSub.start();
        await resolveWhenConditionIsTrue(newSub, () => newSub.updatedAt); // wait until it publishes an ipns record
        await assert.isFulfilled(remotePlebbit.getSubplebbit(newSub.address)); // no problem with signature

        const newRoles = { "author-address.eth": { role: null }, "author-address2.eth": { role: "admin" } };
        await newSub.edit({ roles: newRoles });
        expect(newSub.roles).to.deep.equal({ "author-address2.eth": { role: "admin" } });

        await new Promise((resolve) => newSub.once("update", resolve));
        expect(newSub.roles).to.deep.equal({ "author-address2.eth": { role: "admin" } });

        const remoteSub = await remotePlebbit.getSubplebbit(newSub.address); // no issues with signature
        expect(remoteSub.roles).to.deep.equal({ "author-address2.eth": { role: "admin" } });

        await newSub.delete();
    });
});

// TODO change this testing to be about capturing the edit args sent to RPC server
describeIfRpc(`subplebbit.edit (RPC)`, async () => {
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        const signer = await plebbit.createSigner();
        subplebbit = await plebbit.createSubplebbit({ signer });
        expect(subplebbit.address).to.equal(signer.address);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
    });

    after(async () => {
        await subplebbit.delete();
    });
    [
        { title: `Test subplebbit RPC title edit ${Date.now()}` },
        { description: `Test subplebbit RPC description edit ${Date.now()}` },
        { address: `rpc-edit-test.eth` }
    ].map((editArgs) =>
        it(`subplebbit.edit(${JSON.stringify(editArgs)})`, async () => {
            const [keyToEdit, newValue] = Object.entries(editArgs)[0];
            await subplebbit.edit(editArgs);
            expect(subplebbit[keyToEdit]).to.equal(newValue);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            const remotePlebbit = await mockRemotePlebbitIpfsOnly(); // This plebbit instance won't use RPC
            const loadedSubplebbit = await remotePlebbit.createSubplebbit({ address: subplebbit.address });
            await loadedSubplebbit.update();
            await resolveWhenConditionIsTrue(loadedSubplebbit, () => loadedSubplebbit[keyToEdit] === newValue);
            expect(loadedSubplebbit[keyToEdit]).to.equal(newValue);
            await loadedSubplebbit.stop();
        })
    );
});
