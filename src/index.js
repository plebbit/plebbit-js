import * as PlebbitClass from "./Plebbit.js";
import Comment from "./Comment.js";
import Post from "./Post.js";
import Vote from "./Vote.js";

export async function Plebbit(options) {
    return new PlebbitClass.Plebbit(options);
}

export {Comment, Post, Vote};