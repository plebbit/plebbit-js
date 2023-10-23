import {
    StorageInterface,
    ChainProvider,
    CommentEditType,
    CommentIpfsType,
    CommentPubsubMessage,
    CommentType,
    CommentWithCommentUpdate,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreatePublicationOptions,
    CreateVoteOptions,
    GatewayClient,
    IpfsClient,
    PlebbitEvents,
    PlebbitOptions,
    PubsubClient,
    VotePubsubMessage,
    VoteType
} from "./types";
import { getDefaultDataPath, mkdir, nativeFunctions } from "./runtime/node/util";
import { Comment } from "./comment";
import { Subplebbit } from "./subplebbit/subplebbit";
import { doesEnsAddressHaveCapitalLetter, removeKeysWithUndefinedValues, throwWithErrorCode, timestamp } from "./util";
import Vote from "./vote";
import { createSigner, Signer } from "./signer";
import { Resolver } from "./resolver";
import { CommentEdit } from "./comment-edit";
import { getPlebbitAddressFromPrivateKey } from "./signer/util";
import isIPFS from "is-ipfs";
import Logger from "@plebbit/plebbit-logger";
import env from "./version";
import lodash from "lodash";
import { signComment, signCommentEdit, signVote } from "./signer/signatures";
import { Options as IpfsHttpClientOptions } from "ipfs-http-client";
import { Buffer } from "buffer";
import { TypedEmitter } from "tiny-typed-emitter";
import { CreateSignerOptions, SignerType } from "./signer/constants";
import Stats from "./stats";
import Storage from "./runtime/node/storage";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import { ClientsManager } from "./clients/client-manager";
import PlebbitRpcClient from "./clients/plebbit-rpc-client";
import { PlebbitError } from "./plebbit-error";
import { GenericPlebbitRpcStateClient } from "./clients/plebbit-rpc-state-client";
import { CreateSubplebbitOptions, SubplebbitIpfsType, SubplebbitType } from "./subplebbit/types";

