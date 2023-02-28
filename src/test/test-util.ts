import { TIMEFRAMES_TO_SECONDS, timestamp } from "../util";
import { Comment } from "../comment";
import Post from "../post";
import { Plebbit } from "../plebbit";
import PlebbitIndex from "../index";
import Vote from "../vote";
import { Pages } from "../pages";
import { Subplebbit } from "../subplebbit";
import { CreateCommentOptions, CreateSubplebbitOptions, PostType, VoteType } from "../types";
import isIPFS from "is-ipfs";
import waitUntil from "async-wait-until";
import assert from "assert";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { SignerType } from "../signer/constants";
import Publication from "../publication";

function generateRandomTimestamp(parentTimestamp?: number): number {
    const [lowerLimit, upperLimit] = [typeof parentTimestamp === "number" && parentTimestamp > 2 ? parentTimestamp : 2, timestamp()];

    let randomTimestamp: number = -1;
    while (randomTimestamp === -1) {
        const randomTimeframeIndex = (Object.keys(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        const tempTimestamp = lowerLimit + Object.values(TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (tempTimestamp >= lowerLimit && tempTimestamp <= upperLimit) randomTimestamp = tempTimestamp;
    }

    return randomTimestamp;
}

export async function generateMockPost(
    subplebbitAddress: string,
    plebbit: Plebbit,
    randomTimestamp = false,
    postProps: Partial<CreateCommentOptions | PostType> = {}
) {
    const postTimestamp = (randomTimestamp && generateRandomTimestamp()) || timestamp();
    const postStartTestTime = Date.now() / 1000 + Math.random();
    const signer = postProps?.signer || (await plebbit.createSigner());
    const post = await plebbit.createComment({
        author: { displayName: `Mock Author - ${postStartTestTime}` },
        title: `Mock Post - ${postStartTestTime}`,
        content: `Mock content - ${postStartTestTime}`,
        signer,
        timestamp: postTimestamp,
        subplebbitAddress,
        ...postProps
    });
    //@ts-ignore
    post._updateIntervalMs = 200;

    if (post.constructor.name !== "Post") throw Error("createComment should return Post if title is provided");
    post.once("challenge", (challengeMsg) => post.publishChallengeAnswers([]));

    return post;
}

// TODO rework this
export async function generateMockComment(
    parentPostOrComment: Post | Comment,
    plebbit: Plebbit,
    randomTimestamp = false,
    commentProps: Partial<CreateCommentOptions> = {}
): Promise<Comment> {
    if (!["Comment", "Post"].includes(parentPostOrComment.constructor.name))
        throw Error("Need to have parentComment defined to generate mock comment");
    const commentTimestamp = (randomTimestamp && generateRandomTimestamp(parentPostOrComment.timestamp)) || timestamp();
    const commentTime = Date.now() / 1000 + Math.random();
    const signer = commentProps?.signer || (await plebbit.createSigner());
    const comment: Comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        parentCid: parentPostOrComment.cid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress,
        timestamp: commentTimestamp,
        ...commentProps
    });
    //@ts-ignore
    comment._updateIntervalMs = 200;

    comment.once("challenge", (challengeMsg) => comment.publishChallengeAnswers([]));

    return comment;
}

export async function generateMockVote(
    parentPostOrComment: Comment | Post,
    vote: -1 | 0 | 1,
    plebbit: Plebbit,
    signer?: SignerType
): Promise<Vote> {
    const voteTime = Date.now() / 1000;
    const commentCid = parentPostOrComment.cid || parentPostOrComment.postCid;
    if (typeof commentCid !== "string") throw Error(`generateMockVote: commentCid (${commentCid}) is not a valid CID`);

    signer = signer || (await plebbit.createSigner());
    const voteObj = await plebbit.createVote({
        author: { displayName: `Mock Author - ${voteTime}` },
        signer: signer,
        commentCid: <string>commentCid,
        vote: vote,
        subplebbitAddress: parentPostOrComment.subplebbitAddress
    });
    voteObj.once("challenge", (challengeMsg) => {
        voteObj.publishChallengeAnswers([]);
    });
    return voteObj;
}

export async function loadAllPages(pageCid: string, pagesInstance: Pages): Promise<Comment[]> {
    if (!isIPFS.cid(pageCid)) throw Error(`loadAllPages: pageCid (${pageCid}) is not a valid CID`);
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments: Comment[] = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}

async function _mockPlebbit(signers: SignerType[], dataPath: string) {
    const plebbit = await PlebbitIndex({
        ipfsHttpClientOptions: "http://localhost:15001/api/v0",
        pubsubHttpClientOptions: `http://localhost:15002/api/v0`,
        dataPath
    });
    //@ts-ignore
    plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
        if (authorAddress === "plebbit.eth") return signers[6].address;
        else if (authorAddress === "testgibbreish.eth") return undefined;
        return authorAddress;
    };
    //@ts-ignore
    plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subplebbitAddress) => {
        if (subplebbitAddress === "plebbit.eth") return signers[3].address;
        else if (plebbit.resolver.isDomain(subplebbitAddress)) throw Error(`${subplebbitAddress} has no subplebbit-address`);
        return subplebbitAddress;
    };
    return plebbit;
}

