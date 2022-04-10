import Comment, {CommentEdit} from "./Comment.js";
import last from "it-last";
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import EventEmitter from "events";
import {sha256} from "js-sha256";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import {
    Challenge,
    CHALLENGE_TYPES,
    ChallengeAnswerMessage,
    ChallengeMessage,
    ChallengeRequestMessage,
    ChallengeVerificationMessage,
    PUBSUB_MESSAGE_TYPES
} from "./Challenge.js";
import assert from "assert";
import knex from 'knex';
import DbHandler from "./DbHandler.js";
import {createCaptcha} from "captcha-canvas/js-script/extra.js";
import {SORTED_COMMENTS_TYPES, SortHandler} from "./SortHandler.js";
import * as path from "path";
import * as fs from "fs";
import {v4 as uuidv4} from 'uuid';
import {loadIpnsAsJson, shallowEqual, timestamp} from "./Util.js";
import Debug from "debug";

const debug = Debug("plebbit-js:Subplebbit");
const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 180000; // 3 minutes

// import {Signer} from "./Signer.js";


export class Subplebbit extends EventEmitter {
    constructor(props, plebbit) {
        super();
        this.plebbit = plebbit;
        this.#initSubplebbit(props);
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this.provideCaptchaCallback = undefined;
        this.validateCaptchaAnswerCallback = undefined;
        this._syncIpnsInterval = undefined;
    }

    #initSubplebbit(newProps) {
        const oldProps = this.#toJSONInternal();
        const mergedProps = {...oldProps, ...newProps};
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsAddresses = mergedProps["moderatorsAddresses"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this._dbConfig = mergedProps["database"];
        this.sortedPosts = mergedProps["sortedPosts"];
        this.sortedPostsCids = mergedProps["sortedPostsCids"];
        this.setIpnsKey(mergedProps["subplebbitAddress"], mergedProps["ipnsKeyName"]);
        this.pubsubTopic = mergedProps["pubsubTopic"] || this.subplebbitAddress;
        this.sortHandler = new SortHandler(this);
        this.challengeTypes = mergedProps["challengeTypes"];
        this.metricsCid = mergedProps["metricsCid"];
        this.createdAt = mergedProps["createdAt"];
        this.updatedAt = mergedProps["updatedAt"];
        // this.signer = mergedProps["signer"] instanceof Signer ? mergedProps["signer"] : new Signer(mergedProps["signer"]);
    }

    async #initDb() {
        const ipfsKeys = (await this.plebbit.ipfsClient.key.list()).map(key => key["id"]);
        const ranByOwner = ipfsKeys.includes(this.subplebbitAddress);
        // Default settings for subplebbit owner node
        if (ranByOwner && !this._dbConfig) {
            fs.mkdirSync(this.plebbit.dataPath, {"recursive": true});
            this._dbConfig = {
                client: 'better-sqlite3', // or 'better-sqlite3'
                connection: {
                    filename: path.join(this.plebbit.dataPath, this.subplebbitAddress)
                },
                useNullAsDefault: true
            }
        }

