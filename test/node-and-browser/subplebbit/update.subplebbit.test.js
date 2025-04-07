import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    mockRemotePlebbit,
    getRemotePlebbitConfigs,
    isPlebbitFetchingUsingGateways,
    createNewIpns,
    mockPlebbitToReturnSpecificSubplebbit,
    resolveWhenConditionIsTrue,
    mockGatewayPlebbit,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    describeSkipIfRpc
} from "../../../dist/node/test/test-util.js";

import * as remeda from "remeda";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { _signJson } from "../../../dist/node/signer/signatures.js";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const ensSubplebbitSigner = signers[3];

getRemotePlebbitConfigs().map((config) => {
    describe("subplebbit.update (remote) - " + config.name, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () => {
            const subplebbit = await plebbit.getSubplebbit("plebbit.eth"); // 'plebbit.eth' is part of test-server.js
            expect(subplebbit.address).to.equal("plebbit.eth");
            const oldUpdatedAt = remeda.clone(subplebbit.updatedAt);
            await subplebbit.update();
            await publishRandomPost(subplebbit.address, plebbit); // Invoke an update
            await resolveWhenConditionIsTrue(subplebbit, () => oldUpdatedAt !== subplebbit.updatedAt);
            expect(oldUpdatedAt).to.not.equal(subplebbit.updatedAt);
            expect(subplebbit.address).to.equal("plebbit.eth");
            await subplebbit.stop();
        });

        it(`subplebbit.update() emits error if user supplied {address: ipnsName} and the actual address was ENS`, async () => {
            const loadedSubplebbit = await plebbit.createSubplebbit({ address: ensSubplebbitSigner.address });
            const errorPromise = new Promise((resolve) => loadedSubplebbit.once("error", resolve));

            await loadedSubplebbit.update();
            const error = await errorPromise;
            if (isPlebbitFetchingUsingGateways(plebbit)) {
                expect(error.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways)) {
                    expect(error.details.gatewayToError[gatewayUrl].code).to.equal(
                        "ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED"
                    );
                }
            } else expect(error.code).to.equal("ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED");
            // should not accept the SubplebbitIpfs props
            expect(loadedSubplebbit.updatedAt).to.be.undefined;
            expect(loadedSubplebbit.address).to.equal(ensSubplebbitSigner.address);
            await loadedSubplebbit.stop();
        });

        it(`subplebbit.update emits error if signature of subplebbit is invalid`, async () => {
            // should emit an error and keep retrying

            const ipnsObj = await createNewIpns();

            const rawSubplebbitJson = (await plebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
            rawSubplebbitJson.address = ipnsObj.signer.address; // this will corrupt the signature
            await ipnsObj.publishToIpns(JSON.stringify(rawSubplebbitJson));
            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });

            const errorPromise = new Promise((resolve) => {
                tempSubplebbit.once("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                    } else {
                        expect(err.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                    }
                    resolve();
                });
            });

            await tempSubplebbit.update();
            await errorPromise;
            await tempSubplebbit.stop();
        });

        it(`subplebbit.update emits error if schema of subplebbit is invalid `, async () => {
            const rawSubplebbitJson = (await plebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
            rawSubplebbitJson.lastPostCid = 12345; // This will make schema invalid

            const ipnsObj = await createNewIpns();
            await ipnsObj.publishToIpns(JSON.stringify(rawSubplebbitJson));
            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });
            const errorPromise = new Promise((resolve) => {
                tempSubplebbit.once("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
                    } else {
                        expect(err.code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
                    }
                    resolve();
                });
            });

            await tempSubplebbit.update();
            await errorPromise;

            await tempSubplebbit.stop();
        });

        it(`subplebbit.update emits error if subplebbit record is invalid json`, async () => {
            const ipnsObj = await createNewIpns();
            await ipnsObj.publishToIpns("<html>"); // invalid json
            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });

            const errorPromise = new Promise((resolve) => {
                tempSubplebbit.once("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        // we're using gateways to fetch
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(tempSubplebbit.clients.ipfsGateways)) {
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_JSON");
                        }
                    } else {
                        expect(err.code).to.equal("ERR_INVALID_JSON");
                    }
                    resolve();
                });
            });
            await tempSubplebbit.update();
            await errorPromise;

            await tempSubplebbit.stop();
        });

        it(`subplebbit.update emits error and keeps retrying if address is ENS and ENS address has no subplebbit-address text record`, async () => {
            const sub = await plebbit.createSubplebbit({ address: "this-sub-does-not-exist.eth" });
            // Should emit an error and keep on retrying in the next update loop
            let errorCount = 0;
            const errorPromise = new Promise((resolve) => {
                sub.on("error", (err) => {
                    expect(err.code).to.equal("ERR_DOMAIN_TXT_RECORD_NOT_FOUND");
                    expect(sub.updatingState).to.equal("failed");
                    errorCount++;
                    if (errorCount === 3) resolve();
                });
            });
            await sub.update();
            await errorPromise;
            await sub.stop();
            await sub.removeAllListeners("error");
        });

        it(`subplebbit.stop() stops subplebbit updates`, async () => {
            const remotePlebbit = await mockRemotePlebbit();
            const subplebbit = await remotePlebbit.createSubplebbit({ address: "plebbit.eth" }); // 'plebbit.eth' is part of test-server.js
            await subplebbit.update();
            await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
            await subplebbit.stop();
            let updatedHasBeenCalled = false;

            subplebbit.updateOnce = subplebbit._setUpdatingState = async () => {
                updatedHasBeenCalled = true;
            };
            await new Promise((resolve) => setTimeout(resolve, remotePlebbit.updateInterval * 2));
            expect(updatedHasBeenCalled).to.be.false;
        });

        it(`subplebbit.update() is working as expected after calling subplebbit.stop()`, async () => {
            const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

            await subplebbit.update();
            await new Promise((resolve) => subplebbit.once("update", resolve));

            await subplebbit.stop();

            await subplebbit.update();

            await publishRandomPost(subplebbit.address, plebbit);
            await new Promise((resolve) => subplebbit.once("update", resolve));
            await subplebbit.stop();
        });

        it(`subplebbit.update() emits an error if subplebbit record is over 1mb`, async () => {
            // plebbit-js will emit an error once, mark the invalid cid, and never retry
            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) }; //2mb

            const ipnsObj = await createNewIpns();

            await ipnsObj.publishToIpns(JSON.stringify(twoMbObject));

            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });

            const errorPromise = new Promise((resolve) => {
                tempSubplebbit.once("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        // we're using gateways to fetch
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(tempSubplebbit.clients.ipfsGateways)) {
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                        }
                    } else {
                        expect(err.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                    }
                    resolve();
                });
            });
            await tempSubplebbit.update();
            await errorPromise;
            await tempSubplebbit.stop();
        });
    });
});

