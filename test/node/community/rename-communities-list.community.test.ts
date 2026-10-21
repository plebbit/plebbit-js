import { describe, it, expect } from "vitest";
import {
    createMockNameResolver,
    mockPKCV2,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import { v4 as uuidV4 } from "uuid";

import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";

// pkc.communities is refreshed by a filesystem watcher on dataPath/communities, so right after a rename moves the DB
// file the same process can still see the old list. pkc.createCommunity({ address }) picks a local or a remote instance
// from that list, and the RPC server resolves a client's { name, publicKey } through it, so a start() sent right after a
// rename built a RemoteCommunity for the old address (CI on macOS, whose watcher is slow: "community.
// toJSONInternalRpcBeforeFirstUpdate is not a function"). The watcher is stopped here, after the community is created,
// to make the stale window permanent: a rename must update pkc.communities itself.
// Skipped under RPC because it stops the pkc's filesystem watcher, which lives in the RPC server
describeSkipIfRpc(`pkc.communities right after renaming a local community`, async () => {
    for (const started of [false, true]) {
        for (const editKey of ["address", "name"] as const) {
            it(`a ${started ? "started" : "stopped"} community renamed with edit({ ${editKey} }) is listed under its new address at once`, async () => {
                const records = new Map<string, string | undefined>();
                const pkc = await mockPKCV2({
                    stubStorage: false,
                    mockResolve: false,
                    pkcOptions: { nameResolvers: [createMockNameResolver({ includeDefaultRecords: true, records })] }
                });
                const community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
                const keyAddress = community.address;
                const newName = `list-${started ? "started" : "stopped"}-${uuidV4()}.bso`;
                records.set(newName, community.signer.address);
                try {
                    if (started) {
                        await community.start();
                        await resolveWhenConditionIsTrue({
                            toUpdate: community,
                            predicate: async () => typeof community.updatedAt === "number"
                        });
                    }
                    expect(pkc.communities).to.include(keyAddress);
                    (pkc as unknown as { _communityFsWatchAbort?: AbortController })._communityFsWatchAbort?.abort();

                    await community.edit({ [editKey]: newName });
                    expect(pkc.communities).to.include(newName);
                    expect(pkc.communities).to.not.include(keyAddress);
                    const recreated = await pkc.createCommunity({ address: newName });
                    expect(recreated.constructor.name).to.equal("LocalCommunity");
                } finally {
                    await community.delete().catch((): undefined => undefined);
                    await pkc.destroy();
                }
            });
        }
    }
});
