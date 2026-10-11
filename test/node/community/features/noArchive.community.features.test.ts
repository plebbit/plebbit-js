import {
    mockPKC,
    createSubWithNoChallenge,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    publishRandomPost
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import type { PKC } from "../../../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../../../dist/node/runtime/node/community/local-community.js";
import type { RpcLocalCommunity } from "../../../../dist/node/community/rpc-local-community.js";
import type { Comment } from "../../../../dist/node/publications/comment/comment.js";
import type { SignerWithPublicKeyAddress } from "../../../../dist/node/signer/index.js";

describe(`community.features.noArchive`, () => {
    let pkc: PKC;
    let community: LocalCommunity | RpcLocalCommunity;
    let moderatorSigner: SignerWithPublicKeyAddress;
    let postArchivedBeforeFeature: Comment;
    let post: Comment;

    beforeAll(async () => {
        pkc = await mockPKC();
        community = await createSubWithNoChallenge({}, pkc);
        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });

        moderatorSigner = await pkc.createSigner();
        await community.edit({ roles: { [moderatorSigner.address]: { role: "moderator" } } });
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => community.roles?.[moderatorSigner.address]?.role === "moderator"
        });

        // Archived while the community still had an archive
        postArchivedBeforeFeature = await publishRandomPost({ communityAddress: community.address, pkc });
        const archiveBeforeFeature = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: postArchivedBeforeFeature.cid!,
            commentModeration: { archived: true },
            signer: moderatorSigner
        });
        await publishWithExpectedResult({ publication: archiveBeforeFeature, expectedChallengeSuccess: true });

        post = await publishRandomPost({ communityAddress: community.address, pkc });
    });

    afterAll(async () => {
        await community.delete();
        await pkc.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(community.features).to.be.undefined;
        await community.edit({ features: { ...community.features, noArchive: true } });
        expect(community.features?.noArchive).to.be.true;
    });

    it.sequential(`Mod can't archive a post`, async () => {
        const archiveMod = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: post.cid!,
            commentModeration: { archived: true },
            signer: moderatorSigner
        });
        await publishWithExpectedResult({
            publication: archiveMod,
            expectedChallengeSuccess: false,
            expectedReason: messages.ERR_NOT_ALLOWED_TO_ARCHIVE_POSTS
        });
    });

    it.sequential(`Mod can still lock a post`, async () => {
        const lockMod = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: post.cid!,
            commentModeration: { locked: true },
            signer: moderatorSigner
        });
        await publishWithExpectedResult({ publication: lockMod, expectedChallengeSuccess: true });
    });

    it.sequential(`Mod can resend archived=true with other changes on a post archived before the feature was enabled`, async () => {
        const resendArchivedMod = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: postArchivedBeforeFeature.cid!,
            commentModeration: { archived: true, spoiler: true },
            signer: moderatorSigner
        });
        await publishWithExpectedResult({ publication: resendArchivedMod, expectedChallengeSuccess: true });
    });

    it.sequential(`Mod can unarchive a post archived before the feature was enabled`, async () => {
        const unarchiveMod = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: postArchivedBeforeFeature.cid!,
            commentModeration: { archived: false },
            signer: moderatorSigner
        });
        await publishWithExpectedResult({ publication: unarchiveMod, expectedChallengeSuccess: true });
    });

    it.sequential(`Mod can't archive a post again after unarchiving it`, async () => {
        const rearchiveMod = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: postArchivedBeforeFeature.cid!,
            commentModeration: { archived: true },
            signer: moderatorSigner
        });
        await publishWithExpectedResult({
            publication: rearchiveMod,
            expectedChallengeSuccess: false,
            expectedReason: messages.ERR_NOT_ALLOWED_TO_ARCHIVE_POSTS
        });
    });

    it.sequential(`Mod can archive a post again once the feature is disabled`, async () => {
        await community.edit({ features: { ...community.features, noArchive: false } });
        expect(community.features?.noArchive).to.be.false;

        const archiveMod = await pkc.createCommentModeration({
            communityAddress: community.address,
            commentCid: post.cid!,
            commentModeration: { archived: true },
            signer: moderatorSigner
        });
        await publishWithExpectedResult({ publication: archiveMod, expectedChallengeSuccess: true });
    });
});
