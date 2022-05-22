import {Comment} from "./comment";
declare class Post extends Comment {
    title?: string;
    _initProps(props: any): void;
    toJSONSkeleton(): {
        title: string;
        content: string;
        parentCid: string;
        subplebbitAddress: string;
        timestamp: number;
        signature: string;
        author: import("./author").default;
    };
}
export default Post;
