import { PubsubClient } from "../../types.js";

export async function createLibp2pNode(): Promise<PubsubClient> {
    throw Error("Can't create a libp2p node in NodeJs at the moment");
}
