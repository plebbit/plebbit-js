import { ModQueuePageIpfsSchema, PageIpfsSchema } from "../pages/schema.js";
import type { PageIpfs } from "../pages/types.js";
import { PlebbitError } from "../plebbit-error.js";
import {
    CommentChallengeRequestToEncryptSchema,
    CommentIpfsSchema,
    CommentPubsubMessagePublicationSchema,
    CommentPubsubMessageWithFlexibleAuthorRefinementSchema,
    CommentUpdateSchema,
    CreateCommentOptionsSchema,
    CreateCommentOptionsWithRefinementSchema
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
    CommentModerationPubsubMessagePublicationSchema,
    CreateCommentModerationOptionsSchema
} from "../publications/comment-moderation/schema.js";
import type { VoteChallengeRequestToEncryptType } from "../publications/vote/types.js";
import {
    CreateVoteUserOptionsSchema,
    VoteChallengeRequestToEncryptSchema,
    VotePubsubMessagePublicationSchema
} from "../publications/vote/schema.js";
import type { CommentEditChallengeRequestToEncryptType } from "../publications/comment-edit/types.js";
import {
    CommentEditChallengeRequestToEncryptSchema,
    CommentEditPubsubMessagePublicationSchema,
    CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema,
    CreateCommentEditOptionsSchema
} from "../publications/comment-edit/schema.js";
import { PlebbitUserOptionsSchema } from "../schema.js";
import { z } from "zod";
import type {
    CreateSubplebbitEditPublicationOptions,
    SubplebbitEditChallengeRequestToEncryptType,
    SubplebbitEditPubsubMessagePublication
} from "../publications/subplebbit-edit/types.js";
import {
    CreateSubplebbitEditPublicationOptionsSchema,
    SubplebbitEditPublicationChallengeRequestToEncryptSchema,
    SubplebbitEditPubsubMessagePublicationSchema
} from "../publications/subplebbit-edit/schema.js";

export function parseJsonWithPlebbitErrorIfFails(x: string): any {
    try {
        return JSON.parse(x);
    } catch (e) {
        throwWithErrorCode("ERR_INVALID_JSON", { error: e, invalidJson: x });
    }
}

export function parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(
    subIpfs: z.infer<typeof SubplebbitIpfsSchema>
): SubplebbitIpfsType {
    const parseRes = SubplebbitIpfsSchema.passthrough().safeParse(subIpfs);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA", {
            zodError: parseRes.error,
            subAddress: subIpfs?.address,
            subJson: subIpfs
        });
    else return subIpfs;
}

export function parseCommentIpfsSchemaWithPlebbitErrorIfItFails(commentIpfsJson: z.infer<typeof CommentIpfsSchema>): CommentIpfsType {
    const parseRes = CommentIpfsSchema.passthrough().safeParse(commentIpfsJson);
    if (!parseRes.success) throw new PlebbitError("ERR_INVALID_COMMENT_IPFS_SCHEMA", { zodError: parseRes.error, commentIpfsJson });
    else return <CommentIpfsType>commentIpfsJson;
}

export function parseCommentUpdateSchemaWithPlebbitErrorIfItFails(
    commentUpdateJson: z.infer<typeof CommentUpdateSchema>
): CommentUpdateType {
    const parseRes = CommentUpdateSchema.passthrough().safeParse(commentUpdateJson);
    if (!parseRes.success) throw new PlebbitError("ERR_INVALID_COMMENT_UPDATE_SCHEMA", { zodError: parseRes.error, commentUpdateJson });
    else return commentUpdateJson;
}

export function parsePageIpfsSchemaWithPlebbitErrorIfItFails(pageIpfsJson: z.infer<typeof PageIpfsSchema>): PageIpfs {
    const parseRes = PageIpfsSchema.safeParse(pageIpfsJson);
    if (!parseRes.success) throw new PlebbitError("ERR_INVALID_PAGE_IPFS_SCHEMA", { zodError: parseRes.error, pageIpfsJson });
    else return pageIpfsJson;
}

