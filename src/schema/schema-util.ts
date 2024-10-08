import { PageIpfsSchema } from "../pages/schema.js";
import type { PageIpfs } from "../pages/types.js";
import { PlebbitError } from "../plebbit-error.js";
import { CommentIpfsSchema, CommentUpdateSchema } from "../publications/comment/schema.js";
import type { CommentIpfsType, CommentUpdateType } from "../publications/comment/types.js";
import { DecryptedChallengeSchema, DecryptedChallengeVerificationSchema } from "../pubsub-messages/schema.js";
import { RpcRemoteSubplebbitUpdateEventResultSchema, SubplebbitIpfsSchema } from "../subplebbit/schema.js";
import type { RpcRemoteSubplebbitUpdateEventResultType, SubplebbitIpfsType } from "../subplebbit/types.js";
import type { DecryptedChallenge, DecryptedChallengeVerification } from "../pubsub-messages/types.js";
import { throwWithErrorCode } from "../util.js";
import { CidStringSchema } from "./schema.js";
import { RpcCommentUpdateResultSchema } from "../clients/rpc-client/schema.js";

export function parseJsonWithPlebbitErrorIfFails(x: string): any {
    try {
        return JSON.parse(x);
    } catch (e) {
        throwWithErrorCode("ERR_INVALID_JSON", { error: e, invalidJson: x });
    }
}

export function parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(subIpfs: any): SubplebbitIpfsType {
    const parseRes = SubplebbitIpfsSchema.passthrough().safeParse(subIpfs);
    if (!parseRes.success) throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA", { zodError: parseRes.error, subJson: subIpfs });
    else return subIpfs;
}

export function parseCommentIpfsSchemaWithPlebbitErrorIfItFails(commentIpfsJson: any): CommentIpfsType {
    const parseRes = CommentIpfsSchema.passthrough().safeParse(commentIpfsJson);
    if (!parseRes.success) throw new PlebbitError("ERR_INVALID_COMMENT_IPFS_SCHEMA", { zodError: parseRes.error, commentIpfsJson });
    else return <CommentIpfsType>commentIpfsJson;
}

export function parseCommentUpdateSchemaWithPlebbitErrorIfItFails(commentUpdateJson: any): CommentUpdateType {
    const parseRes = CommentUpdateSchema.passthrough().safeParse(commentUpdateJson);
    if (!parseRes.success) throw new PlebbitError("ERR_INVALID_COMMENT_UPDATE_SCHEMA", { zodError: parseRes.error, commentUpdateJson });
    else return commentUpdateJson;
}

export function parsePageIpfsSchemaWithPlebbitErrorIfItFails(pageIpfsJson: any): PageIpfs {
    const parseRes = PageIpfsSchema.safeParse(pageIpfsJson);
    if (!parseRes.success) throw new PlebbitError("ERR_INVALID_PAGE_IPFS_SCHEMA", { zodError: parseRes.error, pageIpfsJson });
    else return pageIpfsJson;
}

export function parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedChallengeJson: any): DecryptedChallenge {
    const parseRes = DecryptedChallengeSchema.passthrough().safeParse(decryptedChallengeJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_DECRYPTED_SCHEMA", { zodError: parseRes.error, decryptedChallengeJson });
    else return decryptedChallengeJson;
}

export function parseDecryptedChallengeVerification(decryptedChallengeVerificationJson: any): DecryptedChallengeVerification {
    const parseRes = DecryptedChallengeVerificationSchema.passthrough().safeParse(decryptedChallengeVerificationJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_VERIFICATION_DECRYPTED_SCHEMA", {
            zodError: parseRes.error,
            decryptedChallengeVerificationJson
        });
    else return decryptedChallengeVerificationJson;
}

export function parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails(
    rpcRemoteSubplebbit: RpcRemoteSubplebbitUpdateEventResultType
) {
    const parseRes = RpcRemoteSubplebbitUpdateEventResultSchema.strip().safeParse(rpcRemoteSubplebbit);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_RPC_REMOTE_SUBPLEBBIT_SCHEMA", {
            zodError: parseRes.error,
            rpcRemoteSubplebbit
        });
    else return rpcRemoteSubplebbit;
}

export function parseCidStringSchemaWithPlebbitErrorIfItFails(cidString: any) {
    try {
        return CidStringSchema.parse(cidString);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_CID_STRING_SCHEMA", {
            zodError: cidString,
            cidString
        });
    }
}

export function parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(updateResult: any): CommentIpfsType | CommentUpdateType {
    const parseRes = RpcCommentUpdateResultSchema.safeParse(updateResult);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_RPC_COMMENT_UPDATE_SCHEMA", {
            zodError: parseRes.error,
            updateResult
        });
    else return updateResult;
}
