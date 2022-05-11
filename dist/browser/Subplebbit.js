function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

import last from "it-last";
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import EventEmitter from "events";
import { sha256 } from "js-sha256";
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { Challenge, CHALLENGE_TYPES, ChallengeAnswerMessage, ChallengeMessage, ChallengeRequestMessage, ChallengeVerificationMessage, PUBSUB_MESSAGE_TYPES } from "./Challenge.js";
import assert from "assert";
import DbHandler, { SIGNER_USAGES } from "./DbHandler.js";
import { createCaptcha } from "../browser/noop.js";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, SortHandler } from "./SortHandler.js";
import * as path from "../browser/noop.js";
import * as fs from "../browser/noop.js";
import { v4 as uuidv4 } from 'uuid';
import { ipfsImportKey, loadIpnsAsJson, shallowEqual, timestamp } from "./Util.js";
import Debug from "debug";
import { decrypt, encrypt, verifyPublication } from "./Signer.js";
import { Pages } from "./Pages.js";
const debug = Debug("plebbit-js:Subplebbit");
const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 300000; // 5 minutes

var _initSubplebbit = /*#__PURE__*/new WeakSet();

var _initSignerIfNeeded = /*#__PURE__*/new WeakSet();

var _initDbIfNeeded = /*#__PURE__*/new WeakSet();

var _toJSONInternal = /*#__PURE__*/new WeakSet();

var _updateOnce = /*#__PURE__*/new WeakSet();

var _updateSubplebbitIpns = /*#__PURE__*/new WeakSet();

var _handleCommentEdit = /*#__PURE__*/new WeakSet();

var _handleVote = /*#__PURE__*/new WeakSet();

var _publishPostAfterPassingChallenge = /*#__PURE__*/new WeakSet();

var _handleChallengeRequest = /*#__PURE__*/new WeakSet();

var _upsertAndPublishChallenge = /*#__PURE__*/new WeakSet();

var _handleChallengeAnswer = /*#__PURE__*/new WeakSet();

var _processCaptchaPubsub = /*#__PURE__*/new WeakSet();

var _defaultProvideCaptcha = /*#__PURE__*/new WeakSet();

var _defaultValidateCaptcha = /*#__PURE__*/new WeakSet();

var _syncIpnsWithDb = /*#__PURE__*/new WeakSet();

export class Subplebbit extends EventEmitter {
  constructor(props, plebbit) {
    super();

    _classPrivateMethodInitSpec(this, _syncIpnsWithDb);

    _classPrivateMethodInitSpec(this, _defaultValidateCaptcha);

    _classPrivateMethodInitSpec(this, _defaultProvideCaptcha);

    _classPrivateMethodInitSpec(this, _processCaptchaPubsub);

    _classPrivateMethodInitSpec(this, _handleChallengeAnswer);

    _classPrivateMethodInitSpec(this, _upsertAndPublishChallenge);

    _classPrivateMethodInitSpec(this, _handleChallengeRequest);

    _classPrivateMethodInitSpec(this, _publishPostAfterPassingChallenge);

    _classPrivateMethodInitSpec(this, _handleVote);

    _classPrivateMethodInitSpec(this, _handleCommentEdit);

    _classPrivateMethodInitSpec(this, _updateSubplebbitIpns);

    _classPrivateMethodInitSpec(this, _updateOnce);

    _classPrivateMethodInitSpec(this, _toJSONInternal);

    _classPrivateMethodInitSpec(this, _initDbIfNeeded);

    _classPrivateMethodInitSpec(this, _initSignerIfNeeded);

    _classPrivateMethodInitSpec(this, _initSubplebbit);

    this.plebbit = plebbit;

    _classPrivateMethodGet(this, _initSubplebbit, _initSubplebbit2).call(this, props);

    this._challengeToSolution = {}; // Map challenge ID to its solution

    this._challengeToPublication = {}; // To hold unpublished posts/comments/votes

    this.provideCaptchaCallback = undefined;
    this.validateCaptchaAnswerCallback = undefined;
  }

  setProvideCaptchaCallback(newCallback) {
    this.provideCaptchaCallback = newCallback;
  }

  setValidateCaptchaAnswerCallback(newCallback) {
    this.validateCaptchaAnswerCallback = newCallback;
  }

