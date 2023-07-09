import {Server as WebSocketServer} from 'rpc-websockets'
import PlebbitJs, {setPlebbitJs} from './lib/plebbit-js'
const {toString: uint8ArrayToString} = require('uint8arrays/to-string')
import {clone} from './utils'
import Logger from '@plebbit/plebbit-logger'
import {EventEmitter} from 'events'
const log = Logger('plebbit-js-rpc:plebbit-ws-server')

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

type PlebbitWsServerClassOptions = {
  port: number
  plebbit: any
}

class PlebbitWsServer extends EventEmitter {
  plebbit: any
  wss: WebSocketServer

  constructor({port, plebbit}: PlebbitWsServerClassOptions) {
    super()
    this.plebbit = plebbit
    this.wss = new WebSocketServer({
      port,
      // might be needed to specify host for security later
      // host: 'localhost'
    })

    // forward errors to PlebbitWsServer
    this.wss.on('error', (error) => {
      this.emit('error', error)
    })
    this.plebbit.on('error', (error: any) => {
      this.emit('error', error)
    })

    // register all JSON RPC methods
    this.wssRegister('getComment', this.getComment.bind(this))
    this.wssRegister('getCommentUpdate', this.getCommentUpdate.bind(this))
    this.wssRegister('getSubplebbitUpdate', this.getSubplebbitUpdate.bind(this))
    this.wssRegister('getSubplebbitPage', this.getSubplebbitPage.bind(this))
    this.wssRegister('createSubplebbit', this.createSubplebbit.bind(this))
    this.wssRegister('startSubplebbit', this.startSubplebbit.bind(this))
    this.wssRegister('stopSubplebbit', this.stopSubplebbit.bind(this))
    this.wssRegister('editSubplebbit', this.editSubplebbit.bind(this))
    this.wssRegister('listSubplebbits', this.listSubplebbits.bind(this))
    this.wssRegister('publishComment', this.publishComment.bind(this))
    this.wssRegister('publishVote', this.publishVote.bind(this))
    this.wssRegister('publishCommentEdit', this.publishCommentEdit.bind(this))
    this.wssRegister('publishChallengeAnswers', this.publishChallengeAnswers.bind(this))
    this.wssRegister('fetchCid', this.fetchCid.bind(this))
  }

  // util function to log errors of registered methods
  wssRegister(method: string, callback: Function) {
    const callbackWithLog = async (params: any) => {
      try {
        const res = await callback(params)
        return res
      } catch (e) {
        log.error(`${callback.name} error`, {params, error: e})
        throw e
      }
    }
    this.wss.register(method, callbackWithLog)
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
        console.log(comment)
        if (comment.updatedAt && comment.updatedAt > updatedAtAfter) {
          resolve(comment)
        }
      })
    )
    comment.stop().catch((error: any) => log.error('getCommentUpdate stop error', {error, params}))

    return clone(comment)
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

    // returning undefined is invalid JSON RPC
    return null
  }

  async stopSubplebbit(params: any) {
    const address = params[0]

    if (!(await getStartedSubplebbit(address))) {
      return null
    }

    const subplebbit = await this.plebbit.createSubplebbit({address})
    await subplebbit.stop()
    delete startedSubplebbits[address]

    // returning undefined is invalid JSON RPC
    return null
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

type PlebbitWsServerOptions = {
  port: number
  plebbitOptions?: any
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
