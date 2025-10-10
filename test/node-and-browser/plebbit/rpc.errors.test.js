import { expect } from "chai";
import sinon from "sinon";
import PlebbitRpcClient from "../../../dist/node/clients/rpc-client/plebbit-rpc-client.js";
import { PlebbitError } from "../../../dist/node/plebbit-error.js";
import { messages } from "../../../dist/node/errors.js";
import { PlebbitWsServer } from "../../../dist/node/rpc/src/index.js";

describe("RPC error (de)serialization helpers", () => {
    afterEach(() => {
        sinon.restore();
    });

    describe("_deserializeRpcError", () => {
        it("returns a populated PlebbitError when the payload contains a known error code", () => {
            const client = new PlebbitRpcClient("ws://localhost:0");
            const details = { rpcArgs: ["startSubplebbit"], newStartedState: "failed" };
            const serializedError = {
                name: "PlebbitError",
                code: "ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC",
                message: "RPC is down",
                details,
                stack: "stack to remove",
                extra: "metadata"
            };

            const deserialized = client._deserializeRpcError(serializedError);

            expect(deserialized).to.be.instanceOf(PlebbitError);
            expect(deserialized.code).to.equal(serializedError.code);
            expect(deserialized.message).to.equal(messages[serializedError.code]);
            expect(deserialized.details).to.deep.equal(details);
            expect(deserialized.extra).to.equal("metadata");
        });

        it("returns a PlebbitError when the payload is tagged as PlebbitError but has an unknown code", () => {
            const client = new PlebbitRpcClient("ws://localhost:0");
            const serializedError = {
                name: "PlebbitError",
                code: "ERR_SERVER_ONLY_CODE",
                message: "Server introduced a newer error",
                details: { foo: "bar" },
                metadata: { remoteVersion: "2.0.0" }
            };

            const deserialized = client._deserializeRpcError(serializedError);

            expect(deserialized).to.be.instanceOf(PlebbitError);
            expect(deserialized.code).to.equal(serializedError.code);
            expect(deserialized.message).to.equal(serializedError.message);
            expect(deserialized.details).to.deep.equal(serializedError.details);
            expect(deserialized.metadata).to.deep.equal(serializedError.metadata);
        });

        it("returns a plain Error when the payload is not tagged as PlebbitError and has an unknown code", () => {
            const client = new PlebbitRpcClient("ws://localhost:0");
            const serializedError = {
                name: "Error",
                code: "ERR_UNKNOWN_RPC",
                message: "Unknown RPC error",
                details: { foo: "bar" }
            };

            const deserialized = client._deserializeRpcError(serializedError);

            expect(deserialized).to.be.instanceOf(Error);
            expect(deserialized).to.not.be.instanceOf(PlebbitError);
            expect(deserialized.message).to.equal(serializedError.message);
            expect(deserialized.code).to.equal(serializedError.code);
            expect(deserialized.details).to.deep.equal(serializedError.details);
        });

        it("returns a generic Error when payload is malformed", () => {
            const client = new PlebbitRpcClient("ws://localhost:0");

            const deserialized = client._deserializeRpcError("not-an-object");

            expect(deserialized).to.be.instanceOf(Error);
            expect(deserialized.message).to.equal("Received malformed RPC error payload");
            expect(deserialized.details).to.deep.equal({ rawError: "not-an-object" });
        });
    });

    describe("jsonRpcSendNotification", () => {
        it("strips stack traces before serializing error notifications", () => {
            const fakeConnectionId = "connection-1";
            const sendSpy = sinon.spy();
            const serverLike = {
                connections: {
                    [fakeConnectionId]: { send: sendSpy }
                }
            };
            const errorPayload = {
                name: "PlebbitError",
                code: "ERR_SUB_ALREADY_STARTED",
                message: messages.ERR_SUB_ALREADY_STARTED,
                stack: "top-level stack",
                details: {
                    newStartedState: "failed",
                    error: { stack: "nested stack", reason: "boom" }
                }
            };

            PlebbitWsServer.prototype.jsonRpcSendNotification.call(serverLike, {
                method: "startSubplebbit",
                subscription: 42,
                event: "error",
                result: { ...errorPayload },
                connectionId: fakeConnectionId
            });

            expect(sendSpy.calledOnce).to.equal(true);
            const [rawMessage] = sendSpy.firstCall.args;
            const sentMessage = JSON.parse(rawMessage);
            expect(sentMessage.params.event).to.equal("error");
            expect(sentMessage.params.result.code).to.equal("ERR_SUB_ALREADY_STARTED");
            expect(sentMessage.params.result.stack).to.be.undefined;
            expect(sentMessage.params.result.details.error.stack).to.be.undefined;
            expect(sentMessage.params.result.details.error.reason).to.equal("boom");
            expect(sentMessage.params.result.details.newStartedState).to.equal("failed");
        });

        it("keeps stack traces for non-error events", () => {
            const fakeConnectionId = "connection-2";
            const sendSpy = sinon.spy();
            const serverLike = {
                connections: {
                    [fakeConnectionId]: { send: sendSpy }
                }
            };
            const notificationPayload = {
                stack: "keep me",
                details: { error: { stack: "keep me too" } }
            };

            PlebbitWsServer.prototype.jsonRpcSendNotification.call(serverLike, {
                method: "startSubplebbit",
                subscription: 99,
                event: "update",
                result: { ...notificationPayload },
                connectionId: fakeConnectionId
            });

            expect(sendSpy.calledOnce).to.equal(true);
            const [rawMessage] = sendSpy.firstCall.args;
            const sentMessage = JSON.parse(rawMessage);
            expect(sentMessage.params.event).to.equal("update");
            expect(sentMessage.params.result.stack).to.equal("keep me");
            expect(sentMessage.params.result.details.error.stack).to.equal("keep me too");
        });
    });
});
