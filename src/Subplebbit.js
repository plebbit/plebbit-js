import Comment, {CommentIPNS} from "./Comment.js";
import last from "it-last";
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import EventEmitter from "events";
import {sha256} from "js-sha256";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'

import {
    CHALLENGE_TYPES, ChallengeAnswerMessage,
    ChallengeMessage,
    ChallengeRequestMessage,
    ChallengeVerificationMessage,
    PUBSUB_MESSAGE_TYPES
} from "./Challenge.js";
import assert from "assert";
import PlebbitCore from "./PlebbitCore.js";
import Plebbit from "./Plebbit.js";

import knex from 'knex';
import DbHandler from "./DbHandler.js";
import {createCaptcha} from "captcha-canvas/js-script/extra.js";
import {SORTED_COMMENTS_TYPES, SortHandler} from "./SortHandler.js";
import Vote from "./Vote.js";
import Post from "./Post.js";


class Subplebbit extends PlebbitCore {
    constructor(props, ipfsClient = null) {
        super(props, ipfsClient);
        this.#initSubplebbit(props);
        this.challengeToSolution = {}; // Map challenge ID to its solution
        this.provideCaptchaCallback = null;
        this.validateCaptchaAnswerCallback = null;
        this.event = new EventEmitter();
    }

    #initSubplebbit(newProps) {
        const oldProps = this.#toJSONInternal();
        const mergedProps = {...oldProps, ...newProps};
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsIpnsNames = mergedProps["moderatorsIpnsNames"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this._dbConfig = mergedProps["database"];
        this.preloadedPosts = mergedProps["preloadedPosts"] || [];
        this.sortedPosts = mergedProps["sortedPosts"] || {};
        this.sortedPostsCids = mergedProps["sortedPostsCids"] || {};
        this.setIpnsKey(mergedProps["subplebbitAddress"], mergedProps["ipnsKeyName"]);
        this.plebbit = new Plebbit(newProps, this.ipfsClient);
        this.sortHandler = new SortHandler(this);
        this.challengeTypes = mergedProps["challengeTypes"] || null;
        this.metricsCid = mergedProps["metricsCid"];
    }

    async #initDb() {
        const ipfsKeys = (await this.ipfsClient.key.list()).map(key => key["id"]);
        const ranByOwner = ipfsKeys.includes(this.subplebbitAddress);
        // Default settings for subplebbit owner node
        if (ranByOwner && !this._dbConfig)
            this._dbConfig = {
                client: 'better-sqlite3', // or 'better-sqlite3'
                connection: {
                    filename: `.databases/${this.title}.sqlite`
                },
                useNullAsDefault: true
            }

