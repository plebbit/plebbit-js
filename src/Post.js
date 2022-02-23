import Comment from "./Comment.js";

class Post extends Comment {

    constructor(props, subplebbit) {
        super(props, subplebbit);
        this.parentCommentCid = null;
        this.title = props["title"];
    }

    toJSONSkeleton() {
        return {
            ...(super.toJSONSkeleton()),
            "title": this.title
        }
    }
}

export default Post;