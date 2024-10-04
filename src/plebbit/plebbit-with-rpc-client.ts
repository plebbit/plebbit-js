import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "./plebbit";
import { InputPlebbitOptions } from "../types";
import {
    parseCidStringSchemaWithPlebbitErrorIfItFails,
    parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails
} from "../schema/schema-util";
import { AuthorAddressSchema } from "../schema/schema";
import { CreateRpcSubplebbitFunctionArgumentSchema } from "../subplebbit/schema";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit";
import { RpcRemoteSubplebbit } from "../subplebbit/rpc-remote-subplebbit";
import type { RpcLocalSubplebbitJson, RpcRemoteSubplebbitJson } from "../subplebbit/types";
import { z } from "zod";
import { PlebbitError } from "../plebbit-error";

// This is a helper class for separating RPC-client logic from main Plebbit
// Not meant to be used with end users
export class PlebbitWithRpcClient extends Plebbit {
    override plebbitRpcClient!: NonNullable<Plebbit["plebbitRpcClient"]>;
    override plebbitRpcClientsOptions!: NonNullable<Plebbit["plebbitRpcClientsOptions"]>;

    constructor(options: InputPlebbitOptions) {
        super(options);
    }

    override async _init(): Promise<void> {
        await super._init();
        const log = Logger("plebbit-js:plebbit-with-rpc-client:_init");

        this.subplebbits = [];

        // const retryOperation =
        this.plebbitRpcClient
            .initalizeSubplebbitschangeEvent()
            .catch((err) => log.error("Failed to initialize RPC subplebbitschange event", err));

        // TODO should set up settingschange
    }

    override async fetchCid(cid: string) {
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(cid);
        return this.plebbitRpcClient.fetchCid(parsedCid);
    }

    override async resolveAuthorAddress(authorAddress: string) {
        const parsedAddress = AuthorAddressSchema.parse(authorAddress);
        return this.plebbitRpcClient.resolveAuthorAddress(parsedAddress);
    }

    override async rpcCall(method: string, params: any[]): Promise<any> {
        return this.plebbitRpcClient.rpcCall(method, params);
    }

    override async destroy() {
        await super.destroy();
        await this.plebbitRpcClient.destroy();
    }

    override async getComment(commentCid: string) {
        const parsedCommentCid = parseCidStringSchemaWithPlebbitErrorIfItFails(commentCid);

        const commentIpfs = await this.plebbitRpcClient.getComment(parsedCommentCid);
        return this.createComment({ ...commentIpfs, cid: parsedCommentCid });
    }

    override async createSubplebbit(
        options: z.infer<typeof CreateRpcSubplebbitFunctionArgumentSchema> | RpcRemoteSubplebbitJson | RpcLocalSubplebbitJson = {}
    ): Promise<RpcLocalSubplebbit | RpcRemoteSubplebbit> {
        const log = Logger("plebbit-js:plebbit-with-rpc-client:createSubplebbit");

        if (options instanceof RpcRemoteSubplebbit) return options; // not sure why somebody would call createSubplebbit with an instance, will probably change later

        // No need to parse if it's a jsonified instance
        const parsedRpcOptions =
            "clients" in options ? options : parseCreateRpcSubplebbitFunctionArgumentSchemaWithPlebbitErrorIfItFails(options);

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
                let error: PlebbitError | undefined;
                const errorPromise = new Promise((resolve) => sub.once("error", (err) => resolve((error = err))));
                await sub.update();
                await Promise.race([updatePromise, errorPromise]);
                await sub.stop();
                if (error) throw error;

                return sub;
            } else {
                log.trace("Creating a remote RPC subplebbit instance with address", parsedRpcOptions.address);
                const remoteSub = new RpcRemoteSubplebbit(this);
                await this._setSubplebbitIpfsOnInstanceIfPossible(remoteSub, parsedRpcOptions);

                return remoteSub;
            }
        } else if (!("address" in parsedRpcOptions)) {
            // We're creating a new local sub
            const newLocalSub = await this.plebbitRpcClient!.createSubplebbit(parsedRpcOptions);
            log(`Created local-RPC subplebbit (${newLocalSub.address}) with props:`, JSON.parse(JSON.stringify(newLocalSub)));
            newLocalSub.emit("update", newLocalSub);
            await this._awaitSubplebbitsToIncludeSub(newLocalSub.address);
            return newLocalSub;
        } else throw Error("Failed to create subplebbit rpc instance, are you sure you provided the correct args?");
    }
}
