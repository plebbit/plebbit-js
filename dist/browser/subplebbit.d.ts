/// <reference types="node" />
import EventEmitter from "events";
import { Challenge } from "./challenge";
import DbHandler from "./runtime/browser/db-handler";
import { Signer } from "./signer";
import { Pages } from "./pages";
import { Plebbit } from "./plebbit";
import { SubplebbitEncryption } from "./types";
export declare class Subplebbit extends EventEmitter {
    address: string;
    title?: string;
    description?: string;
    moderatorsAddresses?: string[];
    latestPostCid?: string;
    posts?: Pages;
    pubsubTopic?: string;
    challengeTypes?: string[];
    metricsCid?: string[];
    createdAt?: number;
    updatedAt?: number;
    signer?: Signer;
    encryption?: SubplebbitEncryption;
    plebbit?: Plebbit;
    dbHandler?: DbHandler;
    _challengeToSolution: any;
    _challengeToPublication: any;
    provideCaptchaCallback?: Function;
    validateCaptchaAnswerCallback?: Function;
    _dbConfig?: any;
    ipnsKeyName?: string;
    sortHandler: any;
    emittedAt?: number;
    _updateInterval?: any;
    _keyv: any;
    constructor(props: any, plebbit: any);
    initSubplebbit(newProps: any): void;
    initSignerIfNeeded(): Promise<void>;
    initDbIfNeeded(): Promise<void>;
    setProvideCaptchaCallback(newCallback: any): void;
    setValidateCaptchaAnswerCallback(newCallback: any): void;
    toJSONInternal(): {
        ipnsKeyName: string;
        database: any;
        signer: Signer;
        title: string;
        description: string;
        moderatorsAddresses: string[];
        latestPostCid: string;
        pubsubTopic: string;
        address: string;
        posts: Pages;
        challengeTypes: string[];
        metricsCid: string[];
        createdAt: number;
        updatedAt: number;
        encryption: any;
    };
    toJSON(): {
        title: string;
        description: string;
        moderatorsAddresses: string[];
        latestPostCid: string;
        pubsubTopic: string;
        address: string;
        posts: Pages;
        challengeTypes: string[];
        metricsCid: string[];
        createdAt: number;
        updatedAt: number;
        encryption: any;
    };
    prePublish(newSubplebbitOptions?: {}): Promise<void>;
    edit(newSubplebbitOptions: any): Promise<this>;
    updateOnce(): Promise<this>;
    update(updateIntervalMs?: number): Promise<this>;
    stop(): Promise<void>;
    updateSubplebbitIpns(): Promise<this>;
    handleCommentEdit(commentEdit: any, challengeRequestId: any, trx: any): Promise<{
        reason: string;
    }>;
    handleVote(newVote: any, challengeRequestId: any, trx: any): Promise<{
        reason: string;
    }>;
    publishPostAfterPassingChallenge(publication: any, challengeRequestId: any, trx: any): Promise<{
        reason: string;
    } | {
        publication: any;
    }>;
    handleChallengeRequest(msgParsed: any): Promise<void>;
    upsertAndPublishChallenge(challenge: any, trx: any): Promise<void>;
    handleChallengeAnswer(msgParsed: any): Promise<void>;
    processCaptchaPubsub(pubsubMsg: any): Promise<void>;
    defaultProvideCaptcha(challengeRequestMessage: any): Promise<Challenge[][]>;
    defaultValidateCaptcha(challengeAnswerMessage: any): Promise<(boolean | string[])[]>;
    syncIpnsWithDb(syncIntervalMs: any): Promise<void>;
    start(syncIntervalMs?: number): Promise<void>;
    stopPublishing(): Promise<void>;
    destroy(): Promise<void>;
}
