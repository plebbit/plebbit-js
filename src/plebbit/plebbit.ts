import {
    getDefaultDataPath,
    listSubplebbits as nodeListSubplebbits,
    createIpfsClient,
    monitorSubplebbitsDirectory
} from "../runtime/node/util.js";
import type {
    StorageInterface,
    ChainProvider,
    GatewayClient,
    IpfsClient,
    PlebbitEvents,
    PubsubClient,
    ParsedPlebbitOptions,
    LRUStorageInterface,
    LRUStorageConstructor,
    PubsubSubscriptionHandler,
    InputPlebbitOptions,
    AuthorPubsubType
} from "../types.js";
import { Comment } from "../publications/comment/comment.js";
import { doesDomainAddressHaveCapitalLetter, hideClassPrivateProps, removeUndefinedValuesRecursively, timestamp } from "../util.js";
import Vote from "../publications/vote/vote.js";
import { createSigner } from "../signer/index.js";
import { CommentEdit } from "../publications/comment-edit/comment-edit.js";
import Logger from "@plebbit/plebbit-logger";
import env from "../version.js";
import { cleanUpBeforePublishing, signComment, signCommentEdit, signCommentModeration, signVote } from "../signer/signatures.js";
import { TypedEmitter } from "tiny-typed-emitter";
import Stats from "../stats.js";
import Storage from "../runtime/node/storage.js";
import { ClientsManager } from "../clients/client-manager.js";
import PlebbitRpcClient from "../clients/rpc-client/plebbit-rpc-client.js";
import { PlebbitError } from "../plebbit-error.js";
import { GenericPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import type {
    CreateInstanceOfLocalOrRemoteSubplebbitOptions,
    CreateNewLocalSubplebbitParsedOptions,
    CreateRemoteSubplebbitOptions,
    SubplebbitJson,
    SubplebbitIpfsType,
    RemoteSubplebbitJson,
    RpcRemoteSubplebbitJson
} from "../subplebbit/types.js";
import LRUStorage from "../runtime/node/lru-storage.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "../subplebbit/rpc-remote-subplebbit.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import pTimeout, { TimeoutError } from "p-timeout";
import * as remeda from "remeda";
import { z } from "zod";
import type { CreateSignerOptions } from "../signer/types.js";
import type {
    CommentEditOptionsToSign,
    CommentEditTypeJson,
    CreateCommentEditOptions,
    LocalCommentEditOptions
} from "../publications/comment-edit/types.js";
import { CreateCommentEditFunctionArgumentSchema } from "../publications/comment-edit/schema.js";
import type { CreateVoteOptions, LocalVoteOptions, VoteJson, VoteOptionsToSign } from "../publications/vote/types.js";
import { CreateVoteFunctionArgumentSchema } from "../publications/vote/schema.js";
import type {
    CommentIpfsType,
    CommentIpfsWithCidDefined,
    CommentJson,
    CommentOptionsToSign,
    CommentWithinPageJson,
    CreateCommentOptions,
    LocalCommentOptions
} from "../publications/comment/types.js";
import { CreateCommentFunctionArgumentsSchema } from "../publications/comment/schema.js";
import { AuthorAddressSchema, AuthorReservedFields, CidStringSchema, SubplebbitAddressSchema } from "../schema/schema.js";
import {
    CreateRemoteSubplebbitFunctionArgumentSchema,
    CreateSubplebbitFunctionArgumentsSchema,
    PubsubTopicSchema,
    SubplebbitIpfsSchema
} from "../subplebbit/schema.js";
import {
    parseCidStringSchemaWithPlebbitErrorIfItFails,
    parseCreateCommentEditFunctionArgumentSchemaWithPlebbitErrorIfItFails,
    parseCreateCommentFunctionArgumentsWithPlebbitErrorIfItFails,
    parseCreateCommentModerationFunctionArgumentSchemaWithPlebbitErrorIfItFails,
    parseCreateRemoteSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails,
    parseCreateSubplebbitFunctionArgumentsSchemaWithPlebbitErrorIfItFails,
    parseCreateVoteFunctionArgumentSchemaWithPlebbitErrorIfItFails,
    parsePlebbitUserOptionsSchemaWithPlebbitErrorIfItFails
} from "../schema/schema-util.js";
import { CommentModeration } from "../publications/comment-moderation/comment-moderation.js";
import type {
    CommentModerationOptionsToSign,
    CommentModerationTypeJson,
    CreateCommentModerationOptions,
    LocalCommentModerationAfterSigning
} from "../publications/comment-moderation/types.js";
import { CreateCommentModerationFunctionArgumentSchema } from "../publications/comment-moderation/schema.js";

export class Plebbit extends TypedEmitter<PlebbitEvents> implements ParsedPlebbitOptions {
    plebbitRpcClient?: PlebbitRpcClient;
    ipfsGatewayUrls: ParsedPlebbitOptions["ipfsGatewayUrls"];
    ipfsHttpClientsOptions?: ParsedPlebbitOptions["ipfsHttpClientsOptions"];
    pubsubHttpClientsOptions: ParsedPlebbitOptions["pubsubHttpClientsOptions"];
    plebbitRpcClientsOptions?: ParsedPlebbitOptions["plebbitRpcClientsOptions"];
    dataPath?: ParsedPlebbitOptions["dataPath"];
    browserLibp2pJsPublish: ParsedPlebbitOptions["browserLibp2pJsPublish"];
    resolveAuthorAddresses: ParsedPlebbitOptions["resolveAuthorAddresses"];
    chainProviders!: ParsedPlebbitOptions["chainProviders"];
    parsedPlebbitOptions: ParsedPlebbitOptions;
    publishInterval: ParsedPlebbitOptions["publishInterval"];
    updateInterval: ParsedPlebbitOptions["updateInterval"];
    noData: ParsedPlebbitOptions["noData"];
    userAgent: ParsedPlebbitOptions["userAgent"];
    subplebbits!: string[];

    // Only Plebbit instance has these props
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: IpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PubsubClient };
        chainProviders: { [chainProviderUrl: string]: ChainProvider };
        plebbitRpcClients: { [plebbitRpcUrl: string]: GenericPlebbitRpcStateClient };
    };
    private _pubsubSubscriptions: Record<string, PubsubSubscriptionHandler> = {};
    _clientsManager!: ClientsManager;
    _userPlebbitOptions: InputPlebbitOptions; // this is the raw input from user
    _stats!: Stats;
    _storage!: StorageInterface;
    private _subplebbitFsWatchAbort?: AbortController;

    private _subplebbitschangeEventHasbeenEmitted: boolean = false;

    private _storageLRUs: Record<string, LRUStorageInterface> = {}; // Cache name to storage interface

    constructor(options: InputPlebbitOptions) {
        super();
        this._userPlebbitOptions = options;
        this.parsedPlebbitOptions = parsePlebbitUserOptionsSchemaWithPlebbitErrorIfItFails(options);

        // initializing fields

        this.plebbitRpcClientsOptions = this.parsedPlebbitOptions.plebbitRpcClientsOptions;

        this.ipfsGatewayUrls = this.parsedPlebbitOptions.ipfsGatewayUrls = this.plebbitRpcClientsOptions
            ? undefined
            : this.parsedPlebbitOptions.ipfsGatewayUrls;
        this.ipfsHttpClientsOptions = this.parsedPlebbitOptions.ipfsHttpClientsOptions = this.plebbitRpcClientsOptions
            ? undefined
            : this.parsedPlebbitOptions.ipfsHttpClientsOptions;

        // We default for ipfsHttpClientsOptions first, but if it's not defined we use the default from schema
        this.pubsubHttpClientsOptions = this.parsedPlebbitOptions.pubsubHttpClientsOptions = this.plebbitRpcClientsOptions
            ? undefined
            : this._userPlebbitOptions.pubsubHttpClientsOptions // did the user provide their own pubsub options
              ? this.parsedPlebbitOptions.pubsubHttpClientsOptions // if not, then we use ipfsHttpClientOptions or defaults
              : this.parsedPlebbitOptions.ipfsHttpClientsOptions || this.parsedPlebbitOptions.pubsubHttpClientsOptions;

        this.chainProviders = this.parsedPlebbitOptions.chainProviders = this.plebbitRpcClientsOptions
            ? {}
            : this.parsedPlebbitOptions.chainProviders;
        this.resolveAuthorAddresses = this.parsedPlebbitOptions.resolveAuthorAddresses;
        this.publishInterval = this.parsedPlebbitOptions.publishInterval;
        this.updateInterval = this.parsedPlebbitOptions.updateInterval;
        this.noData = this.parsedPlebbitOptions.noData;
        this.browserLibp2pJsPublish = this.parsedPlebbitOptions.browserLibp2pJsPublish;
        this.userAgent = this.parsedPlebbitOptions.userAgent;
        this.on("subplebbitschange", (newSubs) => {
            this.subplebbits = newSubs;
            this._subplebbitschangeEventHasbeenEmitted = true;
        });

        if (this.plebbitRpcClientsOptions) this.plebbitRpcClient = new PlebbitRpcClient(this);

        //@ts-expect-error
        this.clients = {};

        this._initIpfsClientsIfNeeded();
        this._initPubsubClientsIfNeeded();
        this._initRpcClientsIfNeeded();
        this._initIpfsGatewaysIfNeeded();
        this._initChainProviders();

        if (!this.noData && !this.plebbitRpcClientsOptions)
            this.dataPath = this.parsedPlebbitOptions.dataPath =
                "dataPath" in this.parsedPlebbitOptions ? this.parsedPlebbitOptions.dataPath : getDefaultDataPath();
    }

    private _initIpfsClientsIfNeeded() {
        this.clients.ipfsClients = {};
        if (!this.ipfsHttpClientsOptions) return;
        for (const clientOptions of this.ipfsHttpClientsOptions) {
            const ipfsClient = createIpfsClient(clientOptions);
            this.clients.ipfsClients[clientOptions.url!.toString()] = {
                _client: ipfsClient,
                _clientOptions: clientOptions,
                peers: ipfsClient.swarm.peers
            };
        }
    }

    private _initPubsubClientsIfNeeded() {
        this.clients.pubsubClients = {};
        if (this.browserLibp2pJsPublish)
            //@ts-expect-error
            this.clients.pubsubClients["browser-libp2p-pubsub"] = {}; // should be defined fully else where
        if (!this.pubsubHttpClientsOptions) return;

        for (const clientOptions of this.pubsubHttpClientsOptions) {
            const ipfsClient = createIpfsClient(clientOptions);
            this.clients.pubsubClients[clientOptions.url!.toString()] = {
                _client: ipfsClient,
                _clientOptions: clientOptions,
                peers: async () => {
                    const topics = await ipfsClient.pubsub.ls();
                    const topicPeers = remeda.flattenDeep(await Promise.all(topics.map((topic) => ipfsClient.pubsub.peers(topic))));
                    const peers = remeda.unique(topicPeers.map((topicPeer) => topicPeer.toString()));
                    return peers;
                }
            };
        }
    }

    private _initRpcClientsIfNeeded() {
        this.clients.plebbitRpcClients = {};
        if (!this.plebbitRpcClientsOptions) return;
        for (const rpcUrl of this.plebbitRpcClientsOptions)
            this.clients.plebbitRpcClients[rpcUrl] = new GenericPlebbitRpcStateClient("stopped");
    }

    private _initChainProviders() {
        this.clients.chainProviders = this.chainProviders;
    }

    private _initIpfsGatewaysIfNeeded() {
        // If user did not provide ipfsGatewayUrls
        this.clients.ipfsGateways = {};
        if (!this.ipfsGatewayUrls) return;
        for (const gatewayUrl of this.ipfsGatewayUrls) this.clients.ipfsGateways[gatewayUrl] = {};
    }

    async _init() {
        const log = Logger("plebbit-js:plebbit:_init");
        // Init storage
        this._storage = new Storage({ dataPath: this.dataPath, noData: this.noData });
        await this._storage.init();

        // Init stats
        this._stats = new Stats({ _storage: this._storage, clients: this.clients });
        // Init clients manager
        this._clientsManager = new ClientsManager(this);

        // TODO plebbit-with-rpc-client will subscribe to subplebbitschange and settingschange for us
        if (this._canCreateNewLocalSub() && !this.plebbitRpcClient) {
            this._subplebbitFsWatchAbort = await monitorSubplebbitsDirectory(this);
            await this._waitForSubplebbitsToBeDefined();
        } else {
            this.subplebbits = []; // subplebbits = [] on browser
        }

        hideClassPrivateProps(this);
    }

    async getSubplebbit(subplebbitAddress: z.infer<typeof SubplebbitAddressSchema>) {
        const parsedAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const subplebbit = await this.createSubplebbit({ address: parsedAddress });

        if (typeof subplebbit.createdAt === "number") return <RpcLocalSubplebbit | LocalSubplebbit>subplebbit; // It's a local sub, and alreadh has been loaded, no need to wait
        const timeoutMs = this._clientsManager.getGatewayTimeoutMs("subplebbit");
        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        let updateError: PlebbitError | undefined;
        const errorListener = (err: PlebbitError) => (updateError = err);
        subplebbit.on("error", errorListener);
        try {
            await subplebbit.update();
            await pTimeout(updatePromise, {
                milliseconds: timeoutMs,
                message: updateError || new TimeoutError(`plebbit.getSubplebbit(${subplebbit.address}) timed out after ${timeoutMs}ms`)
            });
        } catch (e) {
            subplebbit.removeAllListeners("error");
            await subplebbit.stop();
            if (updateError) throw updateError;
            if (subplebbit?._ipnsLoadingOperation?.mainError()) throw subplebbit._ipnsLoadingOperation.mainError();
            throw Error("Timed out without error. Should not happen" + e);
        }
        subplebbit.removeListener("error", errorListener);
        await subplebbit.stop();

        return subplebbit;
    }

    async getComment(cid: z.infer<typeof CidStringSchema>): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:getComment");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(cid);
        const comment = await this.createComment({ cid: parsedCid });

        // The reason why we override this function is because we don't want update() to load the IPNS
        // we only want to load the comment ipfs
        //@ts-expect-error
        const originalLoadMethod = comment._retryLoadingCommentUpdate.bind(comment);
        //@ts-expect-error
        comment._retryLoadingCommentUpdate = () => {};
        const updatePromise = new Promise((resolve) => comment.once("update", resolve));
        let error: PlebbitError | Error | undefined;
        const errorPromise = new Promise((resolve) => comment.once("error", (err) => resolve((error = err))));

        await comment.update();
        await Promise.race([updatePromise, errorPromise]);
        await comment.stop();
        //@ts-expect-error
        comment._retryLoadingCommentUpdate = originalLoadMethod;

        if (error) {
            log.error(`Failed to load comment (${parsedCid}) due to error`, error);
            throw error;
        }
        return comment;
    }

    private async _initMissingFieldsOfPublicationBeforeSigning(
        pubOptions: CreateCommentOptions | CreateCommentEditOptions | CreateVoteOptions | CreateCommentModerationOptions,
        log: Logger
    ): Promise<CommentOptionsToSign | VoteOptionsToSign | CommentEditOptionsToSign> {
        const finalOptions = remeda.clone(pubOptions);
        if (!finalOptions.signer) throw Error("User did not provide a signer to create a local publication");
        if (finalOptions.author) {
            // make sure reserved fields like subplebbit, shortAddress are removed
            finalOptions.author = remeda.omit(finalOptions.author, AuthorReservedFields);
        }
        const filledTimestamp = typeof finalOptions.timestamp !== "number" ? timestamp() : finalOptions.timestamp;
        const filledSigner = await this.createSigner(finalOptions.signer);
        const filledAuthor = <AuthorPubsubType>{
            ...finalOptions.author,
            address: finalOptions.author?.address || filledSigner.address
        };
        const filledProtocolVersion = finalOptions.protocolVersion || env.PROTOCOL_VERSION;

        return {
            ...finalOptions,
            timestamp: filledTimestamp,
            signer: filledSigner,
            author: filledAuthor,
            protocolVersion: filledProtocolVersion
        };
    }

    private async _createCommentInstanceFromAnotherCommentInstance(options: Comment) {
        const commentInstance = new Comment(this);
        commentInstance._rawCommentIpfs = options._rawCommentIpfs;
        commentInstance._rawCommentUpdate = options._rawCommentUpdate;
        commentInstance._pubsubMsgToPublish = options._pubsubMsgToPublish;

        Object.assign(
            commentInstance, // we jsonify here to get rid of private and function props
            remeda.omit(JSON.parse(JSON.stringify(options)), ["replies", "clients", "state", "publishingState", "updatingState"])
        );

        if (commentInstance._rawCommentIpfs) commentInstance._initIpfsProps(commentInstance._rawCommentIpfs);
        else if (commentInstance._pubsubMsgToPublish) commentInstance._initPubsubMessageProps(commentInstance._pubsubMsgToPublish);
        if (commentInstance._rawCommentUpdate) commentInstance._initCommentUpdate(commentInstance._rawCommentUpdate);
        return commentInstance;
    }

    private async _createCommentInstanceFromJsonfiedPageComment(options: CommentWithinPageJson) {
        const commentInstance = new Comment(this);

        Object.assign(commentInstance, remeda.omit(options, ["replies"])); // These two fields are instances so we shouldn't copy them

        commentInstance._updateRepliesPostsInstance(options.replies); // we need to update replies manually because it's a class instance

        return commentInstance;
    }

    private async _createCommentInstanceFromJsonfiedCommentInstance(options: CommentJson) {
        const commentInstance = new Comment(this);

        // Should copy all props except class instances like, comment.replies or instance-only props like states
        Object.assign(
            commentInstance, // we jsonify here to get rid of private and function props
            remeda.omit(<CommentJson>JSON.parse(JSON.stringify(options)), [
                "replies",
                "clients",
                "state",
                "publishingState",
                "updatingState"
            ])
        );

        if (commentInstance.cid) commentInstance._updateRepliesPostsInstance(options.replies); // we need to update replies manually because it's a class instance

        return commentInstance;
    }

    async createComment(
        options:
            | z.infer<typeof CreateCommentFunctionArgumentsSchema>
            | CommentJson
            | Comment
            | CommentWithinPageJson
            | CommentIpfsWithCidDefined
    ): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:createComment");

        if (options instanceof Comment) return this._createCommentInstanceFromAnotherCommentInstance(options);
        else if ("clients" in options) return this._createCommentInstanceFromJsonfiedCommentInstance(options);
        else if ("original" in options) return this._createCommentInstanceFromJsonfiedPageComment(options);
        const parsedOptions = parseCreateCommentFunctionArgumentsWithPlebbitErrorIfItFails(options);

        const commentInstance = new Comment(this);
        if ("cid" in parsedOptions) {
            commentInstance.setCid(parsedOptions.cid);
            if (Object.keys(parsedOptions).length === 1) return commentInstance; // No need to initialize other props if {cid: string} is provided
        }

        if ("depth" in parsedOptions) {
            // Options is CommentIpfs | CommentIpfsWithCidDefined
            //@ts-expect-error
            const commentIpfs: CommentIpfsType = remeda.omit(parsedOptions, ["cid"]); // make sure if options:CommentIpfsWithCidDefined that cid doesn't become part of comment._rawCommentIpfs
            commentInstance._initIpfsProps(commentIpfs);
        } else if ("signature" in parsedOptions) {
            // parsedOptions is CommentPubsubMessage
            commentInstance._initPubsubMessageProps(parsedOptions);
        } else if ("signer" in parsedOptions) {
            // we're creating a new comment to sign and publish here
            const fieldsFilled = <CommentOptionsToSign>await this._initMissingFieldsOfPublicationBeforeSigning(parsedOptions, log);
            const cleanedFieldsFilled = cleanUpBeforePublishing(fieldsFilled);
            const signedComment = <LocalCommentOptions>{ ...cleanedFieldsFilled, signature: await signComment(cleanedFieldsFilled, this) };
            commentInstance._initLocalProps(signedComment);
        } else if ("subplebbitAddress" in parsedOptions) commentInstance.setSubplebbitAddress(parsedOptions.subplebbitAddress);
        else {
            throw Error("Make sure you provided a remote comment props or signer to create a new local comment");
        }

        return commentInstance;
    }

    _canCreateNewLocalSub(): boolean {
        const isNode = typeof process?.versions?.node !== "undefined";
        return isNode && Boolean(this.dataPath);
    }

    protected async _setSubplebbitIpfsOnInstanceIfPossible(
        subplebbit: RpcRemoteSubplebbit | RemoteSubplebbit,
        options: CreateRemoteSubplebbitOptions | SubplebbitIpfsType | RemoteSubplebbitJson | RpcRemoteSubplebbitJson
    ) {
        await subplebbit.initRemoteSubplebbitPropsNoMerge(options);
        if (options.signature) {
            const resParseSubplebbitIpfs = SubplebbitIpfsSchema.passthrough().safeParse(
                remeda.pick(options, <(keyof SubplebbitIpfsType)[]>[...options.signature.signedPropertyNames, "signature"])
            );
            if (resParseSubplebbitIpfs.success) {
                const cleanedRecord = removeUndefinedValuesRecursively(resParseSubplebbitIpfs.data); // safe way to replicate JSON.stringify() which is done before adding record to ipfs
                await subplebbit.initSubplebbitIpfsPropsNoMerge(cleanedRecord); // we're setting SubplebbitIpfs
            }
        }
    }

    protected async _waitForSubplebbitsToBeDefined() {
        // we're just wait until this.subplebbits is either defined, or subplebbitschange is emitted

        if (!this._subplebbitschangeEventHasbeenEmitted) await new Promise((resolve) => this.once("subplebbitschange", resolve));
        if (!Array.isArray(this.subplebbits)) throw Error("plebbit.subplebbits should be defined after subplebbitschange event");
    }

    async _awaitSubplebbitsToIncludeSub(subAddress: string): Promise<void> {
        if (this.subplebbits.includes(subAddress)) return;
        else {
            await new Promise((resolve) =>
                this.on("subplebbitschange", (newSubs) => {
                    if (newSubs.includes(subAddress)) resolve(1);
                })
            );
        }
    }

    private async _createRemoteSubplebbitInstance(options: z.infer<typeof CreateRemoteSubplebbitFunctionArgumentSchema>) {
        const log = Logger("plebbit-js:plebbit:createRemoteSubplebbit");

        log.trace("Received subplebbit options to create a remote subplebbit instance:", options);
        const subplebbit = new RemoteSubplebbit(this);
        await this._setSubplebbitIpfsOnInstanceIfPossible(subplebbit, options);

        log.trace(`Created remote subplebbit instance (${subplebbit.address})`);
        return subplebbit;
    }

    private async _createLocalSub(
        options: CreateNewLocalSubplebbitParsedOptions | CreateInstanceOfLocalOrRemoteSubplebbitOptions
    ): Promise<LocalSubplebbit> {
        const log = Logger("plebbit-js:plebbit:createLocalSubplebbit");
        log.trace("Received subplebbit options to create a local subplebbit instance:", options);

        const canCreateLocalSub = this._canCreateNewLocalSub();
        if (!canCreateLocalSub) throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });

        const localSubs = await nodeListSubplebbits(this);
        const isLocalSub = localSubs.includes(options.address); // Sub exists already, only pass address so we don't override other props
        const subplebbit = new LocalSubplebbit(this);
        if (isLocalSub) {
            // If the sub is already created before, then load it with address only. We don't care about other props
            subplebbit.setAddress(options.address);
            await subplebbit._loadLocalSubDb();
            log.trace(`Created instance of existing local subplebbit (${subplebbit.address}) with props:`);
            subplebbit.emit("update", subplebbit);
            return subplebbit;
        } else if ("signer" in options) {
            // This is a new sub
            const parsedOptions = <CreateNewLocalSubplebbitParsedOptions>options;
            await subplebbit.initNewLocalSubPropsNoMerge(parsedOptions); // We're initializing a new local sub props here
            await subplebbit._createNewLocalSubDb();
            log.trace(`Created a new local subplebbit (${subplebbit.address}) with props:`);
            subplebbit.emit("update", subplebbit);
            await this._awaitSubplebbitsToIncludeSub(subplebbit.address);
            return subplebbit;
        } else throw Error("Are you trying to create a local sub with no address or signer? This is a critical error");
    }

    private async _createSubInstanceFromJsonifiedSub(jsonfied: SubplebbitJson): ReturnType<Plebbit["createSubplebbit"]> {
        // jsonfied = JSON.parse(JSON.stringify(subplebbitInstance))
        // should probably exclude internal and instance-exclusive props like states

        if ("startedState" in jsonfied) return this._createLocalSub(jsonfied);
        else return this._createRemoteSubplebbitInstance(jsonfied);
    }

    async createSubplebbit(
        options: z.infer<typeof CreateSubplebbitFunctionArgumentsSchema> | SubplebbitJson = {}
    ): Promise<RemoteSubplebbit | RpcRemoteSubplebbit | RpcLocalSubplebbit | LocalSubplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        if (options instanceof RemoteSubplebbit) return options; // not sure why somebody would call createSubplebbit with an instance, will probably change later
        if ("clients" in options) return this._createSubInstanceFromJsonifiedSub(<SubplebbitJson>options);
        const parsedOptions = parseCreateSubplebbitFunctionArgumentsSchemaWithPlebbitErrorIfItFails(options);
        log.trace("Received options: ", parsedOptions);

        if ("address" in parsedOptions && parsedOptions?.address && doesDomainAddressHaveCapitalLetter(parsedOptions.address))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { ...parsedOptions });

        // Creating a subplebbit when we're connected to RPC will be handled in plebbit-with-rpc-client
        // Code below is for NodeJS and browser using IPFS-P2P/gateway

        const canCreateLocalSub = this._canCreateNewLocalSub();

        if ("signer" in parsedOptions && !canCreateLocalSub)
            throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });

        if (!canCreateLocalSub) {
            // we're either on browser or on NodeJS with no dataPath
            const parsedRemoteOptions = parseCreateRemoteSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(options);
            return this._createRemoteSubplebbitInstance(parsedRemoteOptions);
        }

        if ("address" in parsedOptions && !("signer" in parsedOptions)) {
            // sub is already created, need to check if it's local or remote
            const localSubs = await nodeListSubplebbits(this);
            const isSubLocal = localSubs.includes(parsedOptions.address);
            if (isSubLocal) return this._createLocalSub({ address: parsedOptions.address });
            else {
                const parsedRemoteOptions = parseCreateRemoteSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(options);
                return this._createRemoteSubplebbitInstance(parsedRemoteOptions);
            }
        } else if (!("address" in parsedOptions) && !("signer" in parsedOptions)) {
            // no address, no signer, create signer and assign address to signer.address
            const signer = await this.createSigner();
            const localOptions = <CreateNewLocalSubplebbitParsedOptions>{ ...parsedOptions, signer, address: signer.address };
            log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${localOptions.address})`);

            return this._createLocalSub(localOptions);
        } else if (!("address" in parsedOptions) && "signer" in parsedOptions) {
            const signer = await this.createSigner(parsedOptions.signer);
            const localOptions = <CreateNewLocalSubplebbitParsedOptions>{
                ...parsedOptions,
                address: signer.address,
                signer
            };
            return this._createLocalSub(localOptions);
        } else if ("address" in parsedOptions && "signer" in parsedOptions) return this._createLocalSub(parsedOptions);
        else throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { parsedOptions });
    }

    async _createVoteInstanceFromJsonfiedVote(jsonfied: VoteJson) {
        const voteInstance = new Vote(this);
        // we stringify here to remove functions and create a deep copy
        Object.assign(voteInstance, remeda.omit(<VoteJson>JSON.parse(JSON.stringify(jsonfied)), ["state", "publishingState", "clients"]));
        return voteInstance;
    }

    async createVote(options: z.infer<typeof CreateVoteFunctionArgumentSchema> | VoteJson): Promise<Vote> {
        const log = Logger("plebbit-js:plebbit:createVote");
        if ("clients" in options) return this._createVoteInstanceFromJsonfiedVote(options);
        const parsedOptions = parseCreateVoteFunctionArgumentSchemaWithPlebbitErrorIfItFails(options);
        const voteInstance = new Vote(this);

        if ("signature" in parsedOptions) {
            voteInstance._initRemoteProps(parsedOptions);
        } else {
            const finalOptions = <VoteOptionsToSign>await this._initMissingFieldsOfPublicationBeforeSigning(parsedOptions, log);
            const cleanedFinalOptions = cleanUpBeforePublishing(finalOptions);
            const signedVote: LocalVoteOptions = {
                ...cleanedFinalOptions,
                signature: await signVote(cleanedFinalOptions, this)
            };

            voteInstance._initLocalProps(signedVote);
        }
        return voteInstance;
    }

    async _createCommentEditInstanceFromJsonfiedCommentEdit(jsonfied: CommentEditTypeJson) {
        const editInstance = new CommentEdit(this);
        // we stringify here to remove functions and create a deep copy
        Object.assign(
            editInstance,
            remeda.omit(<CommentEditTypeJson>JSON.parse(JSON.stringify(jsonfied)), ["state", "publishingState", "clients"])
        );

        return editInstance;
    }

    async createCommentEdit(options: z.infer<typeof CreateCommentEditFunctionArgumentSchema> | CommentEditTypeJson): Promise<CommentEdit> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");
        if ("clients" in options) return this._createCommentEditInstanceFromJsonfiedCommentEdit(options);
        const parsedOptions = parseCreateCommentEditFunctionArgumentSchemaWithPlebbitErrorIfItFails(options);
        const editInstance = new CommentEdit(this);

        if ("signature" in parsedOptions)
            editInstance._initRemoteProps(parsedOptions); // User just wants to instantiate a CommentEdit object, not publish
        else {
            const finalOptions = <CommentEditOptionsToSign>await this._initMissingFieldsOfPublicationBeforeSigning(parsedOptions, log);
            const cleanedFinalOptions = cleanUpBeforePublishing(finalOptions);
            const signedEdit = <LocalCommentEditOptions>{
                ...cleanedFinalOptions,
                signature: await signCommentEdit(cleanedFinalOptions, this)
            };
            editInstance._initLocalProps(signedEdit);
        }
        return editInstance;
    }

    async _createCommentModerationInstanceFromJsonfiedCommentModeration(jsonfied: CommentModerationTypeJson) {
        const editInstance = new CommentModeration(this);
        // we stringify here to remove functions and create a deep copy
        Object.assign(
            editInstance,
            remeda.omit(<CommentModerationTypeJson>JSON.parse(JSON.stringify(jsonfied)), ["state", "publishingState", "clients"])
        );

        return editInstance;
    }

    async createCommentModeration(
        options: z.infer<typeof CreateCommentModerationFunctionArgumentSchema> | CommentModerationTypeJson
    ): Promise<CommentModeration> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");
        if ("clients" in options) return this._createCommentModerationInstanceFromJsonfiedCommentModeration(options);
        const parsedOptions = parseCreateCommentModerationFunctionArgumentSchemaWithPlebbitErrorIfItFails(options);
        const modInstance = new CommentModeration(this);

        if ("signature" in parsedOptions)
            modInstance._initRemoteProps(parsedOptions); // User just wants to instantiate a CommentEdit object, not publish
        else {
            const finalOptions = <CommentModerationOptionsToSign>(
                await this._initMissingFieldsOfPublicationBeforeSigning(parsedOptions, log)
            );
            const cleanedFinalOptions = cleanUpBeforePublishing(finalOptions);
            const signedMod = <LocalCommentModerationAfterSigning>{
                ...cleanedFinalOptions,
                signature: await signCommentModeration(cleanedFinalOptions, this)
            };
            modInstance._initLocalProps(signedMod);
        }
        return modInstance;
    }

    createSigner(createSignerOptions?: CreateSignerOptions) {
        return createSigner(createSignerOptions);
    }

    async fetchCid(cid: string): Promise<string> {
        // plebbit-with-rpc-client will handle if user is connected to rpc client

        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(cid);
        return this._clientsManager.fetchCid(parsedCid);
    }

    // Used to pre-subscribe so publishing on pubsub would be faster
    async pubsubSubscribe(pubsubTopic: string) {
        const parsedTopic = PubsubTopicSchema.parse(pubsubTopic);
        if (this._pubsubSubscriptions[parsedTopic]) return;
        const handler = () => {};
        await this._clientsManager.pubsubSubscribe(parsedTopic, handler);
        this._pubsubSubscriptions[parsedTopic] = handler;
    }

    async pubsubUnsubscribe(pubsubTopic: string) {
        const parsedTopic = PubsubTopicSchema.parse(pubsubTopic);
        if (!this._pubsubSubscriptions[parsedTopic]) return;
        await this._clientsManager.pubsubUnsubscribe(parsedTopic, this._pubsubSubscriptions[parsedTopic]);
        delete this._pubsubSubscriptions[parsedTopic];
    }

    async resolveAuthorAddress(authorAddress: string) {
        // TODO rewrite this
        const parsedAddress = AuthorAddressSchema.parse(authorAddress);
        const resolved = await this._clientsManager.resolveAuthorAddressIfNeeded(parsedAddress);
        return resolved;
    }

    async _createStorageLRU(opts: Omit<LRUStorageConstructor, "plebbit">) {
        // should add the storage LRU to an array, so we can destroy all of them on plebbit.destroy
        if (!this._storageLRUs[opts.cacheName]) {
            this._storageLRUs[opts.cacheName] = new LRUStorage({ ...opts, plebbit: this });
            await this._storageLRUs[opts.cacheName].init();
        }
        return this._storageLRUs[opts.cacheName];
    }

    async rpcCall(method: string, params: any[]): Promise<any> {
        throw Error("Can't call rpcCall without having a rpc connection");
    }

    async destroy() {
        // Clean up connections
        if (this._subplebbitFsWatchAbort) this._subplebbitFsWatchAbort.abort();
        await this._storage.destroy();
        await Promise.all(Object.values(this._storageLRUs).map((storage) => storage.destroy()));
    }
}