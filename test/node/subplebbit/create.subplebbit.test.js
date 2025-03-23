import {
    mockPlebbit,
    publishRandomPost,
    publishRandomReply,
    createSubWithNoChallenge,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue,
    jsonifySubplebbitAndRemoveInternalProps,
    waitTillPostInSubplebbitPages
} from "../../../dist/node/test/test-util.js";
import { timestamp } from "../../../dist/node/util.js";
import { messages } from "../../../dist/node/errors.js";

import { stringify as deterministicStringify } from "safe-stable-stringify";

import chai from "chai";
import * as remeda from "remeda";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`plebbit.createSubplebbit (local)`, async () => {
    let plebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit({});
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });

    const _createAndValidateSubArgs = async (subArgs) => {
        const newSubplebbit = await plebbit.createSubplebbit(subArgs);
        if (!("signer" in subArgs))
            // signer shape changes after createSubplebbit
            expect(remeda.pick(newSubplebbit, Object.keys(subArgs))).to.deep.equal(subArgs); // the args should exist after creating immedietely
        await newSubplebbit.start();
        await resolveWhenConditionIsTrue(newSubplebbit, () => typeof newSubplebbit.updatedAt === "number");
        await newSubplebbit.stop();

        // Sub has finished its first sync loop, should have address now
        expect(newSubplebbit.address.startsWith("12D3")).to.be.true;
        expect(newSubplebbit.signer.address).to.equal(newSubplebbit.address);
        const listedSubs = plebbit.subplebbits;
        expect(listedSubs).to.include(newSubplebbit.address);

        const remoteSub = await remotePlebbit.getSubplebbit(newSubplebbit.address);

        const remoteSubJson = jsonifySubplebbitAndRemoveInternalProps(remoteSub);

        const localSubRemoteJson = jsonifySubplebbitAndRemoveInternalProps(newSubplebbit);

        expect(localSubRemoteJson).to.deep.equal(remoteSubJson);

        expect(remoteSub.toJSONIpfs()).to.deep.equal(newSubplebbit.toJSONIpfs());
        return newSubplebbit;
    };

    [{}, { title: `Test title - ${Date.now()}` }].map((subArgs) =>
        it(`createSubplebbit(${JSON.stringify(subArgs)})`, async () => {
            await _createAndValidateSubArgs(subArgs);
        })
    );

    it(`createSubplebbit({signer: await plebbit.createSigner()})`, async () => {
        await _createAndValidateSubArgs({ signer: await plebbit.createSigner() });
    });

    it(`createSubplebbit({signer: {privateKey, type}})`, async () => {
        const signer = await plebbit.createSigner();
        await _createAndValidateSubArgs({ signer: { privateKey: signer.privateKey, type: signer.type } });
    });

    it(`subplebbit = await createSubplebbit(await createSubplebbit)`, async () => {
        const props = { title: "subplebbit = await createSubplebbit(await createSubplebbit)" };
        const firstSub = await plebbit.createSubplebbit(props);
        const createdSub = await plebbit.createSubplebbit(firstSub);
        expect(createdSub.title).to.equal(props.title);
        expect(createdSub.signer.address).to.be.a("string");
        await createdSub.delete();
    });

    it(`subplebbit = await createSubplebbit(JSON.parse(JSON.stringify(subplebbitInstance)))`, async () => {
        const props = { title: Math.random() + "123" };
        const firstSub = await plebbit.createSubplebbit(props);
        const secondSub = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(firstSub)));
        expect(secondSub.title).to.equal(props.title);

        const firstSubJson = jsonifySubplebbitAndRemoveInternalProps(firstSub);
        const secondSubJson = jsonifySubplebbitAndRemoveInternalProps(secondSub);
        expect(firstSubJson).to.deep.equal(secondSubJson);
    });

    it(`Can recreate a subplebbit with replies instance with plebbit.createSubplebbit`, async () => {
        const props = { title: "Test hello", description: "Hello there" };
        const sub = await createSubWithNoChallenge(props, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        const post = await publishRandomPost(sub.address, plebbit, {});
        await waitTillPostInSubplebbitPages(post, plebbit);
        await publishRandomReply(post, plebbit, {});
        expect(sub.posts).to.be.a("object");
        const clonedSub = await plebbit.createSubplebbit(sub);
        expect(clonedSub.posts).to.be.a("object");
        const internalProps = ["clients", "state", "startedState"];
        const clonedSubJson = JSON.parse(JSON.stringify(remeda.omit(clonedSub, internalProps)));
        const localSubJson = JSON.parse(JSON.stringify(remeda.omit(sub, internalProps)));
        expect(localSubJson).to.deep.equal(clonedSubJson);
        await sub.delete();
    });

    it(`createSubplebbit on online IPFS node doesn't take more than 10s`, async () => {
        const onlinePlebbit = await mockPlebbit({
            kuboRpcClientsOptions: ["http://localhost:15003/api/v0"],
            pubsubKuboRpcClientsOptions: [`http://localhost:15003/api/v0`]
        });
        const startTime = timestamp();
        const title = `Test online plebbit`;
        const createdSub = await onlinePlebbit.createSubplebbit({ title: title });
        const endTime = timestamp();
        await createdSub.delete();
        expect(endTime).to.be.lessThanOrEqual(startTime + 10, "createSubplebbit took more than 10s in an online ipfs node");
    });

    it(`local subplebbit retains fields upon createSubplebbit(address)`, async () => {
        const title = `Test retention ${Date.now()}`;
        const sub = await _createAndValidateSubArgs({ title });
        const createdSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(createdSub.title).to.equal(title);
        expect(deterministicStringify(createdSub)).to.equal(deterministicStringify(sub));
        await createdSub.delete();
    });

    it(`Recreating a local sub with createSubplebbit({address, ...extraProps}) should not override local sub props`, async () => {
        const newSub = await createSubWithNoChallenge(
            {
                title: `Test for extra props`,
                description: "Test for description extra props"
            },
            plebbit
        );
        await newSub.start();
        await new Promise((resolve) => newSub.once("update", resolve));
        if (!newSub.updatedAt) await new Promise((resolve) => newSub.once("update", resolve));
        await newSub.stop();

        const createdSubplebbit = await createSubWithNoChallenge(
            {
                address: newSub.address,
                title: "nothing",
                description: "nothing also"
            },
            plebbit
        );
        expect(createdSubplebbit.title).to.equal(newSub.title);
        expect(createdSubplebbit.description).to.equal(newSub.description);

        await createdSubplebbit.start();
        await new Promise((resolve) => createdSubplebbit.once("update", resolve));
        expect(createdSubplebbit.title).to.equal(newSub.title);
        expect(createdSubplebbit.description).to.equal(newSub.description);
        await createdSubplebbit.delete();
    });

    it(`Recreating a local running subplebbit should not stop it`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        if (!sub.updatedAt) await new Promise((resolve) => sub.once("update", resolve));
        expect(sub.startedState).to.not.equal("stopped");

        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(recreatedSub.startedState).to.equal("stopped"); // startedState is only set by the actual instance, not synced across instances
        expect(sub.startedState).to.not.equal("stopped");
        await sub.stop();
    });

    it(`Fail to create a sub with ENS address has a capital letter`, async () => {
        await assert.isRejected(plebbit.createSubplebbit({ address: "testEth.eth" }), messages.ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER);
    });

    it(`plebbit.createSubplebbit({address: undefined}) should throw a proper error`, async () => {
        await assert.isRejected(plebbit.createSubplebbit({ address: undefined }));
    });
});
