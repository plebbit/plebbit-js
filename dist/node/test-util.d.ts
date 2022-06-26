import { Signer } from "./signer";
import { Comment } from "./comment";
import Post from "./post";
import { Plebbit } from "./plebbit";
export declare function generateMockPost(subplebbitAddress: string, plebbit: Plebbit, signer?: Signer): Promise<Comment | Post>;
export declare function generateMockComment(parentPostOrComment: Post | Comment, plebbit: Plebbit, signer?: Signer): Promise<Comment>;
export declare function generateMockPostWithRandomTimestamp(subplebbitAddress: any, plebbit: any, signer: any): Promise<any>;
export declare function generateMockVote(parentPostOrComment: any, vote: any, plebbit: any, signer: any): Promise<any>;
export declare function loadAllPages(pageCid: any, pagesInstance: any): Promise<any>;
