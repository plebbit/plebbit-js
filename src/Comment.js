import Author from "./Author.js";
import assert from "assert";
import {loadIpnsAsJson} from "./Util.js";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import {v4 as uuidv4} from 'uuid';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import {Challenge, challengeStages} from "./Challenge.js";


class CommentIPNS {
    constructor(props) {
        this.latestCommentCid = props["latestCommentCid"]; // the most recent comment in the linked list of posts
        this.preloadedComments = props["preloadedComments"] || [];
        this.upvoteCount = props["upvoteCount"] || 0;
        this.downvoteCount = props["downvoteCount"] || 0;
    }

    toJSON() {
        return {
            "latestCommentCid": this.latestCommentCid?.toString(), "preloadedComments": this.preloadedComments,
            "upvoteCount": this.upvoteCount, "downvoteCount": this.downvoteCount
        };
    }
}

class Comment {
    constructor(props, plebbit, subplebbit) {
        // Publication
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"];
        this.signature = props["signature"];

        this.subplebbitIpnsKeyId = props["subplebbitIpnsKeyId"] || subplebbit?.ipnsKeyId;
        this.subplebbit = subplebbit;


        this.postCid = props["postCid"];
        this.commentCid = props["commentCid"];
        this.parentCommentCid = props["parentCommentCid"];
        this.content = props["content"];
        this.previousCommentCid = props["previousCommentCid"];

        this.parent = null;

        this.commentIpnsKeyId = props["commentIpnsKeyId"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.commentIpnsKeyName = props["commentIpnsKeyName"];
        this.commentIpns = props["commentIpns"];
        this.plebbit = plebbit;
        this.challenge = null;
    }

    toJSON() {
        return {
            "author": this.author,
            "content": this.content,
            "timestamp": this.timestamp,
            "signature": this.signature,
            "previousCommentCid": this.previousCommentCid?.toString(),
            "commentIpnsKeyId": this.commentIpnsKeyId,
            "commentIpnsKeyName": this.commentIpnsKeyName,
            "postCid": this.postCid?.toString(),
            "commentCid": this.commentCid?.toString(),
            "subplebbitIpnsKeyId": this.subplebbitIpnsKeyId || this.subplebbit?.ipnsKeyId,
            "parentCommentCid": this.parentCommentCid?.toString(),
        };
    }

    setSubplebbit(newSubplebbit) {
        this.subplebbit = newSubplebbit;
    }

    setCommentIpnsKey(ipnsKey) {
        // Contains name and id
        this.commentIpnsKeyId = ipnsKey["id"];
        this.commentIpnsKeyName = ipnsKey["name"];
    }

    setPostCid(newPostCid) {
        this.postCid = newPostCid;
    }

    setCommentCid(newCommentCid) {
        this.commentCid = newCommentCid;
    }

    setPreviousCommentCid(newPreviousCommentCid) {
        this.previousCommentCid = newPreviousCommentCid;
    }

    getType() {
        if (this.hasOwnProperty("title"))
            return "post";
        else
            return "comment";
    }


    async publish(userOptions, solveChallengeCallback) {
        return new Promise(async (resolve, reject) => {

            const options = {"acceptedChallengeTypes": [], ...userOptions};
            if (!this.challenge || this.challenge?.answerIsVerified)
                this.challenge = new Challenge({
                    "requestId": uuidv4(),
                    "acceptedChallengeTypes": options["acceptedChallengeTypes"],
                    "stage": challengeStages["CHALLENGEREQUEST"]
                });
            // TODO check whether post has been added before
            const challengeRequest = {
                "msg": this.toJSON(),
                "challenge": this.challenge
            };

            const handleCaptchaVerification = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                msgParsed["challenge"] = this.challenge = new Challenge(msgParsed["challenge"]);
                if (this.challenge.stage === challengeStages.CHALLENGEVERIFICATION) {
                    await this.plebbit.ipfsClient.pubsub.unsubscribe(this.challenge.requestId);
                    await this.plebbit.ipfsClient.pubsub.unsubscribe(this.challenge.answerId);
                    if (!this.challenge.answerIsVerified) {
                        console.error(`Failed to solve captcha, reason is: ${this.challenge.answerVerificationReason}`);
                        this.challenge = null;
                        reject(msgParsed);
                    } else
                        resolve(msgParsed);
                }
            };

            const processChallenge = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                // Subplebbit owner node will either answer with CHALLENGE OR CHALLENGE VERIFICATION
                this.challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
                if (this.challenge.stage === challengeStages.CHALLENGE) {
                    // Process CHALLENGE and reply with ChallengeAnswer
                    const challengeAnswer = solveChallengeCallback(this.challenge);
                    this.challenge.setAnswer(challengeAnswer);
                    this.challenge.setStage(challengeStages.CHALLENGEANSWER);
                    this.challenge.setAnswerId(uuidv4());
                    msgParsed["challenge"] = this.challenge;
                    await this.plebbit.ipfsClient.pubsub.subscribe(this.challenge.answerId, handleCaptchaVerification);
                    await this.plebbit.ipfsClient.pubsub.publish(this.challenge.requestId, uint8ArrayFromString(JSON.stringify(msgParsed)));
                }
            };

            await this.plebbit.ipfsClient.pubsub.subscribe(this.challenge.requestId, processChallenge);
            const postEncoded = uint8ArrayFromString(JSON.stringify(challengeRequest));

            await this.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, postEncoded);
        });


    }

    async fetchParent() {
        return new Promise(async (resolve, reject) => {
            this.plebbit.getPostOrComment(this.parentCommentCid || this.postCid).then(res => {
                this.parent = res;
                resolve(this.parent);
            }).catch(reject);
        });
    }

    async fetchCommentIpns() {
        return new Promise(async (resolve, reject) => {
            loadIpnsAsJson(this.commentIpnsKeyId, this.plebbit.ipfsClient).then(res => {
                    this.commentIpns = new CommentIPNS(res);
                    resolve(this.commentIpns);
                }
            ).catch(reject)
        });
    }

    async updateCommentIpns(newCommentIpns) {
        assert(this.commentIpnsKeyName && this.commentIpnsKeyId, "You need to have post ipns");
        this.commentIpns = newCommentIpns;
        return new Promise(async (resolve, reject) => {
            this.plebbit.ipfsClient.add(JSON.stringify(this.commentIpns)).then(file => {
                this.plebbit.ipfsClient.name.publish(file["cid"], {
                    "lifetime": "5h",
                    "key": this.commentIpnsKeyName
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}

export {CommentIPNS};
export default Comment;