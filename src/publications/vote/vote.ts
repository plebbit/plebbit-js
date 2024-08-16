import Publication from "../publication.js";
import type { PublicationTypeName } from "../../types.js";
import { Plebbit } from "../../plebbit.js";
import { verifyVote } from "../../signer/index.js";
import { hideClassPrivateProps, throwWithErrorCode } from "../../util.js";
import type { LocalVoteOptions, VoteChallengeRequestToEncryptType, VotePubsubMessage } from "./types.js";
import * as remeda from "remeda";

// vote.signer is inherited from Publication
class Vote extends Publication {
    commentCid!: VotePubsubMessage["commentCid"];
    vote!: VotePubsubMessage["vote"]; // (upvote, cancel vote, downvote)

    private _pubsubMsgToPublish?: VotePubsubMessage = undefined;

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);

        hideClassPrivateProps(this);
    }

    _initLocalProps(props: LocalVoteOptions): void {
        this._initBaseLocalProps(props);
        this.commentCid = props.commentCid;
        this.vote = props.vote;
        const keysCasted = <(keyof VotePubsubMessage)[]>props.signature.signedPropertyNames;
        this._pubsubMsgToPublish = remeda.pick(props, ["signature", ...keysCasted]);
    }

    _initRemoteProps(props: VotePubsubMessage): void {
        super._initBaseRemoteProps(props);
        this.commentCid = props.commentCid;
        this.vote = props.vote;
    }

    _initChallengeRequestProps(props: VoteChallengeRequestToEncryptType) {
        super._initChallengeRequestChallengeProps(props);
        this._initRemoteProps(props.publication);
        this._pubsubMsgToPublish = props.publication;
    }

    override toJSONPubsubMessagePublication(): VotePubsubMessage {
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
