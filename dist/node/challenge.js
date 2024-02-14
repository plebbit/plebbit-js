export class ChallengeRequestMessage {
    constructor(props) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = props.acceptedChallengeTypes;
        this.encrypted = props.encrypted;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    toJSON() {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            encrypted: this.encrypted,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    }
}
export class ChallengeMessage {
    constructor(props) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encrypted = props.encrypted;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    toJSON() {
        return {
            encrypted: this.encrypted,
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    }
}
export class ChallengeAnswerMessage {
    constructor(props) {
        this.type = "CHALLENGEANSWER";
        this.encrypted = props.encrypted;
        this.challengeRequestId = props.challengeRequestId;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    toJSON() {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            encrypted: this.encrypted,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    }
}
export class ChallengeVerificationMessage {
    constructor(props) {
        this.type = "CHALLENGEVERIFICATION";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = props.challengeErrors;
        this.reason = props.reason;
        this.encrypted = props.encrypted;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }
    toJSON() {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            encrypted: this.encrypted,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    }
}
//# sourceMappingURL=challenge.js.map