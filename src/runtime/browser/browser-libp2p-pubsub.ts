// import { createLibp2p } from "libp2p";
// import { gossipsub } from "@chainsafe/libp2p-gossipsub";
// import { webTransport } from "@libp2p/webtransport";
// import { mplex } from "@libp2p/mplex";
// import { yamux } from "@chainsafe/libp2p-yamux";
// import { noise } from "@chainsafe/libp2p-noise";
// import { toString as uint8ArrayToString } from "uint8arrays/to-string";
// import { bootstrap } from "@libp2p/bootstrap";
// import { identify as identifyService } from "@libp2p/identify";
// import { kadDHT } from "@libp2p/kad-dht";
// import { webRTCDirect } from "@libp2p/webrtc";
// import Logger from "@plebbit/plebbit-logger";
// import { createEd25519PeerId } from "@libp2p/peer-id-factory";
// import type { IpfsHttpClientPubsubMessage, PubsubClient } from "../../types.js";
// import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
// import { autoNAT } from "@libp2p/autonat";

// import { EventEmitter } from "events";
// import { EventHandler, Libp2pEvents } from "@libp2p/interface";

// // TODO remove the ts-expect-error when this file matures

// const log = Logger("plebbit-js:browser-libp2p-pubsub");

// // From https://github.com/ipfs/helia/blob/main/packages/helia/src/utils/bootstrappers.ts
// const bootstrapConfig = {
//     list: [
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
//         "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ"
//     ]
// };

// let libp2pPubsubClient: PubsubClient;

// export async function createLibp2pNode(): Promise<PubsubClient> {
//     if (libp2pPubsubClient) return libp2pPubsubClient;
//     const peerId = await createEd25519PeerId();
//     const libP2pNode = await createLibp2p({
//         // can't listen using webtransport in libp2p js
//         // addresses: {listen: []},

//         peerDiscovery: [bootstrap(bootstrapConfig)],
//         peerId,
//         transports: [
//             webTransport(),
//             webRTCDirect(),
//             circuitRelayTransport() // TODO: test this later, probably need to upgrade libp2p
//         ],
//         streamMuxers: [yamux(), mplex()],
//         connectionEncryption: [noise()],
//         connectionGater: {
//             // not sure why needed, doesn't connect without it
//             // denyDialMultiaddr: async () => false
//         },
//         connectionManager: {
//             maxConnections: 10,
//             minConnections: 5
//         },
//         services: {
//             identify: identifyService(), // required for peer discovery of pubsub
//             dht: kadDHT({}), // p2p peer discovery
//             pubsub: gossipsub({
//                 allowPublishToZeroPeers: true
//             }),
//             nat: autoNAT()
//         }
//     });

//     // Log events here

//     const events: (keyof Libp2pEvents)[] = [
//         "connection:close",
//         "connection:open",
//         "connection:prune",
//         "peer:connect",
//         "peer:disconnect",
//         "peer:discovery",import { createLibp2p } from "libp2p";
// import { gossipsub } from "@chainsafe/libp2p-gossipsub";
// import { webTransport } from "@libp2p/webtransport";
// import { mplex } from "@libp2p/mplex";
// import { yamux } from "@chainsafe/libp2p-yamux";
// import { noise } from "@chainsafe/libp2p-noise";
// import { toString as uint8ArrayToString } from "uint8arrays/to-string";
// import { bootstrap } from "@libp2p/bootstrap";
// import { identify as identifyService } from "@libp2p/identify";
// import { kadDHT } from "@libp2p/kad-dht";
// import { webRTCDirect } from "@libp2p/webrtc";
// import Logger from "@plebbit/plebbit-logger";
// import { createEd25519PeerId } from "@libp2p/peer-id-factory";
// import type { IpfsHttpClientPubsubMessage, PubsubClient } from "../../types.js";
// import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
// import { autoNAT } from "@libp2p/autonat";

// import { EventEmitter } from "events";
// import { EventHandler, Libp2pEvents } from "@libp2p/interface";

// // TODO remove the ts-expect-error when this file matures

// const log = Logger("plebbit-js:browser-libp2p-pubsub");

// // From https://github.com/ipfs/helia/blob/main/packages/helia/src/utils/bootstrappers.ts
// const bootstrapConfig = {
//     list: [
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
//         "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
//         "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ"
//     ]
// };

// let libp2pPubsubClient: PubsubClient;

// export async function createLibp2pNode(): Promise<PubsubClient> {
//     if (libp2pPubsubClient) return libp2pPubsubClient;
//     const peerId = await createEd25519PeerId();
//     const libP2pNode = await createLibp2p({
//         // can't listen using webtransport in libp2p js
//         // addresses: {listen: []},

//         peerDiscovery: [bootstrap(bootstrapConfig)],
//         peerId,
//         transports: [
//             webTransport(),
//             webRTCDirect(),
//             circuitRelayTransport() // TODO: test this later, probably need to upgrade libp2p
//         ],
//         streamMuxers: [yamux(), mplex()],
//         connectionEncryption: [noise()],
//         connectionGater: {
//             // not sure why needed, doesn't connect without it
//             // denyDialMultiaddr: async () => false
//         },
//         connectionManager: {
//             maxConnections: 10,
//             minConnections: 5
//         },
//         services: {
//             identify: identifyService(), // required for peer discovery of pubsub
//             dht: kadDHT({}), // p2p peer discovery
//             pubsub: gossipsub({
//                 allowPublishToZeroPeers: true
//             }),
//             nat: autoNAT()
//         }
//     });

