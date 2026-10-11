// Issue #353. A `nameResolved: false` verdict now lapses: `nameResolvedCache` writes its `false` entries with
// `pkc._nameResolvedFalseTtlMs` so a domain whose owner is still configuring it is not called an impostor for
// the life of the process. The lapse only means something if it reaches the things that hold a verdict.
//
// Both consumers of that cache used to gate on "not yet a boolean", which is the gate the community side
// already moved off of (`nameResolved !== true`), so an author verdict recorded once was never re-earned no
// matter what the cache did underneath. These cases drive the lapse through the two places a verdict is held:
// a comment in a community page, and an updating Comment instance.
//
// Both re-earn it while a community record is being applied, which is the cadence the page sweep has always
// run at, so each case publishes to the community to produce records. Each case also uses an author of its
// own, because a successful resolution is written to the persistent name cache and would otherwise answer the
// next case before its resolver could.
import { beforeAll, afterAll, expect, it } from "vitest";
import signers from "../../../fixtures/signers.js";
import {
    createMockNameResolver,
    mockRemotePKC,
    publishRandomPost,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../../helpers/conditional-tests.js";
import { sha256 } from "js-sha256";
import type { PKC } from "../../../../dist/node/pkc/pkc.js";
import type { RemoteCommunity } from "../../../../dist/node/community/remote-community.js";
import type { Comment } from "../../../../dist/node/publications/comment/comment.js";
import type { NameResolutionCacheEntry } from "../../../../dist/node/clients/name-resolution-cache.js";

const communityAddress = signers[0].address;
// Both names resolve on the community's own resolvers, which is what lets the posts be published at all. The
// reader below is the one that cannot resolve them, which is the situation under test.
const pageAuthor = { name: "plebbit.bso", signer: signers[3] };
const commentAuthor = { name: "rpc-edit-test.bso", signer: signers[7] };

// Short enough that a test can outlive the verdict without sitting on the real 60 seconds.
const FALSE_TTL_MS = 2000;
// The same, for a `true`, whose real window is an hour.
const TRUE_TTL_MS = 2000;

// A verdict is only ever re-earned while a community record is being applied, so the board has to move for
// anything to happen at all. An idle community publishes nothing, and back-to-back publishes can land in
// one record, so each post is given room to become a record of its own before the next one.
const keepTheBoardMovingUntil = async ({
    publisherPKC,
    predicate,
    attempts = 4
}: {
    publisherPKC: PKC;
    predicate: () => boolean;
    attempts?: number;
}) => {
    for (let attempt = 0; attempt < attempts && !predicate(); attempt++) {
        await publishRandomPost({ communityAddress, pkc: publisherPKC });
        const startedAt = Date.now();
        while (!predicate() && Date.now() - startedAt < 5000) await new Promise((resolve) => setTimeout(resolve, 200));
    }
};

// describeSkipIfRpc: the reader's resolver is configured on this client. Under RPC the author name is resolved
// on the server, which ships the verdict in runtimeFields and whose resolvers this test cannot flip, so the
// outage never happens on the side that computes the verdict.
describeSkipIfRpc("author.nameResolved re-earns a false verdict (#353)", () => {
    let publisherPKC: PKC;
    let readerPKC: PKC;
    const commentCidOfAuthor: Record<string, string> = {};
    // What the reader's resolver answers, per name. Every name starts unanswered, which is the outage the
    // author is publishing through.
    const resolverAnswers: Record<string, string | undefined> = {};
    const communities: RemoteCommunity[] = [];
    const comments: Comment[] = [];

    beforeAll(async () => {
        publisherPKC = await mockRemotePKC();
        for (const author of [pageAuthor, commentAuthor]) {
            const post = await publishRandomPost({
                communityAddress,
                pkc: publisherPKC,
                postProps: { author: { name: author.name }, signer: author.signer }
            });
            commentCidOfAuthor[author.name] = post.cid!;
        }

        readerPKC = await mockRemotePKC({
            mockResolve: false,
            pkcOptions: {
                nameResolvers: [
                    createMockNameResolver({
                        key: `author-name-resolved-retry-${Date.now()}`,
                        // Every name not answered for here reads as "no record", the community's own name claim
                        // included. That is a verdict about the community's name and never a key migration.
                        resolveFunction: async ({ name }) => {
                            const publicKey = resolverAnswers[name];
                            return publicKey ? { publicKey } : undefined;
                        }
                    })
                ]
            }
        });
        // Per instance, so shortening it cannot leak into another suite sharing this worker.
        readerPKC._nameResolvedFalseTtlMs = FALSE_TTL_MS;
    });

    afterAll(async () => {
        for (const comment of comments) await comment.stop();
        for (const community of communities) await community.stop();
        await readerPKC.destroy();
        await publisherPKC.destroy();
    });

    // The author has finished configuring their domain. Nothing notices until the verdict lapses.
    const letTheVerdictLapse = async (author: typeof pageAuthor) => {
        resolverAnswers[author.name] = author.signer.address;
        await new Promise((resolve) => setTimeout(resolve, FALSE_TTL_MS + 500));
    };

    it("flips a page comment from false to true once the record appears", async () => {
        const community = await readerPKC.createCommunity({ address: communityAddress });
        communities.push(community);
        await community.update();

        const pageComment = () =>
            community.posts?.pages?.hot?.comments?.find((comment) => comment.cid === commentCidOfAuthor[pageAuthor.name]);
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => pageComment()?.author.nameResolved === false
        });

        // Two records are needed here: the first is what re-resolves the name into the cache, and the second is
        // what carries the refreshed verdict onto the pages of the instance under test, which mirrors the
        // tracked updating one and so trails it by a record.
        //
        // This case holds with either gate, because every record rebuilds the page's comment objects and a
        // rebuilt one carries no verdict to be stale. What it pins is the rest of the chain: that the `false`
        // lapses out of the cache at all, that the sweep re-resolves once it has, and that the refreshed
        // verdict reaches a page. The gate matters where a verdict outlives the objects holding it, which is
        // the updating Comment below.
        await letTheVerdictLapse(pageAuthor);
        await keepTheBoardMovingUntil({ publisherPKC, predicate: () => pageComment()?.author.nameResolved === true });
        expect(pageComment()?.author.nameResolved).to.equal(true);
    });

    it("flips an updating comment from false to true once the record appears", async () => {
        const comment = await readerPKC.createComment({ cid: commentCidOfAuthor[commentAuthor.name] });
        comments.push(comment);
        await comment.update();
        await resolveWhenConditionIsTrue({
            toUpdate: comment,
            // Optional: a comment created from a cid alone has no author until its CommentIpfs lands.
            predicate: async () => comment.author?.nameResolved === false
        });

        // One record is enough here: the comment resolves its own author while the community update is being
        // handled and pushes the new verdict out itself, rather than waiting to be handed a fresh copy of it.
        //
        // This is the case that fails without the fix. A Comment builds its author once, when its CommentIpfs
        // lands, and CommentUpdates never rebuild it, so the `false` recorded then was the verdict it kept for
        // the rest of its life: the old gate skipped anything already holding a boolean, and nothing asked
        // again on later updates anyway. Reverting either half leaves this at `false` forever.
        await letTheVerdictLapse(commentAuthor);
        await keepTheBoardMovingUntil({ publisherPKC, predicate: () => comment.author?.nameResolved === true });
        expect(comment.author.nameResolved).to.equal(true);
        expect(comment.author.address).to.equal(commentAuthor.name);
    });
});

