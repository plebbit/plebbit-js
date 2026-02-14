import { beforeAll, afterAll, describe, it } from "vitest";
import PlebbitWsServer from "../../../../dist/node/rpc/src/index.js";
import { describeSkipIfRpc, mockPlebbit } from "../../../../dist/node/test/test-util.js";
import tempy from "tempy";

import os from "os";
import Plebbit from "../../../../dist/node/index.js";
import type { Plebbit as PlebbitType } from "../../../../dist/node/plebbit/plebbit.js";
import type { RpcLocalSubplebbit } from "../../../../dist/node/subplebbit/rpc-local-subplebbit.js";
import type { CreatePlebbitWsServerOptions } from "../../../../dist/node/rpc/src/types.js";

type PlebbitWsServerType = Awaited<ReturnType<typeof PlebbitWsServer.PlebbitWsServer>>;

// Standalone interface for accessing private members via unknown casting
// Using a separate interface avoids TypeScript's intersection-with-private-members issue
interface PlebbitWsServerPrivateAccess {
    _getIpFromConnectionRequest: () => string;
}

const getLanIpV4Address = (): string | undefined => {
    const allInterfaces = os.networkInterfaces();
    for (const k in allInterfaces) {
        const specificInterfaceInfos = allInterfaces[k];
        if (!specificInterfaceInfos) continue;

        const lanAddress = specificInterfaceInfos.filter((info) => info.family === "IPv4" && !info.internal)[0]?.address;
        if (lanAddress) return lanAddress;
    }
    return undefined;
};

