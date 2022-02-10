import Author from "./Author.js";
import Publication from "./Publication.js";

class Vote extends Publication {
    constructor(props, subplebbit) {
        super(subplebbit);
        // Publication
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"];
        this.signature = props["signature"];

        this.commentCid = props["commentCid"];
        this.vote = props["vote"]; // Either 1, 0, -1 (upvote, cancel vote, downvote)
    }

    toJSON() {
        return {
            "author": this.author,
            "timestamp": this.timestamp,
            "signature": this.signature,
            "commentCid": this.commentCid,
            "vote": this.vote
        }
    }
}

export default Vote;