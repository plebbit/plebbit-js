import type { CommentsTableRow, CommentUpdatesRow } from "../../../publications/comment/types.js";
import type { SignerType } from "../../../signer/types.js";
import type { SubplebbitIpfsType } from "../../../subplebbit/types.js";

export type PurgedCommentTableRows = {
    commentTableRow: CommentsTableRow;
    commentUpdateTableRow?: CommentUpdatesRow;
};

export type CommentCidWithReplies = Pick<CommentsTableRow, "cid"> & Pick<CommentUpdatesRow, "replies">;

type Features = NonNullable<SubplebbitIpfsType["features"]>;
type AnonymityMode = NonNullable<Features["anonymityMode"]>;

export type AnonymityAliasRow = {
    commentCid: CommentsTableRow["cid"];
    aliasPrivateKey: SignerType["privateKey"];
    originalAuthorSignerPublicKey: NonNullable<SignerType["publicKey"]>;
    mode: AnonymityMode;
    insertedAt: number;
};
