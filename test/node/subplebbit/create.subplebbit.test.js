import {
    mockPlebbit,
    publishRandomPost,
    publishRandomReply,
    createSubWithNoChallenge,
    mockRemotePlebbitIpfsOnly,
    isRpcFlagOn
} from "../../../dist/node/test/test-util";
import { timestamp } from "../../../dist/node/util";
import { messages } from "../../../dist/node/errors";

import { stringify as deterministicStringify } from "safe-stable-stringify";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`plebbit.createSubplebbit (local)`, async () => {
    let plebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        remotePlebbit = await mockRemotePlebbitIpfsOnly();
    });

    const _createAndValidateSubArsg = async (subArgs) => {
        const newSubplebbit = await plebbit.createSubplebbit(subArgs);
        await newSubplebbit.start();
        await new Promise((resolve) => newSubplebbit.once("update", resolve));
        if (!newSubplebbit.updatedAt) await new Promise((resolve) => newSubplebbit.once("update", resolve));
        await newSubplebbit.stop();

        // Sub has finished its first sync loop, should have address now
        expect(newSubplebbit.address.startsWith("12D3")).to.be.true;
        const subplebbitIpns = await remotePlebbit.getSubplebbit(newSubplebbit.address);
        expect(deterministicStringify(subplebbitIpns.toJSON())).to.equal(deterministicStringify(newSubplebbit.toJSON()));
        return newSubplebbit;
    };

    [{}, { title: `Test title - ${Date.now()}` }].map((subArgs) =>
        it(`createSubplebbit(${JSON.stringify(subArgs)})`, async () => {
            await _createAndValidateSubArsg(subArgs);
        })
    );

    it(`createSubplebbit({signer: await plebbit.createSigner()})`, async () => {
        await _createAndValidateSubArsg({ signer: await plebbit.createSigner() });
    });

    it(`createSubplebbit({signer: {privateKey, type}})`, async () => {
        const signer = await plebbit.createSigner();
        await _createAndValidateSubArsg({ signer: { privateKey: signer.privateKey, type: signer.type } });
    });

    it(`subplebbit = await createSubplebbit(await createSubplebbit)`, async () => {
        const props = { title: "subplebbit = await createSubplebbit(await createSubplebbit)" };
        const firstSub = await plebbit.createSubplebbit(props);
        const createdSub = await plebbit.createSubplebbit(firstSub);
        expect(createdSub.title).to.equal(props.title);
        if (!isRpcFlagOn())
            // signer will not exist on RPC tests
            expect(createdSub.signer.address).to.be.a("string");
        await createdSub.delete();
    });

    it(`Can recreate a subplebbit with replies instance with plebbit.createSubplebbit`, async () => {
        const props = { title: "Test hello", description: "Hello there" };
        const sub = await createSubWithNoChallenge(props, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        if (!sub.updatedAt) await new Promise((resolve) => sub.once("update", resolve));
        const post = await publishRandomPost(sub.address, plebbit, {}, false);
        await publishRandomReply(post, plebbit, {}, true);
        expect(sub.posts).to.be.a("object");
        const clonedSub = await plebbit.createSubplebbit(sub);
        expect(clonedSub.posts).to.be.a("object");
        expect(sub.toJSON()).to.deep.equal(clonedSub.toJSON());
        await sub.delete();
    });

    it(`createSubplebbit on online IPFS node doesn't take more than 10s`, async () => {
        const onlinePlebbit = await mockPlebbit({
            ipfsHttpClientsOptions: ["http://localhost:15003/api/v0"],
            pubsubHttpClientsOptions: [`http://localhost:15003/api/v0`]
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
        const sub = await _createAndValidateSubArsg({ title });
        const createdSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(createdSub.title).to.equal(title);
        expect(deterministicStringify(createdSub.toJSON())).to.equal(deterministicStringify(sub.toJSON()));
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

        const recreatedSub = await plebbit.createSubplebbit({address: sub.address});
        expect(recreatedSub.startedState).to.not.equal("stopped");
        expect(sub.startedState).to.not.equal("stopped");
        await sub.stop();
    });

    it(`Fail to create a sub with ENS address has a capital letter`, async () => {
        await assert.isRejected(plebbit.createSubplebbit({ address: "testEth.eth" }), messages.ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER);
    });
});
