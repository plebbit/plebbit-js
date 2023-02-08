import Publication from "./publication";
import { PublicationTypeName, VotePubsubMessage, VotesTableRow, VoteType } from "./types";
import { Plebbit } from "./plebbit";
import isIPFS from "is-ipfs";
import { verifyVote } from "./signer";
import { throwWithErrorCode } from "./util";

class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;

    constructor(props: VoteType, plebbit: Plebbit) {
        super(props, plebbit);
        this.commentCid = props.commentCid;
        this.vote = props.vote; // Either 1, 0, -1 (upvote, cancel vote, downvote)
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

    toJSONForDb(challengeRequestId: string): VotesTableRow {
        return {
            ...this.toJSON(),
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId
        };
    }

    private async _validateSignature() {
        const voteObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifyVote(voteObj, this.plebbit, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throwWithErrorCode(
                "ERR_SIGNATURE_IS_INVALID",
                `vote.publish: Failed to publish vote (${this.vote}) on comment (${this.commentCid}) due to invalid signature. Reason=${signatureValidity.reason}`
            );
    }

    async publish(): Promise<void> {
        if (![-1, 0, 1].includes(this.vote))
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", `Vote.vote (${this.vote}) can only be -1, 0, or 1`);
        if (!isIPFS.cid(this.commentCid))
            throwWithErrorCode("ERR_CID_IS_INVALID", `Vote.publish: commentCid (${this.commentCid}) is invalid as a CID`);

        await this._validateSignature();

        return super.publish();
    }
}

export default Vote;
