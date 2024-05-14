import { getDefaultDataPath, listSubplebbits as nodeListSubplebbits, nativeFunctions, createIpfsClient } from "./runtime/node/util.js";
import {
    StorageInterface,
    ChainProvider,
    CommentIpfsType,
    CommentPubsubMessage,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateVoteOptions,
    GatewayClient,
    IpfsClient,
    PlebbitEvents,
    PlebbitOptions,
    PubsubClient,
    VotePubsubMessage,
    ParsedPlebbitOptions,
    LRUStorageInterface,
    LRUStorageConstructor,
    PubsubSubscriptionHandler,
    CommentOptionsToSign,
    VoteOptionsToSign,
    CommentEditOptionsToSign,
    LocalVoteOptions,
    CommentEditPubsubMessage,
    CommentIpfsWithCid,
    CommentTypeJson,
    DecryptedChallengeRequestComment,
    DecryptedChallengeRequestVote,
    DecryptedChallengeRequestCommentEdit
} from "./types.js";
import { Comment } from "./publications/comment/comment.js";
import {
    doesDomainAddressHaveCapitalLetter,
    isIpfsCid,
    removeNullUndefinedEmptyObjectsValuesRecursively,
    throwWithErrorCode,
    timestamp
} from "./util.js";
import Vote from "./publications/vote.js";
import { createSigner, Signer } from "./signer/index.js";
import { CommentEdit } from "./publications/comment-edit.js";
import { getPlebbitAddressFromPrivateKey } from "./signer/util.js";
import Logger from "@plebbit/plebbit-logger";
import env from "./version.js";
import { cleanUpBeforePublishing, signComment, signCommentEdit, signVote } from "./signer/signatures.js";
import { Buffer } from "buffer";
import { TypedEmitter } from "tiny-typed-emitter";
import { CreateSignerOptions, SignerType } from "./signer/constants.js";
import Stats from "./stats.js";
import Storage from "./runtime/node/storage.js";
import { ClientsManager } from "./clients/client-manager.js";
import PlebbitRpcClient from "./clients/plebbit-rpc-client.js";
import { PlebbitError } from "./plebbit-error.js";
import { GenericPlebbitRpcStateClient } from "./clients/plebbit-rpc-state-client.js";
import {
    CreateInstanceOfLocalOrRemoteSubplebbitOptions,
    CreateNewLocalSubplebbitParsedOptions,
    CreateNewLocalSubplebbitUserOptions,
    CreateRemoteSubplebbitOptions,
    InternalSubplebbitRpcType,
    InternalSubplebbitType,
    RemoteSubplebbitJsonType,
    SubplebbitIpfsType
} from "./subplebbit/types.js";
import LRUStorage from "./runtime/node/lru-storage.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./subplebbit/rpc-remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import { LocalSubplebbit } from "./runtime/node/subplebbit/local-subplebbit.js";
import pTimeout, { TimeoutError } from "p-timeout";
import * as remeda from "remeda";

export class Plebbit extends TypedEmitter<PlebbitEvents> implements PlebbitOptions {
    plebbitRpcClient?: PlebbitRpcClient;
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
    private _pubsubSubscriptions: Record<string, PubsubSubscriptionHandler>;
    _clientsManager!: ClientsManager;
    private _userPlebbitOptions: PlebbitOptions; // this is the raw input from user

    private _storageLRUs: Record<string, LRUStorageInterface> = {}; // Cache name to storage interface

