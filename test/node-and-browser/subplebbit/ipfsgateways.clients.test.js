import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import {
    publishRandomPost,
    getAvailablePlebbitConfigsToTestAgainst,
    mockGatewayPlebbit,
    mockPlebbitToReturnSpecificSubplebbit,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe(`subplebbit.clients.ipfsGateways - ${config.name}`, async () => {
        // All tests below use Plebbit instance that doesn't have clients.kuboRpcClients
        let gatewayPlebbit;

        before(async () => {
            gatewayPlebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await gatewayPlebbit.destroy();
        });

        it(`subplebbit.clients.ipfsGateways[url] is stopped by default`, async () => {
            const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
            expect(Object.keys(mockSub.clients.ipfsGateways).length).to.equal(1);
            expect(Object.values(mockSub.clients.ipfsGateways)[0].state).to.equal("stopped");
        });

        it(`Correct order of ipfsGateways state when updating a subplebbit that was created with plebbit.createSubplebbit({address})`, async () => {
            const sub = await gatewayPlebbit.createSubplebbit({ address: signers[0].address });

            const expectedStates = ["fetching-ipns", "stopped"];

            const actualStates = [];

            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];

            sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

            await sub.update();
            await new Promise((resolve) => sub.once("update", resolve));
            await sub.stop();

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of ipfsGateways state when updating a subplebbit that was created with plebbit.getSubplebbit(address)`, async () => {
            const sub = await gatewayPlebbit.getSubplebbit(signers[0].address);
            await publishRandomPost(sub.address, gatewayPlebbit);

            const expectedStates = ["fetching-ipns", "stopped"];

            const actualStates = [];

            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];

            sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

            const updatePromise = new Promise((resolve) => sub.once("update", resolve));
            await sub.update();
            await updatePromise;
            await sub.stop();

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of ipfs gateway state when we update a subplebbit and it's not publishing new subplebbit records`, async () => {
            const customPlebbit = await mockGatewayPlebbit();

            const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

            let updateCount = 0;
            sub.on("update", () => updateCount++);
            let waitingRetryCount = 0;
            sub.on("updatingstatechange", (newState) => newState === "waiting-retry" && waitingRetryCount++);

            const recordedStates = [];
            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];
            sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => recordedStates.push(newState));

            // now customPlebbit._updatingSubplebbits will be defined

            const updatePromise = new Promise((resolve) => sub.once("update", resolve));
            await sub.update();
            await updatePromise;
            await mockPlebbitToReturnSpecificSubplebbit(customPlebbit, sub.address, JSON.parse(JSON.stringify(sub.toJSONIpfs())));

            const expectedWaitingRetryCount = 3;
            await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => waitingRetryCount === expectedWaitingRetryCount, eventName: "updatingstatechange" });

            await sub.stop();

            expect(updateCount).to.equal(3); // mockPlebbitToReturnSpecificSubplebbit will delete updateAt which will force a second update
            expect(waitingRetryCount).to.equal(expectedWaitingRetryCount);
            // should be just ["fetching-ipns", "stopped"]
            // because it can't find a new record
            for (let i = 0; i < recordedStates.length; i += 2) {
                expect(recordedStates[i]).to.equal("fetching-ipns");
                expect(recordedStates[i + 1]).to.equal("stopped");
            }
            await customPlebbit.destroy();
        });

        it(`Correct order of ipfs gateway states when we update a subplebbit with record whose signature is invalid`, async () => {
            const customPlebbit = await mockGatewayPlebbit();

            const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

            let updateCount = 0;
            sub.on("update", () => updateCount++);

            let waitingRetryCount = 0;
            sub.on("updatingstatechange", (newState) => newState === "waiting-retry" && waitingRetryCount++);

            const emittedErrors = [];
            sub.on("error", (error) => emittedErrors.push(error));

            // Record states for verification
            const recordedStates = [];
            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];
            sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => recordedStates.push(newState));

            // First update to get a valid record
            const updatePromise = new Promise((resolve) => sub.once("update", resolve));
            await sub.update();
            await updatePromise;

            const validRecord = sub.toJSONIpfs();
            const invalidRecord = { ...validRecord, rules: ["1234"] }; // new rules should invalidate the record

            await mockPlebbitToReturnSpecificSubplebbit(customPlebbit, sub.address, invalidRecord);

            await new Promise((resolve) => setTimeout(resolve, customPlebbit.updateInterval * 4));

            await sub.stop();

            // verifying states for the first correct update
            expect(recordedStates.slice(0, 2)).to.deep.equal(["fetching-ipns", "stopped"]);

            // verifying states for the first error
            expect(recordedStates.slice(2, 4)).to.deep.equal(["fetching-ipns", "stopped"]);

            // verifying states for the waiting retries, because it can't find a new record
            for (let i = 0; i < recordedStates.length; i += 2) {
                expect(recordedStates[i]).to.equal("fetching-ipns");
                expect(recordedStates[i + 1]).to.equal("stopped");
            }

            // Verify the counts of various events
            expect(emittedErrors.length).to.be.at.least(1);
            expect(emittedErrors[0].code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
            expect(emittedErrors[0].details.gatewayToError["http://localhost:18080"].code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");

            expect(waitingRetryCount).to.be.greaterThan(0);
            expect(updateCount).to.equal(1); // Only the first update should succeed
            await customPlebbit.destroy();
        });
    });
});
