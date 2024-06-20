import { PageIpfsSchema } from "../pages/schema.js";
import { PageIpfs } from "../pages/types.js";
import { PlebbitError } from "../plebbit-error.js";
import { CommentIpfsSchema, CommentUpdateSchema } from "../publications/comment/schema.js";
import type { CommentIpfsType, CommentUpdate } from "../publications/comment/types.js";
import { SubplebbitIpfsSchema } from "../subplebbit/schema.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import { throwWithErrorCode } from "../util.js";

export function parseJsonWithPlebbitErrorIfFails(x: string): any {
    try {
        return JSON.parse(x);
    } catch (e) {
        throwWithErrorCode("ERR_INVALID_JSON", { error: e, invalidJson: x });
    }
}

export function parseSubplebbitIpfsSchemaWithPlebbitErrorIfItFails(subJson: any): SubplebbitIpfsType {
    try {
        return SubplebbitIpfsSchema.parse(subJson);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA", { zodError: e, subJson });
    }
}

export function parseCommentIpfsSchemaWithPlebbitErrorIfItFails(commentIpfsJson: any): CommentIpfsType {
    try {
        return CommentIpfsSchema.parse(commentIpfsJson);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_COMMENT_IPFS_SCHEMA", { zodError: e, commentIpfsJson });
    }
}

export function parseCommentUpdateSchemaWithPlebbitErrorIfItFails(commentUpdateJson: any): CommentUpdate {
    try {
        return CommentUpdateSchema.parse(commentUpdateJson);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_COMMENT_UPDATE_SCHEMA", { zodError: e, commentUpdateJson });
    }
}

export function parsePageIpfsSchemaWithPlebbitErrorIfItFails(pageIpfsJson: any): PageIpfs {
    try {
        return PageIpfsSchema.parse(pageIpfsJson);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_PAGE_IPFS_SCHEMA", { zodError: e, pageIpfsJson });
    }
}
