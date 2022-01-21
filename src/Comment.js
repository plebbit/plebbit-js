import Author from "./Author.js";

class Comment{
    constructor(props) {
        this.parentPostOrCommentCid = props["parentPostOrCommentCid"];
        this.author = new Author(props["author"]);
        this.timestamp = props["timestamp"];
        this.content = props["content"];
        this.previousCommentCid = props["previousCommentCid"];
        this.commentsIpnsName = props["commentsIpnsName"];
    }
}

export default Comment;