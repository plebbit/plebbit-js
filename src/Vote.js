import Author from "./Author.js";
import Publication from "./Publication.js";
import {parseJsonIfString, timestamp} from "./Util.js";

class Vote extends Publication {
    constructor(props, subplebbit) {
        super(props, subplebbit);
        // Publication
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"];
        this.signature = parseJsonIfString(props["signature"]);

        this.commentCid = props["commentCid"];
        this.vote = props["vote"]; // Either 1, 0, -1 (upvote, cancel vote, downvote)
    }

    toJSON() {
        return {
            ...(super.toJSON()),
            "author": this.author,
            "timestamp": this.timestamp,
            "signature": this.signature,
            "commentCid": this.commentCid,
            "vote": this.vote
        }
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