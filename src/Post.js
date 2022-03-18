import Comment from "./Comment.js";

class Post extends Comment {

    _initProps(props) {
        super._initProps(props);
        this.parentCommentCid = undefined;
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