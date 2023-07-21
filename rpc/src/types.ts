export type PlebbitWsServerClassOptions = {
  port: number
  plebbit: any
}

export type SendOptions = {
  method: string
  result: any
  subscription: number
  event: string
  connectionId: string
}

export type PlebbitWsServerOptions = {
  port: number
  plebbitOptions?: any
}
