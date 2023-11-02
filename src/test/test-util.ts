import { TIMEFRAMES_TO_SECONDS, timestamp } from "../util";
import { Comment } from "../comment";
import { Plebbit } from "../plebbit";
import PlebbitIndex from "../index";
import Vote from "../vote";
import { Subplebbit } from "../subplebbit/subplebbit";
import { CreateCommentOptions, PlebbitOptions, PostType, VoteType } from "../types";
import isIPFS from "is-ipfs";
import waitUntil from "async-wait-until";
import assert from "assert";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { SignerType } from "../signer/constants";
import Publication from "../publication";
import lodash from "lodash";
import { v4 as uuidv4 } from "uuid";
import { createMockIpfsClient } from "./mock-ipfs-client";
import { BasePages } from "../pages";
import { CreateSubplebbitOptions } from "../subplebbit/types";

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
    parentPostOrComment: Comment,
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

    return comment;
}

export async function generateMockVote(
    parentPostOrComment: Comment,
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

export async function loadAllPages(pageCid: string, pagesInstance: BasePages): Promise<Comment[]> {
    if (!isIPFS.cid(pageCid)) throw Error(`loadAllPages: pageCid (${pageCid}) is not a valid CID`);
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments: Comment[] = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}

async function _mockSubplebbitPlebbit(signers: SignerType[], plebbitOptions: PlebbitOptions) {
    const plebbit = await mockPlebbit({ ...plebbitOptions, pubsubHttpClientsOptions: ["http://localhost:15002/api/v0"] });

    for (const pubsubUrl of Object.keys(plebbit.clients.pubsubClients))
        plebbit.clients.pubsubClients[pubsubUrl]._client = createMockIpfsClient();

    return plebbit;
}

async function _startMathCliSubplebbit(signers: SignerType[], plebbit: Plebbit) {
    const signer = await plebbit.createSigner(signers[1]);
    const subplebbit = await plebbit.createSubplebbit({ signer });

    await subplebbit.edit({ settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" } }] } });

    await subplebbit.start();
    return subplebbit;
}

async function _startEnsSubplebbit(signers: SignerType[], plebbit: Plebbit) {
    const signer = await plebbit.createSigner(signers[3]);
    const subplebbit = await createSubWithNoChallenge({ signer }, plebbit);
    await subplebbit.start();
    await subplebbit.edit({ address: "plebbit.eth" });
    assert.equal(subplebbit.address, "plebbit.eth");
    return subplebbit;
}

async function _publishPosts(subplebbitAddress: string, numOfPosts: number, plebbit: Plebbit) {
    return Promise.all(new Array(numOfPosts).fill(null).map(() => publishRandomPost(subplebbitAddress, plebbit, {}, false)));
}

async function _publishReplies(parentComment: Comment, numOfReplies: number, plebbit: Plebbit) {
    return Promise.all(new Array(numOfReplies).fill(null).map(() => publishRandomReply(parentComment, plebbit, {}, false)));
}

async function _publishVotesOnOneComment(comment: Comment, votesPerCommentToPublish: number, plebbit: Plebbit) {
    return Promise.all(
        new Array(votesPerCommentToPublish)
            .fill(null)
            .map(() => publishVote(comment.cid, comment.subplebbitAddress, Math.random() > 0.5 ? 1 : -1, plebbit, {}))
    );
}

async function _publishVotes(comments: Comment[], votesPerCommentToPublish: number, plebbit: Plebbit) {
    const votes: Vote[] = lodash.flattenDeep(
        await Promise.all(comments.map((comment) => _publishVotesOnOneComment(comment, votesPerCommentToPublish, plebbit)))
    );

    assert.equal(votes.length, votesPerCommentToPublish * comments.length);
    console.log(`${votes.length} votes for ${comments.length} ${comments[0].depth === 0 ? "posts" : "replies"} have been published`);
    return votes;
}

async function _populateSubplebbit(
    subplebbit: Subplebbit,
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
    const posts = await _publishPosts(subplebbit.address, props.numOfPostsToPublish, subplebbit.plebbit); // If no comment[] is provided, we publish posts
    console.log(`Have successfully published ${posts.length} posts`);
    const replies = await _publishReplies(posts[0], props.numOfCommentsToPublish, subplebbit.plebbit);
    console.log(`Have sucessfully published ${replies.length} replies`);
    const postVotes = await _publishVotes(posts, props.votesPerCommentToPublish, subplebbit.plebbit);
    console.log(`Have sucessfully published ${postVotes.length} votes on ${posts.length} posts`);

    const repliesVotes = await _publishVotes(replies, props.votesPerCommentToPublish, subplebbit.plebbit);
    console.log(`Have successfully published ${repliesVotes.length} votes on ${replies.length} replies`);
}

export async function startSubplebbits(props: {
    signers: SignerType[];
    noData: boolean;
    dataPath: string;
    votesPerCommentToPublish: number;
    numOfCommentsToPublish: number;
    numOfPostsToPublish: number;
}) {
    const plebbit = await _mockSubplebbitPlebbit(props.signers, lodash.pick(props, ["noData", "dataPath"]));
    const signer = await plebbit.createSigner(props.signers[0]);
    const subplebbit = await createSubWithNoChallenge({ signer }, plebbit);

    await subplebbit.start();
    console.time("populate");
    const [mathSub, ensSub] = await Promise.all([
        _startMathCliSubplebbit(props.signers, plebbit),
        _startEnsSubplebbit(props.signers, plebbit),
        _populateSubplebbit(subplebbit, props)
    ]);
    console.timeEnd("populate");

    for (const sub of [mathSub, ensSub, subplebbit]) {
        sub.on("update", () => {
            const lastUpdatedAt = sub["lastUpdatedAt"];
            console.log(`Sub (${sub.address}) took ${sub.updatedAt - lastUpdatedAt} seconds for update loop to complete`);
            sub["lastUpdatedAt"] = sub.updatedAt;
        });
    }

    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");
}

export function mockDefaultOptionsForNodeAndBrowserTests() {
    const shouldUseRPC = process?.env?.["USE_RPC"] === "1";

    if (shouldUseRPC) return { plebbitRpcClientsOptions: ["ws://localhost:39652"] };
    else
        return {
            ipfsHttpClientsOptions: ["http://localhost:15001/api/v0"],
            pubsubHttpClientsOptions: [`http://localhost:15002/api/v0`, `http://localhost:42234/api/v0`, `http://localhost:42254/api/v0`]
        };
}

export async function mockPlebbit(plebbitOptions?: PlebbitOptions, forceMockPubsub = false) {
    const plebbit = await PlebbitIndex({
        ...mockDefaultOptionsForNodeAndBrowserTests(),
        resolveAuthorAddresses: true,
        publishInterval: 1000,
        updateInterval: 1000,
        ...plebbitOptions
    });

    plebbit.resolver.resolveTxtRecord = async (ensName: string, textRecord: string) => {
        if (ensName === "plebbit.eth" && textRecord === "subplebbit-address")
            return "12D3KooWNMYPSuNadceoKsJ6oUQcxGcfiAsHNpVTt1RQ1zSrKKpo"; // signers[3]
        else if (ensName === "plebbit.eth" && textRecord === "plebbit-author-address")
            return "12D3KooWJJcSwMHrFvsFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // signers[6]
        else if (ensName === "rpc-edit-test.eth" && textRecord === "subplebbit-address")
            return "12D3KooWMZPQsQdYtrakc4D1XtzGXwN1X3DBnAobcCjcPYYXTB6o"; // signers[7]
        else if (ensName === "different-signer.eth" && textRecord === "subplebbit-address") return (await plebbit.createSigner()).address;
        else if (ensName === "estebanabaroa.eth" && textRecord === "plebbit-author-address")
            return "12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z";
        else return null;
    };

    plebbit._storage.getItem = () => undefined;
    plebbit._storage.setItem = () => undefined;

    // TODO should have multiple pubsub providers here to emulate a real browser/mobile environment
    if (!plebbitOptions?.pubsubHttpClientsOptions || forceMockPubsub)
        for (const pubsubUrl of Object.keys(plebbit.clients.pubsubClients))
            plebbit.clients.pubsubClients[pubsubUrl]._client = createMockIpfsClient();

    plebbit.on("error", () => {});
    return plebbit;
}

export async function mockRemotePlebbit(plebbitOptions?: PlebbitOptions) {
    const plebbit = await mockPlebbit(plebbitOptions);
    plebbit._canCreateNewLocalSub = () => false;
    return plebbit;
}

export async function mockRemotePlebbitIpfsOnly(plebbitOptions?: PlebbitOptions) {
    const plebbit = await mockPlebbit({
        ipfsHttpClientsOptions: ["http://localhost:15001/api/v0"],
        plebbitRpcClientsOptions: undefined,
        ...plebbitOptions
    });
    plebbit._canCreateNewLocalSub = () => false;
    return plebbit;
}

export async function mockRpcServerPlebbit(plebbitOptions?: PlebbitOptions) {
    const plebbit = await mockPlebbit(plebbitOptions);
    return plebbit;
}

export async function mockGatewayPlebbit(plebbitOptions?: PlebbitOptions) {
    // Keep only pubsub and gateway
    const plebbit = await mockRemotePlebbit({ ipfsGatewayUrls: ["http://localhost:18080"], ...plebbitOptions });
    delete plebbit.clients.ipfsClients;
    delete plebbit.ipfsHttpClientsOptions;
    delete plebbit._clientsManager.clients.ipfsClients;
    plebbit._clientsManager._defaultPubsubProviderUrl = plebbit._clientsManager._defaultIpfsProviderUrl = undefined;
    return plebbit;
}

export async function publishRandomReply(
    parentComment: Comment,
    plebbit: Plebbit,
    commentProps: Partial<CreateCommentOptions>,
    verifyCommentPropsInParentPages = true
): Promise<Comment> {
    const reply = await generateMockComment(parentComment, plebbit, false, {
        content: `Content ${uuidv4()}`,
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
        content: `Random post Content ${uuidv4()} ${lodash.uniqueId()}`,
        title: `Random post Title ${uuidv4()} ${lodash.uniqueId()}`,
        ...postProps
    });
    await publishWithExpectedResult(post, true);
    if (verifyCommentPropsInParentPages) await waitTillCommentIsInParentPages(post, plebbit);
    return post;
}

export async function publishVote(
    commentCid: string,
    subplebbitAddress: string,
    vote: 1 | 0 | -1,
    plebbit: Plebbit,
    voteProps?: Partial<VoteType>
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
                }). Reason (${verificationMsg.reason}): ${JSON.stringify(verificationMsg)}`;
                reject(msg);
            } else if (expectedReason && expectedReason !== verificationMsg.reason) {
                const msg = `Expected reason to be (${expectedReason}) and got (${verificationMsg.reason}): ${JSON.stringify(
                    verificationMsg
                )}`;
                reject(msg);
            } else resolve(1);
        });
    });
}

export async function findCommentInPage(commentCid: string, pageCid: string, pages: BasePages): Promise<Comment | undefined> {
    let currentPageCid = lodash.clone(pageCid);
    while (currentPageCid) {
        const loadedPage = await pages.getPage(currentPageCid);
        const commentInPage = loadedPage.comments.find((c) => c.cid === commentCid);
        if (commentInPage) return commentInPage;
        currentPageCid = loadedPage.nextCid;
    }
    return undefined;
}

export async function waitTillCommentIsInParentPages(
    comment: Comment,
    plebbit: Plebbit,
    propsToCheckFor: Partial<CreateCommentOptions> = {},
    checkInAllPages = false
) {
    const parent =
        comment.depth === 0
            ? await plebbit.getSubplebbit(comment.subplebbitAddress)
            : await plebbit.createComment({ cid: comment.parentCid });
    await parent.update();
    const pagesInstance = () => (parent instanceof Subplebbit ? parent.posts : parent.replies);
    let commentInPage: Comment;
    await waitUntil(
        async () => {
            const repliesPageCid = pagesInstance()?.pageCids?.new;
            if (repliesPageCid) commentInPage = await findCommentInPage(comment.cid, repliesPageCid, pagesInstance());
            return Boolean(commentInPage);
        },
        {
            timeout: 200000
        }
    );

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

export async function createSubWithNoChallenge(props: CreateSubplebbitOptions, plebbit: Plebbit) {
    const sub = await plebbit.createSubplebbit(props);
    await sub.edit({ settings: { challenges: undefined } }); // No challenge
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

export function isRpcFlagOn(): boolean{
    const isPartOfProcessEnv = globalThis?.["process"]?.env?.["USE_RPC"] === "1";
    const isPartOfKarmaArgs = globalThis?.["__karma__"]?.config?.args?.["USE_RPC"] === "1";
    return isPartOfKarmaArgs || isPartOfProcessEnv;
}
