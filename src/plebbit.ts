import { getDefaultDataPath, listSubplebbits as nodeListSubplebbits, nativeFunctions, createIpfsClient } from "./runtime/node/util.js";
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
    InputPlebbitOptions
} from "./types.js";
import { Comment } from "./publications/comment/comment.js";
import { doesDomainAddressHaveCapitalLetter, removeNullUndefinedEmptyObjectsValuesRecursively, timestamp } from "./util.js";
import Vote from "./publications/vote/vote.js";
import { createSigner } from "./signer/index.js";
import { CommentEdit } from "./publications/comment-edit/comment-edit.js";
import Logger from "@plebbit/plebbit-logger";
import env from "./version.js";
import { cleanUpBeforePublishing, signComment, signCommentEdit, signVote } from "./signer/signatures.js";
import { TypedEmitter } from "tiny-typed-emitter";
import Stats from "./stats.js";
import Storage from "./runtime/node/storage.js";
import { ClientsManager } from "./clients/client-manager.js";
import PlebbitRpcClient from "./clients/rpc-client/plebbit-rpc-client.js";
import { PlebbitError } from "./plebbit-error.js";
import { GenericPlebbitRpcStateClient } from "./clients/rpc-client/plebbit-rpc-state-client.js";
import type { CreateInstanceOfLocalOrRemoteSubplebbitOptions, CreateNewLocalSubplebbitParsedOptions } from "./subplebbit/types.js";
import LRUStorage from "./runtime/node/lru-storage.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./subplebbit/rpc-remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import { LocalSubplebbit } from "./runtime/node/subplebbit/local-subplebbit.js";
import pTimeout, { TimeoutError } from "p-timeout";
import * as remeda from "remeda";
import { z } from "zod";
import type { CreateSignerOptions } from "./signer/types.js";
import type { CommentEditOptionsToSign, CreateCommentEditOptions, LocalCommentEditOptions } from "./publications/comment-edit/types.js";
import { CreateCommentEditFunctionArgumentSchema } from "./publications/comment-edit/schema.js";
import type { CreateVoteOptions, LocalVoteOptions, VoteOptionsToSign } from "./publications/vote/types.js";
import { CreateVoteFunctionArgumentSchema } from "./publications/vote/schema.js";
import type { CommentOptionsToSign, CreateCommentOptions, LocalCommentOptions } from "./publications/comment/types.js";
import { CreateCommentFunctionArguments } from "./publications/comment/schema.js";
import { AuthorAddressSchema, AuthorPubsubSchema, CidStringSchema, SubplebbitAddressSchema } from "./schema/schema.js";
import {
    CreateRemoteSubplebbitFunctionArgumentSchema,
    CreateRpcSubplebbitFunctionArgumentSchema,
    CreateSubplebbitFunctionArgumentsSchema,
    CreateNewLocalSubplebbitParsedOptionsSchema,
    PubsubTopicSchema
} from "./subplebbit/schema.js";
import { PlebbitUserOptionsSchema } from "./schema.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails } from "./schema/schema-util.js";

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
    _storage!: StorageInterface;
    stats!: Stats;
    parsedPlebbitOptions: ParsedPlebbitOptions;
    publishInterval: ParsedPlebbitOptions["publishInterval"];
    updateInterval: ParsedPlebbitOptions["updateInterval"];
    noData: ParsedPlebbitOptions["noData"];

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
    private _userPlebbitOptions: InputPlebbitOptions; // this is the raw input from user

    private _storageLRUs: Record<string, LRUStorageInterface> = {}; // Cache name to storage interface

    constructor(options: InputPlebbitOptions) {
        super();
        this._userPlebbitOptions = options;
        this.parsedPlebbitOptions = PlebbitUserOptionsSchema.parse(options);

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

        if (this.plebbitRpcClientsOptions) this.plebbitRpcClient = new PlebbitRpcClient(this);

        //@ts-expect-error
        this.clients = {};

        this._initIpfsClientsIfNeeded();
        this._initPubsubClientsIfNeeded();
        this._initRpcClientsIfNeeded();
        this._initIpfsGatewaysIfNeeded();
        this._initChainProviders();

        if (!this.noData && !this.plebbitRpcClientsOptions)
            this.dataPath = this.parsedPlebbitOptions.dataPath = this.parsedPlebbitOptions.dataPath || getDefaultDataPath();
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
        // Init storage
        this._storage = new Storage({ dataPath: this.dataPath, noData: this.noData });
        await this._storage.init();

        // Init stats
        this.stats = new Stats({ _storage: this._storage, clients: this.clients });
        // Init clients manager
        this._clientsManager = new ClientsManager(this);
    }

    async getSubplebbit(subplebbitAddress: z.infer<typeof SubplebbitAddressSchema>) {
        const parsedAddress = SubplebbitAddressSchema.parse(subplebbitAddress);
        const subplebbit = await this.createSubplebbit({ address: parsedAddress });

        if (typeof subplebbit.createdAt === "number") return <RpcLocalSubplebbit | LocalSubplebbit>subplebbit; // It's a local sub, and alreadh has been loaded, no need to wait
        const timeoutMs = this._clientsManager.getGatewayTimeoutMs("subplebbit");
        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        let updateError: PlebbitError | undefined;
        subplebbit.on("error", (err) => (updateError = err));
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
        subplebbit.removeAllListeners("error");
        await subplebbit.stop();

        return subplebbit;
    }

    async getComment(cid: z.infer<typeof CidStringSchema>): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:getComment");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(cid);
        const comment = await this.createComment({ cid: parsedCid });

        // The reason why we override this function is because we don't want update() to load the IPNS
        //@ts-expect-error
        const originalLoadMethod = comment._retryLoadingCommentUpdate.bind(comment);
        //@ts-expect-error
        comment._retryLoadingCommentUpdate = () => {};
        await comment.update();
        const updatePromise = new Promise((resolve) => comment.once("update", resolve));
        let error: PlebbitError | undefined;
        const errorPromise = new Promise((resolve) => comment.once("error", (err) => resolve((error = err))));
        await Promise.race([updatePromise, errorPromise]);
        await comment.stop();
        //@ts-expect-error
        comment._retryLoadingCommentUpdate = originalLoadMethod;

        if (error) {
            log.error(`Failed to load comment (${parsedCid}) due to error: ${error}`);
            throw error;
        }
        return comment;
    }

    private async _initMissingFieldsOfPublicationBeforeSigning(
        pubOptions: CreateCommentOptions | CreateCommentEditOptions | CreateVoteOptions,
        log: Logger
    ): Promise<CommentOptionsToSign | VoteOptionsToSign | CommentEditOptionsToSign> {
        const finalOptions = remeda.clone(pubOptions);
        if (!finalOptions.signer) throw Error("User did not provide a signer to create a local publication");
        if (finalOptions.author && "shortAddress" in finalOptions.author) {
            log("Removed author.shortAddress before creating the signature");
            delete finalOptions["author"]["shortAddress"];
        }
        const filledTimestamp = typeof finalOptions.timestamp !== "number" ? timestamp() : finalOptions.timestamp;
        const filledSigner = await this.createSigner(finalOptions.signer);
        const filledAuthor = AuthorPubsubSchema.parse({
            ...finalOptions.author,
            address: finalOptions.author?.address || filledSigner.address
        });
        const filledProtocolVersion = finalOptions.protocolVersion || env.PROTOCOL_VERSION;

        return {
            ...finalOptions,
            timestamp: filledTimestamp,
            signer: filledSigner,
            author: filledAuthor,
            protocolVersion: filledProtocolVersion
        };
    }

    private async _createCommentInstanceFromExistingCommentInstance(options: Comment): Promise<Comment> {
        const commentInstance = new Comment(this);
        if (typeof options.cid === "string") commentInstance.setCid(options.cid);
        if (typeof options.depth === "number") commentInstance._initIpfsProps(options.toJSONIpfs());
        else if (typeof options.author.address === "string")
            commentInstance._initPubsubMessageProps(options.toJSONPubsubMessagePublication());
        if (typeof options.updatedAt === "number") await commentInstance._initCommentUpdate(options.toJSONCommentWithinPage());
        return commentInstance;
    }

    async createComment(options: z.infer<typeof CreateCommentFunctionArguments>): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:createComment");

        const parsedOptions = CreateCommentFunctionArguments.parse(options);

        if (parsedOptions instanceof Comment) return this._createCommentInstanceFromExistingCommentInstance(parsedOptions);
        const commentInstance = new Comment(this);
        if ("cid" in parsedOptions) {
            commentInstance.setCid(parsedOptions.cid);
            if (Object.keys(parsedOptions).length === 1) return commentInstance; // No need to initialize other props if {cid: string} is provided
        }

        if ("publication" in parsedOptions) commentInstance._initChallengeRequestProps(parsedOptions);
        else if ("depth" in parsedOptions) {
            // Options is CommentIpfs
            commentInstance._initIpfsProps(parsedOptions);
        } else if ("signature" in parsedOptions) {
            // parsedOptions is CommentPubsubMessage
            commentInstance._initPubsubMessageProps(parsedOptions);
        } else if ("signer" in parsedOptions) {
            // we're creating a new comment to sign and publish here
            const fieldsFilled = <CommentOptionsToSign>await this._initMissingFieldsOfPublicationBeforeSigning(parsedOptions, log);
            const cleanedFieldsFilled = cleanUpBeforePublishing(fieldsFilled);
            const signedComment = <LocalCommentOptions>{ ...cleanedFieldsFilled, signature: await signComment(cleanedFieldsFilled, this) };
            commentInstance._initLocalProps(signedComment);
        } else if ("subplebbitAddress" in parsedOptions && typeof parsedOptions.subplebbitAddress === "string")
            commentInstance.setSubplebbitAddress(parsedOptions.subplebbitAddress);
        else {
            throw Error("Make sure you provided a remote comment props or signer to create a new local comment");
        }

        if ("updatedAt" in parsedOptions && typeof parsedOptions.updatedAt === "number")
            await commentInstance._initCommentUpdate(parsedOptions);

        return commentInstance;
    }

    _canCreateNewLocalSub(): boolean {
        const isNode = typeof process?.versions?.node !== "undefined";
        return isNode;
    }

    private async _createSubplebbitRpc(
        options: z.infer<typeof CreateRpcSubplebbitFunctionArgumentSchema>
    ): Promise<RpcLocalSubplebbit | RpcRemoteSubplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        log.trace("Received subplebbit options to create a subplebbit instance over RPC:", options);
        if ("address" in options && typeof options.address === "string") {
            const rpcSubs = await this.listSubplebbits();
            const isSubRpcLocal = rpcSubs.includes(options.address);
            // Should actually create an instance here, instead of calling getSubplebbit
            if (isSubRpcLocal) {
                const sub = new RpcLocalSubplebbit(this);
                sub.setAddress(options.address);
                // wait for one update here, and then stop
                await sub.update();
                const updatePromise = new Promise((resolve) => sub.once("update", resolve));
                let error: PlebbitError | undefined;
                const errorPromise = new Promise((resolve) => sub.once("error", (err) => resolve((error = err))));
                await Promise.race([
                    updatePromise,
                    errorPromise,
                    new Promise((resolve) => typeof sub.createdAt === "number" && resolve(1)) // In case await sub.update() above got updated quickly
                ]);
                await sub.stop();
                if (error) throw error;

                return sub;
            } else {
                // Remote subplebbit
                log.trace("Creating a remote RPC subplebbit instance with address", options.address);
                const remoteSub = new RpcRemoteSubplebbit(this);
                const parsedOptions = options instanceof RemoteSubplebbit ? options.toJSONIpfs() : options;
                if ("protocolVersion" in parsedOptions)
                    await remoteSub.initRemoteSubplebbitPropsNoMerge(parsedOptions); // We're setting SubplebbitIpfs
                else {
                    // we're setting {address, posts: {pageCids}}
                    remoteSub.setAddress(parsedOptions.address);
                    await remoteSub._updateLocalPostsInstance(parsedOptions.posts);
                }

                return remoteSub;
            }
        } else if (!("address" in options)) {
            // We're creating a new local sub
            const newLocalSub = await this.plebbitRpcClient!.createSubplebbit(options);
            log(
                `Created local-RPC subplebbit (${newLocalSub.address}) with props:`,
                removeNullUndefinedEmptyObjectsValuesRecursively(newLocalSub.toJSON())
            );
            newLocalSub.emit("update", newLocalSub);
            return newLocalSub;
        } else throw Error("Failed to create subplebbit rpc instance, are you sure you provided the correct args?");
    }

    private async _createRemoteSubplebbitInstance(options: z.infer<typeof CreateRemoteSubplebbitFunctionArgumentSchema>) {
        const log = Logger("plebbit-js:plebbit:createRemoteSubplebbit");

        log.trace("Received subplebbit options to create a remote subplebbit instance:", options);
        const subplebbit = new RemoteSubplebbit(this);
        if (options instanceof RemoteSubplebbit) {
            Object.assign(subplebbit, options);
            if (subplebbit.state !== "stopped") await subplebbit.stop(); // to reset states
        } else {
            if ("protocolVersion" in options)
                await subplebbit.initRemoteSubplebbitPropsNoMerge(options); // we're setting SubplebbitIpfs
            else {
                // we're setting {address, posts: {pageCids}}
                subplebbit.setAddress(options.address);
                await subplebbit._updateLocalPostsInstance(options.posts);
            }
        }

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

        const isLocalSub = (await this.listSubplebbits()).includes(options.address); // Sub exists already, only pass address so we don't override other props
        const subplebbit = new LocalSubplebbit(this);
        if (isLocalSub) {
            // If the sub is already created before, then load it with address only. We don't care about other props
            subplebbit.setAddress(options.address);
            await subplebbit._loadLocalSubDb();
            log.trace(
                `Created instance of existing local subplebbit (${subplebbit.address}) with props:`,
                removeNullUndefinedEmptyObjectsValuesRecursively(subplebbit.toJSON())
            );
            subplebbit.emit("update", subplebbit);
            return subplebbit;
        } else if ("signer" in options) {
            // This is a new sub

            const parsedOptions = CreateNewLocalSubplebbitParsedOptionsSchema.parse(<CreateNewLocalSubplebbitParsedOptions>options);
            await subplebbit.initNewLocalSubPropsNoMerge(parsedOptions); // We're initializing a new local sub props here
            await subplebbit._createNewLocalSubDb();
            log.trace(
                `Created a new local subplebbit (${subplebbit.address}) with props:`,
                removeNullUndefinedEmptyObjectsValuesRecursively(subplebbit.toJSON())
            );
            subplebbit.emit("update", subplebbit);
            return subplebbit;
        } else throw Error("Are you trying to create a local sub with no address or signer? This is a critical error");
    }

    async createSubplebbit(
        options: z.infer<typeof CreateSubplebbitFunctionArgumentsSchema> = {}
    ): Promise<RemoteSubplebbit | RpcRemoteSubplebbit | RpcLocalSubplebbit | LocalSubplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        const parsedOptions = CreateSubplebbitFunctionArgumentsSchema.parse(options);
        log.trace("Received options: ", parsedOptions);

        if ("address" in parsedOptions && parsedOptions?.address && doesDomainAddressHaveCapitalLetter(parsedOptions.address))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { ...parsedOptions });

        if (this.plebbitRpcClient) {
            const parsedRpcOptions = CreateRpcSubplebbitFunctionArgumentSchema.parse(options);
            return this._createSubplebbitRpc(parsedRpcOptions);
        }

        const canCreateLocalSub = this._canCreateNewLocalSub();

        if ("signer" in parsedOptions && !canCreateLocalSub)
            throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });

        if (!canCreateLocalSub) {
            const parsedRemoteOptions = CreateRemoteSubplebbitFunctionArgumentSchema.parse(options);
            return this._createRemoteSubplebbitInstance(parsedRemoteOptions);
        }

        if ("address" in parsedOptions && !("signer" in parsedOptions)) {
            // sub is already created, need to check if it's local or remote
            const localSubs = await this.listSubplebbits();
            const isSubLocal = localSubs.includes(parsedOptions.address);
            if (isSubLocal) return this._createLocalSub({ address: parsedOptions.address });
            else {
                const parsedRemoteOptions = CreateRemoteSubplebbitFunctionArgumentSchema.parse(options);
                return this._createRemoteSubplebbitInstance(parsedRemoteOptions);
            }
        } else if (!("address" in parsedOptions) && !("signer" in parsedOptions)) {
            // no address, no signer, create signer and assign address to signer.address
            const signer = await this.createSigner();
            const localOptions = CreateNewLocalSubplebbitParsedOptionsSchema.parse({ ...parsedOptions, signer, address: signer.address });
            log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${localOptions.address})`);

            return this._createLocalSub(localOptions);
        } else if (!("address" in parsedOptions) && "signer" in parsedOptions) {
            const signer = await this.createSigner(parsedOptions.signer);
            const localOptions = CreateNewLocalSubplebbitParsedOptionsSchema.parse(<CreateNewLocalSubplebbitParsedOptions>{
                ...parsedOptions,
                address: signer.address,
                signer
            });
            return this._createLocalSub(localOptions);
        } else if ("address" in parsedOptions && "signer" in parsedOptions) return this._createLocalSub(parsedOptions);
        else throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { parsedOptions });
    }

    async createVote(options: z.infer<typeof CreateVoteFunctionArgumentSchema>): Promise<Vote> {
        const log = Logger("plebbit-js:plebbit:createVote");
        const parsedOptions = CreateVoteFunctionArgumentSchema.parse(options);
        const voteInstance = new Vote(this);

        if ("publication" in parsedOptions) voteInstance._initChallengeRequestProps(parsedOptions);
        else if ("signature" in parsedOptions) {
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

    async createCommentEdit(options: z.infer<typeof CreateCommentEditFunctionArgumentSchema>): Promise<CommentEdit> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");
        const parsedOptions = CreateCommentEditFunctionArgumentSchema.parse(options);
        const editInstance = new CommentEdit(this);

        if ("publication" in parsedOptions) editInstance._initChallengeRequestProps(parsedOptions);
        else if ("signature" in parsedOptions)
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

    createSigner(createSignerOptions?: CreateSignerOptions) {
        return createSigner(createSignerOptions);
    }

    async listSubplebbits(): Promise<string[]> {
        if (this.plebbitRpcClient) return this.plebbitRpcClient.listSubplebbits();
        const canCreateSubs = this._canCreateNewLocalSub();
        if (!canCreateSubs || !this.dataPath) return [];
        return nodeListSubplebbits(this);
    }

    async fetchCid(cid: string): Promise<string> {
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(cid);
        if (this.plebbitRpcClient) return this.plebbitRpcClient.fetchCid(parsedCid);
        else return this._clientsManager.fetchCid(parsedCid);
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
        if (!this.plebbitRpcClient) throw Error("Can't call rpcCall without having a rpc connection");
        return this.plebbitRpcClient.rpcCall(method, params);
    }

    async destroy() {
        // Clean up connections
        if (this.plebbitRpcClient) await this.plebbitRpcClient.destroy();
        await this._storage.destroy();
        await Promise.all(Object.values(this._storageLRUs).map((storage) => storage.destroy()));
    }

    toJSON() {
        return undefined;
    }
}
