import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pTimeout from "p-timeout";
import signers from "../../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    createSubWithNoChallenge,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    
    resolveWhenConditionIsTrue,
    waitTillPostInSubplebbitInstancePages
} from "../../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;
const moderationSubplebbitAddress = signers[7].address;
const modSigner = signers[3];

const waitForSettings = async (rpcClient) =>
    rpcClient.settings ??
    (await new Promise((resolve) => {
        rpcClient.once("settingschange", resolve);
    }));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForSubscriptionEvent = (rpcClient, subscriptionId, eventName, trigger) =>
    new Promise((resolve, reject) => {
        const subscription = rpcClient.getSubscription(subscriptionId);
        if (!subscription) return reject(new Error(`No subscription ${subscriptionId} found for ${eventName}`));

        const onEvent = (res) => {
            subscription.removeListener("error", onError);
            resolve(res.params?.result);
        };
        const onError = (err) => {
            subscription.removeListener(eventName, onEvent);
            reject(err);
        };

        subscription.once(eventName, onEvent);
        subscription.once("error", onError);

        if (trigger) {
            Promise.resolve()
                .then(trigger)
                .catch((err) => {
                    subscription.removeListener(eventName, onEvent);
                    subscription.removeListener("error", onError);
                    reject(err);
                });
        }
    });

