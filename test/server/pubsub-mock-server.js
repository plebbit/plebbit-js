import { Server } from "socket.io";

const ipfsMockPort = 25963;

// Create a wss to mock ipfs pubsub
const pubsubIoServer = new Server(ipfsMockPort, { cors: { origin: "*" } });
let peers = [];

pubsubIoServer.on("connection", async (connectedPeer) => {
    // relay messages to all other peers

    connectedPeer.on("disconnect", () => {
        peers = peers.filter((peer) => peer.id !== connectedPeer.id);
    });
    connectedPeer.onAny(async (topic, message) => {
        if (peers.length <= 1)
            throw Error(
                "Only a single peer is connected, are you sure other peers from mocked pubsub ws server are there? topic is " + topic
            );
        for (const curPeer of peers) curPeer.emit(topic, message);
    });
    peers.push(connectedPeer);
});
