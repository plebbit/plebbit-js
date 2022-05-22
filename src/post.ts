import { Comment } from "./comment";

class Post extends Comment {
    title?: string;

    _initProps(props) {
        super._initProps(props);
        this.parentCid = undefined;
        this.title = props["title"];
    }

    toJSONSkeleton() {
        return {
            ...super.toJSONSkeleton(),
            title: this.title
        };
    }
}

export default Post;
