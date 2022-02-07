import Post from "./Post.js";
import Comment, {CommentIPNS} from "./Comment.js";
import last from "it-last";
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import EventEmitter from "events";
import {sha256} from "js-sha256";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'

import {Challenge, challengeStages} from "./Challenge.js";
import Vote from "./Vote.js";
import assert from "assert";

class Subplebbit extends EventEmitter {
    constructor(props, plebbit, provideCaptchaCallback, validateCaptchaAnswerCallback) {
        super();
        this.#initSubplebbit(props);
        this.plebbit = plebbit;
        this.ongoingChallenges = {}; // Map challenge ID to actual challenge
        this.provideCaptchaCallback = provideCaptchaCallback;
        this.validateCaptchaAnswerCallback = validateCaptchaAnswerCallback;
    }

    #initSubplebbit(newProps) {
        const oldProps = this.#toJSONInternal();
        const mergedProps = {...oldProps, ...newProps};
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsIpnsNames = mergedProps["moderatorsIpnsNames"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this.preloadedPosts = mergedProps["preloadedPosts"] || [];
        this.setIpnsKey(mergedProps["ipnsKeyId"], mergedProps["ipnsKeyName"]);
    }

    setIpnsKey(newIpnsKeyId, newIpnsKeyName) {
        this.pubsubTopic = this.ipnsKeyId = newIpnsKeyId;
        this.ipnsKeyName = newIpnsKeyName;
    }

    setPlebbit(newPlebbit) {
        this.plebbit = newPlebbit;
    }

    setProvideCaptchaCallback(newCallback) {
        this.provideCaptchaCallback = newCallback;
    }

    setValidateCaptchaAnswerCallback(newCallback) {
        this.validateCaptchaAnswerCallback = newCallback;
    }

    async publishAsNewSubplebbit() {
        // TODO Add a check for key existence
        return new Promise((resolve, reject) => {
            this.plebbit.ipfsClient.key.gen(this.title).then(ipnsKey => {
                // TODO add to db
                this.update({"ipnsKeyId": ipnsKey["id"], "ipnsKeyName": ipnsKey["name"]}).then(resolve).catch(reject)
            }).catch(reject);
        });
    }

