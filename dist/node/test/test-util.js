import PlebbitIndex from "../index.js";
import { calculateStringSizeSameAsIpfsAddCidV0, removeUndefinedValuesRecursively, retryKuboIpfsAdd, timestamp } from "../util.js";
import assert from "assert";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { v4 as uuidv4 } from "uuid";
import { createMockPubsubClient } from "./mock-ipfs-client.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import pTimeout from "p-timeout";
import { signComment, _signJson, signCommentEdit, cleanUpBeforePublishing, _signPubsubMsg, signChallengeVerification, signSubplebbit } from "../signer/signatures.js";
import { findCommentInHierarchicalPageIpfsRecursively, findCommentInPageInstance, mapPageIpfsCommentToPageJsonComment, TIMEFRAMES_TO_SECONDS } from "../pages/util.js";
import { importSignerIntoKuboNode } from "../runtime/node/util.js";
import { getIpfsKeyFromPrivateKey } from "../signer/util.js";
import { Buffer } from "buffer";
import { encryptEd25519AesGcm, encryptEd25519AesGcmPublicKeyBuffer } from "../signer/encryption.js";
import env from "../version.js";
import { PlebbitError } from "../plebbit-error.js";
export function createPendingApprovalChallenge(overrides = {}) {
    const { options, exclude, ...rest } = overrides;
    return {
        ...rest,
        name: rest.name ?? "question",
        options: {
            question: "Pending approval password?",
            answer: "pending",
            ...(options ?? {})
        },
        pendingApproval: rest.pendingApproval ?? true,
        exclude: exclude ?? [{ role: ["moderator"] }]
    };
}
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
    let sortedCommentsPage = await pagesInstance.getPage({ cid: pageCid });
    let sortedComments = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage({ cid: sortedCommentsPage.nextCid });
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}
export async function loadAllPagesBySortName(pageSortName, pagesInstance) {
    if (!pageSortName)
        throw Error("Can't load all pages with undefined pageSortName");
    if (Object.keys(pagesInstance.pageCids).length === 0 && pagesInstance.pages && pagesInstance.pages[pageSortName])
        return pagesInstance.pages[pageSortName].comments;
    let sortedCommentsPage = (pagesInstance.pages && pagesInstance.pages[pageSortName]) ||
        (await pagesInstance.getPage({ cid: pagesInstance.pageCids[pageSortName] }));
    let sortedComments = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage({ cid: sortedCommentsPage.nextCid });
        //@ts-expect-error
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}
export async function loadAllUniquePostsUnderSubplebbit(subplebbit) {
    if (Object.keys(subplebbit.posts.pageCids).length === 0 && Object.keys(subplebbit.posts.pages).length === 0)
        return [];
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
    const subplebbit = (await createSubWithNoChallenge({ signer }, plebbit));
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
    const mainSub = (await createSubWithNoChallenge({ signer: props.signers[0] }, plebbit)); // most publications will be on this sub
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
    const subWithNoResponse = (await createSubWithNoChallenge({ signer: props.signers[4] }, plebbit));
    await subWithNoResponse.start();
    await new Promise((resolve) => subWithNoResponse.once("update", resolve));
    await subWithNoResponse.stop();
    const plebbitNoMockedSub = await mockPlebbit({ kuboRpcClientsOptions: ["http://localhost:15002/api/v0"], pubsubKuboRpcClientsOptions: ["http://localhost:15002/api/v0"] }, false, true, true);
    const mathCliSubWithNoMockedPubsub = await _startMathCliSubplebbit(props.signers[5], plebbitNoMockedSub);
    await new Promise((resolve) => mathCliSubWithNoMockedPubsub.once("update", resolve));
    const subForPurge = (await createSubWithNoChallenge({ signer: props.signers[6] }, plebbit));
    await subForPurge.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
    await subForPurge.start();
    await new Promise((resolve) => subForPurge.once("update", resolve));
    const subForRemove = (await createSubWithNoChallenge({ signer: props.signers[7] }, plebbit));
    await subForRemove.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
    await subForRemove.start();
    await new Promise((resolve) => subForRemove.once("update", resolve));
    const subForDelete = (await createSubWithNoChallenge({ signer: props.signers[8] }, plebbit));
    await subForDelete.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
    await subForDelete.start();
    await new Promise((resolve) => subForDelete.once("update", resolve));
    const subForChainProviders = (await createSubWithNoChallenge({ signer: props.signers[9] }, plebbit));
    await subForChainProviders.start();
    await new Promise((resolve) => subForChainProviders.once("update", resolve));
    const subForEditContent = (await createSubWithNoChallenge({ signer: props.signers[10] }, plebbit));
    await subForEditContent.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
    await subForEditContent.start();
    await new Promise((resolve) => subForEditContent.once("update", resolve));
    const subForLocked = (await createSubWithNoChallenge({ signer: props.signers[11] }, plebbit));
    await subForLocked.edit({
        roles: {
            [props.signers[1].address]: { role: "owner" },
            [props.signers[2].address]: { role: "admin" },
            [props.signers[3].address]: { role: "moderator" }
        }
    });
    await subForLocked.start();
    await new Promise((resolve) => subForLocked.once("update", resolve));
    return {
        onlineSub: onlineSub,
        mathSub: mathSub,
        ensSub: ensSub,
        mainSub: mainSub,
        NoPubsubResponseSub: subWithNoResponse,
        mathCliSubWithNoMockedPubsub: mathCliSubWithNoMockedPubsub,
        subForPurge: subForPurge,
        subForRemove: subForRemove,
        subForDelete: subForDelete,
        subForChainProviders: subForChainProviders,
        subForEditContent: subForEditContent,
        subForLocked: subForLocked
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
    if (plebbitOptions?.plebbitRpcClientsOptions && plebbitOptions?.kuboRpcClientsOptions)
        throw Error("Can't have both kubo and RPC config. Is this a mistake?");
    if (plebbitOptions?.plebbitRpcClientsOptions && plebbitOptions?.libp2pJsClientsOptions)
        throw Error("Can't have both libp2p and RPC config. Is this a mistake?");
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
        for (const pubsubUrl of remeda.keys.strict(plebbit.clients.pubsubKuboRpcClients)) {
            const mockClient = createMockPubsubClient();
            plebbit.clients.pubsubKuboRpcClients[pubsubUrl]._client = mockClient;
            plebbit.clients.pubsubKuboRpcClients[pubsubUrl].destroy = mockClient.destroy.bind(mockClient);
        }
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
export async function mockPlebbitNoDataPathWithOnlyKuboClientNoAdd(opts) {
    const plebbit = await mockPlebbitV2({
        ...opts,
        plebbitOptions: {
            kuboRpcClientsOptions: ["http://localhost:15001/api/v0"],
            plebbitRpcClientsOptions: undefined,
            dataPath: undefined,
            ...opts?.plebbitOptions
        }
    });
    Object.values(plebbit.clients.kuboRpcClients)[0]._client.add = () => {
        throw Error("Add is not supported");
    };
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
            libp2pJsClientsOptions: undefined,
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
    const emittedErrors = [];
    const timeoutMs = 60000;
    const summarizePublication = () => removeUndefinedValuesRecursively({
        type: publication.constructor?.name,
        cid: publication.cid,
        parentCid: publication.parentCid,
        subplebbitAddress: publication.subplebbitAddress,
        signerAddress: publication.signer?.address,
        commentModeration: publication.commentModeration
            ? remeda.pick(publication.commentModeration, ["approved", "reason", "spoiler", "nsfw", "pinned", "removed"])
            : undefined
    });
    publication.on("error", (err) => emittedErrors.push(err));
    let cleanupChallengeVerificationListener;
    const challengeVerificationPromise = new Promise((resolve, reject) => {
        const challengeVerificationListener = (verificationMsg) => {
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
        };
        publication.on("challengeverification", challengeVerificationListener);
        cleanupChallengeVerificationListener = () => {
            if (typeof publication.off === "function")
                publication.off("challengeverification", challengeVerificationListener);
            else
                publication.removeListener("challengeverification", challengeVerificationListener);
        };
    });
    const error = new Error("Publication did not receive response");
    //@ts-expect-error
    error.details = {
        publication: summarizePublication(),
        expectedChallengeSuccess,
        expectedReason,
        waitTime: timeoutMs,
        emittedErrorsOnPublicationInstance: emittedErrors
    };
    const validateResponsePromise = pTimeout(challengeVerificationPromise, {
        milliseconds: timeoutMs,
        message: error
    });
    await publication.publish();
    try {
        await validateResponsePromise;
    }
    catch (error) {
        throw error;
    }
    finally {
        cleanupChallengeVerificationListener?.();
    }
}
export async function iterateThroughPageCidToFindComment(commentCid, pageCid, pages) {
    if (!commentCid)
        throw Error("Can't find comment with undefined commentCid");
    if (!pageCid)
        throw Error("Can't find comment with undefined pageCid");
    let currentPageCid = remeda.clone(pageCid);
    while (currentPageCid) {
        const loadedPage = (await pages.getPage({ cid: currentPageCid }));
        const commentInPage = loadedPage.comments.find((c) => c.cid === commentCid);
        if (commentInPage)
            return commentInPage;
        currentPageCid = loadedPage.nextCid;
    }
    return undefined;
}
export async function findCommentInSubplebbitInstancePagesPreloadedAndPageCids(opts) {
    // TODO need to handle, what if the comment is nested deep down the subplebbit.posts tree and doesn't appear in preloaded page
    // code below doesn't handle it
    const { sub, comment } = opts;
    if (!sub)
        throw Error("Failed to provide opts.sub");
    if (!comment)
        throw Error("Failed to provde opts.comment");
    if (Object.keys(sub.posts.pageCids).length === 0 && Object.keys(sub.posts.pages).length > 0) {
        // it's a single preloaded page
        const loadedAllHotPagesComments = (await loadAllPagesBySortName(Object.keys(sub.posts.pages)[0], sub.posts));
        const pageIpfs = {
            comments: loadedAllHotPagesComments.map((c) => c.raw)
        };
        const postInPage = findCommentInHierarchicalPageIpfsRecursively(pageIpfs, comment.cid);
        if (postInPage)
            return mapPageIpfsCommentToPageJsonComment(postInPage);
        else
            return undefined;
    }
    else if (Object.keys(sub.posts?.pageCids).length > 0) {
        const postsNewPageCid = sub.posts.pageCids.new;
        const postInPageCid = await iterateThroughPageCidToFindComment(comment.cid, postsNewPageCid, sub.posts);
        return postInPageCid;
    }
    else
        return undefined;
}
export async function findReplyInParentCommentPagesInstancePreloadedAndPageCids(opts) {
    const { parentComment, reply } = opts;
    const log = Logger("plebbit-js:test-util:waitTillReplyInParentPagesInstance");
    if (reply?.parentCid !== parentComment?.cid)
        throw Error("You need to provide a reply that's direct child of parentComment");
    log("waiting for reply", reply.cid, "in parent comment", parentComment.cid, "replyCount of parent comment", parentComment.replyCount);
    if (Object.keys(parentComment.replies.pageCids).length === 0 && Object.keys(parentComment.replies.pages).length > 0) {
        // it's a single preloaded page
        const loadedAllBestPagesComments = (await loadAllPagesBySortName(Object.keys(parentComment.replies.pages)[0], parentComment.replies));
        const pageIpfs = {
            comments: loadedAllBestPagesComments.map((c) => c.raw)
        };
        const replyInPage = findCommentInHierarchicalPageIpfsRecursively(pageIpfs, reply.cid);
        if (replyInPage)
            return mapPageIpfsCommentToPageJsonComment(replyInPage);
        else
            return undefined;
    }
    else {
        if (!("new" in parentComment.replies.pageCids)) {
            console.error("no new page", "parentComment.replies.pageCids", parentComment.replies.pageCids);
            return undefined;
        }
        const commentNewPageCid = parentComment.replies.pageCids.new;
        const replyInPage = await iterateThroughPageCidToFindComment(reply.cid, commentNewPageCid, parentComment.replies);
        return replyInPage;
    }
}
export async function waitTillPostInSubplebbitInstancePages(post, sub) {
    if (sub.state === "stopped")
        await sub.update();
    await resolveWhenConditionIsTrue({
        toUpdate: sub,
        predicate: async () => Boolean(await findCommentInSubplebbitInstancePagesPreloadedAndPageCids({ comment: post, sub }))
    });
}
export async function waitTillPostInSubplebbitPages(post, plebbit) {
    const sub = await plebbit.getSubplebbit({ address: post.subplebbitAddress });
    await sub.update();
    await waitTillPostInSubplebbitInstancePages(post, sub);
    await sub.stop();
}
export async function iterateThroughPagesToFindCommentInParentPagesInstance(commentCid, pages) {
    const preloadedPage = Object.keys(pages.pages)[0];
    const commentInPage = findCommentInPageInstance(pages, commentCid);
    if (commentInPage)
        return mapPageIpfsCommentToPageJsonComment(commentInPage);
    if (pages.pages[preloadedPage]?.nextCid || pages.pageCids.new) {
        // means we have multiple pages
        return iterateThroughPageCidToFindComment(commentCid, pages.pageCids.new, pages);
    }
    else
        return undefined;
}
export async function waitTillReplyInParentPagesInstance(reply, parentComment) {
    if (parentComment.state === "stopped")
        throw Error("Parent comment is stopped, can't wait for reply in parent pages");
    if (!reply.cid)
        throw Error("reply.cid need to be defined so we can find it in parent pages");
    await resolveWhenConditionIsTrue({
        toUpdate: parentComment,
        predicate: async () => Boolean(await findReplyInParentCommentPagesInstancePreloadedAndPageCids({ reply, parentComment }))
    });
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
    const hasWindow = typeof globalThis["window"] !== "undefined";
    const hasDocument = typeof globalThis["window"]?.["document"] !== "undefined";
    const isNodeProcess = typeof globalThis["process"] !== "undefined" && Boolean(globalThis["process"]?.versions?.node);
    const isJsDom = typeof globalThis["navigator"]?.userAgent === "string" && globalThis["navigator"].userAgent.includes("jsdom");
    return hasWindow && hasDocument && !isNodeProcess && !isJsDom;
}
export async function resolveWhenConditionIsTrue(options) {
    if (!options) {
        throw Error("resolveWhenConditionIsTrue requires an options object");
    }
    const { toUpdate, predicate, eventName = "update" } = options;
    if (!toUpdate) {
        throw Error("resolveWhenConditionIsTrue options.toUpdate is required");
    }
    if (typeof predicate !== "function") {
        throw Error("resolveWhenConditionIsTrue options.predicate must be a function");
    }
    const normalizedEventName = eventName || "update";
    // should add a timeout?
    const listenerPromise = new Promise(async (resolve) => {
        const listener = async () => {
            try {
                const conditionStatus = await predicate();
                if (conditionStatus) {
                    resolve(conditionStatus);
                    toUpdate.removeListener(normalizedEventName, listener);
                }
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        };
        toUpdate.on(normalizedEventName, listener);
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
    comment.signature = pubsubPublication.signature = await signComment({
        comment: removeUndefinedValuesRecursively({ ...comment.toJSONPubsubMessagePublication(), signer: comment.signer }),
        plebbit: comment._plebbit
    });
    comment.raw.pubsubMessageToPublish = pubsubPublication;
    disableValidationOfSignatureBeforePublishing(comment);
}
export async function overrideCommentEditInstancePropsAndSign(commentEdit, props) {
    if (!commentEdit.signer)
        throw Error("Need commentEdit.signer to overwrite the signature");
    //@ts-expect-error
    for (const optionKey of Object.keys(props))
        commentEdit[optionKey] = props[optionKey];
    commentEdit.signature = await signCommentEdit({
        edit: removeUndefinedValuesRecursively({ ...commentEdit.toJSONPubsubMessagePublication(), signer: commentEdit.signer }),
        plebbit: commentEdit._plebbit
    });
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
        const signature = await _signPubsubMsg({ signedPropertyNames, msg: requestWithExtraProps, signer, log });
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
    const signature = await _signPubsubMsg({ signedPropertyNames, msg: toSignAnswer, signer, log });
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
    const signature = await _signPubsubMsg({
        signedPropertyNames: signedPropertyNames,
        msg: toSignChallenge,
        signer: pubsubSigner,
        log
    });
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
    const signature = await _signPubsubMsg({
        signedPropertyNames: signedPropertyNames,
        msg: toSignChallengeVerification,
        signer: pubsubSigner,
        log
    });
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
    const signature = await signChallengeVerification({ challengeVerification: toSignChallengeVerification, signer: pubsubSigner });
    await publishOverPubsub(pubsubSigner.address, { ...toSignChallengeVerification, signature });
}
export async function addStringToIpfs(content) {
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    const ipfsClient = plebbit._clientsManager.getDefaultKuboRpcClient();
    const cid = (await retryKuboIpfsAdd({ content, ipfsClient: ipfsClient._client, log: Logger("plebbit-js:test-util:addStringToIpfs") }))
        .path;
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
            libp2pJsClientsOptions: [{ key, libp2pOptions: { connectionGater: { denyDialMultiaddr: async () => false } } }],
            pubsubKuboRpcClientsOptions: [],
            kuboRpcClientsOptions: [],
            plebbitRpcClientsOptions: undefined,
            httpRoutersOptions: ["http://localhost:20001"], // this http router transmits the addresses of kubo node of test-server.js
            dataPath: undefined,
            ...opts?.plebbitOptions
        }
    });
    if (forceMockPubsub) {
        const mockedPubsubClient = createMockPubsubClient();
        const heliaLibp2pJsClient = heliaPlebbit.clients.libp2pJsClients[Object.keys(heliaPlebbit.clients.libp2pJsClients)[0]];
        heliaLibp2pJsClient.heliaWithKuboRpcClientFunctions.pubsub = mockedPubsubClient.pubsub; // that should work for publishing/subscribing
        const originalStop = heliaLibp2pJsClient._helia.stop.bind(heliaLibp2pJsClient._helia);
        heliaLibp2pJsClient._helia.stop = async () => {
            await originalStop();
            await mockedPubsubClient.destroy();
        };
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
        plebbitInstancePromise: (args) => mockPlebbitV2({
            ...args,
            plebbitOptions: {
                ...args?.plebbitOptions,
                plebbitRpcClientsOptions: undefined,
                kuboRpcClientsOptions: ["http://localhost:15001/api/v0"],
                pubsubKuboRpcClientsOptions: ["http://localhost:15001/api/v0"],
                ipfsGatewayUrls: undefined
            }
        }),
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
        process.setMaxListeners(100);
        process.on("uncaughtException", (...err) => {
            console.error("uncaughtException", ...err);
        });
        process.on("unhandledRejection", (...err) => {
            console.error("unhandledRejection", ...err);
        });
    }
}
export function getAvailablePlebbitConfigsToTestAgainst(opts) {
    if (opts?.includeAllPossibleConfigOnEnv) {
        // if node, ["local-kubo-rpc", "remote-kubo-rpc", "remote-libp2pjs", "remote-ipfs-gateway"], also 'remote-plebbit-rpc' if isRpcFlagOn()
        // if browser, ["remote-kubo-rpc", "remote-libp2pjs", "remote-ipfs-gateway"]
        const isBrowser = isRunningInBrowser();
        const plebbitConfigCodes = isBrowser
            ? ["remote-kubo-rpc", "remote-libp2pjs", "remote-ipfs-gateway"]
            : ["local-kubo-rpc", "remote-kubo-rpc", "remote-libp2pjs", "remote-ipfs-gateway"];
        if (!isBrowser && isRpcFlagOn())
            plebbitConfigCodes.push("remote-plebbit-rpc");
        const availableConfigs = remeda.pick(testConfigCodeToPlebbitInstanceWithHumanName, plebbitConfigCodes);
        if (opts.includeOnlyTheseTests?.length) {
            return Object.values(remeda.pick(availableConfigs, opts.includeOnlyTheseTests));
        }
        return Object.values(availableConfigs);
    }
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
        const configs = filteredKeys.map((config) => testConfigCodeToPlebbitInstanceWithHumanName[config]);
        return configs;
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
    const actualSub = await ipnsObj.plebbit.getSubplebbit({ address: "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z" });
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
        ...(await ipnsObj.plebbit.getSubplebbit({ address: "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z" })).toJSONIpfs(),
        posts: undefined,
        address: ipnsObj.signer.address,
        pubsubTopic: ipnsObj.signer.address,
        ...subplebbitOpts
    }; // default sub, will be using its props
    if (!subplebbitRecord.posts)
        delete subplebbitRecord.posts;
    subplebbitRecord.signature = await signSubplebbit({ subplebbit: subplebbitRecord, signer: ipnsObj.signer });
    await ipnsObj.publishToIpns(JSON.stringify(subplebbitRecord));
    await ipnsObj.plebbit.destroy();
    return { subplebbitRecord, ipnsObj };
}
export async function createStaticSubplebbitRecordForComment(opts) {
    const { plebbit, commentOptions = {}, invalidateSubplebbitSignature = false } = opts || {};
    if (commentOptions.parentCid && !commentOptions.postCid)
        throw Error("postCid must be provided when parentCid is supplied for a reply");
    const ipnsObj = await createNewIpns();
    let subplebbitRecord;
    try {
        subplebbitRecord = {
            ...(await ipnsObj.plebbit.getSubplebbit({ address: "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z" })).toJSONIpfs(),
            posts: undefined,
            address: ipnsObj.signer.address,
            pubsubTopic: ipnsObj.signer.address
        };
        if (!subplebbitRecord.posts)
            delete subplebbitRecord.posts;
        subplebbitRecord.signature = await signSubplebbit({ subplebbit: subplebbitRecord, signer: ipnsObj.signer });
        if (invalidateSubplebbitSignature)
            subplebbitRecord.updatedAt = (subplebbitRecord.updatedAt || timestamp()) + 1234;
        await ipnsObj.publishToIpns(JSON.stringify(subplebbitRecord));
    }
    finally {
        await ipnsObj.plebbit.destroy();
    }
    const commentPlebbit = plebbit || (await mockPlebbitNoDataPathWithOnlyKuboClient());
    const shouldDestroyCommentPlebbit = !plebbit;
    try {
        const commentToPublish = await commentPlebbit.createComment({
            ...commentOptions,
            signer: commentOptions.signer || (await commentPlebbit.createSigner()),
            subplebbitAddress: subplebbitRecord.address,
            title: commentOptions.title ?? `Mock Post - ${Date.now()}`,
            content: commentOptions.content ?? `Mock content - ${Date.now()}`
        });
        const depth = typeof commentOptions.depth === "number" ? commentOptions.depth : commentOptions.parentCid ? 1 : 0;
        const commentIpfs = { ...commentToPublish.raw.pubsubMessageToPublish, depth };
        if (commentOptions.parentCid) {
            commentIpfs.parentCid = commentOptions.parentCid;
            commentIpfs.postCid = commentOptions.postCid;
        }
        const commentCid = await addStringToIpfs(JSON.stringify(commentIpfs));
        return { commentCid, subplebbitAddress: subplebbitRecord.address };
    }
    finally {
        if (shouldDestroyCommentPlebbit)
            await commentPlebbit.destroy();
    }
}
export function jsonifySubplebbitAndRemoveInternalProps(sub) {
    const jsonfied = JSON.parse(JSON.stringify(sub));
    delete jsonfied["posts"]["clients"];
    delete jsonfied["modQueue"]["clients"];
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
export function disablePreloadPagesOnSub({ subplebbit }) {
    if (!(subplebbit instanceof LocalSubplebbit))
        throw Error("You need to provide LocalSubplebbit instance");
    //@ts-expect-error
    const pageGenerator = subplebbit._pageGenerator;
    const originalSubplebbitPostsFunc = pageGenerator.generateSubplebbitPosts.bind(pageGenerator);
    const originalPostRepliesFunc = pageGenerator.generatePostPages.bind(pageGenerator);
    const originalReplyRepliesFunc = pageGenerator.generateReplyPages.bind(pageGenerator);
    const originalChunkComments = pageGenerator._chunkComments.bind(pageGenerator);
    pageGenerator.generateSubplebbitPosts = async (preloadedPageSortName, preloadedPageSize) => {
        return originalSubplebbitPostsFunc(preloadedPageSortName, preloadedPageSize); // should force sub to publish to pageCids
    };
    pageGenerator.generatePostPages = async (comment, preloadedPageSortName, preloadedPageSize) => {
        return originalPostRepliesFunc(comment, preloadedPageSortName, preloadedPageSize); // should force sub to publish to pageCids
    };
    pageGenerator.generateReplyPages = async (comment, preloadedPageSortName, preloadedPageSize) => {
        return originalReplyRepliesFunc(comment, preloadedPageSortName, preloadedPageSize);
    };
    //@ts-expect-error
    pageGenerator._chunkComments = async (opts) => {
        const res = await originalChunkComments(opts);
        return [[], ...res];
    };
    const cleanup = () => {
        pageGenerator.generateSubplebbitPosts = originalSubplebbitPostsFunc;
        pageGenerator.generatePostPages = originalPostRepliesFunc;
        pageGenerator.generateReplyPages = originalReplyRepliesFunc;
        pageGenerator._chunkComments = originalChunkComments;
    };
    return { cleanup };
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
    const comment = await plebbit.getComment({ cid: commentCid });
    await comment.update();
    await resolveWhenConditionIsTrue({ toUpdate: comment, predicate: async () => typeof comment.updatedAt === "number" });
    const invalidCommentUpdateJson = comment.raw.commentUpdate;
    await comment.stop();
    invalidCommentUpdateJson.updatedAt += 1234; // Invalidate CommentUpdate signature
    return invalidCommentUpdateJson;
}
export function mockPlebbitToTimeoutFetchingCid(plebbit) {
    const originalFetch = plebbit._clientsManager._fetchCidP2P;
    const restoreFns = [];
    for (const ipfsClient of Object.values(plebbit.clients.kuboRpcClients)) {
        const originalCat = ipfsClient._client.cat;
        ipfsClient._client.cat = async function* (ipfsPath, options) {
            await new Promise((resolve) => setTimeout(resolve, plebbit._timeouts["subplebbit-ipfs"] * 2));
            return undefined;
        };
        restoreFns.push(() => {
            ipfsClient._client.cat = originalCat;
        });
    }
    for (const libp2pJsClient of Object.values(plebbit.clients.libp2pJsClients)) {
        const originalCat = libp2pJsClient.heliaWithKuboRpcClientFunctions.cat;
        libp2pJsClient.heliaWithKuboRpcClientFunctions.cat = async function* (ipfsPath, options) {
            await new Promise((resolve) => setTimeout(resolve, plebbit._timeouts["subplebbit-ipfs"] * 2));
            return undefined;
        };
        restoreFns.push(() => {
            libp2pJsClient.heliaWithKuboRpcClientFunctions.cat = originalCat;
        });
    }
    // TODO mock for gateway
    // plebbit._clientsManager._fetchCidP2P = async (...args) => {
    //     await new Promise((resolve) => setTimeout(resolve, plebbit._timeouts["subplebbit-ipfs"] * 2));
    //     return undefined;
    // };
    return {
        cleanUp: () => {
            plebbit._clientsManager._fetchCidP2P = originalFetch;
            for (const restore of restoreFns)
                restore();
        }
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
const FORCE_SUBPLEBBIT_MIN_POST_CONTENT_BYTES = 30 * 1024;
function ensureLocalSubplebbitForForcedChunking(subplebbit) {
    if (!subplebbit)
        throw Error("Local subplebbit instance is required to force reply pages to use page cids");
    if (!(subplebbit instanceof LocalSubplebbit))
        throw Error("Forcing reply page chunking is only supported when using a LocalSubplebbit");
}
export async function forceLocalSubPagesToAlwaysGenerateMultipleChunks({ subplebbit, parentComment, forcedPreloadedPageSizeBytes = 1, parentCommentReplyProps, subplebbitPostsCommentProps }) {
    if (!parentComment) {
        await forceSubplebbitToGenerateAllPostsPages(subplebbit, subplebbitPostsCommentProps);
        return { cleanup: () => { } };
    }
    ensureLocalSubplebbitForForcedChunking(subplebbit);
    const parentCid = parentComment.cid;
    if (!parentCid)
        throw Error("parent comment cid is required to force chunking to multiple pages");
    const localSubplebbit = subplebbit;
    const subplebbitWithGenerator = localSubplebbit;
    const pageGenerator = subplebbitWithGenerator["_pageGenerator"];
    if (!pageGenerator)
        throw Error("Local subplebbit page generator is not initialized");
    const isPost = parentComment.depth === 0;
    const originalGenerateReplyPages = pageGenerator.generateReplyPages;
    const originalGeneratePostPages = pageGenerator.generatePostPages;
    if (isPost) {
        if (typeof originalGeneratePostPages !== "function")
            throw Error("Page generator post pages function is not available");
        pageGenerator.generatePostPages = (async (comment, preloadedReplyPageSortName, preloadedPageSizeBytes) => {
            const shouldForce = comment?.cid === parentCid;
            const effectivePageSizeBytes = shouldForce
                ? Math.min(preloadedPageSizeBytes, forcedPreloadedPageSizeBytes)
                : preloadedPageSizeBytes;
            return originalGeneratePostPages.call(pageGenerator, comment, preloadedReplyPageSortName, effectivePageSizeBytes);
        });
    }
    else {
        if (typeof originalGenerateReplyPages !== "function")
            throw Error("Page generator reply pages function is not available");
        pageGenerator.generateReplyPages = (async (comment, preloadedReplyPageSortName, preloadedPageSizeBytes) => {
            const shouldForce = comment?.cid === parentCid;
            const effectivePageSizeBytes = shouldForce
                ? Math.min(preloadedPageSizeBytes, forcedPreloadedPageSizeBytes)
                : preloadedPageSizeBytes;
            return originalGenerateReplyPages.call(pageGenerator, comment, preloadedReplyPageSortName, effectivePageSizeBytes);
        });
    }
    const cleanup = () => {
        if (isPost && originalGeneratePostPages)
            pageGenerator.generatePostPages = originalGeneratePostPages;
        if (!isPost && originalGenerateReplyPages)
            pageGenerator.generateReplyPages = originalGenerateReplyPages;
    };
    try {
        if (Object.keys(parentComment.replies.pageCids).length === 0)
            await ensureParentCommentHasPageCidsForChunking(parentComment, {
                commentProps: parentCommentReplyProps,
                publishWithPlebbit: localSubplebbit._plebbit
            });
    }
    catch (err) {
        cleanup();
        throw err;
    }
    return { cleanup };
}
async function ensureParentCommentHasPageCidsForChunking(parentComment, options) {
    if (!parentComment?.cid)
        throw Error("parent comment cid should be defined before ensuring page cids");
    const hasPageCids = () => Object.keys(parentComment.replies.pageCids).length > 0;
    if (hasPageCids())
        return;
    const { commentProps, publishWithPlebbit } = options ?? {};
    const MAX_REPLIES_TO_PUBLISH = 5;
    for (let i = 0; i < MAX_REPLIES_TO_PUBLISH && !hasPageCids(); i++) {
        const replyProps = {
            ...commentProps,
            content: commentProps?.content ?? `force pagination reply ${i} ${Date.now()}`
        };
        const publishingPlebbit = publishWithPlebbit ?? parentComment._plebbit;
        await publishRandomReply(parentComment, publishingPlebbit, replyProps);
        await parentComment.update();
        await resolveWhenConditionIsTrue({
            toUpdate: parentComment,
            predicate: async () => hasPageCids()
        });
    }
    if (!hasPageCids())
        throw Error(`Failed to force parent comment ${parentComment.cid} to have replies.pageCids`);
}
export async function findOrPublishCommentWithDepth({ depth, subplebbit, plebbit }) {
    const plebbitWithDefault = plebbit || subplebbit._plebbit;
    let commentFromPreloadedPages;
    if (subplebbit.posts.pages.hot) {
        processAllCommentsRecursively(subplebbit.posts.pages.hot.comments, (comment) => {
            if (comment.depth === depth) {
                commentFromPreloadedPages = comment;
            }
        });
    }
    if (commentFromPreloadedPages)
        return plebbitWithDefault.createComment(commentFromPreloadedPages);
    let curComment;
    let closestCommentFromHot;
    if (subplebbit.posts.pages.hot) {
        let maxDepthFound = -1;
        processAllCommentsRecursively(subplebbit.posts.pages.hot.comments, (comment) => {
            const commentDepth = comment.depth ?? 0;
            if (commentDepth <= depth && commentDepth > maxDepthFound) {
                maxDepthFound = commentDepth;
                closestCommentFromHot = comment;
            }
        });
    }
    if (closestCommentFromHot) {
        curComment = await plebbitWithDefault.createComment(closestCommentFromHot);
    }
    else {
        curComment = await publishRandomPost(subplebbit.address, plebbitWithDefault);
    }
    if (curComment.depth === depth)
        return curComment;
    while (curComment.depth < depth) {
        curComment = await publishRandomReply(curComment, plebbitWithDefault, {});
        if (curComment.depth === depth)
            return curComment;
    }
    throw Error("Failed to find or publish comment with depth");
}
export async function findOrPublishCommentWithDepthWithHttpServerShortcut({ depth, subplebbit, plebbit }) {
    const plebbitWithDefault = plebbit || subplebbit._plebbit;
    const queryUrl = `http://localhost:14953/find-comment-with-depth?subAddress=${subplebbit.address}&commentDepth=${depth}`;
    const commentWithSameDepthOrClosest = await (await fetch(queryUrl)).json();
    if (commentWithSameDepthOrClosest.depth === depth) {
        return plebbitWithDefault.createComment(commentWithSameDepthOrClosest);
    }
    let curComment = await publishRandomReply(commentWithSameDepthOrClosest, plebbitWithDefault);
    while (curComment.depth < depth) {
        curComment = await publishRandomReply(curComment, plebbitWithDefault, {});
        if (curComment.depth === depth)
            return curComment;
    }
    throw Error("Failed to find or publish comment with depth");
}
export async function publishCommentWithDepth({ depth, subplebbit }) {
    if (depth === 0) {
        return publishRandomPost(subplebbit.address, subplebbit._plebbit);
    }
    else {
        const parentComment = await publishCommentWithDepth({ depth: depth - 1, subplebbit });
        let curComment = await publishRandomReply(parentComment, subplebbit._plebbit, {});
        if (curComment.depth === depth)
            return curComment;
        while (curComment.depth < depth) {
            curComment = await publishRandomReply(curComment, subplebbit._plebbit, {});
            if (curComment.depth === depth)
                return curComment;
        }
        throw Error("Failed to publish comment with depth");
    }
}
export async function getCommentWithCommentUpdateProps({ cid, plebbit }) {
    const comment = await plebbit.createComment({ cid });
    await comment.update();
    await resolveWhenConditionIsTrue({ toUpdate: comment, predicate: async () => Boolean(comment.updatedAt) });
    return comment;
}
export async function publishCommentToModQueue({ subplebbit, plebbit, parentComment, commentProps }) {
    if (!commentProps?.challengeRequest?.challengeAnswers)
        throw Error("You need to challengeRequest.challengeAnswers to pass the challenge and get to pending approval");
    const remotePlebbit = plebbit || (await mockGatewayPlebbit({ forceMockPubsub: true, remotePlebbit: true })); // this plebbit is not connected to kubo rpc client of subplebbit
    const pendingComment = parentComment
        ? await generateMockComment(parentComment, remotePlebbit, false, {
            content: "Pending reply" + " " + Math.random(),
            ...commentProps
        })
        : await generateMockPost(subplebbit.address, remotePlebbit, false, {
            content: "Pending post" + " " + Math.random(),
            ...commentProps
        });
    pendingComment.once("challenge", async () => {
        throw Error("Should not received challenge with challengeRequest props");
    });
    const challengeVerificationPromise = new Promise((resolve) => pendingComment.once("challengeverification", resolve));
    await publishWithExpectedResult(pendingComment, true); // a pending approval is technically challengeSucess = true
    if (!pendingComment.pendingApproval)
        throw Error("The comment did not go to pending approval");
    return { comment: pendingComment, challengeVerification: await challengeVerificationPromise };
}
export async function publishToModQueueWithDepth({ subplebbit, depth, plebbit, modCommentProps, commentProps }) {
    if (!commentProps?.challengeRequest?.challengeAnswers)
        throw Error("You need to challengeRequest.challengeAnswers to pass the challenge and get to pending approval");
    if (depth === 0)
        return publishCommentToModQueue({ subplebbit, plebbit, commentProps });
    else {
        // we assume mod can publish comments without mod queue
        const remotePlebbit = plebbit || subplebbit._plebbit;
        const commentsPublishedByMod = [await publishRandomPost(subplebbit.address, remotePlebbit, modCommentProps)];
        for (let i = 1; i < depth; i++) {
            commentsPublishedByMod.push(await publishRandomReply(commentsPublishedByMod[i - 1], remotePlebbit, modCommentProps));
        }
        // we have created a tree of comments and now we can publish the pending comment underneath it
        const pendingReply = await generateMockComment(commentsPublishedByMod[commentsPublishedByMod.length - 1], remotePlebbit, false, {
            content: "Pending reply" + " " + Math.random(),
            ...commentProps
        });
        pendingReply.once("challenge", () => {
            throw Error("Should not received challenge with challengeRequest props");
        });
        const challengeVerificationPromise = new Promise((resolve) => pendingReply.once("challengeverification", resolve));
        await publishWithExpectedResult(pendingReply, true); // a pending approval is technically challengeSucess = true
        if (!pendingReply.pendingApproval)
            throw Error("The reply did not go to pending approval");
        return { comment: pendingReply, challengeVerification: await challengeVerificationPromise };
    }
}
// This may not be needed
export async function forceSubplebbitToGenerateAllPostsPages(subplebbit, commentProps) {
    // max comment size is 40kb = 40000
    const rawSubplebbitRecord = subplebbit.toJSONIpfs();
    if (!rawSubplebbitRecord)
        throw Error("Subplebbit should be updating before forcing to generate all pages");
    subplebbit.setMaxListeners(100);
    if (Object.keys(subplebbit.posts.pageCids).length > 0)
        return;
    const curRecordSize = await calculateStringSizeSameAsIpfsAddCidV0(JSON.stringify(rawSubplebbitRecord));
    const maxCommentSize = 30000;
    const defaultContent = "x".repeat(FORCE_SUBPLEBBIT_MIN_POST_CONTENT_BYTES); // 30kb
    const paddedContent = typeof commentProps?.content === "string"
        ? commentProps.content.padEnd(FORCE_SUBPLEBBIT_MIN_POST_CONTENT_BYTES, "x")
        : defaultContent;
    const estimatedCommentSize = Math.max(maxCommentSize, Buffer.byteLength(paddedContent, "utf8"));
    const adjustedCommentProps = { ...commentProps, content: paddedContent };
    const numOfCommentsToPublish = Math.round((1024 * 1024 - curRecordSize) / estimatedCommentSize) + 1;
    let lastPublishedPost = await publishRandomPost(subplebbit.address, subplebbit._plebbit, adjustedCommentProps);
    await Promise.all(new Array(numOfCommentsToPublish).fill(null).map(async () => {
        const post = await publishRandomPost(subplebbit.address, subplebbit._plebbit, adjustedCommentProps);
        lastPublishedPost = post;
    }));
    await waitTillPostInSubplebbitPages(lastPublishedPost, subplebbit._plebbit);
    const newSubplebbit = await subplebbit._plebbit.getSubplebbit({ address: subplebbit.address });
    if (Object.keys(newSubplebbit.posts.pageCids).length === 0)
        throw Error("Failed to force the subplebbit to load all pages");
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
        if (postInstance.replies.pages)
            Object.keys(postInstance.replies.pages).forEach((preloadedPageKey) => {
                if (postInstance.replies.pages[preloadedPageKey]?.comments)
                    postInstance.replies.pages[preloadedPageKey].comments = [];
            });
        if (updatingSubInstance?.posts.pages)
            Object.keys(updatingSubInstance.posts.pages).forEach((preloadedPageKey) => {
                if (updatingSubInstance.posts.pages[preloadedPageKey]?.comments)
                    updatingSubInstance.posts.pages[preloadedPageKey].comments = [];
            });
        if (updatingParentInstance?.replies?.pages)
            Object.keys(updatingParentInstance.replies.pages).forEach((preloadedPageKey) => {
                if (updatingParentInstance.replies.pages[preloadedPageKey]?.comments)
                    updatingParentInstance.replies.pages[preloadedPageKey].comments = [];
            });
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
    const sub = await plebbit.getSubplebbit({ address: subplebbitAddress });
    const lastPostCid = sub.lastPostCid;
    if (!lastPostCid)
        throw Error("Subplebbit should have a last post cid");
    return lastPostCid;
}
const skipFunction = (_) => { };
skipFunction.skip = () => { };
//@ts-expect-error
export const describeSkipIfRpc = globalThis["describe"]?.runIf(!isRpcFlagOn());
//@ts-expect-error
export const describeIfRpc = globalThis["describe"]?.runIf(isRpcFlagOn());
//@ts-expect-error
export const itSkipIfRpc = globalThis["it"]?.runIf(!isRpcFlagOn());
//@ts-expect-error
export const itIfRpc = globalThis["it"]?.runIf(isRpcFlagOn());
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