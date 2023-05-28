import Publication from "./publication";
import { PublicationTypeName, VotePubsubMessage, VotesTableRowInsert, VoteType } from "./types";
import { Plebbit } from "./plebbit";
import isIPFS from "is-ipfs";
import { verifyVote } from "./signer";
import { throwWithErrorCode } from "./util";
import { ChallengeRequestMessage } from "./challenge";

class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;

    constructor(props: VoteType, plebbit: Plebbit) {
        super(props, plebbit);
        this.commentCid = props.commentCid;
        this.vote = props.vote; // Either 1, 0, -1 (upvote, cancel vote, downvote)

        // public method should be bound
        this.publish = this.publish.bind(this);
    }

    toJSONPubsubMessagePublication(): VotePubsubMessage {
        return {
            ...super.toJSONPubsubMessagePublication(),
            commentCid: this.commentCid,
            vote: this.vote
        };
    }

    toJSON() {
        return this.toJSONPubsubMessagePublication();
    }

    getType(): PublicationTypeName {
        return "vote";
    }

    toJSONForDb(challengeRequestId: ChallengeRequestMessage["challengeRequestId"]): VotesTableRowInsert {
        return {
            ...this.toJSON(),
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId
        };
    }

    private async _validateSignature() {
        const voteObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifyVote(voteObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    async publish(): Promise<void> {
        if (![-1, 0, 1].includes(this.vote)) throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { vote: this.vote });
        if (!isIPFS.cid(this.commentCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { commentCid: this.commentCid });

        await this._validateSignature();

        return super.publish();
    }
}

export default Vote;
