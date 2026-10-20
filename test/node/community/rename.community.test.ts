import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
    createMockNameResolver,
    publishRandomPost,
    publishRandomReply,
    mockPKCV2,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue,
    waitTillPostInCommunityPages,
    waitTillReplyInParentPages
} from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import { v4 as uuidV4 } from "uuid";

import type { PKC as PKCType } from "../../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";
import type { RpcLocalCommunity } from "../../../dist/node/community/rpc-local-community.js";
import type { Comment } from "../../../dist/node/publications/comment/comment.js";
import type { CommentIpfsWithCidDefined } from "../../../dist/node/publications/comment/types.js";

// Renaming a named community (domain N -> domain M) that already has comments signed with N (issue #430).
// edit({ name }) changes community.name but leaves community.address on N, and the page generator filters rows by
// community.address, so the comments signed N stay in the pages. verifyPageComment requires a named community's
// comments to carry its name (M), so the community's own pre-publish check rejects every record after the rename
// (ERR_LOCAL_COMMUNITY_PRODUCED_INVALID_SIGNATURE, "community.posts signature is invalid") and the sync loop sets
// startedState to "failed" each cycle. edit({ address }) moves the address too and is covered as the control.
for (const editKey of ["name", "address"] as const) {
    // Skipped under RPC because it waits on the LocalCommunity's own startedState and update cycle
    describeSkipIfRpc(`Renaming a community that has comments, edit({ ${editKey} })`, async () => {
        let pkc: PKCType;
        let community: LocalCommunity | RpcLocalCommunity;
        let newName: string;

        beforeAll(async () => {
            const records = new Map<string, string | undefined>();
            pkc = await mockPKCV2({
                stubStorage: false,
                mockResolve: false,
                pkcOptions: { nameResolvers: [createMockNameResolver({ includeDefaultRecords: true, records })] }
            });
            const signer = await pkc.createSigner();
            const oldName = `rename-old-${uuidV4()}.bso`;
            newName = `rename-new-${uuidV4()}.bso`;
            records.set(oldName, signer.address);
            records.set(newName, signer.address);

            community = await createSubWithNoChallenge({ signer }, pkc);
            await community.edit({ address: oldName });
            await community.start();
            await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });

            const post = await publishRandomPost({ communityAddress: community.address, pkc });
            await waitTillPostInCommunityPages(post as Comment & { cid: string }, pkc);
            const reply = await publishRandomReply({ parentComment: post as unknown as CommentIpfsWithCidDefined, pkc });
            await waitTillReplyInParentPages(reply as Parameters<typeof waitTillReplyInParentPages>[0], pkc);
        });

        afterAll(async () => {
            await community.delete();
            await pkc.destroy();
        });

        it(`publishes a record with the new name instead of failing its own signature check`, async () => {
            const updatedAtBeforeEdit = community.updatedAt!;
            let failed = false;
            const onStartedState = (state: string) => {
                if (state === "failed") failed = true;
            };
            community.on("startedstatechange", onStartedState);
            await community.edit({ [editKey]: newName });
            await resolveWhenConditionIsTrue({
                toUpdate: community,
                predicate: async () => failed || community.updatedAt! > updatedAtBeforeEdit,
                eventName: "startedstatechange"
            });
            community.removeListener("startedstatechange", onStartedState);

            expect(failed).to.be.false;
            expect(community.updatedAt).to.be.greaterThan(updatedAtBeforeEdit);
            expect(community.name).to.equal(newName);
        });
    });
}
