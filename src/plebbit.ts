import {
    BlockchainProvider,
    CommentEditType,
    CommentIpfsType,
    CommentType,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreatePublicationOptions,
    CreateSignerOptions,
    CreateSubplebbitOptions,
    CreateVoteOptions,
    NativeFunctions,
    PlebbitOptions,
    PostType,
    SignerType,
    SubplebbitType,
    VoteType
} from "./types";
import { getDefaultDataPath, mkdir, nativeFunctions } from "./runtime/node/util";
import { Comment } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import { fetchCid, loadIpfsFileAsJson, loadIpnsAsJson, removeKeysWithUndefinedValues, throwWithErrorCode, timestamp } from "./util";
import Vote from "./vote";
import { createSigner, Signer, verifyComment, verifySubplebbit } from "./signer";
import { Resolver } from "./resolver";
import TinyCache from "tinycache";
import { CommentEdit } from "./comment-edit";
import { getPlebbitAddressFromPrivateKeyPem } from "./signer/util";
import EventEmitter from "events";
import isIPFS from "is-ipfs";
import Logger from "@plebbit/plebbit-logger";
import env from "./version";
import lodash from "lodash";
import { signComment, signCommentEdit, signVote } from "./signer/signatures";

export class Plebbit extends EventEmitter implements PlebbitOptions {
    ipfsClient?: ReturnType<NativeFunctions["createIpfsClient"]>;
    pubsubIpfsClient: Pick<ReturnType<NativeFunctions["createIpfsClient"]>, "pubsub">;
    resolver: Resolver;
    _memCache: TinyCache;
    ipfsGatewayUrl: string;
    ipfsHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0] | string;
    pubsubHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0] | string;
    dataPath?: string;
    blockchainProviders?: { [chainTicker: string]: BlockchainProvider };
    resolveAuthorAddresses?: boolean;

    constructor(options: PlebbitOptions = {}) {
        super();
        this.ipfsHttpClientOptions = options.ipfsHttpClientOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = this.ipfsHttpClientOptions
            ? nativeFunctions.createIpfsClient(<Parameters<NativeFunctions["createIpfsClient"]>[0]>this.ipfsHttpClientOptions)
            : undefined;
        this.pubsubHttpClientOptions = options.pubsubHttpClientOptions || { url: "https://pubsubprovider.xyz/api/v0" };
        this.pubsubIpfsClient = options.pubsubHttpClientOptions
            ? nativeFunctions.createIpfsClient(<Parameters<NativeFunctions["createIpfsClient"]>[0]>options.pubsubHttpClientOptions)
            : this.ipfsClient
            ? this.ipfsClient
            : nativeFunctions.createIpfsClient(<Parameters<NativeFunctions["createIpfsClient"]>[0]>this.pubsubHttpClientOptions);
        this.blockchainProviders = options.blockchainProviders || {
            avax: {
                url: "https://api.avax.network/ext/bc/C/rpc",
                chainId: 43114
            },
            matic: {
                url: "https://polygon-rpc.com",
                chainId: 137
            }
        };
        this.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses") ? options.resolveAuthorAddresses : true;
        this._memCache = new TinyCache();
        this.resolver = new Resolver({
            plebbit: { _memCache: this._memCache, resolveAuthorAddresses: this.resolveAuthorAddresses },
            blockchainProviders: this.blockchainProviders
        });
        this.dataPath = options.dataPath || getDefaultDataPath();
    }

    async _init(options: PlebbitOptions) {
        const log = Logger("plebbit-js:plebbit:_init");

        if (this.dataPath) await mkdir(this.dataPath, { recursive: true });
        if (options["ipfsGatewayUrl"]) this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        else {
            try {
                let gatewayFromNode = await this.ipfsClient.config.get("Addresses.Gateway");
                if (Array.isArray(gatewayFromNode)) gatewayFromNode = gatewayFromNode[0];

                const splits = gatewayFromNode.toString().split("/");
                this.ipfsGatewayUrl = `http://${splits[2]}:${splits[4]}`;
                log.trace(`plebbit.ipfsGatewayUrl retrieved from IPFS node: ${this.ipfsGatewayUrl}`);
            } catch (e) {
                this.ipfsGatewayUrl = "https://cloudflare-ipfs.com";
                log(e, `\nFailed to retrieve gateway url from ipfs node, will default to ${this.ipfsGatewayUrl}`);
            }
        }
    }

    async getSubplebbit(subplebbitAddress: string): Promise<Subplebbit> {
        if (!this.resolver.isDomain(subplebbitAddress) && !isIPFS.cid(subplebbitAddress))
            throwWithErrorCode(
                "ERR_INVALID_SUBPLEBBIT_ADDRESS",
                `getSubplebbit: subplebbitAddress (${subplebbitAddress}) can't be used to get a subplebbit`
            );
        const resolvedSubplebbitAddress = await this.resolver.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
        const subplebbitJson: SubplebbitType = await loadIpnsAsJson(resolvedSubplebbitAddress, this);
        const signatureValidity = await verifySubplebbit(subplebbitJson, this);

        if (!signatureValidity.valid)
            throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", `getSubplebbit: Failed verification reason: ${signatureValidity.reason}`);

        return new Subplebbit(subplebbitJson, this);
    }

    async getComment(cid: string): Promise<Comment | Post> {
        if (!isIPFS.cid(cid)) throwWithErrorCode("ERR_CID_IS_INVALID", `getComment: cid (${cid}) is invalid as a CID`);
        const commentJson: CommentIpfsType = await loadIpfsFileAsJson(cid, this);
        const signatureValidity = await verifyComment(commentJson, this, true);
        if (!signatureValidity.valid)
            throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", `getComment: Failed verification reason: ${signatureValidity.reason}`);

        const title = commentJson.title;
        return typeof title === "string"
            ? new Post({ ...commentJson, cid, title, postCid: cid }, this)
            : new Comment({ ...commentJson, cid }, this);
    }

    private async _initMissingFields(pubOptions: CreatePublicationOptions & { signer: CreateCommentOptions["signer"] }, log: Logger) {
        const clonedOptions = lodash.clone(pubOptions);
        if (!clonedOptions.timestamp) {
            clonedOptions.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp, defaulting to (${clonedOptions.timestamp})`);
        }
        if (!(<SignerType>clonedOptions.signer).address)
            (<SignerType>clonedOptions.signer).address = await getPlebbitAddressFromPrivateKeyPem(clonedOptions.signer.privateKey);

        if (!clonedOptions?.author?.address) {
            clonedOptions.author = { ...clonedOptions.author, address: (<SignerType>clonedOptions.signer).address };
            log(`author.address was not provided, will define it to signer.address (${clonedOptions.author.address})`);
        }
        return clonedOptions;
    }

    async createComment(options: CreateCommentOptions | CommentType | PostType | Comment | Post): Promise<Comment | Post> {
        const log = Logger("plebbit-js:plebbit:createComment");

        if (!options.signer)
            return typeof options.title === "string" ? new Post(<PostType>options, this) : new Comment(<CommentType>options, this);

        //@ts-ignore
        const finalOptions = <CommentType>await this._initMissingFields(options, log);

        finalOptions.signature = await signComment(<CreateCommentOptions>finalOptions, finalOptions.signer, this);
        finalOptions.protocolVersion = env.PROTOCOL_VERSION;

        return typeof finalOptions.title === "string" ? new Post(<PostType>finalOptions, this) : new Comment(finalOptions, this);
    }

    _canRunSub(): boolean {
        try {
            //@ts-ignore
            nativeFunctions.createDbHandler({ address: "", plebbit: this });
            return true;
        } catch {}

        return false;
    }

    async createSubplebbit(options: CreateSubplebbitOptions | SubplebbitType = {}): Promise<Subplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        const canRunSub = this._canRunSub();

        const newSub = async () => {
            if (!canRunSub) throw Error("missing nativeFunctions required to create a subplebbit");
            if (canRunSub && !this.dataPath)
                throwWithErrorCode(
                    "ERR_DATA_PATH_IS_NOT_DEFINED",
                    `createSubplebbit: canRunSub=${canRunSub}, plebbitOptions.dataPath=${this.dataPath}`
                );

            const subplebbit = new Subplebbit(options, this);
            await subplebbit.prePublish(); // May fail because sub is already being created (locked)
            log(
                `Created subplebbit (${subplebbit.address}) with props:`,
                removeKeysWithUndefinedValues(lodash.omit(subplebbit.toJSON(), ["signer"]))
            );
            return subplebbit;
        };

        const remoteSub = async () => {
            return new Subplebbit(options, this);
        };

        if (options.address && !options.signer) {
            if (!canRunSub) return remoteSub();
            else {
                const dbHandler = nativeFunctions.createDbHandler({ address: options.address, plebbit: this });
                const subHasBeenCreatedBefore = (await this.listSubplebbits()).includes(options.address);
                if (subHasBeenCreatedBefore) return newSub();
                else if (await dbHandler.isSubCreationLocked())
                    throwWithErrorCode("ERR_SUB_CREATION_LOCKED", `subAddress=${options.address}`);
                else return remoteSub();
            }
        } else if (!options.address && !options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);
            else {
                options.signer = await this.createSigner();
                options.address = (<Signer>options.signer).address;
                log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.address})`);
                return newSub();
            }
        } else if (!options.address && options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);
            const signer = await this.createSigner(options.signer);
            options.address = signer.address;
            options.signer = signer;
            return newSub();
        } else if (!canRunSub) return remoteSub();
        else return newSub();
    }

    async createVote(options: CreateVoteOptions | VoteType): Promise<Vote> {
        const log = Logger("plebbit-js:plebbit:createVote");
        if (!options.signer) return new Vote(<VoteType>options, this);
        //@ts-ignore
        const finalOptions: VoteType = <VoteType>await this._initMissingFields(options, log);
        finalOptions.signature = await signVote(<CreateVoteOptions>finalOptions, finalOptions.signer, this);
        finalOptions.protocolVersion = env.PROTOCOL_VERSION;
        return new Vote(finalOptions, this);
    }

    async createCommentEdit(options: CreateCommentEditOptions | CommentEditType): Promise<CommentEdit> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");

        if (!options.signer) return new CommentEdit(<CommentEditType>options, this); // User just wants to instantiate a CommentEdit object, not publish
        //@ts-ignore
        const finalOptions: CommentEditType = <CommentEditType>await this._initMissingFields(options, log);
        finalOptions.signature = await signCommentEdit(<CreateCommentEditOptions>finalOptions, finalOptions.signer, this);
        finalOptions.protocolVersion = env.PROTOCOL_VERSION;
        return new CommentEdit(finalOptions, this);
    }

    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer> {
        return createSigner(createSignerOptions);
    }

    async listSubplebbits(): Promise<string[]> {
        const canRunSub = this._canRunSub();
        if (!canRunSub || !this.dataPath) return [];
        return nativeFunctions.listSubplebbits(this.dataPath);
    }

    async fetchCid(cid: string) {
        return fetchCid(cid, this);
    }
}
