const {expect} = require('chai')
const testServerConfig = require('../test-server/config')
const WebSocketClient = require('rpc-websockets').Client

let webSocketClient
let getNextSubscriptionMessage
let webSocketClientCall

describe('plebbit-ws-server', () => {
  before(async () => {
    webSocketClient = new WebSocketClient(`ws://localhost:${testServerConfig.port}`)

    // wait for websocket connection to open
    await new Promise((resolve) => webSocketClient.on('open', resolve))

    // debug raw JSON RPC messages in console (optional)
    webSocketClient.socket.on('message', (message) => console.log('from server:', message.toString()))

    // util function for better error logs
    webSocketClientCall = async (...args) => {
      try {
        const res = await webSocketClient.call(...args)
        return res
      }
      catch (e) {
        e.message = e.message + `: ${e.data}`
        throw e
      }
    }

    // util function for listening to subscription messages
    getNextSubscriptionMessage = (subscriptionId) => new Promise(resolve => webSocketClient.socket.on('message', (jsonMessage) => {
      const message = JSON.parse(jsonMessage)
      if (message?.params?.subscription === subscriptionId) {
        resolve(message)
      }
    }))
  })

  after(async () => {
    webSocketClient.close()
  })

  it('getComment', async () => {
    const commentCid = 'comment cid'
    const comment = await webSocketClientCall('getComment', [commentCid])
    expect(comment?.cid).to.equal(commentCid)
    expect(typeof comment?.timestamp).to.equal('number')
    expect(comment?.updatedAt).to.equal(undefined)
  })

  it('getCommentUpdate', async () => {
    const commentCid = 'comment cid'
    const commentIpns = 'comment ipns'
    const comment = await webSocketClientCall('getCommentUpdate', [commentCid, commentIpns])
    expect(comment?.cid).to.equal(commentCid)
    expect(typeof comment?.updatedAt).to.equal('number')
  })

  it('getSubplebbitUpdate', async () => {
    const subplebbitAddress = 'subplebbit address'
    const subplebbit = await webSocketClientCall('getSubplebbitUpdate', [subplebbitAddress])
    expect(subplebbit?.address).to.equal(subplebbitAddress)
    expect(typeof subplebbit?.updatedAt).to.equal('number')
  })

  it('getSubplebbitPage', async () => {
    const pageCid = 'pageCid'
    const subplebbitAddress = 'subplebbit address'
    const page = await webSocketClientCall('getSubplebbitPage', [pageCid, subplebbitAddress])
    expect(typeof page?.nextCid).to.equal('string')
    expect(page?.comments?.length).to.be.greaterThan(0)
  })

  it('createSubplebbit', async () => {
    const createSubplebbitOptions = {
      title: 'title',
      description: 'description',
    }
    const subplebbit = await webSocketClientCall('createSubplebbit', [createSubplebbitOptions])
    expect(typeof subplebbit?.address).to.equal('string')
    expect(subplebbit?.title).to.equal(createSubplebbitOptions.title)
    expect(subplebbit?.description).to.equal(createSubplebbitOptions.description)
  })

  it('startSubplebbit', async () => {
    const subplebbitAddress = 'subplebbit address ' + Math.random()
    const res = await webSocketClientCall('startSubplebbit', [subplebbitAddress])
    expect(res).to.equal(true)

    // try to start the same sub again but fail
    let error
    try {
      await webSocketClientCall('startSubplebbit', [subplebbitAddress])
    } catch (e) {
      error = e
    }
    expect(error?.data).to.equal(`subplebbit '${subplebbitAddress}' already started`)
  })

  it('stopSubplebbit', async () => {
    const subplebbitAddress = 'started subplebbit address'
    const res = await webSocketClientCall('stopSubplebbit', [subplebbitAddress])
    expect(res).to.equal(true)
  })

  it('editSubplebbit', async () => {
    const createSubplebbitOptions = {
      title: 'title',
      description: 'description',
    }
    const subplebbit = await webSocketClientCall('createSubplebbit', [createSubplebbitOptions])
    expect(typeof subplebbit?.address).to.equal('string')
    expect(subplebbit?.title).to.equal(createSubplebbitOptions.title)
    expect(subplebbit?.description).to.equal(createSubplebbitOptions.description)

    const editSubplebbitOptions = {
      title: 'edited title',
    }
    const editedSubplebbit = await webSocketClientCall('editSubplebbit', [subplebbit.address, editSubplebbitOptions])
    expect(editedSubplebbit?.title).to.equal(editSubplebbitOptions.title)
    expect(editedSubplebbit?.description).to.equal(createSubplebbitOptions.description)

    // edit the sub back to previous so it works when tests run multiple times with the same server instance
    const editedSubplebbit2 = await webSocketClientCall('editSubplebbit', [subplebbit.address, createSubplebbitOptions])
    expect(editedSubplebbit2?.title).to.equal(createSubplebbitOptions.title)
    expect(editedSubplebbit2?.description).to.equal(createSubplebbitOptions.description)
  })

  it('listSubplebbits', async () => {
    const subplebbits = await webSocketClientCall('listSubplebbits', [])
    expect(subplebbits?.[0]).to.equal('list subplebbit address 1')
    expect(subplebbits?.[1]).to.equal('list subplebbit address 2')
  })

  it('publishComment', async () => {
    const createCommentOptions = {
      timestamp: 1000,
      content: 'content',
      title: 'title',
    }
    const challengeMessage = await webSocketClientCall('publishComment', [createCommentOptions])
    expect(challengeMessage?.challenges?.[0]?.type).to.equal('text')
    expect(typeof challengeMessage?.challengeRequestId).to.equal('string')

    const challengeVerificationMessage = await webSocketClientCall('publishChallengeAnswers', [challengeMessage.challengeRequestId, ['4']])
    expect(challengeVerificationMessage?.challengeSuccess).to.equal(true)
  })

  it('publishVote', async () => {
    const createVoteOptions = {
      commentCid: 'comment cid',
      vote: 1,
    }
    const challengeMessage = await webSocketClientCall('publishVote', [createVoteOptions])
    expect(challengeMessage?.challenges?.[0]?.type).to.equal('text')
    expect(typeof challengeMessage?.challengeRequestId).to.equal('string')

    const challengeVerificationMessage = await webSocketClientCall('publishChallengeAnswers', [challengeMessage.challengeRequestId, ['4']])
    expect(challengeVerificationMessage?.challengeSuccess).to.equal(true)
  })

  it('publishCommentEdit', async () => {
    const createCommentEditOptions = {
      commentCid: 'comment cid',
      vote: 1,
    }
    const challengeMessage = await webSocketClientCall('publishCommentEdit', [createCommentEditOptions])
    expect(challengeMessage?.challenges?.[0]?.type).to.equal('text')
    expect(typeof challengeMessage?.challengeRequestId).to.equal('string')

    const challengeVerificationMessage = await webSocketClientCall('publishChallengeAnswers', [challengeMessage.challengeRequestId, ['4']])
    expect(challengeVerificationMessage?.challengeSuccess).to.equal(true)
  })

  it('fetchCid', async () => {
    const cid = 'statscid'
    const res = await webSocketClientCall('fetchCid', [cid])
    expect(res).to.equal('{"hourActiveUserCount":1}')
  })

  it('commentUpdate', async () => {
    const commentCid = 'comment cid'
    const commentIpns = 'comment ipns'
    const subscriptionId = await webSocketClientCall('commentUpdate', [commentCid, commentIpns])
    expect(typeof subscriptionId).to.equal('number')

    const message1 = await getNextSubscriptionMessage(subscriptionId)
    expect(message1.method).to.equal('commentUpdate')
    expect(message1.params.event).to.equal('updatingstatechange')
    expect(message1.params.result).to.equal('fetching-ipfs')

    const message2 = await getNextSubscriptionMessage(subscriptionId)
    expect(message2.method).to.equal('commentUpdate')
    expect(message2.params.event).to.equal('update')
    expect(message2.params.result.cid).to.equal(commentCid)

    const unsubscribed = await webSocketClientCall('unsubscribe', [subscriptionId])
    expect(unsubscribed).to.equal(true)
  })
})
