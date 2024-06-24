import signers from "../../fixtures/signers.js";

import { publishRandomPost, mockRemotePlebbit, mockGatewayPlebbit, isRpcFlagOn } from "../../../dist/node/test/test-util.js";

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

    if (!isRpcFlagOn())
        it(`subplebbit.update emits error if signature of subplebbit is invalid (ipfs P2P)`, async () => {
            const remotePlebbit = await mockRemotePlebbit();
            const tempSubplebbit = await remotePlebbit.createSubplebbit({ address: signers[0].address });
            const rawSubplebbitJson = (await remotePlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
            rawSubplebbitJson.lastPostCid = "QmXhfEmQRGZ1RxgifbfeE1PhpWLg8sZ12yCGn42HCt1cBm"; // This will corrupt the signature
            tempSubplebbit.clientsManager._fetchCidP2P = () => JSON.stringify(rawSubplebbitJson);
            tempSubplebbit.update();
            await new Promise((resolve) => {
                tempSubplebbit.once("error", (err) => {
                    expect(err.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                    resolve();
                });
            });
            await tempSubplebbit.stop();
        });

    if (!isRpcFlagOn())
        it(`subplebbit.update emits error if signature of subplebbit is invalid (ipfs gateway)`, async () => {
            const remoteGatewayPlebbit = await mockGatewayPlebbit();
            const tempSubplebbit = await remoteGatewayPlebbit.createSubplebbit({ address: signers[0].address });
            const rawSubplebbitJson = (await remoteGatewayPlebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
            rawSubplebbitJson.lastPostCid = "QmXhfEmQRGZ1RxgifbfeE1PhpWLg8sZ12yCGn42HCt1cBm"; // This will corrupt the signature
            tempSubplebbit.clientsManager._fetchWithGateway = async () => JSON.stringify(rawSubplebbitJson);
            tempSubplebbit.update();
            await new Promise((resolve) => {
                tempSubplebbit.once("error", (err) => {
                    expect(err.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                    resolve();
                });
            });
            // TODO add tests for updating states
            // TODO add tests for ipfs gateway states
            // TODO add tests for how many time it retries

            await tempSubplebbit.stop();
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

    it(`subplebbit.update() is working as expected after calling subplebbit.stop()`, async () => {
        const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

        await subplebbit.update();
        await new Promise((resolve) => subplebbit.once("update", resolve));

        await subplebbit.stop();

        await subplebbit.update();

        await publishRandomPost(subplebbit.address, plebbit, {}, false);
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();
    });
});
