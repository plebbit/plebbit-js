import { EventEmitter } from "events";
import { plebbitJsChallenges } from "../../../dist/node/runtime/node/subplebbit/challenges/index.js";

// define mock Author instances
const highKarmaAuthor = {
    address: "high-karma.eth",
    wallets: { eth: { address: "0x...", signature: "0x..." } }
};
const lowKarmaAuthor = { address: "low-karma.eth" };
const authors = [highKarmaAuthor, lowKarmaAuthor];

// mock comment instance
function Comment(cid) {
    const split = cid.replace("Qm...", "").split(",");
    const subplebbitAddress = split[0];
    const karma = split[1];
    const age = split[2];
    this.subplebbitAddress = subplebbitAddress;
    this.updatedAt = undefined;

    // define author
    this.author = { address: "Qm..." };
    if (karma === "high") {
        this.author.address = highKarmaAuthor.address;
    } else if (karma === "low") {
        this.author.address = lowKarmaAuthor.address;
    }

    // use this value to mock giving 'high' or 'low' karma to the author
    this.karma = karma;
    this.age = age;
}
Object.setPrototypeOf(Comment.prototype, EventEmitter.prototype);

Comment.prototype.update = function () {
    setTimeout(() => {
        this.updatedAt = 123456;
        if (this.karma === "high") {
            this.author.subplebbit = {
                postScore: 1000,
                replyScore: 1000
            };
        } else if (this.karma === "low") {
            this.author.subplebbit = {
                postScore: 1,
                replyScore: 1
            };
        }
        if (this.age === "old") {
            this.author.subplebbit.firstCommentTimestamp = Math.round(Date.now() / 1000) - 60 * 60 * 24 * 999; // 999 days ago
        } else if (this.age === "new") {
            this.author.subplebbit.firstCommentTimestamp = Math.round(Date.now() / 1000) - 60 * 60 * 24 * 1; // 1 day ago
        }
        this.emit("update", this);
    }, 5).unref?.();
};

Comment.prototype.stop = function () {
    this.removeAllListeners();
};

// mock plebbit sync
const createPlebbit = () => {
    return {
        getComment: (cid) => new Comment(cid),
        createComment: (cid) => new Comment(cid)
    };
};
// mock Plebbit async
const Plebbit = () => createPlebbit();

// define mock challenges included with plebbit-js
Plebbit.challenges = plebbitJsChallenges;

