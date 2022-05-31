import Author from "./author";
import Publication from "./publication";
import { parseJsonIfString, timestamp } from "./util";
import { Signature } from "./signer";

class Vote extends Publication {
    commentCid: string;
    vote: number;

    constructor(props, subplebbit) {
        super(props, subplebbit);
        this.commentCid = props["commentCid"];
        this.vote = props["vote"]; // Either 1, 0, -1 (upvote, cancel vote, downvote)
    }

    toJSON() {
        return {
            ...super.toJSON(),
            author: this.author,
            timestamp: this.timestamp,
            signature: this.signature,
            commentCid: this.commentCid,
            vote: this.vote
        };
    }

    toJSONForDb(challengeRequestId) {
        const json = this.toJSON();
        delete json["author"];
        json["authorAddress"] = this.author.address;
        json["challengeRequestId"] = challengeRequestId;
        json["signature"] = JSON.stringify(this.signature);
        return json;
    }
}

export default Vote;