// TODO here add an after statement to reset rpc settings
getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-plebbit-rpc"] }).map((config) => {
    describe.concurrent(`RPC comment moderation regression - removing post (${config.name})`, () => {
        let plebbit;
        let postToRemove;

        beforeAll(async () => {
            plebbit = await config.plebbitInstancePromise();
            postToRemove = await publishRandomPost(moderationSubplebbitAddress, plebbit);
            await postToRemove.update();
        });

        afterAll(async () => {
            await plebbit.destroy();
        });

        it.sequential("publishes CommentUpdate removed=true", async () => {
            const removeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToRemove.subplebbitAddress,
                commentCid: postToRemove.cid,
                commentModeration: { reason: "to remove a post RPC regression", removed: true },
                signer: modSigner
            });
            await publishWithExpectedResult(removeEdit, true);

            await postToRemove.update();
            await resolveWhenConditionIsTrue({ toUpdate: postToRemove, predicate: () => postToRemove.removed === true });
            expect(postToRemove.removed).to.be.true;
            expect(postToRemove.raw.commentUpdate.removed).to.be.true;
        });

        it.sequential("publishes CommentUpdate removed=false", async () => {
            const unremoveEdit = await plebbit.createCommentModeration({
                subplebbitAddress: postToRemove.subplebbitAddress,
                commentCid: postToRemove.cid,
                commentModeration: { reason: "to unremove a post RPC regression", removed: false },
                signer: modSigner
            });
            await publishWithExpectedResult(unremoveEdit, true);

            await postToRemove.update();
            await resolveWhenConditionIsTrue({ toUpdate: postToRemove, predicate: () => postToRemove.removed === false });
            expect(postToRemove.removed).to.be.false;
            expect(postToRemove.raw.commentUpdate.removed).to.be.false;
        });
    });

    describe.concurrent(`RPC comment moderation regression - removing reply (${config.name})`, () => {
        let plebbit;
        let post;
        let replyToBeRemoved;

        beforeAll(async () => {
            plebbit = await config.plebbitInstancePromise();
            post = await publishRandomPost(moderationSubplebbitAddress, plebbit);
            replyToBeRemoved = await publishRandomReply(post, plebbit);
            await replyToBeRemoved.update();
        });

        afterAll(async () => {
            await plebbit.destroy();
        });

        it.sequential("publishes CommentUpdate removed=true for reply", async () => {
            const removeEdit = await plebbit.createCommentModeration({
                subplebbitAddress: replyToBeRemoved.subplebbitAddress,
                commentCid: replyToBeRemoved.cid,
                commentModeration: { reason: "remove reply RPC regression", removed: true },
                signer: modSigner
            });
            await publishWithExpectedResult(removeEdit, true);

            await replyToBeRemoved.update();
            await resolveWhenConditionIsTrue({ toUpdate: replyToBeRemoved, predicate: () => replyToBeRemoved.removed === true });
            expect(replyToBeRemoved.removed).to.be.true;
            expect(replyToBeRemoved.raw.commentUpdate.removed).to.be.true;
        });
    });

    describe.concurrent(`RPC comment update survives sibling unsubscribe (${config.name})`, () => {
        it("keeps updates flowing after a sibling calls comment.stop()", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const post = await publishRandomPost(moderationSubplebbitAddress, plebbitB);
                const commentA = await plebbitA.createComment({
                    cid: post.cid,
                    subplebbitAddress: post.subplebbitAddress
                });
                const commentB = await plebbitB.createComment({
                    cid: post.cid,
                    subplebbitAddress: post.subplebbitAddress
                });

                await commentA.update(); // starts shared updater
                commentB.update(); // attach B to the same updater

                // Force A to disconnect its RPC subscriptions before B has confirmed any update
                await plebbitA.destroy();

                await pTimeout(
                    resolveWhenConditionIsTrue({
                        toUpdate: commentB,
                        predicate: () => typeof commentB.updatedAt === "number"
                    }),
                    { milliseconds: 45000, message: "Comment B never reached initial updatedAt after sibling disconnect (regression)" }
                );

                const removeEdit = await plebbitB.createCommentModeration({
                    subplebbitAddress: post.subplebbitAddress,
                    commentCid: post.cid,
                    commentModeration: { reason: "keep updates after sibling teardown", removed: true },
                    signer: modSigner
                });
                await publishWithExpectedResult(removeEdit, true);

                await pTimeout(
                    resolveWhenConditionIsTrue({
                        toUpdate: commentB,
                        predicate: () => commentB.removed === true
                    }),
                    {
                        milliseconds: 30000,
                        message: "Remaining subscriber did not receive removal update after sibling stop (regression)"
                    }
                );

                expect(commentB.removed).to.be.true;
                expect(commentB.raw.commentUpdate?.removed).to.be.true;
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 80000);
    });

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
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 1,
                    userAgent: "hello" + Math.random()
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

        it("createSubplebbit survives setSettings overlap (no ERR_PLEBBIT_IS_DESTROYED)", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 7,
                    userAgent: "overlap-create" + Math.random()
                };

                // Run several overlapping createSubplebbit + setSettings pairs to maximize the window where the old plebbit can be destroyed mid-call
                const overlapAttempts = 4;
                const tasks = Array.from({ length: overlapAttempts }).map((_, attemptIdx) => {
                    const optionsWithJitter = {
                        ...updatedOptions,
                        updateInterval: (updatedOptions.updateInterval || 60000) + attemptIdx * 13
                    };
                    return pTimeout(
                        (async () => {
                            const createPromise = createSubWithNoChallenge(
                                { title: "overlap setSettings create " + Date.now() + "-" + attemptIdx, description: "tmp" },
                                plebbitB
                            );

                            const settingsPromise = plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: optionsWithJitter });

                            const createdSub = await createPromise;
                            await settingsPromise;
                            await createdSub.start();
                            const post = await publishRandomPost(createdSub.address, plebbitB);
                            const fetched = await plebbitB.getComment(post.cid);
                            expect(fetched.cid).to.equal(post.cid);
                        })(),
                        { milliseconds: 55000, message: "Timed out during createSubplebbit/setSettings overlap" }
                    );
                });

                await Promise.all(tasks);
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 80000);

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

        it("in-flight publish survives back-to-back setSettings from different clients", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();
            const plebbitC = await config.plebbitInstancePromise();

            try {
                const initialSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const firstUpdatedOptions = {
                    ...initialSettings.plebbitOptions,
                    updateInterval: (initialSettings.plebbitOptions.updateInterval || 60000) + 37,
                    userAgent: "first" + Math.random()
                };

                const firstSettingsChangeOnB = pTimeout(
                    new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)),
                    { milliseconds: 45000, message: "Timed out waiting for first settingschange on client B" }
                );
                const firstSettingsChangeOnC = pTimeout(
                    new Promise((resolve) => plebbitC._plebbitRpcClient.once("settingschange", resolve)),
                    { milliseconds: 45000, message: "Timed out waiting for first settingschange on client C" }
                );

                await plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: firstUpdatedOptions });
                await Promise.all([firstSettingsChangeOnB, firstSettingsChangeOnC]);

                const postFirstSettings = await waitForSettings(plebbitC._plebbitRpcClient);
                const secondUpdatedOptions = {
                    ...postFirstSettings.plebbitOptions,
                    updateInterval: (postFirstSettings.plebbitOptions.updateInterval || 60000) + 41,
                    userAgent: "second" + Math.random()
                };

                const secondSettingsChangeOnB = pTimeout(
                    new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)),
                    { milliseconds: 45000, message: "Timed out waiting for second settingschange on client B" }
                );

                const publishPromise = pTimeout(publishRandomPost(subplebbitAddress, plebbitB), {
                    milliseconds: 45000,
                    message: "Timed out publishing across consecutive setSettings"
                });

                await delay(20); // overlap publish with the second setSettings
                await plebbitC._plebbitRpcClient.setSettings({ plebbitOptions: secondUpdatedOptions });
                await secondSettingsChangeOnB;

                const publishedPost = await publishPromise;
                const fetched = await plebbitB.getComment(publishedPost.cid);

                expect(fetched.cid).to.equal(publishedPost.cid);
                expect(plebbitB._plebbitRpcClient?.state).to.equal("connected");
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
                if (!plebbitC.destroyed) await plebbitC.destroy();
            }
        }, 90000);

        it("subplebbit.update does not hang when client A calls setSettings mid-update", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const subB = await plebbitB.getSubplebbit(subplebbitAddress);
                await subB.update();

                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 11,
                    userAgent: "hello" + Math.random()
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
                await waitTillPostInSubplebbitInstancePages(post, subB); // hangs here
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
                await freshSub.start();

                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 19,
                    userAgent: "hello" + Math.random()
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

        it("does not throw ERR_PLEBBIT_IS_DESTROYED when setSettings overlaps with startSubplebbit/getComment", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 23,
                    userAgent: "Hello" + Math.random()
                };

                const settingsChangeOnB = pTimeout(new Promise((resolve) => plebbitB._plebbitRpcClient.once("settingschange", resolve)), {
                    milliseconds: 45000,
                    message: "Timed out waiting for settingschange on client B"
                });

                const createStartSubPromise = pTimeout(
                    (async () => {
                        const sub = await createSubWithNoChallenge({ title: "temp overlap " + Date.now(), description: "tmp" }, plebbitB);
                        await sub.start();
                        return sub;
                    })(),
                    { milliseconds: 45000, message: "Timed out creating sub during overlapping setSettings" }
                );

                await delay(10);
                await pTimeout(plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions }), {
                    milliseconds: 45000,
                    message: "Timed out running setSettings"
                });
                await settingsChangeOnB;

                const sub = await createStartSubPromise;
                const post = await publishRandomPost(sub.address, plebbitB);
                const fetched = await plebbitB.getComment(post.cid);
                expect(fetched.cid).to.equal(post.cid);
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 80000);

        it("setSettings completes while a subplebbitUpdate subscription is mid-update", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const subB = await plebbitB.getSubplebbit(subplebbitAddress);
                await subB.update();

                const subplebbitUpdateSubscriptionId = await plebbitB._plebbitRpcClient.subplebbitUpdateSubscribe(subplebbitAddress);

                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 29
                };

                const overlappingUpdate = pTimeout(subB.update(), {
                    milliseconds: 45000,
                    message: "subplebbit.update timed out while setSettings ran"
                });

                const setSettingsPromise = pTimeout(plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions }), {
                    milliseconds: 45000,
                    message: "setSettings hung with active subplebbitUpdate subscription"
                });

                await Promise.all([setSettingsPromise, overlappingUpdate]);

                const updateAfterSettings = await pTimeout(
                    waitForSubscriptionEvent(plebbitB._plebbitRpcClient, subplebbitUpdateSubscriptionId, "update", () => subB.update()),
                    { milliseconds: 45000, message: "subplebbitUpdate subscription stopped emitting after setSettings" }
                );

                expect(updateAfterSettings).to.be.ok;
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 90000);

        it("startSubplebbit subscription stays responsive through setSettings even with subplebbitUpdate running", async () => {
            const plebbitA = await config.plebbitInstancePromise();
            const plebbitB = await config.plebbitInstancePromise();

            try {
                const freshSub = await createSubWithNoChallenge(
                    { title: "sub setSettings overlap " + Date.now(), description: "tmp" },
                    plebbitB
                );
                const freshAddress = freshSub.address;

                const startSubplebbitSubscriptionId = await plebbitB._plebbitRpcClient.startSubplebbit(freshAddress);
                await pTimeout(waitForSubscriptionEvent(plebbitB._plebbitRpcClient, startSubplebbitSubscriptionId, "update"), {
                    milliseconds: 45000,
                    message: "startSubplebbit failed to emit initial update"
                });

                const subplebbitUpdateSubscriptionId = await plebbitB._plebbitRpcClient.subplebbitUpdateSubscribe(freshAddress);

                const currentSettings = await waitForSettings(plebbitA._plebbitRpcClient);
                const updatedOptions = {
                    ...currentSettings.plebbitOptions,
                    updateInterval: (currentSettings.plebbitOptions.updateInterval || 60000) + 31
                };

                const nextStartUpdate = pTimeout(
                    waitForSubscriptionEvent(plebbitB._plebbitRpcClient, startSubplebbitSubscriptionId, "update"),
                    { milliseconds: 50000, message: "startSubplebbit stopped emitting updates after setSettings" }
                );

                const subUpdateAfterSettings = pTimeout(
                    waitForSubscriptionEvent(plebbitB._plebbitRpcClient, subplebbitUpdateSubscriptionId, "update", async () =>
                        (await plebbitB.getSubplebbit(freshAddress)).update()
                    ),
                    { milliseconds: 50000, message: "subplebbitUpdate subscription died during setSettings+startSubplebbit" }
                );

                const publishPromise = pTimeout(publishRandomPost(freshAddress, plebbitB), {
                    milliseconds: 50000,
                    message: "publish stalled while setSettings ran alongside startSubplebbit"
                });

                const setSettingsPromise = pTimeout(plebbitA._plebbitRpcClient.setSettings({ plebbitOptions: updatedOptions }), {
                    milliseconds: 50000,
                    message: "setSettings hung while startSubplebbit/subplebbitUpdate listeners were active"
                });

                const [publishedPost] = await Promise.all([publishPromise, nextStartUpdate, subUpdateAfterSettings, setSettingsPromise]);
                const fetched = await plebbitB.getComment(publishedPost.cid);

                expect(fetched.cid).to.equal(publishedPost.cid);
            } finally {
                if (!plebbitA.destroyed) await plebbitA.destroy();
                if (!plebbitB.destroyed) await plebbitB.destroy();
            }
        }, 100000);
    });
});
