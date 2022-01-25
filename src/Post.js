import Author from "./Author.js";

class Post {

    constructor(props, plebbit, subplebbit) {
        this.author = new Author(props["author"]);
        this.title = props["title"];
        this.content = props["content"];
        this.timestamp = props["timestamp"];
        this.previousPostCid = props["previousPostCid"];
        this.commentsIpnsName = props["commentsIpnsName"];
        this.nestedCommentsHelper = props["nestedCommentsHelper"];
        this.cid = props["cid"];
        this.plebbit = plebbit;
        this.subplebbit = subplebbit;
    }
}

export default Post;