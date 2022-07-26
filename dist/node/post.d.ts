import { Comment } from "./comment";
import { PostType } from "./types";
declare class Post extends Comment implements PostType {
    thumbnailUrl?: string;
    title: string;
    parentCid: undefined;
    depth: 0;
    link?: string;
    _initProps(props: PostType): void;
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
