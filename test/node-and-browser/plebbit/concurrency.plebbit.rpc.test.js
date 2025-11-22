import { describe, it, expect } from "vitest";
import pTimeout from "p-timeout";
import signers from "../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    createSubWithNoChallenge,
    publishRandomPost,
    waitTillPostInSubplebbitInstancePages
} from "../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;

const waitForSettings = async (rpcClient) =>
    rpcClient.settings ??
    (await new Promise((resolve) => {
        rpcClient.once("settingschange", resolve);
    }));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-plebbit-rpc"] }).map((config) =>
    describe.concurrent(`plebbit RPC concurrency - ${config.name}`, () => {
        it("handles two RPC clients publishing in parallel without dropping either connection", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const [subA, subB] = await Promise.all([
                    plebbitA.getSubplebbit(subplebbitAddress),
                    plebbitB.getSubplebbit(subplebbitAddress)
                ]);
                await Promise.all([subA.update(), subB.update()]);

                const [postFromA, postFromB] = await pTimeout(
                    Promise.all([publishRandomPost(subplebbitAddress, plebbitA), publishRandomPost(subplebbitAddress, plebbitB)]),
                    { milliseconds: 60000, message: "Timed out publishing in parallel via RPC" }
                );

                const [fetchedByB, fetchedByA] = await Promise.all([
                    plebbitB.getComment(postFromA.cid),
                    plebbitA.getComment(postFromB.cid)
                ]);

                expect(fetchedByB.cid).to.equal(postFromA.cid);
                expect(fetchedByA.cid).to.equal(postFromB.cid);
                expect(plebbitA._plebbitRpcClient?.state).to.equal("connected");
                expect(plebbitB._plebbitRpcClient?.state).to.equal("connected");
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 70000);

        it("keeps an active RPC client's subscription alive when a sibling client is destroyed mid-flight", async () => {
            const plebbitToDestroy = await config.plebbitInstancePromise();
            const plebbitToKeep = await config.plebbitInstancePromise();

            try {
                const subToKeep = await plebbitToKeep.getSubplebbit(subplebbitAddress);
                await subToKeep.update();

                const publishPromise = publishRandomPost(subplebbitAddress, plebbitToKeep);

                await plebbitToDestroy.destroy();

                const publishedPost = await publishPromise;
                await subToKeep.update();
                await waitTillPostInSubplebbitInstancePages(publishedPost, subToKeep);
                const remotePost = await plebbitToKeep.getComment(publishedPost.cid);

                expect(remotePost.cid).to.equal(publishedPost.cid);
                expect(plebbitToKeep._plebbitRpcClient?.state).to.equal("connected");
            } finally {
                if (!plebbitToDestroy.destroyed) await plebbitToDestroy.destroy();
                if (!plebbitToKeep.destroyed) await plebbitToKeep.destroy();
            }
        }, 60000);

        it("keeps updates flowing to one subscriber after another subscriber to the same sub stops", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const [subA, subB] = await Promise.all([
                    plebbitA.getSubplebbit(subplebbitAddress),
                    plebbitB.getSubplebbit(subplebbitAddress)
                ]);
                await Promise.all([subA.update(), subB.update()]);

                await subB.stop(); // unsubscribes B from server-side listeners
                await plebbitB.destroy();

                const newPost = await publishRandomPost(subplebbitAddress, plebbitA);
                await subA.update(); // trigger a fresh update on the surviving subscriber
                await waitTillPostInSubplebbitInstancePages(newPost, subA);

                const fetched = await plebbitA.getComment(newPost.cid);
                expect(fetched.cid).to.equal(newPost.cid);
                expect(plebbitA._plebbitRpcClient?.state).to.equal("connected");
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 65000);

        it("client B remains usable when client A calls setSettings, and receives settingschange", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 1
                };

                const settingsChangeOnB = pTimeout(new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)), {
                    milliseconds: 45000,
                    message: "Timed out waiting for settingschange on client B"
                });

                await plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions });
                await settingsChangeOnB;

                const subB = await plebbitB.getSubplebbit(subplebbitAddress);
                await subB.update();
                const post = await publishRandomPost(subplebbitAddress, plebbitB);
                const fetched = await plebbitB.getComment(post.cid);
                expect(fetched.cid).to.equal(post.cid);
                expect(plebbitB._plebbitRpcClient?.state).to.equal("connected");
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 70000);

        it("does not drop an in-flight publish on client B when client A calls setSettings (server restart)", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 3
                };

                const settingsChangeOnB = pTimeout(new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)), {
                    milliseconds: 45000,
                    message: "Timed out waiting for settingschange on client B"
                });

                const publishPromise = pTimeout(publishRandomPost(subplebbitAddress, plebbitB), {
                    milliseconds: 45000,
                    message: "Timed out publishing while setSettings ran"
                });

                // Kick off setSettings almost immediately to overlap with publish
                await delay(50);
                await plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions });

                const publishedPost = await publishPromise;
                await settingsChangeOnB;

                const fetched = await plebbitB.getComment(publishedPost.cid);
                expect(fetched.cid).to.equal(publishedPost.cid);
                expect(plebbitB._plebbitRpcClient?.state).to.equal("connected");
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 70000);

        it("subplebbit.update does not hang when client A calls setSettings mid-update", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const subB = await plebbitB.getSubplebbit(subplebbitAddress);
                await subB.update();

                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 11
                };

                const settingsChangeOnB = pTimeout(new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)), {
                    milliseconds: 45000,
                    message: "Timed out waiting for settingschange on client B"
                });

                const updatePromise = pTimeout(subB.update(), {
                    milliseconds: 45000,
                    message: "subplebbit.update timed out while setSettings ran"
                });

                await delay(20);
                await plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions });

                await Promise.all([settingsChangeOnB, updatePromise]);

                const post = await publishRandomPost(subplebbitAddress, plebbitB);
                await waitTillPostInSubplebbitInstancePages(post, subB);
                const fetched = await plebbitB.getComment(post.cid);
                expect(fetched.cid).to.equal(post.cid);
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 75000);

        it("startSubplebbit subscription still receives updates after client A calls setSettings", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const freshSub = await createSubWithNoChallenge({ title: "temp sub " + Date.now(), description: "tmp" }, plebbitB);
                const freshAddress = freshSub.address;
                const startSubId = await plebbitB._plebbitRpcClient._webSocketClient.call("startSubplebbit", [freshAddress]);

                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 17
                };

                const settingsChangeOnB = pTimeout(new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)), {
                    milliseconds: 45000,
                    message: "Timed out waiting for settingschange on client B"
                });

                await plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions });
                await settingsChangeOnB;

                const updateNotification = await pTimeout(
                    new Promise((resolve, reject) => {
                        const sub = plebbitB._plebbitRpcClient.getSubscription(startSubId);
                        if (!sub) return reject(new Error("No startSubplebbit subscription found after setSettings"));
                        sub.once("update", (res) => resolve(res.params?.result));
                        // trigger sub update to provoke an event
                        plebbitB._plebbitRpcClient._webSocketClient
                            .call("subplebbitUpdateSubscribe", [freshAddress])
                            .catch((err) => reject(err));
                    }),
                    { milliseconds: 45000, message: "Timed out waiting for started sub update after setSettings" }
                );

                expect(updateNotification).to.be.ok;
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 75000);

        it("in-flight publish on a started sub survives setSettings from another client", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const freshSub = await createSubWithNoChallenge({ title: "temp publish sub " + Date.now(), description: "tmp" }, plebbitB);
                const freshAddress = freshSub.address;
                await plebbitB._plebbitRpcClient._webSocketClient.call("startSubplebbit", [freshAddress]);

                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 19
                };

                const settingsChangeOnB = pTimeout(new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)), {
                    milliseconds: 45000,
                    message: "Timed out waiting for settingschange on client B"
                });

                const publishPromise = pTimeout(publishRandomPost(freshAddress, plebbitB), {
                    milliseconds: 45000,
                    message: "Timed out publishing while setSettings ran"
                });

                await delay(20);
                await plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions });
                await settingsChangeOnB;

                const publishedPost = await publishPromise;
                const fetched = await plebbitB.getComment(publishedPost.cid);
                expect(fetched.cid).to.equal(publishedPost.cid);
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 80000);

        it.only("does not throw ERR_PLEBBIT_IS_DESTROYED when setSettings overlaps with createSubplebbit/getComment", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 23
                };

                const settingsChangeOnB = pTimeout(
                    new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)),
                    { milliseconds: 45000, message: "Timed out waiting for settingschange on client B" }
                );

                const createSubPromise = pTimeout(
                    createSubWithNoChallenge({ title: "temp overlap " + Date.now(), description: "tmp" }, plebbitB),
                    { milliseconds: 45000, message: "Timed out creating sub during overlapping setSettings" }
                );

                await delay(10);
                await pTimeout(plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions }), {
                    milliseconds: 45000,
                    message: "Timed out running setSettings"
                });
                await settingsChangeOnB;

                const sub = await createSubPromise;
                const post = await publishRandomPost(sub.address, plebbitB);
                const fetched = await plebbitB.getComment(post.cid);
                expect(fetched.cid).to.equal(post.cid);
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 80000);
    })
);
