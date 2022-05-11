function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

import { PUBSUB_MESSAGE_TYPES } from "./Challenge.js";
import Post from "./Post.js";
import Author from "./Author.js";
import { Comment } from "./Comment.js";
import { removeKeysWithUndefinedValues, replaceXWithY, TIMEFRAMES_TO_SECONDS, timestamp } from "./Util.js";
import Vote from "./Vote.js";
import knex from "../browser/noop.js";
import Debug from "debug";
const debug = Debug("plebbit-js:DbHandler");
export const SIGNER_USAGES = {
  SUBPLEBBIT: "subplebbit",
  COMMENT: "comment"
};
const TABLES = Object.freeze({
  COMMENTS: "comments",
  VOTES: "votes",
  AUTHORS: "authors",
  CHALLENGES: "challenges",
  SIGNERS: "signers" // To store private keys of subplebbit and comments' IPNS

});

var _baseTransaction = /*#__PURE__*/new WeakSet();

var _createCommentsTable = /*#__PURE__*/new WeakSet();

var _createVotesTable = /*#__PURE__*/new WeakSet();

var _createAuthorsTable = /*#__PURE__*/new WeakSet();

var _createChallengesTable = /*#__PURE__*/new WeakSet();

var _createSignersTable = /*#__PURE__*/new WeakSet();

var _addAuthorToDbIfNeeded = /*#__PURE__*/new WeakSet();

var _baseCommentQuery = /*#__PURE__*/new WeakSet();

var _createCommentsFromRows = /*#__PURE__*/new WeakSet();

var _createVotesFromRows = /*#__PURE__*/new WeakSet();

var _querySubplebbitActiveUserCount = /*#__PURE__*/new WeakSet();

var _querySubplebbitPostCount = /*#__PURE__*/new WeakSet();

class DbHandler {
  constructor(dbConfig, subplebbit) {
    _classPrivateMethodInitSpec(this, _querySubplebbitPostCount);

    _classPrivateMethodInitSpec(this, _querySubplebbitActiveUserCount);

    _classPrivateMethodInitSpec(this, _createVotesFromRows);

    _classPrivateMethodInitSpec(this, _createCommentsFromRows);

    _classPrivateMethodInitSpec(this, _baseCommentQuery);

    _classPrivateMethodInitSpec(this, _addAuthorToDbIfNeeded);

    _classPrivateMethodInitSpec(this, _createSignersTable);

    _classPrivateMethodInitSpec(this, _createChallengesTable);

    _classPrivateMethodInitSpec(this, _createAuthorsTable);

    _classPrivateMethodInitSpec(this, _createVotesTable);

    _classPrivateMethodInitSpec(this, _createCommentsTable);

    _classPrivateMethodInitSpec(this, _baseTransaction);

    this._dbConfig = dbConfig;
    this.knex = knex(dbConfig);
    this.subplebbit = subplebbit;
  }

  async createTransaction() {
    return new Promise(async (resolve, reject) => {
      this.knex.transaction().then(resolve).catch(err => {
        debug(err);
        reject(err);
      });
    });
  }

  async createTablesIfNeeded() {
    const functions = [_classPrivateMethodGet(this, _createCommentsTable, _createCommentsTable2), _classPrivateMethodGet(this, _createVotesTable, _createVotesTable2), _classPrivateMethodGet(this, _createAuthorsTable, _createAuthorsTable2), _classPrivateMethodGet(this, _createChallengesTable, _createChallengesTable2), _classPrivateMethodGet(this, _createSignersTable, _createSignersTable2)];
    const tables = Object.values(TABLES);

    for (const table of tables) {
      const i = tables.indexOf(table);
      const tableExists = await this.knex.schema.hasTable(table);
      if (!tableExists) await functions[i].bind(this)();
    }
  }

