const { Server } = require("socket.io");

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
        for (const curPeer of peers) curPeer.emit(topic, message);

        console.log(`Number of peers is ${peers.length}`);
    });
    peers.push(connectedPeer);
});
