import { Comment } from "../../publications/comment/comment.js";
import { Plebbit } from "../../plebbit.js";
import EventEmitter from "events";
import type { CreateNewLocalSubplebbitUserOptions, SubplebbitEditOptions, RpcLocalSubplebbitUpdateResultType } from "../../subplebbit/types.js";
import { RpcLocalSubplebbit } from "../../subplebbit/rpc-local-subplebbit.js";
import type { VoteChallengeRequestToEncryptType } from "../../publications/vote/types.js";
import type { CommentChallengeRequestToEncryptType } from "../../publications/comment/types.js";
import type { PageIpfs } from "../../pages/types.js";
import type { DecryptedChallengeAnswer } from "../../pubsub-messages/types.js";
import { CommentEditChallengeRequestToEncryptType } from "../../publications/comment-edit/types.js";
import { SetNewSettingsPlebbitWsServer } from "../../rpc/src/types.js";
export default class PlebbitRpcClient {
    private _webSocketClient;
    private _plebbit;
    private _subscriptionEvents;
    private _pendingSubscriptionMsgs;
    private _timeoutSeconds;
    private _openConnectionPromise?;
    private _listSubsSubscriptionId?;
    private _lastListedSubs?;
    constructor(plebbit: Plebbit);
    _init(): Promise<void>;
    destroy(): Promise<void>;
    toJSON(): undefined;
    getSubscription(subscriptionId: number): EventEmitter;
    unsubscribe(subscriptionId: number): Promise<void>;
    emitAllPendingMessages(subscriptionId: number): void;
    getComment(commentCid: string): Promise<Comment>;
    getCommentPage(pageCid: string, commentCid: string, subplebbitAddress: string): Promise<PageIpfs>;
    getSubplebbitPage(pageCid: string, subplebbitAddress: string): Promise<PageIpfs>;
    createSubplebbit(createSubplebbitOptions: CreateNewLocalSubplebbitUserOptions): Promise<RpcLocalSubplebbit>;
    private _initSubscriptionEvent;
    startSubplebbit(subplebbitAddress: string): Promise<number>;
    stopSubplebbit(subplebbitAddress: string): Promise<void>;
    editSubplebbit(subplebbitAddress: string, subplebbitEditOptions: SubplebbitEditOptions): Promise<RpcLocalSubplebbitUpdateResultType>;
    deleteSubplebbit(subplebbitAddress: string): Promise<void>;
    subplebbitUpdate(subplebbitAddress: string): Promise<number>;
    publishComment(commentProps: CommentChallengeRequestToEncryptType): Promise<number>;
    publishCommentEdit(commentEditProps: CommentEditChallengeRequestToEncryptType): Promise<number>;
    publishVote(voteProps: VoteChallengeRequestToEncryptType): Promise<number>;
    commentUpdate(commentCid: string): Promise<number>;
    publishChallengeAnswers(subscriptionId: number, challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"]): Promise<true>;
    resolveAuthorAddress(authorAddress: string): Promise<string | null>;
    listSubplebbits(): Promise<string[]>;
    fetchCid(cid: string): Promise<string>;
    setSettings(settings: SetNewSettingsPlebbitWsServer): Promise<true>;
    getSettings(): Promise<import("zod").objectOutputType<{
        plebbitOptions: import("zod").ZodObject<import("zod").objectUtil.extendShape<{
            ipfsGatewayUrls: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            ipfsHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodArray<import("zod").ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, import("zod").ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
            pubsubHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodArray<import("zod").ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, import("zod").ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
            plebbitRpcClientsOptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            dataPath: import("zod").ZodOptional<import("zod").ZodString>;
            chainProviders: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                urls: import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
                chainId: import("zod").ZodNumber;
            }, "strip", import("zod").ZodTypeAny, {
                chainId: number;
                urls: string[];
            }, {
                chainId: number;
                urls: string[];
            }>>;
            resolveAuthorAddresses: import("zod").ZodBoolean;
            publishInterval: import("zod").ZodNumber;
            updateInterval: import("zod").ZodNumber;
            noData: import("zod").ZodBoolean;
            browserLibp2pJsPublish: import("zod").ZodBoolean;
        }, {
            ipfsHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodType<import("kubo-rpc-client").Options[], import("zod").ZodTypeDef, import("kubo-rpc-client").Options[]>>;
            pubsubHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodType<import("kubo-rpc-client").Options[], import("zod").ZodTypeDef, import("kubo-rpc-client").Options[]>>;
        }>, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<import("zod").objectUtil.extendShape<{
            ipfsGatewayUrls: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            ipfsHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodArray<import("zod").ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, import("zod").ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
            pubsubHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodArray<import("zod").ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, import("zod").ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
            plebbitRpcClientsOptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            dataPath: import("zod").ZodOptional<import("zod").ZodString>;
            chainProviders: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                urls: import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
                chainId: import("zod").ZodNumber;
            }, "strip", import("zod").ZodTypeAny, {
                chainId: number;
                urls: string[];
            }, {
                chainId: number;
                urls: string[];
            }>>;
            resolveAuthorAddresses: import("zod").ZodBoolean;
            publishInterval: import("zod").ZodNumber;
            updateInterval: import("zod").ZodNumber;
            noData: import("zod").ZodBoolean;
            browserLibp2pJsPublish: import("zod").ZodBoolean;
        }, {
            ipfsHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodType<import("kubo-rpc-client").Options[], import("zod").ZodTypeDef, import("kubo-rpc-client").Options[]>>;
            pubsubHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodType<import("kubo-rpc-client").Options[], import("zod").ZodTypeDef, import("kubo-rpc-client").Options[]>>;
        }>, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<import("zod").objectUtil.extendShape<{
            ipfsGatewayUrls: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            ipfsHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodArray<import("zod").ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, import("zod").ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
            pubsubHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodEffects<import("zod").ZodArray<import("zod").ZodType<string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined, import("zod").ZodTypeDef, string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined>, "many">, import("kubo-rpc-client").Options[], (string | URL | import("kubo-rpc-client").Options | import("@multiformats/multiaddr").Multiaddr | undefined)[]>>;
            plebbitRpcClientsOptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            dataPath: import("zod").ZodOptional<import("zod").ZodString>;
            chainProviders: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                urls: import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodEnum<["viem", "ethers.js", "web3.js"]>]>, "many">;
                chainId: import("zod").ZodNumber;
            }, "strip", import("zod").ZodTypeAny, {
                chainId: number;
                urls: string[];
            }, {
                chainId: number;
                urls: string[];
            }>>;
            resolveAuthorAddresses: import("zod").ZodBoolean;
            publishInterval: import("zod").ZodNumber;
            updateInterval: import("zod").ZodNumber;
            noData: import("zod").ZodBoolean;
            browserLibp2pJsPublish: import("zod").ZodBoolean;
        }, {
            ipfsHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodType<import("kubo-rpc-client").Options[], import("zod").ZodTypeDef, import("kubo-rpc-client").Options[]>>;
            pubsubHttpClientsOptions: import("zod").ZodOptional<import("zod").ZodType<import("kubo-rpc-client").Options[], import("zod").ZodTypeDef, import("kubo-rpc-client").Options[]>>;
        }>, import("zod").ZodTypeAny, "passthrough">>;
        challenges: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<Omit<{
            optionInputs: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                option: import("zod").ZodString;
                label: import("zod").ZodString;
                default: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                placeholder: import("zod").ZodOptional<import("zod").ZodString>;
                required: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                option: import("zod").ZodString;
                label: import("zod").ZodString;
                default: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                placeholder: import("zod").ZodOptional<import("zod").ZodString>;
                required: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                option: import("zod").ZodString;
                label: import("zod").ZodString;
                default: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                placeholder: import("zod").ZodOptional<import("zod").ZodString>;
                required: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">>, "many">>;
            type: import("zod").ZodString;
            challenge: import("zod").ZodOptional<import("zod").ZodString>;
            caseInsensitive: import("zod").ZodOptional<import("zod").ZodBoolean>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            getChallenge: import("zod").ZodFunction<import("zod").ZodTuple<[import("zod").ZodEffects<import("zod").ZodObject<{
                path: import("zod").ZodOptional<import("zod").ZodString>;
                name: import("zod").ZodOptional<import("zod").ZodString>;
                options: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
                exclude: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">>, "many">>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strict", import("zod").ZodTypeAny, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                name?: string | undefined;
                description?: string | undefined;
                exclude?: import("zod").objectOutputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
            }, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                name?: string | undefined;
                description?: string | undefined;
                exclude?: import("zod").objectInputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
            }>, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                name?: string | undefined;
                description?: string | undefined;
                exclude?: import("zod").objectOutputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
            }, {
                path?: string | undefined;
                options?: Record<string, string> | undefined;
                name?: string | undefined;
                description?: string | undefined;
                exclude?: import("zod").objectInputType<{
                    subplebbit: import("zod").ZodOptional<import("zod").ZodObject<{
                        addresses: import("zod").ZodArray<import("zod").ZodString, "many">;
                        maxCommentCids: import("zod").ZodNumber;
                        postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                        firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    }, "strict", import("zod").ZodTypeAny, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }, {
                        addresses: string[];
                        maxCommentCids: number;
                        postScore?: number | undefined;
                        replyScore?: number | undefined;
                        firstCommentTimestamp?: number | undefined;
                    }>>;
                    postScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    replyScore: import("zod").ZodOptional<import("zod").ZodNumber>;
                    firstCommentTimestamp: import("zod").ZodOptional<import("zod").ZodNumber>;
                    challenges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                    post: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    reply: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    vote: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    role: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<["owner", "admin", "moderator"]>, "many">>;
                    address: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    rateLimit: import("zod").ZodOptional<import("zod").ZodNumber>;
                    rateLimitChallengeSuccess: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
            }>, import("zod").ZodType<import("../../pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, import("zod").ZodTypeDef, import("../../pubsub-messages/types.js").DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>, import("zod").ZodNumber, import("zod").ZodType<import("../../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit, import("zod").ZodTypeDef, import("../../runtime/browser/subplebbit/local-subplebbit.js").LocalSubplebbit>], import("zod").ZodUnknown>, import("zod").ZodPromise<import("zod").ZodUnion<[import("zod").ZodObject<{
                challenge: import("zod").ZodString;
                verify: import("zod").ZodFunction<import("zod").ZodTuple<[import("zod").ZodLazy<import("zod").ZodString>], import("zod").ZodUnknown>, import("zod").ZodPromise<import("zod").ZodUnion<[import("zod").ZodObject<{
                    success: import("zod").ZodLiteral<true>;
                }, "strip", import("zod").ZodTypeAny, {
                    success: true;
                }, {
                    success: true;
                }>, import("zod").ZodObject<{
                    success: import("zod").ZodLiteral<false>;
                    error: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    error: string;
                    success: false;
                }, {
                    error: string;
                    success: false;
                }>]>>>;
                type: import("zod").ZodString;
            }, "strict", import("zod").ZodTypeAny, {
                type: string;
                challenge: string;
                verify: (args_0: string, ...args_1: unknown[]) => Promise<{
                    success: true;
                } | {
                    error: string;
                    success: false;
                }>;
            }, {
                type: string;
                challenge: string;
                verify: (args_0: string, ...args_1: unknown[]) => Promise<{
                    success: true;
                } | {
                    error: string;
                    success: false;
                }>;
            }>, import("zod").ZodUnion<[import("zod").ZodObject<{
                success: import("zod").ZodLiteral<true>;
            }, "strip", import("zod").ZodTypeAny, {
                success: true;
            }, {
                success: true;
            }>, import("zod").ZodObject<{
                success: import("zod").ZodLiteral<false>;
                error: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                error: string;
                success: false;
            }, {
                error: string;
                success: false;
            }>]>]>>>;
        }, "getChallenge">, "strict", import("zod").ZodTypeAny, {
            type: string;
            description?: string | undefined;
            challenge?: string | undefined;
            caseInsensitive?: boolean | undefined;
            optionInputs?: import("zod").objectOutputType<{
                option: import("zod").ZodString;
                label: import("zod").ZodString;
                default: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                placeholder: import("zod").ZodOptional<import("zod").ZodString>;
                required: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
        }, {
            type: string;
            description?: string | undefined;
            challenge?: string | undefined;
            caseInsensitive?: boolean | undefined;
            optionInputs?: import("zod").objectInputType<{
                option: import("zod").ZodString;
                label: import("zod").ZodString;
                default: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                placeholder: import("zod").ZodOptional<import("zod").ZodString>;
                required: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod").ZodTypeAny, "passthrough">[] | undefined;
        }>>;
    }, import("zod").ZodTypeAny, "passthrough">>;
    rpcCall(method: string, params: any[]): Promise<any>;
    getDefaults(): Promise<void>;
    getPeers(): Promise<void>;
    getStats(): Promise<void>;
}
