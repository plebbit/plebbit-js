import { Comment } from "./comment";
import { PostType } from "./types";
import { Plebbit } from "./plebbit";
declare class Post extends Comment implements PostType {
    thumbnailUrl?: string;
    title: string;
    parentCid: undefined;
    depth: 0;
    link?: string;
    constructor(props: Omit<PostType, "depth" | "parentCid">, plebbit: Plebbit);
    _initProps(props: Omit<PostType, "depth" | "parentCid">): void;
    toJSON(): PostType;
    toJSONSkeleton(): {
        thumbnailUrl: string;
        title: string;
        parentCid: any;
        link: string;
        content: string;
        flair: import("./types").Flair;
        spoiler: boolean;
        author: import("./types").AuthorType;
        signature: import("./types").SignatureType;
        protocolVersion: "1.0.0";
        subplebbitAddress: string;
        timestamp: number;
    };
    publish(userOptions: any): Promise<void>;
}
export default Post;
