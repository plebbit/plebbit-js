import { CachedTextRecordResolve, OptionsToLoadFromGateway } from "../../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../../clients/chain-provider-client.js";
import type { PageIpfs } from "../../pages/types.js";
import type { SubplebbitIpfsType } from "../../subplebbit/types.js";
import type { ChainTicker } from "../../types.js";
import { Comment } from "./comment.js";
import * as remeda from "remeda";
import type { CommentIpfsType, CommentUpdateType } from "./types.js";
import {
    parseCommentIpfsSchemaWithPlebbitErrorIfItFails,
    parseCommentUpdateSchemaWithPlebbitErrorIfItFails,
    parseJsonWithPlebbitErrorIfFails
} from "../../schema/schema-util.js";
import { FailedToFetchCommentUpdateFromGatewaysError, PlebbitError } from "../../plebbit-error.js";
import { verifyCommentIpfs, verifyCommentUpdate } from "../../signer/signatures.js";
import Logger from "@plebbit/plebbit-logger";
import { getPostUpdateTimestampRange, hideClassPrivateProps, resolveWhenPredicateIsTrue } from "../../util.js";
import { PublicationClientsManager } from "../publication-client-manager.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import { findCommentInPageInstance, findCommentInPageInstanceRecursively, findCommentInParsedPages } from "../../pages/util.js";
import {
    CommentIpfsGatewayClient,
    CommentKuboPubsubClient,
    CommentKuboRpcClient,
    CommentLibp2pJsClient,
    CommentPlebbitRpcStateClient
} from "./comment-clients.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import type { PublicationEvents } from "../types.js";

type NewCommentUpdate =
    | { commentUpdate: CommentUpdateType; commentUpdateIpfsPath: NonNullable<Comment["_commentUpdateIpfsPath"]> }
    | undefined;

