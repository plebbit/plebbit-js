import {Server as RpcWebsocketsServer} from 'rpc-websockets'
import PlebbitJs, {setPlebbitJs} from './lib/plebbit-js'
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')
import {clone, generateSubscriptionId} from './utils'
import Logger from '@plebbit/plebbit-logger'
import {EventEmitter} from 'events'
const log = Logger('plebbit-js-rpc:plebbit-ws-server')
import {PlebbitWsServerClassOptions, PlebbitWsServerOptions, SendOptions} from './types'

// store started subplebbits to be able to stop them
const startedSubplebbits: {[address: string]: 'pending' | any} = {}
const getStartedSubplebbit = async (address: string) => {
  // if pending, wait until no longer pendng
  while (startedSubplebbits[address] === 'pending') {
    await new Promise((r) => setTimeout(r, 20))
  }
  return startedSubplebbits[address]
}

// store publishing publications so they can be used by publishChallengeAnswers
const publishing: {[challengeRequestId: string]: any} = {}

class PlebbitWsServer extends EventEmitter {
  plebbit: any
  rpcWebsockets: RpcWebsocketsServer
  ws: any
  connections: {[connectionId: string]: any} = {}
  subscriptionCleanups: {[subscriptionId: number]: Function} = {}

  constructor({port, plebbit}: PlebbitWsServerClassOptions) {
    super()
    this.plebbit = plebbit
    this.rpcWebsockets = new RpcWebsocketsServer({
      port,
      // might be needed to specify host for security later
      // host: 'localhost'
    })
    this.ws = this.rpcWebsockets.wss

    // forward errors to PlebbitWsServer
    this.rpcWebsockets.on('error', (error) => {
      this.emit('error', error)
    })
    this.plebbit.on('error', (error: any) => {
      this.emit('error', error)
    })

    // save connections to send messages to them later
    this.ws.on('connection', (ws: any) => {
      this.connections[ws._id] = ws
    })

    // register all JSON RPC methods
    this.rpcWebsocketsRegister('getComment', this.getComment.bind(this))
    this.rpcWebsocketsRegister('getCommentUpdate', this.getCommentUpdate.bind(this))
    this.rpcWebsocketsRegister('getSubplebbitUpdate', this.getSubplebbitUpdate.bind(this))
    this.rpcWebsocketsRegister('getSubplebbitPage', this.getSubplebbitPage.bind(this))
    this.rpcWebsocketsRegister('createSubplebbit', this.createSubplebbit.bind(this))
    this.rpcWebsocketsRegister('startSubplebbit', this.startSubplebbit.bind(this))
    this.rpcWebsocketsRegister('stopSubplebbit', this.stopSubplebbit.bind(this))
    this.rpcWebsocketsRegister('editSubplebbit', this.editSubplebbit.bind(this))
    this.rpcWebsocketsRegister('listSubplebbits', this.listSubplebbits.bind(this))
    this.rpcWebsocketsRegister('publishComment', this.publishComment.bind(this))
    this.rpcWebsocketsRegister('publishVote', this.publishVote.bind(this))
    this.rpcWebsocketsRegister('publishCommentEdit', this.publishCommentEdit.bind(this))
    this.rpcWebsocketsRegister('publishChallengeAnswers', this.publishChallengeAnswers.bind(this))
    this.rpcWebsocketsRegister('fetchCid', this.fetchCid.bind(this))
    // JSON RPC pubsub methods
    this.rpcWebsocketsRegister('commentUpdate', this.commentUpdate.bind(this))
    this.rpcWebsocketsRegister('unsubscribe', this.unsubscribe.bind(this))
  }

  // util function to log errors of registered methods
  rpcWebsocketsRegister(method: string, callback: Function) {
    const callbackWithLog = async (params: any, connectionId: string) => {
      try {
        const res = await callback(params, connectionId)
        return res
      } catch (e) {
        log.error(`${callback.name} error`, {params, error: e})
        throw e
      }
    }
    this.rpcWebsockets.register(method, callbackWithLog)
  }

  // send json rpc notification message (no id field, needs subscription id)
  send({method, result, subscription, event, connectionId}: SendOptions) {
    const message = {
      jsonrpc: '2.0',
      method,
      params: {
        result, 
        subscription, 
        event
      }
    }
    this.connections[connectionId]?.send?.(JSON.stringify(message))
  }