  toJSON() {
    return {
      "title": this.title,
      "description": this.description,
      "moderatorsAddresses": this.moderatorsAddresses,
      "latestPostCid": this.latestPostCid,
      "pubsubTopic": this.pubsubTopic,
      "address": this.address,
      "posts": this.posts,
      "challengeTypes": this.challengeTypes,
      "metricsCid": this.metricsCid,
      "createdAt": this.createdAt,
      "updatedAt": this.updatedAt,
      "encryption": this.encryption
    };
  }

  async prePublish(newSubplebbitOptions = {}) {
    // Import ipfs key into node (if not imported already)
    // Initialize signer
    // Initialize address (needs signer)
    // Initialize db (needs address)
    if (!this.signer && this.address) {
      // Load signer from DB
      await _classPrivateMethodGet(this, _initDbIfNeeded, _initDbIfNeeded2).call(this);
    } else if (!this.address && this.signer) this.address = this.signer.address;

    await _classPrivateMethodGet(this, _initDbIfNeeded, _initDbIfNeeded2).call(this);
    assert(this.address && this.signer, "Both address and signer need to be defined at this point");
    if (!this.pubsubTopic) this.pubsubTopic = this.address; // import ipfs key into ipfs node

    const subplebbitIpfsNodeKey = (await this.plebbit.ipfsClient.key.list()).filter(key => key.name === this.address)[0];

    if (!subplebbitIpfsNodeKey) {
      const ipfsKey = await ipfsImportKey({ ...this.signer,
        "ipnsKeyName": this.address
      }, this.plebbit);
      this.ipnsKeyName = ipfsKey["name"] || ipfsKey["Name"];
      debug(`Imported keys into ipfs node, ${JSON.stringify(ipfsKey)}`);
    } else {
      debug(`Subplebbit key is already in ipfs node, no need to import (${JSON.stringify(subplebbitIpfsNodeKey)})`);
      this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
    }

    assert(this.ipnsKeyName && this.address && this.signer && this.encryption && this.pubsubTopic, "These fields are needed to run the subplebbit");
  }

