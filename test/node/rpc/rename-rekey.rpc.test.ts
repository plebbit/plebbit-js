// The RPC server keys its started communities (_startedCommunities) and its auto-start rows (community_states) by
// address. A rename moves the address, so the server must move both, or the started community is filed under an
// address that no longer exists: lookups by the new name miss it, and the next server boot drops it from auto-start
// ("community no longer exists"). Every way a started community's address can change is covered here: editCommunity
// with name or address, an owner's CommunityEdit over pubsub, a second LocalCommunity instance in the server process,
// a rename while the start is still pending, and a rename of an explicitly stopped community. So are the things that
// hold on to the old address afterwards: a client re-subscribing after a reconnect, and the settings-change restart.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { v4 as uuidV4 } from "uuid";
import PKC from "../../../dist/node/index.js";
import { createInProcessRpcServer, pollUntil, uniqueTmpDataPath, type PKCWsServerType } from "../../helpers/rpc-server-harness.js";
import {
    createMockNameResolver,
    mockPKCV2,
    mockRpcServerPKC,
    mockRpcServerForTests,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import type { PKC as PKCType } from "../../../dist/node/pkc/pkc.js";
import type { RpcLocalCommunity } from "../../../dist/node/community/rpc-local-community.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";
import type { CreateNewLocalCommunityUserOptions } from "../../../dist/node/community/types.js";

const RPC_AUTH_KEY = "rename-rekey";

type CommunityStateRow = { address: string; wasStarted: number; wasExplicitlyStopped: number };
type RpcServerInternals = {
    pkc: PKCType;
    _startedCommunities: Record<string, "pending" | LocalCommunity>;
    _getRpcStateDb: () => { prepare: (sql: string) => { all: () => CommunityStateRow[] } } | undefined;
    rpcWebsockets: { wss: { clients: Set<{ terminate: () => void }> } };
    _pendingDisconnectionCleanups: Set<Promise<void>>;
};
type RpcClientInternals = {
    state: string;
    on: (event: "statechange", listener: (state: string) => void) => void;
    removeListener: (event: "statechange", listener: (state: string) => void) => void;
};

const internals = (rpcServer: PKCWsServerType) => rpcServer as unknown as RpcServerInternals;
const startedAddresses = (rpcServer: PKCWsServerType) => Object.keys(internals(rpcServer)._startedCommunities);
const communityStateRows = (rpcServer: PKCWsServerType) =>
    internals(rpcServer)._getRpcStateDb()?.prepare("SELECT address, wasStarted, wasExplicitlyStopped FROM community_states").all() ?? [];
const communityStateAddresses = (rpcServer: PKCWsServerType) => communityStateRows(rpcServer).map((row) => row.address);
// The server's started LocalCommunity with this identity key, wherever it is filed
const serverStartedCommunity = (rpcServer: PKCWsServerType, publicKey: string) =>
    Object.values(internals(rpcServer)._startedCommunities).find(
        (entry): entry is LocalCommunity => typeof entry !== "string" && entry.signer?.address === publicKey
    );

describe("RPC server re-keys a community after a rename", () => {
    const records = new Map<string, string | undefined>();
    const nameResolvers = () => [createMockNameResolver({ includeDefaultRecords: true, records })];
    let dataPath: string;
    let serverPKC: PKCType;
    let rpcServer: PKCWsServerType;
    let rpcUrl: string;
    let clientPKC: PKCType;
    let ownerPKC: PKCType;

    const startServer = async () => {
        serverPKC = await mockRpcServerPKC({ dataPath, nameResolvers: nameResolvers() });
        ({ rpcServer, rpcUrl } = await createInProcessRpcServer({ serverPKC, authKey: RPC_AUTH_KEY }));
        mockRpcServerForTests(rpcServer);
        clientPKC = await PKC({ pkcRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
        clientPKC.on("error", () => {});
    };
    const stopServer = async () => {
        if (clientPKC && !clientPKC.destroyed) await clientPKC.destroy();
        await rpcServer?.destroy(); // also destroys the injected serverPKC
        if (serverPKC && !serverPKC.destroyed) await serverPKC.destroy();
    };
    const restartServer = async () => {
        await stopServer();
        await startServer();
    };

    type RenameContext = { community: RpcLocalCommunity; publicKey: string; oldName: string; newName: string };

    // A named community created and started through the RPC client, with both names resolving to its key
    const startNamedCommunity = async (): Promise<RenameContext> => {
        const community = (await clientPKC.createCommunity({})) as RpcLocalCommunity;
        const publicKey = community.signer!.address;
        const oldName = `rekey-old-${uuidV4()}.bso`;
        const newName = `rekey-new-${uuidV4()}.bso`;
        records.set(oldName, publicKey);
        records.set(newName, publicKey);
        await community.edit({ address: oldName, settings: { challenges: [] } });
        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });
        expect(startedAddresses(rpcServer)).to.include(oldName);
        return { community, publicKey, oldName, newName };
    };

    // Publishes an owner's CommunityEdit over pubsub and waits until the server's community has moved to `expectedAddress`
    const renameOverPubsub = async (ctx: RenameContext, communityEdit: Record<string, string>, expectedAddress: string): Promise<void> => {
        const ownerSigner = await ownerPKC.createSigner();
        const serverCommunity = serverStartedCommunity(rpcServer, ctx.publicKey)!;
        const updatedAtBeforeRoles = serverCommunity.updatedAt!;
        await ctx.community.edit({ roles: { [ownerSigner.address]: { role: "owner" } } });
        await resolveWhenConditionIsTrue({
            toUpdate: serverCommunity,
            predicate: async () => serverCommunity.updatedAt! > updatedAtBeforeRoles
        });
        const edit = await ownerPKC.createCommunityEdit({ communityEdit, communityAddress: ctx.oldName, signer: ownerSigner });
        await publishWithExpectedResult({ publication: edit, expectedChallengeSuccess: true });
        await pollUntil(() => serverCommunity.address === expectedAddress, { timeoutMs: 30_000 });
        expect(serverCommunity.address).to.equal(expectedAddress);
    };

    type RenameMethod = {
        title: string;
        rename: (ctx: RenameContext) => Promise<void>;
        expectedAddress: (ctx: RenameContext) => string;
    };

    const renameMethods: RenameMethod[] = [
        {
            title: "editCommunity edit({ address: M })",
            rename: async (ctx) => void (await ctx.community.edit({ address: ctx.newName })),
            expectedAddress: (ctx) => ctx.newName
        },
        {
            title: "editCommunity edit({ name: M })",
            rename: async (ctx) => void (await ctx.community.edit({ name: ctx.newName })),
            expectedAddress: (ctx) => ctx.newName
        },
        {
            title: "editCommunity edit({ name: M, address: M })",
            rename: async (ctx) => void (await ctx.community.edit({ name: ctx.newName, address: ctx.newName })),
            expectedAddress: (ctx) => ctx.newName
        },
        {
            title: "editCommunity edit({ name: undefined })",
            rename: async (ctx) => void (await ctx.community.edit({ name: undefined })),
            expectedAddress: (ctx) => ctx.publicKey
        },
        {
            title: "editCommunity edit({ address: <public key> })",
            rename: async (ctx) => void (await ctx.community.edit({ address: ctx.publicKey })),
            expectedAddress: (ctx) => ctx.publicKey
        },
        {
            title: "an owner's CommunityEdit { name: M } over pubsub",
            rename: (ctx) => renameOverPubsub(ctx, { name: ctx.newName }, ctx.newName),
            expectedAddress: (ctx) => ctx.newName
        },
        {
            title: "an owner's CommunityEdit { address: M } over pubsub",
            rename: (ctx) => renameOverPubsub(ctx, { address: ctx.newName }, ctx.newName),
            expectedAddress: (ctx) => ctx.newName
        },
        {
            title: "an owner's CommunityEdit { address: <public key> } over pubsub",
            rename: (ctx) => renameOverPubsub(ctx, { address: ctx.publicKey }, ctx.publicKey),
            expectedAddress: (ctx) => ctx.publicKey
        }
    ];

    // The started community, its auto-start row and getStartedCommunity are all filed under `expectedAddress`, and
    // nothing is left under the old name
    const expectFiledUnder = (ctx: RenameContext, expectedAddress: string) => {
        expect(startedAddresses(rpcServer)).to.include(expectedAddress);
        expect(startedAddresses(rpcServer)).to.not.include(ctx.oldName);
        expect(communityStateAddresses(rpcServer)).to.include(expectedAddress);
        expect(communityStateAddresses(rpcServer)).to.not.include(ctx.oldName);
        const filed = internals(rpcServer)._startedCommunities[expectedAddress];
        expect(typeof filed === "string" ? filed : filed?.address).to.equal(expectedAddress);
    };

    beforeAll(async () => {
        dataPath = uniqueTmpDataPath("rename-rekey");
        await startServer();
        ownerPKC = await mockPKCV2({
            stubStorage: false,
            remotePKC: true,
            mockResolve: false,
            pkcOptions: { nameResolvers: nameResolvers() }
        });
    });

    afterAll(async () => {
        await ownerPKC?.destroy();
        await stopServer();
    });

    for (const method of renameMethods) {
        it(`${method.title} files the started community and its auto-start row under the new address`, async () => {
            const ctx = await startNamedCommunity();
            try {
                await method.rename(ctx);
                expectFiledUnder(ctx, method.expectedAddress(ctx));
            } finally {
                await ctx.community.stop().catch((): undefined => undefined);
            }
        });
    }

    for (const method of renameMethods) {
        it(`${method.title}, then a server restart: auto-started under the new address`, async () => {
            const ctx = await startNamedCommunity();
            await method.rename(ctx);
            const expectedAddress = method.expectedAddress(ctx);
            // a server shutdown, not an explicit stop: the community must come back on the next boot
            await restartServer();
            await pollUntil(() => serverStartedCommunity(rpcServer, ctx.publicKey) !== undefined, { timeoutMs: 30_000 });
            try {
                expect(startedAddresses(rpcServer)).to.include(expectedAddress);
            } finally {
                const restarted = (await clientPKC.createCommunity({ address: expectedAddress })) as RpcLocalCommunity;
                if (startedAddresses(rpcServer).includes(expectedAddress)) await restarted.stop().catch((): undefined => undefined);
            }
        });
    }

    it(`a second LocalCommunity instance in the server process renaming the started community re-keys it`, async () => {
        const ctx = await startNamedCommunity();
        try {
            const serverCommunity = serverStartedCommunity(rpcServer, ctx.publicKey)!;
            const secondInstance = (await internals(rpcServer).pkc.createCommunity({ address: ctx.oldName })) as LocalCommunity;
            await secondInstance.edit({ name: ctx.newName });
            await pollUntil(() => serverCommunity.address === ctx.newName, { timeoutMs: 30_000 });
            expect(serverCommunity.address).to.equal(ctx.newName);
            expectFiledUnder(ctx, ctx.newName);
        } finally {
            await ctx.community.stop().catch((): undefined => undefined);
        }
    });

    it(`a rename sent while the server is still starting the community applies to the started community`, async () => {
        const community = (await clientPKC.createCommunity({})) as RpcLocalCommunity;
        const publicKey = community.signer!.address;
        const oldName = `rekey-pending-old-${uuidV4()}.bso`;
        const newName = `rekey-pending-new-${uuidV4()}.bso`;
        records.set(oldName, publicKey);
        records.set(newName, publicKey);
        await community.edit({ address: oldName, settings: { challenges: [] } });

        // Hold the server's start of oldName inside createCommunity, so its entry stays "pending"
        const serverPkc = internals(rpcServer).pkc;
        const originalCreateCommunity = serverPkc.createCommunity.bind(serverPkc);
        let releaseStart!: () => void;
        const startGate = new Promise<void>((resolve) => (releaseStart = resolve));
        let gated = false;
        serverPkc.createCommunity = (async (options?: CreateNewLocalCommunityUserOptions) => {
            if (!gated && (options as { address?: string } | undefined)?.address === oldName) {
                gated = true;
                await startGate;
            }
            return originalCreateCommunity(options);
        }) as typeof serverPkc.createCommunity;
        try {
            const start = community.start();
            await pollUntil(() => internals(rpcServer)._startedCommunities[oldName] === "pending", { timeoutMs: 15_000 });
            const rename = community.edit({ name: newName });
            await new Promise((resolve) => setTimeout(resolve, 500));
            releaseStart();
            const [startResult, renameResult] = await Promise.allSettled([start, rename]);
            expect(startResult.status).to.equal("fulfilled");
            expect(renameResult.status).to.equal("fulfilled");
            const serverCommunity = serverStartedCommunity(rpcServer, publicKey);
            expect(serverCommunity?.address).to.equal(newName);
            expect(serverCommunity?.state).to.equal("started");
            expectFiledUnder({ community, publicKey, oldName, newName }, newName);
        } finally {
            serverPkc.createCommunity = originalCreateCommunity;
            releaseStart();
            await community.stop().catch((): undefined => undefined);
        }
    });

    it(`renaming an explicitly stopped community moves its auto-start row, keeping it stopped`, async () => {
        const ctx = await startNamedCommunity();
        await ctx.community.stop();
        const stoppedRow = communityStateRows(rpcServer).find((row) => row.address === ctx.oldName);
        expect(stoppedRow).to.deep.include({ wasStarted: 1, wasExplicitlyStopped: 1 });

        await ctx.community.edit({ name: ctx.newName });
        expect(ctx.community.address).to.equal(ctx.newName);
        expect(communityStateAddresses(rpcServer)).to.not.include(ctx.oldName);
        expect(communityStateRows(rpcServer).find((row) => row.address === ctx.newName)).to.deep.include({
            wasStarted: 1,
            wasExplicitlyStopped: 1
        });
    });

    for (const editKey of ["address", "name"] as const) {
        it(`a client that reconnects after edit({ ${editKey}: M }) keeps receiving the community's updates`, async () => {
            const ctx = await startNamedCommunity();
            const clientErrors: Error[] = [];
            ctx.community.on("error", (e) => clientErrors.push(e));
            try {
                await ctx.community.edit({ [editKey]: ctx.newName });
                expect(ctx.community.address).to.equal(ctx.newName);

                // cut the websocket from the server side and let the client reconnect and re-subscribe
                const rpcClient = clientPKC.clients.pkcRpcClients[rpcUrl] as unknown as RpcClientInternals;
                const states: string[] = [];
                const onStateChange = (state: string) => states.push(state);
                rpcClient.on("statechange", onStateChange);
                for (const socket of internals(rpcServer).rpcWebsockets.wss.clients) socket.terminate();
                await pollUntil(() => states.includes("stopped"), { timeoutMs: 15_000 });
                await Promise.all([...internals(rpcServer)._pendingDisconnectionCleanups]);
                await pollUntil(() => rpcClient.state === "connected", { timeoutMs: 15_000 });
                rpcClient.removeListener("statechange", onStateChange);

                const title = `after reconnect ${uuidV4()}`;
                await serverStartedCommunity(rpcServer, ctx.publicKey)!.edit({ title });
                await pollUntil(() => ctx.community.title === title || clientErrors.length > 0, { timeoutMs: 15_000 });
                expect(clientErrors.map((e) => (e as { code?: string }).code ?? e.message)).to.deep.equal([]);
                expect(ctx.community.title).to.equal(title);
                expectFiledUnder(ctx, ctx.newName);
            } finally {
                await ctx.community.stop().catch((): undefined => undefined);
            }
        });
    }

    // Last: setSettings replaces the server's pkc instance for the rest of the suite
    it(`a settings change after edit({ name: M }) restarts the renamed community on the new pkc`, async () => {
        const ctx = await startNamedCommunity();
        try {
            await ctx.community.edit({ name: ctx.newName });
            const rpcClient = clientPKC.clients.pkcRpcClients[rpcUrl];
            const pkcBefore = internals(rpcServer).pkc;
            const currentOptions = rpcClient.settings!.pkcOptions;
            await rpcClient.setSettings({
                pkcOptions: {
                    resolveAuthorNames: currentOptions.resolveAuthorNames,
                    validatePages: currentOptions.validatePages,
                    publishInterval: currentOptions.publishInterval,
                    updateInterval: currentOptions.updateInterval,
                    noData: currentOptions.noData,
                    httpRoutersOptions: currentOptions.httpRoutersOptions,
                    // the new pkc must keep the test Kubo and this suite's dataPath, or restarting the community on it fails
                    // for an unrelated reason
                    kuboRpcClientsOptions: ["http://localhost:15001/api/v0"],
                    dataPath,
                    userAgent: `rename-rekey-${uuidV4()}`
                }
            });
            await pollUntil(
                () => {
                    const serverCommunity = serverStartedCommunity(rpcServer, ctx.publicKey);
                    return serverCommunity?._pkc !== pkcBefore && serverCommunity?.state === "started";
                },
                { timeoutMs: 30_000 }
            );
            const serverCommunity = serverStartedCommunity(rpcServer, ctx.publicKey);
            expect(serverCommunity?._pkc).to.not.equal(pkcBefore);
            expect(serverCommunity?._pkc).to.equal(internals(rpcServer).pkc);
            expect(serverCommunity?.state).to.equal("started");
            expectFiledUnder(ctx, ctx.newName);
        } finally {
            await ctx.community.stop().catch((): undefined => undefined);
        }
    });
});
