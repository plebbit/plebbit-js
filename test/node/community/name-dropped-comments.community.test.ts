import { beforeAll, afterAll, describe, it, expect } from "vitest";
import {
    createMockNameResolver,
    publishRandomPost,
    publishRandomReply,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue,
    mockPKCV2
} from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";

import { v4 as uuidV4 } from "uuid";

import type { PKC as PKCType } from "../../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";
import type { RpcLocalCommunity } from "../../../dist/node/community/rpc-local-community.js";
import type { RemoteCommunity } from "../../../dist/node/community/remote-community.js";
import type { Comment } from "../../../dist/node/publications/comment/comment.js";
import type { CommentIpfsWithCidDefined } from "../../../dist/node/publications/comment/types.js";

// Issue #401: a community that drops its name (domain -> its own public key) keeps showing the comments signed under
// that name. Client page verification skips the name check on a community without a name, so those rows still verify,
// and the server must not hide anything clients accept.
// Skipped under RPC: the domain only resolves through this PKC's mock name resolver, and the RPC test server strips
// client-supplied nameResolvers in setSettings, so the community could never take the domain address there.
describeSkipIfRpc(`comments signed under a name the community dropped (#401)`, async () => {
    let pkc: PKCType;
    let remotePKC: PKCType;
    let community: LocalCommunity | RpcLocalCommunity;
    let domainAddress: string;
    let postSignedWithName: Comment;
    let replySignedWithName: Comment;

    beforeAll(async () => {
        const resolverRecords = new Map<string, string | undefined>();
        pkc = await mockPKCV2({
            stubStorage: false,
            mockResolve: false,
            pkcOptions: { nameResolvers: [createMockNameResolver({ includeDefaultRecords: true, records: resolverRecords })] }
        });
        remotePKC = await mockPKCV2({ stubStorage: false, remotePKC: true });

        community = await createSubWithNoChallenge({}, pkc);
        domainAddress = `test-name-dropped-${uuidV4()}.bso`;
        resolverRecords.set(domainAddress, community.signer.address);

        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });
        await community.edit({ address: domainAddress });
        await new Promise((resolve) => community.once("update", resolve));
        expect(community.address).to.equal(domainAddress);

        postSignedWithName = await publishRandomPost({ communityAddress: domainAddress, pkc });
        replySignedWithName = await publishRandomReply({
            parentComment: postSignedWithName as CommentIpfsWithCidDefined,
            pkc
        });
        expect(postSignedWithName.raw.comment?.communityName).to.equal(domainAddress);
        expect(replySignedWithName.raw.comment?.communityName).to.equal(domainAddress);

        // Drop the name: the community is addressed by its public key from now on
        await community.edit({ address: community.signer.address });
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => !community.name });
        expect(community.address).to.equal(community.signer.address);
    });

    afterAll(async () => {
        await community.stop();
        await pkc.destroy();
        await remotePKC.destroy();
    });

    it(`the community's pages keep the post and count its reply after the name is dropped`, async () => {
        // Wait for a page generated after the edit, so the assertion is not on a page left over from the named period
        const editedAt = Math.floor(Date.now() / 1000);
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => typeof community.updatedAt === "number" && community.updatedAt >= editedAt
        });
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () =>
                Boolean(
                    community.posts?.pages?.hot?.comments?.some(
                        (comment) => comment.cid === postSignedWithName.cid && comment.replyCount === 1
                    )
                )
        });
        const postInPage = community.posts.pages.hot!.comments.find((comment) => comment.cid === postSignedWithName.cid)!;
        expect(postInPage.communityName).to.equal(domainAddress);
        expect(postInPage.replyCount).to.equal(1);
    });

    it(`a remote client loading the community by its public key verifies and shows the post`, async () => {
        const remoteCommunity = (await remotePKC.createCommunity({ address: community.signer.address })) as RemoteCommunity;
        await remoteCommunity.update();
        try {
            await resolveWhenConditionIsTrue({
                toUpdate: remoteCommunity,
                predicate: async () =>
                    !remoteCommunity.name &&
                    Boolean(
                        remoteCommunity.posts?.pages?.hot?.comments?.some(
                            (comment) => comment.cid === postSignedWithName.cid && comment.replyCount === 1
                        )
                    )
            });
        } finally {
            await remoteCommunity.stop();
        }
    });
});
