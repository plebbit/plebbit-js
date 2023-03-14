const { Server } = require("socket.io");
const assert = require("assert");

const ipfsMockPort = 25963;

// Create a wss to mock ipfs pubsub
const pubsubIoServer = new Server(ipfsMockPort);
const challengeIdToAuthorPeerId = {};

const peers = [];

const getSubplebbitPeers = () => peers.filter((peer) => peer.handshake.headers.issubplebbit === "true");

pubsubIoServer.on("connection", async (connectedPeer) => {
    // relay messages to all other peers

    peers.push(connectedPeer);
    connectedPeer.onAny(async (topic, message) => {
        const msgParsed = JSON.parse(message.toString());
        if (msgParsed.type === "CHALLENGEREQUEST") {
            challengeIdToAuthorPeerId[msgParsed.challengeRequestId] = connectedPeer.id;
            // TODO forward msg to subplebbit only
            for (const subplebbitPeer of getSubplebbitPeers()) subplebbitPeer.emit(topic, message);
        } else if (msgParsed.type === "CHALLENGE") {
            const authorPeerId = challengeIdToAuthorPeerId[msgParsed.challengeRequestId];
            assert(typeof authorPeerId === "string");
            peers.find((peer) => peer.id === authorPeerId).emit(topic, message);
        } else if (msgParsed.type === "CHALLENGEANSWER") {
            // TODO forward msg to subplebbit only
            for (const subplebbitPeer of getSubplebbitPeers()) subplebbitPeer.emit(topic, message);
        } else if (msgParsed.type === "CHALLENGEVERIFICATION") {
            const authorPeerId = challengeIdToAuthorPeerId[msgParsed.challengeRequestId];
            assert(typeof authorPeerId === "string");
            peers.find((peer) => peer.id === authorPeerId).emit(topic, message);
            delete challengeIdToAuthorPeerId[msgParsed.challengeRequestId];
        }

        console.log(`Number of peers is ${peers.length} and number of subplebbit peers is ${getSubplebbitPeers().length}`);
    });
});