  async edit(newSubplebbitOptions) {
    await this.prePublish(newSubplebbitOptions);

    try {
      _classPrivateMethodGet(this, _initSubplebbit, _initSubplebbit2).call(this, {
        "updatedAt": timestamp(),
        ...newSubplebbitOptions
      });

      const file = await this.plebbit.ipfsClient.add(JSON.stringify(this));
      await this.plebbit.ipfsClient.name.publish(file["cid"], {
        "lifetime": "72h",
        // TODO decide on optimal time later
        "key": this.ipnsKeyName
      });
      debug(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited and its IPNS updated`);
      return this;
    } catch (e) {
      debug(`Failed to edit subplebbit due to ${e}`);
    }
  }

  update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
    debug(`Starting to poll updates for subplebbit (${this.address}) every ${updateIntervalMs} milliseconds`);
    if (this._updateInterval) clearInterval(this._updateInterval);
    this._updateInterval = setInterval(_classPrivateMethodGet(this, _updateOnce, _updateOnce2).bind(this), updateIntervalMs); // One minute

    return _classPrivateMethodGet(this, _updateOnce, _updateOnce2).call(this);
  }

  async stop() {
    clearInterval(this._updateInterval);
    await this.plebbit.ipfsClient.pubsub.unsubscribe(this.pubsubTopic);
  }

  async start(syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS) {
    await this.prePublish();

    if (!this.provideCaptchaCallback) {
      debug("Subplebbit owner has not provided any captcha. Will go with default image captcha");
      this.provideCaptchaCallback = _classPrivateMethodGet(this, _defaultProvideCaptcha, _defaultProvideCaptcha2);
      this.validateCaptchaAnswerCallback = _classPrivateMethodGet(this, _defaultValidateCaptcha, _defaultValidateCaptcha2);
    }

    assert(this.dbHandler, "A connection to a database is needed for the hosting a subplebbit");
    assert(this.pubsubTopic, "Pubsub topic need to defined before publishing");
    await this.plebbit.ipfsClient.pubsub.subscribe(this.pubsubTopic, _classPrivateMethodGet(this, _processCaptchaPubsub, _processCaptchaPubsub2).bind(this));
    debug(`Waiting for publications on pubsub topic (${this.pubsubTopic})`);
    await _classPrivateMethodGet(this, _syncIpnsWithDb, _syncIpnsWithDb2).call(this, syncIntervalMs);
  }

  async stopPublishing() {
    var _this$dbHandler, _this$dbHandler$knex;

    this.removeAllListeners();
    await this.stop();
    (_this$dbHandler = this.dbHandler) === null || _this$dbHandler === void 0 ? void 0 : (_this$dbHandler$knex = _this$dbHandler.knex) === null || _this$dbHandler$knex === void 0 ? void 0 : _this$dbHandler$knex.destroy();
    this.dbHandler = undefined;
  }

  async destroy() {
    // For development purposes ONLY
    // Call this only if you know what you're doing
    // rm ipns and ipfs
    await this.stopPublishing();
    const ipfsPath = await last(this.plebbit.ipfsClient.name.resolve(this.address));
    await this.plebbit.ipfsClient.pin.rm(ipfsPath);
    await this.plebbit.ipfsClient.key.rm(this.ipnsKeyName);
  } // For development purposes only


  async _addPublicationToDb(publication) {
    const trx = publication.vote ? undefined : await this.dbHandler.createTransaction(); // No need for votes to reserve a transaction

    try {
      const randomUUID = uuidv4();
      await this.dbHandler.upsertChallenge(new ChallengeRequestMessage({
        "challengeRequestId": randomUUID
      }), trx);
      const publishedPublication = await _classPrivateMethodGet(this, _publishPostAfterPassingChallenge, _publishPostAfterPassingChallenge2).call(this, publication, randomUUID, trx);
      if (trx) await trx.commit();
      return publishedPublication;
    } catch (e) {
      debug(`Failed to add publication to DB, error ${e}`);
      if (trx) await trx.rollback();
    }
  }

}

function _initSubplebbit2(newProps) {
  const oldProps = _classPrivateMethodGet(this, _toJSONInternal, _toJSONInternal2).call(this);

  const mergedProps = { ...oldProps,
    ...newProps
  };
  this.title = mergedProps["title"];
  this.description = mergedProps["description"];
  this.moderatorsAddresses = mergedProps["moderatorsAddresses"];
  this.latestPostCid = mergedProps["latestPostCid"];
  this._dbConfig = mergedProps["database"];
  this.posts = mergedProps["posts"] instanceof Object ? new Pages({ ...mergedProps["posts"],
    "subplebbit": this
  }) : mergedProps["posts"];
  this.address = mergedProps["address"];
  this.ipnsKeyName = mergedProps["ipnsKeyName"];
  this.pubsubTopic = mergedProps["pubsubTopic"] || this.address;
  this.sortHandler = new SortHandler(this);
  this.challengeTypes = mergedProps["challengeTypes"];
  this.metricsCid = mergedProps["metricsCid"];
  this.createdAt = mergedProps["createdAt"];
  this.updatedAt = mergedProps["updatedAt"];
  this.signer = mergedProps["signer"];
  this.encryption = mergedProps["encryption"];
}

async function _initSignerIfNeeded2() {
  if (this.dbHandler) {
    const dbSigner = await this.dbHandler.querySubplebbitSigner();

    if (!dbSigner) {
      assert(this.signer, "Subplebbit needs a signer to start");
      debug(`Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB`);
      await this.dbHandler.insertSigner({ ...this.signer,
        "ipnsKeyName": this.signer.address,
        "usage": SIGNER_USAGES.SUBPLEBBIT
      });
    } else if (!this.signer) {
      debug(`Subplebbit loaded signer from DB`);
      this.signer = dbSigner;
    }
  }

  this.encryption = {
    "type": this.signer.type,
    "publicKey": this.signer.publicKey
  };

  if (!this.address && this.signer) {
    // Look for subplebbit address (key.id) in the ipfs node
    const ipnsKeys = await this.plebbit.ipfsClient.key.list();
    const ipfsKey = ipnsKeys.filter(key => key.name === this.signer.address)[0];
    debug(Boolean(ipfsKey) ? `Owner has provided a signer that maps to ${ipfsKey.id} subplebbit address within ipfs node` : `Owner has provided a signer that doesn't map to any subplebbit address within the ipfs node`);
    this.address = ipfsKey === null || ipfsKey === void 0 ? void 0 : ipfsKey.id;
  }
}

async function _initDbIfNeeded2() {
  if (this.dbHandler) return;

  if (!this._dbConfig) {
    assert(this.address, "Need subplebbit address to initialize a DB connection");
    const dbPath = path.join(this.plebbit.dataPath, this.address);
    debug(`User has not provided a DB config. Will initialize DB in ${dbPath}`);
    this._dbConfig = {
      client: 'better-sqlite3',
      // or 'better-sqlite3'
      connection: {
        filename: dbPath
      },
      useNullAsDefault: true
    };
  } else debug(`User provided a DB config of ${this._dbConfig}`);

  const dir = path.dirname(this._dbConfig.connection.filename);
  await fs.promises.mkdir(dir, {
    "recursive": true
  });
  this.dbHandler = new DbHandler(this._dbConfig, this);
  await this.dbHandler.createTablesIfNeeded();
  await _classPrivateMethodGet(this, _initSignerIfNeeded, _initSignerIfNeeded2).call(this);
}

function _toJSONInternal2() {
  return { ...this.toJSON(),
    "ipnsKeyName": this.ipnsKeyName,
    "database": this._dbConfig,
    "signer": this.signer
  };
}

async function _updateOnce2() {
  assert(this.address, "Can't update subplebbit without address");

  try {
    const subplebbitIpns = await loadIpnsAsJson(this.address, this.plebbit);

    if (this.emittedAt !== subplebbitIpns.updatedAt) {
      this.emittedAt = subplebbitIpns.updatedAt;

      _classPrivateMethodGet(this, _initSubplebbit, _initSubplebbit2).call(this, subplebbitIpns);

      debug(`Subplebbit received a new update. Will emit an update event`);
      this.emit("update", this);
    }

    _classPrivateMethodGet(this, _initSubplebbit, _initSubplebbit2).call(this, subplebbitIpns);

    return this;
  } catch (e) {
    debug(`Failed to update subplebbit IPNS, error: ${e}`);
  }
}

async function _updateSubplebbitIpns2() {
  const trx = await this.dbHandler.createTransaction();
  const latestPost = await this.dbHandler.queryLatestPost(trx);
  await trx.commit();
  const [metrics, [sortedPosts, sortedPostsCids], currentIpns] = await Promise.all([this.dbHandler.querySubplebbitMetrics(), this.sortHandler.generatePagesUnderComment(), loadIpnsAsJson(this.address, this.plebbit)]);
  let posts;
  if (sortedPosts) posts = new Pages({
    "pages": {
      [POSTS_SORT_TYPES.HOT.type]: sortedPosts[POSTS_SORT_TYPES.HOT.type]
    },
    "pageCids": sortedPostsCids,
    "subplebbit": this
  });
  const newSubplebbitOptions = { ...(currentIpns ? {} : {
      "createdAt": timestamp()
    }),
    "posts": posts,
    "metricsCid": (await this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path,
    "latestPostCid": latestPost === null || latestPost === void 0 ? void 0 : latestPost.postCid
  };

  if (!currentIpns || JSON.stringify(currentIpns.posts) !== JSON.stringify(newSubplebbitOptions.posts) || currentIpns.metricsCid !== newSubplebbitOptions.metricsCid || currentIpns.latestPostCid !== newSubplebbitOptions.latestPostCid) {
    debug(`Will attempt to sync subplebbit IPNS fields [${Object.keys(newSubplebbitOptions)}]`);
    return this.edit(newSubplebbitOptions);
  } else debug(`No need to update subplebbit IPNS`);
}

async function _handleCommentEdit2(commentEdit, challengeRequestId, trx) {
  const commentToBeEdited = await this.dbHandler.queryComment(commentEdit.commentCid, trx);
  const [signatureIsVerified, verificationFailReason] = await verifyPublication(commentEdit);

  if (!signatureIsVerified) {
    debug(`Comment edit of ${commentEdit.commentCid} has been rejected due to having invalid signature. Reason = ${verificationFailReason}`);
    return {
      "reason": `Comment edit of ${commentEdit.commentCid} has been rejected due to having invalid signature`
    };
  } else if (!commentToBeEdited) {
    debug(`Unable to edit comment (${commentEdit.commentCid}) since it's not in local DB`);
    return {
      "reason": `commentCid (${commentEdit.commentCid}) does not exist`
    };
  } else if (commentEdit.editSignature.publicKey !== commentToBeEdited.signature.publicKey) {
    // Original comment and CommentEdit need to have same key
    // TODO make exception for moderators
    debug(`User attempted to edit a comment (${commentEdit.commentCid}) without having its keys`);
    return {
      "reason": `Comment edit of ${commentEdit.commentCid} due to having different author keys than original comment`
    };
  } else if (shallowEqual(commentToBeEdited.signature, commentEdit.editSignature)) {
    debug(`Signature of CommentEdit is identical to original comment (${commentEdit.cid})`);
    return {
      "reason": `Signature of CommentEdit is identical to original comment (${commentEdit.cid})`
    };
  } else {
    commentEdit.setOriginalContent(commentToBeEdited.originalContent || commentToBeEdited.content);
    await this.dbHandler.upsertComment(commentEdit, undefined, trx);
    debug(`Updated content for comment ${commentEdit.commentCid}`);
  }
}

async function _handleVote2(newVote, challengeRequestId, trx) {
  const [signatureIsVerified, failedVerificationReason] = await verifyPublication(newVote);

  if (!signatureIsVerified) {
    debug(`Author (${newVote.author.address}) vote (${newVote.vote} vote's signature is invalid. Reason = ${failedVerificationReason}`);
    return {
      "reason": "Invalid signature"
    };
  }

  const lastVote = await this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address, trx);

  if (lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey) {
    // Original comment and CommentEdit need to have same key
    // TODO make exception for moderators
    debug(`Author (${newVote.author.address}) attempted to edit a comment vote (${newVote.commentCid}) without having correct credentials`);
    return {
      "reason": `Author (${newVote.author.address}) attempted to change vote on  ${newVote.commentCid} without having correct credentials`
    };
  } else if (shallowEqual(newVote.signature, lastVote === null || lastVote === void 0 ? void 0 : lastVote.signature)) {
    var _newVote$author;

    debug(`Signature of Vote is identical to original Vote (${newVote.commentCid})`);
    return {
      "reason": `Signature of Vote is identical to original Vote (${newVote.commentCid}) by author ${newVote === null || newVote === void 0 ? void 0 : (_newVote$author = newVote.author) === null || _newVote$author === void 0 ? void 0 : _newVote$author.address}`
    };
  } else if ((lastVote === null || lastVote === void 0 ? void 0 : lastVote.vote) === newVote.vote) {
    debug(`Author (${newVote === null || newVote === void 0 ? void 0 : newVote.author.address}) has duplicated their vote for comment ${newVote.commentCid}. Returning an error`);
    return {
      "reason": "User duplicated their vote"
    };
  } else {
    await this.dbHandler.upsertVote(newVote, challengeRequestId, trx);
    debug(`Upserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
  }
}

async function _publishPostAfterPassingChallenge2(publication, challengeRequestId, trx) {
  delete this._challengeToSolution[challengeRequestId];
  delete this._challengeToPublication[challengeRequestId];
  const postOrCommentOrVote = publication.hasOwnProperty("vote") ? await this.plebbit.createVote(publication) : publication.commentCid ? await this.plebbit.createCommentEdit(publication) : await this.plebbit.createComment(publication);

  if (postOrCommentOrVote.getType() === "vote") {
    const res = await _classPrivateMethodGet(this, _handleVote, _handleVote2).call(this, postOrCommentOrVote, challengeRequestId, trx);
    if (res) return res;
  } else if (postOrCommentOrVote.commentCid) {
    const res = await _classPrivateMethodGet(this, _handleCommentEdit, _handleCommentEdit2).call(this, postOrCommentOrVote, challengeRequestId, trx);
    if (res) return res;
  } else if (postOrCommentOrVote.content) {
    // Comment and Post need to add file to ipfs
    const signatureIsVerified = (await verifyPublication(postOrCommentOrVote))[0];

    if (!signatureIsVerified) {
      debug(`Author (${postOrCommentOrVote.author.address}) comment's signature is invalid`);
      return {
        "reason": "Invalid signature"
      };
    }

    const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));

    if (await this.dbHandler.querySigner(ipnsKeyName, trx)) {
      const msg = `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`;
      debug(msg);
      return {
        "reason": msg
      };
    } else {
      const ipfsSigner = { ...(await this.plebbit.createSigner()),
        "ipnsKeyName": ipnsKeyName,
        "usage": SIGNER_USAGES.COMMENT
      };
      const [ipfsKey] = await Promise.all([ipfsImportKey(ipfsSigner, this.plebbit), this.dbHandler.insertSigner(ipfsSigner, trx)]);
      postOrCommentOrVote.setCommentIpnsKey(ipfsKey);

      if (postOrCommentOrVote.getType() === "post") {
        var _await$this$dbHandler;

        postOrCommentOrVote.setPreviousCid((_await$this$dbHandler = await this.dbHandler.queryLatestPost(trx)) === null || _await$this$dbHandler === void 0 ? void 0 : _await$this$dbHandler.cid);
        postOrCommentOrVote.setDepth(0);
        const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
        postOrCommentOrVote.setPostCid(file.path);
        postOrCommentOrVote.setCid(file.path);
        await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
        debug(`New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
      } else {
        var _commentsUnderParent$;

        // Comment
        // TODO throw an error when user tries to comment a non existent post/comment
        const [commentsUnderParent, parent] = await Promise.all([this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx), this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)]);
        postOrCommentOrVote.setPreviousCid((_commentsUnderParent$ = commentsUnderParent[0]) === null || _commentsUnderParent$ === void 0 ? void 0 : _commentsUnderParent$.cid);
        postOrCommentOrVote.setDepth(parent.depth + 1);
        const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
        postOrCommentOrVote.setCid(file.path);
        await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
        debug(`New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
      }
    }
  }

  return {
    "publication": postOrCommentOrVote
  };
}

async function _handleChallengeRequest2(msgParsed) {
  return new Promise(async (resolve, reject) => {
    const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(msgParsed);
    const decryptedPublication = JSON.parse(await decrypt(msgParsed.encryptedPublication.encryptedString, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey));
    this._challengeToPublication[msgParsed.challengeRequestId] = decryptedPublication;
    debug(`Received a request to a challenge (${msgParsed.challengeRequestId})`);

    if (!providedChallenges) {
      // Subplebbit owner has chosen to skip challenging this user or post
      debug(`Skipping challenge for ${msgParsed.challengeRequestId}, add publication to IPFS and respond with challengeVerificationMessage right away`);
      const trx = decryptedPublication.vote ? undefined : await this.dbHandler.createTransaction(); // Votes don't need transaction

      await this.dbHandler.upsertChallenge(new ChallengeRequestMessage(msgParsed), trx);
      const publishedPublication = await _classPrivateMethodGet(this, _publishPostAfterPassingChallenge, _publishPostAfterPassingChallenge2).call(this, decryptedPublication, msgParsed.challengeRequestId, trx);
      const restOfMsg = "publication" in publishedPublication ? {
        "encryptedPublication": await encrypt(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.signature || publishedPublication.publication.editSignature).publicKey)
      } : publishedPublication;
      const challengeVerification = new ChallengeVerificationMessage({
        "reason": reasonForSkippingCaptcha,
        "challengePassed": Boolean(publishedPublication.publication),
        // If no publication, this will be false
        "challengeAnswerId": msgParsed.challengeAnswerId,
        "challengeErrors": undefined,
        "challengeRequestId": msgParsed.challengeRequestId,
        ...restOfMsg
      });

      _classPrivateMethodGet(this, _upsertAndPublishChallenge, _upsertAndPublishChallenge2).call(this, challengeVerification, trx).then(resolve).catch(reject);
    } else {
      const challengeMessage = new ChallengeMessage({
        "challengeRequestId": msgParsed.challengeRequestId,
        "challenges": providedChallenges
      });

      _classPrivateMethodGet(this, _upsertAndPublishChallenge, _upsertAndPublishChallenge2).call(this, challengeMessage, undefined).then(resolve).catch(reject);
    }
  });
}

