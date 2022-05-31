import Publication from "./publication";
import assert from "assert";

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
        // @ts-ignore
        json["author"] = JSON.stringify(this.author);
        json["authorAddress"] = this.author.address;
        json["challengeRequestId"] = challengeRequestId;
        // @ts-ignore
        json["signature"] = JSON.stringify(this.signature);
        return json;
    }

    async publish(userOptions): Promise<void> {
        assert([-1, 0, 1].includes(this.vote) && this.commentCid, "Need vote and commentCid to be defined to publish Vote");
        assert(this.timestamp, "Need timestamp field to publish comment");
        assert(this.author, "Need author to publish comment");
        return super.publish(userOptions);
    }
}

export default Vote;