  async upsertVote(vote, challengeRequestId, trx = undefined) {
    return new Promise(async (resolve, reject) => {
      await _classPrivateMethodGet(this, _addAuthorToDbIfNeeded, _addAuthorToDbIfNeeded2).call(this, vote.author, trx);
      const dbObject = vote.toJSONForDb(challengeRequestId);

      _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.VOTES).insert(dbObject).onConflict(['commentCid', "authorAddress"]).merge().then(() => resolve(dbObject)).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  async upsertComment(postOrComment, challengeRequestId, trx = undefined) {
    return new Promise(async (resolve, reject) => {
      if (postOrComment.author) // Skip adding author (For CommentEdit)
        await _classPrivateMethodGet(this, _addAuthorToDbIfNeeded, _addAuthorToDbIfNeeded2).call(this, postOrComment.author, trx);
      if (!challengeRequestId) challengeRequestId = (await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.COMMENTS).where({
        "cid": postOrComment.cid || postOrComment.commentCid
      }).first()).challengeRequestId;
      const originalComment = await this.queryComment(postOrComment.cid || postOrComment.commentCid, trx);
      const dbObject = originalComment ? { ...removeKeysWithUndefinedValues(originalComment.toJSONForDb(challengeRequestId)),
        ...removeKeysWithUndefinedValues(postOrComment.toJSONForDb(challengeRequestId))
      } : postOrComment.toJSONForDb(challengeRequestId);

      _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.COMMENTS).insert(dbObject).onConflict(['cid']).merge().then(() => resolve(dbObject)).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  async upsertChallenge(challenge, trx = undefined) {
    return new Promise(async (resolve, reject) => {
      const existingChallenge = await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.CHALLENGES).where({
        "challengeRequestId": challenge.challengeRequestId
      }).first();
      const dbObject = { ...existingChallenge,
        ...challenge.toJSONForDb()
      };

      _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.CHALLENGES).insert(dbObject).onConflict('challengeRequestId').merge().then(() => resolve(dbObject)).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  async getLastVoteOfAuthor(commentCid, authorAddress, trx = undefined) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.VOTES).where({
        "commentCid": commentCid,
        "authorAddress": authorAddress
      }).first().then(async res => resolve((await _classPrivateMethodGet(this, _createVotesFromRows, _createVotesFromRows2).bind(this)(res, trx))[0])).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  async queryCommentsSortedByTimestamp(parentCid, order = "desc", trx = undefined) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseCommentQuery, _baseCommentQuery2).call(this, trx).where({
        "parentCid": parentCid
      }).orderBy("timestamp", order).then(async res => {
        resolve(await _classPrivateMethodGet(this, _createCommentsFromRows, _createCommentsFromRows2).bind(this)(res, trx));
      }).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  async queryCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
    return new Promise(async (resolve, reject) => {
      if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;

      _classPrivateMethodGet(this, _baseCommentQuery, _baseCommentQuery2).call(this, trx).where({
        "parentCid": parentCid
      }).whereBetween("timestamp", [timestamp1, timestamp2]).then(res => _classPrivateMethodGet(this, _createCommentsFromRows, _createCommentsFromRows2).bind(this)(res, trx)).then(resolve).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  async queryTopCommentsBetweenTimestampRange(parentCid, timestamp1, timestamp2, trx = undefined) {
    return new Promise(async (resolve, reject) => {
      if (timestamp1 === Number.NEGATIVE_INFINITY) timestamp1 = 0;

      const topScoreQuery = _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.VOTES).select(this.knex.raw(`COALESCE(SUM(${TABLES.VOTES}.vote), 0)`)) // We're using raw expressions because there's no native method in Knexjs to return 0 if SUM is null
      .where({
        [`${TABLES.COMMENTS}.cid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`)
      }).as("topScore");

      const query = _classPrivateMethodGet(this, _baseCommentQuery, _baseCommentQuery2).call(this, trx).select(topScoreQuery).groupBy(`${TABLES.COMMENTS}.cid`).orderBy("topScore", "desc").whereBetween(`${TABLES.COMMENTS}.timestamp`, [timestamp1, timestamp2]).where({
        [`${TABLES.COMMENTS}.parentCid`]: parentCid
      });

      query.then(res => resolve(_classPrivateMethodGet(this, _createCommentsFromRows, _createCommentsFromRows2).bind(this)(res, trx))).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  async queryCommentsUnderComment(parentCid, trx) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseCommentQuery, _baseCommentQuery2).call(this, trx).where({
        "parentCid": parentCid
      }).orderBy("timestamp", "desc").then(res => resolve(_classPrivateMethodGet(this, _createCommentsFromRows, _createCommentsFromRows2).bind(this)(res, trx))).catch(reject);
    });
  }

  async queryComments(trx) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseCommentQuery, _baseCommentQuery2).call(this, trx).orderBy("id", "desc").then(res => resolve(_classPrivateMethodGet(this, _createCommentsFromRows, _createCommentsFromRows2).bind(this)(res, trx))).catch(reject);
    });
  }

  async querySubplebbitMetrics(trx) {
    return new Promise(async (resolve, reject) => {
      const metrics = {};

      for (const metricType of ["ActiveUserCount", "PostCount"]) for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
        const propertyName = `${timeframe.toLowerCase()}${metricType}`;
        if (metricType === "ActiveUserCount") metrics[[propertyName]] = await _classPrivateMethodGet(this, _querySubplebbitActiveUserCount, _querySubplebbitActiveUserCount2).call(this, timeframe, trx);else if (metricType === "PostCount") metrics[[propertyName]] = await _classPrivateMethodGet(this, _querySubplebbitPostCount, _querySubplebbitPostCount2).call(this, timeframe, trx);
      }

      resolve(metrics);
    });
  }

  async queryComment(cid, trx) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseCommentQuery, _baseCommentQuery2).call(this, trx).where({
        "cid": cid
      }).first().then(async res => {
        resolve((await _classPrivateMethodGet(this, _createCommentsFromRows, _createCommentsFromRows2).bind(this)(res, trx))[0]);
      }).catch(reject);
    });
  }

  async queryLatestPost(trx) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseCommentQuery, _baseCommentQuery2).call(this, trx).whereNotNull("title").orderBy("id", "desc").first().then(async res => {
        resolve((await _classPrivateMethodGet(this, _createCommentsFromRows, _createCommentsFromRows2).bind(this)(res, trx))[0]);
      }).catch(reject);
    });
  }

  async insertSigner(signer, trx) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.SIGNERS).insert(signer).then(resolve).catch(err => {
        debug(err);
        reject(err);
      });
    });
  }

  async querySubplebbitSigner(trx) {
    return new Promise(async (resolve, reject) => {
      _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.SIGNERS).where({
        "usage": SIGNER_USAGES.SUBPLEBBIT
      }).first().then(resolve).catch(reject);
    });
  }

  async querySigner(ipnsKeyName, trx) {
    try {
      return await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.SIGNERS).where({
        "ipnsKeyName": ipnsKeyName
      }).first();
    } catch (e) {
      debug(`Failed to query signer due to error = ${e}`);
    }
  }

}

