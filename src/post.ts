import { Comment } from "./comment";
import { PostType } from "./types";
import errcode from "err-code";
import { codes, messages } from "./errors";

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
        if (typeof this.title !== "string")
            throw errcode(Error(messages.ERR_PUBLICATION_MISSING_FIELD), codes.ERR_PUBLICATION_MISSING_FIELD, {
                details: `${this.getType()}.publish: title should be a string`
            });
        return super.publish(userOptions);
    }
}

export default Post;