describeSkipIfRpc(`Setting up rpc server`, async () => {
    let plebbit: PlebbitType;

    const lanAddress = getLanIpV4Address(); // LAN address (non-internal)
    beforeAll(async () => {
        plebbit = await mockPlebbit();
        expect(plebbit.dataPath).to.be.a("string");
        expect(lanAddress).to.be.a("string");
    });

    afterAll(async () => {
        await plebbit.destroy();
    });

    it(`Rpc server emits an error is rpc port is already taken`, async () => {
        const rpcServerPort = 19138;
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        const rpcServer2 = await PlebbitWsServer.PlebbitWsServer(options);
        const e = await new Promise<NodeJS.ErrnoException>((resolve) => rpcServer2.once("error", resolve));

        expect(e.code).to.equal("EADDRINUSE");

        await rpcServer.destroy();
        await rpcServer2.destroy();
    });

    it(`Can connect to rpc server locally with ws://localhost:port`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        const rpcUrl = `ws://localhost:${rpcServerPort}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

        const sub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
        expect(sub.address).to.exist; // should be able to create a sub successfully over RPC
        expect(clientPlebbit.subplebbits).to.include(sub.address);

        await clientPlebbit.destroy();
        await rpcServer.destroy();
    });

    it(`Can connect to rpc server locally with ws://127.0.0.1:port`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        const rpcUrl = `ws://127.0.0.1:${rpcServerPort}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

        const sub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
        expect(sub.address).to.exist; // should be able to create a sub successfully over RPC
        expect(clientPlebbit.subplebbits).to.include(sub.address);

        await clientPlebbit.destroy();
        await rpcServer.destroy();
    });

    it(`Can connect to rpc server locally with ws://localhost:port/authkey`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        const rpcUrl = `ws://localhost:${rpcServerPort}/${authKey}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

        const sub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
        expect(sub.address).to.exist; // should be able to create a sub successfully over RPC
        expect(clientPlebbit.subplebbits).to.include(sub.address);

        await clientPlebbit.destroy();
        await rpcServer.destroy();
    });

    it(`Can connect to rpc server locally with ws://127.0.0.1:port/authkey`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        const rpcUrl = `ws://127.0.0.1:${rpcServerPort}/${authKey}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

        const sub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
        expect(sub.address).to.exist; // should be able to create a sub successfully over RPC
        expect(clientPlebbit.subplebbits).to.include(sub.address);

        await clientPlebbit.destroy();
        await rpcServer.destroy();
    });

    it(`Fails to connect to rpc server with remote device with no auth key`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        (rpcServer as unknown as PlebbitWsServerPrivateAccess)._getIpFromConnectionRequest = () => "::ffff:192.168.1.80"; // random ip address, trying to emulate a remote device

        const rpcUrl = `ws://${lanAddress}:${rpcServerPort}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], httpRoutersOptions: [] });
        clientPlebbit.on("error", () => {});

        try {
            await clientPlebbit.createSubplebbit({});
            expect.fail("Should throw an error");
        } catch (e) {
            expect((e as { code: string }).code).to.equal("ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC");
        } finally {
            await clientPlebbit.destroy();
            await rpcServer.destroy();
        }
    });

    it(`Succeeds in connecting to rpc server from remote device with auth key`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        (rpcServer as unknown as PlebbitWsServerPrivateAccess)._getIpFromConnectionRequest = () => "::ffff:192.168.1.80"; // random ip address, trying to emulate a remote device

        const rpcUrl = `ws://${lanAddress}:${rpcServerPort}/${authKey}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

        const sub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
        expect(sub.address).to.exist; // should be able to create a sub successfully over RPC
        expect(clientPlebbit.subplebbits).to.include(sub.address);

        await clientPlebbit.destroy();
        await rpcServer.destroy();
    });

    it(`Can connect to rpc server if from local device and used remote address (no auth key)`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        const rpcUrl = `ws://${lanAddress}:${rpcServerPort}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

        const sub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
        expect(sub.address).to.exist; // should be able to create a sub successfully over RPC
        expect(clientPlebbit.subplebbits).to.include(sub.address);

        await clientPlebbit.destroy();
        await rpcServer.destroy();
    });

    it(`Can connect to rpc server if from local device but used remote address (with auth key)`, async () => {
        const rpcServerPort = 9139;
        const authKey = "dwadwa";
        const options: CreatePlebbitWsServerOptions = {
            port: rpcServerPort,
            authKey,
            plebbitOptions: {
                kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                httpRoutersOptions: plebbit.httpRoutersOptions,
                dataPath: plebbit.dataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        const rpcUrl = `ws://${lanAddress}:${rpcServerPort}/${authKey}`;
        const clientPlebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });

        const sub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
        expect(sub.address).to.exist; // should be able to create a sub successfully over RPC
        expect(clientPlebbit.subplebbits).to.include(sub.address);

        await clientPlebbit.destroy();
        await rpcServer.destroy();
    });

    describe(`RPC server subplebbit edit error handling`, () => {
        it(`Returns domain mismatch errors to RPC clients without crashing the server`, async () => {
            const rpcServerPort = 19145;
            const options: CreatePlebbitWsServerOptions = {
                port: rpcServerPort,
                plebbitOptions: {
                    kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions as CreatePlebbitWsServerOptions["plebbitOptions"]["kuboRpcClientsOptions"],
                    httpRoutersOptions: plebbit.httpRoutersOptions,
                    dataPath: tempy.directory()
                }
            };
            const rpcServer = await PlebbitWsServer.PlebbitWsServer(options);

            const rpcUrl = `ws://localhost:${rpcServerPort}`;
            let clientPlebbit: PlebbitType | undefined;
            clientPlebbit = await Plebbit({
                plebbitRpcClientsOptions: [rpcUrl],
                dataPath: undefined,
                httpRoutersOptions: []
            });

            const rpcSub = (await clientPlebbit.createSubplebbit({})) as RpcLocalSubplebbit;
            const mismatchedDomain = "my-sub.eth";

            await rpcSub.edit({ address: mismatchedDomain });
            await new Promise((resolve) => setTimeout(resolve, 7000));

            // should not crash hopefully

            if (rpcSub) {
                try {
                    await rpcSub.delete();
                } catch {}
            }
            if (clientPlebbit) {
                try {
                    await clientPlebbit.destroy();
                } catch {}
            }
            try {
                await rpcServer.destroy();
            } catch {}
        });
    });
});