function _baseTransaction2(trx) {
  return trx ? trx : this.knex;
}

async function _createCommentsTable2() {
  await this.knex.schema.createTable(TABLES.COMMENTS, table => {
    table.text("cid").notNullable().primary().unique();
    table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
    table.text("parentCid").nullable().references("cid").inTable(TABLES.COMMENTS);
    table.text("postCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
    table.text("previousCid").nullable().references("cid").inTable(TABLES.COMMENTS);
    table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);
    table.text("subplebbitAddress").notNullable();
    table.text("content").nullable();
    table.text("originalContent").nullable();
    table.timestamp("timestamp").notNullable().checkPositive();
    table.text("signature").notNullable().unique(); // Will contain {signature, public key, type}

    table.text("ipnsName").notNullable().unique();
    table.text("ipnsKeyName").notNullable().unique().references("ipnsKeyName").inTable(TABLES.SIGNERS);
    table.text("title").nullable();
    table.integer("depth").notNullable();
    table.increments("id"); // CommentUpdate and CommentEdit props

    table.timestamp("updatedAt").nullable().checkPositive();
    table.text("editSignature").nullable();
    table.timestamp("editTimestamp").nullable().checkPositive();
    table.text("editReason").nullable();
    table.boolean("deleted").nullable();
    table.boolean("spoiler").nullable();
    table.boolean("pinned").nullable();
    table.boolean("locked").nullable();
    table.boolean("removed").nullable();
    table.text("moderatorReason").nullable();
  });
}

async function _createVotesTable2() {
  await this.knex.schema.createTable(TABLES.VOTES, table => {
    table.text("commentCid").notNullable().references("cid").inTable(TABLES.COMMENTS);
    table.text("authorAddress").notNullable().references("address").inTable(TABLES.AUTHORS);
    table.uuid("challengeRequestId").notNullable().references("challengeRequestId").inTable(TABLES.CHALLENGES);
    table.timestamp("timestamp").checkPositive().notNullable();
    table.text("subplebbitAddress").notNullable();
    table.integer("vote").checkBetween([-1, 1]).notNullable();
    table.text("signature").notNullable().unique();
    table.primary(["commentCid", "authorAddress"]); // An author can't have multiple votes on a comment
  });
}

async function _createAuthorsTable2() {
  await this.knex.schema.createTable(TABLES.AUTHORS, table => {
    table.text("address").notNullable().primary().unique();
    table.text("displayName").notNullable();
  });
}

async function _createChallengesTable2() {
  await this.knex.schema.createTable(TABLES.CHALLENGES, table => {
    table.uuid("challengeRequestId").notNullable().primary().unique();
    table.enum("type", Object.values(PUBSUB_MESSAGE_TYPES)).notNullable();
    table.json("acceptedChallengeTypes").nullable().defaultTo(null);
    table.json("challenges").nullable();
    table.uuid("challengeAnswerId").nullable();
    table.json("challengeAnswers").nullable();
    table.boolean("challengePassed").nullable();
    table.json("challengeErrors").nullable();
    table.text("reason").nullable();
  });
}

