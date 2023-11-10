const {testRateLimit, addToRateLimiter} = require('../../dist/node/runtime/node/challenges/exclude/rate-limiter')
const {expect} = require('chai')

// sometimes use random addresses because the rate limiter 
// is based on author addresses and doesn't reset between tests
const getRandomAddress = () => String(Math.random())

describe("testRateLimit", () => {
  // util function to create the argument of addToRateLimiter from an
  const createSubplebbitChallenges = (excludeArray) => {
    return [{
      exclude: excludeArray
    }]
  }

  it("1 any publication type", async () => {
    const author1 = {address: getRandomAddress()}
    const author2 = {address: getRandomAddress()}
    const exclude = {rateLimit: 1}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const publication2 = {author: author2}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    expect(testRateLimit(exclude, publication1)).to.equal(false)
    expect(testRateLimit(exclude, publication2)).to.equal(true)
  })

  it("1 any publication type challengeSuccess false", async () => {
    const author1 = {address: getRandomAddress()}
    const author2 = {address: getRandomAddress()}
    const exclude = {rateLimit: 1}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const publication2 = {author: author2}
    const challengeSuccess = false
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    // without rateLimitChallengeSuccess set, only successful publications are rate limited
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    expect(testRateLimit(exclude, publication2)).to.equal(true)
  })

  it("10 any publication type", async () => {
    const exclude = {rateLimit: 10}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication = {author: {address: getRandomAddress()}}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publication)).to.equal(true)
    let count = 20
    while(count--) {
      addToRateLimiter(subplebbitChallenges, publication, challengeSuccess)  
    }
    expect(testRateLimit(exclude, publication)).to.equal(false)
  })

  it("1 post type true", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: true}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationVote, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
  })

  it("1 post type true challengeSuccess false", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: true}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = false
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    // without rateLimitChallengeSuccess set, only successful publications are rate limited
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
  })

  it("1 post type false", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: false}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(false)
    expect(testRateLimit(exclude, publicationVote)).to.equal(false)
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)
    addToRateLimiter(subplebbitChallenges, publicationVote, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(false)
    expect(testRateLimit(exclude, publicationVote)).to.equal(false)
  })

  it("1 post and reply type false", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: false, reply: false}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)
    addToRateLimiter(subplebbitChallenges, publicationVote, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(false)
  })

  it("1 any publication type rateLimitChallengeSuccess true", async () => {
    const author1 = {address: getRandomAddress()}
    const author2 = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, rateLimitChallengeSuccess: true}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const publication2 = {author: author2}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    expect(testRateLimit(exclude, publication1)).to.equal(false)
    expect(testRateLimit(exclude, publication2)).to.equal(true)
  })

  it("1 any publication type rateLimitChallengeSuccess true challengeSuccess false", async () => {
    const author1 = {address: getRandomAddress()}
    const author2 = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, rateLimitChallengeSuccess: true}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const publication2 = {author: author2}
    const challengeSuccess = false
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    // true because if rateLimitChallengeSuccess true, dont count challengeSuccess false
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    expect(testRateLimit(exclude, publication2)).to.equal(true)
  })

  it("1 any publication type rateLimitChallengeSuccess false challengeSuccess true", async () => {
    const author1 = {address: getRandomAddress()}
    const author2 = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, rateLimitChallengeSuccess: false}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const publication2 = {author: author2}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    // true because if rateLimitChallengeSuccess false, dont count challengeSuccess true
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    expect(testRateLimit(exclude, publication2)).to.equal(true)
  })

  it("1 any publication type rateLimitChallengeSuccess false challengeSuccess false", async () => {
    const author1 = {address: getRandomAddress()}
    const author2 = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, rateLimitChallengeSuccess: false}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const publication2 = {author: author2}
    const challengeSuccess = false
    expect(testRateLimit(exclude, publication1)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    // false because if rateLimitChallengeSuccess false, count challengeSuccess false
    expect(testRateLimit(exclude, publication1)).to.equal(false)
    expect(testRateLimit(exclude, publication2)).to.equal(true)
  })

  it("1 post type true rateLimitChallengeSuccess true", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: true, rateLimitChallengeSuccess: true}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationVote, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
  })

  it("1 post type true rateLimitChallengeSuccess true challengeSuccess false", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: true, rateLimitChallengeSuccess: true}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = false
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationVote, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
  })

  it("1 post type true rateLimitChallengeSuccess false challengeSuccess true", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: true, rateLimitChallengeSuccess: false}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationVote, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
  })

  it("1 post type true rateLimitChallengeSuccess false challengeSuccess false", async () => {
    const author = {address: getRandomAddress()}
    const exclude = {rateLimit: 1, post: true, rateLimitChallengeSuccess: false}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = false
    expect(testRateLimit(exclude, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
    addToRateLimiter(subplebbitChallenges, publicationVote, challengeSuccess)
    expect(testRateLimit(exclude, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude, publicationReply)).to.equal(true)
    expect(testRateLimit(exclude, publicationVote)).to.equal(true)
  })

  it("multiple exclude", async () => {
    const author = {address: getRandomAddress()}
    const excludePost = {rateLimit: 1, post: true}
    const excludeReply = {rateLimit: 1, reply: true}
    const excludeVote = {rateLimit: 1, vote: true}
    const subplebbitChallenges = [{exclude: [excludePost]}, {exclude: [excludeReply]}, {exclude: [excludeVote]}]

    const publicationPost = {author}
    const publicationReply = {author, parentCid: 'Qm...'}
    const publicationVote = {author, commentCid: 'Qm...', vote: 0}
    const challengeSuccess = true

    expect(testRateLimit(excludePost, publicationPost)).to.equal(true)
    expect(testRateLimit(excludeReply, publicationPost)).to.equal(true)
    expect(testRateLimit(excludeVote, publicationPost)).to.equal(true)
    expect(testRateLimit(excludePost, publicationReply)).to.equal(true)
    expect(testRateLimit(excludeReply, publicationReply)).to.equal(true)
    expect(testRateLimit(excludeVote, publicationReply)).to.equal(true)

    // publish one post
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)

    // test post publication against all exclude, only post exclude fails
    expect(testRateLimit(excludePost, publicationPost)).to.equal(false)
    expect(testRateLimit(excludeReply, publicationPost)).to.equal(true)
    expect(testRateLimit(excludeVote, publicationPost)).to.equal(true)

    // test reply publication against all exclude, none fail because no reply published yet
    expect(testRateLimit(excludePost, publicationReply)).to.equal(true)
    expect(testRateLimit(excludeReply, publicationReply)).to.equal(true)
    expect(testRateLimit(excludeVote, publicationReply)).to.equal(true)

    // publish one reply
    addToRateLimiter(subplebbitChallenges, publicationReply, challengeSuccess)

    // test post publication against all exclude, only post exclude fails
    expect(testRateLimit(excludePost, publicationPost)).to.equal(false)
    expect(testRateLimit(excludeReply, publicationPost)).to.equal(true)
    expect(testRateLimit(excludeVote, publicationPost)).to.equal(true)

    // test reply publication against all exclude, only reply exclude fails
    expect(testRateLimit(excludePost, publicationReply)).to.equal(true)
    expect(testRateLimit(excludeReply, publicationReply)).to.equal(false)
    expect(testRateLimit(excludeVote, publicationReply)).to.equal(true)
  })

  it("same exclude rateLimit multiple times", async () => {
    const author = {address: getRandomAddress()}
    const exclude1 = {rateLimit: 1}
    const exclude1Copy = {rateLimit: 1}
    const exclude2 = {rateLimit: 2}
    const excludePost1 = {rateLimit: 1, post: true}
    const excludePost2 = {rateLimit: 2, post: true}
    const subplebbitChallenges = [
      {exclude: [exclude1]}, 
      {exclude: [exclude1Copy]}, 
      {exclude: [exclude2]},
      {exclude: [excludePost1]},
      {exclude: [excludePost2]}
    ]
    const publicationPost = {author}
    const challengeSuccess = true

    expect(testRateLimit(exclude1, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude2, publicationPost)).to.equal(true)
    expect(testRateLimit(excludePost1, publicationPost)).to.equal(true)
    expect(testRateLimit(excludePost2, publicationPost)).to.equal(true)

    // publish 1 post
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)

    expect(testRateLimit(exclude1, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude2, publicationPost)).to.equal(true)
    expect(testRateLimit(excludePost1, publicationPost)).to.equal(false)
    expect(testRateLimit(excludePost2, publicationPost)).to.equal(true)

    // // publish 2 post
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)

    expect(testRateLimit(exclude1, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude2, publicationPost)).to.equal(false)
    expect(testRateLimit(excludePost1, publicationPost)).to.equal(false)
    expect(testRateLimit(excludePost2, publicationPost)).to.equal(false)
  })

  it("same exclude rateLimit multiple times different rateLimitChallengeSuccess", async () => {
    const author = {address: getRandomAddress()}
    const exclude1 = {rateLimit: 1}
    const exclude2 = {rateLimit: 1, rateLimitChallengeSuccess: false}
    const subplebbitChallenges = [
      {exclude: [exclude1]}, 
      {exclude: [exclude2]}
    ]
    const publicationPost = {author}
    let challengeSuccess = true

    expect(testRateLimit(exclude1, publicationPost)).to.equal(true)
    expect(testRateLimit(exclude2, publicationPost)).to.equal(true)

    // publish 1 post
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)

    expect(testRateLimit(exclude1, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude2, publicationPost)).to.equal(true)

    // publish 2 post
    challengeSuccess = false
    addToRateLimiter(subplebbitChallenges, publicationPost, challengeSuccess)

    expect(testRateLimit(exclude1, publicationPost)).to.equal(false)
    expect(testRateLimit(exclude2, publicationPost)).to.equal(false)
  })

  it("0 any publication type", async () => {
    const author1 = {address: getRandomAddress()}
    const exclude = {rateLimit: 0}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publication1)).to.equal(false)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    expect(testRateLimit(exclude, publication1)).to.equal(false)
  })

  it("0 any publication type rateLimitChallengeSuccess true", async () => {
    const author1 = {address: getRandomAddress()}
    const exclude = {rateLimit: 0, rateLimitChallengeSuccess: true}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publication1)).to.equal(false)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    expect(testRateLimit(exclude, publication1)).to.equal(false)
  })

  it("0 any publication type rateLimitChallengeSuccess false", async () => {
    const author1 = {address: getRandomAddress()}
    const exclude = {rateLimit: 0, rateLimitChallengeSuccess: false}
    const subplebbitChallenges = [{exclude: [exclude]}]
    const publication1 = {author: author1}
    const challengeSuccess = true
    expect(testRateLimit(exclude, publication1)).to.equal(false)
    addToRateLimiter(subplebbitChallenges, publication1, challengeSuccess)
    expect(testRateLimit(exclude, publication1)).to.equal(false)
  })
})
