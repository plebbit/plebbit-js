import Author from "./Author.js";

class Post {

    constructor(props) {
        this.subplebbitIpnsName = props["subplebbitIpnsName"];
        this.author = new Author(props["author"]);
        this.title = props["title"];
        this.content = props["content"];
        this.timestamp = props["timestamp"];
        this.previousPostCid = props["previousPostCid"];
        this.commentsIpnsName = props["commentsIpnsName"];
        this.nestedCommentsHelper = props["nestedCommentsHelper"];

    }
}

export default Post;