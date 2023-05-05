import Publication from "./publication";
import { PublicationTypeName, VotePubsubMessage, VotesTableRowInsert, VoteType } from "./types";
import { Plebbit } from "./plebbit";
declare class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;
    clients: Omit<Publication["clients"], "ipfsClients"> & {
        ipfsClients: {
            [ipfsClientUrl: string]: {
                state: "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
            };
        };
    };
    constructor(props: VoteType, plebbit: Plebbit);
    toJSONPubsubMessagePublication(): VotePubsubMessage;
    toJSON(): VotePubsubMessage;
    getType(): PublicationTypeName;
    toJSONForDb(challengeRequestId: string): VotesTableRowInsert;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