async function _startMathCliSubplebbit(signers: SignerType[], syncInterval: number, dataPath: string) {
    const plebbit = await _mockPlebbit(signers, dataPath);
    const signer = await plebbit.createSigner(signers[1]);
    const subplebbit = await plebbit.createSubplebbit({ signer });

    subplebbit.setProvideCaptchaCallback(async (challengeRequestMessage) => {
        // Expected return is:
        // Challenge[], reason for skipping captcha (if it's skipped by nullifying Challenge[])
        return [[{ challenge: "1+1=?", type: "text/plain" }], undefined];
    });

    subplebbit.setValidateCaptchaAnswerCallback(async (challengeAnswerMessage) => {
        const challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "2";
        const challengeErrors = challengeSuccess ? undefined : ["Result of math expression is incorrect"];
        return [challengeSuccess, challengeErrors];
    });
    //@ts-ignore
    subplebbit._syncIntervalMs = syncInterval;
    await subplebbit.start();
    return subplebbit;
}

async function _startImageCaptchaSubplebbit(signers: SignerType[], syncInterval: number, dataPath: string) {
    const plebbit = await _mockPlebbit(signers, dataPath);
    const signer = await plebbit.createSigner(signers[2]);
    const subplebbit = await plebbit.createSubplebbit({ signer });

    // Image captcha are default
    //@ts-ignore
    subplebbit._syncIntervalMs = syncInterval;
    await subplebbit.start();
    subplebbit.setValidateCaptchaAnswerCallback(async (challengeAnswerMessage) => {
        const challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "1234";
        const challengeErrors = challengeSuccess ? undefined : ["User answered image captcha incorrectly"];
        return [challengeSuccess, challengeErrors];
    });
    return subplebbit;
}

async function _startEnsSubplebbit(signers: SignerType[], syncInterval: number, dataPath: string) {
    const plebbit = await _mockPlebbit(signers, dataPath);
    const signer = await plebbit.createSigner(signers[3]);
    const subplebbit = await plebbit.createSubplebbit({ signer });
    subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);
    //@ts-ignore
    subplebbit._syncIntervalMs = syncInterval;
    await subplebbit.start();
    await subplebbit.edit({ address: "plebbit.eth" });
    assert.equal(subplebbit.address, "plebbit.eth");
}

async function _publishComments(parentComments: Comment[], subplebbit: Subplebbit, numOfCommentsToPublish: number, signers: SignerType[]) {
    const comments: Comment[] = [];
    if (parentComments.length === 0)
        await Promise.all(
            new Array(numOfCommentsToPublish).fill(null).map(async () => {
                const post = await generateMockPost(subplebbit.address, subplebbit.plebbit, true, { signer: signers[0] });
                await publishWithExpectedResult(post, true);
                comments.push(post);
            })
        );
    else
        await Promise.all(
            parentComments.map(
                async (parentComment) =>
                    await Promise.all(
                        new Array(numOfCommentsToPublish).fill(null).map(async () => {
                            assert(typeof parentComment?.cid === "string");
                            const comment = await generateMockComment(parentComment, subplebbit.plebbit, true, { signer: signers[0] });
                            await publishWithExpectedResult(comment, true);
                            comments.push(<Comment>comment);
                        })
                    )
            )
        );
    return comments;
}