export const MAX_FILE_SIZE_BYTES_FOR_COMMENT_UPDATE = 1024 * 1024;
export class CommentClientsManager extends PublicationClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: CommentIpfsGatewayClient };
        kuboRpcClients: { [ipfsClientUrl: string]: CommentKuboRpcClient };
        pubsubKuboRpcClients: { [pubsubClientUrl: string]: CommentKuboPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
        libp2pJsClients: { [libp2pJsClientKey: string]: CommentLibp2pJsClient };
    };
    private _postForUpdating?: {
        comment: Comment;
        ipfsGatewayListeners?: Record<string, Parameters<Comment["clients"]["ipfsGateways"][string]["on"]>[1]>;
        kuboRpcListeners?: Record<string, Parameters<Comment["clients"]["kuboRpcClients"][string]["on"]>[1]>;
        libp2pJsClientListeners?: Record<string, Parameters<Comment["clients"]["libp2pJsClients"][string]["on"]>[1]>;
        chainProviderListeners?: Record<
            ChainTicker,
            Record<string, Parameters<Comment["clients"]["chainProviders"][ChainTicker][string]["on"]>[1]>
        >;
    } & Pick<PublicationEvents, "error" | "updatingstatechange" | "update"> = undefined;
    private _comment: Comment;
    private _parentFirstPageCidsAlreadyLoaded: Set<string>;
    private _fetchingUpdateForReplyUsingPageCidsPromise?:
        | ReturnType<CommentClientsManager["usePageCidsOfParentToFetchCommentUpdateForReply"]>
        | undefined;

    constructor(comment: Comment) {
        super(comment);
        this._comment = comment;
        this._fetchingUpdateForReplyUsingPageCidsPromise = undefined;
        this._parentFirstPageCidsAlreadyLoaded = new Set<string>();
        hideClassPrivateProps(this);
    }

    protected override _initKuboRpcClients(): void {
        if (this._plebbit.clients.kuboRpcClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
                this.clients.kuboRpcClients = { ...this.clients.kuboRpcClients, [ipfsUrl]: new CommentKuboRpcClient("stopped") };
    }

    protected override _initLibp2pJsClients(): void {
        for (const libp2pJsClientKey of remeda.keys.strict(this._plebbit.clients.libp2pJsClients))
            this.clients.libp2pJsClients = { ...this.clients.libp2pJsClients, [libp2pJsClientKey]: new CommentLibp2pJsClient("stopped") };
    }

    protected override _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new CommentPlebbitRpcStateClient("stopped") };
    }

    override updateLibp2pJsClientState(newState: CommentLibp2pJsClient["state"], libp2pJsClientKey: string) {
        super.updateLibp2pJsClientState(newState, libp2pJsClientKey);
    }

    override updateKuboRpcState(newState: CommentKuboRpcClient["state"], kuboRpcClientUrl: string) {
        super.updateKuboRpcState(newState, kuboRpcClientUrl);
    }

    override updateGatewayState(newState: CommentIpfsGatewayClient["state"], ipfsGatewayClientUrl: string) {
        super.updateGatewayState(newState, ipfsGatewayClientUrl);
    }

    override updateKuboRpcPubsubState(newState: CommentKuboPubsubClient["state"], pubsubKuboRpcClientUrl: string) {
        super.updateKuboRpcPubsubState(newState, pubsubKuboRpcClientUrl);
    }

    // Resolver methods here
    override preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ): void {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl, staleCache);
        if (this._comment.state === "updating" && !staleCache && txtRecordName === "plebbit-author-address")
            this._comment._setUpdatingStateWithEmissionIfNewState("resolving-author-address"); // Resolving for CommentIpfs and author.address is a domain
    }

    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, commentCidToLookFor: string) {
        if (!subIpns.posts?.pages?.hot) return undefined; // try to use preloaded pages if possible
        const findInCommentAndChildren = (pageComment: PageIpfs["comments"][0]): PageIpfs["comments"][number] | undefined => {
            if (pageComment.commentUpdate.cid === commentCidToLookFor) return pageComment;
            if (!pageComment.commentUpdate.replies?.pages?.best) return undefined;
            for (const childComment of pageComment.commentUpdate.replies.pages.best.comments) {
                const commentInChild = findInCommentAndChildren(childComment);
                if (commentInChild) return commentInChild;
            }
            return undefined;
        };
        for (const post of subIpns.posts.pages.hot.comments) {
            const commentInChild = findInCommentAndChildren(post);
            if (commentInChild) return commentInChild;
        }
        return undefined;
    }

    _calculatePathForPostCommentUpdate(folderCid: string, postCid: string) {
        return `${folderCid}/` + postCid + "/update";
    }

    _updateKuboRpcClientOrHeliaState(
        newState: CommentKuboRpcClient["state"] | CommentLibp2pJsClient["state"],
        kuboRpcOrHelia: Plebbit["clients"]["kuboRpcClients"][string] | Plebbit["clients"]["libp2pJsClients"][string]
    ) {
        if ("_helia" in kuboRpcOrHelia) this.updateLibp2pJsClientState(newState, kuboRpcOrHelia._libp2pJsClientsOptions.key);
        else this.updateKuboRpcState(newState as CommentKuboRpcClient["state"], kuboRpcOrHelia.url);
    }

    async _fetchPostCommentUpdateIpfsP2P(subIpns: SubplebbitIpfsType, timestampRanges: string[], log: Logger): Promise<NewCommentUpdate> {
        // only get new CommentUpdates
        // not interested in CommentUpdate we already fetched before
        const attemptedPathsToLoadErrors: Record<string, Error> = {};
        const kuboRpcOrHelia = this.getDefaultKuboRpcClientOrHelia();

        const didLastPostUpdateRangeHaveSameFolderCid = timestampRanges.some((timestampRange) => {
            if (!this._comment._commentUpdateIpfsPath) return false;
            const folderCid = subIpns.postUpdates![timestampRange];
            const lastFolderCid = this._comment._commentUpdateIpfsPath.split("/")[0];
            return folderCid === lastFolderCid;
        });
        if (didLastPostUpdateRangeHaveSameFolderCid) {
            log(
                "Comment",
                this._comment.cid,
                "last post update range has same folder cid",
                this._comment._commentUpdateIpfsPath,
                "will be skipping loading CommentUpdate"
            );
            return undefined;
        }
        this._comment._setUpdatingStateWithEmissionIfNewState("fetching-update-ipfs");
        for (const timestampRange of timestampRanges) {
            const folderCid = subIpns.postUpdates![timestampRange];
            const path = this._calculatePathForPostCommentUpdate(folderCid, this._comment.postCid!);
            this._updateKuboRpcClientOrHeliaState("fetching-update-ipfs", kuboRpcOrHelia);
            let res: string;
            const commentUpdateTimeoutMs = this._plebbit._timeouts["comment-update-ipfs"];
            try {
                res = await this._fetchCidP2P(path, {
                    maxFileSizeBytes: MAX_FILE_SIZE_BYTES_FOR_COMMENT_UPDATE,
                    timeoutMs: commentUpdateTimeoutMs
                });
            } catch (e) {
                log.trace(`Failed to fetch CommentUpdate from path (${path}) with IPFS P2P. Trying the next timestamp range`);
                attemptedPathsToLoadErrors[path] = <Error>e;
                continue;
            } finally {
                this._updateKuboRpcClientOrHeliaState("stopped", kuboRpcOrHelia);
            }
            try {
                const commentUpdate = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res));
                await this._throwIfCommentUpdateHasInvalidSignature(commentUpdate, subIpns);
                if (commentUpdate.updatedAt > (this._comment.raw?.commentUpdate?.updatedAt || 0))
                    return { commentUpdate, commentUpdateIpfsPath: path };
                else return undefined;
            } catch (e) {
                // there's a problem with the record itself, could be signature or schema or bad json
                this._comment._invalidCommentUpdateMfsPaths.add(path);
                if (e instanceof PlebbitError) e.details = { ...e.details, commentUpdatePath: path, postCid: this._comment.cid };
                throw e;
            }
        }
        throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES", {
            timestampRanges,
            attemptedPathsToLoadErrors,
            postCid: this._comment.cid
        });
    }

    _shouldWeFetchCommentUpdateFromNextTimestamp(err: PlebbitError | Error): boolean {
        // Is there a problem with the record itself, or is this an issue with fetching?
        if (!(err instanceof PlebbitError)) return false; // If it's not a recognizable error, then we throw to notify the user
        if (
            err.code === "ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_COMMENT_UPDATE_SCHEMA" ||
            err.code === "ERR_OVER_DOWNLOAD_LIMIT" ||
            err.code === "ERR_INVALID_JSON"
        )
            return false; // These errors means there's a problem with the record itself, not the loading

        if (err instanceof FailedToFetchCommentUpdateFromGatewaysError) {
            // If all gateway errors are due to the record itself, then we throw an error and don't jump to the next timestamp
            for (const gatewayError of Object.values(err.details.gatewayToError))
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(gatewayError)) return true; // if there's at least one gateway whose error is not due to the record
            return false; // if all gateways have issues with the record validity itself, then we stop fetching
        }

        return true;
    }

    private async _throwIfCommentUpdateHasInvalidSignature(commentUpdate: CommentUpdateType, subplebbitIpfs: SubplebbitIpfsType) {
        if (!this._comment.raw.comment) throw Error("Can't validate comment update when CommentIpfs hasn't been loaded");
        if (!this._comment.cid) throw Error("can't validate comment update when cid is not defined");
        if (!this._comment.postCid) throw Error("can't validate comment update when postCid is not defined");
        const verifyOptions = {
            update: commentUpdate,
            resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
            clientsManager: this,
            subplebbit: subplebbitIpfs,
            comment: { ...this._comment.raw.comment, cid: this._comment.cid, postCid: this._comment.postCid },
            overrideAuthorAddressIfInvalid: true,
            validatePages: this._plebbit.validatePages,
            validateUpdateSignature: true
        };
        const signatureValidity = await verifyCommentUpdate(verifyOptions);
        if (!signatureValidity.valid)
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", {
                signatureValidity,
                verifyOptions
            });
    }

    async _fetchPostCommentUpdateFromGateways(
        subIpns: SubplebbitIpfsType,
        timestampRanges: string[],
        log: Logger
    ): Promise<NewCommentUpdate> {
        const didLastPostUpdateRangeHaveSameFolderCid = timestampRanges.some((timestampRange) => {
            if (!this._comment._commentUpdateIpfsPath) return false;
            const folderCid = subIpns.postUpdates![timestampRange];
            const lastFolderCid = this._comment._commentUpdateIpfsPath.split("/")[0];
            return folderCid === lastFolderCid;
        });
        if (didLastPostUpdateRangeHaveSameFolderCid) {
            log(
                "Comment",
                this._comment.cid,
                "last post update range has same folder cid",
                this._comment._commentUpdateIpfsPath,
                "will be skipping loading CommentUpdate"
            );
            return undefined;
        }
        const attemptedPathsToLoadErrors: Record<string, Error> = {};

        let commentUpdate: CommentUpdateType | undefined;

        const validateCommentFromGateway: OptionsToLoadFromGateway["validateGatewayResponseFunc"] = async (res) => {
            if (typeof res.resText !== "string") throw Error("Gateway response has no body");
            const commentUpdateBeforeSignature = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(
                parseJsonWithPlebbitErrorIfFails(res.resText)
            );
            await this._throwIfCommentUpdateHasInvalidSignature(commentUpdateBeforeSignature, subIpns);
            commentUpdate = commentUpdateBeforeSignature; // at this point, we know the gateway has provided a valid comment update and we can use it
        };

        this._comment._setUpdatingStateWithEmissionIfNewState("fetching-update-ipfs");

        for (const timestampRange of timestampRanges) {
            // We're validating schema and signature here for every gateway because it's not a regular cid whose content we can verify to match the cid

            const folderCid = subIpns.postUpdates![timestampRange];
            const path = this._calculatePathForPostCommentUpdate(folderCid, this._comment.postCid!);

            try {
                // Validate the Comment Update within the gateway fetching algo
                // fetchFromMultipleGateways will throw if all gateways failed to load the record
                await this.fetchFromMultipleGateways({
                    recordIpfsType: "ipfs",
                    root: folderCid,
                    path: path.replace(`${folderCid}/`, ""),
                    recordPlebbitType: "comment-update",
                    validateGatewayResponseFunc: validateCommentFromGateway,
                    log,
                    maxFileSizeBytes: MAX_FILE_SIZE_BYTES_FOR_COMMENT_UPDATE,
                    timeoutMs: this._plebbit._timeouts["comment-update-ipfs"]
                });
                if (!commentUpdate) throw Error("Failed to load comment update from gateways. This is a critical logic error");
                if (commentUpdate.updatedAt > (this._comment.raw?.commentUpdate?.updatedAt || 0))
                    return { commentUpdate, commentUpdateIpfsPath: path };
                else return undefined;
            } catch (e) {
                // We need to find out if it's loading error, and if it is we just move on to the next timestamp range
                // If it's a schema or signature error we should stop and throw
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(<PlebbitError>e)) {
                    attemptedPathsToLoadErrors[path] = <Error>e;
                    log.trace(`Failed to fetch CommentUpdate from path (${path}) from gateways. Trying the next timestamp range`);
                    continue;
                } else {
                    // non retriable error
                    // a problem with the record itself, bad signature/schema/etc
                    this._comment._invalidCommentUpdateMfsPaths.add(path);
                    throw e;
                }
            }
        }
        throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES", {
            timestampRanges,
            attemptedPathsToLoadErrors,
            commentCid: this._comment.cid
        });
    }

    _useLoadedCommentUpdateIfNewInfo(
        loadedCommentUpdate: NonNullable<NewCommentUpdate> | Pick<NonNullable<NewCommentUpdate>, "commentUpdate">,
        subplebbit: Pick<SubplebbitIpfsType, "signature">,
        log: Logger
    ) {
        if ((this._comment.raw.commentUpdate?.updatedAt || 0) < loadedCommentUpdate.commentUpdate.updatedAt) {
            log(`${this._comment.depth === 0 ? "Post" : "Reply"} (${this._comment.cid}) received a new CommentUpdate`);
            this._comment._initCommentUpdate(loadedCommentUpdate.commentUpdate, subplebbit);
            if ("commentUpdateIpfsPath" in loadedCommentUpdate)
                this._comment._commentUpdateIpfsPath = loadedCommentUpdate.commentUpdateIpfsPath;
            this._comment._changeCommentStateEmitEventEmitStateChangeEvent({
                newUpdatingState: "succeeded",
                event: { name: "update", args: [this._comment] }
            });
            return true;
        } else return false;
    }

    async useSubplebbitPostUpdatesToFetchCommentUpdateForPost(subIpfs: SubplebbitIpfsType) {
        const log = Logger("plebbit-js:comment:useSubplebbitPostUpdatesToFetchCommentUpdate");
        if (!subIpfs.postUpdates) {
            throw new PlebbitError("ERR_SUBPLEBBIT_HAS_NO_POST_UPDATES", { subIpfs, postCid: this._comment.cid });
        }

        const postCid = this._comment.postCid;
        if (!postCid) throw Error("comment.postCid needs to be defined to fetch comment update");
        const postTimestamp = this._comment.timestamp;
        if (typeof postTimestamp !== "number") throw Error("Post timestamp is not defined by the time we're fetching from postUpdates");
        const timestampRanges = getPostUpdateTimestampRange(subIpfs.postUpdates, postTimestamp);
        if (timestampRanges.length === 0) throw Error("Post has no timestamp range bucket");

        let newCommentUpdate: NewCommentUpdate;
        try {
            if (
                Object.keys(this._plebbit.clients.kuboRpcClients).length > 0 ||
                Object.keys(this._plebbit.clients.libp2pJsClients).length > 0
            ) {
                newCommentUpdate = await this._fetchPostCommentUpdateIpfsP2P(subIpfs, timestampRanges, log);
            } else {
                newCommentUpdate = await this._fetchPostCommentUpdateFromGateways(subIpfs, timestampRanges, log);
            }
        } catch (e) {
            if (e instanceof Error) {
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(<PlebbitError>e)) {
                    // this is a retriable error
                    // could be problems loading from the network or gateways
                    log.trace(`Post`, this._comment.cid, "Failed to load CommentUpdate. Will retry later", e);
                    this._comment._changeCommentStateEmitEventEmitStateChangeEvent({
                        newUpdatingState: "waiting-retry",
                        event: { name: "error", args: [e] }
                    });
                } else {
                    // non retriable error, problem with schema/signature
                    log.error(
                        "Received a non retriable error when attempting to load post commentUpdate. Will be emitting error",
                        this._comment.cid!,
                        e
                    );
                    this._comment._changeCommentStateEmitEventEmitStateChangeEvent({
                        newUpdatingState: "failed",
                        event: { name: "error", args: [e] }
                    });
                }
            }
            return;
        }
        if (newCommentUpdate) {
            this._useLoadedCommentUpdateIfNewInfo(newCommentUpdate, subIpfs, log);
        } else if (newCommentUpdate === undefined) {
            log.trace(`Comment`, this._comment.cid, "loaded an old comment update. Ignoring it");
            this._comment._setUpdatingStateWithEmissionIfNewState("waiting-retry");
        }
    }

    private async _fetchRawCommentCidIpfsP2P(cid: string): Promise<string> {
        const kuboRpcOrHelia = this.getDefaultKuboRpcClientOrHelia();
        this._updateKuboRpcClientOrHeliaState("fetching-ipfs", kuboRpcOrHelia);
        let commentRawString: string;
        const commentTimeoutMs = this._plebbit._timeouts["comment-ipfs"];
        try {
            commentRawString = await this._fetchCidP2P(cid, { maxFileSizeBytes: 1024 * 1024, timeoutMs: commentTimeoutMs });
        } catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, commentCid: cid, commentTimeoutMs };
            throw e;
        } finally {
            this._updateKuboRpcClientOrHeliaState("stopped", kuboRpcOrHelia);
        }

        return commentRawString;
    }

    private async _fetchCommentIpfsFromGateways(parentCid: string): Promise<string> {
        // We only need to validate once, because with Comment Ipfs the fetchFromMultipleGateways already validates if the response is the same as its cid

        const log = Logger("plebbit-js:comment:client-manager:_fetchCommentIpfsFromGateways");
        const res = await this.fetchFromMultipleGateways({
            recordIpfsType: "ipfs",
            recordPlebbitType: "comment",
            root: parentCid,
            validateGatewayResponseFunc: async () => {},
            log,
            maxFileSizeBytes: 1024 * 1024,
            timeoutMs: this._plebbit._timeouts["comment-ipfs"]
        });
        return res.resText;
    }

    private async _throwIfCommentIpfsIsInvalid(commentIpfs: CommentIpfsType, commentCid: string) {
        // Can potentially throw if resolver if not working
        const verificationOpts = {
            comment: commentIpfs,
            resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
            clientsManager: this,
            calculatedCommentCid: commentCid,
            overrideAuthorAddressIfInvalid: true
        };
        const commentIpfsValidation = await verifyCommentIpfs(verificationOpts);
        if (!commentIpfsValidation.valid)
            throw new PlebbitError("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID", { commentIpfsValidation, verificationOpts });
    }

    // We're gonna fetch Comment Ipfs, and verify its signature and schema
    async fetchAndVerifyCommentCid(cid: string): Promise<CommentIpfsType> {
        let commentRawString: string;
        if (Object.keys(this._plebbit.clients.kuboRpcClients).length > 0 || Object.keys(this._plebbit.clients.libp2pJsClients).length > 0) {
            commentRawString = await this._fetchRawCommentCidIpfsP2P(cid);
        } else commentRawString = await this._fetchCommentIpfsFromGateways(cid);

        const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(commentRawString)); // could throw if schema is invalid
        await this._throwIfCommentIpfsIsInvalid(commentIpfs, cid);
        return commentIpfs;
    }

    protected _isPublishing() {
        return this._comment.state === "publishing";
    }

    _findCommentInPagesOfUpdatingCommentsOrSubplebbit(opts?: {
        sub?: RemoteSubplebbit;
        post?: Comment;
    }): PageIpfs["comments"][0] | undefined {
        // TODO rewrite this to use updating comments and subplebbit
        if (typeof this._comment.cid !== "string") throw Error("Need to have defined cid");
        const sub: RemoteSubplebbit | undefined =
            this._plebbit._startedSubplebbits[this._comment.subplebbitAddress] ||
            this._plebbit._updatingSubplebbits[this._comment.subplebbitAddress] ||
            opts?.sub;
        let updateFromSub: PageIpfs["comments"][0] | undefined;
        if (sub) updateFromSub = findCommentInPageInstanceRecursively(sub.posts, this._comment.cid);

        const post: Comment | undefined = this._comment.postCid ? this._plebbit._updatingComments[this._comment.postCid!] : opts?.post;
        let updateFromPost: PageIpfs["comments"][0] | undefined;
        if (post) updateFromPost = findCommentInPageInstanceRecursively(post.replies, this._comment.cid);

        let updateFromParent: PageIpfs["comments"][0] | undefined;
        if (this._comment.parentCid) {
            const parentCommentReplyPages: Comment["replies"] | undefined =
                this._plebbit._updatingComments[this._comment.parentCid]?.replies;
            updateFromParent = parentCommentReplyPages && findCommentInPageInstance(parentCommentReplyPages, this._comment.cid);
        }

        const updates: PageIpfs["comments"][0][] = [updateFromSub, updateFromPost, updateFromParent].filter((update) => !!update);
        const latestUpdate = updates.sort((a, b) => b.commentUpdate.updatedAt - a.commentUpdate.updatedAt)[0];
        return latestUpdate;
    }

    // will handling sub states down here
    // this is for posts with depth === 0
    override async handleUpdateEventFromSub(sub: RemoteSubplebbit) {
        const log = Logger("plebbit-js:comment:update");
        if (!this._comment.cid) {
            log("comment.cid is not defined because comment is publishing, waiting until cid is defined");
            return;
        }
        // a new update has been emitted by sub
        if (this._comment.state === "stopped") {
            // there are async cases where we fetch a SubplebbitUpdate in the background and stop() is called midway
            await this._comment.stop();
            return;
        }

        if (!sub.raw.subplebbitIpfs) throw Error("Subplebbit IPFS should be defined when an update is emitted");
        // let's try to find a CommentUpdate in subplebbit pages, or _updatingComments
        // this._subplebbitForUpdating!.subplebbit.raw.subplebbitIpfs?.posts.

        const postInUpdatingSubplebbit = this._findCommentInPagesOfUpdatingCommentsOrSubplebbit({ sub });

        if (
            postInUpdatingSubplebbit &&
            postInUpdatingSubplebbit.commentUpdate.updatedAt > (this._comment.raw?.commentUpdate?.updatedAt || 0)
        ) {
            const log = Logger("plebbit-js:comment:update:handleUpdateEventFromSub:find-comment-update-in-updating-sub-or-comments-pages");
            this._useLoadedCommentUpdateIfNewInfo({ commentUpdate: postInUpdatingSubplebbit.commentUpdate }, sub.raw.subplebbitIpfs, log);
        } else
            try {
                // this is only for posts with depth === 0
                await this.useSubplebbitPostUpdatesToFetchCommentUpdateForPost(sub.raw.subplebbitIpfs);
            } catch (e) {
                log.error("Failed to use subplebbit update to fetch new CommentUpdate", e);
                this._comment._changeCommentStateEmitEventEmitStateChangeEvent({
                    newUpdatingState: "failed",
                    event: { name: "error", args: [e as PlebbitError] }
                });
            }
    }

    _chooseWhichPagesBasedOnParentAndReplyTimestamp(parentCommentTimestamp: number): "old" | "new" {
        // Choose which page type to search first based on our reply's timestamp
        const replyTimestamp = this._comment.timestamp;
        const currentTime = Math.floor(Date.now() / 1000);

        // Calculate if our reply is relatively newer or older within the reply timeline
        // The reply timeline spans from parentComment timestamp to current time
        const replyTimelineSpan = currentTime - parentCommentTimestamp;

        // Ensure our reply timestamp is at least the parentComment timestamp
        const adjustedReplyTimestamp = Math.max(replyTimestamp, parentCommentTimestamp);

        // Calculate how far along the timeline our reply is (0 = oldest possible, 1 = newest possible)
        const replyRelativeAge = (currentTime - adjustedReplyTimestamp) / replyTimelineSpan;

        // If replyRelativeAge is closer to 0, the reply is newer (less age)
        // If replyRelativeAge is closer to 1, the reply is older (more age)
        // So we start with 'new' pages if replyRelativeAge < 0.5
        const startWithNewPages = replyRelativeAge < 0.5;
        return startWithNewPages ? "new" : "old";
    }

    async usePageCidsOfParentToFetchCommentUpdateForReply(postCommentInstance: Comment) {
        const log = Logger("plebbit-js:comment:update:usePageCidsOfParentToFetchCommentUpdateForReply");
        if (!this._comment.cid) throw Error("comment.cid needs to be defined to fetch comment update of reply");
        if (!this._comment.parentCid) throw Error("comment.parentCid needs to be defined to fetch comment update of reply");
        const subplebbitWithSignature = <Required<Pick<RemoteSubplebbit, "signature">>>postCommentInstance.replies._subplebbit;
        if (!subplebbitWithSignature.signature)
            throw Error("comment.replies._subplebbit.signature needs to be defined to fetch comment update of reply");
        const parentCommentInstance =
            postCommentInstance.cid === this._comment.parentCid
                ? postCommentInstance
                : await this._plebbit.createComment({ cid: this._comment.parentCid });
        let startedUpdatingParentComment = false;
        if (parentCommentInstance.state === "stopped") {
            await parentCommentInstance.update();
            startedUpdatingParentComment = true;
        }
        await resolveWhenPredicateIsTrue(parentCommentInstance, () => typeof parentCommentInstance.updatedAt === "number");
        if (startedUpdatingParentComment) await parentCommentInstance.stop();
        if (Object.keys(parentCommentInstance.replies.pageCids).length === 0) {
            log(
                "Parent comment",
                this._comment.parentCid,
                "of reply",
                this._comment.cid,
                "does not have any pageCids, will wait until another update event by post"
            );
            this._comment._setUpdatingStateWithEmissionIfNewState("waiting-retry");
            return;
        }
        const pageSortName = this._chooseWhichPagesBasedOnParentAndReplyTimestamp(parentCommentInstance.timestamp);

        let curPageCid: string | undefined = parentCommentInstance.replies.pageCids[pageSortName];
        if (!curPageCid) throw Error("Parent comment does not have any new or old pages");

        if (this._parentFirstPageCidsAlreadyLoaded.has(curPageCid)) {
            log(`Reply`, this._comment.cid, `:SKIPPING: Page CID ${curPageCid} already loaded parent page cid`);
            // we already loaded this page before and have its comment update, no need to do anything
            return;
        }

        this._comment._setUpdatingStateWithEmissionIfNewState("fetching-update-ipfs");
        let newCommentUpdate: PageIpfs["comments"][0] | undefined;
        const pageCidsSearchedForNewUpdate: string[] = [];
        while (curPageCid && !newCommentUpdate) {
            // TODO can optimize this by using _loadedUniqueCommentFromGetPage
            // TODO need to use _findCommentInPagesOfUpdatingCommentsOrSubplebbit
            const pageLoaded = await parentCommentInstance.replies.getPage(curPageCid); // should update _loadedUniqueCommentFromGetPage
            if (pageCidsSearchedForNewUpdate.length === 0) this._parentCommentCidsAlreadyLoaded.add(curPageCid);
            pageCidsSearchedForNewUpdate.push(curPageCid);
            const replyWithinParentPage = findCommentInParsedPages(pageLoaded, this._comment.cid)?.raw;
            const replyWithinUpdatingPages = this._findCommentInPagesOfUpdatingCommentsOrSubplebbit({ post: parentCommentInstance });

            if (replyWithinParentPage) {
                const isNewUpdate = replyWithinParentPage.commentUpdate.updatedAt > (this._comment.raw?.commentUpdate?.updatedAt || 0);
                if (isNewUpdate) {
                    newCommentUpdate = replyWithinParentPage;
                }
                break; // if we found the comment in parent pages, there's no point in continuing to look for it in updating pages
            } else if (replyWithinUpdatingPages) {
                const isNewUpdate = replyWithinUpdatingPages.commentUpdate.updatedAt > (this._comment.raw?.commentUpdate?.updatedAt || 0);
                if (isNewUpdate) newCommentUpdate = replyWithinUpdatingPages;
            }

            curPageCid = pageLoaded.nextCid;
        }
        log(
            "Searched for new comment update of comment",
            this._comment.cid,
            "in the following pageCids of page sort",
            pageSortName,
            "of parent comment:",
            parentCommentInstance.cid,
            pageCidsSearchedForNewUpdate,
            "and found",
            newCommentUpdate ? "a new comment update" : "no new comment update"
        );
        if (newCommentUpdate)
            this._useLoadedCommentUpdateIfNewInfo({ commentUpdate: newCommentUpdate.commentUpdate }, subplebbitWithSignature, log);
        else
            throw new PlebbitError("ERR_FAILED_TO_FIND_REPLY_COMMENT_UPDATE_WITHIN_PARENT_COMMENT_PAGE_CIDS", {
                replyCid: this._comment.cid,
                parentCommentCid: parentCommentInstance.cid,
                pageSortName,
                pageCidsSearchedForNewUpdate
            });
    }

    override async handleErrorEventFromSub(error: PlebbitError | Error) {
        // we received a non retriable error from sub instance
        if (this._comment.state === "publishing") return super.handleErrorEventFromSub(error);
        else if (this._subplebbitForUpdating?.subplebbit?.updatingState === "failed") {
            // let's make sure
            // we're updating a comment
            const log = Logger("plebbit-js:comment:update");
            log.error(
                this._comment.depth === 0 ? "Post" : "Reply",
                this._comment.cid,
                "received a non retriable error from its subplebbit instance. Will stop comment updating",
                error
            );
            this._comment._changeCommentStateEmitEventEmitStateChangeEvent({
                newUpdatingState: "failed",
                event: { name: "error", args: [error] }
            });
            await this._comment.stop();
        }
    }

    override handleIpfsGatewaySubplebbitState(
        subplebbitNewGatewayState: RemoteSubplebbit["clients"]["ipfsGateways"][string]["state"],
        gatewayUrl: string
    ) {
        if (this._comment.state === "publishing") return super.handleIpfsGatewaySubplebbitState(subplebbitNewGatewayState, gatewayUrl);
        // we're updating
        else if (subplebbitNewGatewayState === "fetching-ipns") this.updateGatewayState("fetching-subplebbit-ipns", gatewayUrl);
    }

    _translateSubUpdatingStateToCommentUpdatingState(newSubUpdatingState: RemoteSubplebbit["updatingState"]) {
        const subUpdatingStateToCommentUpdatingState: Record<typeof newSubUpdatingState, Comment["updatingState"] | undefined> = {
            failed: "failed",
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            "fetching-ipns": "fetching-subplebbit-ipns",
            "resolving-address": "resolving-subplebbit-address",
            "waiting-retry": "waiting-retry",
            stopped: "stopped",
            succeeded: undefined,
            "publishing-ipns": undefined
        };
        const translatedCommentUpdatingState = subUpdatingStateToCommentUpdatingState[newSubUpdatingState];
        if (translatedCommentUpdatingState) this._comment._setUpdatingStateWithEmissionIfNewState(translatedCommentUpdatingState);
    }

    override handleUpdatingStateChangeEventFromSub(newSubUpdatingState: RemoteSubplebbit["updatingState"]) {
        if (this._comment.state === "publishing") return super.handleUpdatingStateChangeEventFromSub(newSubUpdatingState);

        this._translateSubUpdatingStateToCommentUpdatingState(newSubUpdatingState);
    }

    handleErrorEventFromPost(error: PlebbitError | Error) {
        this._comment.emit("error", error);
    }

    handleUpdatingStateChangeEventFromPost(newState: Comment["updatingState"]) {
        const postUpdatingStateToReplyUpdatingState: Record<Comment["updatingState"], Comment["updatingState"] | undefined> = {
            failed: "failed",
            "fetching-subplebbit-ipfs": "fetching-subplebbit-ipfs",
            "fetching-subplebbit-ipns": "fetching-subplebbit-ipns",
            "resolving-subplebbit-address": "resolving-subplebbit-address",
            "waiting-retry": "waiting-retry",
            stopped: undefined,
            succeeded: undefined,
            "fetching-ipfs": undefined,
            "resolving-author-address": undefined,
            "fetching-update-ipfs": undefined
        };
        const replyState = postUpdatingStateToReplyUpdatingState[newState];
        if (replyState) {
            if (this._fetchingUpdateForReplyUsingPageCidsPromise)
                this._fetchingUpdateForReplyUsingPageCidsPromise.then(() =>
                    this._comment._setUpdatingStateWithEmissionIfNewState(replyState)
                );
            else this._comment._setUpdatingStateWithEmissionIfNewState(replyState);
        }
    }

    _handleIpfsGatewayPostState(newState: Comment["clients"]["ipfsGateways"][string]["state"], gatewayUrl: string) {
        this.updateGatewayState(newState, gatewayUrl);
    }

    _handleKuboRpcPostState(newState: Comment["clients"]["kuboRpcClients"][string]["state"], kuboRpcUrl: string) {
        this.updateKuboRpcState(newState, kuboRpcUrl);
    }

    _handleLibp2pJsClientPostState(newState: Comment["clients"]["libp2pJsClients"][string]["state"], libp2pJsClientKey: string) {
        this.updateLibp2pJsClientState(newState, libp2pJsClientKey);
    }

    _handleChainProviderPostState(
        newState: Comment["clients"]["chainProviders"][ChainTicker][string]["state"],
        chainTicker: ChainTicker,
        providerUrl: string
    ) {
        this.updateChainProviderState(newState, chainTicker, providerUrl);
    }

    async handleUpdateEventFromPostToFetchReplyCommentUpdate(postInstance: Comment) {
        if (!this._comment.cid) throw Error("comment.cid should be defined");
        const log = Logger("plebbit-js:comment:update:handleUpdateEventFromPost");
        if (Object.keys(postInstance.replies.pageCids).length === 0 && Object.keys(postInstance.replies.pages).length === 0) {
            log(
                "Post",
                postInstance.cid,
                "has no replies, therefore reply",
                this._comment.cid,
                "will wait until another update event by post"
            );
            this._comment._setUpdatingStateWithEmissionIfNewState("waiting-retry");
            return;
        }
        const replyInPage = this._findCommentInPagesOfUpdatingCommentsOrSubplebbit({ post: postInstance });

        const repliesSubplebbit = <Pick<SubplebbitIpfsType, "signature" | "address">>postInstance.replies._subplebbit;
        if (!repliesSubplebbit.signature) throw Error("repliesSubplebbit.signature needs to be defined to fetch comment update of reply");
        if (replyInPage && replyInPage.commentUpdate.updatedAt > (this._comment.raw?.commentUpdate?.updatedAt || 0)) {
            const log = Logger(
                "plebbit-js:comment:update:handleUpdateEventFromPostToFetchReplyCommentUpdate:find-comment-update-in-updating-sub-or-comments-pages"
            );
            this._useLoadedCommentUpdateIfNewInfo({ commentUpdate: replyInPage.commentUpdate }, repliesSubplebbit, log);
            return; // we found an update from pages, no need to do anything else
        }

        if (this._fetchingUpdateForReplyUsingPageCidsPromise) await this._fetchingUpdateForReplyUsingPageCidsPromise;

        this._fetchingUpdateForReplyUsingPageCidsPromise = this.usePageCidsOfParentToFetchCommentUpdateForReply(postInstance)
            .catch((error) => {
                log.error("Failed to fetch reply commentUpdate update from parent pages", error);
                this._comment._changeCommentStateEmitEventEmitStateChangeEvent({
                    newUpdatingState: "failed",
                    event: { name: "error", args: [error as PlebbitError | Error] }
                });
            })
            .finally(() => {
                this._fetchingUpdateForReplyUsingPageCidsPromise = undefined;
            });
        await this._fetchingUpdateForReplyUsingPageCidsPromise;
        this._fetchingUpdateForReplyUsingPageCidsPromise = undefined;
    }

    async _createPostInstanceWithStateTranslation(): Promise<CommentClientsManager["_postForUpdating"]> {
        // this function will be for translating between the states of the post and its clients to reply states
        if (!this._comment.postCid) throw Error("comment.postCid needs to be defined to fetch comment update of reply");
        const post =
            this._plebbit._updatingComments[this._comment.postCid] || (await this._plebbit.createComment({ cid: this._comment.postCid }));

        this._postForUpdating = {
            comment: post,
            error: this.handleErrorEventFromPost.bind(this),
            update: this.handleUpdateEventFromPostToFetchReplyCommentUpdate.bind(this),
            updatingstatechange: this.handleUpdatingStateChangeEventFromPost.bind(this)
        };

        if (
            this._postForUpdating.comment.clients.ipfsGateways &&
            Object.keys(this._postForUpdating.comment.clients.ipfsGateways).length > 0
        ) {
            // we're using gateways
            const ipfsGatewayListeners: (typeof this._postForUpdating)["ipfsGatewayListeners"] = {};

            for (const gatewayUrl of Object.keys(this._postForUpdating.comment.clients.ipfsGateways)) {
                const ipfsStateListener = (postNewIpfsState: Comment["clients"]["ipfsGateways"][string]["state"]) =>
                    this._handleIpfsGatewayPostState(postNewIpfsState, gatewayUrl);

                this._postForUpdating.comment.clients.ipfsGateways[gatewayUrl].on("statechange", ipfsStateListener);
                ipfsGatewayListeners[gatewayUrl] = ipfsStateListener;
            }
            this._postForUpdating.ipfsGatewayListeners = ipfsGatewayListeners;
        }

        // Add Kubo RPC client state listeners
        if (
            this._postForUpdating.comment.clients.kuboRpcClients &&
            Object.keys(this._postForUpdating.comment.clients.kuboRpcClients).length > 0
        ) {
            const kuboRpcListeners: Record<string, Parameters<Comment["clients"]["kuboRpcClients"][string]["on"]>[1]> = {};

            for (const kuboRpcUrl of Object.keys(this._postForUpdating.comment.clients.kuboRpcClients)) {
                const kuboRpcStateListener = (postNewKuboRpcState: Comment["clients"]["kuboRpcClients"][string]["state"]) =>
                    this._handleKuboRpcPostState(postNewKuboRpcState, kuboRpcUrl);

                this._postForUpdating.comment.clients.kuboRpcClients[kuboRpcUrl].on("statechange", kuboRpcStateListener);
                kuboRpcListeners[kuboRpcUrl] = kuboRpcStateListener;
            }
            this._postForUpdating.kuboRpcListeners = kuboRpcListeners;
        }

        if (
            this._postForUpdating.comment.clients.libp2pJsClients &&
            Object.keys(this._postForUpdating.comment.clients.libp2pJsClients).length > 0
        ) {
            const libp2pJsClientListeners: Record<string, Parameters<Comment["clients"]["libp2pJsClients"][string]["on"]>[1]> = {};

            for (const libp2pJsClientKey of Object.keys(this._postForUpdating.comment.clients.libp2pJsClients)) {
                const libp2pJsStateListener = (postNewLibp2pJsState: Comment["clients"]["libp2pJsClients"][string]["state"]) =>
                    this._handleLibp2pJsClientPostState(postNewLibp2pJsState, libp2pJsClientKey);

                this._postForUpdating.comment.clients.libp2pJsClients[libp2pJsClientKey].on("statechange", libp2pJsStateListener);
                libp2pJsClientListeners[libp2pJsClientKey] = libp2pJsStateListener;
            }
            this._postForUpdating.libp2pJsClientListeners = libp2pJsClientListeners;
        }

        // Add chain provider state listeners
        const chainProviderListeners: Record<
            ChainTicker,
            Record<string, Parameters<Comment["clients"]["chainProviders"][ChainTicker][string]["on"]>[1]>
        > = {};

        for (const chainTicker of Object.keys(this._postForUpdating.comment.clients.chainProviders) as ChainTicker[]) {
            chainProviderListeners[chainTicker] = {};

            for (const providerUrl of Object.keys(this._postForUpdating.comment.clients.chainProviders[chainTicker])) {
                const chainStateListener = (postNewChainState: Comment["clients"]["chainProviders"][ChainTicker][string]["state"]) =>
                    this._handleChainProviderPostState(postNewChainState, chainTicker, providerUrl);

                this._postForUpdating.comment.clients.chainProviders[chainTicker][providerUrl].on("statechange", chainStateListener);
                chainProviderListeners[chainTicker][providerUrl] = chainStateListener;
            }
        }

        this._postForUpdating.chainProviderListeners = chainProviderListeners;

        this._postForUpdating.comment.on("update", this._postForUpdating.update);

        this._postForUpdating.comment.on("updatingstatechange", this._postForUpdating.updatingstatechange);

        this._postForUpdating.comment.on("error", this._postForUpdating.error);
        return this._postForUpdating;
    }

    async cleanUpUpdatingPostInstance() {
        if (!this._postForUpdating) return; // it has been cleared out somewhere else

        // Clean up IPFS Gateway listeners
        if (this._postForUpdating.ipfsGatewayListeners) {
            for (const gatewayUrl of Object.keys(this._postForUpdating.ipfsGatewayListeners)) {
                this._postForUpdating.comment.clients.ipfsGateways[gatewayUrl].removeListener(
                    "statechange",
                    this._postForUpdating.ipfsGatewayListeners[gatewayUrl]
                );
                this.updateGatewayState("stopped", gatewayUrl); // need to reset all gateway states
            }
        }

        // Clean up Kubo RPC listeners
        if (this._postForUpdating.kuboRpcListeners) {
            for (const kuboRpcUrl of Object.keys(this._postForUpdating.kuboRpcListeners)) {
                this._postForUpdating.comment.clients.kuboRpcClients[kuboRpcUrl].removeListener(
                    "statechange",
                    this._postForUpdating.kuboRpcListeners[kuboRpcUrl]
                );
                this.updateKuboRpcState("stopped", kuboRpcUrl); // need to reset all Kubo RPC states
            }
        }

        // Clean up libp2pJs client listeners
        if (this._postForUpdating.libp2pJsClientListeners) {
            for (const libp2pJsClientKey of Object.keys(this._postForUpdating.libp2pJsClientListeners)) {
                this._postForUpdating.comment.clients.libp2pJsClients[libp2pJsClientKey].removeListener(
                    "statechange",
                    this._postForUpdating.libp2pJsClientListeners[libp2pJsClientKey]
                );
                this.updateLibp2pJsClientState("stopped", libp2pJsClientKey); // need to reset all libp2pJs client states
            }
        }

        // Clean up chain provider listeners
        if (this._postForUpdating.chainProviderListeners) {
            for (const chainTicker of Object.keys(this._postForUpdating.chainProviderListeners) as ChainTicker[]) {
                for (const providerUrl of Object.keys(this._postForUpdating.chainProviderListeners[chainTicker])) {
                    this._postForUpdating.comment.clients.chainProviders[chainTicker][providerUrl].removeListener(
                        "statechange",
                        this._postForUpdating.chainProviderListeners[chainTicker][providerUrl]
                    );
                    this.updateChainProviderState("stopped", chainTicker, providerUrl); // need to reset all chain provider states
                }
            }
        }

        // Remove update event at the end
        this._postForUpdating.comment.removeListener("updatingstatechange", this._postForUpdating.updatingstatechange);
        this._postForUpdating.comment.removeListener("error", this._postForUpdating.error);
        this._postForUpdating.comment.removeListener("update", this._postForUpdating.update);

        // only stop if it's mirroring the actual comment instance updating at plebbit._updatingComments
        if (this._postForUpdating.comment._updatingCommentInstance) await this._postForUpdating.comment.stop();
        this._parentFirstPageCidsAlreadyLoaded.clear();
        this._postForUpdating = undefined;
    }
}