export class Plebbit extends TypedEmitter<PlebbitEvents> implements PlebbitOptions {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: IpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PubsubClient };
        chainProviders: { [chainProviderUrl: string]: ChainProvider };
        plebbitRpcClients: { [plebbitRpcUrl: string]: GenericPlebbitRpcStateClient };
    };
    resolver: Resolver;
    plebbitRpcClient?: PlebbitRpcClient;
    ipfsHttpClientsOptions?: IpfsHttpClientOptions[];
    pubsubHttpClientsOptions: IpfsHttpClientOptions[];
    plebbitRpcClientsOptions?: string[];
    dataPath?: string;
    resolveAuthorAddresses?: boolean;
    chainProviders: { [chainTicker: string]: ChainProvider };
    _storage: StorageInterface;
    stats: Stats;

    private _pubsubSubscriptions: Record<string, MessageHandlerFn>;
    _clientsManager: ClientsManager;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    private _userPlebbitOptions: PlebbitOptions;

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
            "noData"
        ];
        for (const option of Object.keys(options))
            if (!acceptedOptions.includes(<keyof PlebbitOptions>option)) throwWithErrorCode("ERR_PLEBBIT_OPTION_NOT_ACCEPTED", { option });

        this._userPlebbitOptions = options;
        this.plebbitRpcClientsOptions = options.plebbitRpcClientsOptions;
        if (this.plebbitRpcClientsOptions) this.plebbitRpcClient = new PlebbitRpcClient(this);

        this._pubsubSubscriptions = {};

        //@ts-expect-error
        this.clients = {};
        this.ipfsHttpClientsOptions =
            Array.isArray(options.ipfsHttpClientsOptions) && typeof options.ipfsHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(<string[]>options.ipfsHttpClientsOptions)
                : <IpfsHttpClientOptions[] | undefined>options.ipfsHttpClientsOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options

        const fallbackPubsubProviders = this.plebbitRpcClientsOptions ? undefined : [{ url: "https://pubsubprovider.xyz/api/v0" }];
        this.pubsubHttpClientsOptions =
            Array.isArray(options.pubsubHttpClientsOptions) && typeof options.pubsubHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(<string[]>options.pubsubHttpClientsOptions)
                : <IpfsHttpClientOptions[]>options.pubsubHttpClientsOptions || this.ipfsHttpClientsOptions || fallbackPubsubProviders;

        this.publishInterval = options.hasOwnProperty("publishInterval") ? options.publishInterval : 100000; // Default to 1.67 minutes
        this.updateInterval = options.hasOwnProperty("updateInterval") ? options.updateInterval : 60000; // Default to 1 minute
        this.noData = options.hasOwnProperty("noData") ? options.noData : false;

        this._initIpfsClients();
        this._initPubsubClients();
        this._initRpcClients();

        if (!this.noData && !this.plebbitRpcClient) this.dataPath = options.dataPath || getDefaultDataPath();
    }

    private _initIpfsClients() {
        this.clients.ipfsClients = {};
        if (!this.ipfsHttpClientsOptions) return;
        for (const clientOptions of this.ipfsHttpClientsOptions) {
            const ipfsClient = nativeFunctions.createIpfsClient(clientOptions);
            this.clients.ipfsClients[<string>clientOptions.url] = {
                _client: ipfsClient,
                _clientOptions: clientOptions,
                peers: ipfsClient.swarm.peers
            };
        }
    }

    private _initPubsubClients() {
        this.clients.pubsubClients = {};
        if (this.pubsubHttpClientsOptions)
            for (const clientOptions of this.pubsubHttpClientsOptions) {
                const ipfsClient =
                    this.clients.ipfsClients?.[<string>clientOptions.url]?._client || nativeFunctions.createIpfsClient(clientOptions); // Only create a new ipfs client if pubsub options is different than ipfs
                this.clients.pubsubClients[<string>clientOptions.url] = {
                    _client: ipfsClient,
                    _clientOptions: clientOptions,
                    peers: async () => {
                        const topics = await ipfsClient.pubsub.ls();
                        return lodash.uniq(lodash.flattenDeep(await Promise.all(topics.map((topic) => ipfsClient.pubsub.peers(topic)))));
                    }
                };
            }
    }

    private _initRpcClients() {
        this.clients.plebbitRpcClients = {};
        if (this.plebbitRpcClientsOptions)
            for (const rpcUrl of this.plebbitRpcClientsOptions)
                this.clients.plebbitRpcClients[rpcUrl] = new GenericPlebbitRpcStateClient("stopped");
    }

    private _initResolver(options: PlebbitOptions) {
        this.chainProviders = this.plebbitRpcClient
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
                  }
              };
        if (this.chainProviders?.eth && !this.chainProviders.eth.chainId) this.chainProviders.eth.chainId = 1;
        this.clients.chainProviders = this.chainProviders;

        this.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses") ? options.resolveAuthorAddresses : true;
        this.resolver = new Resolver({
            resolveAuthorAddresses: this.resolveAuthorAddresses,
            chainProviders: this.chainProviders
        });
    }

    private _parseUrlToOption(urlStrings: string[]): IpfsHttpClientOptions[] {
        const parsed = [];
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

        // If user did not provide ipfsGatewayUrls
        const fallbackGateways = this.plebbitRpcClient ? undefined : lodash.shuffle(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
        if (this.dataPath) await mkdir(this.dataPath, { recursive: true });
        this.clients.ipfsGateways = {};
        if (options.ipfsGatewayUrls) for (const gatewayUrl of options.ipfsGatewayUrls) this.clients.ipfsGateways[gatewayUrl] = {};
        else if (fallbackGateways) for (const gatewayUrl of fallbackGateways) this.clients.ipfsGateways[gatewayUrl] = {};

        // Init cache
        this._storage = new Storage({ dataPath: this.dataPath, noData: this.noData });
        await this._storage.init();

        // Init stats
        this.stats = new Stats({ _storage: this._storage, clients: this.clients });
        // Init resolver
        this._initResolver(options);
        // Init clients manager
        this._clientsManager = new ClientsManager(this);
    }

    async getSubplebbit(subplebbitAddress: string): Promise<Subplebbit> {
        const subplebbit = new Subplebbit(this);
        await subplebbit.initSubplebbit({ address: subplebbitAddress });
        subplebbit.update();
        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        let error: PlebbitError | undefined;
        const errorPromise = new Promise((resolve) => subplebbit.once("error", (err) => resolve((error = err))));
        await Promise.race([updatePromise, errorPromise]);
        await subplebbit.stop();
        if (error) throw error;

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
        comment.update();
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

    private async _initMissingFields(pubOptions: CreatePublicationOptions & { signer: CreateCommentOptions["signer"] }, log: Logger) {
        const clonedOptions = lodash.cloneDeep(pubOptions); // Clone to avoid modifying actual arguments provided by users
        if (!clonedOptions.timestamp) {
            clonedOptions.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp, defaulting to (${clonedOptions.timestamp})`);
        }
        if (!(<SignerType>clonedOptions.signer).address)
            (<SignerType>clonedOptions.signer).address = await getPlebbitAddressFromPrivateKey(clonedOptions.signer.privateKey);

        if (!clonedOptions?.author?.address) {
            clonedOptions.author = { ...clonedOptions.author, address: (<SignerType>clonedOptions.signer).address };
            log(`author.address was not provided, will define it to signer.address (${clonedOptions.author.address})`);
        }
        delete clonedOptions.author["shortAddress"]; // Forcefully delete shortAddress so it won't be a part of the signature
        return clonedOptions;
    }

    private async _createCommentInstance(
        options:
            | CreateCommentOptions
            | CommentIpfsType
            | CommentPubsubMessage
            | CommentWithCommentUpdate
            | Pick<CommentWithCommentUpdate, "cid">
    ) {
        options = options as CreateCommentOptions | CommentIpfsType | CommentPubsubMessage;
        const comment = new Comment(<CommentType>options, this);

        //@ts-expect-error
        if (typeof options["updatedAt"] === "number") await comment._initCommentUpdate(<CommentUpdate>options);
        return comment;
    }

    async createComment(
        options:
            | CreateCommentOptions
            | CommentWithCommentUpdate
            | CommentIpfsType
            | CommentPubsubMessage
            | CommentType
            | Comment
            | Pick<CommentWithCommentUpdate, "cid">
    ): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:createComment");
        if (options["cid"] && !isIPFS.cid(options["cid"])) throwWithErrorCode("ERR_CID_IS_INVALID", { cid: options["cid"] });

        const formattedOptions = options instanceof Comment ? options.toJSON() : options;
        formattedOptions["protocolVersion"] = formattedOptions["protocolVersion"] || env.PROTOCOL_VERSION;

        if (options["signature"] || options["cid"]) return this._createCommentInstance(formattedOptions);
        else {
            //@ts-expect-error
            const fieldsFilled = <CommentType>await this._initMissingFields(formattedOptions, log);
            fieldsFilled.signature = await signComment(<CreateCommentOptions>fieldsFilled, fieldsFilled.signer, this);
            return this._createCommentInstance(fieldsFilled);
        }
    }

    _canCreateNewLocalSub(): boolean {
        try {
            //@ts-ignore
            nativeFunctions.createDbHandler({ address: "", plebbit: this });
            return true;
        } catch {}

        return false;
    }

    private async _createSubplebbitRpc(options: CreateSubplebbitOptions | SubplebbitType | SubplebbitIpfsType) {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");

        if (options.address && !options.signer) {
            const rpcSubs = await this.listSubplebbits();
            const isSubLocal = rpcSubs.includes(options.address);
            if (isSubLocal)
                return this.getSubplebbit(options.address); // getSubplebbit will fetch the local sub through RPC subplebbitUpdate
            else return this._createRemoteSubplebbitInstance(options);
        } else {
            const newLocalSub = await this.plebbitRpcClient.createSubplebbit(options);
            log(`Created local-RPC subplebbit (${newLocalSub.address}) with props:`, newLocalSub.toJSON());
            return newLocalSub;
        }
    }

    private async _createRemoteSubplebbitInstance(options: CreateSubplebbitOptions | SubplebbitType | SubplebbitIpfsType) {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");

        const subplebbit = new Subplebbit(this);
        await subplebbit.initSubplebbit(options);
        log.trace(`Created remote subplebbit instance (${subplebbit.address})`);
        return subplebbit;
    }

    private async _createLocalSub(options: CreateSubplebbitOptions | SubplebbitType | SubplebbitIpfsType) {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        const canCreateLocalSub = this._canCreateNewLocalSub();
        if (!canCreateLocalSub) throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });
        const isLocalSub = (await this.listSubplebbits()).includes(options?.address); // Sub exists already, only pass address so we don't override other props
        const subplebbit = new Subplebbit(this);
        await subplebbit.initSubplebbit(isLocalSub ? { address: options.address } : options);
        await subplebbit.prePublish(); // May fail because sub is already being created (locked)
        log(
            `Created ${isLocalSub ? "" : "new"} local subplebbit (${subplebbit.address}) with props:`,
            removeKeysWithUndefinedValues(lodash.omit(subplebbit.toJSON(), ["signer"]))
        );
        return subplebbit;
    }

    async createSubplebbit(options: CreateSubplebbitOptions | SubplebbitType | SubplebbitIpfsType = {}): Promise<Subplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");

        if (options?.address && doesEnsAddressHaveCapitalLetter(options?.address))
            throw new PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: options?.address });

        if (this.plebbitRpcClient) return this._createSubplebbitRpc(options);

        const canCreateLocalSub = this._canCreateNewLocalSub();

        if (options.signer && !canCreateLocalSub)
            throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });

        if (!canCreateLocalSub) return this._createRemoteSubplebbitInstance(options);

        if (options.address && !options.signer) {
            const localSubs = await this.listSubplebbits();
            const isSubLocal = localSubs.includes(options.address);
            if (isSubLocal) return this._createLocalSub(options);
            else return this._createRemoteSubplebbitInstance(options);
        } else if (!options.address && !options.signer) {
            options.signer = await this.createSigner();
            options.address = (<Signer>options.signer).address;
            log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.address})`);

            return this._createLocalSub(options);
        } else if (!options.address && options.signer) {
            options.signer = await this.createSigner(options.signer);
            options.address = (<Signer>options.signer).address;
            return this._createLocalSub(options);
        } else return this._createLocalSub(options);
    }

    async createVote(options: CreateVoteOptions | VoteType | VotePubsubMessage): Promise<Vote> {
        const log = Logger("plebbit-js:plebbit:createVote");
        options["protocolVersion"] = options["protocolVersion"] || env.PROTOCOL_VERSION;

        if (options["signature"]) return new Vote(<VoteType>options, this);
        //@ts-ignore
        const finalOptions: VoteType = <VoteType>await this._initMissingFields(options, log);
        finalOptions.signature = await signVote(<CreateVoteOptions>finalOptions, finalOptions.signer, this);
        return new Vote(finalOptions, this);
    }

    async createCommentEdit(options: CreateCommentEditOptions | CommentEditType): Promise<CommentEdit> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");
        options["protocolVersion"] = options["protocolVersion"] || env.PROTOCOL_VERSION;

        if (options["signature"]) return new CommentEdit(<CommentEditType>options, this); // User just wants to instantiate a CommentEdit object, not publish
        //@ts-ignore
        const finalOptions: CommentEditType = <CommentEditType>await this._initMissingFields(options, log);
        //@ts-expect-error
        finalOptions.signature = await signCommentEdit(<CreateCommentEditOptions>finalOptions, options.signer, this);
        return new CommentEdit(finalOptions, this);
    }

    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer> {
        return createSigner(createSignerOptions);
    }

    async listSubplebbits(): Promise<string[]> {
        if (this.plebbitRpcClient) return this.plebbitRpcClient.listSubplebbits();
        const canCreateSubs = this._canCreateNewLocalSub();
        if (!canCreateSubs || !this.dataPath) return [];
        return nativeFunctions.listSubplebbits(this.dataPath);
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
}
