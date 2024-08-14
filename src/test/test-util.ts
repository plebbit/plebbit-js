import PlebbitIndex from "../index.js";
import { removeUndefinedValuesRecursively, timestamp } from "../util.js";
import { Comment } from "../publications/comment/comment.js";
import { Plebbit } from "../plebbit.js";
import Vote from "../publications/vote/vote.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import type { InputPlebbitOptions } from "../types.js";
import assert from "assert";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import Publication from "../publications/publication.js";
import { v4 as uuidv4 } from "uuid";
import { createMockIpfsClient } from "./mock-ipfs-client.js";
import { EventEmitter } from "events";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
import { v4 as uuidV4 } from "uuid";
import * as resolverClass from "../resolver.js";
import type { CreateNewLocalSubplebbitUserOptions, LocalSubplebbitJson, RemoteSubplebbitJson } from "../subplebbit/types.js";
import type { SignerType } from "../signer/types.js";
import type { CreateVoteOptions } from "../publications/vote/types.js";
import type {
    CommentIpfsWithCidDefined,
    CommentIpfsWithCidPostCidDefined,
    CommentJson,
    CreateCommentOptions
} from "../publications/comment/types.js";
import { signComment, _signJson, signCommentEdit, cleanUpBeforePublishing, signVote, _signPubsubMsg } from "../signer/signatures.js";
import { BasePages } from "../pages/pages.js";
import { TIMEFRAMES_TO_SECONDS } from "../pages/util.js";
import { importSignerIntoIpfsNode } from "../runtime/node/util.js";
import { getIpfsKeyFromPrivateKey } from "../signer/util.js";
import type { PageTypeJson } from "../pages/types.js";
import { CommentEdit } from "../publications/comment-edit/comment-edit.js";
import type { CreateCommentEditOptions } from "../publications/comment-edit/types.js";
import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    PubsubMessage
} from "../pubsub-messages/types.js";
import { encryptEd25519AesGcm, encryptEd25519AesGcmPublicKeyBuffer } from "../signer/encryption.js";
import env from "../version.js";

function generateRandomTimestamp(parentTimestamp?: number): number {
    const [lowerLimit, upperLimit] = [typeof parentTimestamp === "number" && parentTimestamp > 2 ? parentTimestamp : 2, timestamp()];

    let randomTimestamp: number = -1;
    while (randomTimestamp === -1) {
        const randomTimeframeIndex = (remeda.keys.strict(TIMEFRAMES_TO_SECONDS).length * Math.random()) << 0;
        const tempTimestamp = lowerLimit + Object.values(TIMEFRAMES_TO_SECONDS)[randomTimeframeIndex];
        if (tempTimestamp >= lowerLimit && tempTimestamp <= upperLimit) randomTimestamp = tempTimestamp;
    }

    return randomTimestamp;
}

export async function generateMockPost(
    subplebbitAddress: string,
    plebbit: Plebbit,
    randomTimestamp = false,
    postProps: Partial<CreateCommentOptions> = {}
): Promise<Comment> {
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
export async function generateMockComment(
    parentPostOrComment: CommentIpfsWithCidDefined,
    plebbit: Plebbit,
    randomTimestamp = false,
    commentProps: Partial<CreateCommentOptions> = {}
): Promise<Comment> {
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

    return comment;
}

export async function generateMockVote(
    parentPostOrComment: CommentIpfsWithCidDefined,
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

    return voteObj;
}

export async function loadAllPages(pageCid: string, pagesInstance: BasePages) {
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments: (typeof sortedCommentsPage)["comments"] = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}

async function _mockSubplebbitPlebbit(signers: SignerType[], plebbitOptions: InputPlebbitOptions) {
    const plebbit = await mockPlebbit({ ...plebbitOptions, pubsubHttpClientsOptions: ["http://localhost:15002/api/v0"] });

    for (const pubsubUrl of remeda.keys.strict(plebbit.clients.pubsubClients))
        plebbit.clients.pubsubClients[pubsubUrl]._client = createMockIpfsClient();

    return plebbit;
}

async function _startMathCliSubplebbit(signers: SignerType[], plebbit: Plebbit) {
    const signer = await plebbit.createSigner(signers[1]);
    const subplebbit = <LocalSubplebbit | RpcLocalSubplebbit>await plebbit.createSubplebbit({ signer });

    await subplebbit.edit({ settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] } });

    await subplebbit.start();
    return subplebbit;
}

