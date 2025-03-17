import { CachedTextRecordResolve, OptionsToLoadFromGateway } from "../../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../../clients/chain-provider-client.js";
import { CommentPlebbitRpcStateClient } from "../../clients/rpc-client/plebbit-rpc-state-client.js";
import { PageIpfs } from "../../pages/types.js";
import type { SubplebbitIpfsType } from "../../subplebbit/types.js";
import type { ChainTicker } from "../../types.js";
import { Comment } from "./comment.js";
import * as remeda from "remeda";
import { commentPostUpdatesParentsPathConfig, postTimestampConfig } from "../../constants.js";

import type { CommentIpfsType, CommentUpdateType } from "./types.js";
import {
    parseCommentIpfsSchemaWithPlebbitErrorIfItFails,
    parseCommentUpdateSchemaWithPlebbitErrorIfItFails,
    parseJsonWithPlebbitErrorIfFails
} from "../../schema/schema-util.js";
import { FailedToFetchCommentUpdateFromGatewaysError, PlebbitError } from "../../plebbit-error.js";
import { verifyCommentIpfs, verifyCommentUpdate } from "../../signer/signatures.js";
import Logger from "@plebbit/plebbit-logger";
import { getPostUpdateTimestampRange, hideClassPrivateProps } from "../../util.js";
import { PublicationClientsManager } from "../publication-client-manager.js";
import { CommentKuboRpcClient } from "../../clients/ipfs-client.js";
import { PublicationKuboPubsubClient } from "../../clients/pubsub-client.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import { findCommentInPages, findCommentInPagesRecrusively } from "../../pages/util.js";
import { CommentIpfsGatewayClient } from "../../clients/ipfs-gateway-client.js";
import { measurePerformance } from "../../decorator-util.js";

type NewCommentUpdate =
    | { commentUpdate: CommentUpdateType; commentUpdateIpfsPath: NonNullable<Comment["_commentUpdateIpfsPath"]> }
    | undefined;
