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

// import {Signer} from "./Signer.js";


export class Subplebbit {
    constructor(props, plebbit) {
        this.plebbit = plebbit;
        this.#initSubplebbit(props);
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this.provideCaptchaCallback = undefined;
        this.validateCaptchaAnswerCallback = undefined;
        this.event = new EventEmitter();
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
            "metricsCid": this.metricsCid
        };
    }

    async edit(newSubplebbitOptions) {
        this.#initSubplebbit(newSubplebbitOptions);
        return new Promise(async (resolve, reject) => {
                if (!this.subplebbitAddress) { // TODO require signer
                    this.plebbit.ipfsClient.key.gen(this.title).then(ipnsKey => {
                        this.edit({
                            "subplebbitAddress": ipnsKey["id"],
                            "ipnsKeyName": ipnsKey["name"]
                        }).then(resolve).catch(reject);
                    }).catch(reject);
                } else {
                    this.plebbit.ipfsClient.add(JSON.stringify(this)).then(file => {
                        this.plebbit.ipfsClient.name.publish(file["cid"], {
                            "lifetime": "5h", // TODO decide on optimal time later
                            "key": this.ipnsKeyName
                        }).then(resolve).catch(reject);
                    }).catch(reject);

                }

            }
        );
    }

    async #getSortedPostsObject() {
        [this.sortedPosts, this.sortedPostsCids] = await this.sortHandler.calculateSortedPosts();
        this.sortedPosts = {[SORTED_COMMENTS_TYPES.HOT]: this.sortedPosts[SORTED_COMMENTS_TYPES.HOT]};
        return {
            "sortedPosts": this.sortedPosts,
            "sortedPostsCids": this.sortedPostsCids
        };
    }

    async #updateMetricsCid() {
        const metrics = await this?.dbHandler?.querySubplebbitMetrics();
        if (metrics)
            this.metricsCid = (await this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path;
    }

    async #updateSubplebbitPosts(post) {
        await this.#updateMetricsCid();
        const newSubplebbitOptions = {
            ...(await this.#getSortedPostsObject()),
            "metricsCid": this.metricsCid,
            "latestPostCid": post.postCid,
        }
        await this.edit(newSubplebbitOptions);
        this.event.emit("post", post);
    }

    async #updateParentOfComment(comment) {
        const [sortedReplies, sortedRepliesCids] = await this.sortHandler.calculateSortedReplies(comment.parentCid);
        const commentParent = await this.dbHandler.queryComment(comment.parentCid);
        const commentParentUpdate = {
            ...(commentParent.toJSONCommentUpdate()),
            "sortedReplies": {[SORTED_COMMENTS_TYPES.HOT]: sortedReplies[SORTED_COMMENTS_TYPES.HOT]},
            "sortedRepliesCids": sortedRepliesCids,
            "replyCount": commentParent.replyCount
        };
        await commentParent.edit(commentParentUpdate);
        this.event.emit("comment", comment);
    }

    async #publishVote(newVote, challengeRequestId) {
        return new Promise(async (resolve, reject) => {
            const lastVote = await this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address);
            const voteComment = await this.dbHandler.queryComment(newVote.commentCid);
            const [upvotes, downvotes] = await this.dbHandler.queryVotesOfComment(newVote.commentCid);

            let newUpvoteCount = -1, newDownvoteCount = -1;
            if (lastVote) {
                // User has voted before and is trying to change his vote

                if (newVote.vote === lastVote.vote) {
                    resolve({"reason": "User duplicated his vote"});
                    return;
                } else if (newVote.vote === 0) {
                    newUpvoteCount = upvotes + (lastVote.vote === 1 ? -1 : 0);
                    newDownvoteCount = downvotes + (lastVote.vote === -1 ? -1 : 0);
                } else {
                    if (lastVote.vote === 1 && newVote.vote === -1) {
                        newUpvoteCount = upvotes - 1;
                        newDownvoteCount = downvotes + 1;
                    } else if (lastVote.vote === -1 && newVote.vote === 1) {
                        newUpvoteCount = upvotes + 1;
                        newDownvoteCount = downvotes - 1;
                    }
                }
            } else {
                // New vote
                newUpvoteCount = newVote.vote === 1 ? upvotes + 1 : upvotes;
                newDownvoteCount = newVote.vote === -1 ? downvotes + 1 : downvotes;
            }
            assert(newDownvoteCount >= 0 && newDownvoteCount >= 0, "New upvote and downvote need to be proper numbers");
            await this.dbHandler.upsertVote(newVote, challengeRequestId);
            await voteComment.update();
            if (voteComment.getType() === "post") {
                Promise.all([this.edit(await this.#getSortedPostsObject()), voteComment.edit({
                    ...voteComment.toJSONCommentUpdate(),
                    "upvoteCount": newUpvoteCount,
                    "downvoteCount": newDownvoteCount
                })]).then(() => resolve({"publication": newVote})).catch(reject);

            } else if (voteComment.getType() === "comment") {
                const [sortedReplies, sortedRepliesCids] = await this.sortHandler.calculateSortedReplies(voteComment.commentCid);
                voteComment.edit({
                    ...voteComment.toJSONCommentUpdate(),
                    "sortedReplies": {[SORTED_COMMENTS_TYPES.HOT]: sortedReplies[SORTED_COMMENTS_TYPES.HOT]},
                    "sortedRepliesCids": sortedRepliesCids,
                    "upvoteCount": newUpvoteCount,
                    "downvoteCount": newDownvoteCount
                }).then(() => resolve({"publication": newVote})).catch(reject);
            }
        });
    }

    async #publishPubsubMsg(publication, challengeRequestId) {
        return new Promise(async (resolve, reject) => {
            const postOrCommentOrVote = publication.hasOwnProperty("vote") ? await this.plebbit.createVote(publication) :
                publication.hasOwnProperty("editedContent") ? await this.plebbit.createCommentEdit(publication) : await this.plebbit.createComment(publication);

            if (postOrCommentOrVote.getType() === "vote")
                this.#publishVote(postOrCommentOrVote, challengeRequestId).then(resolve).catch(reject);
            else if (postOrCommentOrVote instanceof CommentEdit) {
                // TODO assert CommentEdit signer is same as original comment
                const commentToBeEdited = await this.dbHandler.queryComment(postOrCommentOrVote.commentCid);
                if (!commentToBeEdited)
                    resolve({"reason": `commentCid (${postOrCommentOrVote.commentCid}) does not exist`});
                else if (commentToBeEdited.content === postOrCommentOrVote.editedContent)
                    resolve({"reason": "Edited content is identical to original content"});
                else {
                    await commentToBeEdited.update();
                    await commentToBeEdited.edit({
                        ...commentToBeEdited.toJSONCommentUpdate(),
                        "editedContent": postOrCommentOrVote.editedContent
                    });
                    // TODO update DB here
                    resolve({"publication": commentToBeEdited});
                }
            } else if (postOrCommentOrVote instanceof Comment) {
                // Comment and Post need to add file to ipfs
                const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));

                const ipnsKeys = (await this.plebbit.ipfsClient.key.list()).map(key => key["name"]);

                if (ipnsKeys.includes(ipnsKeyName))
                    resolve({"reason": `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`});
                else {
                    postOrCommentOrVote.setCommentIpnsKey(await this.plebbit.ipfsClient.key.gen(ipnsKeyName));
                    if (postOrCommentOrVote.getType() === "post") {
                        postOrCommentOrVote.setPreviousCommentCid(this.latestPostCid);
                        postOrCommentOrVote.setDepth(0);
                        const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                        postOrCommentOrVote.setPostCid(file.path);
                        postOrCommentOrVote.setCommentCid(file.path);
                        postOrCommentOrVote.edit({"upvoteCount": 1, "downvoteCount": 0, "replyCount": 0}).catch(reject);
                        await this.dbHandler.insertComment(postOrCommentOrVote, challengeRequestId);
                        const defaultVote = await this.plebbit.createVote({
                            ...postOrCommentOrVote.toJSON(),
                            "vote": 1
                        });
                        await this.dbHandler.upsertVote(defaultVote, challengeRequestId);
                        await this.#updateSubplebbitPosts(postOrCommentOrVote);
                        resolve({"publication": postOrCommentOrVote});
                    } else {
                        // Comment
                        const commentsUnderParent = await this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid);
                        postOrCommentOrVote.setPreviousCommentCid(commentsUnderParent[0]?.commentCid);
                        const depth = (await this.dbHandler.queryComment(postOrCommentOrVote.parentCid)).depth + 1;
                        postOrCommentOrVote.setDepth(depth);
                        const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                        postOrCommentOrVote.setCommentCid(file.path);
                        await postOrCommentOrVote.edit({"upvoteCount": 1, "downvoteCount": 0, "replyCount": 0});
                        await this.dbHandler.insertComment(postOrCommentOrVote, challengeRequestId);
                        const defaultVote = await this.plebbit.createVote({
                            ...postOrCommentOrVote.toJSON(),
                            "vote": 1
                        });
                        await this.dbHandler.upsertVote(defaultVote, challengeRequestId);
                        await this.#updateParentOfComment(postOrCommentOrVote);
                        resolve({"publication": postOrCommentOrVote});

                    }
                }

            }
        });
    }

    async #publishPostAfterPassingChallenge(msgParsed) {
        delete this._challengeToSolution[msgParsed.challengeRequestId];
        return await this.#publishPubsubMsg(msgParsed.publication, msgParsed.challengeRequestId);
    }

    async #processCaptchaPubsub(pubsubMsg) {

        const validateCaptchaAnswer = async (pubsubMsg) => {
            const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
            if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER) {

                const [challengePassed, challengeErrors] = await this.validateCaptchaAnswerCallback(msgParsed);
                if (challengePassed) {
                    await this.dbHandler.upsertChallenge(new ChallengeAnswerMessage(msgParsed));
                    const storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
                    const publishedPublication = await this.#publishPostAfterPassingChallenge({"publication": storedPublication, ...msgParsed}); // could contain "publication" or "reason"

                    const challengeVerification = new ChallengeVerificationMessage({
                        "challengeRequestId": msgParsed.challengeRequestId,
                        "challengeAnswerId": msgParsed.challengeAnswerId,
                        "challengePassed": challengePassed,
                        "challengeErrors": challengeErrors,
                        ...publishedPublication
                    });

                    await this.dbHandler.upsertChallenge(challengeVerification);
                    await this.plebbit.ipfsClient.pubsub.publish(challengeVerification.challengeAnswerId, uint8ArrayFromString(JSON.stringify(challengeVerification)));
                } else {
                    const challengeVerification = new ChallengeVerificationMessage({
                        "challengeRequestId": msgParsed.challengeRequestId,
                        "challengeAnswerId": msgParsed.challengeAnswerId,
                        "challengePassed": challengePassed,
                        "challengeErrors": challengeErrors,
                    });
                    await this.dbHandler.upsertChallenge(challengeVerification); //TODO implement later

                    await this.plebbit.ipfsClient.pubsub.publish(challengeVerification.challengeAnswerId, uint8ArrayFromString(JSON.stringify(challengeVerification)));
                }
                delete this._challengeToPublication[msgParsed.challengeRequestId];
            }
        }
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));

        if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST) {
            const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(msgParsed);
            this._challengeToPublication[msgParsed.challengeRequestId] = msgParsed.publication;
            if (!providedChallenges) {
                // Subplebbit owner has chosen to skip challenging this user or post
                await this.dbHandler.upsertChallenge(new ChallengeRequestMessage(msgParsed)); //TODO implement later
                const publishedPublication = await this.#publishPostAfterPassingChallenge(msgParsed);
                const challengeVerification = new ChallengeVerificationMessage({
                    "reason": reasonForSkippingCaptcha,
                    "challengePassed": Boolean(publishedPublication.publication), // If no publication, this will be false
                    "challengeAnswerId": msgParsed.challengeAnswerId,
                    "challengeErrors": undefined,
                    "challengeRequestId": msgParsed.challengeRequestId,
                    ...publishedPublication
                });
                await this.dbHandler.upsertChallenge(challengeVerification); //TODO implement later
                await this.plebbit.ipfsClient.pubsub.publish(challengeVerification.challengeRequestId, uint8ArrayFromString(JSON.stringify(challengeVerification)));

            } else {
                const challengeMessage = new ChallengeMessage({
                    "challengeRequestId": msgParsed.challengeRequestId,
                    "challenges": providedChallenges
                });
                await this.dbHandler.upsertChallenge(challengeMessage); //TODO implement later

                await this.plebbit.ipfsClient.pubsub.publish(challengeMessage.challengeRequestId, uint8ArrayFromString(JSON.stringify(challengeMessage)));
                await this.plebbit.ipfsClient.pubsub.subscribe(challengeMessage.challengeRequestId, validateCaptchaAnswer);
            }
        }
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


    async startPublishing() {
        if (!this.dbHandler)
            await this.#initDb();
        if (!this.provideCaptchaCallback) {
            console.log(`Subplebbit-startPublishing`, "Subplebbit owner has not provided any captcha. Will go with default image captcha");
            this.provideCaptchaCallback = this.#defaultProvideCaptcha;
            this.validateCaptchaAnswerCallback = this.#defaultValidateCaptcha;
        }
        assert(this.dbHandler, "A connection to a database is needed for the hosting a subplebbit");
        const subscribedTopics = (await this.plebbit.ipfsClient.pubsub.ls());
        if (!subscribedTopics.includes(this.pubsubTopic))
            await this.plebbit.ipfsClient.pubsub.subscribe(this.pubsubTopic, this.#processCaptchaPubsub.bind(this));
    }

    async stopPublishing() {
        await this.plebbit.ipfsClient.pubsub.unsubscribe(this.pubsubTopic);
        this.event.removeAllListeners();
        this.dbHandler.knex.destroy();
        this.dbHandler = undefined;
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

}