async function _upsertAndPublishChallenge2(challenge, trx) {
  try {
    await this.dbHandler.upsertChallenge(challenge, trx);
    if (trx) await trx.commit();
    await this.plebbit.ipfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challenge)));
    debug(`Published challenge type ${challenge.type} (${challenge.challengeRequestId})`);
  } catch (e) {
    debug(`Failed to either publish challenge or upsert in DB, error = ${e}`);
    if (trx) await trx.rollback();
  }
}

async function _handleChallengeAnswer2(msgParsed) {
  const [challengePassed, challengeErrors] = await this.validateCaptchaAnswerCallback(msgParsed);

  if (challengePassed) {
    debug(`Challenge (${msgParsed.challengeRequestId}) has answered correctly`);
    const storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
    const trx = storedPublication.vote ? undefined : await this.dbHandler.createTransaction(); // Votes don't need transactions

    await this.dbHandler.upsertChallenge(new ChallengeAnswerMessage(msgParsed), trx);
    const publishedPublication = await _classPrivateMethodGet(this, _publishPostAfterPassingChallenge, _publishPostAfterPassingChallenge2).call(this, storedPublication, msgParsed.challengeRequestId, trx); // could contain "publication" or "reason"

    const restOfMsg = "publication" in publishedPublication ? {
      "encryptedPublication": await encrypt(JSON.stringify(publishedPublication.publication), publishedPublication.publication.signature.publicKey)
    } : publishedPublication;
    const challengeVerification = new ChallengeVerificationMessage({
      "challengeRequestId": msgParsed.challengeRequestId,
      "challengeAnswerId": msgParsed.challengeAnswerId,
      "challengePassed": challengePassed,
      "challengeErrors": challengeErrors,
      ...restOfMsg
    });
    return _classPrivateMethodGet(this, _upsertAndPublishChallenge, _upsertAndPublishChallenge2).call(this, challengeVerification, trx);
  } else {
    debug(`Challenge (${msgParsed.challengeRequestId}) has answered incorrectly`);
    const challengeVerification = new ChallengeVerificationMessage({
      "challengeRequestId": msgParsed.challengeRequestId,
      "challengeAnswerId": msgParsed.challengeAnswerId,
      "challengePassed": challengePassed,
      "challengeErrors": challengeErrors
    });
    return _classPrivateMethodGet(this, _upsertAndPublishChallenge, _upsertAndPublishChallenge2).call(this, challengeVerification, undefined);
  }
}

