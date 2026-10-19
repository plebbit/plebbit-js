import { publishRandomPost, resolveWhenConditionIsTrue, createSubWithNoChallenge, mockPKC } from "../../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../../helpers/conditional-tests.js";
import { it, beforeAll, afterAll, expect } from "vitest";
import type { PKC } from "../../../../dist/node/pkc/pkc.js";
import type { Comment } from "../../../../dist/node/publications/comment/comment.js";
import type { LocalCommunity } from "../../../../dist/node/runtime/node/community/local-community.js";
import type { SignerWithPublicKeyAddress } from "../../../../dist/node/signer/index.js";
import type { DecryptedChallengeVerificationMessageType } from "../../../../dist/node/pubsub-messages/types.js";

// Deterministic repro of issue #420: storeCommentModeration commits the purge to the DB, then
// awaits rmUnneededMfsPaths, and only after that inserts the moderation row, queues the live
// updateCid for unpinning and sets _communityUpdateTrigger. When the MFS removal throws (e.g.
// ERR_TIMED_OUT_RM_MFS_FILE while repo gc holds kubo's lock) the comment is already gone, but the
// moderator gets challengeSuccess: false and none of the post-await side effects happen.
//
// Skipped under RPC: the test stubs the community-side kubo files.rm and reads LocalCommunity
// internals (_dbHandler, _clientsManager, _cidsToUnPin), which is impossible when the community
// lives in a separate RPC server process.
describeSkipIfRpc("Purge whose MFS cleanup fails (issue #420)", () => {
    let pkc: PKC;
    let community: LocalCommunity;
    let moderatorSigner: SignerWithPublicKeyAddress;
    let post: Comment;
    let postMfsPath: string;
    let restoreRm: (() => void) | undefined;

    beforeAll(async () => {
        pkc = await mockPKC();
        community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
        await community.start();
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => typeof community.updatedAt === "number"
        });

        moderatorSigner = await pkc.createSigner();
        await community.edit({ roles: { [moderatorSigner.address]: { role: "moderator" } } });
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => community.roles?.[moderatorSigner.address]?.role === "moderator"
        });

        post = await publishRandomPost({ communityAddress: community.address, pkc });
        if (!post.cid) throw Error("Published post has no cid");

        // The purge only queues an MFS path when the post's CommentUpdate has a postUpdates bucket,
        // so wait for the sync loop to have written it, otherwise rmUnneededMfsPaths is a no-op
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () =>
                community.lastPostCid === post.cid &&
                typeof community._dbHandler.queryStoredCommentUpdate({ cid: post.cid! })?.postUpdatesBucket === "number"
        });
        const bucket = community._dbHandler.queryStoredCommentUpdate({ cid: post.cid! })!.postUpdatesBucket;
        postMfsPath = `/${community.address}/postUpdates/${bucket}/${post.cid}/update`;
    });

    afterAll(async () => {
        restoreRm?.();
        await community.delete();
        await pkc.destroy();
    });

    it("A purge stays successful and records its moderation row when the MFS removal throws", async () => {
        const kuboFiles = community._clientsManager.getDefaultKuboRpcClient()._client.files;
        const originalRm = kuboFiles.rm.bind(kuboFiles);
        restoreRm = () => {
            kuboFiles.rm = originalRm;
        };
        let rmCalls = 0;
        // Any error other than "file does not exist" is rethrown by rmUnneededMfsPaths. This mirrors
        // kubo's MFS lock contention with repo gc
        kuboFiles.rm = (async () => {
            rmCalls++;
            throw Error("Simulated kubo MFS lock contention (issue #420)");
        }) as typeof kuboFiles.rm;

        const purgeMod = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: post.cid,
            commentModeration: { reason: "Purge with a failing MFS cleanup (issue #420)", purged: true },
            signer: moderatorSigner
        });
        const verification = new Promise<DecryptedChallengeVerificationMessageType>((resolve) =>
            purgeMod.once("challengeverification", resolve)
        );
        await purgeMod.publish();
        const { challengeSuccess, reason } = await verification;
        const mfsPathStillQueued = community._mfsPathsToRemove.has(postMfsPath);

        restoreRm();
        restoreRm = undefined;
        await purgeMod.stop();

        expect(rmCalls, "the purge should have tried to remove the post's postUpdates MFS path").to.be.greaterThan(0);
        expect(community._dbHandler.commentExistsInDb(post.cid!), "the post should be purged from the DB").to.be.false;

        // 1. The purge already happened, so it must not be reported as a failure the moderator cannot retry
        expect(challengeSuccess, `purge was committed but reported as failed with reason: ${reason}`).to.be.true;

        // 2. The moderation row must be stored, so there is a record of who purged the comment and when
        const storedMods = community._dbHandler.queryAllCommentModerations({ commentCid: post.cid! });
        expect(storedMods.length, "the purge moderation row should be stored").to.equal(1);
        expect(storedMods[0].commentModeration.purged).to.be.true;

        // 3. The failed MFS path stays queued for the sync loop, which removes it once kubo recovers
        expect(mfsPathStillQueued, "the failed MFS path should stay queued for the sync loop to retry").to.be.true;
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => {
                try {
                    await kuboFiles.stat(postMfsPath);
                    return false;
                } catch (e) {
                    expect((e as Error).message).to.equal("file does not exist");
                    return true;
                }
            }
        });

        // 4. The purge is published: a new record that no longer lists the purged post
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => community.lastPostCid !== post.cid
        });
    });
});