    #toJSONInternal() {
        return {
            ...this.toJSON(),
            "ipnsKeyName": this.ipnsKeyName,
        };
    }

    toJSON() {
        return {
            "title": this.title, "description": this.description,
            "moderatorsIpnsNames": this.moderatorsIpnsNames, "latestPostCid": this.latestPostCid?.toString(),
            "preloadedPosts": this.preloadedPosts, "pubsubTopic": this.pubsubTopic, "ipnsKeyId": this.ipnsKeyId
        };
    }

    async update(newSubplebbitOptions) {
        this.#initSubplebbit(newSubplebbitOptions);
        const subplebbitWithNewContent = JSON.stringify(this);
        return new Promise((resolve, reject) => {
            this.plebbit.ipfsClient.add(subplebbitWithNewContent).then(file => {
                this.plebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "5h", // TODO decide on optimal time later
                    "key": this.ipnsKeyName
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    async destroy() {
        // For development purposes ONLY
        // Call this only if you know what you're doing
        // rm ipns and ipfs
        const ipfsPath = (await last(this.plebbit.ipfsClient.name.resolve(this.ipnsKeyId)));
        await this.plebbit.ipfsClient.pin.rm(ipfsPath);
        await this.plebbit.ipfsClient.key.rm(this.ipnsKeyName);
    }

    async #updateSubplebbitPosts(post) {
        const newSubplebbitOptions = {
            "preloadedPosts": [post, ...this.preloadedPosts],
            "latestPostCid": post.postCid
        }
        await this.update(newSubplebbitOptions);
        this.emit("post", post);
    }

    async #updatePostComments(comment) {
        // TODO Check if comment is already added
        const newCommentIpns = new CommentIPNS({
            ...(comment.parent.commentIpns.toJSON()),
            "latestCommentCid": comment.commentCid,
            "preloadedComments": [comment, ...(comment.parent.commentIpns.preloadedComments)],
        });
        await comment.parent.updateCommentIpns(newCommentIpns)
        this.emit("comment", comment);
    }

    async #publishPubsubMsg(pubsubMsg) {
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));

        //TODO check if post or comment has been posted before
        const postOrCommentOrVote = msgParsed.title ? new Post(msgParsed, this.plebbit, this) :
            msgParsed.vote ? new Vote(msgParsed, this.plebbit, this)
                : new Comment(msgParsed, this.plebbit, this);

        const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote instanceof Comment ? postOrCommentOrVote.toJSONSkeleton() : postOrCommentOrVote));

        const ipnsKeys = (await this.plebbit.ipfsClient.key.list()).map(key => key["name"]);

        if (ipnsKeys.includes(ipnsKeyName)) {
            const msg = `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`;
            return {"error": msg};
        }

        if (postOrCommentOrVote instanceof Comment) // Only Post and Comment
            postOrCommentOrVote.setCommentIpnsKey(await this.plebbit.ipfsClient.key.gen(ipnsKeyName));

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
            // TODO handle vote === 0, which cancels previous votes
            const voteComment = await this.plebbit.getPostOrComment(postOrCommentOrVote.commentCid);
            const commentIpns = await voteComment.fetchCommentIpns();
            const newUpvoteCount = postOrCommentOrVote.vote === 1 ? commentIpns.upvoteCount + 1 : commentIpns.upvoteCount;
            const newDownvoteCount = postOrCommentOrVote.vote === -1 ? commentIpns.downvoteCount + 1 : commentIpns.downvoteCount;

            await voteComment.updateCommentIpns(new CommentIPNS({
                ...commentIpns.toJSON(),
                "upvoteCount": newUpvoteCount,
                "downvoteCount": newDownvoteCount
            }));
        } else {
            // Comment and Post need to add file to ipfs
            const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote));
            if (postOrCommentOrVote.getType() === "post") {
                postOrCommentOrVote.setPostCid(file["cid"]);
                await this.#updateSubplebbitPosts(postOrCommentOrVote);
            } else {
                // Comment
                postOrCommentOrVote.setCommentCid(file["cid"]);
                await this.#updatePostComments(postOrCommentOrVote);
            }
        }
        return postOrCommentOrVote;
    }

    async #publishPostAfterPassingChallenge(msgParsed) {
        delete this.ongoingChallenges[msgParsed["challenge"].requestId];
        return await this.#publishPubsubMsg({"data": uint8ArrayFromString(JSON.stringify(msgParsed["msg"]))});
    }

    async #processCaptchaPubsub(pubsubMsg) {

        const validateCaptchaAnswer = async (pubsubMsg) => {
            const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
            const challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
            if (challenge.stage === challengeStages.CHALLENGEANSWER) {
                const [challengeAnswerIsVerified, answerVerificationReason] = this.validateCaptchaAnswerCallback(msgParsed);
                challenge.setStage(challengeStages.CHALLENGEVERIFICATION);
                challenge.setAnswerIsVerified(challengeAnswerIsVerified);
                challenge.setAnswerVerificationReason(answerVerificationReason);
                msgParsed["challenge"] = challenge;
                this.ongoingChallenges[challenge.requestId] = challenge;
                if (challengeAnswerIsVerified)
                    msgParsed["msg"] = await this.#publishPostAfterPassingChallenge(msgParsed);
                if (challenge.answerId)
                    await this.plebbit.ipfsClient.pubsub.publish(challenge.answerId, uint8ArrayFromString(JSON.stringify(msgParsed)));

            }
        }
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
        const challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);

        if (challenge.stage === challengeStages.CHALLENGEREQUEST) {
            const [providedChallenge, challengeType, reasonForSkippingCaptcha] = this.provideCaptchaCallback(msgParsed);
            challenge.setChallenge(providedChallenge);
            challenge.setType(challengeType);
            challenge.setStage(challengeStages.CHALLENGE); // If provided challenge is null then we skip challenge stages to verification
            if (!providedChallenge) {
                // Subplebbit owner has chosen to skip challenging this user or post
                challenge.setStage(challengeStages.CHALLENGEVERIFICATION);
                challenge.setAnswerIsVerified(true);
                challenge.setAnswerVerificationReason(reasonForSkippingCaptcha);
            }
            this.ongoingChallenges[challenge.requestId] = challenge;
            msgParsed["challenge"] = challenge;
            if (challenge.stage === challengeStages.CHALLENGEVERIFICATION)
                msgParsed["msg"] = await this.#publishPostAfterPassingChallenge(msgParsed);
            if (challenge.stage === challengeStages.CHALLENGE)
                await this.plebbit.ipfsClient.pubsub.subscribe(challenge.requestId, validateCaptchaAnswer);
        }
        await this.plebbit.ipfsClient.pubsub.publish(challenge.requestId, uint8ArrayFromString(JSON.stringify(msgParsed)));
    }


    async startPublishing() {
        assert(this.provideCaptchaCallback, "You need to set provideCaptchaCallback. If you don't need captcha, you can return null");
        const processPubsub = async (pubsubMsg) => {
            await this.#processCaptchaPubsub(pubsubMsg);
        }

        await this.plebbit.ipfsClient.pubsub.subscribe(this.pubsubTopic, processPubsub);
    }

    async stopPublishing() {
        await this.plebbit.ipfsClient.pubsub.unsubscribe(this.pubsubTopic);
        this.removeAllListeners();
    }

}

export default Subplebbit;