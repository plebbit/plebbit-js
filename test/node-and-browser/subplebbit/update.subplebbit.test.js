import { expect } from "chai";
import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    getAvailablePlebbitConfigsToTestAgainst,
    isPlebbitFetchingUsingGateways,
    createNewIpns,
    resolveWhenConditionIsTrue,
    itSkipIfRpc,
    createMockedSubplebbitIpns
} from "../../../dist/node/test/test-util.js";
import { convertBase58IpnsNameToBase36Cid } from "../../../dist/node/signer/util.js";

import * as remeda from "remeda";
import { _signJson } from "../../../dist/node/signer/signatures.js";
import { describe, it, vi } from "vitest";

const ensSubplebbitSigner = signers[3];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent("subplebbit.update (remote) - " + config.name, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        itSkipIfRpc("calling update() on many instances of the same subplebbit resolves IPNS only once", async () => {
            const localPlebbit = await config.plebbitInstancePromise();
            const randomSub = await createMockedSubplebbitIpns({});
            let fetchSpy;
            let nameResolveSpy;
            try {
                const usesGateways = isPlebbitFetchingUsingGateways(localPlebbit);
                const isRemoteIpfsGatewayConfig = isPlebbitFetchingUsingGateways(localPlebbit);
                const shouldMockFetchForIpns = isRemoteIpfsGatewayConfig && typeof globalThis.fetch === "function";

                const targetAddressForGatewayIpnsUrl = convertBase58IpnsNameToBase36Cid(randomSub.subplebbitRecord.address);
                const stressCount = 100;

                if (!usesGateways) {
                    const p2pClient =
                        Object.keys(localPlebbit.clients.kuboRpcClients).length > 0
                            ? Object.values(localPlebbit.clients.kuboRpcClients)[0]._client
                            : Object.keys(localPlebbit.clients.libp2pJsClients).length > 0
                              ? Object.values(localPlebbit.clients.libp2pJsClients)[0].heliaWithKuboRpcClientFunctions
                              : undefined;
                    if (!p2pClient?.name?.resolve) {
                        throw new Error("Expected p2p client like kubo or helia RPC client with name.resolve for this test");
                    }
                    nameResolveSpy = vi.spyOn(p2pClient.name, "resolve");
                } else if (shouldMockFetchForIpns) {
                    fetchSpy = vi.spyOn(globalThis, "fetch");
                }

                const subInstances = await Promise.all(
                    new Array(stressCount).fill(null).map(async () => {
                        const subInstance = await localPlebbit.createSubplebbit({ address: randomSub.subplebbitRecord.address });
                        return subInstance;
                    })
                );

                expect(localPlebbit._updatingSubplebbits).to.deep.equal({});

                await Promise.all(subInstances.map((sub) => sub.update()));
                await Promise.all(
                    subInstances.map((sub) =>
                        resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" })
                    )
                );

                const resolveCallsCount = fetchSpy
                    ? fetchSpy.mock.calls.filter(([input]) => {
                          const url = typeof input === "string" ? input : input?.url;
                          return typeof url === "string" && url.includes("/ipns/" + targetAddressForGatewayIpnsUrl);
                      }).length
                    : nameResolveSpy?.mock.calls.length;

                expect(resolveCallsCount).to.equal(
                    1,
                    "Updating many subplebbit instances with the same address should only resolve IPNS once"
                );
            } finally {
                if (nameResolveSpy) nameResolveSpy.mockRestore();
                if (fetchSpy) fetchSpy.mockRestore();
                await localPlebbit.destroy();
            }
        });

        it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () => {
            const subplebbit = await plebbit.getSubplebbit({ address: "plebbit.eth" }); // 'plebbit.eth' is part of test-server.js
            expect(subplebbit.address).to.equal("plebbit.eth");
            const oldUpdatedAt = remeda.clone(subplebbit.updatedAt);
            await subplebbit.update();
            await publishRandomPost(subplebbit.address, plebbit); // Invoke an update
            await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => oldUpdatedAt !== subplebbit.updatedAt });
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

        it.sequential(`subplebbit.update emits error if signature of subplebbit is invalid`, async () => {
            // should emit an error and keep retrying

            const ipnsObj = await createNewIpns();

            const rawSubplebbitJson = (await plebbit.getSubplebbit({ address: signers[0].address })).toJSONIpfs();
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
            await ipnsObj.plebbit.destroy();
        });

        it(`subplebbit.update emits error if schema of subplebbit is invalid `, async () => {
            const rawSubplebbitJson = (await plebbit.getSubplebbit({ address: signers[0].address })).toJSONIpfs();
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
            await ipnsObj.plebbit.destroy();
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
            await ipnsObj.plebbit.destroy();
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
            const remotePlebbit = await config.plebbitInstancePromise();
            const subplebbit = await remotePlebbit.createSubplebbit({ address: "plebbit.eth" }); // 'plebbit.eth' is part of test-server.js
            await subplebbit.update();
            await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
            await subplebbit.stop();
            let updatedHasBeenCalled = false;

            subplebbit.on("update", () => {
                updatedHasBeenCalled = true;
            });

            subplebbit.updateOnce = subplebbit._setUpdatingState = async () => {
                updatedHasBeenCalled = true;
            };
            await new Promise((resolve) => setTimeout(resolve, remotePlebbit.updateInterval * 2));
            expect(updatedHasBeenCalled).to.be.false;
            await remotePlebbit.destroy();
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

            const errorPromise = new Promise((resolve) => tempSubplebbit.once("error", resolve));
            await tempSubplebbit.update();
            const err = await errorPromise;
            await tempSubplebbit.stop();

            if (isPlebbitFetchingUsingGateways(plebbit)) {
                // we're using gateways to fetch
                expect(err.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                for (const gatewayUrl of Object.keys(tempSubplebbit.clients.ipfsGateways))
                    expect(err.details.gatewayToError[gatewayUrl].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
            } else expect(err.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
            await ipnsObj.plebbit.destroy();
        });
    });
});
