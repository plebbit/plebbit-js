import Publication from "./publication";
import assert from "assert";
import { PublicationTypeName, VoteType } from "./types";

class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;

    constructor(props: VoteType, subplebbit: any) {
        super(props, subplebbit);
        this.commentCid = props["commentCid"];
        this.vote = props["vote"]; // Either 1, 0, -1 (upvote, cancel vote, downvote)
    }

    toJSON(): VoteType {
        return {
            ...super.toJSON(),
            author: this.author,
            timestamp: this.timestamp,
            signature: this.signature,
            commentCid: this.commentCid,
            vote: this.vote
        };
    }

    getType(): PublicationTypeName {
        return "vote";
    }

    toJSONForDb(challengeRequestId: string) {
        const json = this.toJSON();
        // @ts-ignore
        json["author"] = JSON.stringify(this.author);
        json["authorAddress"] = this?.author?.address;
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
