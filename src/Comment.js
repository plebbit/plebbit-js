import Post from "./Post.js";

class Comment extends Post {
    constructor(props, plebbit, parentPostOrComment) {
        super(props, plebbit, parentPostOrComment?.subplebbit);
        this.parentPostOrComment = parentPostOrComment;
        this.parentPostOrCommentCid = props["parentPostOrCommentCid"] || this.parentPostOrComment?.cid
    }

    toJSON() {
        return {
            "parentPostOrCommentCid": this.parentPostOrCommentCid,
            "parentPostOrComment": this.parentPostOrComment, ...super.toJSON()
        };
    }

    async fetchParentPostOrComment() {
        return new Promise(async (resolve, reject) => {
            this.plebbit.getPostOrComment(this.parentPostOrCommentCid).then(res => {
                this.parentPostOrComment = res;
                resolve(this.parentPostOrComment);
            }).catch(reject);
        });

    }
}

export default Comment;