import { TIMEFRAMES_TO_SECONDS, timestamp } from "../util";
import { Signer, verifyPublication } from "../signer";
import { Comment } from "../comment";
import Post from "../post";
import assert from "assert";
import { Plebbit } from "../plebbit";
import PlebbitIndex from "../index";
import Vote from "../vote";
import { Pages } from "../pages";
import { Subplebbit } from "../subplebbit";
import { CommentType, SignerType } from "../types";
import errcode from "err-code";
import { codes, messages } from "../errors";

function generateRandomTimestamp(parentTimestamp?: number): number {
    const [lowerLimit, upperLimit] = [parentTimestamp || 0, timestamp()];

    let randomTimestamp;
    while (!randomTimestamp) {
        const randomTimeframeIndex = (Object.keys(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        const tempTimestamp = lowerLimit + Object.values(TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (tempTimestamp >= lowerLimit && tempTimestamp <= upperLimit) randomTimestamp = tempTimestamp;
    }

    return randomTimestamp;
}

export async function generateMockPost(
    subplebbitAddress: string,
    plebbit: Plebbit,
    signer?: Signer,
    randomTimestamp = false,
    postProps = {}
) {
    const postTimestamp = (randomTimestamp && generateRandomTimestamp()) || timestamp();
    const postStartTestTime = Date.now() / 1000 + Math.random();
    signer = signer || (await plebbit.createSigner());
    const post = await plebbit.createComment({
        author: { displayName: `Mock Author - ${postStartTestTime}` },
        signer: signer,
        title: `Mock Post - ${postStartTestTime}`,
        content: `Mock content - ${postStartTestTime}`,
        timestamp: postTimestamp,
        subplebbitAddress: subplebbitAddress,
        ...postProps
    });
    assert.equal(post.constructor.name, "Post", "createComment should return Post if title is provided");
    post.once("challenge", (challengeMsg) => {
        post.publishChallengeAnswers([]);
    });

    const [validSignature, failedVerificationReason] = await verifyPublication(post, plebbit, post.getType());
    if (!validSignature)
        throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
            details: `generateMockPost: Failed verification reason: ${failedVerificationReason}`
        });
    return post;
}

export async function generateMockComment(
    parentPostOrComment: Post | Comment,
    plebbit: Plebbit,
    signer?: Signer,
    randomTimestamp = false,
    commentProps = {}
): Promise<Comment> {
    assert(parentPostOrComment, "Need to have parentComment defined to generate mock comment");
    const commentTimestamp = (randomTimestamp && generateRandomTimestamp(parentPostOrComment.timestamp)) || timestamp();
    const commentTime = Date.now() / 1000 + Math.random();
    signer = signer || (await plebbit.createSigner());
    const comment: Comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        parentCid: parentPostOrComment.cid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress,
        timestamp: commentTimestamp,
        ...commentProps
    });
    comment.once("challenge", (challengeMsg) => {
        comment.publishChallengeAnswers([]);
    });
    const [validSignature, failedVerificationReason] = await verifyPublication(comment, plebbit, comment.getType());
    if (!validSignature)
        throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
            details: `generateMockComment: Failed verification reason: ${failedVerificationReason}`
        });
    return comment;
}

export async function generateMockVote(
    parentPostOrComment: Comment | Post,
    vote: -1 | 0 | 1,
    plebbit: Plebbit,
    signer?: Signer
): Promise<Vote> {
    const voteTime = Date.now() / 1000;
    const commentCid = parentPostOrComment.cid || parentPostOrComment.postCid;
    assert(typeof commentCid === "string");

    signer = signer || (await plebbit.createSigner());
    const voteObj = await plebbit.createVote({
        author: { displayName: `Mock Author - ${voteTime}` },
        signer: signer,
        commentCid: commentCid,
        vote: vote,
        subplebbitAddress: parentPostOrComment.subplebbitAddress
    });
    voteObj.once("challenge", (challengeMsg) => {
        voteObj.publishChallengeAnswers([]);
    });

    const [validSignature, failedVerificationReason] = await verifyPublication(voteObj, plebbit, voteObj.getType());
    if (!validSignature)
        throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
            details: `generateMockVote: Failed verification reason: ${failedVerificationReason}`
        });
    return voteObj;
}

export async function loadAllPages(pageCid: string, pagesInstance: Pages): Promise<Comment[]> {
    assert(typeof pageCid === "string");
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments: Comment[] | CommentType[] = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    sortedComments = await Promise.all(
        sortedComments.map(async (commentProps) => pagesInstance.subplebbit.plebbit.createComment(commentProps))
    );
    return <Comment[]>sortedComments;
}