async function _startEnsSubplebbit(signers: SignerType[], plebbit: Plebbit) {
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

async function _publishPosts(subplebbitAddress: string, numOfPosts: number, plebbit: Plebbit) {
    return Promise.all(new Array(numOfPosts).fill(null).map(() => publishRandomPost(subplebbitAddress, plebbit, {}, false)));
}

async function _publishReplies(parentComment: CommentIpfsWithCidDefined, numOfReplies: number, plebbit: Plebbit) {
    return Promise.all(new Array(numOfReplies).fill(null).map(() => publishRandomReply(parentComment, plebbit, {}, false)));
}

async function _publishVotesOnOneComment(
    comment: Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress">,
    votesPerCommentToPublish: number,
    plebbit: Plebbit
) {
    return Promise.all(
        new Array(votesPerCommentToPublish)
            .fill(null)
            .map(() => publishVote(comment.cid, comment.subplebbitAddress, Math.random() > 0.5 ? 1 : -1, plebbit, {}))
    );
}

async function _publishVotes(
    comments: Pick<CommentIpfsWithCidDefined, "cid" | "depth" | "subplebbitAddress">[],
    votesPerCommentToPublish: number,
    plebbit: Plebbit
) {
    const votes: Vote[] = remeda.flattenDeep(
        await Promise.all(comments.map((comment) => _publishVotesOnOneComment(comment, votesPerCommentToPublish, plebbit)))
    );

    assert.equal(votes.length, votesPerCommentToPublish * comments.length);
    console.log(`${votes.length} votes for ${comments.length} ${comments[0].depth === 0 ? "posts" : "replies"} have been published`);
    return votes;
}

async function _populateSubplebbit(
    subplebbit: LocalSubplebbit | RpcLocalSubplebbit,
    props: {
        signers: SignerType[];
        votesPerCommentToPublish: number;
        numOfCommentsToPublish: number;
        numOfPostsToPublish: number;
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
    const posts = await _publishPosts(subplebbit.address, props.numOfPostsToPublish, subplebbit._plebbit); // If no comment[] is provided, we publish posts
    console.log(`Have successfully published ${posts.length} posts`);
    const replies = await _publishReplies(<CommentIpfsWithCidDefined>posts[0], props.numOfCommentsToPublish, subplebbit._plebbit);
    console.log(`Have sucessfully published ${replies.length} replies`);
    const postVotes = await _publishVotes(<CommentIpfsWithCidPostCidDefined[]>posts, props.votesPerCommentToPublish, subplebbit._plebbit);
    console.log(`Have sucessfully published ${postVotes.length} votes on ${posts.length} posts`);

    const repliesVotes = await _publishVotes(
        <CommentIpfsWithCidPostCidDefined[]>replies,
        props.votesPerCommentToPublish,
        subplebbit._plebbit
    );
    console.log(`Have successfully published ${repliesVotes.length} votes on ${replies.length} replies`);
}

type TestServerSubs = {
    // string will be the address
    onlineSub?: string;
    ensSub: string;
    mainSub: string;
    mathSub: string;
};

export async function startOnlineSubplebbit() {
    const onlinePlebbit = await createOnlinePlebbit();

    const onlineSub = <LocalSubplebbit | RpcLocalSubplebbit>await onlinePlebbit.createSubplebbit(); // Will create a new sub that is on the ipfs network

    await onlineSub.edit({ settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] } });

    await onlineSub.start();

    await new Promise((resolve) => onlineSub.once("update", resolve));
    console.log("Online sub is online on address", onlineSub.address);

    return onlineSub;
}

export async function startSubplebbits(props: {
    signers: SignerType[];
    noData: boolean;
    dataPath: string;
    votesPerCommentToPublish: number;
    numOfCommentsToPublish: number;
    numOfPostsToPublish: number;
    startOnlineSub: boolean;
}): Promise<TestServerSubs> {
    const plebbit = await _mockSubplebbitPlebbit(props.signers, {
        ...remeda.pick(props, ["noData", "dataPath"]),
        publishInterval: 3000,
        updateInterval: 3000
    });
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
    if (props.startOnlineSub) onlineSub = await startOnlineSubplebbit();
    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");

    return { onlineSub: onlineSub?.address, mathSub: mathSub.address, ensSub: ensSub.address, mainSub: mainSub.address };
}

