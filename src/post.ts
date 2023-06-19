import { Comment } from "./comment";
import { PostIpfsWithCid, PostPubsubMessage, PostType } from "./types";
import { Plebbit } from "./plebbit";
import { throwWithErrorCode } from "./util";
import assert from "assert";

class Post extends Comment implements Omit<PostType, "replies"> {
    parentCid: undefined;
    depth: 0;

    constructor(props: Omit<PostType, "depth" | "parentCid">, plebbit: Plebbit) {
        super(props, plebbit);
    }

    _initProps(props: Omit<PostType, "depth" | "parentCid">) {
        assert.equal(props["parentCid"], undefined, "A post can't have parentCid defined");
        assert.equal(props["depth"], 0, "A post can't have depth not equal to 0")
        super._initProps(props);
        this.parentCid = undefined;
    }

    toJSONPubsubMessagePublication(): PostPubsubMessage {
        return {
            ...super.toJSONPubsubMessagePublication(),
            title: this.title,
            parentCid: undefined,
            link: this.link
        };
    }

    toJSONAfterChallengeVerification(): PostIpfsWithCid {
        return { ...super.toJSONAfterChallengeVerification(), depth: this.depth, parentCid: this.parentCid, title: this.title };
    }

    async publish(): Promise<void> {
        if (typeof this.title !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), title: this.title });
        return super.publish();
    }
}

export default Post;
