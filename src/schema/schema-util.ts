import { PageIpfsSchema } from "../pages/schema.js";
import type { PageIpfs } from "../pages/types.js";
import { PlebbitError } from "../plebbit-error.js";
import {
    CommentChallengeRequestToEncryptSchema,
    CommentIpfsSchema,
    CommentUpdateSchema,
    CreateCommentFunctionArgumentsSchema
} from "../publications/comment/schema.js";
import type { CommentChallengeRequestToEncryptType, CommentIpfsType, CommentUpdateType } from "../publications/comment/types.js";
import {
    DecryptedChallengeAnswerSchema,
    DecryptedChallengeSchema,
    DecryptedChallengeVerificationSchema
} from "../pubsub-messages/schema.js";
import {
    CreateNewLocalSubplebbitUserOptionsSchema,
    CreateRemoteSubplebbitFunctionArgumentSchema,
    CreateRpcSubplebbitFunctionArgumentSchema,
    CreateSubplebbitFunctionArgumentsSchema,
    RpcRemoteSubplebbitUpdateEventResultSchema,
    SubplebbitEditOptionsSchema,
    SubplebbitIpfsSchema
} from "../subplebbit/schema.js";
import type {
    CreateNewLocalSubplebbitUserOptions,
    RpcRemoteSubplebbitUpdateEventResultType,
    SubplebbitEditOptions,
    SubplebbitIpfsType
} from "../subplebbit/types.js";
import type { DecryptedChallenge, DecryptedChallengeAnswer, DecryptedChallengeVerification } from "../pubsub-messages/types.js";
import { throwWithErrorCode } from "../util.js";
import { CidStringSchema } from "./schema.js";
import { RpcCommentUpdateResultSchema } from "../clients/rpc-client/schema.js";
import { CreatePlebbitWsServerOptionsSchema, SetNewSettingsPlebbitWsServerSchema } from "../rpc/src/schema.js";
import type { CreatePlebbitWsServerOptions, SetNewSettingsPlebbitWsServer } from "../rpc/src/types.js";
import type { CommentModerationChallengeRequestToEncrypt } from "../publications/comment-moderation/types.js";
import {
    CommentModerationChallengeRequestToEncryptSchema,
    CreateCommentModerationFunctionArgumentSchema
} from "../publications/comment-moderation/schema.js";
import type { VoteChallengeRequestToEncryptType } from "../publications/vote/types.js";
import { CreateVoteFunctionArgumentSchema, VoteChallengeRequestToEncryptSchema } from "../publications/vote/schema.js";
import type { CommentEditChallengeRequestToEncryptType } from "../publications/comment-edit/types.js";
import {
    CommentEditChallengeRequestToEncryptSchema,
    CreateCommentEditFunctionArgumentSchema
} from "../publications/comment-edit/schema.js";
import { PlebbitUserOptionsSchema } from "../schema.js";

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
            zodError: e,
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

export function parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails(decryptedChallengeAnswers: any): DecryptedChallengeAnswer {
    const parseRes = DecryptedChallengeAnswerSchema.safeParse(decryptedChallengeAnswers);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_ANSWERS", {
            zodError: parseRes.error,
            challengeAnswers: decryptedChallengeAnswers
        });
    else return decryptedChallengeAnswers;
}

export function parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails(options: any): CreatePlebbitWsServerOptions {
    const parseRes = CreatePlebbitWsServerOptionsSchema.safeParse(options);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_PLEBBIT_WS_SERVER_OPTIONS_SCHEMA", {
            zodError: parseRes.error,
            challengeAnswers: options
        });
    else return options;
}

export function parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(
    toEncrypt: any
): CommentModerationChallengeRequestToEncrypt {
    const parseRes = CommentModerationChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_MODERATION_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails(editOptions: any): SubplebbitEditOptions {
    const parseRes = SubplebbitEditOptionsSchema.safeParse(editOptions);
    if (!parseRes.success)
        throw new PlebbitError("ERR_SUBPLEBBIT_EDIT_OPTIONS_SCHEMA", {
            zodError: parseRes.error,
            editOptions
        });
    else return editOptions;
}

export function parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt: any): CommentChallengeRequestToEncryptType {
    const parseRes = CommentChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt: any): VoteChallengeRequestToEncryptType {
    const parseRes = VoteChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_VOTE_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(
    toEncrypt: any
): CommentEditChallengeRequestToEncryptType {
    const parseRes = CommentEditChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_EDIT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails(options: any): CreateNewLocalSubplebbitUserOptions {
    const parseRes = CreateNewLocalSubplebbitUserOptionsSchema.safeParse(options);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_NEW_LOCAL_SUB_USER_OPTIONS", {
            zodError: parseRes.error,
            options
        });
    else return options;
}

export function parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(settings: any): SetNewSettingsPlebbitWsServer {
    const parseRes = SetNewSettingsPlebbitWsServerSchema.safeParse(settings);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_NEW_WS_SERVER_SETTINGS_SCHEMA", {
            zodError: parseRes.error,
            settings
        });
    else return settings;
}

export function parseCreateCommentFunctionArgumentsWithPlebbitErrorIfItFails(args: any) {
    const parseRes = CreateCommentFunctionArgumentsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parseCreateCommentModerationFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: any) {
    const parseRes = CreateCommentModerationFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_MODERATION_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parseCreateRemoteSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: any) {
    const parseRes = CreateRemoteSubplebbitFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_REMOTE_SUBPLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parseCreateVoteFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: any) {
    const parseRes = CreateVoteFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_VOTE_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parseCreateCommentEditFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: any) {
    const parseRes = CreateCommentEditFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parseCreateSubplebbitFunctionArgumentsSchemaWithPlebbitErrorIfItFails(args: any) {
    const parseRes = CreateSubplebbitFunctionArgumentsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parsePlebbitUserOptionsSchemaWithPlebbitErrorIfItFails(args: any) {
    // normally we don't change args, but here we should use parseRes.data because PlebbitUserOptionsSchema sets a lot of defaults
    const parseRes = PlebbitUserOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_PLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return parseRes.data;
}

export function parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(args: any) {
    const parseRes = CreateRpcSubplebbitFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_WITH_RPC_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}