describeSkipIfRpc(`Subplebbit waiting-retry`, () => {
    it(`subplebbit.update() emits error if loading subplebbit record times out - IPFS Gateway`, async () => {
        const stallingGateway = "http://127.0.0.1:14000"; // this gateway will wait for 11s before responding
        const plebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [stallingGateway], validatePages: true });
        plebbit._timeouts["subplebbit-ipns"] = 1000; // mocking maximum timeout for subplebbit record loading
        const nonExistentIpns = "12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa"; // Random non-existent IPNS
        const tempSubplebbit = await plebbit.createSubplebbit({ address: nonExistentIpns });
        const waitingRetryErrs = [];
        tempSubplebbit.on("error", (err) => waitingRetryErrs.push(err));
        await tempSubplebbit.update();
        await resolveWhenConditionIsTrue(tempSubplebbit, () => waitingRetryErrs.length === 2, "error");
        await tempSubplebbit.stop();

        for (const err of waitingRetryErrs) {
            expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
            for (const gatewayUrl of Object.keys(tempSubplebbit.clients.ipfsGateways))
                expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
        }
    });

    it(`subplebbit.update() emits emits error if resolving subplebbit IPNS times out - Kubo RPC P2P`, async () => {
        const nonExistentIpns = "12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa"; // Random non-existent IPNS
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({ kuboRpcClientsOptions: ["http://localhost:14000/api/v0"] }); // this kubo rpc will take 11s to respond
        plebbit._timeouts["subplebbit-ipns"] = 100; // mocking maximum timeout for subplebbit record loading

        const tempSubplebbit = await plebbit.createSubplebbit({ address: nonExistentIpns });
        const waitingRetryErrs = [];
        tempSubplebbit.on("error", (err) => waitingRetryErrs.push(err));
        await tempSubplebbit.update();
        await resolveWhenConditionIsTrue(tempSubplebbit, () => waitingRetryErrs.length === 2, "error");
        await tempSubplebbit.stop();

        // Check that the errors are as expected
        for (const err of waitingRetryErrs) {
            expect(err.code).to.equal("ERR_IPNS_RESOLUTION_P2P_TIMEOUT");
        }
    });

    it(`subplebbit.update() emits waiting-retry if fetching subplebbit CID record times out - Kubo RPC P2P`, async () => {
        const nonExistentIpns = "12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMmnfqVa"; // Random non-existent IPNS
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({ kuboRpcClientsOptions: ["http://localhost:14000/api/v0"] }); // this kubo rpc will take 11s to respond

        plebbit._timeouts["subplebbit-ipns"] = 100;
        plebbit._timeouts["subplebbit-ipfs"] = 100;
        const tempSubplebbit = await plebbit.createSubplebbit({ address: nonExistentIpns });
        const waitingRetryErrs = [];
        tempSubplebbit.on("error", (err) => waitingRetryErrs.push(err));
        await tempSubplebbit.update();
        await mockPlebbitToReturnSpecificSubplebbit(plebbit, tempSubplebbit.address, {});

        await resolveWhenConditionIsTrue(tempSubplebbit, () => waitingRetryErrs.length === 3, "error");

        await tempSubplebbit.stop();

        expect(waitingRetryErrs[0].code).to.equal("ERR_IPNS_RESOLUTION_P2P_TIMEOUT");
        expect(waitingRetryErrs[1].code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
        expect(waitingRetryErrs[2].code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
    });
});
