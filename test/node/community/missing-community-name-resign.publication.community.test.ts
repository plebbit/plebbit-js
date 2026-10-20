import { beforeAll, afterAll, it, expect } from "vitest";
import {
    createMockNameResolver,
    createSubWithNoChallenge,
    mockPKCV2,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";

import { v4 as uuidV4 } from "uuid";

import type { PKC } from "../../../dist/node/pkc/pkc.js";
import type { Comment } from "../../../dist/node/publications/comment/comment.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";
import type { RpcLocalCommunity } from "../../../dist/node/community/rpc-local-community.js";
import type { SignerType } from "../../../dist/node/signer/types.js";

// Issue #401: a publication created with only a named community's key is re-signed at publish() with the name from the
// community record it loaded. missing-community-name.publication.community.test.ts covers a comment and a vote; this
// covers the other three publication types, which a named community also rejects without communityName.
// Skipped under RPC: the domain only resolves through this PKC's mock name resolver, and the RPC test server strips
// client-supplied nameResolvers in setSettings, so the community could never take the domain address there.
describeSkipIfRpc.sequential("publications created by key to a named community are re-signed with its name (#401)", async () => {
    let pkc: PKC;
    let community: LocalCommunity | RpcLocalCommunity;
    let domainAddress: string;
    let targetPost: Comment;
    let moderatorSigner: SignerType;
    let ownerSigner: SignerType;

    beforeAll(async () => {
        const resolverRecords = new Map<string, string | undefined>();
        pkc = await mockPKCV2({
            stubStorage: false,
            mockResolve: false,
            pkcOptions: { nameResolvers: [createMockNameResolver({ includeDefaultRecords: true, records: resolverRecords })] }
        });
        community = await createSubWithNoChallenge({}, pkc);
        domainAddress = `test-resign-by-key-${uuidV4()}.bso`;
        resolverRecords.set(domainAddress, community.signer.address);

        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });
        moderatorSigner = await pkc.createSigner();
        ownerSigner = await pkc.createSigner();
        // edit() sets community.name itself, so wait for updateCid to change: the named record must be published before
        // a publication by key fetches the community, or the fetch reads the record from before the name was added
        const updateCidBeforeName = community.updateCid;
        await community.edit({
            address: domainAddress,
            roles: { [moderatorSigner.address]: { role: "moderator" }, [ownerSigner.address]: { role: "owner" } }
        });
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () =>
                community.name === domainAddress &&
                community.roles?.[moderatorSigner.address]?.role === "moderator" &&
                community.roles?.[ownerSigner.address]?.role === "owner" &&
                community.updateCid !== updateCidBeforeName
        });

        targetPost = await publishRandomPost({ communityAddress: domainAddress, pkc });
    });

    afterAll(async () => {
        await community.delete();
        await pkc.destroy();
    });

    it("a commentEdit created with only the community's key is signed with the community's name at publish", async () => {
        const commentEdit = await pkc.createCommentEdit({
            commentCid: targetPost.cid!,
            content: `Edited by key ${Date.now()}`,
            communityAddress: community.signer.address,
            signer: targetPost.signer
        });
        expect(commentEdit.raw.pubsubMessageToPublish?.communityName).to.be.undefined;
        await publishWithExpectedResult({ publication: commentEdit, expectedChallengeSuccess: true });
        expect(commentEdit.raw.pubsubMessageToPublish?.communityName).to.equal(domainAddress);
    });

    it("a commentModeration created with only the community's key is signed with the community's name at publish", async () => {
        const commentModeration = await pkc.createCommentModeration({
            communityAddress: community.signer.address,
            commentCid: targetPost.cid!,
            commentModeration: { reason: `Moderated by key ${Date.now()}`, spoiler: true },
            signer: moderatorSigner
        });
        expect(commentModeration.raw.pubsubMessageToPublish?.communityName).to.be.undefined;
        await publishWithExpectedResult({ publication: commentModeration, expectedChallengeSuccess: true });
        expect(commentModeration.raw.pubsubMessageToPublish?.communityName).to.equal(domainAddress);
    });

    it("a communityEdit created with only the community's key is signed with the community's name at publish", async () => {
        const communityEdit = await pkc.createCommunityEdit({
            communityAddress: community.signer.address,
            communityEdit: { description: `Community edit by key ${Date.now()}` },
            signer: ownerSigner
        });
        expect(communityEdit.raw.pubsubMessageToPublish?.communityName).to.be.undefined;
        await publishWithExpectedResult({ publication: communityEdit, expectedChallengeSuccess: true });
        expect(communityEdit.raw.pubsubMessageToPublish?.communityName).to.equal(domainAddress);
    });
});

// A client that published to the community by key before it had a name holds a communityForPublishing cache entry under
// the key, without a name. After the name is added, a fresh fetch of the named record is cached under the name, never
// under the key, so a later publication created by key still reads the nameless entry, is not re-signed, and is
// rejected with ERR_PUBLICATION_MISSING_COMMUNITY_NAME although this client has already loaded the named record.
// Skipped under RPC: same mock name resolver constraint as above.
describeSkipIfRpc.sequential("re-signing by key after the community was loaded before it had a name (#401)", async () => {
    let pkc: PKC;
    let remotePKC: PKC;
    let community: LocalCommunity | RpcLocalCommunity;
    let domainAddress: string;

    beforeAll(async () => {
        const resolverRecords = new Map<string, string | undefined>();
        const nameResolvers = () => [createMockNameResolver({ includeDefaultRecords: true, records: resolverRecords })];
        pkc = await mockPKCV2({ stubStorage: false, mockResolve: false, pkcOptions: { nameResolvers: nameResolvers() } });
        remotePKC = await mockPKCV2({
            stubStorage: false,
            remotePKC: true,
            mockResolve: false,
            pkcOptions: { nameResolvers: nameResolvers() }
        });
        community = await createSubWithNoChallenge({}, pkc);
        domainAddress = `test-resign-stale-cache-${uuidV4()}.bso`;
        resolverRecords.set(domainAddress, community.signer.address);
        await community.start();
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });
    });

    afterAll(async () => {
        await community.delete();
        await pkc.destroy();
        await remotePKC.destroy();
    });

    it("a comment created by key is re-signed with the name once the client has loaded the named record", async () => {
        // the client publishes by key while the community has no name, which caches the nameless record under the key
        const before = await remotePKC.createComment({
            communityAddress: community.signer.address,
            title: `Before the name ${Date.now()}`,
            content: `Content ${Date.now()}`,
            signer: await remotePKC.createSigner()
        });
        await publishWithExpectedResult({ publication: before, expectedChallengeSuccess: true });

        const updateCidBeforeName = community.updateCid;
        await community.edit({ address: domainAddress });
        await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => community.updateCid !== updateCidBeforeName });

        // the client loads the named record by key
        const remote = await remotePKC.createCommunity({ address: community.signer.address });
        await remote.update();
        await resolveWhenConditionIsTrue({ toUpdate: remote, predicate: async () => remote.name === domainAddress });
        await remote.stop();

        const after = await remotePKC.createComment({
            communityAddress: community.signer.address,
            title: `After the name ${Date.now()}`,
            content: `Content ${Date.now()}`,
            signer: await remotePKC.createSigner()
        });
        await publishWithExpectedResult({ publication: after, expectedChallengeSuccess: true });
        expect(after.raw.pubsubMessageToPublish?.communityName).to.equal(domainAddress);
    });
});