    constructor(options: PlebbitOptions = {}) {
        super();
        const acceptedOptions: (keyof PlebbitOptions)[] = [
            "chainProviders",
            "dataPath",
            "ipfsGatewayUrls",
            "ipfsHttpClientsOptions",
            "pubsubHttpClientsOptions",
            "resolveAuthorAddresses",
            "plebbitRpcClientsOptions",
            "publishInterval",
            "updateInterval",
            "noData",
            "browserLibp2pJsPublish"
        ];
        for (const option of remeda.keys.strict(options))
            if (!acceptedOptions.includes(<keyof PlebbitOptions>option)) throwWithErrorCode("ERR_PLEBBIT_OPTION_NOT_ACCEPTED", { option });

        this._userPlebbitOptions = options;
        //@ts-expect-error
        this.parsedPlebbitOptions = remeda.clone(options);
        this.parsedPlebbitOptions.plebbitRpcClientsOptions = this.plebbitRpcClientsOptions = options.plebbitRpcClientsOptions;
        if (this.plebbitRpcClientsOptions) this.plebbitRpcClient = new PlebbitRpcClient(this);

        this._pubsubSubscriptions = {};

        //@ts-expect-error
        this.clients = {};
        this.ipfsHttpClientsOptions = this.parsedPlebbitOptions.ipfsHttpClientsOptions =
            Array.isArray(options.ipfsHttpClientsOptions) && typeof options.ipfsHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(<string[]>options.ipfsHttpClientsOptions)
                : <IpfsClient["_clientOptions"][] | undefined>options.ipfsHttpClientsOptions;

        const fallbackPubsubProviders = this.plebbitRpcClientsOptions ? undefined : [{ url: "https://pubsubprovider.xyz/api/v0" }];
        this.pubsubHttpClientsOptions = this.parsedPlebbitOptions.pubsubHttpClientsOptions =
            Array.isArray(options.pubsubHttpClientsOptions) && typeof options.pubsubHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(<string[]>options.pubsubHttpClientsOptions)
                : <IpfsClient["_clientOptions"][]>options.pubsubHttpClientsOptions ||
                  this.ipfsHttpClientsOptions ||
                  fallbackPubsubProviders;

        this.publishInterval = this.parsedPlebbitOptions.publishInterval =
            typeof options.publishInterval === "number" ? options.publishInterval : 20000; // Default to 20s
        this.updateInterval = this.parsedPlebbitOptions.updateInterval =
            typeof options.updateInterval === "number" ? options.updateInterval : 60000; // Default to 1 minute
        this.noData = this.parsedPlebbitOptions.noData = typeof options.noData === "boolean" ? options.noData : false;
        this.browserLibp2pJsPublish = this.parsedPlebbitOptions.browserLibp2pJsPublish =
            typeof options.browserLibp2pJsPublish === "boolean" ? options.browserLibp2pJsPublish : false;

        this.resolveAuthorAddresses = this.parsedPlebbitOptions.resolveAuthorAddresses =
            typeof options.resolveAuthorAddresses === "boolean" ? options.resolveAuthorAddresses : true;

        this._initIpfsClients();
        this._initPubsubClients();
        this._initRpcClients();
        this._initIpfsGateways();
        this._initChainProviders(options);

        if (!this.noData && !this.plebbitRpcClient)
            this.dataPath = this.parsedPlebbitOptions.dataPath = options.dataPath || getDefaultDataPath();
    }

    private _initIpfsClients() {
        this.clients.ipfsClients = {};
        if (!this.ipfsHttpClientsOptions) return;
        if (!nativeFunctions)
            throw Error("Native function is defined at all. Can't create ipfs client: " + JSON.stringify(this._userPlebbitOptions));
        for (const clientOptions of this.ipfsHttpClientsOptions) {
            const ipfsClient = createIpfsClient(clientOptions);
            this.clients.ipfsClients[<string>clientOptions.url] = {
                _client: ipfsClient,
                _clientOptions: clientOptions,
                peers: ipfsClient.swarm.peers
            };
        }
    }

