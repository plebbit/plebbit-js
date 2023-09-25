import {Server as RpcWebsocketsServer} from 'rpc-websockets'
import PlebbitJs, {setPlebbitJs} from './lib/plebbit-js'
import {clone, formatPubsubMsg, generateSubscriptionId} from './utils'
import Logger from '@plebbit/plebbit-logger'
import {EventEmitter} from 'events'
const log = Logger('plebbit-js-rpc:plebbit-ws-server')
import {PlebbitWsServerClassOptions, PlebbitWsServerOptions, JsonRpcSendNotificationOptions} from './types'

// store started subplebbits  to be able to stop them
// store as a singleton because not possible to start the same sub twice at the same time
const startedSubplebbits: {[address: string]: 'pending' | any} = {}
const getStartedSubplebbit = async (address: string) => {
  // if pending, wait until no longer pendng
  while (startedSubplebbits[address] === 'pending') {
    await new Promise((r) => setTimeout(r, 20))
  }
  return startedSubplebbits[address]
}

class PlebbitWsServer extends EventEmitter {
  plebbit: any
  plebbitOptions?: {[key: string]: any}
  rpcWebsockets: RpcWebsocketsServer
  ws: any
  connections: {[connectionId: string]: any} = {}
  subscriptionCleanups: {[connectionId: string]: {[subscriptionId: number]: () => void}} = {}
  // store publishing publications so they can be used by publishChallengeAnswers
  publishing: {[subscriptionId: number]: any} = {}

