#### Types

```js
Client {
  state: string
}

Clients {
  ipfsGateways: {[ipfsGatewayUrl: string]: Client}
  ipfsClients: {[ipfsClientUrl: string]: Client}
  pubsubClients: {[pubsubClientUrl: string]: Client}
  chainProviders: {[chainProviderUrl: string]: Client}
}

Comment {
  clients: Clients
}

Subplebbit {
  clients: Clients
}

IpfsStats {
  totalIn: number // IPFS stats https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-stats-bw
  totalOut: number
  rateIn: number
  rateOut: number
  succeededIpfsCount: number
  failedIpfsCount: number
  succeededIpfsAverageTime: number
  succeededIpfsMedianTime: number
  succeededIpnsCount: number
  failedIpnsCount: number
  succeededIpnsAverageTime: number
  succeededIpnsMedianTime: number
}

IpfsSubplebbitStats {
  stats: IpfsStats
  sessionStats: IpfsStats // session means in the last 1h
}

PubsubStats {
  totalIn: number // IPFS stats https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-stats-bw
  totalOut: number
  rateIn: number
  rateOut: number
  succeededChallengeRequestMessageCount: number
  failedChallengeRequestMessageCount: number
  succeededChallengeRequestMessageAverageTime: number
  succeededChallengeRequestMessageMedianTime: number
  succeededChallengeAnswerMessageCount: number
  failedChallengeAnswerMessageCount: number
  succeededChallengeAnswerMessageAverageTime: number
  succeededChallengeAnswerMessageMedianTime: number
}

PubsubSubplebbitStats {
  stats: PubsubStats
  sessionStats: PubsubStats // session means in the last 1h
}

IpfsClient {
  peers: Peer[] // IPFS peers https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-swarm-peers
  stats: IpfsStats
  sessionStats: IpfsStats // session means in the last 1h
  subplebbitStats: {[subplebbitAddress: string]: IpfsSubplebbitStats}
}

GatewayClient {
  stats: IpfsStats
  sessionStats: IpfsStats // session means in the last 1h
  subplebbitStats: {[subplebbitAddress: string]: IpfsSubplebbitStats}
}

PubsubClient {
  peers: Peer[] // IPFS peers https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-swarm-peers
  stats: PubsubStats
  sessionStats: PubsubStats
  subplebbitStats: {[subplebbitAddress: string]: PubsubSubplebbitStats}
}

ChainProvider {
  // No need to implement for now since blockchain providers are usually fast and don't fail
}

PlebbitClients {
  ipfsGateways: {[ipfsGatewayUrl: string]: GatewayClient}
  ipfsClients: {[ipfsClientUrl: string]: IpfsClient}
  pubsubClients: {[pubsubClientUrl: string]: PubsubClient}
  chainProviders: {[chainProviderUrl: string]: ChainProvider}
}

Plebbit {
  clients: PlebbitClients
}
```

#### Events

```
Comment events
  - clientschange

Subplebbit events
  - clientschange

Plebbit events
  - clientschange
```