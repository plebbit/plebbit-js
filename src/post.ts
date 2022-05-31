import { Comment } from "./comment";
import assert from "assert";

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

    async publish(userOptions): Promise<void> {
        assert(this.title, "Post needs a title to publish");
        return super.publish(userOptions);
    }
}

export default Post;
