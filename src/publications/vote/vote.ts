import Publication from "../publication.js";
import { PublicationTypeName, VotesTableRowInsert } from "../../types.js";
import { Plebbit } from "../../plebbit.js";
import { verifyVote } from "../../signer/index.js";
import { isIpfsCid, throwWithErrorCode } from "../../util.js";
import { DecryptedChallengeRequestVote, LocalVoteOptions, VotePubsubMessage, VoteTypeJson } from "./types.js";

// vote.signer is inherited from Publication
class Vote extends Publication {
    commentCid!: string;
    vote!: 1 | 0 | -1; // (upvote, cancel vote, downvote)

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);
    }

    _initLocalProps(props: LocalVoteOptions): void {
        this._initBaseLocalProps(props);
        this.commentCid = props.commentCid;
        this.vote = props.vote;
    }

    _initRemoteProps(props: VotePubsubMessage): void {
        super._initBaseRemoteProps(props);
        this.commentCid = props.commentCid;
        this.vote = props.vote;
    }

    _initChallengeRequestProps(props: DecryptedChallengeRequestVote) {
        super._initChallengeRequestChallengeProps(props);
        this._initRemoteProps(props.publication);
    }

    override toJSONPubsubMessagePublication(): VotePubsubMessage {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author.toJSONIpfs(),
            protocolVersion: this.protocolVersion,
            commentCid: this.commentCid,
            vote: this.vote
        };
    }

    override toJSON(): VoteTypeJson {
        return {
            ...this.toJSONPubsubMessagePublication(),
            shortSubplebbitAddress: this.shortSubplebbitAddress,
            author: this.author.toJSON()
        };
    }

    override getType(): PublicationTypeName {
        return "vote";
    }

    toJSONForDb(authorSignerAddress: string): VotesTableRowInsert {
        return {
            ...this.toJSONPubsubMessagePublication(),
            authorAddress: this.author.address,
            authorSignerAddress
        };
    }

    private async _validateSignature() {
        const voteObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifyVote(voteObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    override async publish(): Promise<void> {
        if (![-1, 0, 1].includes(this.vote)) throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { vote: this.vote });
        if (!isIpfsCid(this.commentCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { commentCid: this.commentCid });

        await this._validateSignature();

        return super.publish();
    }
}

export default Vote;
