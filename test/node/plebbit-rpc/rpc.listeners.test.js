import { beforeAll, afterAll } from "vitest";
import { expect } from "chai";
import tempy from "tempy";

import PlebbitWsServerModule from "../../../dist/node/rpc/src/index.js";
import { restorePlebbitJs } from "../../../dist/node/rpc/src/lib/plebbit-js/index.js";
import { describeSkipIfRpc, mockRpcServerForTests, mockRpcServerPlebbit } from "../../../dist/node/test/test-util.js";

const { PlebbitWsServer: createPlebbitWsServer, setPlebbitJs } = PlebbitWsServerModule;

const STARTED_EVENT_NAMES = [
    "challengerequest",
    "challenge",
    "challengeanswer",
    "challengeverification",
    "error",
    "startedstatechange",
    "update"
];

const getTestPort = (() => {
    let offset = 0;
    return () => {
        offset += 1;
        return 19000 + offset;
    };
})();

const cloneTrackedListeners = (trackedMap) => new Map([...trackedMap.entries()].map(([event, listeners]) => [event, new Set(listeners)]));

const setupConnectionContext = (rpcServer, connectionId) => {
    rpcServer.subscriptionCleanups[connectionId] = {};
    rpcServer.connections[connectionId] = { send: () => {} };
    rpcServer._onSettingsChange[connectionId] = {};
};

describeSkipIfRpc("PlebbitWsServer listener lifecycle", function () {
    let rpcServer;

    beforeAll(() => {
        setPlebbitJs(async (options) => mockRpcServerPlebbit({ dataPath: tempy.directory(), ...(options || {}) }));
    });

    afterAll(() => {
        restorePlebbitJs();
    });

    afterEach(async () => {
        if (rpcServer) {
            try {
                await rpcServer.destroy();
            } catch (error) {
                console.error("rpc.listeners.test destroy error", error);
            }
            rpcServer = undefined;
        }
    });

    it("does not track listeners when creating a subplebbit", async function () {
        rpcServer = await createPlebbitWsServer({ port: getTestPort() });
        mockRpcServerForTests(rpcServer);

        const trackedCalls = [];
        const originalTrack = rpcServer._trackSubplebbitListener;
        rpcServer._trackSubplebbitListener = function (subplebbit, event, listener) {
            trackedCalls.push({ subplebbit, event, listener });
            return originalTrack.call(this, subplebbit, event, listener);
        };

        try {
            const created = await rpcServer.createSubplebbit([{}]);
            expect(created.address).to.be.a("string");
            expect(trackedCalls).to.have.length(0, "createSubplebbit should not track event listeners");
        } finally {
            rpcServer._trackSubplebbitListener = originalTrack;
        }
    });

    it("tracks listeners on startSubplebbit and removes them on stopSubplebbit", async function () {
        rpcServer = await createPlebbitWsServer({ port: getTestPort() });
        mockRpcServerForTests(rpcServer);

        const connectionId = "start-stop-connection";
        setupConnectionContext(rpcServer, connectionId);

        const createResponse = await rpcServer.createSubplebbit([{}]);
        const address = createResponse.address;
        expect(address).to.be.a("string");

        let capturedSubplebbit;
        const originalSetup = rpcServer._setupStartedEvents;
        rpcServer._setupStartedEvents = function (subplebbit, connId, subscriptionId) {
            capturedSubplebbit = subplebbit;
            return originalSetup.call(this, subplebbit, connId, subscriptionId);
        };

        try {
            const subscriptionId = await rpcServer.startSubplebbit([{ address }], connectionId);
            expect(subscriptionId).to.be.a("number");
            expect(capturedSubplebbit).to.exist;

            const tracked = rpcServer._trackedSubplebbitListeners.get(capturedSubplebbit);
            expect(tracked).to.exist;

            STARTED_EVENT_NAMES.forEach((event) => {
                expect(tracked.has(event)).to.equal(true, `Missing tracked listeners for event ${event}`);
                const listeners = tracked.get(event);
                expect(listeners.size).to.equal(1, `Expected one tracked listener for event ${event}`);
                listeners.forEach((listener) => {
                    const emitterListeners = capturedSubplebbit.listeners(event);
                    expect(emitterListeners).to.include(listener, `Listener for ${event} not attached to subplebbit`);
                });
            });

            const trackedSnapshot = cloneTrackedListeners(tracked);

            await rpcServer.stopSubplebbit([{ address }]);

            expect(rpcServer._trackedSubplebbitListeners.get(capturedSubplebbit)).to.equal(
                undefined,
                "Tracked listeners should be removed after stop"
            );

            trackedSnapshot.forEach((listeners, event) => {
                const emitterListeners = capturedSubplebbit.listeners(event);
                listeners.forEach((listener) => {
                    expect(emitterListeners).to.not.include(listener, `Listener for ${event} should be removed on stop`);
                });
            });
        } finally {
            rpcServer._setupStartedEvents = originalSetup;
        }
    });

    it("removes tracked listeners when deleting a started subplebbit", async function () {
        rpcServer = await createPlebbitWsServer({ port: getTestPort() });
        mockRpcServerForTests(rpcServer);

        const connectionId = "delete-connection";
        setupConnectionContext(rpcServer, connectionId);

        const createResponse = await rpcServer.createSubplebbit([{}]);
        const address = createResponse.address;
        expect(address).to.be.a("string");

        let capturedSubplebbit;
        const originalSetup = rpcServer._setupStartedEvents;
        rpcServer._setupStartedEvents = function (subplebbit, connId, subscriptionId) {
            capturedSubplebbit = subplebbit;
            return originalSetup.call(this, subplebbit, connId, subscriptionId);
        };

        try {
            await rpcServer.startSubplebbit([{ address }], connectionId);
            expect(capturedSubplebbit).to.exist;

            const tracked = rpcServer._trackedSubplebbitListeners.get(capturedSubplebbit);
            expect(tracked).to.exist;
            const trackedSnapshot = cloneTrackedListeners(tracked);

            const deleteResult = await rpcServer.deleteSubplebbit([{ address }]);
            expect(deleteResult).to.equal(true);

            expect(rpcServer._trackedSubplebbitListeners.get(capturedSubplebbit)).to.equal(
                undefined,
                "Tracked listeners should be removed after delete"
            );
            expect(rpcServer.plebbit._startedSubplebbits[address]).to.equal(undefined, "Started sub list should not contain deleted sub");

            trackedSnapshot.forEach((listeners, event) => {
                const emitterListeners = capturedSubplebbit.listeners(event);
                listeners.forEach((listener) => {
                    expect(emitterListeners).to.not.include(listener, `Listener for ${event} should be removed on delete`);
                });
            });
        } finally {
            rpcServer._setupStartedEvents = originalSetup;
        }
    });
});