export async function fetchTestServerSubs() {
    const res = await fetch("http://localhost:14953");
    const resWithType = <TestServerSubs>await res.json();
    return resWithType;
}

export function mockDefaultOptionsForNodeAndBrowserTests() {
    const shouldUseRPC = isRpcFlagOn();

    if (shouldUseRPC) return { plebbitRpcClientsOptions: ["ws://localhost:39652"] };
    else
        return {
            ipfsHttpClientsOptions: ["http://localhost:15001/api/v0"],
            pubsubHttpClientsOptions: [`http://localhost:15002/api/v0`, `http://localhost:42234/api/v0`, `http://localhost:42254/api/v0`]
        };
}

export async function mockPlebbit(plebbitOptions?: InputPlebbitOptions, forceMockPubsub = false, stubStorage = true, mockResolve = true) {
    const log = Logger("plebbit-js:test-util:mockPlebbit");
    const mockEthResolver = `https://mockEthRpc${uuidV4()}.com`;
    const plebbit = await PlebbitIndex({
        ...mockDefaultOptionsForNodeAndBrowserTests(),
        resolveAuthorAddresses: true,
        publishInterval: 1000,
        updateInterval: 1000,
        chainProviders: { eth: { urls: [mockEthResolver], chainId: 1 } },
        ...plebbitOptions
    });

    if (mockResolve) {
        //@ts-expect-error
        resolverClass.viemClients["eth" + mockEthResolver] = {
            getEnsText: async ({ name, key }) => {
                log(`Attempting to mock resolve address (${name}) textRecord (${key}) chainProviderUrl (${mockEthResolver})`);
                if (name === "plebbit.eth" && key === "subplebbit-address")
                    return "12D3KooWNMYPSuNadceoKsJ6oUQcxGcfiAsHNpVTt1RQ1zSrKKpo"; // signers[3]
                else if (name === "plebbit.eth" && key === "plebbit-author-address")
                    return "12D3KooWJJcSwMHrFvsFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // signers[6]
                else if (name === "rpc-edit-test.eth" && key === "subplebbit-address")
                    return "12D3KooWMZPQsQdYtrakc4D1XtzGXwN1X3DBnAobcCjcPYYXTB6o"; // signers[7]
                else if (name === "different-signer.eth" && key === "subplebbit-address") return (await plebbit.createSigner()).address;
                else if (name === "estebanabaroa.eth" && key === "plebbit-author-address")
                    return "12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z";
                else return null;
            }
        };
    }

    if (stubStorage) {
        plebbit._storage.getItem = async () => undefined;
        plebbit._storage.setItem = async () => undefined;
    }

    // TODO should have multiple pubsub providers here to emulate a real browser/mobile environment
    if (!plebbitOptions?.pubsubHttpClientsOptions || forceMockPubsub)
        for (const pubsubUrl of remeda.keys.strict(plebbit.clients.pubsubClients))
            plebbit.clients.pubsubClients[pubsubUrl]._client = createMockIpfsClient();

    plebbit.on("error", () => {});
    return plebbit;
}

// name should be changed to mockBrowserPlebbit
export async function mockRemotePlebbit(plebbitOptions?: InputPlebbitOptions) {
    // Mock browser environment
    const plebbit = await mockPlebbit(plebbitOptions);
    plebbit._canCreateNewLocalSub = () => false;
    plebbit.listSubplebbits = async () => [];
    return plebbit;
}

export async function createOnlinePlebbit(plebbitOptions?: InputPlebbitOptions) {
    const plebbit = await PlebbitIndex({
        ipfsHttpClientsOptions: ["http://localhost:15003/api/v0"],
        pubsubHttpClientsOptions: ["http://localhost:15003/api/v0"],
        ...plebbitOptions
    }); // use online ipfs node
    return plebbit;
}

export async function mockRemotePlebbitIpfsOnly(plebbitOptions?: InputPlebbitOptions) {
    const plebbit = await mockRemotePlebbit({
        ipfsHttpClientsOptions: ["http://localhost:15001/api/v0"],
        plebbitRpcClientsOptions: undefined,
        ...plebbitOptions
    });
    plebbit._canCreateNewLocalSub = () => false;
    plebbit.listSubplebbits = async () => [];
    return plebbit;
}

export async function mockRpcServerPlebbit(plebbitOptions?: InputPlebbitOptions) {
    const plebbit = await mockPlebbit(plebbitOptions);
    return plebbit;
}