  async getComment(params: any) {
    const cid = params[0]
    const comment = await this.plebbit.createComment({cid})

    // wait for first update which contains the IPFS file only
    comment.update().catch((error: any) => log.error('getComment update error', {error, params}))
    await new Promise((resolve) => comment.once('update', resolve))
    comment.stop().catch((error: any) => log.error('getComment stop error', {error, params}))

    return clone(comment)
  }

  async getCommentUpdate(params: any) {
    const cid = params[0]
    const ipnsName = params[1]
    const updatedAtAfter = params[2] || 0

    const comment = await this.plebbit.createComment({cid, ipnsName})

    // wait for an update with updatedAt greater than updatedAtAfter
    comment.update().catch((error: any) => log.error('getCommentUpdate update error', {error, params}))
    await new Promise((resolve) =>
      comment.on('update', () => {
        if (comment.updatedAt && comment.updatedAt > updatedAtAfter) {
          resolve(comment)
        }
      })
    )
    comment.stop().catch((error: any) => log.error('getCommentUpdate stop error', {error, params}))

    return clone(comment)
  }

  async commentUpdate(params: any, connectionId: string) {
    const cid = params[0]
    const ipnsName = params[1]

    const subscriptionId = generateSubscriptionId()
    this.subscriptionCleanups[subscriptionId] = () => {
      comment.stop().catch((error: any) => log.error('commentUpdate stop error', {error, params}))
      comment.removeAllListeners('update')
      comment.removeAllListeners('updatingstatechange')
    }

    const comment = await this.plebbit.createComment({cid, ipnsName})
    comment.on('update', () => this.send({method: 'commentUpdate', subscription: subscriptionId, event: 'update', result: clone(comment), connectionId}))
    comment.on('updatingstatechange', () => this.send({method: 'commentUpdate', subscription: subscriptionId, event: 'updatingstatechange', result: comment.updatingState, connectionId}))
    // dont start before client receives his subscriptionId
    setTimeout(() => {
      comment.update().catch((error: any) => log.error('commentUpdate update error', {error, params}))
    }, 5)

    return subscriptionId
  }

  async unsubscribe(params: any) {
    const subscriptionId = params[0]

    if (!this.subscriptionCleanups[subscriptionId]) {
      throw Error(`no subscription with id '${subscriptionId}'`)
    }

    this.subscriptionCleanups[subscriptionId]()
    delete this.subscriptionCleanups[subscriptionId]
    return true
  }

  async getSubplebbitUpdate(params: any) {
    const address = params[0]
    const updatedAtAfter = params[1] || 0

    // assume that the user wants to know the started states
    // possibly move it to a getStartedSubplebbit method
    // const startedSubplebbit = await getStartedSubplebbit(address)
    // if (startedSubplebbit && startedSubplebbit.updatedAt > updatedAtAfter) {
    //   return startedSubplebbit
    // }

    const subplebbit = await this.plebbit.createSubplebbit({address})

    // wait for an update with updatedAt greater than updatedAtAfter
    subplebbit.update().catch((error: any) => log.error('getSubplebbitUpdate update error', {error, params}))
    await new Promise((resolve) =>
      subplebbit.on('update', () => {
        if (subplebbit.updatedAt && subplebbit.updatedAt > updatedAtAfter) {
          resolve(subplebbit)
        }
      })
    )
    subplebbit.stop().catch((error: any) => log.error('getSubplebbitUpdate stop error', {error, params}))

    return clone(subplebbit)
  }

  async getSubplebbitPage(params: any) {
    const pageCid = params[0]
    const subplebbitAddress = params[1]
    const subplebbit = await this.plebbit.createSubplebbit({address: subplebbitAddress})
    const page = await subplebbit.posts.getPage(pageCid)
    return clone(page)
  }

  async createSubplebbit(params: any) {
    const createSubplebbitOptions = params[0]
    if (createSubplebbitOptions?.address) {
      throw Error(`createSubplebbitOptions?.address '${createSubplebbitOptions?.address}' must be undefined to create a new subplebbit`)
    }
    const subplebbit = await this.plebbit.createSubplebbit(createSubplebbitOptions)
    return clone(subplebbit)
  }

  async startSubplebbit(params: any) {
    const address = params[0]

    if (startedSubplebbits[address]) {
      throw Error(`subplebbit '${address}' already started`)
    }
    startedSubplebbits[address] = 'pending'

    try {
      const subplebbit = await this.plebbit.createSubplebbit({address})
      await subplebbit.start()
    } catch (e) {
      delete startedSubplebbits[address]
      throw e
    }

    return true
  }

