// Issue #387: the store-time gate. Validation rejects the shapes we know change signed bytes on the way
// into the DB (an empty author object, a lone surrogate). This gate is the backstop for shapes nobody
// has named yet: inside the insert transaction the community rebuilds the record from the row the way
// the pages and the CommentUpdate will, and rejects the publication if it no longer hashes to its cid
// or verifies. Before the gate, such a row froze the board at its next publish cycle.
//
// The gate sits below validation, so the suite reaches it by calling the store functions directly with
// publications that validation would have refused.
//
// describeSkipIfRpc: calls storeComment / storeCommentEdit on a LocalCommunity in this process, which an
// RPC client cannot do.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mockPKC, generateMockPost, createSubWithNoChallenge, resolveWhenConditionIsTrue } from "../../../../dist/node/test/test-util.js";
import { storeComment, storeCommentEdit } from "../../../../dist/node/runtime/node/community/local-community/publication-store.js";
import { getPKCAddressFromPublicKey } from "../../../../dist/node/signer/util.js";
import { describeSkipIfRpc } from "../../../helpers/conditional-tests.js";
import { LONE_SURROGATE, resignVerbatim } from "../../../helpers/resign-verbatim.js";
import type { WirePublication } from "../../../helpers/resign-verbatim.js";

import type { PKC } from "../../../../dist/node/pkc/pkc.js";
import type { PKCError } from "../../../../dist/node/pkc-error.js";
import type { LocalCommunity } from "../../../../dist/node/runtime/node/community/local-community.js";
import type { CommentPubsubMessagePublication } from "../../../../dist/node/publications/comment/types.js";
import type { CommentEditPubsubMessagePublication } from "../../../../dist/node/publications/comment-edit/types.js";

const challengeRequestId = new Uint8Array(32);

describeSkipIfRpc("Issue #387: store-time verbatim gate", () => {
    let pkc: PKC;
    let community: LocalCommunity;

    beforeAll(async () => {
        pkc = await mockPKC();
        community = <LocalCommunity>await createSubWithNoChallenge({}, pkc);
        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });
    });

    afterAll(async () => {
        await community.delete();
        await pkc.destroy();
    });

    // A post signed by pkc-js, as the pubsub publication the community would receive
    async function signedPostPublication(): Promise<{
        wire: WirePublication;
        signer: NonNullable<Awaited<ReturnType<typeof generateMockPost>>["signer"]>;
    }> {
        const post = await generateMockPost({ communityAddress: community.address, pkc });
        if (!post.raw.pubsubMessageToPublish) {
            await post._initCommunity();
            await post._signPublicationWithCommunityFields();
        }
        return { wire: <WirePublication>structuredClone(post.raw.pubsubMessageToPublish!), signer: post.signer! };
    }

    async function expectStoreCommentRejected(wire: WirePublication): Promise<PKCError> {
        let thrown: PKCError | undefined;
        try {
            await storeComment(community, { commentPubsub: <CommentPubsubMessagePublication>(<unknown>wire) });
        } catch (e) {
            thrown = e as PKCError;
        }
        expect(thrown, "storeComment must throw").toBeTruthy();
        expect(thrown!.code).toBe("ERR_COMMUNITY_CANNOT_STORE_PUBLICATION_VERBATIM");
        expect(community._dbHandler.hasCommentWithSignatureEncoded(wire.signature.signature), "nothing may be stored").toBe(false);
        return thrown!;
    }

    it("stores a comment pkc-js signed, and the row rebuilds to the accepted cid", async () => {
        const { wire } = await signedPostPublication();
        const { cid } = await storeComment(community, { commentPubsub: <CommentPubsubMessagePublication>(<unknown>wire) });
        expect(community._dbHandler.queryComment(cid)).toBeTruthy();
    });

    it("rejects a comment whose author object the row cannot keep (author: {})", async () => {
        const { wire, signer } = await signedPostPublication();
        wire.author = {};
        await resignVerbatim(wire, signer);
        const error = await expectStoreCommentRejected(wire);
        const details = error.details as { cid: string; storedValidity: { valid: boolean } };
        expect(details.storedValidity.valid).toBe(false);
        // the IPFS add happened before the DB insert, so the orphaned block is queued for unpinning
        expect(community._cidsToUnPin.has(details.cid)).toBe(true);
    });

    it("rejects a comment whose content the row cannot keep (lone surrogate in a TEXT column)", async () => {
        const { wire, signer } = await signedPostPublication();
        wire.content = `before ${LONE_SURROGATE} after`;
        await resignVerbatim(wire, signer);
        const error = await expectStoreCommentRejected(wire);
        const details = error.details as { cid: string; storedCid: string };
        expect(details.storedCid).not.toBe(details.cid);
    });

    it("rejects an author edit whose author object the row cannot keep (author: {}), leaving no edit row", async () => {
        const { wire, signer } = await signedPostPublication();
        const { cid } = await storeComment(community, { commentPubsub: <CommentPubsubMessagePublication>(<unknown>wire) });
        const edit = await pkc.createCommentEdit({ commentCid: cid, communityAddress: community.address, content: "edited", signer });
        if (!edit.raw.pubsubMessageToPublish) {
            await edit._initCommunity();
            await edit._signPublicationWithCommunityFields();
        }
        const editWire = <WirePublication>structuredClone(edit.raw.pubsubMessageToPublish!);
        editWire.author = {};
        await resignVerbatim(editWire, signer);

        let thrown: PKCError | undefined;
        try {
            await storeCommentEdit(community, <CommentEditPubsubMessagePublication>(<unknown>editWire), challengeRequestId);
        } catch (e) {
            thrown = e as PKCError;
        }
        expect(thrown, "storeCommentEdit must throw").toBeTruthy();
        expect(thrown!.code).toBe("ERR_COMMUNITY_CANNOT_STORE_PUBLICATION_VERBATIM");
        const authorSignerAddress = await getPKCAddressFromPublicKey(editWire.signature.publicKey);
        expect(
            community._dbHandler.queryLatestAuthorEdit(cid, authorSignerAddress),
            "the transaction must roll the edit row back"
        ).toBeUndefined();
    });
});
