import PlebbitIndex from "../index.js";
import { removeUndefinedValuesRecursively, timestamp } from "../util.js";
import assert from "assert";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { v4 as uuidv4 } from "uuid";
import { createMockPubsubClient } from "./mock-ipfs-client.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import pTimeout from "p-timeout";
import { signComment, _signJson, signCommentEdit, cleanUpBeforePublishing, _signPubsubMsg, signChallengeVerification, signSubplebbit } from "../signer/signatures.js";
import { findCommentInPageInstance, findCommentInPageInstanceRecursively, mapPageIpfsCommentToPageJsonComment, TIMEFRAMES_TO_SECONDS } from "../pages/util.js";
import { importSignerIntoKuboNode } from "../runtime/node/util.js";
import { getIpfsKeyFromPrivateKey } from "../signer/util.js";
import { Buffer } from "buffer";
import { encryptEd25519AesGcm, encryptEd25519AesGcmPublicKeyBuffer } from "../signer/encryption.js";
import env from "../version.js";
import { PlebbitError } from "../plebbit-error.js";
function generateRandomTimestamp(parentTimestamp) {
    const [lowerLimit, upperLimit] = [typeof parentTimestamp === "number" && parentTimestamp > 2 ? parentTimestamp : 2, timestamp()];
    let randomTimestamp = -1;
    while (randomTimestamp === -1) {
        const randomTimeframeIndex = (remeda.keys.strict(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        const tempTimestamp = lowerLimit + Object.values(TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (tempTimestamp >= lowerLimit && tempTimestamp <= upperLimit)
            randomTimestamp = tempTimestamp;
    }
    return randomTimestamp;
}
export async function generateMockPost(subplebbitAddress, plebbit, randomTimestamp = false, postProps = {}) {
    const postTimestamp = (randomTimestamp && generateRandomTimestamp()) || timestamp();
    const postStartTestTime = Date.now() / 1000 + Math.random();
    const signer = postProps?.signer || (await plebbit.createSigner());
    const baseProps = {
        subplebbitAddress,
        author: { displayName: `Mock Author - ${postStartTestTime}` },
        title: `Mock Post - ${postStartTestTime}`,
        content: `Mock content - ${postStartTestTime}`,
        signer,
        timestamp: postTimestamp
    };
    const finalPostProps = remeda.mergeDeep(baseProps, postProps);
    const post = await plebbit.createComment(finalPostProps);
    return post;
}
// TODO rework this
export async function generateMockComment(parentPostOrComment, plebbit, randomTimestamp = false, commentProps = {}) {
    const commentTimestamp = (randomTimestamp && generateRandomTimestamp(parentPostOrComment.timestamp)) || timestamp();
    const commentTime = Date.now() / 1000 + Math.random();
    const signer = commentProps?.signer || (await plebbit.createSigner());
    const comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        parentCid: parentPostOrComment.cid,
        postCid: parentPostOrComment.postCid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress,
        timestamp: commentTimestamp,
        ...commentProps
    });
    return comment;
}
export async function generateMockVote(parentPostOrComment, vote, plebbit, signer) {
    const voteTime = Date.now() / 1000;
    const commentCid = parentPostOrComment.cid;
    if (typeof commentCid !== "string")
        throw Error(`generateMockVote: commentCid (${commentCid}) is not a valid CID`);
    signer = signer || (await plebbit.createSigner());
    const voteObj = await plebbit.createVote({
        author: { displayName: `Mock Author - ${voteTime}` },
        signer: signer,
        commentCid,
        vote,
        subplebbitAddress: parentPostOrComment.subplebbitAddress
    });
    return voteObj;
}
export async function loadAllPages(pageCid, pagesInstance) {
    if (!pageCid)
        throw Error("Can't load all pages with undefined pageCid");
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}
export async function loadAllPagesBySortName(pageSortName, pagesInstance) {
    if (!pageSortName)
        throw Error("Can't load all pages with undefined pageSortName");
    if (Object.keys(pagesInstance.pageCids).length === 0 && pagesInstance.pages[pageSortName])
        return pagesInstance.pages[pageSortName].comments;
    let sortedCommentsPage = pagesInstance.pages[pageSortName] || (await pagesInstance.getPage(pagesInstance.pageCids[pageSortName]));
    let sortedComments = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}
export async function loadAllUniquePostsUnderSubplebbit(subplebbit) {
    if (Object.keys(subplebbit.posts.pageCids).length === 0 && Object.keys(subplebbit.posts.pages).length === 0)
        throw Error("Page instance has no comments under it");
    const allCommentsInPreloadedPages = Object.keys(subplebbit.posts.pageCids).length === 0 && Object.keys(subplebbit.posts.pages).length > 0;
    if (allCommentsInPreloadedPages) {
        const allComments = subplebbit.posts.pages.hot?.comments;
        if (!allComments)
            throw Error("No comments found under subplebbit.posts.pages.hot");
        return allComments;
    }
    else {
        // we have multiple pages, need to load all pages and merge them
        return loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
    }
}
export async function loadAllUniqueCommentsUnderCommentInstance(comment) {
    if (Object.keys(comment.replies.pageCids).length === 0 && Object.keys(comment.replies.pages).length === 0)
        throw Error("Comment replies instance has no comments under it");
    const allCommentsInPreloadedPages = Object.keys(comment.replies.pageCids).length === 0 && Object.keys(comment.replies.pages).length > 0;
    if (allCommentsInPreloadedPages) {
        const allComments = comment.replies.pages.best?.comments;
        if (!allComments)
            throw Error("No comments found under comment.replies.pages.best");
        return allComments;
    }
    else {
        // we have multiple pages, need to load all pages and merge them
        return loadAllPages(comment.replies.pageCids.new, comment.replies);
    }
}
async function _mockSubplebbitPlebbit(signer, plebbitOptions) {
    const plebbit = await mockPlebbit({ ...plebbitOptions, pubsubKuboRpcClientsOptions: ["http://localhost:15002/api/v0"] }, true);
    return plebbit;
}
async function _startMathCliSubplebbit(signer, plebbit) {
    const subplebbit = await plebbit.createSubplebbit({ signer });
    await subplebbit.edit({ settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] } });
    await subplebbit.start();
    return subplebbit;
}
async function _startEnsSubplebbit(signers, plebbit) {
    const signer = await plebbit.createSigner(signers[3]);
    const subplebbit = await createSubWithNoChallenge({ signer }, plebbit);
    await subplebbit.edit({
        roles: {
            [signers[1].address]: { role: "owner" },
            [signers[2].address]: { role: "admin" },
            [signers[3].address]: { role: "moderator" }
        }
    });
    await subplebbit.start();
    await subplebbit.edit({ address: "plebbit.eth" });
    assert.equal(subplebbit.address, "plebbit.eth");
    return subplebbit;
}
async function _publishPosts(subplebbitAddress, numOfPosts, plebbit) {
    return Promise.all(new Array(numOfPosts).fill(null).map(() => publishRandomPost(subplebbitAddress, plebbit, {})));
}
async function _publishReplies(parentComment, numOfReplies, plebbit) {
    return Promise.all(new Array(numOfReplies).fill(null).map(() => publishRandomReply(parentComment, plebbit, {})));
}
async function _publishVotesOnOneComment(comment, votesPerCommentToPublish, plebbit) {
    return Promise.all(new Array(votesPerCommentToPublish)
        .fill(null)
        .map(() => publishVote(comment.cid, comment.subplebbitAddress, Math.random() > 0.5 ? 1 : -1, plebbit, {})));
}
async function _publishVotes(comments, votesPerCommentToPublish, plebbit) {
    const votes = remeda.flattenDeep(await Promise.all(comments.map((comment) => _publishVotesOnOneComment(comment, votesPerCommentToPublish, plebbit))));
    assert.equal(votes.length, votesPerCommentToPublish * comments.length);
    console.log(`${votes.length} votes for ${comments.length} ${comments[0].depth === 0 ? "posts" : "replies"} have been published`);
    return votes;
}
async function _populateSubplebbit(subplebbit, props) {
    await subplebbit.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
    if (props.numOfPostsToPublish === 0)
        return;
    await new Promise((resolve) => subplebbit.once("update", resolve));
    const posts = await _publishPosts(subplebbit.address, props.numOfPostsToPublish, subplebbit._plebbit); // If no comment[] is provided, we publish posts
    console.log(`Have successfully published ${posts.length} posts`);
    const replies = await _publishReplies(posts[0], props.numOfCommentsToPublish, subplebbit._plebbit);
    console.log(`Have sucessfully published ${replies.length} replies`);
    const postVotes = await _publishVotes(posts, props.votesPerCommentToPublish, subplebbit._plebbit);
    console.log(`Have sucessfully published ${postVotes.length} votes on ${posts.length} posts`);
    const repliesVotes = await _publishVotes(replies, props.votesPerCommentToPublish, subplebbit._plebbit);
    console.log(`Have successfully published ${repliesVotes.length} votes on ${replies.length} replies`);
}
export async function startOnlineSubplebbit() {
    const onlinePlebbit = await createOnlinePlebbit();
    const onlineSub = await onlinePlebbit.createSubplebbit(); // Will create a new sub that is on the ipfs network
    await onlineSub.edit({ settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] } });
    await onlineSub.start();
    await new Promise((resolve) => onlineSub.once("update", resolve));
    console.log("Online sub is online on address", onlineSub.address);
    return onlineSub;
}
export async function startSubplebbits(props) {
    const plebbit = await _mockSubplebbitPlebbit(props.signers, {
        ...remeda.pick(props, ["noData", "dataPath"]),
        publishInterval: 1000,
        updateInterval: 1000
    });
    const mainSub = await createSubWithNoChallenge({ signer: props.signers[0] }, plebbit); // most publications will be on this sub
    await mainSub.start();
    const mathSub = await _startMathCliSubplebbit(props.signers[1], plebbit);
    const ensSub = await _startEnsSubplebbit(props.signers, plebbit);
    console.time("populate");
    await _populateSubplebbit(mainSub, props);
    console.timeEnd("populate");
    let onlineSub;
    if (props.startOnlineSub)
        onlineSub = await startOnlineSubplebbit();
    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");
    const subWithNoResponse = await createSubWithNoChallenge({ signer: props.signers[4] }, plebbit);
    await subWithNoResponse.start();
    await new Promise((resolve) => subWithNoResponse.once("update", resolve));
    await subWithNoResponse.stop();
    const plebbitNoMockedSub = await mockPlebbit({ kuboRpcClientsOptions: ["http://localhost:15002/api/v0"], pubsubKuboRpcClientsOptions: ["http://localhost:15002/api/v0"] }, false, true, true);
    const mathCliSubWithNoMockedPubsub = await _startMathCliSubplebbit(props.signers[5], plebbitNoMockedSub);
    await new Promise((resolve) => mathCliSubWithNoMockedPubsub.once("update", resolve));
    return {
        onlineSub: onlineSub?.address,
        mathSub: mathSub.address,
        ensSub: ensSub.address,
        mainSub: mainSub.address,
        NoPubsubResponseSub: subWithNoResponse.address,
        mathCliSubWithNoMockedPubsub: mathCliSubWithNoMockedPubsub.address
    };
}
export async function fetchTestServerSubs() {
    const res = await fetch("http://localhost:14953");
    const resWithType = await res.json();
    return resWithType;
}
export function mockDefaultOptionsForNodeAndBrowserTests() {
    const shouldUseRPC = isRpcFlagOn();
    if (shouldUseRPC)
        return { plebbitRpcClientsOptions: ["ws://localhost:39652"], httpRoutersOptions: [] };
    else
        return {
            kuboRpcClientsOptions: ["http://localhost:15001/api/v0"],
            pubsubKuboRpcClientsOptions: [
                `http://localhost:15002/api/v0`,
                `http://localhost:42234/api/v0`,
                `http://localhost:42254/api/v0`
            ],
            httpRoutersOptions: []
        };
}
export async function mockPlebbitV2({ plebbitOptions, forceMockPubsub, stubStorage, mockResolve, remotePlebbit } = {}) {
    if (remotePlebbit)
        plebbitOptions = { dataPath: undefined, ...plebbitOptions };
    const plebbit = await mockPlebbit(plebbitOptions, forceMockPubsub, stubStorage, mockResolve);
    return plebbit;
}
export async function mockPlebbit(plebbitOptions, forceMockPubsub = false, stubStorage = true, mockResolve = true) {
    const log = Logger("plebbit-js:test-util:mockPlebbit");
    const mockEthResolver = `https://mockEthRpc${uuidv4()}.com`;
    const plebbit = await PlebbitIndex({
        ...mockDefaultOptionsForNodeAndBrowserTests(),
        resolveAuthorAddresses: true,
        publishInterval: 1000,
        validatePages: false,
        updateInterval: 500,
        chainProviders: { eth: { urls: [mockEthResolver], chainId: 1 } },
        ...plebbitOptions
    });
    if (mockResolve) {
        const mockedViemClient = {
            //@ts-expect-error
            getEnsText: async ({ name, key }) => {
                console.log(`Attempting to mock resolve address (${name}) textRecord (${key}) chainProviderUrl (${mockEthResolver})`);
                if (name === "plebbit.eth" && key === "subplebbit-address")
                    return "12D3KooWNMYPSuNadceoKsJ6oUQcxGcfiAsHNpVTt1RQ1zSrKKpo"; // signers[3]
                else if (name === "plebbit.eth" && key === "plebbit-author-address")
                    return "12D3KooWJJcSwMHrFvsFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // signers[6]
                else if (name === "rpc-edit-test.eth" && key === "subplebbit-address")
                    return "12D3KooWMZPQsQdYtrakc4D1XtzGXwN1X3DBnAobcCjcPYYXTB6o"; // signers[7]
                else if (name === "different-signer.eth" && key === "subplebbit-address")
                    return (await plebbit.createSigner()).address;
                else if (name === "estebanabaroa.eth" && key === "plebbit-author-address")
                    return "12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z";
                else
                    return null;
            }
        };
        plebbit._domainResolver._createViemClientIfNeeded = () => mockedViemClient;
    }
    if (stubStorage) {
        plebbit._storage.getItem = async () => undefined;
        plebbit._storage.setItem = async () => undefined;
    }
    // TODO should have multiple pubsub providers here to emulate a real browser/mobile environment
    if (!plebbitOptions?.pubsubKuboRpcClientsOptions || forceMockPubsub)
        for (const pubsubUrl of remeda.keys.strict(plebbit.clients.pubsubKuboRpcClients))
            plebbit.clients.pubsubKuboRpcClients[pubsubUrl]._client = createMockPubsubClient();
    plebbit.on("error", (e) => {
        log.error("Plebbit error", e);
    });
    return plebbit;
}
// name should be changed to mockBrowserPlebbit
export async function mockRemotePlebbit(opts) {
    // Mock browser environment
    const plebbit = await mockPlebbitV2({ ...opts, plebbitOptions: { dataPath: undefined, ...opts?.plebbitOptions } });
    plebbit._canCreateNewLocalSub = () => false;
    return plebbit;
}
export async function createOnlinePlebbit(plebbitOptions) {
    const plebbit = await PlebbitIndex({
        kuboRpcClientsOptions: ["http://localhost:15003/api/v0"],
        pubsubKuboRpcClientsOptions: ["http://localhost:15003/api/v0"],
        ...plebbitOptions
    }); // use online ipfs node
    return plebbit;
}
export async function mockPlebbitNoDataPathWithOnlyKuboClient(opts) {
    const plebbit = await mockPlebbitV2({
        ...opts,
        plebbitOptions: {
            kuboRpcClientsOptions: ["http://localhost:15001/api/v0"],
            plebbitRpcClientsOptions: undefined,
            dataPath: undefined,
            ...opts?.plebbitOptions
        }
    });
    return plebbit;
}
export async function mockRpcServerPlebbit(plebbitOptions) {
    const plebbit = await mockPlebbitV2({
        plebbitOptions,
        mockResolve: true,
        forceMockPubsub: true,
        remotePlebbit: false,
        stubStorage: true // we want storage to force new resolve-subplebbit-address states
    });
    plebbit.removeAllListeners("error"); // for rpc server, we want to test the error handling
    return plebbit;
}
export async function mockRpcRemotePlebbit(opts) {
    if (!isRpcFlagOn())
        throw Error("This function should only be used when the rpc flag is on");
    // This instance will connect to an rpc server that has no local subs
    const plebbit = await mockPlebbitV2({
        ...opts,
        plebbitOptions: {
            plebbitRpcClientsOptions: ["ws://localhost:39653"],
            dataPath: undefined,
            ...opts?.plebbitOptions
        }
    });
    return plebbit;
}
export async function mockRPCLocalPlebbit(plebbitOptions) {
    if (!isRpcFlagOn())
        throw Error("This function should only be used when the rpc flag is on");
    // This instance will connect to an rpc server that local subs
    return mockPlebbit({ plebbitRpcClientsOptions: ["ws://localhost:39652"], ...plebbitOptions });
}
export async function mockGatewayPlebbit(opts) {
    // Keep only pubsub and gateway
    const plebbit = await mockPlebbitV2({
        ...opts,
        plebbitOptions: {
            ipfsGatewayUrls: ["http://localhost:18080"],
            plebbitRpcClientsOptions: undefined,
            kuboRpcClientsOptions: undefined,
            pubsubKuboRpcClientsOptions: undefined,
            libp2pJsClientOptions: undefined,
            ...opts?.plebbitOptions
        },
        remotePlebbit: true
    });
    return plebbit;
}
export async function publishRandomReply(parentComment, plebbit, commentProps) {
    const reply = await generateMockComment(parentComment, plebbit, false, {
        content: `Content ${uuidv4()}`,
        ...commentProps
    });
    await publishWithExpectedResult(reply, true);
    return reply;
}
export async function publishRandomPost(subplebbitAddress, plebbit, postProps) {
    const post = await generateMockPost(subplebbitAddress, plebbit, false, {
        content: `Random post Content ${uuidv4()}`,
        title: `Random post Title ${uuidv4()}`,
        ...postProps
    });
    await publishWithExpectedResult(post, true);
    return post;
}
export async function publishVote(commentCid, subplebbitAddress, vote, plebbit, voteProps) {
    const voteObj = await plebbit.createVote({
        commentCid,
        vote,
        subplebbitAddress,
        signer: voteProps?.signer || (await plebbit.createSigner()),
        ...voteProps
    });
    await publishWithExpectedResult(voteObj, true);
    return voteObj;
}
export async function publishWithExpectedResult(publication, expectedChallengeSuccess, expectedReason) {
    const challengeVerificationPromise = new Promise((resolve, reject) => {
        publication.once("challengeverification", (verificationMsg) => {
            if (verificationMsg.challengeSuccess !== expectedChallengeSuccess) {
                const msg = `Expected challengeSuccess to be (${expectedChallengeSuccess}) and got (${verificationMsg.challengeSuccess}). Reason (${verificationMsg.reason}): ${JSON.stringify(remeda.omit(verificationMsg, ["encrypted", "signature", "challengeRequestId"]))}`;
                reject(msg);
            }
            else if (expectedReason && expectedReason !== verificationMsg.reason) {
                const msg = `Expected reason to be (${expectedReason}) and got (${verificationMsg.reason}): ${JSON.stringify(remeda.omit(verificationMsg, ["encrypted", "signature", "challengeRequestId"]))}`;
                reject(msg);
            }
            else
                resolve(1);
        });
    });
    const error = new Error("Publication did not receive response");
    //@ts-expect-error
    error.details = {
        publication,
        expectedChallengeSuccess,
        expectedReason,
        waitTime: 90000
    };
    const validateResponsePromise = pTimeout(challengeVerificationPromise, {
        milliseconds: 90000,
        message: error
    });
    publication.once("challenge", (challenge) => publication.listenerCount("challenge") === 0 &&
        console.error("Received challenges in publishWithExpectedResult with no handler. Are you sure you're publishing to a sub with no challenges?", challenge));
    await publication.publish();
    try {
        await validateResponsePromise;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
export async function iterateThroughPageCidToFindComment(commentCid, pageCid, pages) {
    if (!commentCid)
        throw Error("Can't find comment with undefined commentCid");
    if (!pageCid)
        throw Error("Can't find comment with undefined pageCid");
    let currentPageCid = remeda.clone(pageCid);
    while (currentPageCid) {
        const loadedPage = await pages.getPage(currentPageCid);
        const commentInPage = loadedPage.comments.find((c) => c.cid === commentCid);
        if (commentInPage)
            return commentInPage;
        currentPageCid = loadedPage.nextCid;
    }
    return undefined;
}
export async function waitTillPostInSubplebbitInstancePages(post, sub) {
    const isPostInSubPages = async () => {
        if (Object.keys(sub.posts.pageCids).length === 0 && Object.keys(sub.posts.pages).length > 0) {
            // it's a single preloaded page
            const postInPage = findCommentInPageInstanceRecursively(sub.posts, post.cid);
            return Boolean(postInPage);
        }
        else if (Object.keys(sub.posts.pageCids).length > 0) {
            const postsNewPageCid = sub.posts.pageCids.new;
            const postInPage = await iterateThroughPageCidToFindComment(post.cid, postsNewPageCid, sub.posts);
            return Boolean(postInPage);
        }
        else
            return false;
    };
    if (sub.state === "stopped")
        await sub.update();
    await resolveWhenConditionIsTrue(sub, isPostInSubPages);
}
export async function waitTillPostInSubplebbitPages(post, plebbit) {
    const sub = await plebbit.getSubplebbit(post.subplebbitAddress);
    await sub.update();
    await waitTillPostInSubplebbitInstancePages(post, sub);
    await sub.stop();
}
export async function iterateThroughPagesToFindCommentInParentPagesInstance(commentCid, pages) {
    const preloadedPage = Object.keys(pages.pages)[0];
    const commentInPage = findCommentInPageInstance(pages, commentCid);
    if (commentInPage)
        return mapPageIpfsCommentToPageJsonComment(commentInPage);
    if (pages.pages[preloadedPage]?.nextCid) {
        // means we have multiple pages
        return iterateThroughPageCidToFindComment(commentCid, pages.pageCids.new, pages);
    }
    return undefined;
}
export async function waitTillReplyInParentPagesInstance(reply, parentComment) {
    const isReplyInParentPages = async () => {
        console.log("waitTillReplyInParentPagesInstance", parentComment.cid, "replyCount", parentComment.replyCount);
        if (Object.keys(parentComment.replies.pageCids).length === 0) {
            // it's a single preloaded page
            const postInPage = findCommentInPageInstanceRecursively(parentComment.replies, reply.cid);
            return Boolean(postInPage);
        }
        else {
            if (!("new" in parentComment.replies.pageCids)) {
                console.error("no new page", "parentComment.replies.pageCids", parentComment.replies.pageCids);
                return false;
            }
            const commentNewPageCid = parentComment.replies.pageCids.new;
            const replyInPage = await iterateThroughPageCidToFindComment(reply.cid, commentNewPageCid, parentComment.replies);
            return Boolean(replyInPage);
        }
    };
    await resolveWhenConditionIsTrue(parentComment, isReplyInParentPages);
}
export async function waitTillReplyInParentPages(reply, plebbit) {
    const parentComment = await plebbit.createComment({ cid: reply.parentCid });
    await parentComment.update();
    await waitTillReplyInParentPagesInstance(reply, parentComment);
    await parentComment.stop();
}
export async function createSubWithNoChallenge(props, plebbit) {
    const sub = await plebbit.createSubplebbit(props);
    await sub.edit({ settings: { challenges: [] } }); // No challenge
    return sub;
}
export async function generatePostToAnswerMathQuestion(props, plebbit) {
    const mockPost = await generateMockPost(props.subplebbitAddress, plebbit, false, props);
    mockPost.removeAllListeners("challenge");
    mockPost.once("challenge", (challengeMessage) => {
        mockPost.publishChallengeAnswers(["2"]);
    });
    return mockPost;
}
export function isRpcFlagOn() {
    const isPartOfProcessEnv = globalThis?.["process"]?.env?.["USE_RPC"] === "1";
    // const isPartOfKarmaArgs = globalThis?.["__karma__"]?.config?.config?.["USE_RPC"] === "1";
    return isPartOfProcessEnv;
}
export function isRunningInBrowser() {
    return Boolean(globalThis["window"]);
}
export async function resolveWhenConditionIsTrue(toUpdate, predicate, eventName = "update") {
    // should add a timeout?
    const listenerPromise = new Promise(async (resolve) => {
        const listener = async () => {
            try {
                const conditionStatus = await predicate();
                if (conditionStatus) {
                    resolve(conditionStatus);
                    toUpdate.removeListener(eventName, listener);
                }
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        };
        toUpdate.on(eventName, listener);
        await listener(); // make sure we're checking at least once
    });
    await listenerPromise;
}
export async function disableValidationOfSignatureBeforePublishing(publication) {
    //@ts-expect-error
    publication._validateSignature = () => { };
}
export async function overrideCommentInstancePropsAndSign(comment, props) {
    if (!comment.signer)
        throw Error("Need comment.signer to overwrite the signature");
    const pubsubPublication = remeda.clone(comment.toJSONPubsubMessagePublication());
    for (const optionKey of remeda.keys.strict(props)) {
        //@ts-expect-error
        comment[optionKey] = pubsubPublication[optionKey] = props[optionKey];
    }
    comment.signature = pubsubPublication.signature = await signComment(removeUndefinedValuesRecursively({ ...comment.toJSONPubsubMessagePublication(), signer: comment.signer }), comment._plebbit);
    comment.raw.pubsubMessageToPublish = pubsubPublication;
    disableValidationOfSignatureBeforePublishing(comment);
}
export async function overrideCommentEditInstancePropsAndSign(commentEdit, props) {
    if (!commentEdit.signer)
        throw Error("Need commentEdit.signer to overwrite the signature");
    //@ts-expect-error
    for (const optionKey of Object.keys(props))
        commentEdit[optionKey] = props[optionKey];
    commentEdit.signature = await signCommentEdit(removeUndefinedValuesRecursively({ ...commentEdit.toJSONPubsubMessagePublication(), signer: commentEdit.signer }), commentEdit._plebbit);
    disableValidationOfSignatureBeforePublishing(commentEdit);
}
export async function setExtraPropOnCommentAndSign(comment, extraProps, includeExtraPropInSignedPropertyNames) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnVoteAndSign");
    const publicationWithExtraProp = { ...comment.toJSONPubsubMessagePublication(), ...extraProps };
    if (includeExtraPropInSignedPropertyNames)
        publicationWithExtraProp.signature = await _signJson([...comment.signature.signedPropertyNames, ...remeda.keys.strict(extraProps)], cleanUpBeforePublishing(publicationWithExtraProp), comment.signer, log);
    comment.raw.pubsubMessageToPublish = publicationWithExtraProp;
    disableValidationOfSignatureBeforePublishing(comment);
    Object.assign(comment, publicationWithExtraProp);
}
export async function setExtraPropOnVoteAndSign(vote, extraProps, includeExtraPropInSignedPropertyNames) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnVoteAndSign");
    const publicationWithExtraProp = { ...vote.toJSONPubsubMessagePublication(), ...extraProps };
    if (includeExtraPropInSignedPropertyNames)
        publicationWithExtraProp.signature = await _signJson([...vote.signature.signedPropertyNames, ...Object.keys(extraProps)], cleanUpBeforePublishing(publicationWithExtraProp), vote.signer, log);
    vote.raw.pubsubMessageToPublish = publicationWithExtraProp;
    disableValidationOfSignatureBeforePublishing(vote);
    Object.assign(vote, publicationWithExtraProp);
}
export async function setExtraPropOnCommentEditAndSign(commentEdit, extraProps, includeExtraPropInSignedPropertyNames) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnCommentEditAndSign");
    const publicationWithExtraProp = { ...commentEdit.toJSONPubsubMessagePublication(), ...extraProps };
    if (includeExtraPropInSignedPropertyNames)
        publicationWithExtraProp.signature = await _signJson([...commentEdit.signature.signedPropertyNames, ...Object.keys(extraProps)], cleanUpBeforePublishing(publicationWithExtraProp), commentEdit.signer, log);
    commentEdit.raw.pubsubMessageToPublish = publicationWithExtraProp;
    disableValidationOfSignatureBeforePublishing(commentEdit);
    Object.assign(commentEdit, publicationWithExtraProp);
}
export async function setExtraPropOnCommentModerationAndSign(commentModeration, extraProps, includeExtraPropInSignedPropertyNames) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnCommentModerationAndSign");
    const newPubsubPublicationWithExtraProp = (remeda.mergeDeep(commentModeration.toJSONPubsubMessagePublication(), extraProps));
    if (includeExtraPropInSignedPropertyNames)
        newPubsubPublicationWithExtraProp.signature = await _signJson([...commentModeration.signature.signedPropertyNames, ...Object.keys(extraProps)], cleanUpBeforePublishing(newPubsubPublicationWithExtraProp), commentModeration.signer, log);
    commentModeration.raw.pubsubMessageToPublish = newPubsubPublicationWithExtraProp;
    disableValidationOfSignatureBeforePublishing(commentModeration);
    Object.assign(commentModeration, newPubsubPublicationWithExtraProp);
}
export async function setExtraPropOnChallengeRequestAndSign(publication, extraProps, includeExtraPropsInRequestSignedPropertyNames) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnChallengeRequestAndSign");
    //@ts-expect-error
    publication._signAndValidateChallengeRequestBeforePublishing = async (requestWithoutSignature, signer) => {
        const signedPropertyNames = Object.keys(requestWithoutSignature);
        if (includeExtraPropsInRequestSignedPropertyNames)
            signedPropertyNames.push(...Object.keys(extraProps));
        const requestWithExtraProps = { ...requestWithoutSignature, ...extraProps };
        const signature = await _signPubsubMsg(signedPropertyNames, requestWithExtraProps, signer, log);
        return { ...requestWithExtraProps, signature };
    };
}
export async function publishChallengeAnswerMessageWithExtraProps(publication, challengeAnswers, extraProps, includeExtraPropsInChallengeSignedPropertyNames) {
    // we're crafting a challenge answer from scratch here
    const log = Logger("plebbit-js:test-util:setExtraPropsOnChallengeAnswerMessageAndSign");
    const signer = Object.values(publication._challengeExchanges)[0].signer;
    if (!signer)
        throw Error("Signer is undefined for this challenge exchange");
    const encryptedChallengeAnswers = await encryptEd25519AesGcm(JSON.stringify({ challengeAnswers }), signer.privateKey, publication._subplebbit.encryption.publicKey);
    const toSignAnswer = cleanUpBeforePublishing({
        type: "CHALLENGEANSWER",
        challengeRequestId: Object.values(publication._challengeExchanges)[0].challengeRequest.challengeRequestId,
        encrypted: encryptedChallengeAnswers,
        userAgent: publication._plebbit.userAgent,
        protocolVersion: env.PROTOCOL_VERSION,
        timestamp: timestamp()
    });
    const signedPropertyNames = remeda.keys.strict(toSignAnswer);
    //@ts-expect-error
    if (includeExtraPropsInChallengeSignedPropertyNames)
        signedPropertyNames.push(...Object.keys(extraProps));
    Object.assign(toSignAnswer, extraProps);
    const signature = await _signPubsubMsg(signedPropertyNames, toSignAnswer, signer, log);
    //@ts-expect-error
    await publishOverPubsub(publication._subplebbit.pubsubTopic, { ...toSignAnswer, signature });
}
export async function publishChallengeMessageWithExtraProps(publication, pubsubSigner, extraProps, includeExtraPropsInChallengeSignedPropertyNames) {
    const log = Logger("plebbit-js:test-util:publishChallengeMessageWithExtraProps");
    const encryptedChallenges = await encryptEd25519AesGcmPublicKeyBuffer(deterministicStringify({ challenges: [] }), pubsubSigner.privateKey, Object.values(publication._challengeExchanges)[0].challengeRequest.signature.publicKey);
    const toSignChallenge = cleanUpBeforePublishing({
        type: "CHALLENGE",
        challengeRequestId: Object.values(publication._challengeExchanges)[0].challengeRequest.challengeRequestId,
        encrypted: encryptedChallenges,
        userAgent: publication._plebbit.userAgent,
        protocolVersion: env.PROTOCOL_VERSION,
        timestamp: timestamp()
    });
    const signedPropertyNames = remeda.keys.strict(toSignChallenge);
    //@ts-expect-error
    if (includeExtraPropsInChallengeSignedPropertyNames)
        signedPropertyNames.push(...Object.keys(extraProps));
    Object.assign(toSignChallenge, extraProps);
    const signature = await _signPubsubMsg(signedPropertyNames, toSignChallenge, pubsubSigner, log);
    await publishOverPubsub(pubsubSigner.address, { ...toSignChallenge, signature });
}
export async function publishChallengeVerificationMessageWithExtraProps(publication, pubsubSigner, extraProps, includeExtraPropsInChallengeSignedPropertyNames) {
    const log = Logger("plebbit-js:test-util:publishChallengeVerificationMessageWithExtraProps");
    const toSignChallengeVerification = cleanUpBeforePublishing({
        type: "CHALLENGEVERIFICATION",
        challengeRequestId: Object.values(publication._challengeExchanges)[0].challengeRequest.challengeRequestId,
        challengeSuccess: false,
        reason: "Random reason",
        userAgent: publication._plebbit.userAgent,
        protocolVersion: env.PROTOCOL_VERSION,
        timestamp: timestamp()
    });
    const signedPropertyNames = remeda.keys.strict(toSignChallengeVerification);
    //@ts-expect-error
    if (includeExtraPropsInChallengeSignedPropertyNames)
        signedPropertyNames.push(...Object.keys(extraProps));
    Object.assign(toSignChallengeVerification, extraProps);
    const signature = await _signPubsubMsg(signedPropertyNames, toSignChallengeVerification, pubsubSigner, log);
    await publishOverPubsub(pubsubSigner.address, { ...toSignChallengeVerification, signature });
}
export async function publishChallengeVerificationMessageWithEncryption(publication, pubsubSigner, toEncrypt, verificationProps) {
    const log = Logger("plebbit-js:test-util:publishChallengeVerificationMessageWithExtraProps");
    const challengeRequest = Object.values(publication._challengeExchanges)[0].challengeRequest;
    const toSignChallengeVerification = cleanUpBeforePublishing({
        type: "CHALLENGEVERIFICATION",
        challengeRequestId: challengeRequest.challengeRequestId,
        challengeSuccess: true,
        userAgent: publication._plebbit.userAgent,
        protocolVersion: env.PROTOCOL_VERSION,
        timestamp: timestamp(),
        ...verificationProps
    });
    const publicKey = Buffer.from(challengeRequest.signature.publicKey).toString("base64");
    const encrypted = await encryptEd25519AesGcm(JSON.stringify(toEncrypt), pubsubSigner.privateKey, publicKey);
    toSignChallengeVerification.encrypted = encrypted;
    const signature = await signChallengeVerification(toSignChallengeVerification, pubsubSigner);
    await publishOverPubsub(pubsubSigner.address, { ...toSignChallengeVerification, signature });
}
export async function addStringToIpfs(content) {
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    const ipfsClient = plebbit._clientsManager.getDefaultKuboRpcClient();
    const cid = (await ipfsClient._client.add(content)).path;
    await plebbit.destroy();
    return cid;
}
export async function publishOverPubsub(pubsubTopic, jsonToPublish) {
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    await plebbit._clientsManager.pubsubPublish(pubsubTopic, jsonToPublish);
    await plebbit.destroy();
}
export async function mockPlebbitWithHeliaConfig(opts) {
    const key = "Helia config default for testing(remote)" + String(opts?.forceMockPubsub ? "" : Math.random());
    const forceMockPubsub = typeof opts?.forceMockPubsub === "boolean" ? opts.forceMockPubsub : true;
    const heliaPlebbit = await mockPlebbitV2({
        forceMockPubsub,
        ...opts,
        plebbitOptions: {
            libp2pJsClientOptions: [{ key, libp2pOptions: { connectionGater: { denyDialMultiaddr: async () => false } } }],
            pubsubKuboRpcClientsOptions: [],
            kuboRpcClientsOptions: [],
            httpRoutersOptions: ["http://localhost:20001"], // this http router transmits the addresses of kubo node of test-server.js
            dataPath: undefined,
            ...opts?.plebbitOptions
        }
    });
    if (forceMockPubsub) {
        const mockedPubsubClient = createMockPubsubClient();
        const heliaLibp2pJsClient = heliaPlebbit.clients.libp2pJsClients[Object.keys(heliaPlebbit.clients.libp2pJsClients)[0]];
        heliaLibp2pJsClient.heliaWithKuboRpcClientFunctions.pubsub = mockedPubsubClient.pubsub; // that should work for publishing/subscribing
    }
    return heliaPlebbit;
}
const testConfigCodeToPlebbitInstanceWithHumanName = {
    "remote-kubo-rpc": {
        plebbitInstancePromise: (args) => mockPlebbitNoDataPathWithOnlyKuboClient(args),
        name: "Kubo Node with no datapath (remote)",
        testConfigCode: "remote-kubo-rpc"
    },
    "remote-ipfs-gateway": {
        plebbitInstancePromise: (args) => mockGatewayPlebbit(args),
        name: "IPFS Gateway",
        testConfigCode: "remote-ipfs-gateway"
    },
    "remote-plebbit-rpc": {
        plebbitInstancePromise: (args) => mockRpcRemotePlebbit(args),
        name: "Plebbit RPC Remote",
        testConfigCode: "remote-plebbit-rpc"
    },
    "local-kubo-rpc": {
        plebbitInstancePromise: (args) => mockPlebbitV2(args),
        name: "Kubo node with datapath (local)",
        testConfigCode: "local-kubo-rpc"
    },
    "remote-libp2pjs": {
        plebbitInstancePromise: (args) => mockPlebbitWithHeliaConfig(args),
        name: "Libp2pJS client with no datapath (remote)",
        testConfigCode: "remote-libp2pjs"
    }
};
let plebbitConfigs = [];
export function setPlebbitConfigs(configs) {
    if (configs.length === 0)
        throw Error("No configs were provided");
    // Make sure each config exists in the mapper
    for (const config of configs)
        if (!testConfigCodeToPlebbitInstanceWithHumanName[config])
            throw new Error(`Config "${config}" does not exist in the mapper. Available configs are: ${Object.keys(testConfigCodeToPlebbitInstanceWithHumanName)}`);
    plebbitConfigs = configs.map((config) => testConfigCodeToPlebbitInstanceWithHumanName[config]);
    if (globalThis.window) {
        window.addEventListener("uncaughtException", (err) => {
            console.error("uncaughtException", JSON.stringify(err, ["message", "arguments", "type", "name"]));
        });
        window.addEventListener("unhandledrejection", (err) => {
            console.error("unhandledRejection", JSON.stringify(err, ["message", "arguments", "type", "name"]));
        });
    }
    else if (process) {
        process.on("uncaughtException", (...err) => {
            console.error("uncaughtException", ...err);
        });
        process.on("unhandledRejection", (...err) => {
            console.error("unhandledRejection", ...err);
        });
    }
}
export function getRemotePlebbitConfigs(opts) {
    // Check if configs are passed via environment variable
    const plebbitConfigsFromEnv = process?.env?.PLEBBIT_CONFIGS;
    if (plebbitConfigsFromEnv) {
        const configs = plebbitConfigsFromEnv.split(",");
        // Set the configs if they're coming from the environment variable
        setPlebbitConfigs(configs);
    }
    //@ts-expect-error
    const plebbitConfigsFromWindow = globalThis["window"]?.["PLEBBIT_CONFIGS"];
    if (plebbitConfigsFromWindow) {
        const configs = plebbitConfigsFromWindow.split(",");
        // Set the configs if they're coming from the environment variable
        setPlebbitConfigs(configs);
    }
    if (plebbitConfigs.length === 0)
        throw Error("No remote plebbit configs set, " + plebbitConfigsFromEnv + " " + plebbitConfigsFromWindow);
    if (opts?.includeOnlyTheseTests) {
        opts.includeOnlyTheseTests.forEach((config) => {
            if (!testConfigCodeToPlebbitInstanceWithHumanName[config])
                throw new Error(`Config "${config}" does not exist in the mapper. Available configs are: ${plebbitConfigs.map((c) => c.name).join(", ")}`);
        });
        const filteredKeys = remeda.keys
            .strict(testConfigCodeToPlebbitInstanceWithHumanName)
            .filter((config) => opts.includeOnlyTheseTests.includes(config) &&
            plebbitConfigs.find((c) => c.name === testConfigCodeToPlebbitInstanceWithHumanName[config].name));
        return filteredKeys.map((config) => testConfigCodeToPlebbitInstanceWithHumanName[config]);
    }
    return plebbitConfigs;
}
export async function createNewIpns() {
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({});
    const ipfsClient = plebbit._clientsManager.getDefaultKuboRpcClient();
    const signer = await plebbit.createSigner();
    signer.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(signer.privateKey));
    await importSignerIntoKuboNode(signer.address, signer.ipfsKey, {
        url: plebbit.kuboRpcClientsOptions[0].url.toString(),
        headers: plebbit.kuboRpcClientsOptions[0].headers
    });
    const publishToIpns = async (content) => {
        const cid = await addStringToIpfs(content);
        await ipfsClient._client.name.publish(cid, {
            key: signer.address,
            allowOffline: true
        });
    };
    return {
        signer,
        publishToIpns,
        plebbit
    };
}
export async function publishSubplebbitRecordWithExtraProp(opts) {
    const ipnsObj = await createNewIpns();
    const actualSub = await ipnsObj.plebbit.getSubplebbit("12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z");
    const subplebbitRecord = JSON.parse(JSON.stringify(actualSub.toJSONIpfs()));
    subplebbitRecord.pubsubTopic = subplebbitRecord.address = ipnsObj.signer.address;
    delete subplebbitRecord.posts;
    if (opts?.extraProps)
        Object.assign(subplebbitRecord, opts.extraProps);
    const signedPropertyNames = subplebbitRecord.signature.signedPropertyNames;
    if (opts?.includeExtraPropInSignedPropertyNames)
        signedPropertyNames.push("extraProp");
    subplebbitRecord.signature = await _signJson(signedPropertyNames, subplebbitRecord, ipnsObj.signer, Logger("plebbit-js:test-util:publishSubplebbitRecordWithExtraProp"));
    await ipnsObj.publishToIpns(JSON.stringify(subplebbitRecord));
    return { subplebbitRecord, ipnsObj };
}
export async function createMockedSubplebbitIpns(subplebbitOpts) {
    const ipnsObj = await createNewIpns();
    const subplebbitRecord = {
        ...(await ipnsObj.plebbit.getSubplebbit("12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z")).toJSONIpfs(),
        posts: undefined,
        address: ipnsObj.signer.address,
        pubsubTopic: ipnsObj.signer.address,
        ...subplebbitOpts
    }; // default sub, will be using its props
    if (!subplebbitRecord.posts)
        delete subplebbitRecord.posts;
    subplebbitRecord.signature = await signSubplebbit(subplebbitRecord, ipnsObj.signer);
    await ipnsObj.publishToIpns(JSON.stringify(subplebbitRecord));
    await ipnsObj.plebbit.destroy();
    return { subplebbitRecord, ipnsObj };
}
export function jsonifySubplebbitAndRemoveInternalProps(sub) {
    const jsonfied = JSON.parse(JSON.stringify(sub));
    delete jsonfied["posts"]["clients"];
    return remeda.omit(jsonfied, ["startedState", "started", "signer", "settings", "editable", "clients", "updatingState", "state"]);
}
export function jsonifyLocalSubWithNoInternalProps(sub) {
    const localJson = JSON.parse(JSON.stringify(sub));
    //@ts-expect-error
    delete localJson["posts"]["clients"];
    return remeda.omit(localJson, ["startedState", "started", "clients", "state", "updatingState"]);
}
export function jsonifyCommentAndRemoveInstanceProps(comment) {
    const jsonfied = cleanUpBeforePublishing(JSON.parse(JSON.stringify(comment)));
    if ("replies" in jsonfied)
        delete jsonfied["replies"]["clients"];
    if ("replies" in jsonfied && remeda.isEmpty(jsonfied.replies))
        delete jsonfied["replies"];
    return remeda.omit(jsonfied, ["clients", "state", "updatingState", "state", "publishingState", "raw"]);
}
export async function waitUntilPlebbitSubplebbitsIncludeSubAddress(plebbit, subAddress) {
    return plebbit._awaitSubplebbitsToIncludeSub(subAddress);
}
export function isPlebbitFetchingUsingGateways(plebbit) {
    return (!plebbit._plebbitRpcClient &&
        Object.keys(plebbit.clients.kuboRpcClients).length === 0 &&
        Object.keys(plebbit.clients.libp2pJsClients).length === 0);
}
export function mockRpcServerForTests(plebbitWs) {
    const functionsToBind = [
        "_createCommentModerationInstanceFromPublishCommentModerationParams",
        "_createCommentEditInstanceFromPublishCommentEditParams",
        "_createVoteInstanceFromPublishVoteParams",
        "_createCommentInstanceFromPublishCommentParams",
        "_createSubplebbitEditInstanceFromPublishSubplebbitEditParams"
    ];
    // disable validation of signature before publishing
    // reduce threshold for publishing
    for (const funcBind of functionsToBind) {
        const originalFunc = plebbitWs[funcBind].bind(plebbitWs);
        plebbitWs[funcBind] = async (...args) => {
            const pubInstance = await originalFunc(...args);
            disableValidationOfSignatureBeforePublishing(pubInstance);
            pubInstance._publishToDifferentProviderThresholdSeconds = 5;
            pubInstance._setProviderFailureThresholdSeconds = 10;
            return pubInstance;
        };
    }
}
export function mockPostToReturnSpecificCommentUpdate(commentToBeMocked, commentUpdateRecordString) {
    const updatingPostComment = commentToBeMocked._plebbit._updatingComments[commentToBeMocked.cid];
    if (!updatingPostComment)
        throw Error("Post should be updating before starting to mock");
    if (commentToBeMocked._plebbit._plebbitRpcClient)
        throw Error("Can't mock Post to return specific CommentUpdate record when plebbit is using RPC");
    delete updatingPostComment.updatedAt;
    delete updatingPostComment.raw.commentUpdate;
    //@ts-expect-error
    delete updatingPostComment._subplebbitForUpdating?.subplebbit?.updateCid;
    //@ts-expect-error
    if (updatingPostComment._subplebbitForUpdating?.subplebbit?._clientsManager?._updateCidsAlreadyLoaded)
        //@ts-expect-error
        updatingPostComment._subplebbitForUpdating.subplebbit._clientsManager._updateCidsAlreadyLoaded = new Set();
    mockCommentToNotUsePagesForUpdates(commentToBeMocked);
    if (isPlebbitFetchingUsingGateways(updatingPostComment._plebbit)) {
        const originalFetch = updatingPostComment._clientsManager.fetchFromMultipleGateways.bind(updatingPostComment._clientsManager);
        updatingPostComment._clientsManager.fetchFromMultipleGateways = async (...args) => {
            const commentUpdateCid = await addStringToIpfs(commentUpdateRecordString);
            if (args[0].recordPlebbitType === "comment-update")
                return originalFetch({
                    ...args[0],
                    root: commentUpdateCid,
                    path: undefined
                });
            else
                return originalFetch(...args);
        };
    }
    else {
        // we're using kubo/helia
        const originalFetch = updatingPostComment._clientsManager._fetchCidP2P.bind(updatingPostComment._clientsManager);
        //@ts-expect-error
        updatingPostComment._clientsManager._fetchCidP2P = (...args) => {
            if (args[0].endsWith("/update")) {
                return commentUpdateRecordString;
            }
            else
                return originalFetch(...args);
        };
    }
}
export function mockPostToFailToLoadFromPostUpdates(postToBeMocked) {
    const updatingPostComment = postToBeMocked._plebbit._updatingComments[postToBeMocked.cid];
    if (!updatingPostComment)
        throw Error("Post should be updating before starting to mock");
    if (postToBeMocked._plebbit._plebbitRpcClient)
        throw Error("Can't mock Post to to fail loading post from postUpdates when plebbit is using RPC");
    mockCommentToNotUsePagesForUpdates(postToBeMocked);
    updatingPostComment._clientsManager._fetchPostCommentUpdateIpfsP2P =
        updatingPostComment._clientsManager._fetchPostCommentUpdateFromGateways = async () => {
            throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES");
        };
}
export function mockPostToHaveSubplebbitWithNoPostUpdates(postToBeMocked) {
    const updatingPostComment = postToBeMocked._plebbit._updatingComments[postToBeMocked.cid];
    if (!updatingPostComment)
        throw Error("Post should be updating before starting to mock");
    if (postToBeMocked._plebbit._plebbitRpcClient)
        throw Error("Can't mock Post to to fail loading post from postUpdates when plebbit is using RPC");
    mockCommentToNotUsePagesForUpdates(postToBeMocked);
    const originalSubplebbitUpdateHandle = updatingPostComment._clientsManager.handleUpdateEventFromSub.bind(updatingPostComment._clientsManager);
    updatingPostComment._clientsManager.handleUpdateEventFromSub = (subplebbit) => {
        delete subplebbit.postUpdates;
        delete subplebbit.raw.subplebbitIpfs.postUpdates;
        return originalSubplebbitUpdateHandle(subplebbit);
    };
}
export async function createCommentUpdateWithInvalidSignature(commentCid) {
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({});
    const comment = await plebbit.getComment(commentCid);
    await comment.update();
    await resolveWhenConditionIsTrue(comment, async () => typeof comment.updatedAt === "number");
    const invalidCommentUpdateJson = comment.raw.commentUpdate;
    await comment.stop();
    invalidCommentUpdateJson.updatedAt += 1234; // Invalidate CommentUpdate signature
    return invalidCommentUpdateJson;
}
export async function mockPlebbitToReturnSpecificSubplebbit(plebbit, subAddress, subplebbitRecord) {
    const sub = plebbit._updatingSubplebbits[subAddress];
    if (!sub)
        throw Error("Can't mock sub when it's not being updated");
    if (plebbit._plebbitRpcClient)
        throw Error("Can't mock sub to return specific record when plebbit is using RPC");
    const clearOut = () => {
        delete sub.raw.subplebbitIpfs;
        delete sub.updatedAt;
        sub._clientsManager._updateCidsAlreadyLoaded.clear();
        delete sub.updateCid;
    };
    clearOut();
    sub.once("update", () => clearOut());
    const subplebbitRecordCid = await addStringToIpfs(JSON.stringify(subplebbitRecord));
    if (isPlebbitFetchingUsingGateways(sub._plebbit)) {
        const originalFetch = sub._clientsManager._fetchWithLimit.bind(sub._clientsManager);
        //@ts-expect-error
        sub._clientsManager._fetchWithLimit = async (...args) => {
            const url = args[0];
            if (url.includes("ipns")) {
                return {
                    ...args,
                    resText: JSON.stringify(subplebbitRecord)
                };
            }
            else
                return originalFetch(...args);
        };
    }
    else {
        // we're using kubo/helia
        sub._clientsManager.resolveIpnsToCidP2P = async () => subplebbitRecordCid;
    }
}
export function mockPlebbitToTimeoutFetchingCid(plebbit) {
    const originalFetch = plebbit._clientsManager._fetchCidP2P.bind(plebbit._clientsManager);
    for (const ipfsClient of Object.values(plebbit.clients.kuboRpcClients)) {
        ipfsClient._client.cat = async function* (ipfsPath, options) {
            await new Promise((resolve) => setTimeout(resolve, 60000));
            throw new Error("Timeout");
        };
    }
    for (const libp2pJsClient of Object.values(plebbit.clients.libp2pJsClients)) {
        libp2pJsClient.heliaWithKuboRpcClientFunctions.cat = async function* (ipfsPath, options) {
            await new Promise((resolve) => setTimeout(resolve, 60000));
            throw new Error("Timeout");
        };
    }
    // TODO mock for gateway
    plebbit._clientsManager._fetchCidP2P = async (...args) => {
        await new Promise((resolve) => setTimeout(resolve, 60000));
        throw new Error("Timeout");
    };
}
export function mockCommentToNotUsePagesForUpdates(comment) {
    const updatingComment = comment._plebbit._updatingComments[comment.cid];
    if (!updatingComment)
        throw Error("Comment should be updating before starting to mock");
    if (comment._plebbit._plebbitRpcClient)
        throw Error("Can't mock comment  _findCommentInPagesOfUpdatingCommentsSubplebbit with plebbit rpc clients");
    delete updatingComment.raw.commentUpdate;
    delete updatingComment.updatedAt;
    updatingComment._clientsManager._findCommentInPagesOfUpdatingCommentsOrSubplebbit = () => undefined;
}
export async function forceSubplebbitToGenerateAllRepliesPages(comment) {
    // max comment size is 40kb = 40000
    const rawCommentUpdateRecord = comment.raw.commentUpdate;
    if (!rawCommentUpdateRecord)
        throw Error("Comment should be updating before forcing to generate all pages");
    if (Object.keys(comment.replies.pageCids).length > 0)
        return;
    const curRecordSize = Buffer.byteLength(JSON.stringify(rawCommentUpdateRecord));
    const maxCommentSize = 30000;
    const numOfCommentsToPublish = Math.round((1024 * 1024 - curRecordSize) / maxCommentSize) + 1;
    const content = "x".repeat(1024 * 30); //30kb
    await Promise.all(new Array(numOfCommentsToPublish - 1).fill(null).map(async () => {
        return publishRandomReply(comment, comment._plebbit, { content });
    }));
    const lastPublishedReply = await publishRandomReply(comment, comment._plebbit, { content });
    console.log("Published", numOfCommentsToPublish, "replies under comment", comment.cid, "to force subplebbit", comment.subplebbitAddress, "to generate all pages");
    const updatingComment = await comment._plebbit.createComment({ cid: comment.cid });
    await updatingComment.update();
    //@ts-expect-error
    await waitTillReplyInParentPagesInstance(lastPublishedReply, updatingComment);
    if (Object.keys(updatingComment.replies.pageCids).length === 0)
        throw Error("Failed to force the subplebbit to load all pages");
    if (updatingComment.replyCount && updatingComment.replyCount < numOfCommentsToPublish)
        throw Error("Reply count is less than the number of comments published");
}
export async function forceSubplebbitToGenerateAllPostsPages(subplebbit) {
    // max comment size is 40kb = 40000
    const rawSubplebbitRecord = subplebbit.toJSONIpfs();
    if (!rawSubplebbitRecord)
        throw Error("Subplebbit should be updating before forcing to generate all pages");
    if (Object.keys(subplebbit.posts.pageCids).length > 0)
        return;
    const curRecordSize = Buffer.byteLength(JSON.stringify(rawSubplebbitRecord));
    const maxCommentSize = 30000;
    const numOfCommentsToPublish = Math.round((1024 * 1024 - curRecordSize) / maxCommentSize) + 1;
    const content = "x".repeat(1024 * 30); //30kb
    let lastPublishedPost;
    await Promise.all(new Array(numOfCommentsToPublish).fill(null).map(async () => {
        const post = await publishRandomPost(subplebbit.address, subplebbit._plebbit, { content });
        lastPublishedPost = post;
    }));
    //@ts-expect-error
    await waitTillPostInSubplebbitPages(lastPublishedPost, subplebbit._plebbit);
    const newSubplebbit = await subplebbit._plebbit.getSubplebbit(subplebbit.address);
    if (Object.keys(newSubplebbit.posts.pageCids).length === 0)
        throw Error("Failed to force the subplebbit to load all pages");
}
export async function findOrGeneratePostWithMultiplePages(subplebbit) {
    let postInPage = subplebbit.posts?.pages?.hot?.comments.find((comment) => comment.replies?.pages?.best?.nextCid);
    if (!postInPage) {
        let pageCid = subplebbit.posts?.pageCids.new;
        while (pageCid && !postInPage) {
            const loadedPage = await subplebbit.posts.getPage(pageCid);
            postInPage = loadedPage.comments.find((comment) => comment.replies?.pages?.best?.nextCid);
            pageCid = loadedPage.nextCid;
        }
        if (postInPage)
            return postInPage;
    }
    // didn't find any post with multiple pages, so we'll publish a new one
    const post = await publishRandomPost(subplebbit.address, subplebbit._plebbit);
    await post.update();
    await resolveWhenConditionIsTrue(post, async () => typeof post.updatedAt === "number");
    await forceSubplebbitToGenerateAllRepliesPages(post);
    return post;
}
export async function findOrGenerateReplyUnderPostWithMultiplePages(subplebbit) {
    const post = await findOrGeneratePostWithMultiplePages(subplebbit);
    const replyInPage = post.replies?.pages?.best?.comments[0];
    if (replyInPage)
        return replyInPage;
    //@ts-expect-error
    const reply = await publishRandomReply(post, subplebbit._plebbit);
    return reply;
}
export function mockReplyToUseParentPagesForUpdates(reply) {
    const updatingComment = reply._plebbit._updatingComments[reply.cid];
    if (!updatingComment)
        throw Error("Reply should be updating before starting to mock");
    if (updatingComment.depth === 0)
        throw Error("Should not call this function on a post");
    delete updatingComment.raw.commentUpdate;
    delete updatingComment.updatedAt;
    mockCommentToNotUsePagesForUpdates(reply);
    const originalFunc = updatingComment._clientsManager.handleUpdateEventFromPostToFetchReplyCommentUpdate.bind(updatingComment._clientsManager);
    updatingComment._clientsManager.handleUpdateEventFromPostToFetchReplyCommentUpdate = (postInstance) => {
        // this should stop plebbit-js from assuming the post replies is a single preloaded page
        const updatingSubInstance = reply._plebbit._updatingSubplebbits[postInstance.subplebbitAddress];
        const updatingParentInstance = reply._plebbit._updatingComments[reply.parentCid];
        if (postInstance.replies.pages.best)
            postInstance.replies.pages.best.comments = [];
        if (updatingSubInstance?.posts.pages.hot)
            updatingSubInstance.posts.pages.hot.comments = [];
        if (updatingParentInstance?.replies?.pages?.best)
            updatingParentInstance.replies.pages.best.comments = [];
        return originalFunc(postInstance);
    };
}
export function mockUpdatingCommentResolvingAuthor(comment, mockFunction) {
    const updatingComment = comment._plebbit._updatingComments[comment.cid];
    if (!updatingComment)
        throw Error("Comment should be updating before starting to mock");
    if (comment._plebbit._plebbitRpcClient)
        throw Error("Can't mock cache with plebbit rpc clients");
    updatingComment._clientsManager.resolveAuthorAddressIfNeeded = mockFunction;
}
export async function mockCacheOfTextRecord(opts) {
    const cacheKey = opts.plebbit._clientsManager._getKeyOfCachedDomainTextRecord(opts.domain, opts.textRecord);
    if (cacheKey.includes("undefined"))
        throw Error("User provided invalid mocked value for caching text records");
    if (!String(opts.plebbit._storage.getItem).includes("return"))
        throw Error("Can't mock cache of text record because plebbit._storage is stubbed and isn't doing anything");
    if (opts.plebbit._plebbitRpcClient)
        throw Error("Can't mock cache with plebbit rpc clients");
    if (!opts.value)
        await opts.plebbit._storage.removeItem(cacheKey);
    else {
        const valueInCache = { timestampSeconds: timestamp(), valueOfTextRecord: opts.value };
        await opts.plebbit._storage.setItem(cacheKey, valueInCache);
    }
}
export async function getRandomPostCidFromSub(subplebbitAddress, plebbit) {
    const sub = await plebbit.getSubplebbit(subplebbitAddress);
    const lastPostCid = sub.lastPostCid;
    if (!lastPostCid)
        throw Error("Subplebbit should have a last post cid");
    return lastPostCid;
}
const skipFunction = (_) => { };
skipFunction.skip = () => { };
export const describeSkipIfRpc = isRpcFlagOn() ? skipFunction : globalThis["describe"];
export const describeIfRpc = isRpcFlagOn() ? globalThis["describe"] : skipFunction;
export const itSkipIfRpc = isRpcFlagOn() ? skipFunction : globalThis["it"];
export const itIfRpc = isRpcFlagOn() ? globalThis["it"] : skipFunction;
export function mockViemClient({ plebbit, chainTicker, url, mockedViem }) {
    if (plebbit._plebbitRpcClient)
        throw Error("Can't mock viem client with plebbit rpc clients");
    // Create a unique identifier for the viem client
    const viemClientKey = chainTicker + url;
    // Access the domain resolver's viem clients and mock the getEnsText method
    plebbit._domainResolver._viemClients[viemClientKey] = mockedViem;
}
export function processAllCommentsRecursively(comments, processor) {
    if (!comments || comments.length === 0)
        return;
    comments.forEach((comment) => processor(comment));
    for (const comment of comments)
        if (comment.replies?.pages?.best?.comments)
            processAllCommentsRecursively(comment.replies.pages.best.comments, processor);
}
//# sourceMappingURL=test-util.js.map