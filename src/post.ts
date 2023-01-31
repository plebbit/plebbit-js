import { Comment } from "./comment";
import { PostPubsubMessage, PostType } from "./types";
import { Plebbit } from "./plebbit";
import { throwWithErrorCode } from "./util";

class Post extends Comment implements PostType {
    thumbnailUrl?: string;
    title: string;
    parentCid: undefined;
    depth: 0;
    link?: string;

    constructor(props: Omit<PostType, "depth" | "parentCid">, plebbit: Plebbit) {
        super(props, plebbit);
    }

    _initProps(props: Omit<PostType, "depth" | "parentCid">) {
        super._initProps(props);
        this.thumbnailUrl = props.thumbnailUrl;
        this.title = props.title;
        this.parentCid = undefined;
        this.link = props.link;
    }

    toJSON(): PostType {
        return { ...super.toJSON(), ...this.toJSONPubsubMessagePublication(), depth: this.depth, thumbnailUrl: this.thumbnailUrl };
    }

    toJSONPubsubMessagePublication(): PostPubsubMessage {
        return {
            ...super.toJSONPubsubMessagePublication(),
            title: this.title,
            parentCid: undefined,
            link: this.link
        };
    }

    async publish(): Promise<void> {
        if (typeof this.title !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", `${this.getType()}.publish: title (${this.title}) should be a string`);
        return super.publish();
    }
}

export default Post;