        if (!this._dbConfig)
            return;
        this.dbHandler = new DbHandler(knex(this._dbConfig), this);
        await this.dbHandler.createTablesIfNeeded();
    }

    setIpnsKey(newIpnsName, newIpnsKeyName) {
        this.pubsubTopic = this.subplebbitAddress = newIpnsName;
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

    async publishAsNewSubplebbit() {
        // TODO Add a check for key existence
        return new Promise((resolve, reject) => {
            this.ipfsClient.key.gen(this.title).then(ipnsKey => {
                // TODO add to db
                this.update({
                    "subplebbitAddress": ipnsKey["id"],
                    "ipnsKeyName": ipnsKey["name"]
                }).then(resolve).catch(reject)
            }).catch(reject);
        });
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
            "moderatorsIpnsNames": this.moderatorsIpnsNames,
            "latestPostCid": this.latestPostCid,
            "preloadedPosts": this.preloadedPosts,
            "pubsubTopic": this.pubsubTopic,
            "subplebbitAddress": this.subplebbitAddress,
            "sortedPosts": this.sortedPosts,
            "sortedPostsCids": this.sortedPostsCids,
            "challengeTypes": this.challengeTypes,
            "metricsCid": this.metricsCid
        };
    }

    async update(newSubplebbitOptions) {
        this.#initSubplebbit(newSubplebbitOptions);
        const subplebbitWithNewContent = JSON.stringify(this);
        return new Promise((resolve, reject) => {
            this.ipfsClient.add(subplebbitWithNewContent).then(file => {
                this.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "5h", // TODO decide on optimal time later
                    "key": this.ipnsKeyName
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
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
            this.metricsCid = (await this.ipfsClient.add(JSON.stringify(metrics))).path;
    }

    async #updateSubplebbitPosts(post) {
        await this.#updateMetricsCid();
        const newSubplebbitOptions = {
            ...(await this.#getSortedPostsObject()),
            "metricsCid": this.metricsCid,
            "preloadedPosts": [post, ...this.preloadedPosts],
            "latestPostCid": post.postCid,
        }
        await this.update(newSubplebbitOptions);
        this.event.emit("post", post);
    }

    async #updatePostComments(comment) {
        // TODO Check if comment is already added
        const [sortedComments, sortedCommentsCids] = await this.sortHandler.calculateSortedComments(comment.postCid);

        const newCommentIpns = {
            ...(comment.parent.commentIpns.toJSON()),
            "sortedComments": {[SORTED_COMMENTS_TYPES.HOT]: sortedComments[SORTED_COMMENTS_TYPES.HOT]},
            "sortedCommentsCids": sortedCommentsCids,
            "latestCommentCid": comment.commentCid,
            "preloadedComments": [comment, ...(comment.parent.commentIpns.preloadedComments)],
        };
        await comment.parent.updateCommentIpns(newCommentIpns)
        this.event.emit("comment", comment);
    }

    async #publishPubsubMsg(publication, challengeRequestId) {
        const postOrCommentOrVote = publication.hasOwnProperty("title") ? new Post(publication, this) :
            publication.hasOwnProperty("vote") ? new Vote(publication, this)
                : new Comment(publication, this);

        const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote instanceof Comment ? postOrCommentOrVote.toJSONSkeleton() : postOrCommentOrVote));

        const ipnsKeys = (await this.ipfsClient.key.list()).map(key => key["name"]);

        if (ipnsKeys.includes(ipnsKeyName))
            return {"reason": `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`};

        if (postOrCommentOrVote instanceof Comment) // Only Post and Comment
            postOrCommentOrVote.setCommentIpnsKey(await this.ipfsClient.key.gen(ipnsKeyName));

        if (postOrCommentOrVote.getType() === "post") {
            postOrCommentOrVote.setPreviousCommentCid(this.latestPostCid);
            await postOrCommentOrVote.updateCommentIpns(new CommentIPNS({}));
        } else if (postOrCommentOrVote.getType() === "comment") {
            // Comment
            const parent = await postOrCommentOrVote.fetchParent();
            const parentIpns = await parent.fetchCommentIpns();
            postOrCommentOrVote.setPreviousCommentCid(parentIpns.latestCommentCid);
            await postOrCommentOrVote.updateCommentIpns(new CommentIPNS({}));
        }

        if (postOrCommentOrVote.getType() === "vote") {
            const lastVote = await this.dbHandler.getLastVoteOfAuthor(postOrCommentOrVote.commentCid, postOrCommentOrVote.author.address);
            const voteComment = await this.plebbit.getPostOrComment(postOrCommentOrVote.commentCid);
            const commentIpns = await voteComment.fetchCommentIpns();
            let newUpvoteCount = -1, newDownvoteCount = -1;
            if (lastVote) {
                // User has voted before and is trying to change his vote

                if (postOrCommentOrVote.vote === 0) {
                    newUpvoteCount = commentIpns.upvoteCount + (lastVote.vote === 1 ? -1 : 0);
                    newDownvoteCount = commentIpns.downvoteCount + (lastVote.vote === -1 ? -1 : 0);
                } else {
                    if (lastVote.vote === 1 && postOrCommentOrVote.vote === -1) {
                        newUpvoteCount = commentIpns.upvoteCount - 1;
                        newDownvoteCount = commentIpns.downvoteCount + 1;
                    } else if (lastVote.vote === -1 && postOrCommentOrVote.vote === 1) {
                        newUpvoteCount = commentIpns.upvoteCount + 1;
                        newDownvoteCount = commentIpns.downvoteCount - 1;
                    } else
                        return {"reason": "User duplicated his vote"};
                }
            } else {
                // New vote
                newUpvoteCount = postOrCommentOrVote.vote === 1 ? commentIpns.upvoteCount + 1 : commentIpns.upvoteCount;
                newDownvoteCount = postOrCommentOrVote.vote === -1 ? commentIpns.downvoteCount + 1 : commentIpns.downvoteCount;
            }
            assert(newDownvoteCount >= 0 && newDownvoteCount >= 0, "New upvote and downvote need to be proper numbers");
            await this.dbHandler.upsertVote(postOrCommentOrVote, challengeRequestId);

            if (voteComment.getType() === "post")
                await this.update(await this.#getSortedPostsObject());
            else if (voteComment.getType() === "comment") {
                const [sortedComments, sortedCommentsCids] = await this.sortHandler.calculateSortedComments(voteComment.commentCid);
                await voteComment.updateCommentIpns(new CommentIPNS({
                    ...commentIpns.toJSON(),
                    "sortedComments": {[SORTED_COMMENTS_TYPES.HOT]: sortedComments[SORTED_COMMENTS_TYPES.HOT]},
                    "sortedCommentsCids": sortedCommentsCids,
                    "upvoteCount": newUpvoteCount,
                    "downvoteCount": newDownvoteCount
                }));

            }

        } else {
            // Comment and Post need to add file to ipfs
            const file = await this.ipfsClient.add(JSON.stringify(postOrCommentOrVote));
            if (postOrCommentOrVote.getType() === "post") {
                postOrCommentOrVote.setPostCid(file.path);
                postOrCommentOrVote.setCommentCid(file.path);
                await this.dbHandler.insertComment(postOrCommentOrVote, challengeRequestId);
                await this.#updateSubplebbitPosts(postOrCommentOrVote);
            } else {
                // Comment
                postOrCommentOrVote.setCommentCid(file.path);
                await this.dbHandler.insertComment(postOrCommentOrVote, challengeRequestId);
                await this.#updatePostComments(postOrCommentOrVote);
            }
        }
        return {"publication": postOrCommentOrVote};
    }

    async #publishPostAfterPassingChallenge(msgParsed) {
        delete this.challengeToSolution[msgParsed.challengeRequestId];
        return await this.#publishPubsubMsg(msgParsed.publication, msgParsed.challengeRequestId);
    }

    async #processCaptchaPubsub(pubsubMsg) {

        const validateCaptchaAnswer = async (pubsubMsg) => {
            const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
            if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER) {

                const [challengePassed, challengeErrors] = await this.validateCaptchaAnswerCallback(msgParsed);
                if (challengePassed) {
                    await this.dbHandler.upsertChallenge(new ChallengeAnswerMessage(msgParsed)); //TODO implement later

                    const publishedPublication = await this.#publishPostAfterPassingChallenge({"publication": await this.dbHandler.queryPublicationWithChallengeRequestId(msgParsed.challengeRequestId), ...msgParsed}); // could contain "publication" or "reason"

                    const challengeVerification = new ChallengeVerificationMessage({
                        "challengeRequestId": msgParsed.challengeRequestId,
                        "challengeAnswerId": msgParsed.challengeAnswerId,
                        "challengePassed": challengePassed,
                        "challengeErrors": challengeErrors,
                        ...publishedPublication
                    });

                    await this.dbHandler.upsertChallenge(challengeVerification);
                    await this.ipfsClient.pubsub.publish(challengeVerification.challengeAnswerId, uint8ArrayFromString(JSON.stringify(challengeVerification)));
                } else {
                    const challengeVerification = new ChallengeVerificationMessage({
                        "challengeRequestId": msgParsed.challengeRequestId,
                        "challengeAnswerId": msgParsed.challengeAnswerId,
                        "challengePassed": challengePassed,
                        "challengeErrors": challengeErrors,
                    });
                    await this.dbHandler.upsertChallenge(challengeVerification); //TODO implement later

                    await this.ipfsClient.pubsub.publish(challengeVerification.challengeAnswerId, uint8ArrayFromString(JSON.stringify(challengeVerification)));
                }
            }
        }
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));

        if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST) {
            const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(msgParsed);
            if (!providedChallenges) {
                // Subplebbit owner has chosen to skip challenging this user or post
                await this.dbHandler.upsertChallenge(new ChallengeRequestMessage(msgParsed)); //TODO implement later

                const publishedPublication = await this.#publishPostAfterPassingChallenge({"publication": msgParsed.publication, ...msgParsed}); // could contain "publication" or "reason"
                const challengeVerification = new ChallengeVerificationMessage({
                    "reason": reasonForSkippingCaptcha,
                    "challengePassed": Boolean(publishedPublication.publication), // If no publication, this will be false
                    "challengeAnswerId": msgParsed.challengeAnswerId,
                    "challengeErrors": null,
                    "challengeRequestId": msgParsed.challengeRequestId,
                    ...publishedPublication
                });
                await this.dbHandler.upsertChallenge(challengeVerification); //TODO implement later
                await this.ipfsClient.pubsub.publish(challengeVerification.challengeRequestId, uint8ArrayFromString(JSON.stringify(challengeVerification)));

            } else {
                const challengeMessage = new ChallengeMessage({
                    "challengeRequestId": msgParsed.challengeRequestId,
                    "challenges": providedChallenges
                });
                await this.dbHandler.upsertChallenge(challengeMessage); //TODO implement later

                await this.ipfsClient.pubsub.publish(challengeMessage.challengeRequestId, uint8ArrayFromString(JSON.stringify(challengeMessage)));
                await this.ipfsClient.pubsub.subscribe(challengeMessage.challengeRequestId, validateCaptchaAnswer);
            }
        }
    }

    async #defaultProvideCaptcha(challengeWithMsg) {

        // Return question, type
        // Expected return is:
        // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
        return new Promise(async (resolve, reject) => {
            const {image, text} = createCaptcha(300, 100);
            this.challengeToSolution[challengeWithMsg.challenge.requestId] = text;
            image.then(imageBuffer => resolve([imageBuffer, CHALLENGE_TYPES.image, null])).catch(reject);
        });

    }

    async #defaultValidateCaptcha(challengeWithMsg) {
        return new Promise(async (resolve, reject) => {
            const actualSolution = this.challengeToSolution[challengeWithMsg.challenge.requestId];
            const answerIsCorrect = challengeWithMsg.challenge.answer === actualSolution;
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
        const subscribedTopics = (await this.ipfsClient.pubsub.ls());
        if (!subscribedTopics.includes(this.pubsubTopic))
            await this.ipfsClient.pubsub.subscribe(this.pubsubTopic, this.#processCaptchaPubsub.bind(this));
    }

    async stopPublishing() {
        await this.ipfsClient.pubsub.unsubscribe(this.pubsubTopic);
        this.event.removeAllListeners();
    }

    async destroy() {
        // For development purposes ONLY
        // Call this only if you know what you're doing
        // rm ipns and ipfs
        await this.stopPublishing();
        const ipfsPath = (await last(this.ipfsClient.name.resolve(this.subplebbitAddress)));
        await this.ipfsClient.pin.rm(ipfsPath);
        await this.ipfsClient.key.rm(this.ipnsKeyName);
    }

}

export default Subplebbit;