  async stopSubplebbit(params: any) {
    const address = params[0]

    if (!(await getStartedSubplebbit(address))) {
      return true
    }

    const subplebbit = await this.plebbit.createSubplebbit({address})
    await subplebbit.stop()
    delete startedSubplebbits[address]

    return true
  }

  async editSubplebbit(params: any) {
    const address = params[0]
    const editSubplebbitOptions = params[1]

    const subplebbit = await this.plebbit.createSubplebbit({address})
    await subplebbit.edit(editSubplebbitOptions)
    return clone(subplebbit)
  }

  async listSubplebbits(params: any) {
    const subplebbits = await this.plebbit.listSubplebbits()
    return clone(subplebbits)
  }

  async publishComment(params: any) {
    const createCommentOptions = params[0]

    const comment = await this.plebbit.createComment(createCommentOptions)
    comment.publish()
    let challengeMessage: any = await new Promise((r) => comment.once('challenge', (challengeMessage: any) => r(challengeMessage)))

    // try to convert the challengeRequestId to base58
    if (typeof challengeMessage.challengeRequestId !== 'string') {
      challengeMessage = {...challengeMessage, challengeRequestId: uint8ArrayToString(challengeMessage.challengeRequestId, 'base58btc')}
    }

    challengeMessage = clone(challengeMessage)

    publishing[challengeMessage.challengeRequestId] = comment

    return challengeMessage
  }

  async publishVote(params: any) {
    const createVoteOptions = params[0]

    const vote = await this.plebbit.createVote(createVoteOptions)
    vote.publish()
    let challengeMessage: any = await new Promise((r) => vote.once('challenge', (challengeMessage: any) => r(challengeMessage)))

    // try to convert the challengeRequestId to base58
    if (typeof challengeMessage.challengeRequestId !== 'string') {
      challengeMessage = {...challengeMessage, challengeRequestId: uint8ArrayToString(challengeMessage.challengeRequestId, 'base58btc')}
    }

    challengeMessage = clone(challengeMessage)

    publishing[challengeMessage.challengeRequestId] = vote

    return challengeMessage
  }

  async publishCommentEdit(params: any) {
    const createCommentEditOptions = params[0]

    const commentEdit = await this.plebbit.createCommentEdit(createCommentEditOptions)
    commentEdit.publish()
    let challengeMessage: any = await new Promise((r) => commentEdit.once('challenge', (challengeMessage: any) => r(challengeMessage)))

    // try to convert the challengeRequestId to base58
    if (typeof challengeMessage.challengeRequestId !== 'string') {
      challengeMessage = {...challengeMessage, challengeRequestId: uint8ArrayToString(challengeMessage.challengeRequestId, 'base58btc')}
    }

    challengeMessage = clone(challengeMessage)

    publishing[challengeMessage.challengeRequestId] = commentEdit

    return challengeMessage
  }

  async publishChallengeAnswers(params: any) {
    const challengeRequestId = params[0]
    const answers = params[1]

    if (!publishing[challengeRequestId]) {
      throw Error(`no publications with challengeRequestId '${challengeRequestId}'`)
    }
    const publication = publishing[challengeRequestId]

    publication.publishChallengeAnswers(answers)
    let challengeVerificationMessage: any = await new Promise((r) =>
      publication.once('challengeverification', (challengeVerificationMessage: any) => r(challengeVerificationMessage))
    )
    delete challengeVerificationMessage[challengeRequestId]

    // try to convert the challengeRequestId to base58
    if (typeof challengeVerificationMessage.challengeRequestId !== 'string') {
      challengeVerificationMessage = {
        ...challengeVerificationMessage,
        challengeRequestId: uint8ArrayToString(challengeVerificationMessage.challengeRequestId, 'base58btc'),
      }
    }

    return clone(challengeVerificationMessage)
  }

  async fetchCid(params: any) {
    const cid = params[0]
    const res = await this.plebbit.fetchCid(cid)
    return clone(res)
  }
}

const createPlebbitWsServer = async ({port, plebbitOptions}: PlebbitWsServerOptions) => {
  if (typeof port !== 'number') {
    throw Error(`createPlebbitWsServer port '${port}' not a number`)
  }

  const plebbit = await PlebbitJs.Plebbit(plebbitOptions)

  const plebbitWss = new PlebbitWsServer({plebbit, port})
  return plebbitWss
}

const PlebbitRpc = {
  PlebbitWsServer: createPlebbitWsServer,
  // for mocking plebbit-js during tests
  setPlebbitJs
}

export = PlebbitRpc
