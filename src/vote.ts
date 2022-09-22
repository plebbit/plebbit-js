import Publication from "./publication";
import assert from "assert";
import { PublicationTypeName, VoteForDbType, VoteType } from "./types";
import { Plebbit } from "./plebbit";

class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;

    constructor(props: VoteType, plebbit: Plebbit) {
        super(props, plebbit);
        this.commentCid = props.commentCid;
        this.vote = props.vote; // Either 1, 0, -1 (upvote, cancel vote, downvote)
    }

    toJSON(): VoteType {
        return {
            ...super.toJSON(),
            commentCid: this.commentCid,
            vote: this.vote
        };
    }

    getType(): PublicationTypeName {
        return "vote";
    }

    toJSONForDb(challengeRequestId: string): VoteForDbType {
        return {
            ...this.toJSON(),
            author: JSON.stringify(this.author),
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId,
            signature: JSON.stringify(this.signature)
        };
    }

    async publish(userOptions): Promise<void> {
        assert([-1, 0, 1].includes(this.vote) && this.commentCid, "Need vote and commentCid to be defined to publish Vote");
        return super.publish(userOptions);
    }
}

export default Vote;
