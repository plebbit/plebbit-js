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
import DbHandler, {SIGNER_USAGES} from "./DbHandler.js";
import {createCaptcha} from "captcha-canvas/js-script/extra.js";
import {POSTS_SORT_TYPES, REPLIES_SORT_TYPES, SortHandler} from "./SortHandler.js";
import * as path from "path";
import * as fs from "fs";
import {v4 as uuidv4} from 'uuid';
import {ipfsImportKey, loadIpnsAsJson, shallowEqual, timestamp} from "./Util.js";
import Debug from "debug";
import {decrypt, encrypt, verifyPublication} from "./Signer.js";
import {Pages} from "./Pages.js";

const debug = Debug("plebbit-js:Subplebbit");
const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 180000; // 3 minutes


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
        this.posts = mergedProps["posts"] instanceof Object ? new Pages({
            ...mergedProps["posts"],
            "subplebbit": this
        }) : mergedProps["posts"];
        this.subplebbitAddress = mergedProps["subplebbitAddress"];
        this.ipnsKeyName = mergedProps["ipnsKeyName"];
        this.pubsubTopic = mergedProps["pubsubTopic"] || this.subplebbitAddress;
        this.sortHandler = new SortHandler(this);
        this.challengeTypes = mergedProps["challengeTypes"];
        this.metricsCid = mergedProps["metricsCid"];
        this.createdAt = mergedProps["createdAt"];
        this.updatedAt = mergedProps["updatedAt"];
        this.signer = mergedProps["signer"];
        this.encryption = mergedProps["encryption"];
    }

    async #initSignerIfNeeded() {
        if (this.dbHandler) {
            const dbSigner = await this.dbHandler.querySubplebbitSigner();
            if (!dbSigner) {
                assert(this.signer, "Subplebbit needs a signer to start");
                debug(`Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB`);
                await this.dbHandler.insertSigner({
                    ...this.signer,
                    "ipnsKeyName": this.signer.address,
                    "usage": SIGNER_USAGES.SUBPLEBBIT
                });
            } else if (!this.signer) {
                debug(`Subplebbit loaded signer from DB`);
                this.signer = dbSigner;
            }
        }

        this.encryption = {"type": this.signer.type, "publicKey": this.signer.publicKey};

        if (!this.subplebbitAddress && this.signer) {
            // Look for subplebbit address (key.id) in the ipfs node
            const ipnsKeys = (await this.plebbit.ipfsClient.key.list());
            const ipfsKey = ipnsKeys.filter(key => key.name === this.signer.address)[0];
            debug(Boolean(ipfsKey) ? `Owner has provided a signer that maps to ${ipfsKey.id} subplebbit address within ipfs node` : `Owner has provided a signer that doesn't map to any subplebbit address within the ipfs node`);
            this.subplebbitAddress = ipfsKey?.id;
        }

    }

    async #initDbIfNeeded() {
        if (this.dbHandler)
            return;
        if (!this._dbConfig) {
            assert(this.subplebbitAddress, "Need subplebbit address to initialize a DB connection");
            const dbPath = path.join(this.plebbit.dataPath, this.subplebbitAddress);
            debug(`User has not provided a DB config. Will initialize DB in ${dbPath}`);
            this._dbConfig = {
                client: 'better-sqlite3', // or 'better-sqlite3'
                connection: {
                    filename: dbPath
                },
                useNullAsDefault: true
            }
        } else
            debug(`User provided a DB config of ${this._dbConfig}`);

        const dir = path.dirname(this._dbConfig.connection.filename);
        await fs.promises.mkdir(dir, {"recursive": true});
        this.dbHandler = new DbHandler(this._dbConfig, this);
        await this.dbHandler.createTablesIfNeeded();
        await this.#initSignerIfNeeded();
    }


    setProvideCaptchaCallback(newCallback) {
        this.provideCaptchaCallback = newCallback;
    }

    setValidateCaptchaAnswerCallback(newCallback) {
        this.validateCaptchaAnswerCallback = newCallback;
    }

    #toJSONInternal() {
        return {
            ...this.toJSON(),
            "ipnsKeyName": this.ipnsKeyName,
            "database": this._dbConfig,
            "signer": this.signer
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
            "posts": this.posts,
            "challengeTypes": this.challengeTypes,
            "metricsCid": this.metricsCid,
            "createdAt": this.createdAt,
            "updatedAt": this.updatedAt,
            "encryption": this.encryption
        };
    }

    async edit(newSubplebbitOptions) {
        return new Promise(async (resolve, reject) => {
                this.#initSubplebbit(newSubplebbitOptions);
                await this.#initSignerIfNeeded();
                if (!this.subplebbitAddress) { // TODO require signer
                    debug(`Subplebbit does not have an address`);
                    const ipnsKeyName = this.signer.address;
                    ipfsImportKey({...this.signer, "ipnsKeyName": ipnsKeyName}, this.plebbit).then(ipnsKey => {
                        const subplebbitAddress = ipnsKey["id"] || ipnsKey["Id"]
                        debug(`Generated an address for subplebbit (${subplebbitAddress})`);
                        this.edit({
                            "subplebbitAddress": subplebbitAddress, // It seems ipfs key import returns {Id, Name} while ipfs gen returns {id, name} so we're accounting for both cases here
                            "ipnsKeyName": ipnsKey["name"] || ipnsKey["Name"],
                            "createdAt": timestamp()
                        }).then(resolve).catch(reject);
                    }).catch(reject);
                } else {
                    await this.#initDbIfNeeded();
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

    async #updateSubplebbitIpns() {
        return new Promise(async (resolve, reject) => {
            const trx = await this.dbHandler.createTransaction();
            Promise.all([this.dbHandler.querySubplebbitMetrics(trx), this.sortHandler.generatePagesUnderComment(undefined, trx), this.dbHandler.queryLatestPost(trx)])
                .then(async ([metrics, [sortedPosts, sortedPostsCids], latestPost]) => {
                    let posts;
                    if (sortedPosts)
                        posts = new Pages({"pages": {[POSTS_SORT_TYPES.HOT.type]: sortedPosts[POSTS_SORT_TYPES.HOT.type]}, "pageCids": sortedPostsCids, "plebbit": this.plebbit});
                    const newSubplebbitOptions = {
                        "posts": posts,
                        "metricsCid": (await this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path,
                        "latestPostCid": latestPost?.postCid,
                    };
                    if (JSON.stringify(this.posts) !== JSON.stringify(newSubplebbitOptions.posts) ||
                        this.metricsCid !== newSubplebbitOptions.metricsCid || this.latestPostCid !== newSubplebbitOptions.latestPostCid)
                        this.edit(newSubplebbitOptions).then(() => {
                            debug(`Subplebbit IPNS has been synced with DB`);
                            resolve();
                        }).catch(reject);
                    else {
                        debug(`No need to update subplebbit IPNS`);
                        resolve();
                    }
                }).catch(reject).finally(async () => await trx.commit());

        });
    }

    async #handleCommentEdit(commentEdit, challengeRequestId, trx) {
        // TODO assert CommentEdit signer is same as original comment
        const commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, trx);
        const [signatureIsVerified, verificationFailReason] = await verifyPublication(commentEdit);
        if (!signatureIsVerified) {
            debug(`Comment edit of ${commentEdit.commentCid} has been rejected due to having invalid signature. Reason = ${verificationFailReason}`);
            return {"reason": `Comment edit of ${commentEdit.commentCid} has been rejected due to having invalid signature`};
        } else if (!commentToBeEdited) {
            debug(`Unable to edit comment (${commentEdit.commentCid}) since it's not in local DB`);
            return {"reason": `commentCid (${commentEdit.commentCid}) does not exist`};
        } else if (commentEdit.editSignature.publicKey !== commentToBeEdited.signature.publicKey) {
            // Original comment and CommentEdit need to have same key
            // TODO make exception for moderators
            debug(`User attempted to edit a comment (${commentEdit.commentCid}) without having its keys`);
            return {"reason": `Comment edit of ${commentEdit.commentCid} due to having different author keys than original comment`};
        } else if (shallowEqual(commentToBeEdited.signature, commentEdit.editSignature)) {
            debug(`Signature of CommentEdit is identical to original comment (${commentEdit.cid})`);
            return {"reason": `Signature of CommentEdit is identical to original comment (${commentEdit.cid})`};
        } else {
            await this.dbHandler.upsertComment(commentEdit, undefined, trx);
            debug(`Updated content for comment ${commentEdit.commentCid}`);
        }


    }

    async #handleVote(newVote, challengeRequestId, trx) {
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(newVote);
        if (!signatureIsVerified) {
            debug(`Author (${newVote.author.address}) vote (${newVote.vote} vote's signature is invalid. Reason = ${failedVerificationReason}`);
            return {"reason": "Invalid signature"};
        }
        const lastVote = await this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address, trx);
        if (lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey) {
            // Original comment and CommentEdit need to have same key
            // TODO make exception for moderators
            debug(`Author (${newVote.author.address}) attempted to edit a comment vote (${newVote.commentCid}) without having correct credentials`);
            return {"reason": `Author (${newVote.author.address}) attempted to change vote on  ${newVote.commentCid} without having correct credentials`};
        } else if (shallowEqual(newVote.signature, lastVote?.signature)) {
            debug(`Signature of Vote is identical to original Vote (${newVote.commentCid})`);
            return {"reason": `Signature of Vote is identical to original Vote (${newVote.commentCid}) by author ${newVote?.author?.address}`};
        } else if (lastVote?.vote === newVote.vote) {
            debug(`Author (${newVote?.author.address}) has duplicated their vote for comment ${newVote.commentCid}. Returning an error`);
            return {"reason": "User duplicated their vote"};
        } else {
            await this.dbHandler.upsertVote(newVote, challengeRequestId, trx);
            debug(`Upserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
        }

    }

    async #publishPostAfterPassingChallenge(publication, challengeRequestId, trx) {

        delete this._challengeToSolution[challengeRequestId];
        delete this._challengeToPublication[challengeRequestId];

        const postOrCommentOrVote = publication.hasOwnProperty("vote") ? await this.plebbit.createVote(publication) :
            publication.commentCid ? await this.plebbit.createCommentEdit(publication) : await this.plebbit.createComment(publication);
        if (postOrCommentOrVote.getType() === "vote") {
            const res = await this.#handleVote(postOrCommentOrVote, challengeRequestId, trx);
            if (res)
                return res;
        } else if (postOrCommentOrVote.commentCid) {
            const res = await this.#handleCommentEdit(postOrCommentOrVote, challengeRequestId, trx);
            if (res)
                return res;
        } else if (postOrCommentOrVote.content) {
            // Comment and Post need to add file to ipfs
            const signatureIsVerified = (await verifyPublication(postOrCommentOrVote))[0];
            if (!signatureIsVerified) {
                debug(`Author (${postOrCommentOrVote.author.address}) comment's signature is invalid`);
                return {"reason": "Invalid signature"};
            }

            const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));

            if (await this.dbHandler.querySigner(ipnsKeyName, trx)) {
                const msg = `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`
                debug(msg);
                return {"reason": msg};
            } else {
                const ipfsSigner = {
                    ...await this.plebbit.createSigner(),
                    "ipnsKeyName": ipnsKeyName,
                    "usage": SIGNER_USAGES.COMMENT
                };
                const [ipfsKey,] = await Promise.all([ipfsImportKey(ipfsSigner, this.plebbit), this.dbHandler.insertSigner(ipfsSigner, trx)]);

                postOrCommentOrVote.setCommentIpnsKey(ipfsKey);
                if (postOrCommentOrVote.getType() === "post") {
                    postOrCommentOrVote.setPreviousCid((await this.dbHandler.queryLatestPost(trx))?.cid);
                    postOrCommentOrVote.setDepth(0);
                    const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                    postOrCommentOrVote.setPostCid(file.path);
                    postOrCommentOrVote.setCid(file.path);
                    await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                    debug(`New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
                } else {
                    // Comment
                    // TODO throw an error when user tries to comment a non existent post/comment
                    const [commentsUnderParent, parent] = await Promise.all([this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx), this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)]);
                    postOrCommentOrVote.setPreviousCid(commentsUnderParent[0]?.cid);
                    postOrCommentOrVote.setDepth(parent.depth + 1);
                    const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                    postOrCommentOrVote.setCid(file.path);
                    await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                    debug(`New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
                }
            }

        }

        return {"publication": postOrCommentOrVote};

    }

    async #handleChallengeRequest(msgParsed) {
        return new Promise(async (resolve, reject) => {
            const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(msgParsed);
            const decryptedPublication = JSON.parse(await decrypt(msgParsed.encryptedPublication.encryptedString, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey));
            this._challengeToPublication[msgParsed.challengeRequestId] = decryptedPublication;
            debug(`Received a request to a challenge (${msgParsed.challengeRequestId})`);
            if (!providedChallenges) {
                // Subplebbit owner has chosen to skip challenging this user or post
                debug(`Skipping challenge for ${msgParsed.challengeRequestId}, add publication to IPFS and respond with challengeVerificationMessage right away`);
                const trx = decryptedPublication.vote ? undefined : await this.dbHandler.createTransaction(); // Votes don't need transaction

                await this.dbHandler.upsertChallenge(new ChallengeRequestMessage(msgParsed), trx);
                const publishedPublication = await this.#publishPostAfterPassingChallenge(decryptedPublication, msgParsed.challengeRequestId, trx);

                const restOfMsg = "publication" in publishedPublication ? {"encryptedPublication": await encrypt(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.signature || publishedPublication.publication.editSignature).publicKey)} : publishedPublication;
                const challengeVerification = new ChallengeVerificationMessage({
                    "reason": reasonForSkippingCaptcha,
                    "challengePassed": Boolean(publishedPublication.publication), // If no publication, this will be false
                    "challengeAnswerId": msgParsed.challengeAnswerId,
                    "challengeErrors": undefined,
                    "challengeRequestId": msgParsed.challengeRequestId,
                    ...restOfMsg
                });
                this.#upsertAndPublishChallenge(challengeVerification, trx).then(resolve).catch(reject);
            } else {
                const challengeMessage = new ChallengeMessage({
                    "challengeRequestId": msgParsed.challengeRequestId,
                    "challenges": providedChallenges
                });
                this.#upsertAndPublishChallenge(challengeMessage, undefined).then(resolve).catch(reject);
            }

        });


    }

    async #upsertAndPublishChallenge(challenge, trx) {
        return new Promise(async (resolve, reject) => {
            const errHandle = async (err) => {
                debug(`Failed to publish challenge type ${challenge.type} (${challenge.challengeRequestId}) due to error = ${err}`);
                if (trx)
                    await trx.rollback();
                reject(err);
            };

            Promise.all([this.dbHandler.upsertChallenge(challenge, trx), this.plebbit.ipfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challenge)))])
                .then(() => {
                    if (trx)
                        trx.commit().then(() => {
                                debug(`Published challenge type ${challenge.type} (${challenge.challengeRequestId})`);
                                resolve();
                            }
                        ).catch(errHandle)
                    else {
                        debug(`Published challenge type ${challenge.type} (${challenge.challengeRequestId})`);
                        resolve();
                    }
                }).catch(errHandle)

        });

    }

    async #handleChallengeAnswer(msgParsed) {
        return new Promise(async (resolve, reject) => {
            const [challengePassed, challengeErrors] = await this.validateCaptchaAnswerCallback(msgParsed);
            debug(`Received a pubsub message (${msgParsed.challengeRequestId}) with type ${msgParsed.type}`);
            if (challengePassed) {
                const storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
                const trx = storedPublication.vote ? undefined : await this.dbHandler.createTransaction(); // Votes don't need transactions
                await this.dbHandler.upsertChallenge(new ChallengeAnswerMessage(msgParsed), trx);
                const publishedPublication = await this.#publishPostAfterPassingChallenge(storedPublication, msgParsed.challengeRequestId, trx); // could contain "publication" or "reason"

                const restOfMsg = "publication" in publishedPublication ? {"encryptedPublication": await encrypt(JSON.stringify(publishedPublication.publication), publishedPublication.publication.signature.publicKey)} : publishedPublication;
                const challengeVerification = new ChallengeVerificationMessage({
                    "challengeRequestId": msgParsed.challengeRequestId,
                    "challengeAnswerId": msgParsed.challengeAnswerId,
                    "challengePassed": challengePassed,
                    "challengeErrors": challengeErrors,
                    ...restOfMsg
                });
                this.#upsertAndPublishChallenge(challengeVerification, trx).then(resolve).catch(reject);
            } else {
                const challengeVerification = new ChallengeVerificationMessage({
                    "challengeRequestId": msgParsed.challengeRequestId,
                    "challengeAnswerId": msgParsed.challengeAnswerId,
                    "challengePassed": challengePassed,
                    "challengeErrors": challengeErrors,
                });
                this.#upsertAndPublishChallenge(challengeVerification, undefined).then(resolve).catch(reject);
            }
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
            debug("Starting to sync IPNS with DB");
            const syncComment = async (dbComment) => {
                const currentIpns = await loadIpnsAsJson(dbComment.ipnsName, this.plebbit.ipfsClient);
                if (!currentIpns || !shallowEqual(currentIpns, dbComment.toJSONCommentUpdate(), ["replies"])) {
                    debug(`Comment (${dbComment.cid}) IPNS is outdated`);
                    let [sortedReplies, sortedRepliesCids] = await this.sortHandler.generatePagesUnderComment(dbComment);
                    if (sortedReplies)
                        sortedReplies = new Pages({"pages": {[REPLIES_SORT_TYPES.TOP_ALL.type]: sortedReplies[REPLIES_SORT_TYPES.TOP_ALL.type]}, "pageCids": sortedRepliesCids, "plebbit": this.plebbit});
                    dbComment.setUpdatedAt(timestamp());
                    await this.dbHandler.upsertComment(dbComment, undefined);
                    return dbComment.edit({
                        ...dbComment.toJSONCommentUpdate(),
                        "replies": sortedReplies,
                    });
                } else
                    debug(`Comment (${dbComment.cid}) is already synced`);
            };

            const errorHandle = async (err) => {
                debug(`Failed to sync due to error: ${err}`);
                reject(err);
            };

            this.dbHandler.queryComments().then(async comments =>
                Promise.all([...comments.map(async comment => syncComment(comment)), this.#updateSubplebbitIpns()]).then(resolve).catch(errorHandle)).catch(errorHandle);
        });

    }


    async startPublishing(syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS) {
        await this.#initDbIfNeeded();
        await this.#initSignerIfNeeded();


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
            const trx = publication.vote ? undefined : await this.dbHandler.createTransaction(); // No need for votes to reserve a transaction
            const errHandle = async (err) => {
                debug(err);
                await trx?.rollback(err);
                reject(err);
            }
            await this.dbHandler.upsertChallenge(new ChallengeRequestMessage({"challengeRequestId": randomUUID}), trx);
            this.#publishPostAfterPassingChallenge(publication, randomUUID, trx).then((res) => {
                if (trx)
                    trx.commit().then(() => resolve(res)).catch(errHandle);
                else
                    resolve(res);
            }).catch(errHandle);
        });
    }

}