export class CommentClientsManager extends PublicationClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: CommentIpfsGatewayClient };
        kuboRpcClients: { [ipfsClientUrl: string]: CommentKuboRpcClient };
        pubsubKuboRpcClients: { [pubsubClientUrl: string]: PublicationKuboPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment: Comment;

    constructor(comment: Comment) {
        super(comment);
        this._comment = comment;
        hideClassPrivateProps(this);
    }

    protected override _initKuboRpcClients(): void {
        if (this._plebbit.clients.kuboRpcClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
                this.clients.kuboRpcClients = { ...this.clients.kuboRpcClients, [ipfsUrl]: new CommentKuboRpcClient("stopped") };
    }

    protected override _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new CommentPlebbitRpcStateClient("stopped") };
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
            this._comment._setUpdatingState("resolving-author-address"); // Resolving for CommentIpfs and author.address is a domain
    }

    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, commentCidToLookFor: string) {
        if (!subIpns.posts?.pages?.hot) return undefined; // try to use preloaded pages if possible
        const findInCommentAndChildren = (pageComment: PageIpfs["comments"][0]): PageIpfs["comments"][number] | undefined => {
            if (pageComment.commentUpdate.cid === commentCidToLookFor) return pageComment;
            if (!pageComment.commentUpdate.replies?.pages?.topAll) return undefined;
            for (const childComment of pageComment.commentUpdate.replies.pages.topAll.comments) {
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

    async _fetchParentCommentForCommentUpdate(
        parentCid: string
    ): Promise<{ comment: CommentIpfsType; commentUpdate: Pick<CommentUpdateType, "cid"> }> {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-update-ipfs");
            this._comment._setUpdatingState("fetching-update-ipfs");
            const commentTimeoutMs = this._plebbit._timeouts["comment-ipfs"];
            try {
                const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(
                    parseJsonWithPlebbitErrorIfFails(
                        await this._fetchCidP2P(parentCid, { maxFileSizeBytes: 1024 * 1024, timeoutMs: commentTimeoutMs })
                    )
                );
                return {
                    comment: commentIpfs,
                    commentUpdate: { cid: parentCid }
                };
            } finally {
                this.updateIpfsState("stopped");
            }
        } else {
            return { commentUpdate: { cid: parentCid }, comment: await this.fetchAndVerifyCommentCid(parentCid) };
        }
    }

    async _getParentsPath(subIpns: SubplebbitIpfsType): Promise<string> {
        const parentsPathCache = await this._plebbit._createStorageLRU(commentPostUpdatesParentsPathConfig);
        const commentCid = this._comment.cid;
        if (!commentCid) throw Error("Can't retrieve parent path without defined comment.cid");
        const pathCache: string | undefined = await parentsPathCache.getItem(commentCid);
        if (pathCache) return pathCache.split("/").reverse().join("/");

        const postTimestampCache = await this._plebbit._createStorageLRU(postTimestampConfig);
        if (this._comment.depth === 0) await postTimestampCache.setItem(commentCid, this._comment.timestamp);
        let parentCid = this._comment.parentCid;
        let reversedPath = `${this._comment.cid}`; // Path will be reversed here, `nestedReplyCid/replyCid/postCid`
        while (parentCid) {
            // should attempt to fetch cache here
            // Also should we set updatingState everytime we fetch a parent Comment?
            const parentPathCache: string = await parentsPathCache.getItem(parentCid);
            if (parentPathCache) {
                reversedPath += "/" + parentPathCache;
                break;
            } else {
                const parentInPageIpfs =
                    this._findCommentInSubplebbitPosts(subIpns, parentCid) || (await this._fetchParentCommentForCommentUpdate(parentCid));

                if (parentInPageIpfs.comment.depth === 0)
                    await postTimestampCache.setItem(parentInPageIpfs.commentUpdate.cid, parentInPageIpfs.comment.timestamp);

                reversedPath += `/${parentCid}`;
                parentCid = parentInPageIpfs.comment.parentCid;
            }
        }

        await parentsPathCache.setItem(commentCid, reversedPath);

        const finalParentsPath = reversedPath.split("/").reverse().join("/"); // will be postCid/replyCid/nestedReplyCid

        return finalParentsPath;
    }

    _calculatePathForCommentUpdate(folderCid: string, parentsPostUpdatePath: string) {
        return `${folderCid}/` + parentsPostUpdatePath + "/update";
    }

    async _fetchNewCommentUpdateIpfsP2P(
        subIpns: SubplebbitIpfsType,
        timestampRanges: string[],
        parentsPostUpdatePath: string,
        log: Logger
    ): Promise<NewCommentUpdate> {
        // only get new CommentUpdates
        // not interested in CommentUpdate we already fetched before
        const attemptedPathsToLoadErrors: Record<string, Error> = {};
        for (const timestampRange of timestampRanges) {
            const folderCid = subIpns.postUpdates![timestampRange];
            const path = this._calculatePathForCommentUpdate(folderCid, parentsPostUpdatePath);
            if (this._comment._commentUpdateIpfsPath) {
                const lastFolderCid = this._comment._commentUpdateIpfsPath.split("/")[0];
                if (folderCid === lastFolderCid) {
                    log(
                        "Comment",
                        this._comment.cid,
                        "calculated folder cid has already been used",
                        folderCid,
                        "will be skipping loading CommentUpdate"
                    );
                    return undefined;
                }
            }
            if (this._comment._invalidCommentUpdateMfsPaths.has(path)) {
                log(
                    "Comment",
                    this._comment.cid,
                    "calculated path is part of comment._invalidCommentUpdateMfsPaths",
                    path,
                    "will be skipping loading CommentUpdate"
                );
                return undefined;
            }
            this.updateIpfsState("fetching-update-ipfs");
            let res: string;
            const commentUpdateTimeoutMs = this._plebbit._timeouts["comment-update-ipfs"];
            try {
                res = await this._fetchCidP2P(path, { maxFileSizeBytes: 1024 * 1024, timeoutMs: commentUpdateTimeoutMs });
            } catch (e) {
                log.trace(`Failed to fetch CommentUpdate from path (${path}) with IPFS P2P. Trying the next timestamp range`);
                attemptedPathsToLoadErrors[path] = <Error>e;
                continue;
            } finally {
                this.updateIpfsState("stopped");
            }
            try {
                const commentUpdate = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res));
                await this._throwIfCommentUpdateHasInvalidSignature(commentUpdate, subIpns);
                return { commentUpdate, commentUpdateIpfsPath: path };
            } catch (e) {
                // there's a problem with the record itself
                this._comment._invalidCommentUpdateMfsPaths.add(path);
                if (e instanceof PlebbitError) e.details = { ...e.details, commentUpdatePath: path, commentCid: this._comment.cid };
                throw e;
            }
        }
        throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES", {
            timestampRanges,
            attemptedPathsToLoadErrors,
            commentCid: this._comment.cid
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
        if (!this._comment._rawCommentIpfs) throw Error("Can't validate comment update when CommentIpfs hasn't been loaded");
        if (!this._comment.cid) throw Error("can't validate comment update when cid is not defined");
        if (!this._comment.postCid) throw Error("can't validate comment update when postCid is not defined");
        const verifyOptions = {
            update: commentUpdate,
            resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
            clientsManager: this,
            subplebbit: subplebbitIpfs,
            comment: { ...this._comment._rawCommentIpfs, cid: this._comment.cid, postCid: this._comment.postCid },
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

    async _fetchCommentUpdateFromGateways(
        subIpns: SubplebbitIpfsType,
        timestampRanges: string[],
        parentsPostUpdatePath: string,
        log: Logger
    ): Promise<NewCommentUpdate> {
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

        for (const timestampRange of timestampRanges) {
            // We're validating schema and signature here for every gateway because it's not a regular cid whose content we can verify to match the cid

            const folderCid = subIpns.postUpdates![timestampRange];
            const path = this._calculatePathForCommentUpdate(folderCid, parentsPostUpdatePath);
            if (this._comment._commentUpdateIpfsPath) {
                const lastFolderCid = this._comment._commentUpdateIpfsPath.split("/")[0];
                if (folderCid === lastFolderCid) {
                    log(
                        "Comment",
                        this._comment.cid,
                        "calculated folder cid has already been used",
                        folderCid,
                        "will be skipping loading CommentUpdate"
                    );
                    return undefined;
                }
            }
            if (this._comment._invalidCommentUpdateMfsPaths.has(path)) {
                log(
                    "Comment",
                    this._comment.cid,
                    "calculated path is part of comment._invalidCommentUpdateMfsPaths",
                    path,
                    "will be skipping loading CommentUpdate"
                );
                return undefined;
            }

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
                    maxFileSizeBytes: 1024 * 1024,
                    timeoutMs: this._plebbit._timeouts["comment-update-ipfs"]
                });
                if (!commentUpdate) throw Error("Failed to load comment update from gateways. This is a critical logic error");
                return { commentUpdate, commentUpdateIpfsPath: path };
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
        subplebbit: SubplebbitIpfsType,
        log: Logger
    ) {
        if ((this._comment._rawCommentUpdate?.updatedAt || 0) < loadedCommentUpdate.commentUpdate.updatedAt) {
            log(`Comment (${this._comment.cid}) received a new CommentUpdate`);
            this._comment._initCommentUpdate(loadedCommentUpdate.commentUpdate, subplebbit);
            if ("commentUpdateIpfsPath" in loadedCommentUpdate)
                this._comment._commentUpdateIpfsPath = loadedCommentUpdate.commentUpdateIpfsPath;
            this._comment._setUpdatingState("succeeded");
            this._comment.emit("update", this._comment);
            return true;
        } else return false;
    }

    async useSubplebbitPostUpdatesToFetchCommentUpdate(subIpfs: SubplebbitIpfsType) {
        const log = Logger("plebbit-js:comment:useSubplebbitPostUpdatesToFetchCommentUpdate");
        if (!subIpfs) throw Error("Failed to fetch the subplebbit to start the comment update process from post updates");
        if (!subIpfs.postUpdates) {
            log("Sub", subIpfs.address, "has no postUpdates field. Will wait for next update for comment", this._comment.cid);
            this._comment._setUpdatingState("waiting-retry");
            this._comment.emit("waiting-retry", new PlebbitError("ERR_SUBPLEBBIT_HAS_NO_POST_UPDATES", { subIpfs }));
            return undefined;
        }

        const parentsPostUpdatePath = this._comment._commentUpdateIpfsPath
            ? this._comment._commentUpdateIpfsPath.replace("/update", "").split("/").slice(1).join("/")
            : await this._getParentsPath(subIpfs);
        const postCid = this._comment.postCid;
        if (!postCid) throw Error("comment.postCid needs to be defined to fetch comment update");
        const postTimestamp = await (await this._plebbit._createStorageLRU(postTimestampConfig)).getItem(postCid);
        if (typeof postTimestamp !== "number") throw Error("Failed to fetch cached post timestamp");
        const timestampRanges = getPostUpdateTimestampRange(subIpfs.postUpdates, postTimestamp);
        if (timestampRanges.length === 0) throw Error("Post has no timestamp range bucket");
        this._comment._setUpdatingState("fetching-update-ipfs");

        let newCommentUpdate: NewCommentUpdate;
        try {
            if (this._defaultIpfsProviderUrl)
                newCommentUpdate = await this._fetchNewCommentUpdateIpfsP2P(subIpfs, timestampRanges, parentsPostUpdatePath, log);
            else newCommentUpdate = await this._fetchCommentUpdateFromGateways(subIpfs, timestampRanges, parentsPostUpdatePath, log);
        } catch (e) {
            if (e instanceof Error) {
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(<PlebbitError>e)) {
                    // this is a retriable error
                    // could be problems loading from the network or gateways
                    log.trace(`Comment`, this._comment.cid, "Failed to load CommentUpdate. Will retry later", e);
                    this._comment._setUpdatingState("waiting-retry");
                    this._comment.emit("waiting-retry", e);
                } else {
                    // non retriable error, problem with schema/signature
                    log.error(
                        "Received a non retriable error when attempting to load commentUpdate. Will be emitting error",
                        this._comment.cid!,
                        e
                    );
                    this._comment._setUpdatingState("failed");
                    this._comment.emit("error", e);
                }
            }
            return;
        }
        if (newCommentUpdate) {
            this._useLoadedCommentUpdateIfNewInfo(newCommentUpdate, subIpfs, log);
        } else if (newCommentUpdate === undefined) {
            log.trace(`Comment`, this._comment.cid, "loaded an old comment update. Ignoring it");
            this._comment._setUpdatingState("waiting-retry");
            this._comment.emit("waiting-retry", new PlebbitError("ERR_COMMENT_RECEIVED_ALREADY_PROCESSED_COMMENT_UPDATE"));
        }
    }

    private async _fetchRawCommentCidIpfsP2P(cid: string): Promise<string> {
        this.updateIpfsState("fetching-ipfs");
        let commentRawString: string;
        const commentTimeoutMs = this._plebbit._timeouts["comment-ipfs"];
        try {
            commentRawString = await this._fetchCidP2P(cid, { maxFileSizeBytes: 1024 * 1024, timeoutMs: commentTimeoutMs });
        } catch (e) {
            throw e;
        } finally {
            this.updateIpfsState("stopped");
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
        if (this._defaultIpfsProviderUrl) {
            commentRawString = await this._fetchRawCommentCidIpfsP2P(cid);
        } else commentRawString = await this._fetchCommentIpfsFromGateways(cid);

        const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(commentRawString)); // could throw if schema is invalid
        await this._throwIfCommentIpfsIsInvalid(commentIpfs, cid);
        return commentIpfs;
    }

    override updateIpfsState(newState: CommentKuboRpcClient["state"]) {
        super.updateIpfsState(newState);
    }

    protected _isPublishing() {
        return this._comment.state === "publishing";
    }

    _findCommentInPagesOfUpdatingCommentsSubplebbit(subIpfs?: SubplebbitIpfsType): PageIpfs["comments"][0] | undefined {
        if (typeof this._comment.cid !== "string") throw Error("Need to have defined cid");
        const updatingSubplebbitPosts = (subIpfs || this._plebbit._updatingSubplebbits[this._comment.subplebbitAddress]?._rawSubplebbitIpfs)
            ?.posts;
        if (!updatingSubplebbitPosts) return undefined;

        if (this._comment.depth === 0 || this._comment.postCid === this._comment.cid)
            return findCommentInPages(updatingSubplebbitPosts, this._comment.cid);

        if (this._comment.parentCid) {
            const parentCommentReplyPages = this._plebbit._updatingComments[this._comment.parentCid]?._rawCommentUpdate?.replies;
            if (parentCommentReplyPages) return findCommentInPages(parentCommentReplyPages, this._comment.cid);
        }
        if (this._comment.postCid) {
            const postCommentReplyPages = this._plebbit._updatingComments[this._comment.postCid]?._rawCommentUpdate?.replies;

            if (postCommentReplyPages) return findCommentInPagesRecrusively(postCommentReplyPages, this._comment.cid, this._comment.depth);
        }

        // need to look for comment recursively in this._subplebbitForUpdating
        return findCommentInPagesRecrusively(updatingSubplebbitPosts, this._comment.cid, this._comment.depth);
    }

    // will handling sub states down here
    override async handleUpdateEventFromSub() {
        const log = Logger("plebbit-js:comment:update");
        // a new update has been emitted by sub
        if (this._comment.state === "stopped")
            await this._comment.stop(); // there are async cases where we fetch a SubplebbitUpdate in the background and stop() is called midway
        else if (this._comment.cid) {
            const subIpfs = this._subplebbitForUpdating?.subplebbit._rawSubplebbitIpfs;
            if (!subIpfs) throw Error("Sub IPFS should be defined when an update is emitted");
            // let's try to find a CommentUpdate in subplebbit pages, or _updatingComments
            // this._subplebbitForUpdating!.subplebbit._rawSubplebbitIpfs?.posts.
            try {
                const commentInPage = this._findCommentInPagesOfUpdatingCommentsSubplebbit(subIpfs);

                if (commentInPage) {
                    const log = Logger("plebbit-js:comment:update:find-comment-update-in-updating-sub-or-comments-pages");
                    const usedUpdateFromPage = this._useLoadedCommentUpdateIfNewInfo(
                        { commentUpdate: commentInPage.commentUpdate },
                        subIpfs,
                        log
                    );
                    if (usedUpdateFromPage) return; // we found an update from pages, no need to do anything else
                }
                // we didn't manage to find any update from pages, let's fetch an update from post updates
                await this.useSubplebbitPostUpdatesToFetchCommentUpdate(subIpfs);
            } catch (e) {
                log.error("Failed to use subplebbit update to fetch new CommentUpdate", e);
            }
        }
    }

    override async handleWaitingRetryEventFromSub(error: PlebbitError | Error) {
        // we received a waiting retry event from sub instance
        if (this._comment.state === "publishing") return super.handleWaitingRetryEventFromSub(error);
        // we're updating a comment
        this._comment._setUpdatingState("waiting-retry");
        this._comment.emit("waiting-retry", error);
    }

    override async handleErrorEventFromSub(error: PlebbitError | Error) {
        // we received a non retriable error from sub instance
        if (this._comment.state === "publishing") return super.handleErrorEventFromSub(error);
        else {
            // we're updating a comment
            const log = Logger("plebbit-js:comment:update");
            log.error(
                "Comment",
                this._comment.cid,
                "received a non retriable error from its subplebbit instance. Will stop comment updating",
                error
            );
            this._comment._setUpdatingState("failed");
            this._comment.emit("error", error);
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
        const subUpdatingStateToCommentUpdatingState: Partial<Record<typeof newSubUpdatingState, Comment["updatingState"]>> = {
            failed: "failed",
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            "fetching-ipns": "fetching-subplebbit-ipns",
            "resolving-address": "resolving-subplebbit-address"
        };
        const translatedCommentUpdatingState = subUpdatingStateToCommentUpdatingState[newSubUpdatingState];
        if (translatedCommentUpdatingState) this._comment._setUpdatingState(translatedCommentUpdatingState);
    }
    _translateSubUpdatingStateToCommentKuboState(newSubUpdatingState: RemoteSubplebbit["updatingState"]) {
        if (!this._defaultIpfsProviderUrl) return;

        const subUpdatingStateToCommentKuboState: Partial<
            Record<typeof newSubUpdatingState, Comment["clients"]["kuboRpcClients"][string]["state"]>
        > = {
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            "waiting-retry": "stopped",
            "fetching-ipns": "fetching-subplebbit-ipns",
            stopped: "stopped",
            failed: "stopped"
        };
        const translatedKuboState = subUpdatingStateToCommentKuboState[newSubUpdatingState];
        if (translatedKuboState) this.updateIpfsState(translatedKuboState);
    }

    override async handleUpdatingStateChangeEventFromSub(newSubUpdatingState: RemoteSubplebbit["updatingState"]) {
        if (this._comment.state === "publishing") return super.handleUpdatingStateChangeEventFromSub(newSubUpdatingState);

        this._translateSubUpdatingStateToCommentUpdatingState(newSubUpdatingState);
        this._translateSubUpdatingStateToCommentKuboState(newSubUpdatingState);
    }
}
