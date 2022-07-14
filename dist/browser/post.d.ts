import { Comment } from "./comment";
declare class Post extends Comment {
    title?: string;
    _initProps(props: any): void;
    toJSONSkeleton(): {
        title: string;
        content: string;
        parentCid: string;
        subplebbitAddress: string;
        timestamp: number;
        signature: import("./signer").Signature;
        author: import("./author").default;
    };
    publish(userOptions: any): Promise<void>;
}
export default Post;
