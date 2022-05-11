"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SortHandler = exports.SORTED_POSTS_PAGE_SIZE = exports.REPLIES_SORT_TYPES = exports.POSTS_SORT_TYPES = void 0;

var _Util = require("./Util.js");

var _debug = _interopRequireDefault(require("debug"));

var _Pages = require("./Pages.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const debug = (0, _debug.default)("plebbit-js:SortHandler");
const POSTS_SORT_TYPES = Object.freeze({
  HOT: {
    type: "hot",
    "score": _Util.hotScore
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
    "score": _Util.controversialScore
  },
  CONTROVERSIAL_DAY: {
    type: "controversialDay",
    "score": _Util.controversialScore
  },
  CONTROVERSIAL_WEEK: {
    type: "controversialWeek",
    "score": _Util.controversialScore
  },
  CONTROVERSIAL_MONTH: {
    type: "controversialMonth",
    "score": _Util.controversialScore
  },
  CONTROVERSIAL_YEAR: {
    type: "controversialYear",
    "score": _Util.controversialScore
  },
  CONTROVERSIAL_ALL: {
    type: "controversialAll",
    "score": _Util.controversialScore
  }
});
exports.POSTS_SORT_TYPES = POSTS_SORT_TYPES;
const REPLIES_SORT_TYPES = { ...(0, _Util.keepKeys)(POSTS_SORT_TYPES, ["TOP_ALL", "NEW", "CONTROVERSIAL_ALL"]),
  "OLD": {
    type: "old"
  }
};
exports.REPLIES_SORT_TYPES = REPLIES_SORT_TYPES;
const SORTED_POSTS_PAGE_SIZE = 50;
exports.SORTED_POSTS_PAGE_SIZE = SORTED_POSTS_PAGE_SIZE;

var _chunksToListOfPage = /*#__PURE__*/new WeakSet();

var _sortComments = /*#__PURE__*/new WeakSet();

var _sortCommentsByHot = /*#__PURE__*/new WeakSet();

var _sortCommentsByTop = /*#__PURE__*/new WeakSet();

var _sortCommentsByControversial = /*#__PURE__*/new WeakSet();

var _sortCommentsByNew = /*#__PURE__*/new WeakSet();

var _getSortPromises = /*#__PURE__*/new WeakSet();

class SortHandler {
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

    [pages, pageCids] = [(0, _Util.removeKeysWithUndefinedValues)(pages), (0, _Util.removeKeysWithUndefinedValues)(pageCids)];
    if (JSON.stringify(pages) === "{}") [pages, pageCids] = [undefined, undefined];
    return [pages, pageCids];
  }

}

exports.SortHandler = SortHandler;

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
    const page = new _Pages.Page({
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
  const commentsChunks = (0, _Util.chunks)(commentsSorted, limit);
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
  const comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, (0, _Util.timestamp)() - _Util.TIMEFRAMES_TO_SECONDS[timeframe], (0, _Util.timestamp)(), trx);
  return await _classPrivateMethodGet(this, _sortComments, _sortComments2).call(this, comments, sortType);
}

async function _sortCommentsByControversial2(parentCid, timeframe, trx) {
  const sortType = POSTS_SORT_TYPES[`CONTROVERSIAL_${timeframe}`];
  const comments = await this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, (0, _Util.timestamp)() - _Util.TIMEFRAMES_TO_SECONDS[timeframe], (0, _Util.timestamp)(), trx);
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

    for (const timeframe of Object.keys(_Util.TIMEFRAMES_TO_SECONDS)) {
      sortPromises.push(_classPrivateMethodGet(this, _sortCommentsByTop, _sortCommentsByTop2).bind(this)(null, timeframe, trx));
      sortPromises.push(_classPrivateMethodGet(this, _sortCommentsByControversial, _sortCommentsByControversial2).bind(this)(null, timeframe, trx));
    }

    return sortPromises;
  } else {
    return Object.values(REPLIES_SORT_TYPES).map(async sortType => {
      let comments;
      if (sortType.type === REPLIES_SORT_TYPES.TOP_ALL.type) comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, (0, _Util.timestamp)(), trx);else if (sortType.type === REPLIES_SORT_TYPES.OLD.type) comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", trx);else comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, trx);
      return _classPrivateMethodGet(this, _sortComments, _sortComments2).call(this, comments, sortType);
    });
  }
}