export async function mockRpcRemotePlebbit(plebbitOptions?: InputPlebbitOptions) {
    // This instance will connect to an rpc server that has no local subs
    const plebbit = await mockPlebbit({ plebbitRpcClientsOptions: ["ws://localhost:39652"], ...plebbitOptions });
    return plebbit;
}

export async function mockGatewayPlebbit(plebbitOptions?: InputPlebbitOptions) {
    // Keep only pubsub and gateway
    const plebbit = await mockRemotePlebbit({
        ipfsGatewayUrls: ["http://localhost:18080"],
        plebbitRpcClientsOptions: undefined,
        ipfsHttpClientsOptions: undefined,
        pubsubHttpClientsOptions: undefined,
        ...plebbitOptions
    });
    return plebbit;
}

export async function mockMultipleGatewaysPlebbit(plebbitOptions?: InputPlebbitOptions) {
    return mockGatewayPlebbit({ ipfsGatewayUrls: [], ...plebbitOptions });
}

export async function publishRandomReply(
    parentComment: CommentIpfsWithCidDefined,
    plebbit: Plebbit,
    commentProps: Partial<CreateCommentOptions>,
    verifyCommentPropsInParentPages = true
): Promise<Comment> {
    const reply = await generateMockComment(parentComment, plebbit, false, {
        content: `Content ${uuidv4()}`,
        ...commentProps
    });
    await publishWithExpectedResult(reply, true);
    const commentIpfsProps = { ...reply.toJSONIpfs(), cid: reply.cid! };
    if (verifyCommentPropsInParentPages) await waitTillCommentIsInParentPages(commentIpfsProps, plebbit);
    return reply;
}

export async function publishRandomPost(
    subplebbitAddress: string,
    plebbit: Plebbit,
    postProps?: Partial<CreateCommentOptions>,
    verifyCommentPropsInParentPages = true
) {
    const post = await generateMockPost(subplebbitAddress, plebbit, false, {
        content: `Random post Content ${uuidv4()}`,
        title: `Random post Title ${uuidv4()}`,
        ...postProps
    });
    await publishWithExpectedResult(post, true);
    const commentIpfsProps = { ...post.toJSONIpfs(), cid: post.cid! };
    if (verifyCommentPropsInParentPages) await waitTillCommentIsInParentPages(commentIpfsProps, plebbit);
    return post;
}