export async function getAllCommentsUnderSubplebbit(subplebbit: Subplebbit): Promise<Comment[]> {
    const getChildrenComments = async (comment: Comment): Promise<Comment[]> => {
        return [
            await subplebbit.plebbit.createComment(comment),
            ...(await Promise.all(comment.replies?.pages?.topAll?.comments?.map(getChildrenComments) || [])).flat()
        ];
    };

    return (await Promise.all(subplebbit.posts?.pages.hot?.comments.map(getChildrenComments) || [])).flat();
}

async function _mockPlebbit(signers: SignerType[]) {
    const plebbit = await PlebbitIndex({
        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
        pubsubHttpClientOptions: `http://localhost:5002/api/v0`
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

async function _startMathCliSubplebbit(signers: SignerType[], database: any, syncInterval: number) {
    const plebbit = await _mockPlebbit(signers);
    const signer = await plebbit.createSigner(signers[1]);
    const subplebbit = await plebbit.createSubplebbit({ signer, database });
    subplebbit.setProvideCaptchaCallback(async (challengeRequestMessage) => {
        // Expected return is:
        // Challenge[], reason for skipping captcha (if it's skipped by nullifying Challenge[])
        return [[{ challenge: "1+1=?", type: "text" }], undefined];
    });

    subplebbit.setValidateCaptchaAnswerCallback(async (challengeAnswerMessage) => {
        const challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "2";
        const challengeErrors = challengeSuccess ? undefined : ["Result of math expression is incorrect"];
        return [challengeSuccess, challengeErrors];
    });
    await subplebbit.start(syncInterval);
    return subplebbit;
}

async function _startImageCaptchaSubplebbit(signers: SignerType[], database: any, syncInterval: number) {
    const plebbit = await _mockPlebbit(signers);
    const signer = await plebbit.createSigner(signers[2]);
    const subplebbit = await plebbit.createSubplebbit({ signer, database });

    // Image captcha are default
    await subplebbit.start(syncInterval);
    subplebbit.setValidateCaptchaAnswerCallback(async (challengeAnswerMessage) => {
        const challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "1234";
        const challengeErrors = challengeSuccess ? undefined : ["User answered image captcha incorrectly"];
        return [challengeSuccess, challengeErrors];
    });
    return subplebbit;
}

async function _startEnsSubplebbit(signers: SignerType[], database: any, syncInterval: number) {
    const plebbit = await _mockPlebbit(signers);
    const signer = await plebbit.createSigner(signers[3]);
    const subplebbit = await plebbit.createSubplebbit({ signer, database });
    await subplebbit.start(syncInterval);
    await subplebbit.edit({ address: "plebbit.eth" });
}

async function _publishComments(parentComments: Comment[], subplebbit: Subplebbit, numOfCommentsToPublish: number, signers: SignerType[]) {
    const comments: Comment[] = [];
    if (parentComments.length === 0)
        await Promise.all(
            new Array(numOfCommentsToPublish).fill(null).map(async () => {
                const post = await subplebbit._addPublicationToDb(
                    await generateMockPost(subplebbit.address, subplebbit.plebbit, signers[0], true)
                );
                if (post) comments.push(<Post>post); // There are cases where posts fail to get published
            })
        );
    else
        await Promise.all(
            parentComments.map(
                async (parentComment) =>
                    await Promise.all(
                        new Array(numOfCommentsToPublish).fill(null).map(async () => {
                            const comment = await subplebbit._addPublicationToDb(
                                await generateMockComment(parentComment, subplebbit.plebbit, signers[0], true)
                            );
                            if (comment) comments.push(<Comment>comment);
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
                    let vote: Vote = await generateMockVote(
                        comment,
                        Math.random() > 0.5 ? 1 : -1,
                        subplebbit.plebbit,
                        signers[i % signers.length]
                    );
                    vote = <Vote>await subplebbit._addPublicationToDb(vote);
                    if (vote) votes.push(vote);
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
        database: any;
        votesPerCommentToPublish: number;
        numOfCommentsToPublish: number;
    }
) {
    assert(props.signers[1].address && props.signers[2].address && props.signers[3].address);
    await subplebbit.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
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
    database: any;
    votesPerCommentToPublish: number;
    numOfCommentsToPublish: number;
}) {
    const plebbit = await _mockPlebbit(props.signers);

    const signer = await plebbit.createSigner(props.signers[0]);
    const subplebbit = await plebbit.createSubplebbit({ signer, database: props.database });
    subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

    await subplebbit.start(props.syncInterval);
    console.time("populate");
    const [imageSubplebbit, mathSubplebbit] = await Promise.all([
        _startImageCaptchaSubplebbit(props.signers, props.database, props.syncInterval),
        _startMathCliSubplebbit(props.signers, props.database, props.syncInterval),
        _startEnsSubplebbit(props.signers, props.database, props.syncInterval),
        _populateSubplebbit(subplebbit, props)
    ]);
    console.timeEnd("populate");

    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");
}
