import Comment from "./Comment.js";

class Post extends Comment {

    constructor(props, plebbit, subplebbit) {
        super(props, plebbit, subplebbit);
        this.parentCommentCid = null;
        this.title = props["title"];
    }


    toJSON() {
        return {
            ...super.toJSON(),
            "title": this.title
        };
    }
}

export default Post;