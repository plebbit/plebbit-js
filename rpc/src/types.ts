export type PlebbitWsServerClassOptions = {
  port: number
  plebbit: any
  plebbitOptions?: any
}

export type PlebbitWsServerOptions = {
  port: number
  plebbitOptions?: any
}

export type JsonRpcSendNotificationOptions = {
  method: string
  result: any
  subscription: number
  event: string
  connectionId: string
}