        if (!this._dbConfig)
            return;
        this.dbHandler = new DbHandler(knex(this._dbConfig), this);
        await this.dbHandler.createTablesIfNeeded();
    }

    setIpnsKey(newIpnsName, newIpnsKeyName) {
        this.subplebbitAddress = newIpnsName;
        this.ipnsKeyName = newIpnsKeyName;
    }

    setProvideCaptchaCallback(newCallback) {
        this.provideCaptchaCallback = newCallback;
    }

    setValidateCaptchaAnswerCallback(newCallback) {
        this.validateCaptchaAnswerCallback = newCallback;
    }

    async setDbConfig(dbConfig) {
        this._dbConfig = dbConfig;
        await this.#initDb();
    }

    #toJSONInternal() {
        return {
            ...this.toJSON(),
            "ipnsKeyName": this.ipnsKeyName,
            "database": this._dbConfig
        };
    }

    toJSON() {
        return {
            "title": this.title,
            "description": this.description,
            "moderatorsAddresses": this.moderatorsAddresses,
            "latestPostCid": this.latestPostCid,
            "pubsubTopic": this.pubsubTopic,
            "subplebbitAddress": this.subplebbitAddress,
            "sortedPosts": this.sortedPosts,
            "sortedPostsCids": this.sortedPostsCids,
            "challengeTypes": this.challengeTypes,
            "metricsCid": this.metricsCid,
            "createdAt": this.createdAt,
            "updatedAt": this.updatedAt
        };
    }

    async edit(newSubplebbitOptions) {
        this.#initSubplebbit(newSubplebbitOptions);
        return new Promise(async (resolve, reject) => {
                if (!this.subplebbitAddress) { // TODO require signer
                    debug(`Subplebbit does not have an address`);
                    this.plebbit.ipfsClient.key.gen(this.title).then(ipnsKey => {
                        debug(`Generated an address for subplebbit (${ipnsKey.id})`);
                        this.edit({
                            "subplebbitAddress": ipnsKey["id"],
                            "ipnsKeyName": ipnsKey["name"],
                            "createdAt": timestamp()
                        }).then(resolve).catch(reject);
                    }).catch(reject);
                } else {
                    this.updatedAt = timestamp();
                    this.plebbit.ipfsClient.add(JSON.stringify(this)).then(file => {
                        this.plebbit.ipfsClient.name.publish(file["cid"], {
                            "lifetime": "72h", // TODO decide on optimal time later
                            "key": this.ipnsKeyName
                        }).then(() => {
                            debug(`Subplebbit (${this.subplebbitAddress}) has been edited and its IPNS updated`);
                            resolve();
                        }).catch(reject);
                    }).catch(reject);
                }

            }
        );
    }

    async #updateOnce() {
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(this.subplebbitAddress, this.plebbit.ipfsClient).then(res => {
                if (this.emittedAt !== res.updatedAt) {
                    this.emittedAt = res.updatedAt;
                    this.#initSubplebbit(res);
                    debug(`Subplebbit received a new update. Will emit an update event`);
                    this.emit("update", this);
                }
                this.#initSubplebbit(res);
                resolve(res);
            }).catch(err => resolve(undefined));
        });
    }

    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        debug(`Starting to poll updates for subplebbit (${this.subplebbitAddress}) every ${updateIntervalMs} milliseconds`);
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.#updateOnce.bind(this), updateIntervalMs); // One minute
        return this.#updateOnce();
    }

    stop() {
        clearInterval(this._updateInterval);
    }

    async #updateSubplebbitIpns(trx) {
        return new Promise(async (resolve, reject) => {
            Promise.all([this.dbHandler.querySubplebbitMetrics(trx), this.sortHandler.calculateSortedPosts(undefined, trx), this.dbHandler.queryLatestPost(trx)])
                .then(async ([metrics, [sortedPosts, sortedPostsCids], latestPost]) => {
                    if (sortedPosts)
                        sortedPosts = {[SORTED_COMMENTS_TYPES.TOP_ALL]: sortedPosts[SORTED_COMMENTS_TYPES.TOP_ALL]}; // Keep only top all
                    const newSubplebbitOptions = {
                        "sortedPosts": sortedPosts,
                        "sortedPostsCids": sortedPostsCids,
                        "metricsCid": (await this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path,
                        "latestPostCid": latestPost?.postCid,
                    };
                    if (JSON.stringify(this.sortedPosts) !== JSON.stringify(sortedPosts) ||
                        JSON.stringify(this.sortedPostsCids) !== JSON.stringify(sortedPostsCids) ||
                        this.metricsCid !== newSubplebbitOptions.metricsCid || this.latestPostCid !== newSubplebbitOptions.latestPostCid)
                        this.edit(newSubplebbitOptions).then(() => {
                            debug(`Subplebbit IPNS has been synced with DB`);
                            resolve();
                        }).catch(reject);
                    else {
                        debug(`No need to update subplebbit IPNS`);
                        resolve();
                    }
                }).catch(reject);

        });
    }

    async #publishPostAfterPassingChallenge(publication, challengeRequestId, trx) {
        return new Promise(async (resolve, reject) => {
            delete this._challengeToSolution[challengeRequestId];
            delete this._challengeToPublication[challengeRequestId];

            const postOrCommentOrVote = publication.hasOwnProperty("vote") ? await this.plebbit.createVote(publication) :
                publication.editedContent ? await this.plebbit.createCommentEdit(publication) : await this.plebbit.createComment(publication);
            if (postOrCommentOrVote.getType() === "vote") {
                const lastVote = await this.dbHandler.getLastVoteOfAuthor(postOrCommentOrVote.commentCid, postOrCommentOrVote.author.address, trx);
                if (lastVote?.vote === postOrCommentOrVote.vote) {
                    debug(`Author has duplicated their vote for comment ${postOrCommentOrVote.commentCid}. Returning an error`);
                    resolve({"reason": "User duplicated his vote"});
                } else {
                    await this.dbHandler.upsertVote(postOrCommentOrVote, challengeRequestId, trx);
                    debug(`Inserted new vote (${postOrCommentOrVote.vote}) for comment ${postOrCommentOrVote.commentCid}`);
                }
            } else if (postOrCommentOrVote instanceof CommentEdit) {
                // TODO assert CommentEdit signer is same as original comment
                const commentToBeEdited = await this.dbHandler.queryComment(postOrCommentOrVote.commentCid, trx);
                if (!commentToBeEdited) {
                    debug(`Unable to edit comment (${commentToBeEdited.commentCid}) since it's not in local DB`);
                    resolve({"reason": `commentCid (${postOrCommentOrVote.commentCid}) does not exist`});
                } else if (commentToBeEdited.content === postOrCommentOrVote.editedContent) {
                    debug(`Edited content is identical to original content from comment ${postOrCommentOrVote.commentCid}`);
                    resolve({"reason": "Edited content is identical to original content"});
                } else {
                    await this.dbHandler.upsertComment(postOrCommentOrVote, undefined, trx);
                    debug(`Updated editedContent for comment ${postOrCommentOrVote.commentCid}`);
                }

            } else if (postOrCommentOrVote instanceof Comment) {
                // Comment and Post need to add file to ipfs
                const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));

                const ipnsKeys = (await this.plebbit.ipfsClient.key.list()).map(key => key["name"]);

                if (ipnsKeys.includes(ipnsKeyName)) {
                    debug(`Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`);
                    resolve({"reason": `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`});
                    return;
                } else {
                    postOrCommentOrVote.setCommentIpnsKey(await this.plebbit.ipfsClient.key.gen(ipnsKeyName));
                    if (postOrCommentOrVote.getType() === "post") {
                        postOrCommentOrVote.setPreviousCid((await this.dbHandler.queryLatestPost(trx))?.commentCid);
                        postOrCommentOrVote.setDepth(0);
                        const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                        postOrCommentOrVote.setPostCid(file.path);
                        postOrCommentOrVote.setCommentCid(file.path);
                        await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                        const defaultVote = await this.plebbit.createVote({
                            ...postOrCommentOrVote.toJSON(),
                            "vote": 1
                        });
                        await this.dbHandler.upsertVote(defaultVote, challengeRequestId, trx);
                        debug(`New post with cid ${postOrCommentOrVote.commentCid} has been inserted into DB`);
                    } else {
                        // Comment
                        const commentsUnderParent = await this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx);
                        postOrCommentOrVote.setPreviousCid(commentsUnderParent[0]?.commentCid);
                        const depth = (await this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)).depth + 1;
                        postOrCommentOrVote.setDepth(depth);
                        const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                        postOrCommentOrVote.setCommentCid(file.path);
                        await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                        const defaultVote = await this.plebbit.createVote({
                            ...postOrCommentOrVote.toJSON(),
                            "vote": 1
                        });
                        await this.dbHandler.upsertVote(defaultVote, challengeRequestId, trx);
                        debug(`New comment with cid ${postOrCommentOrVote.commentCid} has been inserted into DB`);
                    }
                }

            }

            resolve({"publication": postOrCommentOrVote});
        });
    }

    async #handleChallengeRequest(msgParsed) {
        const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(msgParsed);
        this._challengeToPublication[msgParsed.challengeRequestId] = msgParsed.publication;
        debug(`Received a request to a challenge (${msgParsed.challengeRequestId})`);
        const trx = await this.dbHandler.createTransaction();
        if (!providedChallenges) {
            // Subplebbit owner has chosen to skip challenging this user or post
            debug(`Skipping challenge for ${msgParsed.challengeRequestId}, add publication to IPFS and respond with challengeVerificationMessage right away`);

            await this.dbHandler.upsertChallenge(new ChallengeRequestMessage(msgParsed), trx);
            const publishedPublication = await this.#publishPostAfterPassingChallenge(msgParsed.publication, msgParsed.challengeRequestId, trx);
            const challengeVerification = new ChallengeVerificationMessage({
                "reason": reasonForSkippingCaptcha,
                "challengePassed": Boolean(publishedPublication.publication), // If no publication, this will be false
                "challengeAnswerId": msgParsed.challengeAnswerId,
                "challengeErrors": undefined,
                "challengeRequestId": msgParsed.challengeRequestId,
                ...publishedPublication
            });
            await this.dbHandler.upsertChallenge(challengeVerification, trx); //TODO implement later
            await this.plebbit.ipfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)));
        } else {
            const challengeMessage = new ChallengeMessage({
                "challengeRequestId": msgParsed.challengeRequestId,
                "challenges": providedChallenges
            });
            await this.dbHandler.upsertChallenge(challengeMessage, trx); //TODO implement later

            await this.plebbit.ipfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeMessage)));
            debug(`Responded to challengeRequest (${challengeMessage.challengeRequestId}) with challenges`);
        }

        trx.commit().then().catch((err) => {
            debug(`Failed to commit DB due to error = ${err}`);
            trx.rollback();
        });

    }

    async #handleChallengeAnswer(msgParsed) {
        const [challengePassed, challengeErrors] = await this.validateCaptchaAnswerCallback(msgParsed);
        debug(`Received a pubsub message (${msgParsed.challengeRequestId}) with type ${msgParsed.type}`);
        const trx = await this.dbHandler.createTransaction();
        if (challengePassed) {
            await this.dbHandler.upsertChallenge(new ChallengeAnswerMessage(msgParsed), trx);
            const storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
            const publishedPublication = await this.#publishPostAfterPassingChallenge(storedPublication, msgParsed.challengeRequestId, trx); // could contain "publication" or "reason"

            const challengeVerification = new ChallengeVerificationMessage({
                "challengeRequestId": msgParsed.challengeRequestId,
                "challengeAnswerId": msgParsed.challengeAnswerId,
                "challengePassed": challengePassed,
                "challengeErrors": challengeErrors,
                ...publishedPublication
            });

            await this.dbHandler.upsertChallenge(challengeVerification, trx);
            await this.plebbit.ipfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)));
            debug(`Challenge (${msgParsed.challengeRequestId}) has passed`);
        } else {
            const challengeVerification = new ChallengeVerificationMessage({
                "challengeRequestId": msgParsed.challengeRequestId,
                "challengeAnswerId": msgParsed.challengeAnswerId,
                "challengePassed": challengePassed,
                "challengeErrors": challengeErrors,
            });
            await this.dbHandler.upsertChallenge(challengeVerification, trx);

            await this.plebbit.ipfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)));
            debug(`Challenge (${msgParsed.challengeRequestId}) failed to pass due to error=${challengeErrors}`);
        }
        trx.commit().then().catch((err) => {
            debug(`Failed to commit DB due to error = ${err}`);
            trx.rollback();
        });
    }

    async #processCaptchaPubsub(pubsubMsg) {
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));

        if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST)
            await this.#handleChallengeRequest(msgParsed);
        else if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER && this._challengeToPublication[msgParsed.challengeRequestId])
            // Only reply to peers who started a challenge request earlier
            await this.#handleChallengeAnswer(msgParsed);
    }

    async #defaultProvideCaptcha(challengeRequestMessage) {

        // Return question, type
        // Expected return is:
        // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
        return new Promise(async (resolve, reject) => {
            const {image, text} = createCaptcha(300, 100);
            this._challengeToSolution[challengeRequestMessage.challengeRequestId] = text;
            image.then(imageBuffer => resolve([[new Challenge({
                "challenge": imageBuffer,
                "type": CHALLENGE_TYPES.image
            })], undefined])).catch(reject);
        });

    }

    async #defaultValidateCaptcha(challengeAnswerMessage) {
        return new Promise(async (resolve, reject) => {
            const actualSolution = this._challengeToSolution[challengeAnswerMessage.challengeRequestId];
            const answerIsCorrect = challengeAnswerMessage.challengeAnswers === actualSolution;
            const reason = answerIsCorrect ? "User solved captcha correctly" : "User solved captcha incorrectly";
            resolve([answerIsCorrect, reason]);
        });
    }

    async #syncIpnsWithDb() {
        return new Promise(async (resolve, reject) => {
            const trx = await this.dbHandler.createTransaction();
            debug("Starting to sync IPNS with DB");
            const syncComment = async (dbComment) => {
                return new Promise(async (syncResolve, syncReject) => {
                    loadIpnsAsJson(dbComment.ipnsName, this.plebbit.ipfsClient).then(async currentIpns => {
                        if (!shallowEqual(currentIpns, dbComment.toJSONCommentUpdate(), ["sortedReplies", "sortedRepliesCids"])) {
                            debug(`Comment (${dbComment.commentCid}) IPNS is outdated`);
                            let [sortedReplies, sortedRepliesCids] = await this.sortHandler.calculateSortedPosts(dbComment, trx);
                            if (sortedReplies)
                                sortedReplies = {[SORTED_COMMENTS_TYPES.TOP_ALL]: sortedReplies[SORTED_COMMENTS_TYPES.TOP_ALL]};
                            dbComment.setUpdatedAt(timestamp());
                            await this.dbHandler.upsertComment(dbComment, undefined, trx);
                            dbComment.edit({
                                ...dbComment.toJSONCommentUpdate(),
                                "sortedReplies": sortedReplies,
                                "sortedRepliesCids": sortedRepliesCids,

                            }).then(() => {
                                debug(`Comment (${dbComment.commentCid}) IPNS (${dbComment.ipnsName}) has been synced`);
                                syncResolve();
                            }).catch(syncReject);
                        } else {
                            debug(`Comment (${dbComment.commentCid}) is already synced`);
                            syncResolve();
                        }
                    }).catch(syncReject);

                });
            };

            const errorHandle = async (err) => {
                await trx.rollback(err);
                debug(`Failed to sync due to error: ${err}`);
                reject(err);
            };

            this.dbHandler.queryComments(trx).then(async comments =>
                Promise.all([...comments.map(async comment => syncComment(comment)), this.#updateSubplebbitIpns(trx)]).then(async () => {
                    // this.emit("update", this);
                    debug(`Subplebbit IPNS is caught up with DB`);
                    trx.commit().then(resolve).catch(errorHandle);
                }).catch(errorHandle))
                .catch(errorHandle);
        });

    }


    async startPublishing(syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS) {
        if (!this.dbHandler)
            await this.#initDb();
        if (!this.provideCaptchaCallback) {
            debug(`Subplebbit-startPublishing`, "Subplebbit owner has not provided any captcha. Will go with default image captcha");
            this.provideCaptchaCallback = this.#defaultProvideCaptcha;
            this.validateCaptchaAnswerCallback = this.#defaultValidateCaptcha;
        }
        assert(this.dbHandler, "A connection to a database is needed for the hosting a subplebbit");
        const subscribedTopics = (await this.plebbit.ipfsClient.pubsub.ls());
        if (!subscribedTopics.includes(this.pubsubTopic))
            await this.plebbit.ipfsClient.pubsub.subscribe(this.pubsubTopic, this.#processCaptchaPubsub.bind(this));
        if (this._syncIpnsInterval)
            clearInterval(this._syncIpnsInterval);
        this._syncIpnsInterval = setInterval(this.#syncIpnsWithDb.bind(this), syncIntervalMs); // two minute
    }

    async stopPublishing() {
        await this.plebbit.ipfsClient.pubsub.unsubscribe(this.pubsubTopic);
        this.removeAllListeners();
        this.stop();
        this.dbHandler?.knex?.destroy();
        this.dbHandler = undefined;
        clearInterval(this._syncIpnsInterval);
    }

    async destroy() {
        // For development purposes ONLY
        // Call this only if you know what you're doing
        // rm ipns and ipfs
        await this.stopPublishing();
        const ipfsPath = (await last(this.plebbit.ipfsClient.name.resolve(this.subplebbitAddress)));
        await this.plebbit.ipfsClient.pin.rm(ipfsPath);
        await this.plebbit.ipfsClient.key.rm(this.ipnsKeyName);
    }

    // For development purposes only
    async _addPublicationToDb(publication) {
        return new Promise(async (resolve, reject) => {
            const randomUUID = uuidv4();
            const trx = await this.dbHandler.createTransaction();
            await this.dbHandler.upsertChallenge(new ChallengeRequestMessage({"challengeRequestId": randomUUID}), trx);
            this.#publishPostAfterPassingChallenge(publication, randomUUID, trx).then((res) => {
                trx.commit().then(() => resolve(res)).catch(reject);
            }).catch(reject);
        });
    }

}