async function _processCaptchaPubsub2(pubsubMsg) {
  const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
  if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST) await _classPrivateMethodGet(this, _handleChallengeRequest, _handleChallengeRequest2).call(this, msgParsed);else if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER && this._challengeToPublication[msgParsed.challengeRequestId]) // Only reply to peers who started a challenge request earlier
    await _classPrivateMethodGet(this, _handleChallengeAnswer, _handleChallengeAnswer2).call(this, msgParsed);
}

async function _defaultProvideCaptcha2(challengeRequestMessage) {
  // Return question, type
  // Expected return is:
  // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
  return new Promise(async (resolve, reject) => {
    const {
      image,
      text
    } = createCaptcha(300, 100);
    this._challengeToSolution[challengeRequestMessage.challengeRequestId] = [text];
    image.then(imageBuffer => resolve([[new Challenge({
      "challenge": imageBuffer,
      "type": CHALLENGE_TYPES.image
    })], undefined])).catch(reject);
  });
}

async function _defaultValidateCaptcha2(challengeAnswerMessage) {
  return new Promise(async (resolve, reject) => {
    const actualSolution = this._challengeToSolution[challengeAnswerMessage.challengeRequestId];
    const answerIsCorrect = JSON.stringify(challengeAnswerMessage.challengeAnswers) === JSON.stringify(actualSolution);
    debug(`Challenge (${challengeAnswerMessage.challengeRequestId}): Answer's validity: ${answerIsCorrect}, user's answer: ${challengeAnswerMessage.challengeAnswers}, actual solution: ${actualSolution}`);
    const challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
    resolve([answerIsCorrect, challengeErrors]);
  });
}

