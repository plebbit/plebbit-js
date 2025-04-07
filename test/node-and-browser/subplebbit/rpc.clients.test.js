import { expect } from "chai";
import signers from "../../fixtures/signers.js";

import { describeIfRpc, createNewIpns, resolveWhenConditionIsTrue, mockRpcRemotePlebbit } from "../../../dist/node/test/test-util.js";

import { signSubplebbit } from "../../../dist/node/signer/signatures.js";
describeIfRpc(`subplebbit.clients.plebbitRpcClients (remote sub)`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRpcRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`subplebbit.clients.plebbitRpcClients[rpcUrl] is stopped by default`, async () => {
        const sub = await plebbit.createSubplebbit({ address: signers[0].address });
        const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        expect(sub.clients.plebbitRpcClients[rpcUrl].state).to.equal("stopped");
    });

    it(`subplebbit.clients.plebbitRpcClients states are correct if fetching a sub with IPNS address`, async () => {
        const newIpns = await createNewIpns();
        const actualSub = await plebbit.getSubplebbit(signers[0].address);

        const record = JSON.parse(JSON.stringify(actualSub._rawSubplebbitIpfs));
        record.address = newIpns.signer.address;
        delete record["posts"];
        record.signature = await signSubplebbit(record, newIpns.signer);

        await newIpns.publishToIpns(JSON.stringify(record));

        const sub = await plebbit.createSubplebbit({ address: newIpns.signer.address });
        const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

        sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => recordedStates.push(newState));

        await sub.update();

        await new Promise((resolve) => sub.once("update", resolve));

        expect(recordedStates).to.deep.equal(expectedStates);

        await sub.stop();
    });

    it(`subplebbit.clients.plebbitRpcClients states are correct if fetching a sub with ENS address`, async () => {
        const sub = await plebbit.createSubplebbit({ address: "plebbit.eth" });
        const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        const recordedStates = [];
        const expectedStates = ["resolving-subplebbit-address", "fetching-ipns", "fetching-ipfs", "stopped"];

        sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => recordedStates.push(newState));

        await sub.update();

        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

        await sub.stop();
        expect(recordedStates).to.deep.equal(expectedStates);
    });
});
