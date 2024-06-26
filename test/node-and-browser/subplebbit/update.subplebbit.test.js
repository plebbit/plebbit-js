import signers from "../../fixtures/signers.js";

import { publishRandomPost, mockRemotePlebbit, mockGatewayPlebbit, isRpcFlagOn, itSkipIfRpc } from "../../../dist/node/test/test-util.js";

import * as remeda from "remeda";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const ensSubplebbitSigner = signers[3];

describe("subplebbit.update (remote)", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () => {
        const subplebbit = await plebbit.getSubplebbit("plebbit.eth"); // 'plebbit.eth' is part of test-server.js
        expect(subplebbit.address).to.equal("plebbit.eth");
        const oldUpdatedAt = remeda.clone(subplebbit.updatedAt);
        await subplebbit.update();
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // Invoke an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(oldUpdatedAt).to.not.equal(subplebbit.updatedAt);
        expect(subplebbit.address).to.equal("plebbit.eth");
        await subplebbit.stop();
    });

    it(`subplebbit.update() emits error if user supplied {address: ipnsName} if the actual address was ENS`, async () => {
        const loadedSubplebbit = await plebbit.createSubplebbit({ address: ensSubplebbitSigner.address });
        loadedSubplebbit.update();
        const error = await new Promise((resolve) => loadedSubplebbit.once("error", resolve));
        expect(error.code).to.equal("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT");
        // should not update
        expect(loadedSubplebbit.updatedAt).to.be.undefined;
        expect(loadedSubplebbit.address).to.equal(ensSubplebbitSigner.address);
        await loadedSubplebbit.stop();
    });

    itSkipIfRpc(`subplebbit.update emits error and retries if signature of subplebbit is invalid (ipfs P2P)`, async () => {
        const remotePlebbit = await mockRemotePlebbit();
        const tempSubplebbit = await remotePlebbit.createSubplebbit({ address: signers[0].address });

        const ipfsClientUrl = Object.keys(tempSubplebbit.clients.ipfsClients)[0];

        const updatingStates = [];
        tempSubplebbit.on("updatingstatechange", () => updatingStates.push(tempSubplebbit.updatingState));

        const ipfsClientStates = [];
        tempSubplebbit.clients.ipfsClients[ipfsClientUrl].on("statechange", (state) => ipfsClientStates.push(state));

        const rawSubplebbitJson = (await remotePlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
        rawSubplebbitJson.lastPostCid = "QmXhfEmQRGZ1RxgifbfeE1PhpWLg8sZ12yCGn42HCt1cBm"; // This will corrupt the signature
        tempSubplebbit.clientsManager._fetchCidP2P = () => JSON.stringify(rawSubplebbitJson);

        let retries = 0;

        tempSubplebbit.update();
        await new Promise((resolve) => {
            tempSubplebbit.on("error", (err) => {
                expect(err.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                retries++;
                if (retries === 3) resolve();
            });
        });

        await tempSubplebbit.stop();

        const expectedUpdatingStates = ["fetching-ipns", "fetching-ipfs", "failed", "fetching-ipns", "fetching-ipfs", "failed", "stopped"];
        expect(updatingStates).to.deep.equal(expectedUpdatingStates);

        const expectedIpfsClientStates = ["fetching-ipns", "fetching-ipfs", "stopped", "fetching-ipns", "fetching-ipfs", "stopped"];
        expect(ipfsClientStates).to.deep.equal(expectedIpfsClientStates);
    });

    itSkipIfRpc(`subplebbit.update emits error and retries if signature of subplebbit is invalid (ipfs gateway)`, async () => {
        // should emit an error and keep retrying

        const remoteGatewayPlebbit = await mockGatewayPlebbit();
        const gatewayUrl = Object.keys(remoteGatewayPlebbit.clients.ipfsGateways)[0];
        const tempSubplebbit = await remoteGatewayPlebbit.createSubplebbit({ address: signers[0].address });

        const updatingStates = [];
        tempSubplebbit.on("updatingstatechange", () => updatingStates.push(tempSubplebbit.updatingState));

        const ipfsGatewayStates = [];
        tempSubplebbit.clients.ipfsGateways[gatewayUrl].on("statechange", (state) => ipfsGatewayStates.push(state));

        let retries = 0;
        const rawSubplebbitJson = (await remoteGatewayPlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
        rawSubplebbitJson.lastPostCid = "QmXhfEmQRGZ1RxgifbfeE1PhpWLg8sZ12yCGn42HCt1cBm"; // This will corrupt the signature
        tempSubplebbit.clientsManager._fetchWithLimit = async () => JSON.stringify(rawSubplebbitJson);
        tempSubplebbit.update();
        await new Promise((resolve) => {
            tempSubplebbit.on("error", (err) => {
                expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                retries++;
                if (retries === 3) resolve();
            });
        });

        await tempSubplebbit.stop();

        const expectedIpfsGatewayStates = new Array(retries).fill(["fetching-ipns", "stopped"]).flat();
        expect(ipfsGatewayStates).to.deep.equal(expectedIpfsGatewayStates);

        const expectedUpdatingStates = [...new Array(retries).fill(["fetching-ipns", "failed"]).flat(), "stopped"];
        expect(updatingStates).to.deep.equal(expectedUpdatingStates);
    });

    itSkipIfRpc(`subplebbit.update emits error and retries if schema of subplebbit is invalid (ipfs p2p)`, async () => {
        const remotePlebbit = await mockRemotePlebbit();
        const tempSubplebbit = await remotePlebbit.createSubplebbit({ address: signers[0].address });

        const ipfsClientUrl = Object.keys(tempSubplebbit.clients.ipfsClients)[0];

        const updatingStates = [];
        tempSubplebbit.on("updatingstatechange", () => updatingStates.push(tempSubplebbit.updatingState));

        const ipfsClientStates = [];
        tempSubplebbit.clients.ipfsClients[ipfsClientUrl].on("statechange", (state) => ipfsClientStates.push(state));

        const rawSubplebbitJson = (await remotePlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
        rawSubplebbitJson.lastPostCid = 1234; // This will make schema invalid
        tempSubplebbit.clientsManager._fetchCidP2P = () => JSON.stringify(rawSubplebbitJson);

        let retries = 0;

        tempSubplebbit.update();
        await new Promise((resolve) => {
            tempSubplebbit.on("error", (err) => {
                expect(err.code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
                retries++;
                if (retries === 3) resolve();
            });
        });

        await tempSubplebbit.stop();

        const expectedUpdatingStates = ["fetching-ipns", "fetching-ipfs", "failed", "fetching-ipns", "fetching-ipfs", "failed", "stopped"];
        expect(updatingStates).to.deep.equal(expectedUpdatingStates);

        const expectedIpfsClientStates = ["fetching-ipns", "fetching-ipfs", "stopped", "fetching-ipns", "fetching-ipfs", "stopped"];
        expect(ipfsClientStates).to.deep.equal(expectedIpfsClientStates);
    });

    itSkipIfRpc(`subplebbit.update emits error and retries if schema of subplebbit is invalid (ipfs gateway)`, async () => {
        const remoteGatewayPlebbit = await mockGatewayPlebbit();
        const gatewayUrl = Object.keys(remoteGatewayPlebbit.clients.ipfsGateways)[0];
        const tempSubplebbit = await remoteGatewayPlebbit.createSubplebbit({ address: signers[0].address });

        const updatingStates = [];
        tempSubplebbit.on("updatingstatechange", () => updatingStates.push(tempSubplebbit.updatingState));

        const ipfsGatewayStates = [];
        tempSubplebbit.clients.ipfsGateways[gatewayUrl].on("statechange", (state) => ipfsGatewayStates.push(state));

        let retries = 0;
        const rawSubplebbitJson = (await remoteGatewayPlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
        rawSubplebbitJson.lastPostCid = 12345; // This will make schema invalid
        tempSubplebbit.clientsManager._fetchWithLimit = async () => JSON.stringify(rawSubplebbitJson);
        tempSubplebbit.update();
        await new Promise((resolve) => {
            tempSubplebbit.on("error", (err) => {
                expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
                retries++;
                if (retries === 3) resolve();
            });
        });

        await tempSubplebbit.stop();

        const expectedIpfsGatewayStates = new Array(retries).fill(["fetching-ipns", "stopped"]).flat();
        expect(ipfsGatewayStates).to.deep.equal(expectedIpfsGatewayStates);

        const expectedUpdatingStates = [...new Array(retries).fill(["fetching-ipns", "failed"]).flat(), "stopped"];
        expect(updatingStates).to.deep.equal(expectedUpdatingStates);
    });

    itSkipIfRpc(`subplebbit.update emits error and retries if subplebbit record is invalid json (ipfs p2p)`, async () => {
        const remotePlebbit = await mockRemotePlebbit({ updateInterval: 3000 });
        const tempSubplebbit = await remotePlebbit.createSubplebbit({ address: signers[0].address });

        const ipfsClientUrl = Object.keys(tempSubplebbit.clients.ipfsClients)[0];

        const updatingStates = [];
        tempSubplebbit.on("updatingstatechange", () => updatingStates.push(tempSubplebbit.updatingState));

        const ipfsClientStates = [];
        tempSubplebbit.clients.ipfsClients[ipfsClientUrl].on("statechange", (state) => ipfsClientStates.push(state));

        const rawSubplebbitJson = (await remotePlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
        tempSubplebbit.clientsManager._fetchCidP2P = () => "." + JSON.stringify(rawSubplebbitJson); // invalid json

        let retries = 0;

        const errorPromise = new Promise((resolve) => {
            tempSubplebbit.on("error", (err) => {
                expect(err.code).to.equal("ERR_INVALID_JSON");
                retries++;
                if (retries === 3) resolve();
            });
        });

        await Promise.all([tempSubplebbit.update(), errorPromise]);

        await tempSubplebbit.stop();

        const expectedUpdatingStates = [...new Array(retries - 1).fill(["fetching-ipns", "fetching-ipfs", "failed"]).flat(), "stopped"];
        expect(updatingStates).to.deep.equal(expectedUpdatingStates);

        const expectedIpfsClientStates = new Array(retries - 1).fill(["fetching-ipns", "fetching-ipfs", "stopped"]).flat();
        expect(ipfsClientStates).to.deep.equal(expectedIpfsClientStates);
    });

    itSkipIfRpc(`subplebbit.update emits error and retries if subplebbit record is invalid json (ipfs gateway)`, async () => {
        const remoteGatewayPlebbit = await mockGatewayPlebbit();
        const gatewayUrl = Object.keys(remoteGatewayPlebbit.clients.ipfsGateways)[0];
        const tempSubplebbit = await remoteGatewayPlebbit.createSubplebbit({ address: signers[0].address });

        const updatingStates = [];
        tempSubplebbit.on("updatingstatechange", () => updatingStates.push(tempSubplebbit.updatingState));

        const ipfsGatewayStates = [];
        tempSubplebbit.clients.ipfsGateways[gatewayUrl].on("statechange", (state) => ipfsGatewayStates.push(state));

        let retries = 0;
        const rawSubplebbitJson = (await remoteGatewayPlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
        tempSubplebbit.clientsManager._fetchWithLimit = async () => "." + JSON.stringify(rawSubplebbitJson);
        tempSubplebbit.update();
        await new Promise((resolve) => {
            tempSubplebbit.on("error", (err) => {
                expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_JSON");
                retries++;
                if (retries === 3) resolve();
            });
        });

        await tempSubplebbit.stop();

        const expectedIpfsGatewayStates = new Array(retries).fill(["fetching-ipns", "stopped"]).flat();
        expect(ipfsGatewayStates).to.deep.equal(expectedIpfsGatewayStates);

        const expectedUpdatingStates = [...new Array(retries).fill(["fetching-ipns", "failed"]).flat(), "stopped"];
        expect(updatingStates).to.deep.equal(expectedUpdatingStates);
    });

    it(`subplebbit.update emits error if address of ENS and has no subplebbit-address`, async () => {
        const sub = await plebbit.createSubplebbit({ address: "this-sub-does-not-exist.eth" });
        sub.update();
        // Should emit an error and keep on retrying in the next update loop
        let errorCount = 0;
        await new Promise((resolve) => {
            sub.on("error", (err) => {
                expect(err.code).to.equal("ERR_DOMAIN_TXT_RECORD_NOT_FOUND");
                expect(sub.updatingState).to.equal("failed");
                errorCount++;
                if (errorCount === 3) resolve();
            });
        });

        await sub.stop();
        await sub.removeAllListeners("error");
    });

    it(`subplebbit.stop() stops subplebbit updates`, async () => {
        const remotePlebbit = await mockRemotePlebbit();
        const subplebbit = await remotePlebbit.createSubplebbit({ address: "plebbit.eth" }); // 'plebbit.eth' is part of test-server.js
        subplebbit.update();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();
        await new Promise((resolve) => setTimeout(resolve, remotePlebbit.updateInterval + 1));
        let updatedHasBeenCalled = false;
        subplebbit.updateOnce = subplebbit._setUpdatingState = async () => {
            updatedHasBeenCalled = true;
        };

        await new Promise((resolve) => setTimeout(resolve, remotePlebbit.updateInterval + 1));
        expect(updatedHasBeenCalled).to.be.false;
    });

    it(`subplebbit.update() is working as expected after calling subplebbit.stop() - IPFS P2P`, async () => {
        const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

        await subplebbit.update();
        await new Promise((resolve) => subplebbit.once("update", resolve));

        await subplebbit.stop();

        await subplebbit.update();

        await publishRandomPost(subplebbit.address, plebbit, {}, false);
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();
    });

    it(`subplebbit.update() is working as expected after calling subplebbit.stop() - IPFS Gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const subplebbit = await gatewayPlebbit.createSubplebbit({ address: signers[0].address });

        await subplebbit.update();
        await new Promise((resolve) => subplebbit.once("update", resolve));

        await subplebbit.stop();

        await subplebbit.update();

        await publishRandomPost(subplebbit.address, plebbit, {}, false);
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();
    });
});
