import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";

type GenericGatewayState = "stopped" | "fetching-ipfs" | "fetching-ipns";
export class GenericIpfsGatewayClient extends TypedEmitter<GenericClientEvents<GenericGatewayState>> {
    state: GenericGatewayState;
    constructor(state: GenericIpfsGatewayClient["state"]) {
        super();
        this.state = state;
    }
}
