import Comment from "./Comment.js";

class Post extends Comment {

    constructor(props, plebbit, subplebbit) {
        super(props, plebbit, subplebbit);
        this.parentCommentCid = this.commentCid = this.previousCommentCid = null;
        this.previousPostCid = props["previousPostCid"];
        this.title = props["title"];
    }

    setPreviousPostCid(previousPostCid) {
        this.previousPostCid = previousPostCid;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            "title": this.title,
            "previousPostCid": this.previousPostCid,
        };
    }
}

export default Post;