export async function publishVote(
    commentCid: string,
    subplebbitAddress: string,
    vote: 1 | 0 | -1,
    plebbit: Plebbit,
    voteProps?: Partial<CreateVoteOptions>
) {
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

export async function publishWithExpectedResult(publication: Publication, expectedChallengeSuccess: boolean, expectedReason?: string) {
    let receivedResponse: boolean = false;

    await publication.publish();
    await new Promise((resolve, reject) => {
        setTimeout(() => !receivedResponse && reject(`Publication did not receive any response`), 90000); // throw after 20 seconds if we haven't received a response
        publication.once("challengeverification", (verificationMsg) => {
            receivedResponse = true;
            if (verificationMsg.challengeSuccess !== expectedChallengeSuccess) {
                const msg = `Expected challengeSuccess to be (${expectedChallengeSuccess}) and got (${
                    verificationMsg.challengeSuccess
                }). Reason (${verificationMsg.reason}): ${JSON.stringify(remeda.omit(verificationMsg, ["encrypted", "signature", "challengeRequestId"]))}`;
                reject(msg);
            } else if (expectedReason && expectedReason !== verificationMsg.reason) {
                const msg = `Expected reason to be (${expectedReason}) and got (${verificationMsg.reason}): ${JSON.stringify(
                    remeda.omit(verificationMsg, ["encrypted", "signature", "challengeRequestId"])
                )}`;
                reject(msg);
            } else resolve(1);
        });
    });
}

export async function findCommentInPage(commentCid: string, pageCid: string, pages: BasePages) {
    let currentPageCid: string | undefined = remeda.clone(pageCid);
    while (currentPageCid) {
        const loadedPage = await pages.getPage(currentPageCid);
        const commentInPage = loadedPage.comments.find((c) => c.cid === commentCid);
        if (commentInPage) return commentInPage;
        currentPageCid = loadedPage.nextCid;
    }
    return undefined;
}

export async function waitTillCommentIsInParentPages(
    comment: Pick<CommentIpfsWithCidDefined, "cid" | "subplebbitAddress" | "depth" | "parentCid">,
    plebbit: Plebbit,
    propsToCheckFor: Partial<CommentJson> = {},
    checkInAllPages = false
) {
    if (comment.depth > 0 && !comment.parentCid) throw Error("waitTillCommentIsInParentPages has to be called with a reply");
    const parent =
        comment.depth === 0
            ? await plebbit.getSubplebbit(comment.subplebbitAddress)
            : await plebbit.createComment({ cid: <string>comment.parentCid });
    await parent.update();
    const pagesInstance = () => (parent instanceof RemoteSubplebbit ? parent.posts : parent.replies);
    let commentInPage: PageTypeJson["comments"][number] | undefined;
    const isCommentInParentPages = async () => {
        const instance = pagesInstance();
        const repliesPageCid = "new" in instance?.pageCids && instance?.pageCids?.new;
        if (repliesPageCid) commentInPage = await findCommentInPage(comment.cid, repliesPageCid, pagesInstance());
        return Boolean(commentInPage);
    };

    await resolveWhenConditionIsTrue(parent, isCommentInParentPages);

    await parent.stop();

    if (!commentInPage) throw Error("Failed to find comment in page");

    const pageCids = parent instanceof Comment ? parent.replies?.pageCids : parent.posts?.pageCids;

    if (!pageCids || remeda.isEmpty(pageCids)) throw Error("Failed to retrieve pages");

    const commentKeys = remeda.keys.strict(propsToCheckFor);

    if (checkInAllPages)
        for (const pageCid of Object.values(pageCids)) {
            const commentInPage = await findCommentInPage(comment.cid, <string>pageCid, pagesInstance());
            if (!commentInPage) throw Error("Failed to find comment in page");
            for (const commentKey of commentKeys) {
                //@ts-expect-error
                if (deterministicStringify(commentInPage[commentKey]) !== deterministicStringify(propsToCheckFor[commentKey]))
                    throw Error(`commentInPage[${commentKey}] is incorrect`);
            }
        }
    else
        for (const commentKey of commentKeys) //@ts-expect-error
            if (deterministicStringify(commentInPage[commentKey]) !== deterministicStringify(propsToCheckFor[commentKey]))
                throw Error(`commentInPage[${commentKey}] is incorrect`);
}

export async function createSubWithNoChallenge(
    props: CreateNewLocalSubplebbitUserOptions,
    plebbit: Plebbit
): Promise<LocalSubplebbit | RpcLocalSubplebbit> {
    const sub = <LocalSubplebbit | RpcLocalSubplebbit>await plebbit.createSubplebbit(props);
    await sub.edit({ settings: { challenges: [] } }); // No challenge
    return sub;
}

export async function generatePostToAnswerMathQuestion(props: CreateCommentOptions, plebbit: Plebbit) {
    const mockPost = await generateMockPost(props.subplebbitAddress, plebbit, false, props);
    mockPost.removeAllListeners();
    mockPost.once("challenge", (challengeMessage) => {
        mockPost.publishChallengeAnswers(["2"]);
    });

    return mockPost;
}

export function isRpcFlagOn(): boolean {
    const isPartOfProcessEnv = globalThis?.["process"]?.env?.["USE_RPC"] === "1";
    // const isPartOfKarmaArgs = globalThis?.["__karma__"]?.config?.config?.["USE_RPC"] === "1";
    const isRpcFlagOn = isPartOfProcessEnv;
    return isRpcFlagOn;
}

export function isRunningInBrowser(): boolean {
    return Boolean(globalThis["window"]);
}

export async function resolveWhenConditionIsTrue(toUpdate: EventEmitter, predicate: () => Promise<boolean>) {
    // should add a timeout?
    if (!(await predicate()))
        await new Promise((resolve) => {
            toUpdate.on("update", async () => {
                const conditionStatus = await predicate();
                if (conditionStatus) resolve(conditionStatus);
            });
        });
}

export async function disableZodValidationOfPublication(publication: Publication) {
    publication._createRequestEncrypted = () => publication.toJSONPubsubMessage(); // skip the zod validation

    //@ts-expect-error
    publication._validateSignature = () => {};
}

export async function overrideCommentInstancePropsAndSign(comment: Comment, props: CreateCommentOptions) {
    if (!comment.signer) throw Error("Need comment.signer to overwrite the signature");
    //@ts-expect-error
    for (const optionKey of Object.keys(props)) comment[optionKey] = props[optionKey];

    comment.signature = await signComment(
        removeUndefinedValuesRecursively({ ...comment.toJSONPubsubMessagePublication(), signer: comment.signer }),
        comment._plebbit
    );

    disableZodValidationOfPublication(comment);
}

export async function overrideCommentEditInstancePropsAndSign(commentEdit: CommentEdit, props: CreateCommentEditOptions) {
    if (!commentEdit.signer) throw Error("Need commentEdit.signer to overwrite the signature");
    //@ts-expect-error
    for (const optionKey of Object.keys(props)) commentEdit[optionKey] = props[optionKey];

    commentEdit.signature = await signCommentEdit(
        removeUndefinedValuesRecursively({ ...commentEdit.toJSONPubsubMessagePublication(), signer: commentEdit.signer }),
        commentEdit._plebbit
    );

    disableZodValidationOfPublication(commentEdit);
}

export async function setExtraPropOnCommentAndSign(comment: Comment, extraProps: Object, includeExtraPropInSignedPropertyNames: boolean) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnVoteAndSign");

    const publicationWithExtraProp = { ...comment.toJSONPubsubMessagePublication(), ...extraProps };
    if (includeExtraPropInSignedPropertyNames)
        publicationWithExtraProp.signature = await _signJson(
            [...comment.signature.signedPropertyNames, ...Object.keys(extraProps)],
            cleanUpBeforePublishing(publicationWithExtraProp),
            comment.signer!,
            log
        );
    comment.toJSONPubsubMessagePublication = () => publicationWithExtraProp;

    disableZodValidationOfPublication(comment);
}

