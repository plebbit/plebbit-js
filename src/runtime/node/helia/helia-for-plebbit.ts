import { PubsubClient } from "../../../types.js";

export async function createHeliaBrowserNode(): Promise<PubsubClient> {
    throw Error("Can't create a helia node in NodeJs at the moment");
}