async function _syncIpnsWithDb2(syncIntervalMs) {
  debug("Starting to sync IPNS with DB");

  const syncComment = async dbComment => {
    const currentIpns = await loadIpnsAsJson(dbComment.ipnsName, this.plebbit);

    if (!currentIpns || !shallowEqual(currentIpns, dbComment.toJSONCommentUpdate(), ["replies"])) {
      try {
        debug(`Comment (${dbComment.cid}) IPNS is outdated`);
        const [sortedReplies, sortedRepliesCids] = await this.sortHandler.generatePagesUnderComment(dbComment);
        dbComment.setReplies(sortedReplies, sortedRepliesCids);
        dbComment.setUpdatedAt(timestamp());
        await this.dbHandler.upsertComment(dbComment, undefined);
        return dbComment.edit(dbComment.toJSONCommentUpdate());
      } catch (e) {
        debug(`Failed to update comment (${dbComment.cid}) due to error=${e}`);
      }
    }
  };

  try {
    const dbComments = await this.dbHandler.queryComments();
    await Promise.all([...dbComments.map(async comment => syncComment(comment)), _classPrivateMethodGet(this, _updateSubplebbitIpns, _updateSubplebbitIpns2).call(this)]);
  } catch (e) {
    debug(`Failed to sync due to error: ${e}`);
  }

  setTimeout(_classPrivateMethodGet(this, _syncIpnsWithDb, _syncIpnsWithDb2).bind(this, syncIntervalMs), syncIntervalMs);
}