export async function setExtraPropOnVoteAndSign(vote: Vote, extraProps: Object, includeExtraPropInSignedPropertyNames: boolean) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnVoteAndSign");

    const publicationWithExtraProp = { ...vote.toJSONPubsubMessagePublication(), ...extraProps };
    if (includeExtraPropInSignedPropertyNames)
        publicationWithExtraProp.signature = await _signJson(
            [...vote.signature.signedPropertyNames, ...Object.keys(extraProps)],
            cleanUpBeforePublishing(publicationWithExtraProp),
            vote.signer!,
            log
        );
    vote.toJSONPubsubMessagePublication = () => publicationWithExtraProp;

    disableZodValidationOfPublication(vote);
}

export async function setExtraPropOnCommentEditAndSign(
    commentEdit: CommentEdit,
    extraProps: Object,
    includeExtraPropInSignedPropertyNames: boolean
) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnCommentEditAndSign");

    const publicationWithExtraProp = { ...commentEdit.toJSONPubsubMessagePublication(), ...extraProps };
    if (includeExtraPropInSignedPropertyNames)
        publicationWithExtraProp.signature = await _signJson(
            [...commentEdit.signature.signedPropertyNames, ...Object.keys(extraProps)],
            cleanUpBeforePublishing(publicationWithExtraProp),
            commentEdit.signer!,
            log
        );
    commentEdit.toJSONPubsubMessagePublication = () => publicationWithExtraProp;

    disableZodValidationOfPublication(commentEdit);
}

export async function setExtraPropOnChallengeRequestAndSign(
    publication: Publication,
    extraProps: Object,
    includeExtraPropsInRequestSignedPropertyNames: boolean
) {
    const log = Logger("plebbit-js:test-util:setExtraPropOnChallengeRequestAndSign");

    //@ts-expect-error
    publication._signAndValidateChallengeRequestBeforePublishing = async (requestWithoutSignature, signer) => {
        const signedPropertyNames = <ChallengeRequestMessageType["signature"]["signedPropertyNames"]>Object.keys(requestWithoutSignature);
        if (includeExtraPropsInRequestSignedPropertyNames) signedPropertyNames.push(...Object.keys(extraProps));
        const requestWithExtraProps = { ...requestWithoutSignature, ...extraProps };
        const signature = await _signPubsubMsg(signedPropertyNames, requestWithExtraProps, signer, log);
        return { ...requestWithExtraProps, signature };
    };
}