  constructor({port, plebbit, plebbitOptions}: PlebbitWsServerClassOptions) {
    super()
    // don't instantiate plebbit in constructor because it's an async function
    this.plebbit = plebbit
    this.plebbitOptions = plebbitOptions
    this.rpcWebsockets = new RpcWebsocketsServer({
      port,
      // might be needed to specify host for security later
      // host: 'localhost'
    })
    // rpc-sockets uses this library https://www.npmjs.com/package/ws
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
      this.subscriptionCleanups[ws._id] = {}
    })

    // cleanup on disconnect
    this.rpcWebsockets.on('disconnection', (ws: any) => {
      const subscriptionCleanups = this.subscriptionCleanups[ws._id]
      for (const subscriptionId in subscriptionCleanups) {
        subscriptionCleanups[subscriptionId]()
        delete subscriptionCleanups[subscriptionId]
      }
      delete this.subscriptionCleanups[ws._id]
      delete this.connections[ws._id]
    })

    // register all JSON RPC methods
    this.rpcWebsocketsRegister('getComment', this.getComment.bind(this))
    this.rpcWebsocketsRegister('getSubplebbitPage', this.getSubplebbitPage.bind(this))
    this.rpcWebsocketsRegister('getCommentPage', this.getCommentPage.bind(this))
    this.rpcWebsocketsRegister('createSubplebbit', this.createSubplebbit.bind(this))
    this.rpcWebsocketsRegister('startSubplebbit', this.startSubplebbit.bind(this))
    this.rpcWebsocketsRegister('stopSubplebbit', this.stopSubplebbit.bind(this))
    this.rpcWebsocketsRegister('editSubplebbit', this.editSubplebbit.bind(this))
    this.rpcWebsocketsRegister('deleteSubplebbit', this.deleteSubplebbit.bind(this))
    this.rpcWebsocketsRegister('listSubplebbits', this.listSubplebbits.bind(this))
    this.rpcWebsocketsRegister('fetchCid', this.fetchCid.bind(this))
    this.rpcWebsocketsRegister('getPlebbitOptions', this.getPlebbitOptions.bind(this))
    this.rpcWebsocketsRegister('setPlebbitOptions', this.setPlebbitOptions.bind(this))
    // JSON RPC pubsub methods
    this.rpcWebsocketsRegister('commentUpdate', this.commentUpdate.bind(this))
    this.rpcWebsocketsRegister('subplebbitUpdate', this.subplebbitUpdate.bind(this))
    this.rpcWebsocketsRegister('publishComment', this.publishComment.bind(this))
    this.rpcWebsocketsRegister('publishVote', this.publishVote.bind(this))
    this.rpcWebsocketsRegister('publishCommentEdit', this.publishCommentEdit.bind(this))
    this.rpcWebsocketsRegister('publishChallengeAnswers', this.publishChallengeAnswers.bind(this))
    this.rpcWebsocketsRegister('unsubscribe', this.unsubscribe.bind(this))
  }

  // util function to log errors of registered methods
  rpcWebsocketsRegister(method: string, callback: Function) {
    const callbackWithErrorHandled = async (params: any, connectionId: string) => {
      try {
        const res = await callback(params, connectionId)
        return res
      } catch (e: any) {
        log.error(`${callback.name} error`, {params, error: e})
        // We need to stringify the error here because rpc-websocket will remove props from PlebbitError
        if (!e.code) {
          const errorJson = JSON.parse(JSON.stringify(e, Object.getOwnPropertyNames(e)))
          delete errorJson['stack']
          throw errorJson
        } else {
          // PlebbitError
          const errorJson = clone(e)
          delete errorJson['stack']
          throw errorJson
        }
      }
    }
    this.rpcWebsockets.register(method, callbackWithErrorHandled)
  }

  // send json rpc notification message (no id field, but must have subscription id)
  jsonRpcSendNotification({method, result, subscription, event, connectionId}: JsonRpcSendNotificationOptions) {
    const message = {
      jsonrpc: '2.0',
      method,
      params: {
        result,
        subscription,
        event,
      },
    }
    if (event === 'error') {
      delete message?.params?.result?.stack
      delete message?.params?.result?.details?.error?.stack
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

  async getSubplebbitPage(params: any) {
    const pageCid = params[0]
    const subplebbitAddress = params[1]
    const subplebbit = await this.plebbit.createSubplebbit({address: subplebbitAddress})
    const page = await subplebbit.posts._fetchAndVerifyPage(pageCid)
    return page
  }

  async getCommentPage(params: any) {
    const [pageCid, commentCid, subplebbitAddress] = params
    const comment = await this.plebbit.createComment({cid: commentCid, subplebbitAddress})
    const page = await comment.replies._fetchAndVerifyPage(pageCid)
    return page
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
      startedSubplebbits[address] = subplebbit
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

  async deleteSubplebbit(params: any) {
    const address = params[0]

    // try to delete a started sub
    const startedSubplebbit = await getStartedSubplebbit(address)
    if (startedSubplebbit) {
      await startedSubplebbit.stop()
      await startedSubplebbit.delete()
      delete startedSubplebbits[address]
    }

    // try to delete a sub not started
    else {
      const addresses = await this.plebbit.listSubplebbits()
      if (!addresses.includes(address)) {
        throw Error(`subplebbit with address '${address}' not found in plebbit.listSubplebbits()`)
      }
      const subplebbit = await this.plebbit.createSubplebbit({address})
      await subplebbit.delete()
    }

    return true
  }

  async listSubplebbits(params: any) {
    const subplebbits = await this.plebbit.listSubplebbits()
    return clone(subplebbits)
  }

  async fetchCid(params: any) {
    const cid = params[0]
    const res = await this.plebbit.fetchCid(cid)
    return clone(res)
  }

  async getPlebbitOptions(params: any) {
    // if plebbitOptions is undefined, send empty object
    return this.plebbitOptions || {}
  }

  async setPlebbitOptions(params: any) {
    const plebbitOptions = params[0]
    this.plebbit = await PlebbitJs.Plebbit(plebbitOptions)
    this.plebbitOptions = plebbitOptions

    // restart all started subplebbits with new plebbit options
    for (const address in startedSubplebbits) {
      const startedSubplebbit = await getStartedSubplebbit(address)
      try {
        await startedSubplebbit.stop()
      } catch (error) {
        log.error('setPlebbitOptions failed stopping subplebbit', {error, address, params})
      }
      try {
        startedSubplebbits[address] = await this.plebbit.createSubplebbit({address})
        await startedSubplebbits[address].start()
      } catch (error) {
        log.error('setPlebbitOptions failed restarting subplebbit', {error, address, params})
      }
    }

    // TODO: possibly restart all updating comment/subplebbit subscriptions with new plebbit options,
    // not sure if needed because plebbit-react-hooks clients can just reload the page, low priority

    return true
  }

  async commentUpdate(params: any, connectionId: string) {
    const cid = params[0]
    const subscriptionId = generateSubscriptionId()

    const sendEvent = (event: string, result: any) => this.jsonRpcSendNotification({method: 'commentUpdate', subscription: subscriptionId, event, result, connectionId})

    const comment = await this.plebbit.createComment({cid})
    comment.on('update', () => sendEvent('update', comment.updatedAt ? comment._rawCommentUpdate : {cid, ...comment._rawCommentIpfs}))
    comment.on('updatingstatechange', () => sendEvent('updatingstatechange', comment.updatingState))
    comment.on('error', (error: any) => sendEvent('error', error))

    // cleanup function
    this.subscriptionCleanups[connectionId][subscriptionId] = () => {
      comment.stop().catch((error: any) => log.error('commentUpdate stop error', {error, params}))
      comment.removeAllListeners('update')
      comment.removeAllListeners('updatingstatechange')
    }

    // if fail, cleanup
    try {
      await comment.update()
    } catch (e) {
      this.subscriptionCleanups[connectionId][subscriptionId]()
      throw e
    }

    return subscriptionId
  }

  async subplebbitUpdate(params: any, connectionId: string) {
    const address = params[0]
    const subscriptionId = generateSubscriptionId()

    const sendEvent = (event: string, result: any) =>
      this.jsonRpcSendNotification({method: 'subplebbitUpdate', subscription: subscriptionId, event, result, connectionId})

    // assume that the user wants to know the started states
    // possibly move it to a startedSubplebbitUpdate method
    // const startedSubplebbit = await getStartedSubplebbit(address)

    const subplebbit = await this.plebbit.createSubplebbit({address})
    subplebbit.on('update', () => sendEvent('update', subplebbit.toJSONIpfs()))
    subplebbit.on('updatingstatechange', () => sendEvent('updatingstatechange', subplebbit.updatingState))
    subplebbit.on('error', (error: any) => sendEvent('error', error))

    // cleanup function
    this.subscriptionCleanups[connectionId][subscriptionId] = () => {
      subplebbit.stop().catch((error: any) => log.error('subplebbitUpdate stop error', {error, params}))
      subplebbit.removeAllListeners('update')
      subplebbit.removeAllListeners('updatingstatechange')
    }

    // if fail, cleanup
    try {
      await subplebbit.update()
    } catch (e) {
      this.subscriptionCleanups[connectionId][subscriptionId]()
      throw e
    }

    return subscriptionId
  }

  async publishComment(params: any, connectionId: string) {
    const createCommentOptions = params[0]
    const subscriptionId = generateSubscriptionId()

    const sendEvent = (event: string, result: any) => this.jsonRpcSendNotification({method: 'publishComment', subscription: subscriptionId, event, result, connectionId})

    const comment = await this.plebbit.createComment(createCommentOptions)
    this.publishing[subscriptionId] = comment
    comment.on('challenge', (challenge: any) => sendEvent('challenge', formatPubsubMsg(challenge)))
    comment.on('challengeanswer', (answer: any) => sendEvent('challengeanswer', formatPubsubMsg(answer)))
    comment.on('challengerequest', (request: any) => sendEvent('challengerequest', formatPubsubMsg(request)))
    comment.on('challengeverification', (challengeVerification: any) => sendEvent('challengeverification', formatPubsubMsg(challengeVerification)))
    comment.on('publishingstatechange', () => sendEvent('publishingstatechange', comment.publishingState))
    comment.on('error', (error: any) => sendEvent('error', error))

    // cleanup function
    this.subscriptionCleanups[connectionId][subscriptionId] = () => {
      delete this.publishing[subscriptionId]
      comment.stop().catch((error: any) => log.error('publishComment stop error', {error, params}))
      comment.removeAllListeners('challenge')
      comment.removeAllListeners('challengeanswer')
      comment.removeAllListeners('challengerequest')
      comment.removeAllListeners('challengeverification')
      comment.removeAllListeners('publishingstatechange')
    }

    // if fail, cleanup
    try {
      await comment.publish()
    } catch (e) {
      this.subscriptionCleanups[connectionId][subscriptionId]()
      throw e
    }

    return subscriptionId
  }

  async publishVote(params: any, connectionId: string) {
    const createVoteOptions = params[0]
    const subscriptionId = generateSubscriptionId()

    const sendEvent = (event: string, result: any) => this.jsonRpcSendNotification({method: 'publishVote', subscription: subscriptionId, event, result, connectionId})

    const vote = await this.plebbit.createVote(createVoteOptions)
    this.publishing[subscriptionId] = vote
    vote.on('challenge', (challenge: any) => sendEvent('challenge', formatPubsubMsg(challenge)))
    vote.on('challengeanswer', (answer: any) => sendEvent('challengeanswer', formatPubsubMsg(answer)))
    vote.on('challengerequest', (request: any) => sendEvent('challengerequest', formatPubsubMsg(request)))
    vote.on('challengeverification', (challengeVerification: any) => sendEvent('challengeverification', formatPubsubMsg(challengeVerification)))
    vote.on('publishingstatechange', () => sendEvent('publishingstatechange', vote.publishingState))
    vote.on('error', (error: any) => sendEvent('error', error))

    // cleanup function
    this.subscriptionCleanups[connectionId][subscriptionId] = () => {
      delete this.publishing[subscriptionId]
      vote.stop().catch((error: any) => log.error('publishVote stop error', {error, params}))
      vote.removeAllListeners('challenge')
      vote.removeAllListeners('challengeanswer')
      vote.removeAllListeners('challengerequest')
      vote.removeAllListeners('challengeverification')
      vote.removeAllListeners('publishingstatechange')
    }

    // if fail, cleanup
    try {
      await vote.publish()
    } catch (e) {
      this.subscriptionCleanups[connectionId][subscriptionId]()
      throw e
    }

    return subscriptionId
  }

  async publishCommentEdit(params: any, connectionId: string) {
    const createCommentEditOptions = params[0]
    const subscriptionId = generateSubscriptionId()

    const sendEvent = (event: string, result: any) =>
      this.jsonRpcSendNotification({method: 'publishCommentEdit', subscription: subscriptionId, event, result, connectionId})

    const commentEdit = await this.plebbit.createCommentEdit(createCommentEditOptions)
    this.publishing[subscriptionId] = commentEdit
    commentEdit.on('challenge', (challenge: any) => sendEvent('challenge', formatPubsubMsg(challenge)))
    commentEdit.on('challengeanswer', (answer: any) => sendEvent('challengeanswer', formatPubsubMsg(answer)))
    commentEdit.on('challengerequest', (request: any) => sendEvent('challengerequest', formatPubsubMsg(request)))
    commentEdit.on('challengeverification', (challengeVerification: any) => sendEvent('challengeverification', formatPubsubMsg(challengeVerification)))
    commentEdit.on('publishingstatechange', () => sendEvent('publishingstatechange', commentEdit.publishingState))
    commentEdit.on('error', (error: any) => sendEvent('error', error))

    // cleanup function
    this.subscriptionCleanups[connectionId][subscriptionId] = () => {
      delete this.publishing[subscriptionId]
      commentEdit.stop().catch((error: any) => log.error('publishCommentEdit stop error', {error, params}))
      commentEdit.removeAllListeners('challengerequest')
      commentEdit.removeAllListeners('challenge')
      commentEdit.removeAllListeners('challengeanswer')
      commentEdit.removeAllListeners('challengeverification')
      commentEdit.removeAllListeners('publishingstatechange')
    }

    // if fail, cleanup
    try {
      await commentEdit.publish()
    } catch (e) {
      this.subscriptionCleanups[connectionId][subscriptionId]()
      throw e
    }

    return subscriptionId
  }

  async publishChallengeAnswers(params: any) {
    const subscriptionId = params[0]
    const answers = params[1]

    if (!this.publishing[subscriptionId]) {
      throw Error(`no subscription with id '${subscriptionId}'`)
    }
    const publication = this.publishing[subscriptionId]

    await publication.publishChallengeAnswers(answers)

    return true
  }

  async unsubscribe(params: any, connectionId: string) {
    const subscriptionId = params[0]

    if (!this.subscriptionCleanups[connectionId][subscriptionId]) return true

    this.subscriptionCleanups[connectionId][subscriptionId]()
    delete this.subscriptionCleanups[connectionId][subscriptionId]
    return true
  }
}

const createPlebbitWsServer = async ({port, plebbitOptions}: PlebbitWsServerOptions) => {
  if (typeof port !== 'number') {
    throw Error(`createPlebbitWsServer port '${port}' not a number`)
  }

  const plebbit = await PlebbitJs.Plebbit(plebbitOptions)

  const plebbitWss = new PlebbitWsServer({plebbit, port, plebbitOptions})
  return plebbitWss
}

const PlebbitRpc = {
  PlebbitWsServer: createPlebbitWsServer,
  // for mocking plebbit-js during tests
  setPlebbitJs,
}

export = PlebbitRpc