export function parseModQueuePageIpfsSchemaWithPlebbitErrorIfItFails(modQueuePageIpfsJson: z.infer<typeof ModQueuePageIpfsSchema>) {
    const parseRes = ModQueuePageIpfsSchema.safeParse(modQueuePageIpfsJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_MODQUEUE_PAGE_IPFS_SCHEMA", { zodError: parseRes.error, modQueuePageIpfsJson });
    else return modQueuePageIpfsJson;
}

export function parseDecryptedChallengeWithPlebbitErrorIfItFails(
    decryptedChallengeJson: z.infer<typeof DecryptedChallengeSchema>
): DecryptedChallenge {
    const parseRes = DecryptedChallengeSchema.passthrough().safeParse(decryptedChallengeJson);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_DECRYPTED_SCHEMA", { zodError: parseRes.error, decryptedChallengeJson });
    else return decryptedChallengeJson;
}

export function parseDecryptedChallengeVerification(
    decryptedChallengeVerificationJson: z.infer<typeof DecryptedChallengeVerificationSchema>
): DecryptedChallengeVerification {
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

export function parseCidStringSchemaWithPlebbitErrorIfItFails(cidString: z.infer<typeof CidStringSchema>) {
    try {
        return CidStringSchema.parse(cidString);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_CID_STRING_SCHEMA", {
            zodError: e,
            cidString
        });
    }
}

export function parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(
    updateResult: z.infer<typeof RpcCommentUpdateResultSchema>
): CommentIpfsType | CommentUpdateType {
    const parseRes = RpcCommentUpdateResultSchema.safeParse(updateResult);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_RPC_COMMENT_UPDATE_SCHEMA", {
            zodError: parseRes.error,
            updateResult
        });
    else return updateResult;
}

export function parseSubplebbitEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: SubplebbitEditPubsubMessagePublication) {
    const parseRes = SubplebbitEditPubsubMessagePublicationSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "SubplebbitEditPubsubMessagePublication"
        });
    else return args;
}

export function parseCreateSubplebbitEditPublicationOptionsSchemaWithPlebbitErrorIfItFails(args: CreateSubplebbitEditPublicationOptions) {
    const parseRes = CreateSubplebbitEditPublicationOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateSubplebbitEditPublicationOptions"
        });
    else return args;
}
export function parseDecryptedChallengeAnswerWithPlebbitErrorIfItFails(
    decryptedChallengeAnswers: z.infer<typeof DecryptedChallengeAnswerSchema>
): DecryptedChallengeAnswer {
    const parseRes = DecryptedChallengeAnswerSchema.safeParse(decryptedChallengeAnswers);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CHALLENGE_ANSWERS", {
            zodError: parseRes.error,
            challengeAnswers: decryptedChallengeAnswers
        });
    else return decryptedChallengeAnswers;
}

export function parseCreatePlebbitWsServerOptionsSchemaWithPlebbitErrorIfItFails(
    options: z.infer<typeof CreatePlebbitWsServerOptionsSchema>
): CreatePlebbitWsServerOptions {
    const parseRes = CreatePlebbitWsServerOptionsSchema.safeParse(options);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_PLEBBIT_WS_SERVER_OPTIONS_SCHEMA", {
            zodError: parseRes.error,
            challengeAnswers: options
        });
    else return options;
}

export function parseCommentModerationChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(
    toEncrypt: z.infer<typeof CommentModerationChallengeRequestToEncryptSchema>
): CommentModerationChallengeRequestToEncrypt {
    const parseRes = CommentModerationChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_MODERATION_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseSubplebbitEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(
    toEncrypt: z.infer<typeof SubplebbitEditPublicationChallengeRequestToEncryptSchema>
): SubplebbitEditChallengeRequestToEncryptType {
    const parseRes = SubplebbitEditPublicationChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_EDIT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseSubplebbitEditOptionsSchemaWithPlebbitErrorIfItFails(
    editOptions: z.infer<typeof SubplebbitEditOptionsSchema>
): SubplebbitEditOptions {
    const parseRes = SubplebbitEditOptionsSchema.safeParse(editOptions);
    if (!parseRes.success)
        throw new PlebbitError("ERR_SUBPLEBBIT_EDIT_OPTIONS_SCHEMA", {
            zodError: parseRes.error,
            editOptions
        });
    else return editOptions;
}

export function parseCommentChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(
    toEncrypt: z.infer<typeof CommentChallengeRequestToEncryptSchema>
): CommentChallengeRequestToEncryptType {
    const parseRes = CommentChallengeRequestToEncryptSchema.passthrough().safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseVoteChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(
    toEncrypt: z.infer<typeof VoteChallengeRequestToEncryptSchema>
): VoteChallengeRequestToEncryptType {
    const parseRes = VoteChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_VOTE_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseCommentEditChallengeRequestToEncryptSchemaWithPlebbitErrorIfItFails(
    toEncrypt: z.infer<typeof CommentEditChallengeRequestToEncryptSchema>
): CommentEditChallengeRequestToEncryptType {
    const parseRes = CommentEditChallengeRequestToEncryptSchema.safeParse(toEncrypt);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_COMMENT_EDIT_CHALLENGE_REQUEST_TO_ENCRYPT_SCHEMA", {
            zodError: parseRes.error,
            toEncrypt
        });
    else return toEncrypt;
}

export function parseCreateNewLocalSubplebbitUserOptionsSchemaWithPlebbitErrorIfItFails(
    options: z.infer<typeof CreateNewLocalSubplebbitUserOptionsSchema>
): CreateNewLocalSubplebbitUserOptions {
    const parseRes = CreateNewLocalSubplebbitUserOptionsSchema.safeParse(options);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_NEW_LOCAL_SUB_USER_OPTIONS", {
            zodError: parseRes.error,
            options
        });
    else return options;
}

