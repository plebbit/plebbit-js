import Post from "./Post.js";
import Comment, {CommentIPNS} from "./Comment.js";
import last from "it-last";
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import EventEmitter from "events";
import {sha256} from "js-sha256";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'

import {Challenge, challengeStages} from "./Challenge.js";

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

    publishAsNewSubplebbit() {
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
        const postOrComment = msgParsed["title"] ? new Post(msgParsed, this.plebbit, this) : new Comment(msgParsed, this.plebbit, this);

        postOrComment.setCommentIpnsKey(await this.plebbit.ipfsClient.key.gen(sha256(JSON.stringify(postOrComment)).slice(0, 20)));

        if (postOrComment.getType() === "post")
            postOrComment.setPreviousCommentCid(this.latestPostCid);
        else {
            // Comment
            const parent = await postOrComment.fetchParent();
            const parentIpns = await parent.fetchCommentIpns();
            postOrComment.setPreviousCommentCid(parentIpns.latestCommentCid);
        }
        await postOrComment.updateCommentIpns(new CommentIPNS({}));


        const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrComment));
        if (postOrComment.getType() === "post") {
            postOrComment.setPostCid(file["cid"]);
            await this.#updateSubplebbitPosts(postOrComment);
        } else {
            // Comment
            postOrComment.setCommentCid(file["cid"]);
            await this.#updatePostComments(postOrComment);
        }
    }

    async #processCaptchaPubsub(pubsubMsg) {

        const validateCaptchaAnswer = async (pubsubMsg) => {
            const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
            const challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
            if (challenge.stage === challengeStages.CHALLENGEANSWER) {
                const [challengeAnswerIsVerified, failedVerificationReason] = this.validateCaptchaAnswerCallback(msgParsed);
                challenge.setStage(challengeStages.CHALLENGEVERIFICATION);
                challenge.setAnswerIsVerified(challengeAnswerIsVerified);
                challenge.setFailedVerificationReason(failedVerificationReason);
                msgParsed["challenge"] = challenge;
                this.ongoingChallenges[challenge.requestId] = challenge;
                if (challengeAnswerIsVerified) {
                    delete this.ongoingChallenges[challenge.requestId];
                    await this.plebbit.ipfsClient.pubsub.unsubscribe(challenge.requestId); // This line might cause problems cause we're within the subscription method
                    await this.#publishPubsubMsg({"data": uint8ArrayFromString(JSON.stringify(msgParsed["msg"]))});
                }
                await this.plebbit.ipfsClient.pubsub.publish(challenge.answerId, uint8ArrayFromString(JSON.stringify(msgParsed)));

            }
        }
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
        const challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);

        if (challenge.stage === challengeStages.CHALLENGEREQUEST) {
            const [providedChallenge, challengeType] = this.provideCaptchaCallback(msgParsed);
            challenge.setChallenge(providedChallenge);
            challenge.setType(challengeType);
            challenge.setStage(challengeStages.CHALLENGE);
            this.ongoingChallenges[challenge.requestId] = challenge;
            msgParsed["challenge"] = challenge;
            await this.plebbit.ipfsClient.pubsub.publish(challenge.requestId, uint8ArrayFromString(JSON.stringify(msgParsed)));
            await this.plebbit.ipfsClient.pubsub.subscribe(challenge.requestId, validateCaptchaAnswer);
        }
    }


    async startPublishing() {
        const processPubsub = async (pubsubMsg) => {
            const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
            if (!this.provideCaptchaCallback && !this.validateCaptchaAnswerCallback)
                await this.#publishPubsubMsg(msgParsed); // If no captcha is specified then publish post/comment immediately
            else if (msgParsed["challenge"])
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