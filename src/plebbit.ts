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
    CreateSubplebbitOptions,
    CreateVoteOptions,
    GatewayClient,
    IpfsClient,
    PlebbitEvents,
    PlebbitOptions,
    PostType,
    PubsubClient,
    SubplebbitIpfsType,
    SubplebbitType,
    VotePubsubMessage,
    VoteType
} from "./types";
import { getDefaultDataPath, mkdir, nativeFunctions } from "./runtime/node/util";
import { Comment } from "./comment";
import { Subplebbit } from "./subplebbit";
import { doesEnsAddressHaveCapitalLetter, removeKeysWithUndefinedValues, throwWithErrorCode, timestamp } from "./util";
import Vote from "./vote";
import { createSigner, Signer, verifyComment, verifySubplebbit } from "./signer";
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
import { subplebbitForPublishingCache } from "./constants";
import PlebbitRpcClient from "./clients/plebbit-rpc-client";
import assert from "assert";
import { PlebbitError } from "./plebbit-error";
import waitUntil from "async-wait-until";

export class Plebbit extends TypedEmitter<PlebbitEvents> implements PlebbitOptions {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: IpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PubsubClient };
        chainProviders: { [chainProviderUrl: string]: ChainProvider };
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

        this.plebbitRpcClientsOptions = options.plebbitRpcClientsOptions;
        if (this.plebbitRpcClientsOptions) this.plebbitRpcClient = new PlebbitRpcClient(this);

        this._pubsubSubscriptions = {};

        //@ts-expect-error
        this.clients = {};
        this.ipfsHttpClientsOptions =
            Array.isArray(options.ipfsHttpClientsOptions) && typeof options.ipfsHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(<string[]>options.ipfsHttpClientsOptions)
                : <IpfsHttpClientOptions[] | undefined>options.ipfsHttpClientsOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options

        const fallbackPubsubProviders = [{ url: "https://pubsubprovider.xyz/api/v0" }];
        this.pubsubHttpClientsOptions =
            Array.isArray(options.pubsubHttpClientsOptions) && typeof options.pubsubHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(<string[]>options.pubsubHttpClientsOptions)
                : <IpfsHttpClientOptions[]>options.pubsubHttpClientsOptions || this.ipfsHttpClientsOptions || fallbackPubsubProviders;

        this.publishInterval = options.hasOwnProperty("publishInterval") ? options.publishInterval : 100000; // Default to 1.67 minutes
        this.updateInterval = options.hasOwnProperty("updateInterval") ? options.updateInterval : 60000; // Default to 1 minute
        this.noData = options.hasOwnProperty("noData") ? options.noData : false;

        this._initIpfsClients();
        this._initPubsubClients();

        if (!this.noData) this.dataPath = options.dataPath || getDefaultDataPath();
    }

    private _initIpfsClients() {
        if (!this.ipfsHttpClientsOptions) return;
        this.clients.ipfsClients = {};
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

    private _initResolver(options: PlebbitOptions) {
        this.chainProviders = options.chainProviders || {
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
        if (this.chainProviders.eth && !this.chainProviders.eth.chainId) this.chainProviders.eth.chainId = 1;
        for (const chainTicker of Object.keys(this.chainProviders))
            assert(
                typeof this.chainProviders[chainTicker].chainId === "number",
                `chain id for chainTicker (${chainTicker}) must be defined`
            );

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
        const fallbackGateways = lodash.shuffle(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
        if (this.dataPath) await mkdir(this.dataPath, { recursive: true });
        this.clients.ipfsGateways = {};
        if (options.ipfsGatewayUrls) for (const gatewayUrl of options.ipfsGatewayUrls) this.clients.ipfsGateways[gatewayUrl] = {};
        else if (this.clients.ipfsClients) {
            for (const ipfsClient of Object.values(this.clients.ipfsClients)) {
                try {
                    let gatewayFromNode = await ipfsClient._client.config.get("Addresses.Gateway");
                    if (Array.isArray(gatewayFromNode)) gatewayFromNode = gatewayFromNode[0];
                    const splits = gatewayFromNode.toString().split("/");
                    const ipfsGatewayUrl = `http://${splits[2]}:${splits[4]}`;
                    log.trace(`plebbit.ipfsGatewayUrl (${ipfsGatewayUrl}) retrieved from IPFS node (${ipfsClient._clientOptions.url})`);
                    this.clients.ipfsGateways[ipfsGatewayUrl] = {};
                } catch (e) {
                    log(`Failed to retrieve gateway url from ipfs node (${ipfsClient._clientOptions.url})`);
                }
            }
        } else for (const gatewayUrl of fallbackGateways) this.clients.ipfsGateways[gatewayUrl] = {};

        // Init cache
        this._storage = new Storage({ dataPath: this.dataPath, noData: this.noData });
        await this._storage.init();

        // Init stats
        this.stats = new Stats({ _storage: this._storage, clients: this.clients });
        // Init resolver
        this._initResolver(options);
        // Init clients manager
        this._clientsManager = new ClientsManager(this);

        if (this.plebbitRpcClient) await this.plebbitRpcClient.init();
    }

    async getSubplebbit(subplebbitAddress: string): Promise<Subplebbit> {
        if (typeof subplebbitAddress !== "string" || subplebbitAddress.length === 0)
            throwWithErrorCode("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress });
        if (doesEnsAddressHaveCapitalLetter(subplebbitAddress))
            throw new PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress });
        if (this.plebbitRpcClient) {
            const subcriptionId = await this.plebbitRpcClient.subplebbitUpdate(subplebbitAddress);
            const getFirstSubUpdate = () =>
                this.plebbitRpcClient.getSubscriptionMessages(subcriptionId)?.find((msg) => msg.params.event === "update");
            await waitUntil(() => getFirstSubUpdate());
            const subProps = getFirstSubUpdate().params.result;
            const subplebbit = new Subplebbit(this);
            await subplebbit.initSubplebbit(subProps);
            await this.plebbitRpcClient.unsubscribe(subcriptionId);
            return subplebbit;
        }
        const resolvedSubplebbitAddress = await this._clientsManager.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
        if (!resolvedSubplebbitAddress)
            throw new PlebbitError("ERR_ENS_ADDRESS_HAS_NO_SUBPLEBBIT_ADDRESS_TEXT_RECORD", { ensAddress: subplebbitAddress });
        const subplebbitJson: SubplebbitIpfsType = JSON.parse(await this._clientsManager.fetchSubplebbitIpns(resolvedSubplebbitAddress));
        const signatureValidity = await verifySubplebbit(subplebbitJson, this.resolveAuthorAddresses, this._clientsManager, true);

        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });

        subplebbitForPublishingCache.set(subplebbitAddress, lodash.pick(subplebbitJson, ["encryption", "address", "pubsubTopic"]));

        const subplebbit = new Subplebbit(this);
        await subplebbit.initSubplebbit(subplebbitJson);

        return subplebbit;
    }

    async getComment(cid: string): Promise<Comment> {
        if (!isIPFS.cid(cid)) throwWithErrorCode("ERR_CID_IS_INVALID", `getComment: cid (${cid}) is invalid as a CID`);
        if (this.plebbitRpcClient) return this.plebbitRpcClient.getComment(cid);
        const commentJson: CommentIpfsType = JSON.parse(await this.fetchCid(cid));
        const signatureValidity = await verifyComment(commentJson, this.resolveAuthorAddresses, this._clientsManager, true);
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { cid, signatureValidity });

        return this.createComment({ ...commentJson, cid });
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
        options: CreateCommentOptions | CommentIpfsType | CommentPubsubMessage | CommentWithCommentUpdate
    ) {
        options = options as CreateCommentOptions | CommentIpfsType | CommentPubsubMessage;
        const comment = new Comment(<CommentType>options, this);

        //@ts-expect-error
        if (typeof options["updatedAt"] === "number") await comment._initCommentUpdate(<CommentUpdate>options);
        return comment;
    }

    async createComment(
        options: CreateCommentOptions | CommentWithCommentUpdate | CommentIpfsType | CommentPubsubMessage | CommentType | Comment
    ): Promise<Comment> {
        const log = Logger("plebbit-js:plebbit:createComment");

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

    _canRunSub(): boolean {
        try {
            //@ts-ignore
            nativeFunctions.createDbHandler({ address: "", plebbit: this });
            return true;
        } catch {}

        return false;
    }

    async createSubplebbit(options: CreateSubplebbitOptions | SubplebbitType | SubplebbitIpfsType = {}): Promise<Subplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        if (this.plebbitRpcClient) return this.plebbitRpcClient.createSubplebbit(options);
        const canRunSub = this._canRunSub();

        if (options?.address && doesEnsAddressHaveCapitalLetter(options?.address))
            throw new PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: options?.address });

        const localSub = async () => {
            if (!canRunSub) throwWithErrorCode("ERR_PLEBBIT_MISSING_NATIVE_FUNCTIONS", { canRunSub, dataPath: this.dataPath });

            const subplebbit = new Subplebbit(this);
            await subplebbit.initSubplebbit(options);
            await subplebbit.prePublish(); // May fail because sub is already being created (locked)
            log(
                `Created subplebbit (${subplebbit.address}) with props:`,
                removeKeysWithUndefinedValues(lodash.omit(subplebbit.toJSON(), ["signer"]))
            );
            return subplebbit;
        };

        const remoteSub = async () => {
            const subplebbit = new Subplebbit(this);
            await subplebbit.initSubplebbit(options);
            return subplebbit;
        };

        if (options.address && !options.signer) {
            if (!canRunSub) return remoteSub();
            else {
                const dbHandler = nativeFunctions.createDbHandler({ address: options.address, plebbit: this });
                const isSubLocal = dbHandler.subDbExists();
                if (isSubLocal) return localSub();
                else return remoteSub();
            }
        } else if (!options.address && !options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);
            else {
                options.signer = await this.createSigner();
                options.address = (<Signer>options.signer).address;
                log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.address})`);
                return localSub();
            }
        } else if (!options.address && options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);
            const signer = await this.createSigner(options.signer);
            options.address = signer.address;
            options.signer = signer;
            return localSub();
        } else if (!canRunSub) return remoteSub();
        else return localSub();
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
        const canRunSub = this._canRunSub();
        if (!canRunSub || !this.dataPath) return [];
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