export function parseSetNewSettingsPlebbitWsServerSchemaWithPlebbitErrorIfItFails(
    settings: z.input<typeof SetNewSettingsPlebbitWsServerSchema>
): z.input<typeof SetNewSettingsPlebbitWsServerSchema> {
    const parseRes = SetNewSettingsPlebbitWsServerSchema.safeParse(settings);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_NEW_WS_SERVER_SETTINGS_SCHEMA", {
            zodError: parseRes.error,
            settings
        });
    else return settings;
}

export function parseCreateCommentModerationOptionsSchemaWithPlebbitErrorIfItFails(
    args: z.infer<typeof CreateCommentModerationOptionsSchema>
) {
    const parseRes = CreateCommentModerationOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_MODERATION_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateCommentModerationOptions"
        });
    else return args;
}

export function parseCommentModerationPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(
    args: z.infer<typeof CommentModerationPubsubMessagePublicationSchema>
) {
    const parseRes = CommentModerationPubsubMessagePublicationSchema.passthrough().safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_MODERATION_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CommentModerationPubsubMessagePublication"
        });
    else return args;
}

export function parseCreateRemoteSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(
    args: any
): z.infer<typeof CreateRemoteSubplebbitFunctionArgumentSchema> {
    const parseRes = CreateRemoteSubplebbitFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_REMOTE_SUBPLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parseCreateVoteOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateVoteUserOptionsSchema>) {
    const parseRes = CreateVoteUserOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_VOTE_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateVoteOptions"
        });
    else return args;
}

export function parseVotePubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof VotePubsubMessagePublicationSchema>) {
    const parseRes = VotePubsubMessagePublicationSchema.passthrough().safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_VOTE_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "VotePubsubMessagePublication"
        });
    else return args;
}

export function parseCreateCommentEditOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentEditOptionsSchema>) {
    const parseRes = CreateCommentEditOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateCommentEditOptions"
        });
    else return args;
}

export function parseCommentEditPubsubMessagePublicationSchemaWithPlebbitErrorIfItFails(
    args: z.infer<typeof CommentEditPubsubMessagePublicationSchema>
) {
    const parseRes = CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_EDIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CommentEditPubsubMessagePublication"
        });
    else return args;
}

export function parseCreateSubplebbitFunctionArgumentsSchemaWithPlebbitErrorIfItFails(
    args: z.infer<typeof CreateSubplebbitFunctionArgumentsSchema>
) {
    const parseRes = CreateSubplebbitFunctionArgumentsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parsePlebbitUserOptionsSchemaWithPlebbitErrorIfItFails(args: any): z.infer<typeof PlebbitUserOptionsSchema> {
    // normally we don't change args, but here we should use parseRes.data because PlebbitUserOptionsSchema sets a lot of defaults
    const parseRes = PlebbitUserOptionsSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_PLEBBIT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return parseRes.data;
}

export function parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(
    args: z.infer<typeof CreateRpcSubplebbitFunctionArgumentSchema>
) {
    const parseRes = CreateRpcSubplebbitFunctionArgumentSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_SUBPLEBBIT_WITH_RPC_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}

export function parseCommentPubsubMessagePublicationWithPlebbitErrorIfItFails(args: z.infer<typeof CommentPubsubMessagePublicationSchema>) {
    const parseRes = CommentPubsubMessageWithFlexibleAuthorRefinementSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CommentPubsubMessagePublication"
        });
    else return args;
}

export function parseCreateCommentOptionsSchemaWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentOptionsSchema>) {
    const parseRes = CreateCommentOptionsWithRefinementSchema.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA", {
            zodError: parseRes.error,
            args,
            type: "CreateCommentOptions"
        });
    else return args;
}

export function parseSubplebbitAddressWithPlebbitErrorIfItFails(args: z.infer<typeof CreateCommentOptionsSchema.shape.subplebbitAddress>) {
    const parseRes = CreateCommentOptionsSchema.shape.subplebbitAddress.safeParse(args);
    if (!parseRes.success)
        throw new PlebbitError("ERR_INVALID_SUBPLEBBIT_ADDRESS_SCHEMA", {
            zodError: parseRes.error,
            args
        });
    else return args;
}
