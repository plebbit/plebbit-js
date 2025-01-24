import { CachedTextRecordResolve, OptionsToLoadFromGateway } from "../../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../../clients/chain-provider-client.js";
import { ResultOfFetchingSubplebbit } from "../../clients/client-manager.js";
import { CommentIpfsClient } from "../../clients/ipfs-client.js";
import { CommentIpfsGatewayClient } from "../../clients/ipfs-gateway-client.js";
import { PublicationPubsubClient } from "../../clients/pubsub-client.js";
import { CommentPlebbitRpcStateClient } from "../../clients/rpc-client/plebbit-rpc-state-client.js";
import { PageIpfs } from "../../pages/types.js";
import { SubplebbitIpfsType } from "../../subplebbit/types.js";
import { ChainTicker } from "../../types.js";
import { Comment } from "./comment.js";
import * as remeda from "remeda";
import { commentPostUpdatesParentsPathConfig, postTimestampConfig } from "../../constants.js";

import { CommentIpfsType, CommentUpdateType } from "./types.js";
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

type NewCommentUpdate =
    | { commentUpdate: CommentUpdateType; commentUpdateIpfsPath: NonNullable<Comment["_commentUpdateIpfsPath"]> }
    | undefined;
export class CommentClientsManager extends PublicationClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: CommentIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment: Comment;

    constructor(comment: Comment) {
        super(comment);
        this._comment = comment;
    }

    protected override _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new CommentIpfsClient("stopped") };
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
        const attemptedPaths: string[] = [];
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
            attemptedPaths.push(path);
            this.updateIpfsState("fetching-update-ipfs");
            let res: string;
            try {
                res = await this._fetchCidP2P(path);
            } catch (e) {
                log.trace(`Failed to fetch CommentUpdate from path (${path}) with IPFS P2P. Trying the next timestamp range`);
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
                throw e;
            }
        }
        throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES", {
            timestampRanges,
            attemptedPaths,
            commentCid: this._comment.cid
        });
    }

    _shouldWeFetchCommentUpdateFromNextTimestamp(err: PlebbitError): boolean {
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
        const attemptedPaths: string[] = [];

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

            attemptedPaths.push(path);

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
                    log.trace(`Failed to fetch CommentUpdate from path (${path}) from gateways. Trying the next timestamp range`);
                    continue;
                } else {
                    // non retriable error
                    this._comment._invalidCommentUpdateMfsPaths.push(path);
                    throw e;
                }
            }
        }
        throw new PlebbitError("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_ALL_POST_UPDATES_RANGES", {
            timestampRanges,
            attemptedPaths,
            commentCid: this._comment.cid
        });
    }

    async useSubplebbitUpdateToFetchCommentUpdate(subIpns: SubplebbitIpfsType) {
        const log = Logger("plebbit-js:comment:useSubplebbitUpdateToFetchCommentUpdate");
        if (!subIpns) throw Error("Failed to fetch the subplebbit to start the comment update process");

        const parentsPostUpdatePath = this._comment._commentUpdateIpfsPath
            ? this._comment._commentUpdateIpfsPath.replace("/update", "").split("/").slice(1).join("/") // not super sure about this expression
            : await this._getParentsPath(subIpns);
        const postCid = this._comment.postCid;
        if (!postCid) throw Error("comment.postCid needs to be defined to fetch comment update");
        const postTimestamp = await (await this._plebbit._createStorageLRU(postTimestampConfig)).getItem(postCid);
        if (typeof postTimestamp !== "number") throw Error("Failed to fetch cached post timestamp");
        if (!subIpns.postUpdates) throw Error("Subplebbit IPNS record has no postUpdates field");
        const timestampRanges = getPostUpdateTimestampRange(subIpns.postUpdates, postTimestamp);
        if (timestampRanges.length === 0) throw Error("Post has no timestamp range bucket");
        this._comment._setUpdatingState("fetching-update-ipfs");

        let newCommentUpdate: NewCommentUpdate;
        try {
            if (this._defaultIpfsProviderUrl)
                newCommentUpdate = await this._fetchNewCommentUpdateIpfsP2P(subIpns, timestampRanges, parentsPostUpdatePath, log);
            else newCommentUpdate = await this._fetchCommentUpdateFromGateways(subIpns, timestampRanges, parentsPostUpdatePath, log);
        } catch (e) {
            this._comment._setUpdatingState("failed");
            this._comment.emit("error", <PlebbitError>e);
        }
        if (newCommentUpdate && (this._comment.updatedAt || 0) < newCommentUpdate.commentUpdate.updatedAt) {
            log(`Comment (${this._comment.cid}) received a new CommentUpdate`);
            this._comment._initCommentUpdate(newCommentUpdate.commentUpdate);
            this._comment._commentUpdateIpfsPath = newCommentUpdate.commentUpdateIpfsPath;
            this._comment._setUpdatingState("succeeded");
            this._comment.emit("update", this._comment);
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

    override updateIpfsState(newState: CommentIpfsClient["state"]) {
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

    protected override preFetchSubplebbitIpns(subIpnsName: string) {
        if (this._isPublishing()) this._comment._updatePublishingState("fetching-subplebbit-ipns");
        else this._comment._setUpdatingState("fetching-subplebbit-ipns");
    }

    protected override preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }

    protected override postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        if (this._isPublishing()) this._comment._updatePublishingState("fetching-subplebbit-ipfs");
        else this._comment._setUpdatingState("fetching-subplebbit-ipfs");
    }

    protected override postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void {
        this.updateIpfsState("stopped");
        if (this._isPublishing()) {
            this._comment._updatePublishingState("failed");
        } else this._comment._setUpdatingState("failed");
        this._comment.emit("error", err);
        throw err;
    }

    protected override postFetchSubplebbitStringJsonP2PSuccess() {
        // If we're updating, then no it shouldn't be stopped cause we're gonna load comment-update after
        if (this._isPublishing()) this.updateIpfsState("stopped");
    }

    protected override postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void {
        return this.postResolveSubplebbitIpnsP2PFailure(subIpnsName, err);
    }

    protected override postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit) {}

    protected override postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void {
        // are we updating or publishing?
        if (this._isPublishing()) {
            // we're publishing
            this._comment._updatePublishingState("failed");
        } else {
            // we're updating
            this._comment._setUpdatingState("failed");
        }
        this._comment.emit("error", subError);
        throw subError;
    }

    override postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {
        // if we're fetching CommentUpdate, it shouldn't be "stopped" after fetching subplebbit-ipfs
        if (loadOpts.recordPlebbitType === "subplebbit" && !this._isPublishing()) return;
        else return super.postFetchGatewaySuccess(gatewayUrl, loadOpts);
    }
}
