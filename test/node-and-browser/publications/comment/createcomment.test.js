import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishRandomPost,
    publishRandomReply,
    jsonifyCommentAndRemoveInstanceProps,
    resolveWhenConditionIsTrue,
    getAvailablePlebbitConfigsToTestAgainst,
    publishWithExpectedResult,
    addStringToIpfs
} from "../../../../dist/node/test/test-util.js";
import { describe, it } from "vitest";
const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent(`plebbit.createComment - Remote (${config.name})`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it.skip(`comment = await createComment(await createComment)`, async () => {
            // For now we're not supporting creating a comment instance from another instance
            const props = {
                content: `test comment = await createComment(await createComment) ${Date.now()}`,
                subplebbitAddress,
                author: {
                    address: signers[4].address,
                    displayName: `Mock Author - comment = await createComment(await createComment)`
                },
                signer: signers[4],
                timestamp: 2345324
            };
            const comment = await plebbit.createComment(props);

            const nestedComment = await plebbit.createComment(comment);

            expect(comment.content).to.equal(props.content);
            expect(comment.subplebbitAddress).to.equal(props.subplebbitAddress);
            expect(comment.author.address).to.equal(props.author.address);
            expect(comment.author.displayName).to.equal(props.author.displayName);
            expect(comment.timestamp).to.equal(props.timestamp);

            expect(comment.toJSON()).to.deep.equal(nestedComment.toJSON());
        });

        it(`Can recreate a stringifed local Comment instance before publishing with plebbit.createComment`, async () => {
            const localComment = await generateMockPost(subplebbitAddress, plebbit, {}, false);
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(localComment)));
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            const localCommentJson = jsonifyCommentAndRemoveInstanceProps(localComment);

            expect(localCommentJson).to.deep.equal(commentCloneJson);
        });

        it(`Can recreate a stringifed local Comment instance after publishing with plebbit.createComment`, async () => {
            const localComment = await publishRandomPost(subplebbitAddress, plebbit);
            expect(localComment.author.subplebbit).to.be.a("object"); // should get it from subplebbit
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(localComment)));
            expect(commentClone.author.subplebbit).to.be.a("object"); // should get it from subplebbit
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            const localCommentJson = jsonifyCommentAndRemoveInstanceProps(localComment);

            expect(localCommentJson).to.deep.equal(commentCloneJson);
        });

        it(`Can recreate a stringified local comment instance after comment.update() with plebbit.createComment`, async () => {
            const localComment = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
            await localComment.update();
            await resolveWhenConditionIsTrue({ toUpdate: localComment, predicate: () => typeof localComment.updatedAt === "number" });
            await localComment.stop();
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(localComment)));
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            expect(commentCloneJson.signer).to.be.a("object");
            const localCommentJson = jsonifyCommentAndRemoveInstanceProps(localComment);
            expect(localCommentJson).to.deep.equal(commentCloneJson);
        });

        it(`Can create a Comment instance with subplebbit.posts.pages.hot.comments[0]`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const commentFromPage = subplebbit.posts.pages.hot.comments[0];
            const commentClone = await plebbit.createComment(commentFromPage);
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            const commentFromPageJson = jsonifyCommentAndRemoveInstanceProps(commentFromPage);

            expect(commentCloneJson).to.deep.equal(commentFromPageJson);
        });

        it(`Can recreate a Comment instance with replies with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const postWithReplyToCloneFromPage = subplebbit.posts.pages.hot.comments.find((comment) => comment.replies);
            expect(postWithReplyToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(postWithReplyToCloneFromPage);
            expect(commentCloneInstance.replies).to.be.a("object");
            const commentCloneInstanceJson = jsonifyCommentAndRemoveInstanceProps(commentCloneInstance);
            const commentToCloneFromPageJson = jsonifyCommentAndRemoveInstanceProps(postWithReplyToCloneFromPage);
            expect(commentToCloneFromPageJson).to.deep.equal(commentCloneInstanceJson);
        });

        it(`Can recreate a stringified Comment instance with replies with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const postWithReplyToCloneFromPage = subplebbit.posts.pages.hot.comments.find((comment) => comment.replies);
            expect(postWithReplyToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(JSON.parse(JSON.stringify(postWithReplyToCloneFromPage)));
            expect(commentCloneInstance.replies).to.be.a("object");
            const commentCloneInstanceJson = jsonifyCommentAndRemoveInstanceProps(commentCloneInstance);
            const commentToCloneFromPageJson = jsonifyCommentAndRemoveInstanceProps(postWithReplyToCloneFromPage);
            expect(commentCloneInstanceJson).to.deep.equal(commentToCloneFromPageJson);
        });

        it(`Can recreate a stringified Post instance with plebbit.createComment`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false);
            const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
            const postJson = jsonifyCommentAndRemoveInstanceProps(post);
            const postFromStringifiedPostJson = jsonifyCommentAndRemoveInstanceProps(postFromStringifiedPost);
            expect(postJson).to.deep.equal(postFromStringifiedPostJson);
        });

        it.sequential("comment instance created with {subplebbitAddress, cid, depth, postCid} prop can call getPage", async () => {
            const post = await publishRandomPost(subplebbitAddress, plebbit);
            expect(post.replies).to.be.a("object");
            await publishRandomReply(post, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue({ toUpdate: post, predicate: () => post.replyCount >= 1 });
            expect(post.content).to.be.a("string");
            expect(post.replyCount).to.be.at.least(1);
            expect(post.replies.pages.best.comments.length).to.be.at.least(1);

            await post.stop();

            const pageCid = await addStringToIpfs(JSON.stringify({ comments: [post.replies.pages.best["comments"][0].raw] }));
            expect(pageCid).to.be.a("string");

            const postClone = await plebbit.createComment({
                subplebbitAddress: post.subplebbitAddress,
                cid: post.cid,
                depth: post.depth,
                postCid: post.postCid
            });
            expect(postClone.content).to.be.undefined;
            expect(postClone.subplebbitAddress).to.equal(post.subplebbitAddress);
            expect(postClone.cid).to.equal(post.cid);
            expect(postClone.depth).to.equal(post.depth);
            expect(postClone.postCid).to.equal(post.postCid);

            postClone.replies.pageCids.new = pageCid; // mock it to have pageCids
            const page = await postClone.replies.getPage(pageCid);
            expect(page.comments.length).to.be.equal(1);
        });

        it(`Can create a new comment with author.shortAddress and publish it`, async () => {
            // it should delete author.shortAddress before publishing however
            const comment = await generateMockPost(subplebbitAddress, plebbit, false, { author: { shortAddress: "12345" } });
            expect(comment.author.shortAddress).to.be.a("string").and.not.equal("12345");
            await publishWithExpectedResult(comment, true);

            const commentLoaded = await plebbit.getComment(comment.cid);
            expect(commentLoaded.author.shortAddress).to.be.a("string").and.not.equal("12345");
        });

        it(`Can create a new comment with author.subplebbit and publish it`, async () => {
            // it should delete author.sublebbit before publishing however
            const comment = await generateMockPost(subplebbitAddress, plebbit, false, { author: { subplebbit: { postScore: 100 } } });
            expect(comment.author.subplebbit).to.be.undefined;
            await publishWithExpectedResult(comment, true);

            const commentLoaded = await plebbit.getComment(comment.cid);
            expect(commentLoaded.author.subplebbit).to.be.undefined;
        });

        it(`Can create comment with {subplebbitAddress: string, cid: string}`, async () => {
            const cid = "QmQ9mK33zshLf4Bj8dVSQimdbyXGgw5QFRoUQpsCqqz6We";
            const comment = await plebbit.createComment({ cid, subplebbitAddress });
            expect(comment.cid).to.equal(cid);
            expect(comment.subplebbitAddress).to.equal(subplebbitAddress);
        });

        it(`Can create a comment with eth and sol wallets`, async () => {
            const fixture = {
                subplebbitAddress,
                content: "test comment creation with eth and sol wallets",
                author: {
                    address: "12D3KooWKoXpxTwfnjA5ExuFbeverNKhjKy6a4KesBSh3e6VLaW5",
                    wallets: {
                        eth: {
                            address: "0x37BC48124fDf985DC3983E2e8414606D4a996ED7",
                            timestamp: 1748048717754,
                            signature: {
                                signature:
                                    "0x2812fcfb5001685eb7e7f88bee720b5c761e2e194750265b7d74d69549dd59f05ec6dc2a77afe3b14022a48dd7569f91f2d36701380c953f6769579733843cf61c",
                                type: "eip191"
                            }
                        },
                        sol: {
                            address: "AzAfDLMxbptaq5Ppy4BK5aEsEzvTYNFAub5ffewbSdn9",
                            timestamp: 1748048718136,
                            signature: {
                                signature: "3VfcyEbzrAiK7AowGgJrzjS5Y5amXEXCYhcUgd7RUZQ8uMRQvDPa12VJjMPjt47rnwGE71ZL76h7LT9qFbueZbDx",
                                type: "sol"
                            }
                        }
                    }
                },
                signer: {
                    type: "ed25519",
                    privateKey: "mV8GRU5TGScen7UYZOuNQQ1CKe2G46DCc60moM1yLF4",
                    publicKey: "lF41sWk/JHHdfQSH5VAR55uGZp0/Cv9/xXxwS+vOOVI",
                    address: "12D3KooWKoXpxTwfnjA5ExuFbeverNKhjKy6a4KesBSh3e6VLaW5",
                    shortAddress: "KoXpxTwfnjA5"
                }
            };

            const comment = await plebbit.createComment(fixture);
            expect(comment.author.address).to.equal(fixture.author.address);
            expect(comment.author.shortAddress).to.equal(fixture.signer.shortAddress);
            expect(comment.author.wallets.eth.address).to.equal(fixture.author.wallets.eth.address);
            expect(comment.author.wallets.sol.address).to.equal(fixture.author.wallets.sol.address);
            expect(comment.signer.address).to.equal(fixture.signer.address);
            expect(comment.signer.shortAddress).to.equal(fixture.signer.shortAddress);
            expect(comment.subplebbitAddress).to.equal(fixture.subplebbitAddress);
        });
    });
});
