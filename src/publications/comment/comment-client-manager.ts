import { CachedTextRecordResolve, OptionsToLoadFromGateway } from "../../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../../clients/chain-provider-client.js";
import { ResultOfFetchingSubplebbit } from "../../clients/client-manager.js";
import { CommentIpfsGatewayClient } from "../../clients/ipfs-gateway-client.js";
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
import { getPostUpdateTimestampRange } from "../../util.js";
import { PublicationClientsManager } from "../publication-client-manager.js";
import { CommentKuboRpcClient } from "../../clients/ipfs-client.js";
import { PublicationKuboPubsubClient } from "../../clients/pubsub-client.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";

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
        if (this._comment.state === "updating" && !staleCache) {
            if (txtRecordName === "subplebbit-address")
                this._comment._setUpdatingState("resolving-subplebbit-address"); // Resolving for Subplebbit
            else if (txtRecordName === "plebbit-author-address") this._comment._setUpdatingState("resolving-author-address"); // Resolving for CommentIpfs
        }
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
            try {
                const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(
                    parseJsonWithPlebbitErrorIfFails(await this._fetchCidP2P(parentCid))
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

    private _calculatePathForCommentUpdate(folderCid: string, parentsPostUpdatePath: string) {
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
            if (this._comment._invalidCommentUpdateMfsPaths.includes(path)) {
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
            try {
                res = await this._fetchCidP2P(path);
            } catch (e) {
                log.trace(`Failed to fetch CommentUpdate from path (${path}) with IPFS P2P. Trying the next timestamp range`);
                attemptedPathsToLoadErrors[path] = <Error>e;
                continue;
            } finally {
                this.updateIpfsState("stopped");
            }
            try {
                const commentUpdate = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res));
                await this._throwIfCommentUpdateHasInvalidSignature(commentUpdate);
                return { commentUpdate, commentUpdateIpfsPath: path };
            } catch (e) {
                // there's a problem with the record itself
                this._comment._invalidCommentUpdateMfsPaths.push(path);
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

    private async _throwIfCommentUpdateHasInvalidSignature(commentUpdate: CommentUpdateType) {
        if (!this._comment.cid) throw Error("Can't validate comment update when comment.cid is undefined");
        const commentIpfsProps = { cid: this._comment.cid, signature: this._comment.signature };
        const signatureValidity = await verifyCommentUpdate(
            commentUpdate,
            this._plebbit.resolveAuthorAddresses,
            this,
            this._comment.subplebbitAddress,
            commentIpfsProps,
            true
        );
        if (!signatureValidity.valid) {
            // TODO need to make sure comment.updatingState is set to failed
            // TODO also need to make sure an error is emitted
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", { signatureValidity, commentUpdate });
        }
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
            await this._throwIfCommentUpdateHasInvalidSignature(commentUpdateBeforeSignature);
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
            if (this._comment._invalidCommentUpdateMfsPaths.includes(path)) {
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
                    log
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
                    this._comment._invalidCommentUpdateMfsPaths.push(path);
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

    async useSubplebbitUpdateToFetchCommentUpdate(subIpns: SubplebbitIpfsType) {
        const log = Logger("plebbit-js:comment:useSubplebbitUpdateToFetchCommentUpdate");
        if (!subIpns) throw Error("Failed to fetch the subplebbit to start the comment update process");
        if (!subIpns.postUpdates) {
            log("Sub", subIpns.address, "has no postUpdates field. Will wait for next update for comment", this._comment.cid);
            return undefined;
        }

        const parentsPostUpdatePath = this._comment._commentUpdateIpfsPath
            ? this._comment._commentUpdateIpfsPath.replace("/update", "").split("/").slice(1).join("/")
            : await this._getParentsPath(subIpns);
        const postCid = this._comment.postCid;
        if (!postCid) throw Error("comment.postCid needs to be defined to fetch comment update");
        const postTimestamp = await (await this._plebbit._createStorageLRU(postTimestampConfig)).getItem(postCid);
        if (typeof postTimestamp !== "number") throw Error("Failed to fetch cached post timestamp");
        const timestampRanges = getPostUpdateTimestampRange(subIpns.postUpdates, postTimestamp);
        if (timestampRanges.length === 0) throw Error("Post has no timestamp range bucket");
        this._comment._setUpdatingState("fetching-update-ipfs");

        let newCommentUpdate: NewCommentUpdate;
        try {
            if (this._defaultIpfsProviderUrl)
                newCommentUpdate = await this._fetchNewCommentUpdateIpfsP2P(subIpns, timestampRanges, parentsPostUpdatePath, log);
            else newCommentUpdate = await this._fetchCommentUpdateFromGateways(subIpns, timestampRanges, parentsPostUpdatePath, log);
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
        if (newCommentUpdate && (this._comment._rawCommentUpdate?.updatedAt || 0) < newCommentUpdate.commentUpdate.updatedAt) {
            log(`Comment (${this._comment.cid}) received a new CommentUpdate`);
            this._comment._initCommentUpdate(newCommentUpdate.commentUpdate);
            this._comment._commentUpdateIpfsPath = newCommentUpdate.commentUpdateIpfsPath;
            this._comment._setUpdatingState("succeeded");
            this._comment.emit("update", this._comment);
        } else if (newCommentUpdate === undefined) {
            log.trace(`Comment`, this._comment.cid, "loaded an old comment update. Ignoring it");
            this._comment._setUpdatingState("waiting-retry");
            this._comment.emit("waiting-retry", new PlebbitError("ERR_COMMENT_RECEIVED_ALREADY_PROCESSED_COMMENT_UPDATE"));
        }
    }

    private async _fetchRawCommentCidIpfsP2P(cid: string): Promise<string> {
        this.updateIpfsState("fetching-ipfs");
        let commentRawString: string;
        try {
            commentRawString = await this._fetchCidP2P(cid);
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
            log
        });
        return res.resText;
    }

    private async _throwIfCommentIpfsIsInvalid(commentIpfs: CommentIpfsType) {
        // Can potentially throw if resolver if not working
        const commentIpfsValidation = await verifyCommentIpfs(commentIpfs, this._plebbit.resolveAuthorAddresses, this, true);
        if (!commentIpfsValidation.valid)
            throw new PlebbitError("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID", { commentIpfs, commentIpfsValidation });
    }

    // We're gonna fetch Comment Ipfs, and verify its signature and schema
    async fetchAndVerifyCommentCid(cid: string): Promise<CommentIpfsType> {
        let commentRawString: string;
        if (this._defaultIpfsProviderUrl) {
            commentRawString = await this._fetchRawCommentCidIpfsP2P(cid);
        } else commentRawString = await this._fetchCommentIpfsFromGateways(cid);

        const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(commentRawString)); // could throw if schema is invalid
        await this._throwIfCommentIpfsIsInvalid(commentIpfs);
        return commentIpfs;
    }

    override updateIpfsState(newState: CommentKuboRpcClient["state"]) {
        super.updateIpfsState(newState);
    }

    protected _isPublishing() {
        return this._comment.state === "publishing";
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ): void {
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl, staleCache);
        // TODO should check for regex of ipns eventually
        if (!resolvedTextRecord) {
            // need to check if publishing or updating
            if (this._isPublishing()) {
                this._comment._updatePublishingState("failed");
            } else this._comment._setUpdatingState("failed");
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._comment.emit("error", error);
            throw error;
        }
    }

    // will handling sub states down here
    override async handleUpdateEventFromSub() {
        // a new update has been emitted by sub
        if (this._comment.state === "stopped")
            await this._comment.stop(); // there are async cases where we fetch a SubplebbitUpdate in the background and stop() is called midway
        else await this.useSubplebbitUpdateToFetchCommentUpdate(this._subplebbitForUpdating!.subplebbit._rawSubplebbitIpfs!);
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
    _translateSubUpdatingStateToCommentGatewayState(newSubUpdatingState: RemoteSubplebbit["updatingState"]) {
        if (this._defaultIpfsProviderUrl) return;
        if (newSubUpdatingState === "waiting-retry" || newSubUpdatingState === "failed" || newSubUpdatingState === "stopped")
            for (const gatewayUrl of Object.keys(this.clients.ipfsGateways)) this.updateGatewayState("stopped", gatewayUrl);
    }

    override async handleUpdatingStateChangeEventFromSub(newSubUpdatingState: RemoteSubplebbit["updatingState"]) {
        if (this._comment.state === "publishing") return super.handleUpdatingStateChangeEventFromSub(newSubUpdatingState);

        this._translateSubUpdatingStateToCommentUpdatingState(newSubUpdatingState);
        this._translateSubUpdatingStateToCommentGatewayState(newSubUpdatingState);
        this._translateSubUpdatingStateToCommentKuboState(newSubUpdatingState);
    }
}
