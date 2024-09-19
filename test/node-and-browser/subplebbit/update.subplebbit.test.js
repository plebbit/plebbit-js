import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    mockRemotePlebbit,
    getRemotePlebbitConfigs,
    isPlebbitFetchingUsingGateways,
    createNewIpns
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

        it(`subplebbit.update() emits error if user supplied {address: ipnsName} and the actual address was ENS`, async () => {
            const loadedSubplebbit = await plebbit.createSubplebbit({ address: ensSubplebbitSigner.address });
            const errorPromise = new Promise((resolve) => loadedSubplebbit.once("error", resolve));

            await loadedSubplebbit.update();
            const error = await errorPromise;
            if (isPlebbitFetchingUsingGateways(plebbit)) {
                expect(error.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways)) {
                    expect(error.details.gatewayToError[gatewayUrl].code).to.equal("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT");
                }
            } else expect(error.code).to.equal("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT");
            // should not accept the SubplebbitIpfs props
            expect(loadedSubplebbit.updatedAt).to.be.undefined;
            expect(loadedSubplebbit.address).to.equal(ensSubplebbitSigner.address);
            await loadedSubplebbit.stop();
        });

        it(`subplebbit.update emits error and retries if signature of subplebbit is invalid`, async () => {
            // should emit an error and keep retrying

            const ipnsObj = await createNewIpns();

            const rawSubplebbitJson = (await plebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
            rawSubplebbitJson.address = ipnsObj.signer.address; // this will corrupt the signature
            await ipnsObj.publishToIpns(JSON.stringify(rawSubplebbitJson));
            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });

            let retries = 0;

            await tempSubplebbit.update();
            await new Promise((resolve) => {
                tempSubplebbit.on("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                    } else {
                        expect(err.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                    }
                    retries++;
                    if (retries === 3) resolve();
                });
            });

            await tempSubplebbit.stop();
        });

        it(`subplebbit.update emits error and retries if schema of subplebbit is invalid `, async () => {
            const rawSubplebbitJson = (await plebbit.getSubplebbit(signers[0].address)).toJSONIpfs();
            rawSubplebbitJson.lastPostCid = 12345; // This will make schema invalid

            const ipnsObj = await createNewIpns();
            await ipnsObj.publishToIpns(JSON.stringify(rawSubplebbitJson));
            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });
            let retries = 0;

            await tempSubplebbit.update();
            await new Promise((resolve) => {
                tempSubplebbit.on("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
                    } else {
                        expect(err.code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
                    }
                    retries++;
                    if (retries === 3) resolve();
                });
            });

            await tempSubplebbit.stop();
        });

        it(`subplebbit.update emits error and retries if subplebbit record is invalid json`, async () => {
            const ipnsObj = await createNewIpns();
            await ipnsObj.publishToIpns("<html>"); // invalid json
            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });

            await tempSubplebbit.update();
            let retries = 0;
            await new Promise((resolve) => {
                tempSubplebbit.on("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        // we're using gateways to fetch
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(tempSubplebbit.clients.ipfsGateways)) {
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_INVALID_JSON");
                        }
                    } else {
                        expect(err.code).to.equal("ERR_INVALID_JSON");
                    }
                    retries++;
                    if (retries === 3) resolve();
                });
            });

            await tempSubplebbit.stop();
        });

        it(`subplebbit.update emits error if address of ENS and ENS address has no subplebbit-address text record`, async () => {
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

        it(`subplebbit.update() emits an error if subplebbit record is over 1mb`, async () => {
            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) }; //2mb

            const ipnsObj = await createNewIpns();

            await ipnsObj.publishToIpns(JSON.stringify(twoMbObject));

            const tempSubplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });

            let retries = 0;
            await tempSubplebbit.update();
            await new Promise((resolve) => {
                tempSubplebbit.on("error", (err) => {
                    if (isPlebbitFetchingUsingGateways(plebbit)) {
                        // we're using gateways to fetch
                        expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                        for (const gatewayUrl of Object.keys(tempSubplebbit.clients.ipfsGateways)) {
                            expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                        }
                    } else {
                        expect(err.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                    }
                    retries++;
                    if (retries === 3) resolve();
                });
            });

            await tempSubplebbit.stop();
        });
    });
});
