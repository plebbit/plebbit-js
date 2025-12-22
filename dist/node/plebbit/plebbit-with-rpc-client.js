import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "./plebbit.js";
import { parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
import { RpcRemoteSubplebbit } from "../subplebbit/rpc-remote-subplebbit.js";
import { parseRpcAuthorAddressParam, parseRpcCidParam } from "../clients/rpc-client/rpc-schema-util.js";
// This is a helper class for separating RPC-client logic from main Plebbit
// Not meant to be used with end users
export class PlebbitWithRpcClient extends Plebbit {
    constructor(options) {
        super(options);
        this._startedSubplebbits = {}; // storing subplebbit instance that are started rn
        this._updatingSubplebbits = {};
        this._plebbitRpcClient = this.clients.plebbitRpcClients[Object.keys(this.clients.plebbitRpcClients)[0]]; // will change later once we start supporting multiple RPCs
    }
    async _init() {
        await super._init();
        const log = Logger("plebbit-js:plebbit-with-rpc-client:_init");
        this.subplebbits = [];
        this._plebbitRpcClient.on("subplebbitschange", (newSubs) => this.emit("subplebbitschange", newSubs));
        for (const rpcUrl of Object.keys(this.clients.plebbitRpcClients)) {
            const rpcClient = this.clients.plebbitRpcClients[rpcUrl];
            rpcClient.on("error", (err) => this.emit("error", err));
            rpcClient.initalizeSubplebbitschangeEvent().catch((err) => {
                log.error("Failed to initialize RPC", rpcUrl, "subplebbitschange event", err);
            });
            rpcClient.initalizeSettingschangeEvent().catch((err) => {
                log.error("Failed to initialize RPC", rpcUrl, "settingschange event", err);
            });
        }
        // TODO merge different plebbitRpcClient.subplebbits
        // TODO should set up plebbit.settings
        // TODO should set up settingschange
    }
    async fetchCid(cid) {
        const parsedCid = parseRpcCidParam(cid).cid;
        return this._plebbitRpcClient.fetchCid({ cid: parsedCid });
    }
    async resolveAuthorAddress(args) {
        const parsedArgs = parseRpcAuthorAddressParam(args);
        return this._plebbitRpcClient.resolveAuthorAddress(parsedArgs);
    }
    async destroy() {
        for (const startedSubplebbit of Object.values(this._startedSubplebbits)) {
            await startedSubplebbit.stopWithoutRpcCall();
        }
        await super.destroy();
        await this._plebbitRpcClient.destroy();
    }
    async getComment(commentCid) {
        const parsedArgs = parseRpcCidParam(commentCid);
        const commentIpfs = await this._plebbitRpcClient.getComment(parsedArgs);
        return this.createComment({ raw: { comment: commentIpfs }, cid: parsedArgs.cid });
    }
    async createSubplebbit(options = {}) {
        const log = Logger("plebbit-js:plebbit-with-rpc-client:createSubplebbit");
        if (options instanceof RpcRemoteSubplebbit)
            return options; // not sure why somebody would call createSubplebbit with an instance, will probably change later
        // No need to parse if it's a jsonified instance
        const parsedRpcOptions = "clients" in options ? options : parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(options);
        log.trace("Received subplebbit options to create a subplebbit instance over RPC:", options);
        if ("address" in parsedRpcOptions && typeof parsedRpcOptions.address === "string") {
            await this._waitForSubplebbitsToBeDefined();
            const rpcSubs = this.subplebbits; // should probably be replaced with a direct call for subs
            const isSubRpcLocal = rpcSubs.includes(parsedRpcOptions.address);
            // Should actually create an instance here, instead of calling getSubplebbit
            if (isSubRpcLocal) {
                const sub = new RpcLocalSubplebbit(this);
                sub.setAddress(parsedRpcOptions.address);
                // wait for one update here, and then stop
                const updatePromise = new Promise((resolve) => sub.once("update", resolve));
                let error;
                const errorPromise = new Promise((resolve) => sub.once("error", (err) => resolve((error = err))));
                await sub._createAndSubscribeToNewUpdatingSubplebbit(sub);
                await sub.update();
                await Promise.race([updatePromise, errorPromise]);
                await sub.stop();
                if (error)
                    throw error;
                return sub;
            }
            else {
                log.trace("Creating a remote RPC subplebbit instance with address", parsedRpcOptions.address);
                const remoteSub = new RpcRemoteSubplebbit(this);
                await this._setSubplebbitIpfsOnInstanceIfPossible(remoteSub, parsedRpcOptions);
                return remoteSub;
            }
        }
        else if (!("address" in parsedRpcOptions)) {
            // We're creating a new local sub
            const subPropsAfterCreation = await this._plebbitRpcClient.createSubplebbit(parsedRpcOptions);
            log(`Created new local-RPC subplebbit (${subPropsAfterCreation.address}) with props:`, JSON.parse(JSON.stringify(subPropsAfterCreation)));
            const sub = new RpcLocalSubplebbit(this);
            await sub.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(subPropsAfterCreation);
            sub.emit("update", sub);
            await this._awaitSubplebbitsToIncludeSub(subPropsAfterCreation.address);
            return sub;
        }
        else
            throw Error("Failed to create subplebbit rpc instance, are you sure you provided the correct args?");
    }
}
//# sourceMappingURL=plebbit-with-rpc-client.js.map