async function _publishVotes(comments: Comment[], subplebbit: Subplebbit, votesPerCommentToPublish: number, signers: SignerType[]) {
    const votes: Vote[] = [];
    await Promise.all(
        comments.map(async (comment) => {
            return await Promise.all(
                new Array(votesPerCommentToPublish).fill(null).map(async (_, i) => {
                    const vote: Vote = await generateMockVote(
                        comment,
                        Math.random() > 0.5 ? 1 : -1,
                        subplebbit.plebbit,
                        signers[i % signers.length]
                    );
                    await publishWithExpectedResult(vote, true);
                    votes.push(vote);
                })
            );
        })
    );

    console.log(`${votes.length} votes for ${comments.length} ${comments[0].depth === 0 ? "posts" : "replies"} have been published`);
    return votes;
}

async function _populateSubplebbit(
    subplebbit: Subplebbit,
    props: {
        signers: SignerType[];
        syncInterval: number;
        votesPerCommentToPublish: number;
        numOfCommentsToPublish: number;
    }
) {
    await subplebbit.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
    await new Promise((resolve) => subplebbit.once("update", resolve));
    const posts = await _publishComments([], subplebbit, props.numOfCommentsToPublish, props.signers); // If no comment[] is provided, we publish posts
    console.log(`Have successfully published ${posts.length} posts`);
    const [replies] = await Promise.all([
        _publishComments([posts[0]], subplebbit, props.numOfCommentsToPublish, props.signers),
        _publishVotes(posts, subplebbit, props.votesPerCommentToPublish, props.signers)
    ]);
    console.log(`Have sucessfully published ${replies.length} replies`);
    await _publishVotes(replies, subplebbit, props.votesPerCommentToPublish, props.signers);
}

export async function startSubplebbits(props: {
    signers: SignerType[];
    syncInterval: number;
    dataPath: string;
    votesPerCommentToPublish: number;
    numOfCommentsToPublish: number;
}) {
    const plebbit = await _mockPlebbit(props.signers, props.dataPath);
    const signer = await plebbit.createSigner(props.signers[0]);
    const subplebbit = await plebbit.createSubplebbit({ signer });

    subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

    //@ts-ignore
    subplebbit._syncIntervalMs = props.syncInterval;
    await subplebbit.start();
    console.time("populate");
    await Promise.all([
        _startImageCaptchaSubplebbit(props.signers, props.syncInterval, props.dataPath),
        _startMathCliSubplebbit(props.signers, props.syncInterval, props.dataPath),
        _startEnsSubplebbit(props.signers, props.syncInterval, props.dataPath),
        _populateSubplebbit(subplebbit, props)
    ]);
    console.timeEnd("populate");

    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");
}

export async function mockPlebbit(dataPath?: string) {
    const plebbit = await PlebbitIndex({
        ipfsHttpClientOptions: "http://localhost:15001/api/v0",
        pubsubHttpClientOptions: `http://localhost:15002/api/v0`,
        dataPath
    });

    plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
        if (authorAddress === "plebbit.eth") return "12D3KooWJJcSwMHrFvsFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // signers[6].address
        else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
        return authorAddress;
    };

    plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subAddress) => {
        if (subAddress === "plebbit.eth") return "12D3KooWNMYPSuNadceoKsJ6oUQcxGcfiAsHNpVTt1RQ1zSrKKpo"; // signers[3].address
        else if (subAddress === "testgibbreish.eth") throw new Error(`Domain (${subAddress}) has no subplebbit-address`);
        return subAddress;
    };
    return plebbit;
}

export async function publishRandomReply(
    parentComment: Comment,
    plebbit: Plebbit,
    commentProps: Partial<CreateCommentOptions>,
    verifyCommentPropsInParentPages = true
): Promise<Comment> {
    const reply = await generateMockComment(parentComment, plebbit, false, {
        content: `Content ${Math.random() * Math.random() * Math.random()}`,
        ...commentProps
    });
    await publishWithExpectedResult(reply, true);
    if (verifyCommentPropsInParentPages) await waitTillCommentIsInParentPages(reply, plebbit);
    return reply;
}

