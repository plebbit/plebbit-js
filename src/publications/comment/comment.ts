import retry, { RetryOperation } from "retry";
import { hideClassPrivateProps, removeUndefinedValuesRecursively, shortifyAddress, shortifyCid, throwWithErrorCode } from "../../util.js";
import Publication from "../publication.js";
import type { DecryptedChallengeVerification } from "../../pubsub-messages/types.js";
import type { AuthorWithOptionalCommentUpdateJson, PublicationTypeName } from "../../types.js";

import type { RepliesPagesTypeIpfs } from "../../pages/types.js";
import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "../../plebbit/plebbit.js";
import { verifyCommentIpfs, verifyCommentPubsubMessage, verifyCommentUpdateForChallengeVerification } from "../../signer/signatures.js";
import assert from "assert";
import { FailedToFetchCommentIpfsFromGatewaysError, PlebbitError } from "../../plebbit-error.js";
import { CommentClientsManager } from "../../clients/client-manager.js";
import * as remeda from "remeda";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";

import type {
    CommentIpfsType,
    CommentIpfsWithCidPostCidDefined,
    CommentPubsubMessagePublication,
    CommentState,
    CommentUpdateType,
    CommentUpdatingState,
    CommentWithinPageJson,
    CreateCommentOptions,
    RpcCommentUpdateResultType
} from "./types.js";
import { RepliesPages } from "../../pages/pages.js";
import { parseRawPages } from "../../pages/util.js";
import {
    CommentIpfsSchema,
    CommentUpdateForChallengeVerificationSchema,
    CommentUpdateSchema,
    OriginalCommentFieldsBeforeCommentUpdateSchema
} from "./schema.js";
import { parseRpcCommentUpdateEventWithPlebbitErrorIfItFails } from "../../schema/schema-util.js";
import type { SignerType } from "../../signer/types.js";