// The other direction. A `true` lapses too, after the hour its persistent record is trusted for, and the point
// of that window is a domain transferred away: the record now names somebody else and the old verdict must
// stop reading as verified. The page case needs nothing extra, since every record rebuilds a page's comment
// objects and a rebuilt one re-reads the cache. An updating Comment holds its author for life, so it is the
// one that has to ask again. It used to gate the asking on its own field not being `true`, which is exactly
// the field a lapsed `true` still sits in, so nothing ever asked and the comment stayed verified for as long
// as it lived.
//
// Same reader-side resolver and author-of-its-own pattern as above; the name here is distinct from the
// cases above in both caches, since both key on the name.
const transferredAuthor = { name: "rpc-edit-test.eth", signer: signers[7] };
const newOwnerOfTheDomain = signers[8];

describeSkipIfRpc("author.nameResolved re-earns a true verdict (#353)", () => {
    let publisherPKC: PKC;
    let readerPKC: PKC;
    let comment: Comment | undefined;
    let postCid: string;
    const resolverKey = `author-name-resolved-true-retry-${Date.now()}`;
    const resolverAnswers: Record<string, string | undefined> = {};

    beforeAll(async () => {
        publisherPKC = await mockRemotePKC();
        const post = await publishRandomPost({
            communityAddress,
            pkc: publisherPKC,
            postProps: { author: { name: transferredAuthor.name }, signer: transferredAuthor.signer }
        });
        postCid = post.cid!;

        resolverAnswers[transferredAuthor.name] = transferredAuthor.signer.address;
        readerPKC = await mockRemotePKC({
            mockResolve: false,
            pkcOptions: {
                nameResolvers: [
                    createMockNameResolver({
                        key: resolverKey,
                        resolveFunction: async ({ name }) => {
                            const publicKey = resolverAnswers[name];
                            return publicKey ? { publicKey } : undefined;
                        }
                    })
                ]
            }
        });
        readerPKC._nameResolvedTrueTtlMs = TRUE_TTL_MS;
    });

    afterAll(async () => {
        if (comment) await comment.stop();
        await readerPKC.destroy();
        await publisherPKC.destroy();
    });

    // An hour passes. The in-memory `true` is given a short window above; the persistent record that backs
    // it is what the re-resolve reads first, with `maxAge: 3600`, so it is aged past that here. In production
    // both expire together, which is why the two windows match.
    const letAnHourPass = async (name: string) => {
        const store = await readerPKC._createStorageLRU({ cacheName: "pkcjs_lrustorage_nameResolutions", maxItems: 5000 });
        const key = `${name}::${resolverKey}::${sha256("mock")}`;
        const entry = (await store.getItem(key)) as NameResolutionCacheEntry | undefined;
        if (!entry) throw Error("The verified name should have been written to the persistent cache");
        await store.setItem(key, { ...entry, resolvedAtMs: Date.now() - 3601 * 1000 });
        await new Promise((resolve) => setTimeout(resolve, TRUE_TTL_MS + 500));
    };

    it("flips an updating comment from true to false once the domain has moved to another key", async () => {
        comment = await readerPKC.createComment({ cid: postCid });
        await comment.update();
        const updatingComment = comment;
        await resolveWhenConditionIsTrue({
            toUpdate: updatingComment,
            predicate: async () => updatingComment.author?.nameResolved === true
        });

        // The domain is transferred: its record now names somebody else.
        resolverAnswers[transferredAuthor.name] = newOwnerOfTheDomain.address;
        await letAnHourPass(transferredAuthor.name);
        await keepTheBoardMovingUntil({ publisherPKC, predicate: () => updatingComment.author?.nameResolved === false });
        expect(updatingComment.author.nameResolved).to.equal(false);
        // The address is never rewritten; the flag is the whole signal.
        expect(updatingComment.author.address).to.equal(transferredAuthor.name);
    });
});