export async function publishRandomPost(
    subplebbitAddress: string,
    plebbit: Plebbit,
    postProps?: Partial<PostType>,
    verifyCommentPropsInParentPages = true
) {
    const post = await generateMockPost(subplebbitAddress, plebbit, false, {
        content: `Random post Content ${Math.random() * Math.random() * Math.random()}`,
        title: `Random post Title ${Math.random() * Math.random() * Math.random()}`,
        ...postProps
    });
    await publishWithExpectedResult(post, true);
    if (verifyCommentPropsInParentPages) await waitTillCommentIsInParentPages(post, plebbit);
    return post;
}

export async function publishVote(commentCid: string, vote: 1 | 0 | -1, plebbit: Plebbit, voteProps?: Partial<VoteType>) {
    const comment = await plebbit.getComment(commentCid);
    const voteObj = await plebbit.createVote({
        commentCid,
        vote,
        subplebbitAddress: comment.subplebbitAddress,
        signer: voteProps?.signer || (await plebbit.createSigner()),
        ...voteProps
    });
    await publishWithExpectedResult(voteObj, true);
}

export async function publishWithExpectedResult(publication: Publication, expectedChallengeSuccess: boolean, expectedReason?: string) {
    let receivedResponse = false;
    await publication.publish();
    await new Promise((resolve, reject) => {
        publication.once("challengeverification", (verificationMsg) => {
            receivedResponse = true;
            if (verificationMsg.challengeSuccess !== expectedChallengeSuccess) {
                const msg = `Expected challengeSuccess to be (${expectedChallengeSuccess}) and got (${verificationMsg.challengeSuccess}). Reason (${verificationMsg.reason})`;
                console.error(msg);
                reject(msg);
            } else if (expectedReason && expectedReason !== verificationMsg.reason) {
                const msg = `Expected reason to be (${expectedReason}) and got (${verificationMsg.reason})`;
                console.error(msg);
                reject(msg);
            } else resolve(1);
        });
        // Retry after 10 seconds if we haven't received a response
        setTimeout(() => !receivedResponse && publication.publish(), 10000);
    });
}

export async function findCommentInPage(commentCid: string, pageCid: string, pages: Pages) {
    const commentPages = await loadAllPages(pageCid, pages);
    return commentPages.find((c) => c.cid === commentCid);
}

export async function waitTillCommentIsInParentPages(
    comment: Comment,
    plebbit: Plebbit,
    propsToCheckFor: Partial<CreateCommentOptions> = {},
    checkInAllPages = false
) {
    const parent =
        comment.depth === 0 ? await plebbit.getSubplebbit(comment.subplebbitAddress) : await plebbit.getComment(comment.parentCid);
    //@ts-ignore
    parent._updateIntervalMs = 200;
    await parent.update();
    const pagesInstance = () => (parent instanceof Subplebbit ? parent.posts : parent.replies);
    let commentInPage: Comment;
    await waitUntil(
        async () => {
            const repliesPageCid = parent instanceof Comment ? parent.replies?.pageCids?.topAll : parent.posts?.pageCids?.new;
            if (repliesPageCid) commentInPage = await findCommentInPage(comment.cid, repliesPageCid, pagesInstance());
            return Boolean(commentInPage);
        },
        {
            timeout: 200000
        }
    );

    await parent.stop();

    const pageCids = parent instanceof Comment ? parent.replies.pageCids : parent.posts.pageCids;

    if (checkInAllPages)
        for (const pageCid of Object.values(pageCids)) {
            const commentInPage = await findCommentInPage(comment.cid, pageCid, pagesInstance());
            for (const [key, value] of Object.entries(propsToCheckFor))
                if (deterministicStringify(commentInPage[key]) !== deterministicStringify(value))
                    throw Error(`commentInPage[${key}] is incorrect`);
        }
    else
        for (const [key, value] of Object.entries(propsToCheckFor))
            if (deterministicStringify(commentInPage[key]) !== deterministicStringify(value))
                throw Error(`commentInPage[${key}] is incorrect`);
}

export async function createMockSub(props: CreateSubplebbitOptions, plebbit: Plebbit, syncInterval = 300) {
    const sub = await plebbit.createSubplebbit(props);
    //@ts-ignore
    sub._syncIntervalMs = sub._updateIntervalMs = syncInterval;
    sub.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);
    return sub;
}