async function _createSignersTable2() {
  await this.knex.schema.createTable(TABLES.SIGNERS, table => {
    table.text("ipnsKeyName").notNullable().unique().primary();
    table.text("privateKey").notNullable().unique();
    table.text("publicKey").notNullable().unique();
    table.text("address").nullable();
    table.text("type").notNullable(); // RSA or any other type

    table.enum("usage", Object.values(SIGNER_USAGES)).notNullable();
    table.binary("ipfsKey").notNullable().unique();
  });
}

async function _addAuthorToDbIfNeeded2(author, trx = undefined) {
  return new Promise(async (resolve, reject) => {
    const authorFromDb = await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.AUTHORS).where({
      "address": author.address
    }).first();
    if (!authorFromDb) // Author is new. Add to database
      _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.AUTHORS).insert(author.toJSON()).then(() => resolve(author.toJSON())).catch(err => {
        console.error(err);
        reject(err);
      });else resolve(authorFromDb);
  });
}

function _baseCommentQuery2(trx) {
  const upvoteQuery = _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.VOTES).count(`${TABLES.VOTES}.vote`).where({
    [`${TABLES.COMMENTS}.cid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`),
    [`${TABLES.VOTES}.vote`]: 1
  }).as("upvoteCount");

  const downvoteQuery = _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.VOTES).count(`${TABLES.VOTES}.vote`).where({
    [`${TABLES.COMMENTS}.cid`]: this.knex.raw(`${TABLES.VOTES}.commentCid`),
    [`${TABLES.VOTES}.vote`]: -1
  }).as("downvoteCount");

  const replyCountQuery = _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx).from(`${TABLES.COMMENTS} AS comments2`).count("").where({
    "comments2.parentCid": this.knex.raw(`${TABLES.COMMENTS}.cid`)
  }).as("replyCount");

  return _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.COMMENTS).select(`${TABLES.COMMENTS}.*`, upvoteQuery, downvoteQuery, replyCountQuery);
}

async function _createCommentsFromRows2(commentsRows, trx) {
  return new Promise(async (resolve, reject) => {
    if (!commentsRows) resolve([undefined]);else {
      if (!Array.isArray(commentsRows)) commentsRows = [commentsRows];
      commentsRows = commentsRows.map(props => replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)

      const authors = (await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.AUTHORS).whereIn("address", commentsRows.map(post => post.authorAddress))).map(authorProps => new Author(authorProps));
      const comments = commentsRows.map(commentProps => {
        const props = { ...commentProps,
          "author": authors.filter(author => author.address === commentProps.authorAddress)[0]
        };
        if (props["title"]) return new Post(props, this.subplebbit);else return new Comment(props, this.subplebbit);
      });
      resolve(comments);
    }
  });
}

async function _createVotesFromRows2(voteRows, trx) {
  return new Promise(async (resolve, reject) => {
    if (!voteRows) resolve([undefined]);else {
      if (!Array.isArray(voteRows)) voteRows = [voteRows];
      voteRows = voteRows.map(props => replaceXWithY(props, null, undefined)); // Replace null with undefined to save storage (undefined is not included in JSON.stringify)

      const authors = (await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.AUTHORS).whereIn("address", voteRows.map(vote => vote.authorAddress))).map(authorProps => new Author(authorProps));
      const votes = voteRows.map(voteProps => {
        const props = { ...voteProps,
          "author": authors.filter(author => author.address === voteProps.authorAddress)[0]
        };
        return new Vote(props, this.subplebbit);
      });
      resolve(votes);
    }
  });
}

async function _querySubplebbitActiveUserCount2(timeframe, trx) {
  return new Promise(async (resolve, reject) => {
    let from = timestamp() - TIMEFRAMES_TO_SECONDS[timeframe];
    if (from === Number.NEGATIVE_INFINITY) from = 0;
    const to = timestamp(); // TODO this could be done in a single query

    const commentsAuthors = await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.COMMENTS).distinct("authorAddress").whereBetween("timestamp", [from, to]);
    const voteAuthors = await _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.VOTES).distinct("authorAddress").whereBetween("timestamp", [from, to]);
    let activeUserAccounts = [...commentsAuthors, ...voteAuthors].map(author => author.authorAddress);
    activeUserAccounts = [...new Set(activeUserAccounts)];
    resolve(activeUserAccounts.length);
  });
}

async function _querySubplebbitPostCount2(timeframe, trx) {
  return new Promise(async (resolve, reject) => {
    let from = timestamp() - TIMEFRAMES_TO_SECONDS[timeframe];
    if (from === Number.NEGATIVE_INFINITY) from = 0;
    const to = timestamp();

    _classPrivateMethodGet(this, _baseTransaction, _baseTransaction2).call(this, trx)(TABLES.COMMENTS).count("cid").whereBetween("timestamp", [from, to]).whereNotNull("title").then(postCount => resolve(postCount["0"]["count(`cid`)"])).catch(reject);
  });
}

export default DbHandler;