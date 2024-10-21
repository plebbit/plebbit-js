import Publication from "../publication.js";
import type { PublicationTypeName } from "../../types.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import { verifyVote } from "../../signer/index.js";
import { hideClassPrivateProps, throwWithErrorCode } from "../../util.js";
import type { CreateVoteOptions, VotePubsubMessagePublication } from "./types.js";
import * as remeda from "remeda";
import type { SignerType } from "../../signer/types.js";

// vote.signer is inherited from Publication
class Vote extends Publication implements VotePubsubMessagePublication {
    commentCid!: VotePubsubMessagePublication["commentCid"];
    vote!: VotePubsubMessagePublication["vote"]; // (upvote = 1, cancel vote = 0, downvote = -1)
    override signature!: VotePubsubMessagePublication["signature"];

    _pubsubMsgToPublish?: VotePubsubMessagePublication = undefined;
    override challengeRequest?: CreateVoteOptions["challengeRequest"];

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);

        hideClassPrivateProps(this);
    }

    _initLocalProps(props: {
        vote: VotePubsubMessagePublication;
        signer?: SignerType;
        challengeRequest?: CreateVoteOptions["challengeRequest"];
    }): void {
        this._initRemoteProps(props.vote);
        this.challengeRequest = props.challengeRequest;
        this.signer = props.signer;
    }

    _initRemoteProps(props: VotePubsubMessagePublication): void {
        super._initBaseRemoteProps(props);
        this.commentCid = props.commentCid;
        this.vote = props.vote;
        this._pubsubMsgToPublish = props;
    }

    override toJSONPubsubMessagePublication(): VotePubsubMessagePublication {
        if (!this._pubsubMsgToPublish) throw Error("Should define local props before calling toJSONPubsubMessagePublication");
        return this._pubsubMsgToPublish;
    }

    override getType(): PublicationTypeName {
        return "vote";
    }

    private async _validateSignature() {
        const voteObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifyVote(voteObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    override async publish(): Promise<void> {
        await this._validateSignature();
        return super.publish();
    }
}

export default Vote;
