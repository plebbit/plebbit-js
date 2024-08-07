import { PageIpfsSchema } from "../pages/schema.js";
import type { PageIpfs } from "../pages/types.js";
import { PlebbitError } from "../plebbit-error.js";
import { CommentIpfsSchema, CommentStateSchema, CommentUpdateSchema, CommentUpdatingStateSchema } from "../publications/comment/schema.js";
import type { CommentIpfsType, CommentUpdate } from "../publications/comment/types.js";
import {
    DecryptedChallengeSchema,
    DecryptedChallengeVerificationSchema,
    EncodedDecryptedChallengeAnswerMessageSchema,
    EncodedDecryptedChallengeMessageSchema,
    EncodedDecryptedChallengeRequestMessageSchema,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema,
    EncodedDecryptedChallengeVerificationMessageSchema
} from "../pubsub-messages/schema.js";
import { RpcLocalSubplebbitUpdateResultSchema, RpcRemoteSubplebbitSchema, SubplebbitIpfsSchema } from "../subplebbit/schema.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import type {
    DecryptedChallenge,
    DecryptedChallengeVerification,
    EncodedDecryptedChallengeAnswerMessageType,
    EncodedDecryptedChallengeMessageType,
    EncodedDecryptedChallengeRequestMessageType,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    EncodedDecryptedChallengeVerificationMessageType
} from "../pubsub-messages/types.js";
import { throwWithErrorCode } from "../util.js";
import { PublicationPublishingState, PublicationStateSchema } from "../publications/schema.js";
import { CidStringSchema } from "./schema.js";
import { RpcCommentUpdateResultSchema } from "../clients/rpc-client/schema.js";

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

export function parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(subJson: any): SubplebbitIpfsType {
    try {
        return SubplebbitIpfsSchema.passthrough().parse(subJson);
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

export function parseDecryptedChallengeWithPlebbitErrorIfItFails(decryptedChallengeJson: any): DecryptedChallenge {
    try {
        return DecryptedChallengeSchema.parse(decryptedChallengeJson);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_CHALLENGE_DECRYPTED_SCHEMA", { zodError: e, decryptedChallengeJson });
    }
}

export function parseDecryptedChallengeVerification(decryptedChallengeVerificationJson: any): DecryptedChallengeVerification {
    try {
        return DecryptedChallengeVerificationSchema.parse(decryptedChallengeVerificationJson);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_CHALLENGE_VERIFICATION_DECRYPTED_SCHEMA", {
            zodError: e,
            decryptedChallengeVerificationJson
        });
    }
}

export function parseEncodedDecryptedChallengeRequestWithPlebbitErrorIfItFails(
    encodedDecryptedChallengeRequest: any
): EncodedDecryptedChallengeRequestMessageType {
    try {
        return EncodedDecryptedChallengeRequestMessageSchema.parse(encodedDecryptedChallengeRequest);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_ENCODED_CHALLENGE_REQUEST_PUBSUB_MSG_SCHEMA", {
            zodError: e,
            encodedDecryptedChallengeRequest
        });
    }
}

export function parseEncodedDecryptedChallengeRequestWithSubplebbitAuthorWithPlebbitErrorIfItFails(
    encodedDecryptedChallengeRequestWithSubplebbitAuthor: any
): EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor {
    try {
        return EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema.parse(
            encodedDecryptedChallengeRequestWithSubplebbitAuthor
        );
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_ENCODED_CHALLENGE_REQUEST_WITH_SUBPLEBBIT_AUTHOR_PUBSUB_MSG_SCHEMA", {
            zodError: e,
            encodedDecryptedChallengeRequestWithSubplebbitAuthor
        });
    }
}

export function parseEncodedDecryptedChallengeWithPlebbitErrorIfItFails(
    encodedDecryptedChallenge: any
): EncodedDecryptedChallengeMessageType {
    try {
        return EncodedDecryptedChallengeMessageSchema.parse(encodedDecryptedChallenge);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_ENCODED_CHALLENGE_PUBSUB_MSG_SCHEMA", {
            zodError: e,
            encodedDecryptedChallenge
        });
    }
}

export function parseEncodedDecryptedChallengeAnswerWithPlebbitErrorIfItFails(
    encodedDecryptedChallengeAnswer: any
): EncodedDecryptedChallengeAnswerMessageType {
    try {
        return EncodedDecryptedChallengeAnswerMessageSchema.parse(encodedDecryptedChallengeAnswer);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_ENCODED_CHALLENGE_ANSWER_PUBSUB_MSG_SCHEMA", {
            zodError: e,
            encodedDecryptedChallengeAnswer
        });
    }
}

export function parseEncodedDecryptedChallengeVerificationWithPlebbitErrorIfItFails(
    encodedDecryptedChallengeVerification: any
): EncodedDecryptedChallengeVerificationMessageType {
    try {
        return EncodedDecryptedChallengeVerificationMessageSchema.parse(encodedDecryptedChallengeVerification);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_ENCODED_CHALLENGE_VERIFICATION_PUBSUB_MSG_SCHEMA", {
            zodError: e,
            encodedDecryptedChallengeVerification
        });
    }
}

export function parseLocalSubplebbitRpcUpdateResultWithPlebbitErrorIfItFails(updateResult: any) {
    try {
        return RpcLocalSubplebbitUpdateResultSchema.parse(updateResult);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_LOCAL_SUBPLEBBIT_UPDATE_SCHEMA", {
            zodError: e,
            updateResult
        });
    }
}

export function parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails(rpcRemoteSubplebbit: any) {
    try {
        return RpcRemoteSubplebbitSchema.strip().parse(rpcRemoteSubplebbit);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_REMOTE_SUBPLEBBIT_SCHEMA", {
            zodError: e,
            rpcRemoteSubplebbit
        });
    }
}

export function parseRpcPublicationPublishingStateWithPlebbitErrorIfItFails(publishingState: any) {
    try {
        return PublicationPublishingState.parse(publishingState);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_PUBLICATION_PUBLISHING_STATE_SCHEMA", {
            zodError: e,
            publishingState
        });
    }
}

export function parseRpcPublicationStateWithPlebbitErrorIfItFails(state: any) {
    try {
        return PublicationStateSchema.parse(state);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_PUBLICATION_STATE_SCHEMA", {
            zodError: e,
            state
        });
    }
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

export function parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(updateResult: any) {
    try {
        return RpcCommentUpdateResultSchema.parse(updateResult);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_COMMENT_UPDATE_SCHEMA", {
            zodError: e,
            updateResult
        });
    }
}

export function parseRpcCommentUpdatingStateWithPlebbitErrorIfItFails(updatingState: any) {
    try {
        return CommentUpdatingStateSchema.parse(updatingState);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_COMMENT_UPDATING_STATE_SCHEMA", {
            zodError: e,
            updatingState
        });
    }
}

export function parseRpcCommentStateWithPlebbitErrorIfItFails(state: any) {
    try {
        return CommentStateSchema.parse(state);
    } catch (e) {
        throw new PlebbitError("ERR_INVALID_RPC_COMMENT_STATE_SCHEMA", {
            zodError: e,
            state
        });
    }
}
