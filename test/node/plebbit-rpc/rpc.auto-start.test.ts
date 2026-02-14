import { beforeAll, afterAll, describe, it, expect, beforeEach, afterEach } from "vitest";
import PlebbitWsServer from "../../../dist/node/rpc/src/index.js";
import { describeSkipIfRpc, mockPlebbit } from "../../../dist/node/test/test-util.js";
import tempy from "tempy";
import path from "path";
import { promises as fs } from "fs";

import Plebbit from "../../../dist/node/index.js";
import type { Plebbit as PlebbitType } from "../../../dist/node/plebbit/plebbit.js";
import type { RpcLocalSubplebbit } from "../../../dist/node/subplebbit/rpc-local-subplebbit.js";
import type { CreatePlebbitWsServerOptions } from "../../../dist/node/rpc/src/types.js";

type PlebbitWsServerType = Awaited<ReturnType<typeof PlebbitWsServer.PlebbitWsServer>>;

// Interface for accessing private members
interface PlebbitWsServerPrivateAccess {
    _startedSubplebbits: Record<string, unknown>;
    _autoStartPreviousSubplebbits: () => Promise<void>;
}

const waitForSubToBeStarted = async (rpcServer: PlebbitWsServerType, address: string, timeout = 10000): Promise<void> => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const privateAccess = rpcServer as unknown as PlebbitWsServerPrivateAccess;
        if (address in privateAccess._startedSubplebbits && privateAccess._startedSubplebbits[address] !== "pending") {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timeout waiting for sub ${address} to be started`);
};

describeSkipIfRpc(`RPC Server Auto-Start Subplebbits`, async () => {
    let basePlebbit: PlebbitType;

    beforeAll(async () => {
        basePlebbit = await mockPlebbit();
    });

    afterAll(async () => {
        await basePlebbit.destroy();
    });

    /**
     * Matrix Scenario Tests:
     *
     * | # | Sub state on last RPC exit             | startStartedSubplebbitsOnStartup | Expected behavior        |
     * |---|----------------------------------------|----------------------------------|--------------------------|
     * | 1 | Was running (not stopped explicitly)   | true                             | Auto-start               |
     * | 2 | Was running (not stopped explicitly)   | false                            | Do nothing               |
     * | 3 | Was stopped explicitly by user         | true                             | Do nothing               |
     * | 4 | Was stopped explicitly by user         | false                            | Do nothing               |
     * | 5 | Never started in this RPC session      | true                             | Do nothing               |
     * | 6 | Never started in this RPC session      | false                            | Do nothing               |
     */

    describe("Scenario 1: Was running (not stopped explicitly) + startStartedSubplebbitsOnStartup=true", () => {
        it("should auto-start the subplebbit on RPC server restart", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19150;

            // Create first RPC server and start a sub
            const options1: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer1 = await PlebbitWsServer.PlebbitWsServer(options1);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit1 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            // Create and start a subplebbit
            const sub = await clientPlebbit1.createSubplebbit({}) as RpcLocalSubplebbit;
            const subAddress = sub.address;
            await sub.start();

            // Verify it's running
            expect(sub.started).to.be.true;

            // Destroy without stopping (simulating crash/restart)
            await clientPlebbit1.destroy();
            await rpcServer1.destroy();

            // Create second RPC server with auto-start enabled
            const options2: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options2);

            // Wait for auto-start to complete
            await waitForSubToBeStarted(rpcServer2, subAddress);

            // Verify it was auto-started
            const privateAccess = rpcServer2 as unknown as PlebbitWsServerPrivateAccess;
            expect(subAddress in privateAccess._startedSubplebbits).to.be.true;

            // Clean up
            const clientPlebbit2 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
            const sub2 = await clientPlebbit2.createSubplebbit({ address: subAddress }) as RpcLocalSubplebbit;
            await sub2.stop();
            await sub2.delete();
            await clientPlebbit2.destroy();
            await rpcServer2.destroy();
        });
    });

    describe("Scenario 2: Was running (not stopped explicitly) + startStartedSubplebbitsOnStartup=false", () => {
        it("should NOT auto-start the subplebbit on RPC server restart", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19151;

            // Create first RPC server with auto-start enabled to create the state
            const options1: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer1 = await PlebbitWsServer.PlebbitWsServer(options1);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit1 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            // Create and start a subplebbit
            const sub = await clientPlebbit1.createSubplebbit({}) as RpcLocalSubplebbit;
            const subAddress = sub.address;
            await sub.start();

            // Destroy without stopping
            await clientPlebbit1.destroy();
            await rpcServer1.destroy();

            // Create second RPC server with auto-start DISABLED
            const options2: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: false
            };

            const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options2);

            // Wait a bit to ensure auto-start would have happened if enabled
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Verify it was NOT auto-started
            const privateAccess = rpcServer2 as unknown as PlebbitWsServerPrivateAccess;
            expect(subAddress in privateAccess._startedSubplebbits).to.be.false;

            // Clean up
            const clientPlebbit2 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
            const sub2 = await clientPlebbit2.createSubplebbit({ address: subAddress }) as RpcLocalSubplebbit;
            await sub2.delete();
            await clientPlebbit2.destroy();
            await rpcServer2.destroy();
        });
    });

    describe("Scenario 3: Was stopped explicitly by user + startStartedSubplebbitsOnStartup=true", () => {
        it("should NOT auto-start the subplebbit that was explicitly stopped", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19152;

            const options1: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer1 = await PlebbitWsServer.PlebbitWsServer(options1);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit1 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            // Create, start, then EXPLICITLY STOP a subplebbit
            const sub = await clientPlebbit1.createSubplebbit({}) as RpcLocalSubplebbit;
            const subAddress = sub.address;
            await sub.start();
            await sub.stop(); // Explicitly stopped!

            await clientPlebbit1.destroy();
            await rpcServer1.destroy();

            // Create second RPC server with auto-start enabled
            const options2: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options2);

            // Wait a bit
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Verify it was NOT auto-started (because it was explicitly stopped)
            const privateAccess = rpcServer2 as unknown as PlebbitWsServerPrivateAccess;
            expect(subAddress in privateAccess._startedSubplebbits).to.be.false;

            // Clean up
            const clientPlebbit2 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
            const sub2 = await clientPlebbit2.createSubplebbit({ address: subAddress }) as RpcLocalSubplebbit;
            await sub2.delete();
            await clientPlebbit2.destroy();
            await rpcServer2.destroy();
        });
    });

    describe("Scenario 4: Was stopped explicitly by user + startStartedSubplebbitsOnStartup=false", () => {
        it("should NOT auto-start the subplebbit", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19153;

            const options1: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: false
            };

            const rpcServer1 = await PlebbitWsServer.PlebbitWsServer(options1);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit1 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            // Create, start, then explicitly stop
            const sub = await clientPlebbit1.createSubplebbit({}) as RpcLocalSubplebbit;
            const subAddress = sub.address;
            await sub.start();
            await sub.stop();

            await clientPlebbit1.destroy();
            await rpcServer1.destroy();

            // Create second RPC server with auto-start disabled
            const options2: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: false
            };

            const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options2);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const privateAccess = rpcServer2 as unknown as PlebbitWsServerPrivateAccess;
            expect(subAddress in privateAccess._startedSubplebbits).to.be.false;

            // Clean up
            const clientPlebbit2 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
            const sub2 = await clientPlebbit2.createSubplebbit({ address: subAddress }) as RpcLocalSubplebbit;
            await sub2.delete();
            await clientPlebbit2.destroy();
            await rpcServer2.destroy();
        });
    });

    describe("Scenario 5: Never started in this RPC session + startStartedSubplebbitsOnStartup=true", () => {
        it("should NOT auto-start a subplebbit that was never started", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19154;

            const options1: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer1 = await PlebbitWsServer.PlebbitWsServer(options1);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit1 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            // Create a subplebbit but NEVER START IT
            const sub = await clientPlebbit1.createSubplebbit({}) as RpcLocalSubplebbit;
            const subAddress = sub.address;
            // Not calling sub.start()!

            await clientPlebbit1.destroy();
            await rpcServer1.destroy();

            // Create second RPC server
            const options2: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options2);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const privateAccess = rpcServer2 as unknown as PlebbitWsServerPrivateAccess;
            expect(subAddress in privateAccess._startedSubplebbits).to.be.false;

            // Clean up
            const clientPlebbit2 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
            const sub2 = await clientPlebbit2.createSubplebbit({ address: subAddress }) as RpcLocalSubplebbit;
            await sub2.delete();
            await clientPlebbit2.destroy();
            await rpcServer2.destroy();
        });
    });

    describe("Scenario 6: Never started in this RPC session + startStartedSubplebbitsOnStartup=false", () => {
        it("should NOT auto-start a subplebbit that was never started", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19155;

            const options1: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: false
            };

            const rpcServer1 = await PlebbitWsServer.PlebbitWsServer(options1);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit1 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            // Create a subplebbit but NEVER START IT
            const sub = await clientPlebbit1.createSubplebbit({}) as RpcLocalSubplebbit;
            const subAddress = sub.address;

            await clientPlebbit1.destroy();
            await rpcServer1.destroy();

            // Create second RPC server
            const options2: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: false
            };

            const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options2);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const privateAccess = rpcServer2 as unknown as PlebbitWsServerPrivateAccess;
            expect(subAddress in privateAccess._startedSubplebbits).to.be.false;

            // Clean up
            const clientPlebbit2 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
            const sub2 = await clientPlebbit2.createSubplebbit({ address: subAddress }) as RpcLocalSubplebbit;
            await sub2.delete();
            await clientPlebbit2.destroy();
            await rpcServer2.destroy();
        });
    });

    describe("Edge cases", () => {
        it("should handle deleted subplebbit gracefully (clean up stale state)", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19156;

            const options1: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer1 = await PlebbitWsServer.PlebbitWsServer(options1);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit1 = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            // Create and start a subplebbit
            const sub = await clientPlebbit1.createSubplebbit({}) as RpcLocalSubplebbit;
            const subAddress = sub.address;
            await sub.start();

            // Now delete it
            await sub.stop();
            await sub.delete();

            await clientPlebbit1.destroy();
            await rpcServer1.destroy();

            // Manually add the deleted sub address back to the state file to simulate stale state
            const stateFilePath = path.join(dataPath, "subplebbits", "rpc-state.json");
            const stateContent = await fs.readFile(stateFilePath, "utf-8");
            const state = JSON.parse(stateContent);
            state.subplebbitStates[subAddress] = { wasStarted: true, wasExplicitlyStopped: false };
            await fs.writeFile(stateFilePath, JSON.stringify(state, null, 2));

            // Create second RPC server
            const options2: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options2);

            // Wait for auto-start attempt
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Should NOT have started the deleted sub
            const privateAccess = rpcServer2 as unknown as PlebbitWsServerPrivateAccess;
            expect(subAddress in privateAccess._startedSubplebbits).to.be.false;

            // Verify the stale entry was removed from state
            const updatedStateContent = await fs.readFile(stateFilePath, "utf-8");
            const updatedState = JSON.parse(updatedStateContent);
            expect(subAddress in updatedState.subplebbitStates).to.be.false;

            await rpcServer2.destroy();
        });

        it("should handle corrupted state file gracefully", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19157;

            // Create the subplebbits directory and write a corrupted state file
            const subplebbitDir = path.join(dataPath, "subplebbits");
            await fs.mkdir(subplebbitDir, { recursive: true });
            await fs.writeFile(path.join(subplebbitDir, "rpc-state.json"), "{ invalid json");

            const options: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            // Should not throw, should handle gracefully
            const rpcServer = await PlebbitWsServer.PlebbitWsServer(options);

            // Server should be functional
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            const sub = await clientPlebbit.createSubplebbit({}) as RpcLocalSubplebbit;
            expect(sub.address).to.exist;

            await sub.delete();
            await clientPlebbit.destroy();
            await rpcServer.destroy();
        });

        it("should handle first run with no state file", async () => {
            const dataPath = tempy.directory();
            const rpcServerPort = 19158;

            const options: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            // Should not throw on first run
            const rpcServer = await PlebbitWsServer.PlebbitWsServer(options);

            // Server should be functional
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            const sub = await clientPlebbit.createSubplebbit({}) as RpcLocalSubplebbit;
            expect(sub.address).to.exist;

            await sub.delete();
            await clientPlebbit.destroy();
            await rpcServer.destroy();
        });

        it("should update state file when subplebbit address changes via edit", async () => {
            // Note: This test would need domain resolution support to fully work
            // For now, we just verify the state tracking mechanism
            const dataPath = tempy.directory();
            const rpcServerPort = 19159;

            const options: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: basePlebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: basePlebbit.httpRoutersOptions,
                    dataPath
                },
                startStartedSubplebbitsOnStartup: true
            };

            const rpcServer = await PlebbitWsServer.PlebbitWsServer(options);
            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

            const sub = await clientPlebbit.createSubplebbit({}) as RpcLocalSubplebbit;
            const oldAddress = sub.address;
            await sub.start();

            // Verify state file has the old address
            const stateFilePath = path.join(dataPath, "subplebbits", "rpc-state.json");
            const stateContent = await fs.readFile(stateFilePath, "utf-8");
            const state = JSON.parse(stateContent);
            expect(state.subplebbitStates[oldAddress]).to.exist;
            expect(state.subplebbitStates[oldAddress].wasStarted).to.be.true;

            await sub.stop();
            await sub.delete();
            await clientPlebbit.destroy();
            await rpcServer.destroy();
        });
    });
});