export async function publishChallengeAnswerMessageWithExtraProps(
    publication: Publication,
    challengeAnswers: string[],
    extraProps: Object,
    includeExtraPropsInChallengeSignedPropertyNames: boolean
) {
    // we're crafting a challenge answer from scratch here

    const log = Logger("plebbit-js:test-util:setExtraPropsOnChallengeAnswerMessageAndSign");
    //@ts-expect-error
    const signer = publication._challengeIdToPubsubSigner[publication._challenge.challengeRequestId.toString()];
    const encryptedChallengeAnswers = await encryptEd25519AesGcm(
        JSON.stringify({ challengeAnswers }),
        signer.privateKey,
        //@ts-expect-error
        publication._subplebbit.encryption.publicKey
    );
    const toSignAnswer: Omit<ChallengeAnswerMessageType, "signature"> = cleanUpBeforePublishing({
        type: "CHALLENGEANSWER",
        //@ts-expect-error
        challengeRequestId: publication._publishedChallengeRequests[0].challengeRequestId,
        encrypted: encryptedChallengeAnswers,
        userAgent: env.USER_AGENT,
        protocolVersion: env.PROTOCOL_VERSION,
        timestamp: timestamp()
    });
    const signedPropertyNames = remeda.keys.strict(toSignAnswer);
    //@ts-expect-error
    if (includeExtraPropsInChallengeSignedPropertyNames) signedPropertyNames.push(...Object.keys(extraProps));

    Object.assign(toSignAnswer, extraProps);

    //@ts-expect-error
    const signature = await _signPubsubMsg(signedPropertyNames, toSignAnswer, signer, log);

    //@ts-expect-error
    await publishOverPubsub(publication._subplebbit.pubsubTopic!, { ...toSignAnswer, signature });
}

export async function publishChallengeMessageWithExtraProps(
    publication: Publication,
    pubsubSigner: SignerType,
    extraProps: Object,
    includeExtraPropsInChallengeSignedPropertyNames: boolean
) {
    const log = Logger("plebbit-js:test-util:publishChallengeMessageWithExtraProps");

    const encryptedChallenges = await encryptEd25519AesGcmPublicKeyBuffer(
        deterministicStringify({ challenges: [] })!,
        pubsubSigner.privateKey,
        //@ts-expect-error
        publication._publishedChallengeRequests[0].signature.publicKey
    );

    const toSignChallenge: Omit<ChallengeMessageType, "signature"> = cleanUpBeforePublishing({
        type: "CHALLENGE",
        //@ts-expect-error
        challengeRequestId: publication._publishedChallengeRequests[0].challengeRequestId,
        encrypted: encryptedChallenges,
        userAgent: env.USER_AGENT,
        protocolVersion: env.PROTOCOL_VERSION,
        timestamp: timestamp()
    });
    const signedPropertyNames = remeda.keys.strict(toSignChallenge);
    //@ts-expect-error
    if (includeExtraPropsInChallengeSignedPropertyNames) signedPropertyNames.push(...Object.keys(extraProps));

    Object.assign(toSignChallenge, extraProps);

    const signature = await _signPubsubMsg(
        <ChallengeMessageType["signature"]["signedPropertyNames"]>signedPropertyNames,
        toSignChallenge,
        pubsubSigner,
        log
    );

    await publishOverPubsub(pubsubSigner.address, { ...toSignChallenge, signature });
}

export async function publishChallengeVerificationMessageWithExtraProps(
    publication: Publication,
    pubsubSigner: SignerType,
    extraProps: Object,
    includeExtraPropsInChallengeSignedPropertyNames: boolean
) {
    const log = Logger("plebbit-js:test-util:publishChallengeVerificationMessageWithExtraProps");

    const toSignChallengeVerification: Omit<ChallengeVerificationMessageType, "signature"> = cleanUpBeforePublishing({
        type: "CHALLENGEVERIFICATION",
        //@ts-expect-error
        challengeRequestId: publication._publishedChallengeRequests[0].challengeRequestId,
        challengeSuccess: false,
        challengeErrors: [],
        reason: "Random reason",
        userAgent: env.USER_AGENT,
        protocolVersion: env.PROTOCOL_VERSION,
        timestamp: timestamp()
    });
    const signedPropertyNames = remeda.keys.strict(toSignChallengeVerification);
    //@ts-expect-error
    if (includeExtraPropsInChallengeSignedPropertyNames) signedPropertyNames.push(...Object.keys(extraProps));

    Object.assign(toSignChallengeVerification, extraProps);

    const signature = await _signPubsubMsg(
        <ChallengeVerificationMessageType["signature"]["signedPropertyNames"]>signedPropertyNames,
        toSignChallengeVerification,
        pubsubSigner,
        log
    );

    await publishOverPubsub(pubsubSigner.address, { ...toSignChallengeVerification, signature });
}