// define mock Subplebbit instances
const textMathChallegeSubplebbit = {
    title: "text-math challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "text-math",
                options: { difficulty: "3" },
                description: "Complete a math challenge."
            }
        ]
    }
};
// comment out because don't know how to make the captcha node code work in the browser
// const captchaAndMathChallegeSubplebbit = {
//   title: 'captcha and math challenge subplebbit',
//   settings: {
//     challenges: [
//       {
//         name: 'captcha-canvas-v3',
//         options: {
//           width: '600',
//           height: '400',
//           characters: '10',
//           color: '#000000'
//         },
//         description: 'Complete a captcha challenge.'
//       },
//       {
//         name: 'text-math',
//         options: {difficulty: '2'},
//         description: 'Complete a math challenge.'
//       }
//     ]
//   }
// }
const excludeHighKarmaChallegeSubplebbit = {
    title: "exclude high karma challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "text-math",
                options: { difficulty: "3" },
                // exclude if the author match any one item in the array
                exclude: [
                    { postScore: 100, replyScore: 100 }, // exclude author that has more than 100 post score AND 100 reply score
                    // exclude author with account age older than 100 days (Math.round(Date.now() / 1000)- 60*60*24*100)
                    { firstCommentTimestamp: 60 * 60 * 24 * 100 }
                ]
            }
        ]
    }
};
const excludeAccountAgeChallegeSubplebbit = {
    title: "exclude account age challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "fail",
                // exclude if the author match any one item in the array
                exclude: [
                    // exclude author with account age older than 100 days (Math.round(Date.now() / 1000)- 60*60*24*100)
                    { firstCommentTimestamp: 60 * 60 * 24 * 100 }
                ]
            }
        ]
    }
};
const whitelistChallegeSubplebbit = {
    title: "whitelist challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "whitelist",
                options: {
                    whitelist: "high-karma.eth"
                }
            }
        ]
    }
};
const blacklistChallegeSubplebbit = {
    title: "blacklist challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "blacklist",
                options: {
                    blacklist: "low-karma.eth,some-author.eth"
                }
            }
        ]
    }
};
// comment out because don't know how to require external challenge in the browser tests
// const erc20PaymentChallegeSubplebbit = {
//   title: 'erc20 payment challenge subplebbit',
//   settings: {
//     challenges: [
//       {
//         path: path.join(__dirname, 'challenges', 'erc20-payment'),
//         options: {
//           chainTicker: 'eth',
//           contractAddress: '0x...',
//           recipientAddress: '0x...',
//           symbol: 'PLEB',
//           decimals: '18',
//           postPrice: '1000',
//           replyPrice: '100',
//           votePrice: '10'
//         },
//       },
//     ]
//   }
// }
const evmContractCallChallegeSubplebbit = {
    title: "evm contract call challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "evm-contract-call",
                options: {
                    chainTicker: "eth",
                    // contract address
                    address: "0x...",
                    // abi of the contract method
                    abi: '{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}',
                    condition: ">1000",
                    // error to display to the user if condition fails
                    error: "PLEB token balance must be greater than 1000."
                }
            }
        ]
    }
};
const passwordChallegeSubplebbit = {
    title: "password challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "question",
                options: {
                    question: "What is the password?",
                    answer: "password"
                }
            }
        ]
    }
};
const excludeFriendlySubKarmaChallegeSubplebbit = {
    title: "exclude friendly sub karma challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "fail",
                exclude: [
                    // exclude author with karma in those subs using publication.challengeCommentCids
                    {
                        subplebbit: {
                            addresses: ["friendly-sub.eth", "friendly-sub2.eth"],
                            postScore: 100,
                            replyScore: 100,
                            maxCommentCids: 3
                        }
                    }
                ]
            }
        ]
    }
};
const twoOutOf4SuccessChallegeSubplebbit = {
    title: "2 out of 4 success challenge subplebbit",
    settings: {
        // challenge 0, 1 fail, but excluded if 2, 3 succeed, which makes challengeVerification.challengeSuccess = true
        challenges: [
            {
                name: "fail",
                exclude: [{ challenges: [2, 3] }]
            },
            {
                name: "fail",
                exclude: [{ challenges: [2, 3] }]
            },
            {
                name: "blacklist",
                options: { blacklist: "low-karma.eth,some-author.eth" }
            },
            {
                name: "blacklist",
                options: { blacklist: "low-karma.eth,some-author.eth" }
            }
        ]
    }
};
const twoOutOf4SuccessInverseChallegeSubplebbit = {
    title: "2 out of 4 success inverse challenge subplebbit",
    settings: {
        // challenge 0, 1 fail, but excluded if 2, 3 succeed, which makes challengeVerification.challengeSuccess = true
        challenges: [
            {
                name: "blacklist",
                options: { blacklist: "low-karma.eth,some-author.eth" }
            },
            {
                name: "blacklist",
                options: { blacklist: "low-karma.eth,some-author.eth" }
            },
            {
                name: "fail",
                exclude: [{ challenges: [0, 1] }]
            },
            {
                name: "fail",
                exclude: [{ challenges: [0, 1] }]
            }
        ]
    }
};
const rateLimitChallegeSubplebbit = {
    title: "rate limit challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "fail",
                options: {
                    error: `You're doing this too much, rate limit: 0 post/h, 10 replies/h, 100 votes/h.`
                },
                exclude: [
                    // different rate limit per publication type
                    { publicationType: { post: true }, rateLimit: 0 }, // 0 per hour
                    { publicationType: { reply: true }, rateLimit: 10 }, // 10 per hour
                    { publicationType: { vote: true }, rateLimit: 100 } // 100 per hour
                ]
            }
        ]
    }
};
const rateLimitChallengeSuccessChallegeSubplebbit = {
    title: "rate limit challenge success challenge subplebbit",
    settings: {
        challenges: [
            {
                name: "fail",
                options: {
                    error: `You're doing this too much.`
                },
                exclude: [
                    // only 1 successful publication per hour
                    { rateLimit: 1, rateLimitChallengeSuccess: true },
                    // only 100 failed challenge request per hour
                    { rateLimit: 100, rateLimitChallengeSuccess: false }
                ]
            }
        ]
    }
};
const excludeModsChallegeSubplebbit = {
    title: "exclude mods challenge subplebbit",
    roles: {
        "high-karma.eth": {
            role: "moderator"
        }
    },
    settings: {
        challenges: [
            {
                name: "fail",
                options: {
                    error: `You're not a mod.`
                },
                exclude: [{ role: ["moderator", "admin", "owner"] }]
            }
        ]
    }
};

// define mock author karma scores and account age
const subplebbitAuthors = {};
subplebbitAuthors[highKarmaAuthor.address] = {};
subplebbitAuthors[highKarmaAuthor.address][excludeHighKarmaChallegeSubplebbit.title] = {
    postScore: 1000,
    replyScore: 1000,
    firstCommentTimestamp: 1
};
subplebbitAuthors[highKarmaAuthor.address][excludeAccountAgeChallegeSubplebbit.title] = {
    postScore: 1,
    replyScore: 1,
    firstCommentTimestamp: 1
};
subplebbitAuthors[lowKarmaAuthor.address] = {};
subplebbitAuthors[lowKarmaAuthor.address][excludeHighKarmaChallegeSubplebbit.title] = { postScore: 1, replyScore: 1000 };
subplebbitAuthors[lowKarmaAuthor.address][excludeAccountAgeChallegeSubplebbit.title] = { postScore: 1000, replyScore: 1000 };

