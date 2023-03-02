import { Comment } from "./comment";
import { PostIpfsWithCid, PostPubsubMessage, PostType } from "./types";
import { Plebbit } from "./plebbit";
declare class Post extends Comment implements Omit<PostType, "replies"> {
    parentCid: undefined;
    depth: 0;
    constructor(props: Omit<PostType, "depth" | "parentCid">, plebbit: Plebbit);
    _initProps(props: Omit<PostType, "depth" | "parentCid">): void;
    toJSONPubsubMessagePublication(): PostPubsubMessage;
    toJSONAfterChallengeVerification(): PostIpfsWithCid;
    publish(): Promise<void>;
}
export default Post;