export async function addStringToIpfs(content: string): Promise<string> {
    const plebbit = await mockRemotePlebbitIpfsOnly();
    const ipfsClient = plebbit._clientsManager.getDefaultIpfs();
    const cid = (await ipfsClient._client.add(content)).path;
    return cid;
}

export async function publishOverPubsub(pubsubTopic: string, jsonToPublish: PubsubMessage) {
    const plebbit = await mockRemotePlebbitIpfsOnly();
    await plebbit._clientsManager.pubsubPublish(pubsubTopic, jsonToPublish);
}

export function getRemotePlebbitConfigs() {
    return [
        { name: "IPFS gateway", plebbitInstancePromise: mockGatewayPlebbit },
        { name: "IPFS P2P", plebbitInstancePromise: mockRemotePlebbitIpfsOnly },
        ...(isRpcFlagOn() ? [{ name: "RPC Remote", plebbitInstancePromise: mockRpcRemotePlebbit }] : [])
    ];
}

export async function createNewIpns() {
    const plebbit = await mockRemotePlebbitIpfsOnly();
    const ipfsClient = plebbit._clientsManager.getDefaultIpfs();
    const signer = await plebbit.createSigner();
    signer.ipfsKey = new Uint8Array(await getIpfsKeyFromPrivateKey(signer.privateKey));

    await importSignerIntoIpfsNode(signer.address, signer.ipfsKey, {
        url: plebbit.ipfsHttpClientsOptions![0].url!.toString(),
        headers: plebbit.ipfsHttpClientsOptions![0].headers
    });

    const publishToIpns = async (content: string) => {
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

export async function publishSubplebbitRecordWithExtraProp(opts: { includeExtraPropInSignedPropertyNames: boolean; extraProps: Object }) {
    const ipnsObj = await createNewIpns();
    const actualSub = await ipnsObj.plebbit.getSubplebbit("12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z");
    const subplebbitRecord = JSON.parse(JSON.stringify(actualSub.toJSONIpfs()));
    subplebbitRecord.pubsubTopic = subplebbitRecord.address = ipnsObj.signer.address;
    delete subplebbitRecord.posts;
    Object.assign(subplebbitRecord, opts.extraProps);
    const signedPropertyNames = subplebbitRecord.signature.signedPropertyNames;
    if (opts.includeExtraPropInSignedPropertyNames) signedPropertyNames.push("extraProp");
    subplebbitRecord.signature = await _signJson(
        signedPropertyNames,
        subplebbitRecord,
        ipnsObj.signer,
        Logger("plebbit-js:test-util:publishSubplebbitRecordWithExtraProp")
    );

    await ipnsObj.publishToIpns(JSON.stringify(subplebbitRecord));

    return { subplebbitRecord, ipnsObj };
}

export function jsonifySubplebbitAndRemoveInternalProps(sub: RemoteSubplebbit) {
    const jsonfied = JSON.parse(JSON.stringify(sub));
    delete jsonfied["posts"]["clients"];

    return remeda.omit(jsonfied, ["startedState", "started", "signer", "settings", "editable", "clients", "updatingState", "state"]);
}

export function jsonifyLocalSubWithNoInternalProps(sub: LocalSubplebbit) {
    const localJson = <LocalSubplebbitJson>JSON.parse(JSON.stringify(sub));
    //@ts-expect-error
    delete localJson["posts"]["clients"];
    return remeda.omit(localJson, ["startedState", "started", "clients", "state", "updatingState"]);
}

export function jsonifyCommentAndRemoveInstanceProps(comment: Comment) {
    const jsonfied = cleanUpBeforePublishing(JSON.parse(JSON.stringify(comment)));
    if ("replies" in jsonfied) delete jsonfied["replies"]["clients"];
    if ("replies" in jsonfied && remeda.isEmpty(jsonfied.replies)) delete jsonfied["replies"];
    return remeda.omit(jsonfied, ["clients", "state", "updatingState", "state", "publishingState"]);
}

export const describeSkipIfRpc = isRpcFlagOn() ? globalThis["describe"]?.skip : globalThis["describe"];

export const describeIfRpc = isRpcFlagOn() ? globalThis["describe"] : globalThis["describe"]?.skip;

export const itSkipIfRpc = isRpcFlagOn() ? globalThis["it"]?.skip : globalThis["it"];

export const itIfRpc = isRpcFlagOn() ? globalThis["it"] : globalThis["it"]?.skip;
