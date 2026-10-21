import { beforeAll, afterAll, describe, it, expect } from "vitest";
import {
    createMockNameResolver,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue,
    mockPKCV2
} from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";

import { v4 as uuidV4 } from "uuid";

import type { PKC as PKCType } from "../../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";
import type { RemoteCommunity } from "../../../dist/node/community/remote-community.js";
import type { Comment } from "../../../dist/node/publications/comment/comment.js";
import type { CommentIpfsWithCidDefined } from "../../../dist/node/publications/comment/types.js";

// Issue #413: a community that adds a name (its public key -> domain C) keeps the comments published before it. They
// were signed with the community's key and no name, so they claim no name that could conflict with C, and client page
// verification accepts them on a named community. The community identity rule (#401) never hides what clients accept,
// so they stay in the pages and the counts, the community keeps accepting publications that reference them, and
// clients load them through the community, by name or by key, and by their own cid.
// Skipped under RPC: the domain only resolves through this PKC's mock name resolver, and the RPC test server strips
// client-supplied nameResolvers in setSettings, so the community could never take the domain address there.
for (const editKey of ["address", "name"] as const) {
    describeSkipIfRpc(`comments published before a community added a name, edit({ ${editKey} }) (#413)`, async () => {
        let pkc: PKCType;
        let remotePKC: PKCType;
        let community: LocalCommunity;
        let publicKey: string;
        let domainAddress: string;
        let postSignedWithKey: Comment & { cid: string };
        let replySignedWithKey: Comment & { cid: string };
        let failed = false;

        const postsInPreloadedPages = (target: { posts: { pages: Record<string, { comments: { cid: string }[] } | undefined> } }) =>
            Object.values(target.posts.pages).flatMap((page) => page?.comments ?? []);

        // A record from a cycle that started after `trigger` ran: a cycle already running when it was called can still
        // publish a record built before it
        const waitForRecordAfter = async (trigger: () => Promise<unknown>) => {
            const updateCidBefore = community.updateCid;
            await trigger();
            await resolveWhenConditionIsTrue({
                toUpdate: community,
                predicate: async () => failed || community.updateCid !== updateCidBefore
            });
            const updateCidAfter = community.updateCid;
            await community.edit({ title: `record after ${uuidV4()}` });
            await resolveWhenConditionIsTrue({
                toUpdate: community,
                predicate: async () => failed || community.updateCid !== updateCidAfter
            });
            expect(failed).to.be.false;
        };

        beforeAll(async () => {
            const resolverRecords = new Map<string, string | undefined>();
            const nameResolvers = () => [createMockNameResolver({ includeDefaultRecords: true, records: resolverRecords })];
            pkc = await mockPKCV2({ stubStorage: false, mockResolve: false, pkcOptions: { nameResolvers: nameResolvers() } });
            // validatePages: a reader that verifies every page is what rejects a page the community should not publish
            remotePKC = await mockPKCV2({
                stubStorage: false,
                remotePKC: true,
                mockResolve: false,
                pkcOptions: { nameResolvers: nameResolvers(), validatePages: true }
            });

            community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
            publicKey = community.signer.address;
            domainAddress = `test-name-added-${uuidV4()}.bso`;
            resolverRecords.set(domainAddress, publicKey);
            community.on("startedstatechange", (state) => {
                if (state === "failed") failed = true;
            });

            await community.start();
            await resolveWhenConditionIsTrue({ toUpdate: community, predicate: async () => typeof community.updatedAt === "number" });

            // Published while the community has only its key: signed with communityPublicKey and no communityName
            postSignedWithKey = (await publishRandomPost({ communityAddress: publicKey, pkc })) as Comment & { cid: string };
            replySignedWithKey = (await publishRandomReply({
                parentComment: postSignedWithKey as unknown as CommentIpfsWithCidDefined,
                pkc
            })) as Comment & { cid: string };
            for (const comment of [postSignedWithKey, replySignedWithKey]) {
                expect(comment.raw.comment?.communityPublicKey).to.equal(publicKey);
                expect(comment.raw.comment?.communityName).to.be.undefined;
            }

            await waitForRecordAfter(() => community.edit({ [editKey]: domainAddress }));
            expect(community.address).to.equal(domainAddress);
            expect(community.name).to.equal(domainAddress);
        });

        afterAll(async () => {
            await community.delete();
            await pkc.destroy();
            await remotePKC.destroy();
        });

        describe(`publishing: the local community`, () => {
            it(`keeps the post and counts its reply in the pages`, async () => {
                const postInPage = postsInPreloadedPages(community).find((comment) => comment.cid === postSignedWithKey.cid) as
                    | { cid: string; communityName?: string; replyCount?: number }
                    | undefined;
                expect(postInPage).to.exist;
                expect(postInPage!.communityName).to.be.undefined;
                expect(postInPage!.replyCount).to.equal(1);
            });

            it(`counts the post and the reply in the stats`, async () => {
                const { content } = await pkc.fetchCid({ cid: community.statsCid! });
                const stats = JSON.parse(content) as Record<string, number>;
                expect(stats.allPostCount).to.equal(1);
                expect(stats.allReplyCount).to.equal(1);
            });

            it(`accepts a new post signed with the name and shows it next to the old post`, async () => {
                const newPost = (await publishRandomPost({ communityAddress: domainAddress, pkc })) as Comment & { cid: string };
                expect(newPost.raw.comment?.communityName).to.equal(domainAddress);
                await waitForRecordAfter(async () => undefined);
                const cids = postsInPreloadedPages(community).map((comment) => comment.cid);
                expect(cids).to.include(newPost.cid);
                expect(cids).to.include(postSignedWithKey.cid);
            });

            it(`accepts a reply signed with the name to the post signed with the key`, async () => {
                const reply = (await publishRandomReply({
                    parentComment: postSignedWithKey as unknown as CommentIpfsWithCidDefined,
                    pkc,
                    commentProps: { communityAddress: domainAddress }
                })) as Comment & { cid: string };
                expect(reply.raw.comment?.communityName).to.equal(domainAddress);
                await waitForRecordAfter(async () => undefined);
                const postInPage = postsInPreloadedPages(community).find((comment) => comment.cid === postSignedWithKey.cid) as
                    | { replyCount?: number }
                    | undefined;
                expect(postInPage?.replyCount).to.equal(2);
            });

            it(`accepts a vote created with only the community's key on the post signed with the key`, async () => {
                const vote = await pkc.createVote({
                    commentCid: postSignedWithKey.cid,
                    vote: 1,
                    communityAddress: publicKey,
                    signer: await pkc.createSigner()
                });
                await publishWithExpectedResult({ publication: vote, expectedChallengeSuccess: true });
                // re-signed at publish with the name of the record it loaded (#401)
                expect(vote.raw.pubsubMessageToPublish?.communityName).to.equal(domainAddress);
            });
        });

        describe(`loading: clients`, () => {
            for (const loadBy of ["name", "public key"] as const) {
                it(`a reader that validates pages loads the community by its ${loadBy} and shows the post signed with the key`, async () => {
                    const remote = (await remotePKC.createCommunity({
                        address: loadBy === "name" ? domainAddress : publicKey
                    })) as RemoteCommunity;
                    const errors: Error[] = [];
                    remote.on("error", (e) => errors.push(e));
                    await remote.update();
                    try {
                        await resolveWhenConditionIsTrue({
                            toUpdate: remote,
                            predicate: async () =>
                                errors.length > 0 ||
                                (remote.updateCid === community.updateCid &&
                                    postsInPreloadedPages(remote).some((comment) => comment.cid === postSignedWithKey.cid))
                        });
                    } finally {
                        await remote.stop();
                    }
                    expect(errors).to.deep.equal([]);
                    expect(remote.name).to.equal(domainAddress);
                    expect(postsInPreloadedPages(remote).map((comment) => comment.cid)).to.include(postSignedWithKey.cid);
                });
            }

            it(`a client loads the post signed with the key by its cid and gets a verified CommentUpdate with its reply`, async () => {
                const post = await remotePKC.createComment({ cid: postSignedWithKey.cid });
                const errors: Error[] = [];
                post.on("error", (e) => errors.push(e));
                await post.update();
                try {
                    await resolveWhenConditionIsTrue({
                        toUpdate: post,
                        predicate: async () =>
                            errors.length > 0 ||
                            (typeof post.updatedAt === "number" &&
                                Boolean(post.replies?.pages?.best?.comments?.some((comment) => comment.cid === replySignedWithKey.cid)))
                    });
                } finally {
                    await post.stop();
                }
                expect(errors).to.deep.equal([]);
                expect(post.updatedAt).to.be.a("number");
                expect(post.communityPublicKey).to.equal(publicKey);
                expect(post.replies.pages.best!.comments.map((comment) => comment.cid)).to.include(replySignedWithKey.cid);
            });
        });
    });
}