export class Comment
    extends Publication
    implements CommentPubsubMessagePublication, Partial<CommentIpfsWithCidPostCidDefined>, Partial<Omit<CommentUpdateType, "replies">>
{
    // Only Comment props
    shortCid?: CommentWithinPageJson["shortCid"];

    override clients!: CommentClientsManager["clients"];
    override author!: AuthorWithOptionalCommentUpdateJson;
    // public (CommentType)
    title?: CommentPubsubMessagePublication["title"];
    link?: CommentPubsubMessagePublication["link"];
    linkWidth?: CommentPubsubMessagePublication["linkWidth"];
    linkHeight?: CommentPubsubMessagePublication["linkHeight"];
    thumbnailUrl?: CommentIpfsType["thumbnailUrl"];
    thumbnailUrlWidth?: CommentIpfsType["thumbnailUrlWidth"];
    thumbnailUrlHeight?: CommentIpfsType["thumbnailUrlHeight"];
    cid?: CommentIpfsWithCidPostCidDefined["cid"];
    parentCid?: CommentIpfsType["parentCid"];
    content?: CommentPubsubMessagePublication["content"];
    // Props that get defined after challengeverification
    previousCid?: CommentIpfsType["previousCid"];
    depth?: CommentIpfsType["depth"];
    postCid?: CommentIpfsType["postCid"];
    linkHtmlTagName?: CommentPubsubMessagePublication["linkHtmlTagName"];

    // CommentEdit and CommentUpdate props
    original?: CommentWithinPageJson["original"];
    upvoteCount?: CommentUpdateType["upvoteCount"];
    downvoteCount?: CommentUpdateType["downvoteCount"];
    replyCount?: CommentUpdateType["replyCount"];
    updatedAt?: CommentUpdateType["updatedAt"];
    replies!: RepliesPages;
    edit?: CommentUpdateType["edit"];
    flair?: CommentPubsubMessagePublication["flair"];
    deleted?: CommentWithinPageJson["deleted"];
    spoiler?: CommentIpfsType["spoiler"];
    pinned?: CommentUpdateType["pinned"];
    locked?: CommentUpdateType["locked"];
    removed?: CommentUpdateType["removed"];
    reason?: CommentUpdateType["reason"];
    lastChildCid?: CommentUpdateType["lastChildCid"];
    lastReplyTimestamp?: CommentUpdateType["lastReplyTimestamp"];

    override signature!: CommentPubsubMessagePublication["signature"];
    // updating states
    override state!: CommentState;
    updatingState!: CommentUpdatingState;

    // private
    private _updateInterval?: any = undefined;
    _rawCommentUpdate?: CommentUpdateType = undefined;
    _rawCommentIpfs?: CommentIpfsType = undefined;
    private _loadingOperation?: RetryOperation = undefined;
    override _clientsManager!: CommentClientsManager;
    private _updateRpcSubscriptionId?: number = undefined;
    _pubsubMsgToPublish?: CommentPubsubMessagePublication = undefined;

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this._setUpdatingState("stopped");
        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);

        this.replies = new RepliesPages({
            pages: {},
            pageCids: {},
            plebbit: this._plebbit,
            subplebbitAddress: this.subplebbitAddress,
            pagesIpfs: undefined,
            parentCid: this.cid
        });
        hideClassPrivateProps(this);
    }

    override _initClients() {
        this._clientsManager = new CommentClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    private _setOriginalFieldBeforeModifying() {
        // Need to make sure we have the props first
        if (!this.original)
            this.original = OriginalCommentFieldsBeforeCommentUpdateSchema.parse(
                removeUndefinedValuesRecursively(this._rawCommentIpfs || this._pubsubMsgToPublish)
            );
    }

    _initLocalProps(props: {
        comment: CommentPubsubMessagePublication;
        signer?: SignerType;
        pubsubMessage?: CreateCommentOptions["pubsubMessage"];
    }) {
        this._initPubsubMessageProps(props.comment);
        if (props.pubsubMessage) super._initChallengeRequestChallengeProps(props.pubsubMessage);
        this.signer = props.signer;
    }

    _initPubsubMessageProps(props: CommentPubsubMessagePublication) {
        this._pubsubMsgToPublish = props;
        this._initProps(props);
    }

    _initIpfsProps(props: CommentIpfsType) {
        const log = Logger("plebbit-js:comment:_initIpfsProps");
        // we're loading remote CommentIpfs
        this._rawCommentIpfs = props;
        this._initProps(props);

        const unknownProps = remeda.difference(remeda.keys.strict(props), remeda.keys.strict(CommentIpfsSchema.shape));
        if (unknownProps.length > 0) {
            log("Found unknown props on loaded CommentIpfs", unknownProps, "Will set them on the Comment instance");
            Object.assign(this, remeda.pick(props, unknownProps));
        }
    }

    _initProps(props: CommentIpfsType | CommentPubsubMessagePublication) {
        // Initializing CommentPubsubMessage
        super._initBaseRemoteProps(props);
        this.content = props.content;
        this.flair = props.flair;
        this.link = props.link;
        this.linkHeight = props.linkHeight;
        this.linkWidth = props.linkWidth;
        this.parentCid = props.parentCid;
        this.spoiler = props.spoiler;
        this.title = props.title;
        this.linkHtmlTagName = props.linkHtmlTagName;
        // Initializing Comment Ipfs props
        if ("depth" in props && typeof props.depth === "number") {
            this.depth = props.depth;
            const postCid = props.postCid ? props.postCid : this.cid && this.depth === 0 ? this.cid : undefined;
            if (!postCid) throw Error("There is no way to set comment.postCid");
            this.postCid = postCid;
            this.previousCid = props.previousCid;
            this.thumbnailUrl = props.thumbnailUrl;
            this.thumbnailUrlHeight = props.thumbnailUrlHeight;
            this.thumbnailUrlWidth = props.thumbnailUrlWidth;
        }
    }

    _initCommentUpdate(props: CommentUpdateType | CommentWithinPageJson) {
        const log = Logger("plebbit-js:comment:_initCommentUpdate");
        if ("depth" in props)
            // CommentWithinPageJson
            this.original = props.original;
        else {
            // CommentUpdate
            this._setOriginalFieldBeforeModifying();
            this._rawCommentUpdate = props;

            const unknownProps = remeda.difference(remeda.keys.strict(props), remeda.keys.strict(CommentUpdateSchema.shape));
            if (unknownProps.length > 0) {
                log("Found unknown props on CommentUpdate record", unknownProps, "Will set them on Comment instance");
                Object.assign(this, remeda.pick(props, unknownProps));
            }
        }

        this.upvoteCount = props.upvoteCount;
        this.downvoteCount = props.downvoteCount;
        this.replyCount = props.replyCount;
        this.updatedAt = props.updatedAt;
        this.deleted = props.edit?.deleted;
        this.pinned = props.pinned;
        this.locked = props.locked;
        this.removed = props.removed;
        this.reason = props.reason;
        this.edit = props.edit;
        this.protocolVersion = props.protocolVersion;

        // Merge props from original comment and CommentUpdate
        this.spoiler =
            typeof props.spoiler === "boolean"
                ? props.spoiler
                : typeof props.edit?.spoiler === "boolean"
                  ? props.edit?.spoiler
                  : this.spoiler;
        if (props.author) Object.assign(this.author, props.author);
        if (props.edit?.content) this.content = props.edit.content;
        this.flair = props.flair || props.edit?.flair || this.flair;
        this.author.flair = props.author?.subplebbit?.flair || props.edit?.author?.flair || this.author?.flair;
        this.lastChildCid = props.lastChildCid;
        this.lastReplyTimestamp = props.lastReplyTimestamp;

        this._updateRepliesPostsInstance(props.replies);
    }

    _updateRepliesPostsInstance(
        newReplies: CommentUpdateType["replies"] | CommentWithinPageJson["replies"] | Pick<RepliesPagesTypeIpfs, "pageCids">
    ) {
        assert(this.cid, "Can't update comment.replies without comment.cid being defined");
        const log = Logger("plebbit-js:comment:_updateRepliesPostsInstanceIfNeeded");

        if (!newReplies) {
            this.replies.resetPages();
        } else if (!("pages" in newReplies)) {
            // only pageCids is provided
            this.replies.pageCids = newReplies.pageCids;
        } else {
            const shouldUpdateReplies = !remeda.isDeepEqual(this.replies.pageCids, newReplies.pageCids);

            if (shouldUpdateReplies) {
                log.trace(`Updating the props of comment instance (${this.cid}) replies`);
                const parsedPages = <Pick<RepliesPages, "pages"> & { pagesIpfs: RepliesPagesTypeIpfs | undefined }>(
                    parseRawPages(newReplies)
                );
                this.replies.updateProps({
                    ...parsedPages,
                    plebbit: this._plebbit,
                    subplebbitAddress: this.subplebbitAddress,
                    pageCids: newReplies.pageCids,
                    parentCid: this.cid
                });
            }
        }
    }

    private async _verifyChallengeVerificationCommentProps(
        decryptedVerification: DecryptedChallengeVerification
    ): Promise<PlebbitError | undefined> {
        const log = Logger("plebbit-js:comment:publish:_verifyChallengeVerificationCommentProps");

        if (!this._pubsubMsgToPublish) throw Error("comment._pubsubMsgToPublish should be defined at this point");
        // verify that the sub did not change any props that we published
        const pubsubMsgFromCommentIpfs = remeda.pick(decryptedVerification.comment, remeda.keys.strict(this._pubsubMsgToPublish));

        if (!remeda.isDeepEqual(pubsubMsgFromCommentIpfs, this._pubsubMsgToPublish)) {
            const error = new PlebbitError("ERR_SUB_CHANGED_COMMENT_PUBSUB_PUBLICATION_PROPS", {
                pubsubMsgFromSub: pubsubMsgFromCommentIpfs,
                originalPubsubMsg: this._pubsubMsgToPublish
            });
            log.error(error);
            this.emit("error", error);
            return error;
        }

        const commentIpfsValidity = await verifyCommentIpfs(
            decryptedVerification.comment,
            this._plebbit.resolveAuthorAddresses,
            this._clientsManager,
            false
        );
        if (!commentIpfsValidity.valid) {
            const error = new PlebbitError("ERR_SUB_SENT_CHALLENGE_VERIFICATION_WITH_INVALID_COMMENT", {
                reason: commentIpfsValidity.reason,
                decryptedChallengeVerification: decryptedVerification
            });
            log.error(error);
            this.emit("error", error);
            return error;
        }
        const commentUpdateValidity = await verifyCommentUpdateForChallengeVerification(decryptedVerification.commentUpdate);
        if (!commentUpdateValidity.valid) {
            const error = new PlebbitError("ERR_SUB_SENT_CHALLENGE_VERIFICATION_WITH_INVALID_COMMENTUPDATE", {
                reason: commentUpdateValidity.reason,
                decryptedChallengeVerification: decryptedVerification
            });
            log.error(error);
            this.emit("error", error);
            return error;
        }

        const calculatedCid = await calculateIpfsHash(JSON.stringify(decryptedVerification.comment));
        if (calculatedCid !== decryptedVerification.commentUpdate.cid) {
            const error = new PlebbitError("ERR_SUB_SENT_CHALLENGE_VERIFICATION_WITH_INVALID_CID", {
                cidSentBySub: decryptedVerification.commentUpdate.cid,
                calculatedCid,
                decryptedChallengeVerification: decryptedVerification
            });
            log.error(error);
            this.emit("error", error);
            return error;
        }
    }

    private async _addOwnCommentToIpfsIfConnectedToIpfsClient(decryptedVerification: DecryptedChallengeVerification) {
        // Will add and pin our own comment to IPFS
        // only if we're connected to kubo

        if (!this._rawCommentIpfs) throw Error("_rawCommentIpfs should be defined after challenge verification");
        const ipfsClient = this._clientsManager.getDefaultIpfs();
        const addRes = await ipfsClient._client.add(JSON.stringify(this._rawCommentIpfs), { pin: true });
        if (addRes.path !== decryptedVerification.commentUpdate.cid)
            throw Error("Added CommentIpfs to IPFS but we got a different cid, should not happen");
    }

    private _updateCommentPropsFromDecryptedChallengeVerification(decryptedVerification: DecryptedChallengeVerification) {
        const log = Logger("plebbit-js:comment:publish:_updateCommentPropsFromDecryptedChallengeVerification");

        this._setOriginalFieldBeforeModifying();
        this.setCid(decryptedVerification.commentUpdate.cid);
        this._initIpfsProps(decryptedVerification.comment);

        if (decryptedVerification.commentUpdate.author) Object.assign(this.author, decryptedVerification.commentUpdate.author);
        this.protocolVersion = decryptedVerification.commentUpdate.protocolVersion;

        // handle extra props here
        const unknownProps = remeda.difference(
            remeda.keys.strict(decryptedVerification.commentUpdate),
            remeda.keys.strict(CommentUpdateForChallengeVerificationSchema.shape)
        );
        if (unknownProps.length > 0) {
            log("Found unknown props on decryptedVerification.commentUpdate record", unknownProps, "Will set them on Comment instance");
            Object.assign(this, remeda.pick(decryptedVerification.commentUpdate, unknownProps));
        }
    }

    protected override async _verifyDecryptedChallengeVerificationAndUpdateCommentProps(
        decryptedVerification: DecryptedChallengeVerification
    ) {
        // We're gonna update Comment instance with DecryptedChallengeVerification.{comment, commentUpdate}
        const log = Logger("plebbit-js:comment:publish:_verifyDecryptedChallengeVerificationAndUpdateCommentProps");
        log(
            "Received update props from subplebbit after succcessful challenge exchange. Will attempt to validate if not connected to RPC",
            decryptedVerification
        );

        if (!this._plebbit.plebbitRpcClient) {
            // no need to validate if RPC
            const errorInVerificationProps = await this._verifyChallengeVerificationCommentProps(decryptedVerification);
            if (errorInVerificationProps) return;
        }

        this._updateCommentPropsFromDecryptedChallengeVerification(decryptedVerification);

        // Add the comment to IPFS network in the background
        if (this._clientsManager._defaultIpfsProviderUrl)
            this._addOwnCommentToIpfsIfConnectedToIpfsClient(decryptedVerification)
                .then(() => log("Added the file of comment ipfs", this.cid, "to IPFS network successfully"))
                .catch((err) => log.error(`Failed to add the file of comment ipfs`, this.cid, "to ipfs network due to error", err));
    }

    override getType(): PublicationTypeName {
        return "comment";
    }

    toJSONIpfs(): CommentIpfsType {
        if (!this._rawCommentIpfs) throw Error("comment._rawCommentIpfs has to be defined before calling toJSONIpfs()");
        return this._rawCommentIpfs;
    }

    override toJSONPubsubMessagePublication(): CommentPubsubMessagePublication {
        if (!this._pubsubMsgToPublish) throw Error("comment._pubsubMsgToPublish should be defined before calling ");
        return this._pubsubMsgToPublish;
    }

    setCid(newCid: string) {
        this.cid = newCid;
        this.shortCid = shortifyCid(this.cid);
        this.replies._parentCid = this.cid;
    }

    override setSubplebbitAddress(newSubplebbitAddress: string) {
        super.setSubplebbitAddress(newSubplebbitAddress);
        this.replies._subplebbitAddress = newSubplebbitAddress;
    }

    private _isCommentIpfsErrorRetriable(err: PlebbitError | Error): boolean {
        if (!(err instanceof PlebbitError)) return false; // If it's not a recognizable error, then we throw to notify the user
        if (
            err.code === "ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_COMMENT_IPFS_SCHEMA" ||
            err.code === "ERR_CALCULATED_CID_DOES_NOT_MATCH" ||
            err.code === "ERR_OVER_DOWNLOAD_LIMIT" ||
            err.code === "ERR_INVALID_JSON"
        )
            return false; // These errors means there's a problem with the record itself, not the loading

        if (err instanceof FailedToFetchCommentIpfsFromGatewaysError) {
            // If all gateway errors are due to the ipfs record itself, then it's a non-retriable error
            for (const gatewayError of Object.values(err.details.gatewayToError))
                if (this._isCommentIpfsErrorRetriable(gatewayError)) return true; // if there's at least one gateway whose error is not due to the record
            return false; // if all gateways have issues with the record validity itself, then we stop fetching
        }

        return true;
    }

    private async _retryLoadingCommentIpfs(cid: string, log: Logger): Promise<CommentIpfsType | PlebbitError> {
        return new Promise((resolve) => {
            this._loadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                try {
                    this._setUpdatingState("fetching-ipfs");
                    const res = await this._clientsManager.fetchAndVerifyCommentCid(cid);
                    this._setUpdatingState("succeeded");
                    resolve(res);
                } catch (e) {
                    if (e instanceof PlebbitError && e.details) e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error on loading comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                    if (this._isCommentIpfsErrorRetriable(<PlebbitError>e)) this._loadingOperation!.retry(<Error>e);
                    else return resolve(<PlebbitError>e);
                }
            });
        });
    }

    private async _retryLoadingCommentUpdate(log: Logger): Promise<CommentUpdateType | PlebbitError | Error> {
        return new Promise((resolve) => {
            this._loadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load CommentUpdate (${this.cid}) for the ${curAttempt}th time`);
                try {
                    const update: CommentUpdateType = await this._clientsManager.fetchCommentUpdate();
                    this._setUpdatingState("succeeded");
                    resolve(update);
                } catch (e) {
                    // fetchCommentUpdate could throw a non-retriable error
                    if (e instanceof PlebbitError && e.details) e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.trace(`Error when loading CommentUpdate (${this.cid}) on the ${curAttempt}th attempt`);
                    if (this._clientsManager._shouldWeFetchCommentUpdateFromNextTimestamp(<PlebbitError>e))
                        // Should we emit an error event or keep retrying?
                        this._loadingOperation!.retry(<Error>e);
                    else resolve(<PlebbitError>e);
                }
            });
        });
    }

    async updateOnce() {
        const log = Logger("plebbit-js:comment:update");
        this._loadingOperation = retry.operation({ forever: true, factor: 2 });
        if (this.cid && !this._rawCommentIpfs) {
            // User may have attempted to call plebbit.createComment({cid}).update
            const newCommentIpfsOrError = await this._retryLoadingCommentIpfs(this.cid, log); // Will keep retrying to load until comment.stop() is called

            if (newCommentIpfsOrError instanceof Error) {
                // This is a non-retriable error, it should stop the comment from updating
                log.error(
                    `Encountered a non retriable error while loading CommentIpfs (${this.cid}), will stop the update loop`,
                    newCommentIpfsOrError.toString()
                );
                // We can't proceed with an invalid CommentIpfs, so we're stopping the update loop and emitting an error event for the user
                await this._stopUpdateLoop();
                this._setUpdatingState("failed");
                this._updateState("stopped");
                this.emit("error", newCommentIpfsOrError);
                return;
            } else {
                log(`Loaded the CommentIpfs props of cid (${this.cid}) correctly, updating the instance props`);
                this._initIpfsProps(newCommentIpfsOrError);
                this.emit("update", this);
            }
        }

        const commentUpdateOrError = await this._retryLoadingCommentUpdate(log); // Will keep retrying to load until comment.stop() is called

        if (commentUpdateOrError instanceof Error) {
            // An error, either a signature or a schema problem
            // We should emit an error, and keep retrying to load a different record
            log.error(`Encountered an error while trying to load CommentUpdate of (${this.cid})`, commentUpdateOrError.toString());
            this.emit("error", commentUpdateOrError);
            return;
        } else if (commentUpdateOrError && (this.updatedAt || 0) < commentUpdateOrError.updatedAt) {
            log(`Comment (${this.cid}) received a new CommentUpdate`);
            this._initCommentUpdate(commentUpdateOrError);
            this.emit("update", this);
        } else log.trace(`Comment (${this.cid}) has no new CommentUpdate`);
    }

    _setUpdatingState(newState: Comment["updatingState"]) {
        if (newState === this.updatingState) return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }
    protected override _setRpcClientState(newState: Comment["clients"]["plebbitRpcClients"][""]["state"]) {
        const currentRpcUrl = remeda.keys.strict(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    protected _updateRpcClientStateFromUpdatingState(updatingState: Comment["updatingState"]) {
        // We're deriving the the rpc state from publishing state

        const mapper: Record<Comment["updatingState"], Comment["clients"]["plebbitRpcClients"][number]["state"]> = {
            failed: "stopped",
            succeeded: "stopped",
            "fetching-ipfs": "fetching-ipfs",
            "fetching-subplebbit-ipfs": "fetching-subplebbit-ipfs",
            "fetching-subplebbit-ipns": "fetching-subplebbit-ipns",
            "fetching-update-ipfs": "fetching-update-ipfs",
            "resolving-author-address": "resolving-author-address",
            "resolving-subplebbit-address": "resolving-subplebbit-address",
            stopped: "stopped"
        };

        const rpcState = mapper[updatingState] || updatingState; // in case rpc server transmits unknown prop, just use it as is

        this._setRpcClientState(rpcState);
    }

    private _isRetriableRpcError(err: Error | PlebbitError) {
        // Critical Errors for now are:
        // Invalid signature of CommentIpfs
        return this._isCommentIpfsErrorRetriable(err);
    }

    private _handleUpdateEventFromRpc(args: any) {
        const log = Logger("plebbit-js:comment:_handleUpdateEventFromRpc");
        let newUpdate: RpcCommentUpdateResultType;
        try {
            newUpdate = parseRpcCommentUpdateEventWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("Failed to parse the rpc update event of", this.cid, e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }
        if ("subplebbitAddress" in newUpdate) {
            log(`Received new CommentIpfs (${this.cid})`);
            this._initIpfsProps(newUpdate);
        } else {
            log(`Received new CommentUpdate (${this.cid})`);
            this._initCommentUpdate(newUpdate);
        }

        this.emit("update", this);
    }

    private _handleUpdatingStateChangeFromRpc(args: any) {
        const updateState: Comment["updatingState"] = args.params.result; // optimistic, rpc server could transmit an updating state that is not known to us
        this._setUpdatingState(updateState);
        this._updateRpcClientStateFromUpdatingState(updateState);
    }

    private _handleStateChangeFromRpc(args: any) {
        const commentState: Comment["state"] = args.params.result;
        this._updateState(commentState);
    }

    private async _handleErrorEventFromRpc(args: any) {
        const log = Logger("plebbit-js:comment:update:_handleErrorEventFromRpc");
        const err = <PlebbitError>args.params.result;
        log("Received 'error' event from RPC", err);
        if (!this._isRetriableRpcError(err)) {
            log.error("The RPC transmitted a non retriable error", "for comment", this.cid, "will clean up the subscription", err);
            this._setUpdatingState("failed");
            this._updateState("stopped");
            await this._stopUpdateLoop();
        }
        this.emit("error", err);
    }

    private async _updateViaRpc() {
        const log = Logger("plebbit-js:comment:update:_updateViaRpc");

        const rpcUrl = this._plebbit.plebbitRpcClientsOptions![0];
        if (!rpcUrl) throw Error("Failed to get rpc url");
        if (!this.cid) throw Error("Can't start updating comment without defining this.cid");
        try {
            this._updateRpcSubscriptionId = await this._plebbit.plebbitRpcClient!.commentUpdateSubscribe(this.cid);
        } catch (e) {
            log.error("Failed to receive commentUpdate from RPC due to error", e);
            this._updateState("stopped");
            this._setUpdatingState("failed");
            throw e;
        }
        this._updateState("updating");

        this._plebbit
            .plebbitRpcClient!.getSubscription(this._updateRpcSubscriptionId)
            .on("update", this._handleUpdateEventFromRpc.bind(this))
            .on("updatingstatechange", this._handleUpdatingStateChangeFromRpc.bind(this))
            .on("statechange", this._handleStateChangeFromRpc.bind(this))
            .on("error", this._handleErrorEventFromRpc.bind(this));

        this._plebbit.plebbitRpcClient!.emitAllPendingMessages(this._updateRpcSubscriptionId);
    }

    async update() {
        const log = Logger("plebbit-js:comment:update");
        if (this.state === "updating") return; // Do nothing if it's already updating

        if (this._plebbit.plebbitRpcClient) return this._updateViaRpc();

        this._updateState("updating");
        const updateLoop = (async () => {
            if (this.state === "updating")
                this.updateOnce()
                    .catch((e) => log.error("Failed to update comment", e))
                    .finally(() => (this._updateInterval = setTimeout(updateLoop, this._plebbit.updateInterval)));
        }).bind(this);
        updateLoop();
    }

    private async _stopUpdateLoop() {
        this._loadingOperation?.stop();
        this._updateInterval = clearTimeout(this._updateInterval);
        if (this._updateRpcSubscriptionId) {
            await this._plebbit.plebbitRpcClient!.unsubscribe(this._updateRpcSubscriptionId);
            this._updateRpcSubscriptionId = undefined;
            this._setRpcClientState("stopped");
        }
    }

    override async stop() {
        if (this.state === "publishing") await super.stop();
        this._setUpdatingState("stopped");
        this._updateState("stopped");
        await this._stopUpdateLoop();
    }

    private async _validateSignature() {
        const commentObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringify so it resembles messages from pubsub
        const signatureValidity = await verifyCommentPubsubMessage(
            commentObj,
            this._plebbit.resolveAuthorAddresses,
            this._clientsManager,
            true
        ); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    override async publish(): Promise<void> {
        await this._validateSignature();
        return super.publish();
    }
}
