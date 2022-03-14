import Author from "./Author.js";
import Publication from "./Publication.js";
import {timestamp} from "./Util.js";

class Vote extends Publication {
    constructor(props, subplebbit) {
        super(props, subplebbit);
        // Publication
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"] || timestamp();
        this.signature = props["signature"];

        this.commentCid = props["commentCid"];
        this.vote = JSON.parse(props["vote"]); // Either 1, 0, -1 (upvote, cancel vote, downvote)
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
        json["vote"] = String(json["vote"]);
        return json;
    }
}

export default Vote;