// define mock friendly sub comment cids
const challengeCommentCids = {};
challengeCommentCids[highKarmaAuthor.address] = ["Qm...friendly-sub.eth,high,old", "Qm...friendly-sub.eth,high,old"];

const challengeAnswers = {};
challengeAnswers[highKarmaAuthor.address] = {};
challengeAnswers[highKarmaAuthor.address][passwordChallegeSubplebbit.title] = ["password"];
challengeAnswers[lowKarmaAuthor.address] = {};
challengeAnswers[lowKarmaAuthor.address][passwordChallegeSubplebbit.title] = ["wrong"];

const subplebbits = [
    textMathChallegeSubplebbit,
    // captchaAndMathChallegeSubplebbit,
    excludeHighKarmaChallegeSubplebbit,
    excludeAccountAgeChallegeSubplebbit,
    whitelistChallegeSubplebbit,
    blacklistChallegeSubplebbit,
    // erc20PaymentChallegeSubplebbit,
    // evmContractCallChallegeSubplebbit,
    passwordChallegeSubplebbit,
    excludeFriendlySubKarmaChallegeSubplebbit,
    twoOutOf4SuccessChallegeSubplebbit,
    twoOutOf4SuccessInverseChallegeSubplebbit,
    rateLimitChallegeSubplebbit,
    rateLimitChallengeSuccessChallegeSubplebbit,
    excludeModsChallegeSubplebbit
];

const results = {};
results[textMathChallegeSubplebbit.title] = {
    "high-karma.eth": {
        pendingChallenges: [{ challenge: "660 - 256", type: "text/plain" }]
    },
    "low-karma.eth": {
        pendingChallenges: [{ challenge: "69 * 63", type: "text/plain" }]
    }
};
// comment out because don't know how to make the captcha node code work in the browser
// results[captchaAndMathChallegeSubplebbit.title] = {
//   'high-karma.eth': {
//     pendingChallenges: [
//       { challenge: '...', type: 'image' },
//       { challenge: '94 + 25', type: 'text/plain' }
//     ]
//   },
//   'low-karma.eth': {
//     pendingChallenges: [
//       { challenge: '...', type: 'image' },
//       { challenge: '99 - 90', type: 'text/plain' }
//     ]
//   }
// }
results[excludeHighKarmaChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        pendingChallenges: [{ challenge: "82 * 45", type: "text/plain" }]
    }
};
results[excludeAccountAgeChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "You're not allowed to publish." }
    }
};
results[whitelistChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "You're not whitelisted." }
    }
};
results[blacklistChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "You're blacklisted." }
    }
};
// comment out because don't know how to require external challenge in the browser tests
// results[erc20PaymentChallegeSubplebbit.title] = {
//   'high-karma.eth': { challengeSuccess: true },
//   'low-karma.eth': {
//     challengeSuccess: false,
//     challengeErrors: {"0": "Author doesn't have wallet (eth) set." }
//   }
// }
results[evmContractCallChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "Author doesn't have a wallet set." }
    }
};
results[passwordChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": { challengeSuccess: false, challengeErrors: { 0: "Wrong answer." } }
};
results[excludeFriendlySubKarmaChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "You're not allowed to publish." }
    }
};
results[twoOutOf4SuccessChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: {
            0: "You're not allowed to publish.",
            1: "You're not allowed to publish.",
            2: "You're blacklisted.",
            3: "You're blacklisted."
        }
    }
};
results[twoOutOf4SuccessInverseChallegeSubplebbit.title] = {
    "high-karma.eth": { challengeSuccess: true },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: {
            0: "You're blacklisted.",
            1: "You're blacklisted.",
            2: "You're not allowed to publish.",
            3: "You're not allowed to publish."
        }
    }
};
results[rateLimitChallegeSubplebbit.title] = {
    "high-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "You're doing this too much, rate limit: 0 post/h, 10 replies/h, 100 votes/h." }
    },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "You're doing this too much, rate limit: 0 post/h, 10 replies/h, 100 votes/h." }
    }
};
results[rateLimitChallengeSuccessChallegeSubplebbit.title] = {
    "high-karma.eth": {
        challengeSuccess: true
    },
    "low-karma.eth": {
        challengeSuccess: true
    }
};
results[excludeModsChallegeSubplebbit.title] = {
    "high-karma.eth": {
        challengeSuccess: true
    },
    "low-karma.eth": {
        challengeSuccess: false,
        challengeErrors: { 0: "You're not a mod." }
    }
};

// add mock plebbit to add the mock subplebbit instances
for (const subplebbit of subplebbits) {
    subplebbit._plebbit = createPlebbit();
}

export { Plebbit, subplebbits, authors, subplebbitAuthors, challengeCommentCids, challengeAnswers, results };
