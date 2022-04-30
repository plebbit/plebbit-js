import {loadIpfsFileAsJson, TIMEFRAMES_TO_SECONDS, timestamp} from "../src/Util.js";
import Debug from "debug";

const debug = Debug("plebbit-js:Pages");

export async function generateMockComment(parentPostOrComment, plebbit) {
    const commentTime = Date.now() / 1000;
    const signer = await plebbit.createSigner();
    const comment = await plebbit.createComment({
        "author": {"displayName": `Mock Author - ${commentTime}`},
        "signer": signer,
        "content": `Mock comment - ${commentTime}`,
        "postCid": parentPostOrComment.postCid,
        "parentCid": parentPostOrComment.cid,
        "subplebbitAddress": parentPostOrComment.subplebbitAddress
    });
    comment.once("challenge", challengeMsg => {
        comment.publishChallengeAnswers(undefined);
    });
    return comment;
}

export async function generateMockPost(subplebbitAddress, plebbit) {
    const postStartTestTime = Date.now() / 1000;
    const signer = await plebbit.createSigner();
    const post = await plebbit.createComment({
        "author": {"displayName": `Mock Author - ${postStartTestTime}`},
        "signer": signer,
        "title": `Mock Post - ${postStartTestTime}`,
        "content": `Mock content - ${postStartTestTime}`,
        "subplebbitAddress": subplebbitAddress
    });
    post.once("challenge", challengeMsg => {
        post.publishChallengeAnswers(undefined);
    });
    return post
}

export async function generateMockPostWithRandomTimestamp(subplebbitAddress, plebbit) {
    const randomTimeframeIndex = Math.floor(Math.random() * (Object.keys(TIMEFRAMES_TO_SECONDS).length - 1));
    const postTimestamp = timestamp() - (Math.random > 0.5 ? TIMEFRAMES_TO_SECONDS[randomTimeframeIndex] : 0);
    const postTime = Date.now();
    const signer = await plebbit.createSigner();
    const post = await plebbit.createComment({
        "author": {"displayName": `Mock Author - ${postTime}`},
        "signer": signer,
        "title": `Mock Post - ${postTime}`,
        "content": `Mock content - ${postTime}`,
        "subplebbitAddress": subplebbitAddress,
        "timestamp": postTimestamp
    });

    post.once("challenge", challengeMsg => {
        post.publishChallengeAnswers(undefined);
    });
    return post;

}

export async function generateMockVote(parentPostOrComment, vote, plebbit) {
    const voteTime = Date.now() / 1000;
    const signer = await plebbit.createSigner();
    const voteObj = await plebbit.createVote({
        "author": {"displayName": `Mock Author - ${voteTime}`},
        "signer": signer,
        "commentCid": parentPostOrComment.cid || parentPostOrComment.postCid,
        "vote": vote,
        "subplebbitAddress": parentPostOrComment.subplebbitAddress
    });
    voteObj.once("challenge", challengeMsg => {
        voteObj.publishChallengeAnswers(undefined);
    });
    return voteObj;
}

export async function loadAllPagesThroughSortedComments(sortedCommentsCid, pages) {
    if (!sortedCommentsCid)
        return [];
    try {
        let sortedCommentsPage = await pages.getPage(sortedCommentsCid);
        let sortedComments = sortedCommentsPage.comments;
        while (sortedCommentsPage.nextCid) {
            sortedCommentsPage = await pages.getPage(sortedCommentsPage.nextCid);
            sortedComments = sortedComments.concat(sortedCommentsPage.comments);
        }
        sortedComments = await Promise.all(sortedComments.map(async commentProps => pages.subplebbit.plebbit.createComment(commentProps)));
        return sortedComments;

    } catch (e) {
        debug(`Error while loading all pages under cid (${sortedCommentsCid}): ${e}`)
    }
}