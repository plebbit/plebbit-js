function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

import { chunks, controversialScore, hotScore, keepKeys, removeKeysWithUndefinedValues, TIMEFRAMES_TO_SECONDS, timestamp } from "./Util.js";
import Debug from "debug";
import { Page } from "./Pages.js";
const debug = Debug("plebbit-js:SortHandler");
export const POSTS_SORT_TYPES = Object.freeze({
  HOT: {
    type: "hot",
    "score": hotScore
  },
  NEW: {
    type: "new"
  },
  TOP_HOUR: {
    type: "topHour"
  },
  TOP_DAY: {
    type: "topDay"
  },
  TOP_WEEK: {
    type: "topWeek"
  },
  TOP_MONTH: {
    type: "topMonth"
  },
  TOP_YEAR: {
    type: "topYear"
  },
  TOP_ALL: {
    type: "topAll"
  },
  CONTROVERSIAL_HOUR: {
    type: "controversialHour",
    "score": controversialScore
  },
  CONTROVERSIAL_DAY: {
    type: "controversialDay",
    "score": controversialScore
  },
  CONTROVERSIAL_WEEK: {
    type: "controversialWeek",
    "score": controversialScore
  },
  CONTROVERSIAL_MONTH: {
    type: "controversialMonth",
    "score": controversialScore
  },
  CONTROVERSIAL_YEAR: {
    type: "controversialYear",
    "score": controversialScore
  },
  CONTROVERSIAL_ALL: {
    type: "controversialAll",
    "score": controversialScore
  }
});
export const REPLIES_SORT_TYPES = { ...keepKeys(POSTS_SORT_TYPES, ["TOP_ALL", "NEW", "CONTROVERSIAL_ALL"]),
  "OLD": {
    type: "old"
  }
};
export const SORTED_POSTS_PAGE_SIZE = 50;

var _chunksToListOfPage = /*#__PURE__*/new WeakSet();

var _sortComments = /*#__PURE__*/new WeakSet();

var _sortCommentsByHot = /*#__PURE__*/new WeakSet();

var _sortCommentsByTop = /*#__PURE__*/new WeakSet();

var _sortCommentsByControversial = /*#__PURE__*/new WeakSet();

var _sortCommentsByNew = /*#__PURE__*/new WeakSet();

var _getSortPromises = /*#__PURE__*/new WeakSet();

export class SortHandler {
  constructor(subplebbit) {
    _classPrivateMethodInitSpec(this, _getSortPromises);

    _classPrivateMethodInitSpec(this, _sortCommentsByNew);

    _classPrivateMethodInitSpec(this, _sortCommentsByControversial);

    _classPrivateMethodInitSpec(this, _sortCommentsByTop);

    _classPrivateMethodInitSpec(this, _sortCommentsByHot);

    _classPrivateMethodInitSpec(this, _sortComments);

    _classPrivateMethodInitSpec(this, _chunksToListOfPage);

    this.subplebbit = subplebbit;
  }

  async generatePagesUnderComment(comment, trx) {
    // Create "pages" and "pageCids"
    const res = await Promise.all(_classPrivateMethodGet(this, _getSortPromises, _getSortPromises2).call(this, comment, trx));
    let [pages, pageCids] = [{}, {}];

    for (const [page, pageCid] of res) {
      pages = { ...pages,
        ...page
      };
      pageCids[Object.keys(page)[0]] = pageCid;
    }

    [pages, pageCids] = [removeKeysWithUndefinedValues(pages), removeKeysWithUndefinedValues(pageCids)];
    if (JSON.stringify(pages) === "{}") [pages, pageCids] = [undefined, undefined];
    return [pages, pageCids];
  }

}

async function _chunksToListOfPage2(chunks) {
  if (chunks.length === 0) return [[undefined], [undefined]];
  const listOfPage = new Array(chunks.length);
  const cids = new Array(chunks.length);
  const chunksWithReplies = await Promise.all(chunks.map(async chunk => {
    return await Promise.all(chunk.map(async comment => {
      const [sortedReplies, sortedRepliesCids] = await this.generatePagesUnderComment(comment);
      comment.setReplies(sortedReplies, sortedRepliesCids);
      return comment;
    }));
  }));

  for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
    const page = new Page({
      "nextCid": cids[i + 1],
      "comments": chunksWithReplies[i]
    });
    cids[i] = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))).path;
    listOfPage[i] = page;
  }

  return [listOfPage, cids];
}

async function _sortComments2(comments, sortType, limit = SORTED_POSTS_PAGE_SIZE) {
  let commentsSorted;
  if (!sortType.score) commentsSorted = comments; // If sort type has no score function, that means it already has been sorted by DB
  else commentsSorted = comments.map(comment => ({
    "comment": comment,
    "score": sortType.score(comment)
  })).sort((postA, postB) => {
    return postB.score - postA.score;
  }).map(comment => comment.comment);
  const commentsChunks = chunks(commentsSorted, limit);
  const [listOfPage, cids] = await _classPrivateMethodGet(this, _chunksToListOfPage, _chunksToListOfPage2).call(this, commentsChunks, sortType);
  return [{
    [sortType.type]: listOfPage[0]
  }, cids[0]];
}

async function _sortCommentsByHot2(parentCid, trx) {
  const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, trx);
  return await _classPrivateMethodGet(this, _sortComments, _sortComments2).call(this, comments, POSTS_SORT_TYPES.HOT);
}

async function _sortCommentsByTop2(parentCid, timeframe, trx) {
  // Timeframe is "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL"
  const sortType = POSTS_SORT_TYPES[`TOP_${timeframe}`];
  const comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp(), trx);
  return await _classPrivateMethodGet(this, _sortComments, _sortComments2).call(this, comments, sortType);
}

async function _sortCommentsByControversial2(parentCid, timeframe, trx) {
  const sortType = POSTS_SORT_TYPES[`CONTROVERSIAL_${timeframe}`];
  const comments = await this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp(), trx);
  return await _classPrivateMethodGet(this, _sortComments, _sortComments2).call(this, comments, sortType);
}

async function _sortCommentsByNew2(parentCid, trx) {
  const comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", trx);
  return await _classPrivateMethodGet(this, _sortComments, _sortComments2).call(this, comments, POSTS_SORT_TYPES.NEW);
}

function _getSortPromises2(comment, trx) {
  if (!comment) {
    // Sorting posts on a subplebbit level
    const sortPromises = [_classPrivateMethodGet(this, _sortCommentsByHot, _sortCommentsByHot2).bind(this)(null, trx), _classPrivateMethodGet(this, _sortCommentsByNew, _sortCommentsByNew2).bind(this)(null, trx)];

    for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
      sortPromises.push(_classPrivateMethodGet(this, _sortCommentsByTop, _sortCommentsByTop2).bind(this)(null, timeframe, trx));
      sortPromises.push(_classPrivateMethodGet(this, _sortCommentsByControversial, _sortCommentsByControversial2).bind(this)(null, timeframe, trx));
    }

    return sortPromises;
  } else {
    return Object.values(REPLIES_SORT_TYPES).map(async sortType => {
      let comments;
      if (sortType.type === REPLIES_SORT_TYPES.TOP_ALL.type) comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, timestamp(), trx);else if (sortType.type === REPLIES_SORT_TYPES.OLD.type) comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", trx);else comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, trx);
      return _classPrivateMethodGet(this, _sortComments, _sortComments2).call(this, comments, sortType);
    });
  }
}