//     // Log events here

//     const events: (keyof Libp2pEvents)[] = [
//         "connection:close",
//         "connection:open",
//         "connection:prune",
//         "peer:connect",
//         "peer:disconnect",
//         "peer:discovery",
//         "peer:identify",
//         "peer:update",
//         "self:peer:update",
//         "start",
//         "stop",
//         "transport:close",
//         "transport:listening"
//     ];

//     events.forEach((eventName) =>
//         libP2pNode.addEventListener(eventName, (event) => {
//             log(event.type, event.detail);
//         })
//     );
//     //

//     log("Initialized address of Libp2p in browser", libP2pNode.getMultiaddrs());

//     const pubsubEventHandler = new EventEmitter();

//     libP2pNode.services.pubsub.addEventListener("message", (evt) => {
//         //@ts-expect-error
//         log(`Event from libp2p pubsub in browser:`, `${evt.detail["from"]}: on topic ${evt.detail.topic}`);

//         //@ts-expect-error
//         const msgFormatted: IpfsHttpClientPubsubMessage = { data: evt.detail.data, topic: evt.detail.topic, type: evt.detail.type };
//         pubsubEventHandler.emit(evt.detail.topic, msgFormatted);
//     });

//     libp2pPubsubClient = {
//         _client: {
//             pubsub: {
//                 ls: async () => libP2pNode.services.pubsub.getTopics(),
//                 peers: async (topic, options) => libP2pNode.services.pubsub.getSubscribers(topic),
//                 publish: async (topic, data, options) => {
//                     const res = await libP2pNode.services.pubsub.publish(topic, data);
//                     log("Published new data to topic", topic, "And the result is", res);
//                 },
//                 subscribe: async (topic, handler, options) => {
//                     libP2pNode.services.pubsub.subscribe(topic);
//                     //@ts-expect-error
//                     pubsubEventHandler.on(topic, handler);
//                 },
//                 unsubscribe: async (topic, handler, options) => {
//                     //@ts-expect-error
//                     pubsubEventHandler.removeListener(topic, handler);
//                     if (pubsubEventHandler.listenerCount(topic) === 0) libP2pNode.services.pubsub.unsubscribe(topic);
//                 }
//             }
//         },
//         //@ts-expect-error
//         _clientOptions: undefined, // TODO not sure if it should be undefined
//         peers: async () => libP2pNode.services.pubsub.getPeers().map((peer) => peer.toString())
//     };
//     return libp2pPubsubClient;
// }

//         "peer:identify",
//         "peer:update",
//         "self:peer:update",
//         "start",
//         "stop",
//         "transport:close",
//         "transport:listening"
//     ];

//     events.forEach((eventName) =>
//         libP2pNode.addEventListener(eventName, (event) => {
//             log(event.type, event.detail);
//         })
//     );
//     //

//     log("Initialized address of Libp2p in browser", libP2pNode.getMultiaddrs());

//     const pubsubEventHandler = new EventEmitter();

//     libP2pNode.services.pubsub.addEventListener("message", (evt) => {
//         //@ts-expect-error
//         log(`Event from libp2p pubsub in browser:`, `${evt.detail["from"]}: on topic ${evt.detail.topic}`);

//         //@ts-expect-error
//         const msgFormatted: IpfsHttpClientPubsubMessage = { data: evt.detail.data, topic: evt.detail.topic, type: evt.detail.type };
//         pubsubEventHandler.emit(evt.detail.topic, msgFormatted);
//     });

//     libp2pPubsubClient = {
//         _client: {
//             pubsub: {
//                 ls: async () => libP2pNode.services.pubsub.getTopics(),
//                 peers: async (topic, options) => libP2pNode.services.pubsub.getSubscribers(topic),
//                 publish: async (topic, data, options) => {
//                     const res = await libP2pNode.services.pubsub.publish(topic, data);
//                     log("Published new data to topic", topic, "And the result is", res);
//                 },
//                 subscribe: async (topic, handler, options) => {
//                     libP2pNode.services.pubsub.subscribe(topic);
//                     //@ts-expect-error
//                     pubsubEventHandler.on(topic, handler);
//                 },
//                 unsubscribe: async (topic, handler, options) => {
//                     //@ts-expect-error
//                     pubsubEventHandler.removeListener(topic, handler);
//                     if (pubsubEventHandler.listenerCount(topic) === 0) libP2pNode.services.pubsub.unsubscribe(topic);
//                 }
//             }
//         },
//         //@ts-expect-error
//         _clientOptions: undefined, // TODO not sure if it should be undefined
//         peers: async () => libP2pNode.services.pubsub.getPeers().map((peer) => peer.toString())
//     };
//     return libp2pPubsubClient;
// }