    private _initPubsubClients() {
        this.clients.pubsubClients = {};
        if (this.browserLibp2pJsPublish)
            //@ts-expect-error
            this.clients.pubsubClients["browser-libp2p-pubsub"] = {}; // should be defined fully else where
        else if (this.pubsubHttpClientsOptions)
            for (const clientOptions of this.pubsubHttpClientsOptions) {
                const ipfsClient = this.clients.ipfsClients?.[<string>clientOptions.url]?._client || createIpfsClient(clientOptions); // Only create a new ipfs client if pubsub options is different than ipfs
                this.clients.pubsubClients[<string>clientOptions.url] = {
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

    private _initRpcClients() {
        this.clients.plebbitRpcClients = {};
        if (this.parsedPlebbitOptions.plebbitRpcClientsOptions)
            for (const rpcUrl of <string[]>this.plebbitRpcClientsOptions)
                this.clients.plebbitRpcClients[rpcUrl] = new GenericPlebbitRpcStateClient("stopped");
    }

    private _initChainProviders(options: PlebbitOptions) {
        this.chainProviders = this.parsedPlebbitOptions.chainProviders = this.plebbitRpcClient
            ? {}
            : options.chainProviders || {
                  eth: { urls: ["viem", "ethers.js"], chainId: 1 },
                  avax: {
                      urls: ["https://api.avax.network/ext/bc/C/rpc"],
                      chainId: 43114
                  },
                  matic: {
                      urls: ["https://polygon-rpc.com"],
                      chainId: 137
                  },
                  sol: {
                      urls: ["web3.js", "https://solana.api.onfinality.io/public"],
                      chainId: -1 // no chain ID for solana
                  }
              };
        if ("eth" in this.chainProviders && remeda.isPlainObject(this.chainProviders.eth) && this.chainProviders.eth.chainId !== 1)
            this.chainProviders.eth.chainId = 1;
        this.clients.chainProviders = this.chainProviders;
    }

    private _initIpfsGateways() {
        // If user did not provide ipfsGatewayUrls
        const fallbackGateways = this.plebbitRpcClient ? undefined : remeda.shuffle(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
        this.clients.ipfsGateways = {};
        if (this.parsedPlebbitOptions.ipfsGatewayUrls)
            for (const gatewayUrl of this.parsedPlebbitOptions.ipfsGatewayUrls) this.clients.ipfsGateways[gatewayUrl] = {};
        else if (fallbackGateways) for (const gatewayUrl of fallbackGateways) this.clients.ipfsGateways[gatewayUrl] = {};
    }

    private _parseUrlToOption(urlStrings: string[]): IpfsClient["_clientOptions"][] {
        const parsed: IpfsClient["_clientOptions"][] = [];
        for (const urlString of urlStrings) {
            const url = new URL(urlString);
            const authorization =
                url.username && url.password ? "Basic " + Buffer.from(`${url.username}:${url.password}`).toString("base64") : undefined;
            parsed.push({
                url: authorization ? url.origin + url.pathname : urlString,
                ...(authorization ? { headers: { authorization, origin: "http://localhost" } } : undefined)
            });
        }
        return parsed;
    }

    async _init(options: PlebbitOptions) {
        const log = Logger("plebbit-js:plebbit:_init");

        // Init storage
        this._storage = new Storage({ dataPath: this.dataPath, noData: this.noData });
        await this._storage.init();

        // Init stats
        this.stats = new Stats({ _storage: this._storage, clients: this.clients });
        // Init clients manager
        this._clientsManager = new ClientsManager(this);
    }

    async getSubplebbit(subplebbitAddress: string) {
        const subplebbit = await this.createSubplebbit({ address: subplebbitAddress }); // I think it should call plebbit.createSubplebbit here

        if (typeof subplebbit.createdAt === "number") return <RpcLocalSubplebbit | LocalSubplebbit>subplebbit; // It's a local sub, and alreadh has been loaded, no need to wait
        const timeoutMs = this._clientsManager.getGatewayTimeoutMs("subplebbit");
        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        let updateError: PlebbitError | undefined;
        subplebbit.on("error", (err) => (updateError = err));
        try {
            await subplebbit.update();
            await pTimeout(updatePromise, {
                milliseconds: timeoutMs,
                message: updateError || new TimeoutError(`plebbit.getSubplebbit(${subplebbitAddress}) timed out after ${timeoutMs}ms`)
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

    async getComment(cid: string): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:getComment");
        const comment = await this.createComment({ cid });

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
            log.error(`Failed to load comment (${cid}) due to error: ${error}`);
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
        const filledSigner: SignerType = {
            ...finalOptions.signer,
            address: await getPlebbitAddressFromPrivateKey(finalOptions.signer.privateKey)
        };
        const filledAuthor = { ...finalOptions.author, address: finalOptions.author?.address || filledSigner.address };
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

    async createComment(
        options:
            | CreateCommentOptions
            | CommentTypeJson
            | CommentIpfsType
            | CommentPubsubMessage
            | DecryptedChallengeRequestComment
            | Comment
            | Pick<CommentIpfsWithCid, "cid">
            | Pick<CommentIpfsWithCid, "cid" | "subplebbitAddress">
    ): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:createComment");
        if ("cid" in options && typeof options.cid === "string" && !isIpfsCid(options.cid))
            throwWithErrorCode("ERR_CID_IS_INVALID", { cid: options.cid });

        if ("signature" in options && "signer" in options) throw Error("You can't sign an already signed comment");

        if (options instanceof Comment) return this._createCommentInstanceFromExistingCommentInstance(options);
        const commentInstance = new Comment(this);
        if ("cid" in options && typeof options.cid === "string") {
            commentInstance.setCid(options.cid);
            if (Object.keys(options).length === 1) return commentInstance; // No need to initialize other props if {cid: string} is provided
        }

        if ("publication" in options) commentInstance._initChallengeRequestProps(options);
        else if ("depth" in options) {
            // Options is CommentIpfs
            commentInstance._initIpfsProps(options);
        } else if ("signature" in options) {
            // Options is CommentPubsubMessage
            commentInstance._initPubsubMessageProps(options);
        } else if ("signer" in options) {
            // we're creating a new comment to sign and publish here
            const fieldsFilled = <CommentOptionsToSign>await this._initMissingFieldsOfPublicationBeforeSigning(options, log);
            const cleanedFieldsFilled = cleanUpBeforePublishing(fieldsFilled);
            const signedComment = { ...cleanedFieldsFilled, signature: await signComment(cleanedFieldsFilled, fieldsFilled.signer, this) };
            commentInstance._initLocalProps(signedComment);
        } else if ("subplebbitAddress" in options && typeof options.subplebbitAddress === "string")
            commentInstance.setSubplebbitAddress(options.subplebbitAddress);
        else {
            throw Error("Make sure you provided a remote comment props or signer to create a new local comment");
        }

        if ("updatedAt" in options && typeof options.updatedAt === "number") await commentInstance._initCommentUpdate(options);

        return commentInstance;
    }

    _canCreateNewLocalSub(): boolean {
        const isNode = typeof process?.versions?.node !== "undefined";
        return isNode;
    }

    private async _createSubplebbitRpc(
        options:
            | CreateNewLocalSubplebbitUserOptions
            | CreateRemoteSubplebbitOptions
            | SubplebbitIpfsType
            | InternalSubplebbitRpcType
            | RpcRemoteSubplebbit
            | RpcLocalSubplebbit
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
                const parsedOptions = options instanceof RpcRemoteSubplebbit ? options.toJSONIpfs() : options;
                await remoteSub.initRemoteSubplebbitPropsNoMerge(parsedOptions);
                return remoteSub;
            }
        } else if (!("address" in options)) {
            // We're creating a new local sub
            const newLocalSub = await this.plebbitRpcClient!.createSubplebbit(options);
            log(
                `Created local-RPC subplebbit (${newLocalSub.address}) with props:`,
                removeNullUndefinedEmptyObjectsValuesRecursively(newLocalSub.toJSON())
            );
            return newLocalSub;
        } else throw Error("Failed to create subplebbit rpc instance, are you sure you provided the correct args?");
    }

    private async _createRemoteSubplebbitInstance(
        options: RemoteSubplebbit | RemoteSubplebbitJsonType | SubplebbitIpfsType | CreateRemoteSubplebbitOptions
    ) {
        const log = Logger("plebbit-js:plebbit:createRemoteSubplebbit");

        log.trace("Received subplebbit options to create a remote subplebbit instance:", options);
        if (!options.address)
            throw new PlebbitError("ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS", {
                options
            });
        const subplebbit = new RemoteSubplebbit(this);
        const subProps = options instanceof RemoteSubplebbit ? options.toJSONIpfs() : options;
        await subplebbit.initRemoteSubplebbitPropsNoMerge(subProps);

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
            return subplebbit;
        } else if ("signer" in options) {
            // This is a new sub

            await subplebbit.initNewLocalSubPropsNoMerge(options); // We're initializing a new local sub props here
            await subplebbit._createNewLocalSubDb();
            log.trace(
                `Created a new local subplebbit (${subplebbit.address}) with props:`,
                removeNullUndefinedEmptyObjectsValuesRecursively(subplebbit.toJSON())
            );
            return subplebbit;
        } else throw Error("Are you trying to create a local sub with no address or signer? This is a critical error");
    }

    async createSubplebbit(
        options:
            | CreateNewLocalSubplebbitUserOptions
            | CreateRemoteSubplebbitOptions
            | RemoteSubplebbitJsonType
            | SubplebbitIpfsType
            | InternalSubplebbitType
            | RemoteSubplebbit
            | RpcLocalSubplebbit
            | RpcRemoteSubplebbit
            | LocalSubplebbit = {}
    ): Promise<RemoteSubplebbit | RpcRemoteSubplebbit | RpcLocalSubplebbit | LocalSubplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        if ("address" in options && typeof options.address !== "string")
            throw new PlebbitError("ERR_SUB_ADDRESS_IS_PROVIDED_AS_NULL_OR_UNDEFINED", { options });
        log.trace("Received options: ", options);

        if ("address" in options && options?.address && doesDomainAddressHaveCapitalLetter(options.address))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { ...options });

        if (this.plebbitRpcClient) return this._createSubplebbitRpc(options);

        const canCreateLocalSub = this._canCreateNewLocalSub();

        if ("signer" in options && !canCreateLocalSub)
            throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });

        if (!canCreateLocalSub)
            return this._createRemoteSubplebbitInstance(
                <CreateRemoteSubplebbitOptions | RemoteSubplebbitJsonType | SubplebbitIpfsType | RemoteSubplebbit>options
            );

        if ("address" in options && !("signer" in options)) {
            // sub is already created, need to check if it's local or remote
            const localSubs = await this.listSubplebbits();
            const isSubLocal = localSubs.includes(options.address);
            if (isSubLocal) return this._createLocalSub({ address: options.address });
            else
                return this._createRemoteSubplebbitInstance(
                    <CreateRemoteSubplebbitOptions | RemoteSubplebbitJsonType | SubplebbitIpfsType | RemoteSubplebbit>options
                );
        } else if (!("address" in options) && !("signer" in options)) {
            // no address, no signer, create signer and assign address to signer.address
            const signer = await this.createSigner();
            const localOptions: CreateNewLocalSubplebbitParsedOptions = { ...options, signer, address: signer.address };
            log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${localOptions.address})`);

            return this._createLocalSub(localOptions);
        } else if (!("address" in options) && "signer" in options) {
            const signer = await this.createSigner(options.signer);
            const localOptions: CreateNewLocalSubplebbitParsedOptions = { ...options, address: signer.address, signer };
            return this._createLocalSub(localOptions);
        } else if ("address" in options && "signer" in options) return this._createLocalSub(options);
        else throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { options });
    }

    async createVote(options: CreateVoteOptions | VotePubsubMessage | DecryptedChallengeRequestVote): Promise<Vote> {
        const log = Logger("plebbit-js:plebbit:createVote");
        const voteInstance = new Vote(this);

        if ("signature" in options && "signer" in options) throw Error("You can't sign an already signed vote");

        if ("publication" in options) voteInstance._initChallengeRequestProps(options);
        else if ("signature" in options) {
            voteInstance._initRemoteProps(options);
        } else {
            const finalOptions = <VoteOptionsToSign>await this._initMissingFieldsOfPublicationBeforeSigning(options, log);
            const cleanedFinalOptions = cleanUpBeforePublishing(finalOptions);
            const signedVote: LocalVoteOptions = {
                ...cleanedFinalOptions,
                signature: await signVote(cleanedFinalOptions, finalOptions.signer, this)
            };

            voteInstance._initLocalProps(signedVote);
        }
        return voteInstance;
    }

    async createCommentEdit(
        options: CreateCommentEditOptions | CommentEditPubsubMessage | DecryptedChallengeRequestCommentEdit
    ): Promise<CommentEdit> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");
        const editInstance = new CommentEdit(this);

        if ("signature" in options && "signer" in options) throw Error("You can't sign an already signed comment edit");

        if ("publication" in options) editInstance._initChallengeRequestProps(options);
        else if ("signature" in options)
            editInstance._initRemoteProps(options); // User just wants to instantiate a CommentEdit object, not publish
        else {
            const finalOptions = <CommentEditOptionsToSign>await this._initMissingFieldsOfPublicationBeforeSigning(options, log);
            const cleanedFinalOptions = cleanUpBeforePublishing(finalOptions);
            const signedEdit = { ...cleanedFinalOptions, signature: await signCommentEdit(cleanedFinalOptions, finalOptions.signer, this) };
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

    async fetchCid(cid: string) {
        if (this.plebbitRpcClient) return this.plebbitRpcClient.fetchCid(cid);
        else return this._clientsManager.fetchCid(cid);
    }

    // Used to pre-subscribe so publishing on pubsub would be faster
    async pubsubSubscribe(subplebbitAddress: string) {
        if (this._pubsubSubscriptions[subplebbitAddress]) return;
        const handler = () => {};
        await this._clientsManager.pubsubSubscribe(subplebbitAddress, handler);
        this._pubsubSubscriptions[subplebbitAddress] = handler;
    }

    async pubsubUnsubscribe(subplebbitAddress: string) {
        if (!this._pubsubSubscriptions[subplebbitAddress]) return;
        await this._clientsManager.pubsubUnsubscribe(subplebbitAddress, this._pubsubSubscriptions[subplebbitAddress]);
        delete this._pubsubSubscriptions[subplebbitAddress];
    }

    async resolveAuthorAddress(authorAddress: string) {
        const resolved = await this._clientsManager.resolveAuthorAddressIfNeeded(authorAddress);
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
