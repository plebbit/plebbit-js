import { getDefaultDataPath, listSubplebbits as nodeListSubplebbits, nativeFunctions, createIpfsClient } from "./runtime/browser/util.js";
import { Comment } from "./comment.js";
import { doesDomainAddressHaveCapitalLetter, isIpfsCid, removeKeysWithUndefinedValues, throwWithErrorCode, timestamp } from "./util.js";
import Vote from "./vote.js";
import { createSigner } from "./signer/index.js";
import { Resolver } from "./resolver.js";
import { CommentEdit } from "./comment-edit.js";
import { getPlebbitAddressFromPrivateKey } from "./signer/util.js";
import Logger from "@plebbit/plebbit-logger";
import env from "./version.js";
import lodash from "lodash";
import { cleanUpBeforePublishing, signComment, signCommentEdit, signVote } from "./signer/signatures.js";
import { Buffer } from "buffer";
import { TypedEmitter } from "tiny-typed-emitter";
import Stats from "./stats.js";
import Storage from "./runtime/browser/storage.js";
import { ClientsManager } from "./clients/client-manager.js";
import PlebbitRpcClient from "./clients/plebbit-rpc-client.js";
import { PlebbitError } from "./plebbit-error.js";
import { GenericPlebbitRpcStateClient } from "./clients/plebbit-rpc-state-client.js";
import LRUStorage from "./runtime/browser/lru-storage.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./subplebbit/rpc-remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import { LocalSubplebbit } from "./runtime/browser/subplebbit/local-subplebbit.js";
export class Plebbit extends TypedEmitter {
    constructor(options = {}) {
        super();
        this._storageLRUs = {}; // Cache name to interface
        const acceptedOptions = [
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
        for (const option of Object.keys(options))
            if (!acceptedOptions.includes(option))
                throwWithErrorCode("ERR_PLEBBIT_OPTION_NOT_ACCEPTED", { option });
        this._userPlebbitOptions = options;
        //@ts-expect-error
        this.parsedPlebbitOptions = lodash.cloneDeep(options);
        this.parsedPlebbitOptions.plebbitRpcClientsOptions = this.plebbitRpcClientsOptions = options.plebbitRpcClientsOptions;
        if (this.plebbitRpcClientsOptions)
            this.plebbitRpcClient = new PlebbitRpcClient(this);
        this._pubsubSubscriptions = {};
        //@ts-expect-error
        this.clients = {};
        this.ipfsHttpClientsOptions = this.parsedPlebbitOptions.ipfsHttpClientsOptions =
            Array.isArray(options.ipfsHttpClientsOptions) && typeof options.ipfsHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(options.ipfsHttpClientsOptions)
                : options.ipfsHttpClientsOptions;
        const fallbackPubsubProviders = this.plebbitRpcClientsOptions ? undefined : [{ url: "https://pubsubprovider.xyz/api/v0" }];
        this.pubsubHttpClientsOptions = this.parsedPlebbitOptions.pubsubHttpClientsOptions =
            Array.isArray(options.pubsubHttpClientsOptions) && typeof options.pubsubHttpClientsOptions[0] === "string"
                ? this._parseUrlToOption(options.pubsubHttpClientsOptions)
                : options.pubsubHttpClientsOptions ||
                    this.ipfsHttpClientsOptions ||
                    fallbackPubsubProviders;
        this.publishInterval = this.parsedPlebbitOptions.publishInterval = options.hasOwnProperty("publishInterval")
            ? options.publishInterval
            : 20000; // Default to 20s
        this.updateInterval = this.parsedPlebbitOptions.updateInterval = options.hasOwnProperty("updateInterval")
            ? options.updateInterval
            : 60000; // Default to 1 minute
        this.noData = this.parsedPlebbitOptions.noData = options.hasOwnProperty("noData") ? options.noData : false;
        this.browserLibp2pJsPublish = this.parsedPlebbitOptions.browserLibp2pJsPublish = options.hasOwnProperty("browserLibp2pJsPublish")
            ? options.browserLibp2pJsPublish
            : false;
        this._initIpfsClients();
        this._initPubsubClients();
        this._initRpcClients();
        if (!this.noData && !this.plebbitRpcClient)
            this.dataPath = this.parsedPlebbitOptions.dataPath = options.dataPath || getDefaultDataPath();
    }
    _initIpfsClients() {
        this.clients.ipfsClients = {};
        if (!this.ipfsHttpClientsOptions)
            return;
        if (!nativeFunctions)
            throw Error("Native function is defined at all. Can't create ipfs client: " + JSON.stringify(this._userPlebbitOptions));
        for (const clientOptions of this.ipfsHttpClientsOptions) {
            const ipfsClient = createIpfsClient(clientOptions);
            this.clients.ipfsClients[clientOptions.url] = {
                _client: ipfsClient,
                _clientOptions: clientOptions,
                peers: ipfsClient.swarm.peers
            };
        }
    }
    _initPubsubClients() {
        this.clients.pubsubClients = {};
        if (this.browserLibp2pJsPublish)
            //@ts-expect-error
            this.clients.pubsubClients["browser-libp2p-pubsub"] = {}; // should be defined fully else where
        else if (this.pubsubHttpClientsOptions)
            for (const clientOptions of this.pubsubHttpClientsOptions) {
                const ipfsClient = this.clients.ipfsClients?.[clientOptions.url]?._client || createIpfsClient(clientOptions); // Only create a new ipfs client if pubsub options is different than ipfs
                this.clients.pubsubClients[clientOptions.url] = {
                    _client: ipfsClient,
                    _clientOptions: clientOptions,
                    peers: async () => {
                        const topics = await ipfsClient.pubsub.ls();
                        const topicPeers = lodash.flattenDeep(await Promise.all(topics.map((topic) => ipfsClient.pubsub.peers(topic))));
                        const peers = lodash.uniq(topicPeers.map((topicPeer) => topicPeer.toString()));
                        return peers;
                    }
                };
            }
    }
    _initRpcClients() {
        this.clients.plebbitRpcClients = {};
        if (this.parsedPlebbitOptions.plebbitRpcClientsOptions)
            for (const rpcUrl of this.plebbitRpcClientsOptions)
                this.clients.plebbitRpcClients[rpcUrl] = new GenericPlebbitRpcStateClient("stopped");
    }
    _initResolver(options) {
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
                    chainId: null // no chain ID for solana
                }
            };
        if (this.chainProviders?.eth && !this.chainProviders.eth.chainId)
            this.chainProviders.eth.chainId = 1;
        this.clients.chainProviders = this.chainProviders;
        this.resolveAuthorAddresses = this.parsedPlebbitOptions.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses")
            ? options.resolveAuthorAddresses
            : true;
        this.resolver = new Resolver({
            resolveAuthorAddresses: this.resolveAuthorAddresses,
            chainProviders: this.chainProviders
        });
    }
    _parseUrlToOption(urlStrings) {
        const parsed = [];
        for (const urlString of urlStrings) {
            const url = new URL(urlString);
            const authorization = url.username && url.password ? "Basic " + Buffer.from(`${url.username}:${url.password}`).toString("base64") : undefined;
            parsed.push({
                url: authorization ? url.origin + url.pathname : urlString,
                ...(authorization ? { headers: { authorization, origin: "http://localhost" } } : undefined)
            });
        }
        return parsed;
    }
    async _init(options) {
        const log = Logger("plebbit-js:plebbit:_init");
        // If user did not provide ipfsGatewayUrls
        const fallbackGateways = this.plebbitRpcClient ? undefined : lodash.shuffle(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
        this.clients.ipfsGateways = {};
        if (options.ipfsGatewayUrls)
            for (const gatewayUrl of options.ipfsGatewayUrls)
                this.clients.ipfsGateways[gatewayUrl] = {};
        else if (fallbackGateways)
            for (const gatewayUrl of fallbackGateways)
                this.clients.ipfsGateways[gatewayUrl] = {};
        // Init storage
        this._storage = new Storage({ dataPath: this.dataPath, noData: this.noData });
        await this._storage.init();
        // Init stats
        this.stats = new Stats({ _storage: this._storage, clients: this.clients });
        // Init resolver
        this._initResolver(options);
        // Init clients manager
        this._clientsManager = new ClientsManager(this);
    }
    async getSubplebbit(subplebbitAddress) {
        const subplebbit = await this.createSubplebbit({ address: subplebbitAddress }); // I think it should call plebbit.createSubplebbit here
        if (typeof subplebbit.createdAt === "number")
            return subplebbit; // It's a local sub, and alreadh has been loaded, no need to wait
        const timeoutMs = this._clientsManager.getGatewayTimeoutMs("subplebbit");
        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        let updateError;
        const errorPromise = new Promise((resolve) => subplebbit.once("error", (err) => resolve((updateError = err))));
        try {
            await subplebbit.update();
            await Promise.race([updatePromise, errorPromise, new Promise((_, reject) => setTimeout(() => reject("timed out"), timeoutMs))]);
        }
        catch (e) {
            await subplebbit.stop();
            if (updateError)
                throw updateError;
            if (subplebbit?._ipnsLoadingOperation?.mainError())
                throw subplebbit._ipnsLoadingOperation.mainError();
            throw Error("Timed out without error. Should not happen" + e);
        }
        await subplebbit.stop();
        return subplebbit;
    }
    async getComment(cid) {
        const log = Logger("plebbit-js:plebbit:getComment");
        const comment = await this.createComment({ cid });
        // The reason why we override this function is because we don't want update() to load the IPNS
        //@ts-expect-error
        const originalLoadMethod = comment._retryLoadingCommentUpdate.bind(comment);
        //@ts-expect-error
        comment._retryLoadingCommentUpdate = () => { };
        await comment.update();
        const updatePromise = new Promise((resolve) => comment.once("update", resolve));
        let error;
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
    async _initMissingFields(pubOptions, log) {
        const clonedOptions = lodash.cloneDeep(pubOptions); // Clone to avoid modifying actual arguments provided by users
        if (!clonedOptions.timestamp) {
            clonedOptions.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp, defaulting to (${clonedOptions.timestamp})`);
        }
        if (!clonedOptions.signer.address)
            clonedOptions.signer.address = await getPlebbitAddressFromPrivateKey(clonedOptions.signer.privateKey);
        if (!clonedOptions?.author?.address) {
            clonedOptions.author = { ...clonedOptions.author, address: clonedOptions.signer.address };
            log(`author.address was not provided, will define it to signer.address (${clonedOptions.author.address})`);
        }
        delete clonedOptions.author["shortAddress"]; // Forcefully delete shortAddress so it won't be a part of the signature
        return clonedOptions;
    }
    async _createCommentInstance(options) {
        options = options;
        const comment = new Comment(options, this);
        //@ts-expect-error
        if (typeof options["updatedAt"] === "number")
            await comment._initCommentUpdate(options);
        return comment;
    }
    async createComment(options) {
        const log = Logger("plebbit-js:plebbit:createComment");
        if (options["cid"] && !isIpfsCid(options["cid"]))
            throwWithErrorCode("ERR_CID_IS_INVALID", { cid: options["cid"] });
        const formattedOptions = options instanceof Comment ? options.toJSON() : options;
        formattedOptions["protocolVersion"] = formattedOptions["protocolVersion"] || env.PROTOCOL_VERSION;
        if (options["signature"] || options["cid"])
            return this._createCommentInstance(formattedOptions);
        else {
            //@ts-expect-error
            const fieldsFilled = await this._initMissingFields(formattedOptions, log);
            const cleanedFieldsFilled = cleanUpBeforePublishing(fieldsFilled);
            const signature = await signComment(cleanedFieldsFilled, fieldsFilled.signer, this);
            const finalOptions = { ...cleanedFieldsFilled, signature };
            return this._createCommentInstance(finalOptions);
        }
    }
    _canCreateNewLocalSub() {
        const isNode = typeof process?.versions?.node !== "undefined";
        return isNode;
    }
    async _createSubplebbitRpc(options) {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        log.trace("Received subplebbit options to create a subplebbit instance over RPC:", options);
        if (options.address && !options["signer"]) {
            options = options;
            const rpcSubs = await this.listSubplebbits();
            const isSubRpcLocal = rpcSubs.includes(options.address);
            // Should actually create an instance here, instead of calling getSubplebbit
            if (isSubRpcLocal) {
                const sub = new RpcLocalSubplebbit(this);
                sub.setAddress(options.address);
                // wait for one update here, and then stop
                await sub.update();
                const updatePromise = new Promise((resolve) => sub.once("update", resolve));
                let error;
                const errorPromise = new Promise((resolve) => sub.once("error", (err) => resolve((error = err))));
                await Promise.race([
                    updatePromise,
                    errorPromise,
                    new Promise((resolve) => typeof sub.createdAt === "number" && resolve(1)) // In case await sub.update() above got updated quickly
                ]);
                await sub.stop();
                if (error)
                    throw error;
                return sub;
            }
            else {
                const remoteSub = new RpcRemoteSubplebbit(this);
                await remoteSub.initRemoteSubplebbitPropsWithMerge(options);
                return remoteSub;
            }
        }
        else {
            const newLocalSub = await this.plebbitRpcClient.createSubplebbit(options);
            log(`Created local-RPC subplebbit (${newLocalSub.address}) with props:`, newLocalSub.toJSON());
            return newLocalSub;
        }
    }
    async _createRemoteSubplebbitInstance(options) {
        const log = Logger("plebbit-js:plebbit:createRemoteSubplebbit");
        log.trace("Received subplebbit options to create a remote subplebbit instance:", options);
        if (!options.address)
            throw new PlebbitError("ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS", {
                options
            });
        const subplebbit = new RemoteSubplebbit(this);
        await subplebbit.initRemoteSubplebbitPropsWithMerge(options);
        log.trace(`Created remote subplebbit instance (${subplebbit.address})`);
        return subplebbit;
    }
    async _createLocalSub(options) {
        const log = Logger("plebbit-js:plebbit:createLocalSubplebbit");
        log.trace("Received subplebbit options to create a local subplebbit instance:", options);
        const canCreateLocalSub = this._canCreateNewLocalSub();
        if (!canCreateLocalSub)
            throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });
        if (!options.address)
            throw new PlebbitError("ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS", {
                options
            });
        const isLocalSub = (await this.listSubplebbits()).includes(options.address); // Sub exists already, only pass address so we don't override other props
        const subplebbit = new LocalSubplebbit(this);
        if (isLocalSub) {
            subplebbit.setAddress(options.address);
            await subplebbit._loadLocalSubDb();
            log.trace(`Created instance of existing local subplebbit (${subplebbit.address}) with props:`, removeKeysWithUndefinedValues(lodash.omit(subplebbit.toJSON(), ["signer"])));
        }
        else {
            // This is a new sub
            await subplebbit.initInternalSubplebbitWithMerge(options); // Are we trying to create a new sub with options, or just trying to load an existing sub
            await subplebbit._createNewLocalSubDb();
            log.trace(`Created a new local subplebbit (${subplebbit.address}) with props:`, removeKeysWithUndefinedValues(lodash.omit(subplebbit.toJSON(), ["signer"])));
        }
        return subplebbit;
    }
    async createSubplebbit(options = {}) {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        log.trace("Received options: ", options);
        if (options?.hasOwnProperty("address") && !options?.address)
            throw new PlebbitError("ERR_SUB_ADDRESS_IS_PROVIDED_AS_NULL_OR_UNDEFINED", { subplebbitAddress: options?.address });
        if (options?.address && doesDomainAddressHaveCapitalLetter(options?.address))
            throw new PlebbitError("ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: options?.address });
        if (this.plebbitRpcClient)
            return this._createSubplebbitRpc(options);
        const canCreateLocalSub = this._canCreateNewLocalSub();
        if (options["signer"] && !canCreateLocalSub)
            throw new PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });
        if (!canCreateLocalSub)
            return this._createRemoteSubplebbitInstance(options);
        if (options.address && !options["signer"]) {
            const localSubs = await this.listSubplebbits();
            const isSubLocal = localSubs.includes(options.address);
            if (isSubLocal)
                return this._createLocalSub(options);
            else
                return this._createRemoteSubplebbitInstance(options);
        }
        else if (!options.address && !options["signer"]) {
            options = options;
            options.signer = await this.createSigner();
            options.address = options.signer.address;
            log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.address})`);
            return this._createLocalSub(options);
        }
        else if (!options.address && options["signer"]) {
            options = options;
            options.signer = await this.createSigner(options.signer);
            options.address = options.signer.address;
            return this._createLocalSub(options);
        }
        else
            return this._createLocalSub(options);
    }
    async createVote(options) {
        const log = Logger("plebbit-js:plebbit:createVote");
        options["protocolVersion"] = options["protocolVersion"] || env.PROTOCOL_VERSION;
        if (options["signature"])
            return new Vote(options, this);
        //@ts-ignore
        const finalOptions = await this._initMissingFields(options, log);
        const cleanedFinalOptions = cleanUpBeforePublishing(finalOptions);
        const signature = await signVote(cleanedFinalOptions, finalOptions.signer, this);
        return new Vote({ ...cleanedFinalOptions, signature }, this);
    }
    async createCommentEdit(options) {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");
        options["protocolVersion"] = options["protocolVersion"] || env.PROTOCOL_VERSION;
        if (options["signature"])
            return new CommentEdit(options, this); // User just wants to instantiate a CommentEdit object, not publish
        //@ts-ignore
        const finalOptions = await this._initMissingFields(options, log);
        const cleanedFinalOptions = cleanUpBeforePublishing(finalOptions);
        const signature = await signCommentEdit(cleanedFinalOptions, finalOptions.signer, this);
        return new CommentEdit({ ...cleanedFinalOptions, signature }, this);
    }
    createSigner(createSignerOptions) {
        return createSigner(createSignerOptions);
    }
    async listSubplebbits() {
        if (this.plebbitRpcClient)
            return this.plebbitRpcClient.listSubplebbits();
        const canCreateSubs = this._canCreateNewLocalSub();
        if (!canCreateSubs || !this.dataPath)
            return [];
        return nodeListSubplebbits(this);
    }
    async fetchCid(cid) {
        if (this.plebbitRpcClient)
            return this.plebbitRpcClient.fetchCid(cid);
        else
            return this._clientsManager.fetchCid(cid);
    }
    // Used to pre-subscribe so publishing on pubsub would be faster
    async pubsubSubscribe(subplebbitAddress) {
        if (this._pubsubSubscriptions[subplebbitAddress])
            return;
        const handler = () => { };
        await this._clientsManager.pubsubSubscribe(subplebbitAddress, handler);
        this._pubsubSubscriptions[subplebbitAddress] = handler;
    }
    async pubsubUnsubscribe(subplebbitAddress) {
        if (!this._pubsubSubscriptions[subplebbitAddress])
            return;
        await this._clientsManager.pubsubUnsubscribe(subplebbitAddress, this._pubsubSubscriptions[subplebbitAddress]);
        delete this._pubsubSubscriptions[subplebbitAddress];
    }
    async resolveAuthorAddress(authorAddress) {
        const resolved = await this._clientsManager.resolveAuthorAddressIfNeeded(authorAddress);
        return resolved;
    }
    async _createStorageLRU(opts) {
        // should add the storage LRU to an array, so we can destroy all of them on plebbit.destroy
        if (!this._storageLRUs[opts.cacheName]) {
            this._storageLRUs[opts.cacheName] = new LRUStorage({ ...opts, plebbit: this });
            await this._storageLRUs[opts.cacheName].init();
        }
        return this._storageLRUs[opts.cacheName];
    }
    async rpcCall(method, params) {
        if (!this.plebbitRpcClient)
            throw Error("Can't call rpcCall without having a rpc connection");
        return this.plebbitRpcClient.rpcCall(method, params);
    }
    async destroy() {
        // Clean up connections
        if (this.plebbitRpcClient)
            await this.plebbitRpcClient.destroy();
        await this._storage.destroy();
        await Promise.all(Object.values(this._storageLRUs).map((storage) => storage.destroy()));
    }
    toJSON() {
        return undefined;
    }
}
//# sourceMappingURL=plebbit.js.map