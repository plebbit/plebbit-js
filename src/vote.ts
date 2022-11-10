import Publication from "./publication";
import { PublicationTypeName, VoteForDbType, VoteType } from "./types";
import { Plebbit } from "./plebbit";
import isIPFS from "is-ipfs";
import { codes, messages } from "./errors";
import errcode from "err-code";
import { verifyVote } from "./signer";

class Vote extends Publication implements VoteType {
    commentCid: string;
    vote: 1 | 0 | -1;

    constructor(props: VoteType, plebbit: Plebbit) {
        super(props, plebbit);
        this.commentCid = props.commentCid;
        this.vote = props.vote; // Either 1, 0, -1 (upvote, cancel vote, downvote)
    }

    toJSON(): VoteType {
        return {
            ...super.toJSON(),
            commentCid: this.commentCid,
            vote: this.vote
        };
    }

    getType(): PublicationTypeName {
        return "vote";
    }

    toJSONForDb(challengeRequestId: string): VoteForDbType {
        return {
            ...this.toJSON(),
            author: JSON.stringify(this.author),
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId,
            signature: JSON.stringify(this.signature)
        };
    }

    async publish(): Promise<void> {
        if (![-1, 0, 1].includes(this.vote)) throw Error(`Vote.vote (${this.vote}) can only be -1, 0, or 1`);
        if (!isIPFS.cid(this.commentCid))
            throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
                details: `Vote.publish: commentCid (${this.commentCid}) is invalid as a CID`
            });
        const signatureValidity = await verifyVote(this.toJSON(), this.plebbit, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throw Error(`Failed to validate signature before publishing due to reason '${signatureValidity.reason}'`);

        return super.publish();
    }
}

export default Vote;
