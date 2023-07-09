const {expect} = require('chai')
const testServerConfig = require('../test-server/config')
const WebSocketClient = require('rpc-websockets').Client

let webSocketClient

describe('plebbit-js-rpc', () => {
  before(async () => {
    webSocketClient = new WebSocketClient(`ws://localhost:${testServerConfig.port}`)

    // debug raw JSON RPC messages
    webSocketClient.socket.on('message', (message) => console.log('from server:', message.toString()))

    // wait for websocket connection  to open
    await new Promise((resolve) => webSocketClient.on('open', resolve))
  })

  after(() => {
    webSocketClient.close()
  })

  it('getComment', async () => {
    const commentCid = 'comment cid'
    const comment = await webSocketClient.call('getComment', [commentCid])
    expect(comment?.cid).to.equal(commentCid)
    expect(typeof comment?.timestamp).to.equal('number')
    expect(comment?.updatedAt).to.equal(undefined)
  })

  it('getCommentUpdate', async () => {
    const commentCid = 'comment cid'
    const commentIpns = 'comment ipns'
    const comment = await webSocketClient.call('getCommentUpdate', [commentCid, commentIpns])
    expect(comment?.cid).to.equal(commentCid)
    expect(typeof comment?.updatedAt).to.equal('number')
  })

  it('getSubplebbitUpdate', async () => {
    const subplebbitAddress = 'subplebbit address'
    const subplebbit = await webSocketClient.call('getSubplebbitUpdate', [subplebbitAddress])
    expect(subplebbit?.address).to.equal(subplebbitAddress)
    expect(typeof subplebbit?.updatedAt).to.equal('number')
  })

  it('getSubplebbitPage', async () => {
    const pageCid = 'pageCid'
    const subplebbitAddress = 'subplebbit address'
    const page = await webSocketClient.call('getSubplebbitPage', [pageCid, subplebbitAddress])
    expect(typeof page?.nextCid).to.equal('string')
    expect(page?.comments?.length).to.be.greaterThan(0)
  })

  it('createSubplebbit', async () => {
    const createSubplebbitOptions = {
      title: 'title',
      description: 'description',
    }
    const subplebbit = await webSocketClient.call('createSubplebbit', [createSubplebbitOptions])
    expect(typeof subplebbit?.address).to.equal('string')
    expect(subplebbit?.title).to.equal(createSubplebbitOptions.title)
    expect(subplebbit?.description).to.equal(createSubplebbitOptions.description)
  })

  it('startSubplebbit', async () => {
    const subplebbitAddress = 'subplebbit address ' + Math.random()
    const res = await webSocketClient.call('startSubplebbit', [subplebbitAddress])
    expect(res).to.equal(null)

    // try to start the same sub again but fail
    let error
    try {
      await webSocketClient.call('startSubplebbit', [subplebbitAddress])
    } catch (e) {
      error = e
    }
    expect(error?.data).to.equal(`subplebbit '${subplebbitAddress}' already started`)
  })

  it('stopSubplebbit', async () => {
    const subplebbitAddress = 'started subplebbit address'
    const res = await webSocketClient.call('stopSubplebbit', [subplebbitAddress])
    expect(res).to.equal(null)
  })

  it('editSubplebbit', async () => {
    const createSubplebbitOptions = {
      title: 'title',
      description: 'description',
    }
    const subplebbit = await webSocketClient.call('createSubplebbit', [createSubplebbitOptions])
    expect(typeof subplebbit?.address).to.equal('string')
    expect(subplebbit?.title).to.equal(createSubplebbitOptions.title)
    expect(subplebbit?.description).to.equal(createSubplebbitOptions.description)

    const editSubplebbitOptions = {
      title: 'edited title',
    }
    const editedSubplebbit = await webSocketClient.call('editSubplebbit', [subplebbit.address, editSubplebbitOptions])
    expect(editedSubplebbit?.title).to.equal(editSubplebbitOptions.title)
    expect(editedSubplebbit?.description).to.equal(createSubplebbitOptions.description)

    // edit the sub back to previous so it works when tests run multiple times with the same server instance
    const editedSubplebbit2 = await webSocketClient.call('editSubplebbit', [subplebbit.address, createSubplebbitOptions])
    expect(editedSubplebbit2?.title).to.equal(createSubplebbitOptions.title)
    expect(editedSubplebbit2?.description).to.equal(createSubplebbitOptions.description)
  })

  it('listSubplebbits', async () => {
    const subplebbits = await webSocketClient.call('listSubplebbits', [])
    expect(subplebbits?.[0]).to.equal('list subplebbit address 1')
    expect(subplebbits?.[1]).to.equal('list subplebbit address 2')
  })

  it('publishComment', async () => {
    const createCommentOptions = {
      timestamp: 1000,
      content: 'content',
      title: 'title',
    }
    const challengeMessage = await webSocketClient.call('publishComment', [createCommentOptions])
    expect(challengeMessage?.challenges?.[0]?.type).to.equal('text')
    expect(typeof challengeMessage?.challengeRequestId).to.equal('string')

    const challengeVerificationMessage = await webSocketClient.call('publishChallengeAnswers', [challengeMessage.challengeRequestId, ['4']])
    expect(challengeVerificationMessage?.challengeSuccess).to.equal(true)
  })

  it('publishVote', async () => {
    const createVoteOptions = {
      commentCid: 'comment cid',
      vote: 1,
    }
    const challengeMessage = await webSocketClient.call('publishVote', [createVoteOptions])
    expect(challengeMessage?.challenges?.[0]?.type).to.equal('text')
    expect(typeof challengeMessage?.challengeRequestId).to.equal('string')

    const challengeVerificationMessage = await webSocketClient.call('publishChallengeAnswers', [challengeMessage.challengeRequestId, ['4']])
    expect(challengeVerificationMessage?.challengeSuccess).to.equal(true)
  })

  it('publishCommentEdit', async () => {
    const createCommentEditOptions = {
      commentCid: 'comment cid',
      vote: 1,
    }
    const challengeMessage = await webSocketClient.call('publishCommentEdit', [createCommentEditOptions])
    expect(challengeMessage?.challenges?.[0]?.type).to.equal('text')
    expect(typeof challengeMessage?.challengeRequestId).to.equal('string')

    const challengeVerificationMessage = await webSocketClient.call('publishChallengeAnswers', [challengeMessage.challengeRequestId, ['4']])
    expect(challengeVerificationMessage?.challengeSuccess).to.equal(true)
  })

  it('fetchCid', async () => {
    const cid = 'statscid'
    const res = await webSocketClient.call('fetchCid', [cid])
    expect(res).to.equal('{"hourActiveUserCount":1}')
  })
})
