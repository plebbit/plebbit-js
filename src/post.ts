import { Comment } from "./comment";
import assert from "assert";
import { PostType } from "./types";

class Post extends Comment implements PostType {
    thumbnailUrl?: string;
    title: string;
    parentCid: undefined;
    depth: 0;
    link?: string;

    _initProps(props: PostType) {
        super._initProps(props);
        this.thumbnailUrl = props.thumbnailUrl;
        this.title = props.title;
        this.parentCid = undefined;
        this.depth = 0;
        this.link = props.link;
    }

    toJSON(): PostType {
        return { ...super.toJSON(), ...this.toJSONSkeleton(), depth: this.depth };
    }

    toJSONSkeleton() {
        return {
            ...super.toJSONSkeleton(),
            thumbnailUrl: this.thumbnailUrl,
            title: this.title,
            parentCid: undefined,
            link: this.link
        };
    }

    async publish(userOptions): Promise<void> {
        assert(this.title, "Post needs a title to publish");
        return super.publish(userOptions);
    }
}

export default Post;
