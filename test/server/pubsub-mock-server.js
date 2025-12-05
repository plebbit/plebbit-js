import { Server } from "socket.io";

const ipfsMockPort = 25963;

// Create a wss to mock ipfs pubsub
const pubsubIoServer = new Server(ipfsMockPort, { cors: { origin: "*" }, maxHttpBufferSize: 10 * 1024 * 1024 });
let peers = [];

pubsubIoServer.on("connection", async (connectedPeer) => {
    console.log("[mock-pubsub-server] peer connected", connectedPeer.id, "total before push", peers.length);
    // relay messages to all other peers

    connectedPeer.on("disconnect", () => {
        console.log("[mock-pubsub-server] peer disconnected", connectedPeer.id);
        peers = peers.filter((peer) => peer.id !== connectedPeer.id);
    });
    connectedPeer.onAny(async (topic, message) => {
        console.log("[mock-pubsub-server] relay", topic, "to", peers.length, "peers");
        // if (peers.length <= 1)
        //     throw Error(
        //         "Only a single peer is connected, are you sure other peers from mocked pubsub ws server are there? topic is " + topic
        //     );
        for (const curPeer of peers) curPeer.emit(topic, message);
    });
    peers.push(connectedPeer);
});
