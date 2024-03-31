import { TIMEFRAMES_TO_SECONDS, timestamp } from "../util.js";
import { Comment } from "../comment.js";
import PlebbitIndex from "../index.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import assert from "assert";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import lodash from "lodash";
import { v4 as uuidv4 } from "uuid";
import { createMockIpfsClient } from "./mock-ipfs-client.js";
import Logger from "@plebbit/plebbit-logger";
function generateRandomTimestamp(parentTimestamp) {
    const [lowerLimit, upperLimit] = [typeof parentTimestamp === "number" && parentTimestamp > 2 ? parentTimestamp : 2, timestamp()];
    let randomTimestamp = -1;
    while (randomTimestamp === -1) {
        const randomTimeframeIndex = (Object.keys(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
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
    const post = await plebbit.createComment({
        author: { displayName: `Mock Author - ${postStartTestTime}` },
        title: `Mock Post - ${postStartTestTime}`,
        content: `Mock content - ${postStartTestTime}`,
        signer,
        timestamp: postTimestamp,
        subplebbitAddress,
        ...postProps
    });
    return post;
}
// TODO rework this
export async function generateMockComment(parentPostOrComment, plebbit, randomTimestamp = false, commentProps = {}) {
    if (!["Comment", "Post"].includes(parentPostOrComment.constructor.name))
        throw Error("Need to have parentComment defined to generate mock comment");
    const commentTimestamp = (randomTimestamp && generateRandomTimestamp(parentPostOrComment.timestamp)) || timestamp();
    const commentTime = Date.now() / 1000 + Math.random();
    const signer = commentProps?.signer || (await plebbit.createSigner());
    const comment = await plebbit.createComment({
        author: { displayName: `Mock Author - ${commentTime}` },
        signer: signer,
        content: `Mock comment - ${commentTime}`,
        parentCid: parentPostOrComment.cid,
        subplebbitAddress: parentPostOrComment.subplebbitAddress,
        timestamp: commentTimestamp,
        ...commentProps
    });
    return comment;
}
export async function generateMockVote(parentPostOrComment, vote, plebbit, signer) {
    const voteTime = Date.now() / 1000;
    const commentCid = parentPostOrComment.cid || parentPostOrComment.postCid;
    if (typeof commentCid !== "string")
        throw Error(`generateMockVote: commentCid (${commentCid}) is not a valid CID`);
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
    return voteObj;
}
export async function loadAllPages(pageCid, pagesInstance) {
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}
async function _mockSubplebbitPlebbit(signers, plebbitOptions) {
    const plebbit = await mockPlebbit({ ...plebbitOptions, pubsubHttpClientsOptions: ["http://localhost:15002/api/v0"] });
    for (const pubsubUrl of Object.keys(plebbit.clients.pubsubClients))
        plebbit.clients.pubsubClients[pubsubUrl]._client = createMockIpfsClient();
    return plebbit;
}
async function _startMathCliSubplebbit(signers, plebbit) {
    const signer = await plebbit.createSigner(signers[1]);
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
    return Promise.all(new Array(numOfPosts).fill(null).map(() => publishRandomPost(subplebbitAddress, plebbit, {}, false)));
}
async function _publishReplies(parentComment, numOfReplies, plebbit) {
    return Promise.all(new Array(numOfReplies).fill(null).map(() => publishRandomReply(parentComment, plebbit, {}, false)));
}
async function _publishVotesOnOneComment(comment, votesPerCommentToPublish, plebbit) {
    return Promise.all(new Array(votesPerCommentToPublish)
        .fill(null)
        .map(() => publishVote(comment.cid, comment.subplebbitAddress, Math.random() > 0.5 ? 1 : -1, plebbit, {})));
}
async function _publishVotes(comments, votesPerCommentToPublish, plebbit) {
    const votes = lodash.flattenDeep(await Promise.all(comments.map((comment) => _publishVotesOnOneComment(comment, votesPerCommentToPublish, plebbit))));
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
    await new Promise((resolve) => subplebbit.once("update", resolve));
    const posts = await _publishPosts(subplebbit.address, props.numOfPostsToPublish, subplebbit.plebbit); // If no comment[] is provided, we publish posts
    console.log(`Have successfully published ${posts.length} posts`);
    const replies = await _publishReplies(posts[0], props.numOfCommentsToPublish, subplebbit.plebbit);
    console.log(`Have sucessfully published ${replies.length} replies`);
    const postVotes = await _publishVotes(posts, props.votesPerCommentToPublish, subplebbit.plebbit);
    console.log(`Have sucessfully published ${postVotes.length} votes on ${posts.length} posts`);
    const repliesVotes = await _publishVotes(replies, props.votesPerCommentToPublish, subplebbit.plebbit);
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
    const plebbit = await _mockSubplebbitPlebbit(props.signers, { ...lodash.pick(props, ["noData", "dataPath"]), publishInterval: 3000, updateInterval: 3000 });
    const signer = await plebbit.createSigner(props.signers[0]);
    const mainSub = await createSubWithNoChallenge({ signer }, plebbit); // most publications will be on this sub
    await mainSub.start();
    console.time("populate");
    const [mathSub, ensSub] = await Promise.all([
        _startMathCliSubplebbit(props.signers, plebbit),
        _startEnsSubplebbit(props.signers, plebbit),
        _populateSubplebbit(mainSub, props)
    ]);
    console.timeEnd("populate");
    let onlineSub;
    if (props.startOnlineSub)
        onlineSub = await startOnlineSubplebbit();
    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");
    return { onlineSub: onlineSub?.address, mathSub: mathSub.address, ensSub: ensSub.address, mainSub: mainSub.address };
}
export async function fetchTestServerSubs() {
    const res = await fetch("http://localhost:14953");
    const resWithType = await res.json();
    return resWithType;
}
export function mockDefaultOptionsForNodeAndBrowserTests() {
    const shouldUseRPC = isRpcFlagOn();
    if (shouldUseRPC)
        return { plebbitRpcClientsOptions: ["ws://localhost:39652"] };
    else
        return {
            ipfsHttpClientsOptions: ["http://localhost:15001/api/v0"],
            pubsubHttpClientsOptions: [`http://localhost:15002/api/v0`, `http://localhost:42234/api/v0`, `http://localhost:42254/api/v0`]
        };
}
export async function mockPlebbit(plebbitOptions, forceMockPubsub = false, stubStorage = true, mockResolve = true) {
    const log = Logger("plebbit-js:test-util:mockPlebbit");
    const plebbit = await PlebbitIndex({
        ...mockDefaultOptionsForNodeAndBrowserTests(),
        resolveAuthorAddresses: true,
        publishInterval: 1000,
        updateInterval: 1000,
        ...plebbitOptions
    });
    if (mockResolve)
        plebbit.resolver.resolveTxtRecord = async (address, textRecord, chain, chainProviderUrl) => {
            log(`Attempting to mock resolve address (${address}) textRecord (${textRecord}) chain (${chain}) chainProviderUrl (${chainProviderUrl})`);
            if (address === "plebbit.eth" && textRecord === "subplebbit-address")
                return "12D3KooWNMYPSuNadceoKsJ6oUQcxGcfiAsHNpVTt1RQ1zSrKKpo"; // signers[3]
            else if (address === "plebbit.eth" && textRecord === "plebbit-author-address")
                return "12D3KooWJJcSwMHrFvsFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // signers[6]
            else if (address === "rpc-edit-test.eth" && textRecord === "subplebbit-address")
                return "12D3KooWMZPQsQdYtrakc4D1XtzGXwN1X3DBnAobcCjcPYYXTB6o"; // signers[7]
            else if (address === "different-signer.eth" && textRecord === "subplebbit-address")
                return (await plebbit.createSigner()).address;
            else if (address === "estebanabaroa.eth" && textRecord === "plebbit-author-address")
                return "12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z";
            else
                return null;
        };
    if (stubStorage) {
        plebbit._storage.getItem = () => undefined;
        plebbit._storage.setItem = () => undefined;
    }
    // TODO should have multiple pubsub providers here to emulate a real browser/mobile environment
    if (!plebbitOptions?.pubsubHttpClientsOptions || forceMockPubsub)
        for (const pubsubUrl of Object.keys(plebbit.clients.pubsubClients))
            plebbit.clients.pubsubClients[pubsubUrl]._client = createMockIpfsClient();
    plebbit.on("error", () => { });
    return plebbit;
}
export async function mockRemotePlebbit(plebbitOptions) {
    const plebbit = await mockPlebbit(plebbitOptions);
    plebbit._canCreateNewLocalSub = () => false;
    return plebbit;
}
export async function createOnlinePlebbit(plebbitOptions) {
    const plebbit = await PlebbitIndex({
        ipfsHttpClientsOptions: ["http://localhost:15003/api/v0"],
        pubsubHttpClientsOptions: ["http://localhost:15003/api/v0"],
        ...plebbitOptions
    }); // use online ipfs node
    return plebbit;
}
export async function mockRemotePlebbitIpfsOnly(plebbitOptions) {
    const plebbit = await mockRemotePlebbit({
        ipfsHttpClientsOptions: ["http://localhost:15001/api/v0"],
        plebbitRpcClientsOptions: undefined,
        ...plebbitOptions
    });
    plebbit._canCreateNewLocalSub = () => false;
    return plebbit;
}
export async function mockRpcServerPlebbit(plebbitOptions) {
    const plebbit = await mockPlebbit(plebbitOptions);
    return plebbit;
}
export async function mockGatewayPlebbit(plebbitOptions) {
    // Keep only pubsub and gateway
    const plebbit = await mockRemotePlebbit({
        ipfsGatewayUrls: ["http://localhost:18080"],
        plebbitRpcClientsOptions: undefined,
        ...plebbitOptions
    });
    delete plebbit.clients.ipfsClients;
    delete plebbit.ipfsHttpClientsOptions;
    delete plebbit._clientsManager.clients.ipfsClients;
    delete plebbit.plebbitRpcClient;
    delete plebbit.plebbitRpcClientsOptions;
    plebbit._clientsManager._defaultPubsubProviderUrl = plebbit._clientsManager._defaultIpfsProviderUrl = undefined;
    return plebbit;
}
export async function mockMultipleGatewaysPlebbit(plebbitOptions) {
    return mockGatewayPlebbit({ ipfsGatewayUrls: [], ...plebbitOptions });
}
export async function publishRandomReply(parentComment, plebbit, commentProps, verifyCommentPropsInParentPages = true) {
    const reply = await generateMockComment(parentComment, plebbit, false, {
        content: `Content ${uuidv4()}`,
        ...commentProps
    });
    await publishWithExpectedResult(reply, true);
    if (verifyCommentPropsInParentPages)
        await waitTillCommentIsInParentPages(reply, plebbit);
    return reply;
}
export async function publishRandomPost(subplebbitAddress, plebbit, postProps, verifyCommentPropsInParentPages = true) {
    const post = await generateMockPost(subplebbitAddress, plebbit, false, {
        content: `Random post Content ${uuidv4()} ${lodash.uniqueId()}`,
        title: `Random post Title ${uuidv4()} ${lodash.uniqueId()}`,
        ...postProps
    });
    await publishWithExpectedResult(post, true);
    if (verifyCommentPropsInParentPages)
        await waitTillCommentIsInParentPages(post, plebbit);
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
    let receivedResponse = false;
    await publication.publish();
    await new Promise((resolve, reject) => {
        setTimeout(() => !receivedResponse && reject(`Publication did not receive any response`), 90000); // throw after 20 seconds if we haven't received a response
        publication.once("challengeverification", (verificationMsg) => {
            receivedResponse = true;
            if (verificationMsg.challengeSuccess !== expectedChallengeSuccess) {
                const msg = `Expected challengeSuccess to be (${expectedChallengeSuccess}) and got (${verificationMsg.challengeSuccess}). Reason (${verificationMsg.reason}): ${JSON.stringify(lodash.omit(verificationMsg, ["encrypted", "signature", "challengeRequestId"]))}`;
                reject(msg);
            }
            else if (expectedReason && expectedReason !== verificationMsg.reason) {
                const msg = `Expected reason to be (${expectedReason}) and got (${verificationMsg.reason}): ${JSON.stringify(lodash.omit(verificationMsg, ["encrypted", "signature", "challengeRequestId"]))}`;
                reject(msg);
            }
            else
                resolve(1);
        });
    });
}
export async function findCommentInPage(commentCid, pageCid, pages) {
    let currentPageCid = lodash.clone(pageCid);
    while (currentPageCid) {
        const loadedPage = await pages.getPage(currentPageCid);
        const commentInPage = loadedPage.comments.find((c) => c.cid === commentCid);
        if (commentInPage)
            return commentInPage;
        currentPageCid = loadedPage.nextCid;
    }
    return undefined;
}
export async function waitTillCommentIsInParentPages(comment, plebbit, propsToCheckFor = {}, checkInAllPages = false) {
    const parent = comment.depth === 0
        ? await plebbit.getSubplebbit(comment.subplebbitAddress)
        : await plebbit.createComment({ cid: comment.parentCid });
    await parent.update();
    const pagesInstance = () => (parent instanceof RemoteSubplebbit ? parent.posts : parent.replies);
    let commentInPage;
    const isCommentInParentPages = async () => {
        const repliesPageCid = pagesInstance()?.pageCids?.new;
        if (repliesPageCid)
            commentInPage = await findCommentInPage(comment.cid, repliesPageCid, pagesInstance());
        return Boolean(commentInPage);
    };
    await resolveWhenConditionIsTrue(parent, isCommentInParentPages);
    await parent.stop();
    const pageCids = parent instanceof Comment ? parent.replies.pageCids : parent.posts.pageCids;
    assert(lodash.isPlainObject(pageCids));
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
export async function createSubWithNoChallenge(props, plebbit) {
    const sub = await plebbit.createSubplebbit(props);
    await sub.edit({ settings: { challenges: undefined } }); // No challenge
    return sub;
}
export async function generatePostToAnswerMathQuestion(props, plebbit) {
    const mockPost = await generateMockPost(props.subplebbitAddress, plebbit, false, props);
    mockPost.removeAllListeners();
    mockPost.once("challenge", (challengeMessage) => {
        mockPost.publishChallengeAnswers(["2"]);
    });
    return mockPost;
}
export function isRpcFlagOn() {
    const isPartOfProcessEnv = globalThis?.["process"]?.env?.["USE_RPC"] === "1";
    const isPartOfKarmaArgs = globalThis?.["__karma__"]?.config?.config?.["USE_RPC"] === "1";
    const isRpcFlagOn = isPartOfKarmaArgs || isPartOfProcessEnv;
    return isRpcFlagOn;
}
export async function resolveWhenConditionIsTrue(toUpdate, predicate) {
    // should add a timeout?
    if (!(await predicate()))
        await new Promise((resolve) => {
            toUpdate.on("update", async () => {
                const conditionStatus = await predicate();
                if (conditionStatus)
                    resolve(conditionStatus);
            });
        });
}
// Not used in actual plebbit-js code, just for testing
export function differenceBetweenTwoObjects(object, base) {
    return lodash.transform(object, (result, value, key) => {
        if (!lodash.isEqual(value, base[key])) {
            result[key] = lodash.isObject(value) && lodash.isObject(base[key]) ? differenceBetweenTwoObjects(value, base[key]) : value;
        }
    });
}
//# sourceMappingURL=test-util.js.map