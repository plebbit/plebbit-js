// The RPC server keys its started communities (_startedCommunities) and its auto-start rows (community_states) by
// address. A rename moves the address, so the server must move both, or the started community is filed under an
// address that no longer exists and the next server boot drops it from auto-start ("community no longer exists").
// editCommunity re-keys only when the raw edit params carry `address`, but since #430 edit({ name }) and
// edit({ name: undefined }) move the address too, and an owner's CommunityEdit over pubsub renames the community
// without going through editCommunity at all.
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

const RPC_AUTH_KEY = "rename-rekey";

type RpcServerInternals = {
    _startedCommunities: Record<string, unknown>;
    _getRpcStateDb: () => { prepare: (sql: string) => { all: () => { address: string }[] } } | undefined;
};

const internals = (rpcServer: PKCWsServerType) => rpcServer as unknown as RpcServerInternals;
const startedAddresses = (rpcServer: PKCWsServerType) => Object.keys(internals(rpcServer)._startedCommunities);
const autoStartAddresses = (rpcServer: PKCWsServerType) =>
    (internals(rpcServer)._getRpcStateDb()?.prepare("SELECT address FROM community_states").all() ?? []).map((row) => row.address);

type RenameCase = {
    title: string;
    // the edit, given the community's new name and its public key
    edit: (args: { newName: string; publicKey: string }) => Record<string, string | undefined>;
    expectedAddress: (args: { newName: string; publicKey: string }) => string;
};

const renameCases: RenameCase[] = [
    { title: "edit({ address: M })", edit: ({ newName }) => ({ address: newName }), expectedAddress: ({ newName }) => newName },
    { title: "edit({ name: M })", edit: ({ newName }) => ({ name: newName }), expectedAddress: ({ newName }) => newName },
    { title: "edit({ name: undefined })", edit: () => ({ name: undefined }), expectedAddress: ({ publicKey }) => publicKey },
    {
        title: "edit({ address: <public key> })",
        edit: ({ publicKey }) => ({ address: publicKey }),
        expectedAddress: ({ publicKey }) => publicKey
    }
];

describe("RPC server re-keys a started community after a rename", () => {
    const records = new Map<string, string | undefined>();
    let dataPath: string;
    let serverPKC: PKCType;
    let rpcServer: PKCWsServerType;
    let rpcUrl: string;
    let clientPKC: PKCType;

    const startServer = async () => {
        serverPKC = await mockRpcServerPKC({ dataPath, nameResolvers: [createMockNameResolver({ includeDefaultRecords: true, records })] });
        ({ rpcServer, rpcUrl } = await createInProcessRpcServer({ serverPKC, authKey: RPC_AUTH_KEY }));
        mockRpcServerForTests(rpcServer);
    };
    const stopServer = async () => {
        if (clientPKC && !clientPKC.destroyed) await clientPKC.destroy();
        await rpcServer?.destroy(); // also destroys the injected serverPKC
        if (serverPKC && !serverPKC.destroyed) await serverPKC.destroy();
    };
    const connectClient = async () => {
        clientPKC = await PKC({ pkcRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
        clientPKC.on("error", () => {});
    };

    // A named community started through the RPC client, with every name the case may rename it to resolving to its key
    const startNamedCommunity = async () => {
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

    beforeAll(async () => {
        dataPath = uniqueTmpDataPath("rename-rekey");
        await startServer();
        await connectClient();
    });

    afterAll(async () => {
        await stopServer();
    });

    for (const renameCase of renameCases) {
        it(`${renameCase.title} moves the started community and its auto-start row to the new address`, async () => {
            const { community, publicKey, oldName, newName } = await startNamedCommunity();
            try {
                await community.edit(renameCase.edit({ newName, publicKey }));
                const expectedAddress = renameCase.expectedAddress({ newName, publicKey });
                expect(community.address).to.equal(expectedAddress);
                expect(startedAddresses(rpcServer)).to.include(expectedAddress);
                expect(startedAddresses(rpcServer)).to.not.include(oldName);
                expect(autoStartAddresses(rpcServer)).to.include(expectedAddress);
                expect(autoStartAddresses(rpcServer)).to.not.include(oldName);
            } finally {
                await community.stop();
            }
        });
    }

    it(`a community renamed with edit({ name: M }) is auto-started under M after the RPC server restarts`, async () => {
        const { community, newName } = await startNamedCommunity();
        await community.edit({ name: newName });
        expect(community.address).to.equal(newName);
        // a server shutdown, not an explicit stop: the community must come back on the next boot
        await stopServer();
        await startServer();
        await connectClient();
        await pollUntil(() => startedAddresses(rpcServer).includes(newName), { timeoutMs: 30_000 });
        try {
            expect(startedAddresses(rpcServer)).to.include(newName);
        } finally {
            const restarted = (await clientPKC.createCommunity({ address: newName })) as RpcLocalCommunity;
            if (startedAddresses(rpcServer).includes(newName)) await restarted.stop().catch((): undefined => undefined);
        }
    });

    it(`an owner's CommunityEdit over pubsub that renames an RPC-started community re-keys it on the server`, async () => {
        const { community, oldName, newName } = await startNamedCommunity();
        const ownerPKC = await mockPKCV2({
            stubStorage: false,
            remotePKC: true,
            mockResolve: false,
            pkcOptions: { nameResolvers: [createMockNameResolver({ includeDefaultRecords: true, records })] }
        });
        try {
            const ownerSigner = await ownerPKC.createSigner();
            const updatedAtBeforeRoles = community.updatedAt!;
            await community.edit({ roles: { [ownerSigner.address]: { role: "owner" } } });
            await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => community.updatedAt! > updatedAtBeforeRoles });
            const communityEdit = await ownerPKC.createCommunityEdit({
                communityEdit: { name: newName },
                communityAddress: oldName,
                signer: ownerSigner
            });
            await publishWithExpectedResult({ publication: communityEdit, expectedChallengeSuccess: true });
            await pollUntil(() => community.address === newName, { timeoutMs: 30_000 });
            expect(community.address).to.equal(newName);
            expect(startedAddresses(rpcServer)).to.include(newName);
            expect(startedAddresses(rpcServer)).to.not.include(oldName);
            expect(autoStartAddresses(rpcServer)).to.include(newName);
        } finally {
            await community.stop().catch((): undefined => undefined);
            await ownerPKC.destroy();
        }
    });
});
