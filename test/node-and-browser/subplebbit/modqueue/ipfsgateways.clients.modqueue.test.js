import { expect } from "chai";
import { getAvailablePlebbitConfigsToTestAgainst, addStringToIpfs } from "../../../../dist/node/test/test-util.js";
import signers from "../../../fixtures/signers.js";
import validModQueuePage from "../../../fixtures/valid_modqueue_page.json" with { type: "json" };

const subplebbitAddress = signers[0].address;
const cloneModQueuePage = () => JSON.parse(JSON.stringify(validModQueuePage));

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe(`subplebbit.modQueue.clients.ipfsGateways - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`subplebbit.modQueue.clients.ipfsGateways[sortType][url] is stopped by default`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];
            expect(Object.keys(sub.modQueue.clients.ipfsGateways.pendingApproval).length).to.equal(1);
            expect(sub.modQueue.clients.ipfsGateways.pendingApproval[gatewayUrl].state).to.equal("stopped");
        });

        it(`Correct state of 'pendingApproval' sort is updated after fetching from subplebbit.modQueue.pageCids.pendingApproval`, async () => {
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            const page = cloneModQueuePage();
            const pageCid = await addStringToIpfs(JSON.stringify(page));
            sub.modQueue.pageCids.pendingApproval = pageCid;

            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];

            const expectedStates = ["fetching-ipfs", "stopped"];
            const actualStates = [];
            sub.modQueue.clients.ipfsGateways.pendingApproval[gatewayUrl].on("statechange", (newState) => {
                actualStates.push(newState);
            });

            await sub.modQueue.getPage(sub.modQueue.pageCids.pendingApproval);
            expect(actualStates).to.deep.equal(expectedStates);
        });
    });
});
