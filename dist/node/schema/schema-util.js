import { PageIpfsSchema } from "../pages/schema.js";
import { PlebbitError } from "../plebbit-error.js";
import { CommentChallengeRequestToEncryptSchema, CommentIpfsSchema, CommentPubsubMessageWithFlexibleAuthorRefinementSchema, CommentUpdateSchema, CreateCommentOptionsSchema, CreateCommentOptionsWithRefinementSchema } from "../publications/comment/schema.js";
import { DecryptedChallengeAnswerSchema, DecryptedChallengeSchema, DecryptedChallengeVerificationSchema } from "../pubsub-messages/schema.js";
import { CreateNewLocalSubplebbitUserOptionsSchema, CreateRemoteSubplebbitFunctionArgumentSchema, CreateRpcSubplebbitFunctionArgumentSchema, CreateSubplebbitFunctionArgumentsSchema, RpcRemoteSubplebbitUpdateEventResultSchema, SubplebbitEditOptionsSchema, SubplebbitIpfsSchema } from "../subplebbit/schema.js";
import { throwWithErrorCode } from "../util.js";
import { CidStringSchema } from "./schema.js";
import { RpcCommentUpdateResultSchema } from "../clients/rpc-client/schema.js";
import { CreatePlebbitWsServerOptionsSchema, SetNewSettingsPlebbitWsServerSchema } from "../rpc/src/schema.js";
import { CommentModerationChallengeRequestToEncryptSchema, CommentModerationPubsubMessagePublicationSchema, CreateCommentModerationOptionsSchema } from "../publications/comment-moderation/schema.js";
import { CreateVoteUserOptionsSchema, VoteChallengeRequestToEncryptSchema, VotePubsubMessagePublicationSchema } from "../publications/vote/schema.js";
import { CommentEditChallengeRequestToEncryptSchema, CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema, CreateCommentEditOptionsSchema } from "../publications/comment-edit/schema.js";
import { PlebbitUserOptionsSchema } from "../schema.js";
import { CreateSubplebbitEditPublicationOptionsSchema, SubplebbitEditPublicationChallengeRequestToEncryptSchema, SubplebbitEditPubsubMessagePublicationSchema } from "../publications/subplebbit-edit/schema.js";
export function parseJsonWithPlebbitErrorIfFails(x) {
    try {
        return JSON.parse(x);
    }
    catch (e) {
        throwWithErrorCode("ERR_INVALID_JSON", { error: e, invalidJson: x });
    }
}
export function parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(subIpfs) {
    const parseRes = SubplebbitIpfsSchema.passthrough().safeParse(subIpfs);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA", { zodError: parseRes.error, subJson: subIpfs });
    else
        return subIpfs;
}
export function parseCommentIpfsSchemaWithPlebbitErrorIfItFails(commentIpfsJson) {
    const parseRes = CommentIpfsSchema.passthrough().safeParse(commentIpfsJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_IPFS_SCHEMA", { zodError: parseRes.error, commentIpfsJson });
    else
        return commentIpfsJson;
}
export function parseCommentUpdateSchemaWithPlebbitErrorIfItFails(commentUpdateJson) {
    const parseRes = CommentUpdateSchema.passthrough().safeParse(commentUpdateJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_UPDATE_SCHEMA", { zodError: parseRes.error, commentUpdateJson });
    else
        return commentUpdateJson;
}
export function parsePageIpfsSchemaWithPlebbitErrorIfItFails(pageIpfsJson) {
    const parseRes = PageIpfsSchema.safeParse(pageIpfsJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_PAGE_IPFS_SCHEMA", { zodError: parseRes.error, pageIpfsJson });
    else
        return pageIpfsJson;
}
export function parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedChallengeJson) {
    const parseRes = DecryptedChallengeSchema.passthrough().safeParse(decryptedChallengeJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_DECRYPTED_SCHEMA", { zodError: parseRes.error, decryptedChallengeJson });
    else
        return decryptedChallengeJson;
}
export function parseDecryptedChallengeVerification(decryptedChallengeVerificationJson) {
    const parseRes = DecryptedChallengeVerificationSchema.passthrough().safeParse(decryptedChallengeVerificationJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_VERIFICATION_DECRYPTED_SCHEMA", {
            zodError: parseRes.error,
            decryptedChallengeVerificationJson
        });
    else
        return decryptedChallengeVerificationJson;
}
export function parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails(rpcRemoteSubplebbit) {
    const parseRes = RpcRemoteSubplebbitUpdateEventResultSchema.strip().safeParse(rpcRemoteSubplebbit);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_RPC_REMOTE_SUBPLEBBIT_SCHEMA", {
            zodError: parseRes.error,
            rpcRemoteSubplebbit
        });
    else
        return rpcRemoteSubplebbit;
}
export function parseCidStringSchemaWithPlebbitErrorIfItFails(cidString) {
    try {
        return CidStringSchema.parse(cidString);
    }
    catch (e) {
        throw new PlebbitError("ERR_INVALID_CID_STRING_SCHEMA", {
            zodError: e,
            cidString
        });
    }
}
export function parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(updateResult) {
    const parseRes = RpcCommentUpdateResultSchema.safeParse(updateResult);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_RPC_COMMENT_UPDATE_SCHEMA", {
            zodError: parseRes.error,
            updateResult
        });
    else
        return updateResult;
}
export function parseSubplebbitEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = SubplebbitEditPubsubMessagePublicationSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "SubplebbitEditPubsubMessagePublication"
        });
    else
        return args;
}
export function parseCreateSubplebbitEditPublicationOptionsSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateSubplebbitEditPublicationOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateSubplebbitEditPublicationOptions"
        });
    else
        return args;
}
export function parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails(decryptedChallengeAnswers) {
    const parseRes = DecryptedChallengeAnswerSchema.safeParse(decryptedChallengeAnswers);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_ANSWERS", {
            zodError: parseRes.error,
            challengeAnswers: decryptedChallengeAnswers
        });
    else
        return decryptedChallengeAnswers;
}
export function parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails(options) {
    const parseRes = CreatePlebbitWsServerOptionsSchema.safeParse(options);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_PLEBBIT_WS_SERVER_OPTIONS_SCHEMA", {
            zodError: parseRes.error,
            challengeAnswers: options
        });
    else
        return options;
}
export function parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt) {
    const parseRes = CommentModerationChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_MODERATION_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else
        return toEncrypt;
}
export function parseSubplebbitEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt) {
    const parseRes = SubplebbitEditPublicationChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_EDIT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else
        return toEncrypt;
}
export function parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails(editOptions) {
    const parseRes = SubplebbitEditOptionsSchema.safeParse(editOptions);
    if (!parseRes.success)
        throw new PlebbitError("ERR_SUBPLEBBIT_EDIT_OPTIONS_SCHEMA", {
            zodError: parseRes.error,
            editOptions
        });
    else
        return editOptions;
}
export function parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt) {
    const parseRes = CommentChallengeRequestToEncryptSchema.passthrough().safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else
        return toEncrypt;
}
export function parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt) {
    const parseRes = VoteChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_VOTE_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else
        return toEncrypt;
}
export function parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(toEncrypt) {
    const parseRes = CommentEditChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_EDIT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else
        return toEncrypt;
}
export function parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails(options) {
    const parseRes = CreateNewLocalSubplebbitUserOptionsSchema.safeParse(options);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_NEW_LOCAL_SUB_USER_OPTIONS", {
            zodError: parseRes.error,
            options
        });
    else
        return options;
}
export function parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(settings) {
    const parseRes = SetNewSettingsPlebbitWsServerSchema.safeParse(settings);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_NEW_WS_SERVER_SETTINGS_SCHEMA", {
            zodError: parseRes.error,
            settings
        });
    else
        return settings;
}
export function parseCreateCommentModerationOptionsSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateCommentModerationOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_MODERATION_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateCommentModerationOptions"
        });
    else
        return args;
}
export function parseCommentModerationPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CommentModerationPubsubMessagePublicationSchema.passthrough().safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_MODERATION_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CommentModerationPubsubMessagePublication"
        });
    else
        return args;
}
export function parseCreateRemoteSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateRemoteSubplebbitFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_REMOTE_SUBPLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else
        return args;
}
export function parseCreateVoteOptionsSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateVoteUserOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_VOTE_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateVoteOptions"
        });
    else
        return args;
}
export function parseVotePubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = VotePubsubMessagePublicationSchema.passthrough().safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_VOTE_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "VotePubsubMessagePublication"
        });
    else
        return args;
}
export function parseCreateCommentEditOptionsSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateCommentEditOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateCommentEditOptions"
        });
    else
        return args;
}
export function parseCommentEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CommentEditPubsubMessagePublication"
        });
    else
        return args;
}
export function parseCreateSubplebbitFunctionArgumentsSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateSubplebbitFunctionArgumentsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else
        return args;
}
export function parsePlebbitUserOptionsSchemaWithPlebbitErrorIfItFails(args) {
    // normally we don't change args, but here we should use parseRes.data because PlebbitUserOptionsSchema sets a lot of defaults
    const parseRes = PlebbitUserOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_PLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else
        return parseRes.data;
}
export function parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateRpcSubplebbitFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_WITH_RPC_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else
        return args;
}
export function parseCommentPubsubMessagePublicationWithPlebbitErrorIfItFails(args) {
    const parseRes = CommentPubsubMessageWithFlexibleAuthorRefinementSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CommentPubsubMessagePublication"
        });
    else
        return args;
}
export function parseCreateCommentOptionsSchemaWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateCommentOptionsWithRefinementSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateCommentOptions"
        });
    else
        return args;
}
export function parseSubplebbitAddressWithPlebbitErrorIfItFails(args) {
    const parseRes = CreateCommentOptionsSchema.shape.subplebbitAddress.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_ADDRESS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else
        return args;
}
//# sourceMappingURL=schema-util.js.map