import {Comment} from "./Comment.js";

class Post extends Comment {

    _initProps(props) {
        super._initProps(props);
        this.parentCid = undefined;
        this.title = props["title"];
        this.link = props["link"];
    }

    toJSONSkeleton() {
        return {
            ...(super.toJSONSkeleton()),
            "title": this.title,
            "link": this.link
        }
    }
}

export default Post;