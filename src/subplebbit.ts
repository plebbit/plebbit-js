import last from "it-last";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import { sha256 } from "js-sha256";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import {
    Challenge,
    CHALLENGE_TYPES,
    ChallengeAnswerMessage,
    ChallengeMessage,
    ChallengeRequestMessage,
    ChallengeVerificationMessage,
    PUBSUB_MESSAGE_TYPES
} from "./challenge";
import assert from "assert";
import DbHandler, { SIGNER_USAGES, subplebbitInitDbIfNeeded } from "./runtime/node/db-handler";
import { createCaptcha } from "./runtime/node/captcha";
import { POSTS_SORT_TYPES, SortHandler } from "./sort-handler";
import { ipfsImportKey, loadIpnsAsJson, shallowEqual, timestamp } from "./util";
import Debug from "debug";
import { decrypt, encrypt, verifyPublication, Signer } from "./signer";
import { Pages } from "./pages";
import { Plebbit } from "./plebbit";
import { SubplebbitEncryption } from "./types";

const debug = Debug("plebbit-js:subplebbit");
const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 100000; // 5 minutes

export class Subplebbit extends EventEmitter {
    // public
    address: string;
    title?: string;
    description?: string;
    moderatorsAddresses?: string[];
    latestPostCid?: string;
    posts?: Pages;
    pubsubTopic?: string;
    challengeTypes?: string[];
    metricsCid?: string[];
    createdAt?: number;
    updatedAt?: number;
    signer?: Signer;
    encryption?: SubplebbitEncryption;

    // private
    plebbit?: Plebbit;
    dbHandler?: DbHandler;
    _challengeToSolution: any;
    _challengeToPublication: any;
    provideCaptchaCallback?: Function;
    validateCaptchaAnswerCallback?: Function;
    _dbConfig?: any;
    ipnsKeyName?: string;
    sortHandler: any;
    emittedAt?: number;
    _updateInterval?: any;
    _keyv: any;

    constructor(props, plebbit) {
        super();
        this.plebbit = plebbit;
        this.initSubplebbit(props);
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this.provideCaptchaCallback = undefined;
        this.validateCaptchaAnswerCallback = undefined;
    }

    initSubplebbit(newProps) {
        const oldProps = this.toJSONInternal();
        const mergedProps = { ...oldProps, ...newProps };
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsAddresses = mergedProps["moderatorsAddresses"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this._dbConfig = mergedProps["database"];
        this.posts =
            mergedProps["posts"] instanceof Object
                ? new Pages({
                      ...mergedProps["posts"],
                      subplebbit: this
                  })
                : mergedProps["posts"];
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

    async initSignerIfNeeded() {
        if (this.dbHandler) {
            // @ts-ignore
            const dbSigner = await this.dbHandler.querySubplebbitSigner();
            if (!dbSigner) {
                assert(this.signer, "Subplebbit needs a signer to start");
                debug(`Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB`);
                // @ts-ignore
                await this.dbHandler.insertSigner({
                    ...this.signer,
                    ipnsKeyName: this.signer.address,
                    usage: SIGNER_USAGES.SUBPLEBBIT
                });
            } else if (!this.signer) {
                debug(`Subplebbit loaded signer from DB`);
                // @ts-ignore
                this.signer = dbSigner;
            }
        }

        this.encryption = {
            type: this.signer.type,
            publicKey: this.signer.publicKey
        };

        if (!this.address && this.signer) {
            // Look for subplebbit address (key.id) in the ipfs node
            const ipnsKeys = await this.plebbit.ipfsClient.key.list();
            const ipfsKey = ipnsKeys.filter((key) => key.name === this.signer.address)[0];
            debug(
                Boolean(ipfsKey)
                    ? `Owner has provided a signer that maps to ${ipfsKey.id} subplebbit address within ipfs node`
                    : `Owner has provided a signer that doesn't map to any subplebbit address within the ipfs node`
            );
            this.address = ipfsKey?.id;
        }
    }

    async initDbIfNeeded() {
        return subplebbitInitDbIfNeeded(this);
    }

    setProvideCaptchaCallback(newCallback) {
        this.provideCaptchaCallback = newCallback;
    }

    setValidateCaptchaAnswerCallback(newCallback) {
        this.validateCaptchaAnswerCallback = newCallback;
    }

    toJSONInternal() {
        return {
            ...this.toJSON(),
            ipnsKeyName: this.ipnsKeyName,
            database: this._dbConfig,
            signer: this.signer
        };
    }

    toJSON() {
        return {
            title: this.title,
            description: this.description,
            moderatorsAddresses: this.moderatorsAddresses,
            latestPostCid: this.latestPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            posts: this.posts,
            challengeTypes: this.challengeTypes,
            metricsCid: this.metricsCid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            encryption: this.encryption
        };
    }

    async prePublish(newSubplebbitOptions = {}) {
        // Import ipfs key into node (if not imported already)
        // Initialize signer
        // Initialize address (needs signer)
        // Initialize db (needs address)
        if (!this.signer && this.address) {
            // Load signer from DB
            await this.initDbIfNeeded();
        } else if (!this.address && this.signer) this.address = this.signer.address;
        await this.initDbIfNeeded();
        assert(this.address && this.signer, "Both address and signer need to be defined at this point");
        if (!this.pubsubTopic) this.pubsubTopic = this.address;
        // import ipfs key into ipfs node
        const subplebbitIpfsNodeKey = (await this.plebbit.ipfsClient.key.list()).filter((key) => key.name === this.address)[0];
        if (!subplebbitIpfsNodeKey) {
            const ipfsKey = await ipfsImportKey({ ...this.signer, ipnsKeyName: this.address }, this.plebbit);
            this.ipnsKeyName = ipfsKey["name"] || ipfsKey["Name"];
            debug(`Imported keys into ipfs node, ${JSON.stringify(ipfsKey)}`);
        } else {
            debug(`Subplebbit key is already in ipfs node, no need to import (${JSON.stringify(subplebbitIpfsNodeKey)})`);
            this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
        }
        assert(
            this.ipnsKeyName && this.address && this.signer && this.encryption && this.pubsubTopic,
            "These fields are needed to run the subplebbit"
        );
    }

    async edit(newSubplebbitOptions) {
        await this.prePublish(newSubplebbitOptions);
        this.initSubplebbit({
            updatedAt: timestamp(),
            ...newSubplebbitOptions
        });
        const file = await this.plebbit.ipfsClient.add(JSON.stringify(this));
        await this.plebbit.ipfsClient.name.publish(file["cid"], {
            lifetime: "72h", // TODO decide on optimal time later
            key: this.ipnsKeyName,
            allowOffline: true
        });
        debug(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited and its IPNS updated`);
        return this;
    }

    async updateOnce() {
        assert(this.address, "Can't update subplebbit without address");
        try {
            const subplebbitIpns = await loadIpnsAsJson(this.address, this.plebbit);
            if (this.emittedAt !== subplebbitIpns.updatedAt) {
                this.emittedAt = subplebbitIpns.updatedAt;
                this.initSubplebbit(subplebbitIpns);
                debug(`Subplebbit received a new update. Will emit an update event`);
                this.emit("update", this);
            }
            this.initSubplebbit(subplebbitIpns);
            return this;
        } catch (e) {
            debug(`Failed to update subplebbit IPNS, error: ${e}`);
        }
    }

    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        debug(`Starting to poll updates for subplebbit (${this.address}) every ${updateIntervalMs} milliseconds`);
        if (this._updateInterval) clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs); // One minute
        return this.updateOnce();
    }

    async stop() {
        clearInterval(this._updateInterval);
    }

    async updateSubplebbitIpns() {
        const trx: any = await this.dbHandler.createTransaction();
        const latestPost: any = await this.dbHandler.queryLatestPost(trx);
        await trx.commit();
        const [metrics, [sortedPosts, sortedPostsCids]] = await Promise.all([
            this.dbHandler.querySubplebbitMetrics(undefined),
            this.sortHandler.generatePagesUnderComment(undefined, undefined)
        ]);
        let currentIpns;
        try {
            currentIpns = await loadIpnsAsJson(this.address, this.plebbit);
        } catch (e) {
            debug(`Subplebbit IPNS (${this.address}) is not defined, will publish a new record`);
        }
        let posts;
        if (sortedPosts)
            posts = new Pages({
                pages: {
                    [POSTS_SORT_TYPES.HOT.type]: sortedPosts[POSTS_SORT_TYPES.HOT.type]
                },
                pageCids: sortedPostsCids,
                subplebbit: this
            });
        const newSubplebbitOptions = {
            ...(!currentIpns && !posts ? { createdAt: timestamp() } : {}),
            posts: posts,
            metricsCid: (await this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path,
            latestPostCid: latestPost?.postCid
        };
        if (
            !currentIpns ||
            JSON.stringify(currentIpns.posts) !== JSON.stringify(newSubplebbitOptions.posts) ||
            currentIpns.metricsCid !== newSubplebbitOptions.metricsCid ||
            currentIpns.latestPostCid !== newSubplebbitOptions.latestPostCid
        ) {
            debug(`Will attempt to sync subplebbit IPNS fields [${Object.keys(newSubplebbitOptions)}]`);
            return this.edit(newSubplebbitOptions);
        } else debug(`No need to update subplebbit IPNS`);
    }

    async handleCommentEdit(commentEdit, challengeRequestId, trx) {
        const commentToBeEdited: any = await this.dbHandler.queryComment(commentEdit.commentCid, trx);
        const [signatureIsVerified, verificationFailReason] = await verifyPublication(commentEdit);
        if (!signatureIsVerified) {
            debug(
                `Comment edit of ${commentEdit.commentCid} has been rejected due to having invalid signature. Reason = ${verificationFailReason}`
            );
            return {
                reason: `Comment edit of ${commentEdit.commentCid} has been rejected due to having invalid signature`
            };
        } else if (!commentToBeEdited) {
            debug(`Unable to edit comment (${commentEdit.commentCid}) since it's not in local DB`);
            return {
                reason: `commentCid (${commentEdit.commentCid}) does not exist`
            };
        } else if (commentEdit.editSignature.publicKey !== commentToBeEdited.signature.publicKey) {
            // Original comment and CommentEdit need to have same key
            // TODO make exception for moderators
            debug(`User attempted to edit a comment (${commentEdit.commentCid}) without having its keys`);
            return {
                reason: `Comment edit of ${commentEdit.commentCid} due to having different author keys than original comment`
            };
        } else if (shallowEqual(commentToBeEdited.signature, commentEdit.editSignature)) {
            debug(`Signature of CommentEdit is identical to original comment (${commentEdit.cid})`);
            return {
                reason: `Signature of CommentEdit is identical to original comment (${commentEdit.cid})`
            };
        } else {
            commentEdit.setOriginalContent(commentToBeEdited.originalContent || commentToBeEdited.content);
            await this.dbHandler.upsertComment(commentEdit, undefined, trx);
            debug(`Updated content for comment ${commentEdit.commentCid}`);
        }
    }

    async handleVote(newVote, challengeRequestId, trx) {
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(newVote);
        if (!signatureIsVerified) {
            debug(
                `Author (${newVote.author.address}) vote (${newVote.vote} vote's signature is invalid. Reason = ${failedVerificationReason}`
            );
            return { reason: "Invalid signature" };
        }
        const [lastVote, parentComment]: [any, any] = await Promise.all([
            this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address, trx),
            this.dbHandler.queryComment(newVote.commentCid, trx)
        ]);

        if (!parentComment) {
            const msg = `User is trying to publish a vote under a comment (${newVote.commentCid}) that does not exist`;
            debug(msg);
            return { reason: msg };
        }
        if (lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey) {
            // Original comment and CommentEdit need to have same key
            // TODO make exception for moderators
            debug(
                `Author (${newVote.author.address}) attempted to edit a comment vote (${newVote.commentCid}) without having correct credentials`
            );
            return {
                reason: `Author (${newVote.author.address}) attempted to change vote on  ${newVote.commentCid} without having correct credentials`
            };
        } else if (shallowEqual(newVote.signature, lastVote?.signature)) {
            debug(`Signature of Vote is identical to original Vote (${newVote.commentCid})`);
            return {
                reason: `Signature of Vote is identical to original Vote (${newVote.commentCid}) by author ${newVote?.author?.address}`
            };
        } else if (lastVote?.vote === newVote.vote) {
            debug(`Author (${newVote?.author.address}) has duplicated their vote for comment ${newVote.commentCid}. Returning an error`);
            return { reason: "User duplicated their vote" };
        } else {
            await this.dbHandler.upsertVote(newVote, challengeRequestId, trx);
            debug(`Upserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
        }
    }

    async publishPostAfterPassingChallenge(publication, challengeRequestId, trx) {
        delete this._challengeToSolution[challengeRequestId];
        delete this._challengeToPublication[challengeRequestId];

        const postOrCommentOrVote: any = publication.hasOwnProperty("vote")
            ? await this.plebbit.createVote(publication)
            : publication.commentCid
            ? await this.plebbit.createCommentEdit(publication)
            : await this.plebbit.createComment(publication);
        if (postOrCommentOrVote.getType() === "vote") {
            const res = await this.handleVote(postOrCommentOrVote, challengeRequestId, trx);
            if (res) return res;
        } else if (postOrCommentOrVote.commentCid) {
            const res = await this.handleCommentEdit(postOrCommentOrVote, challengeRequestId, trx);
            if (res) return res;
        } else if (postOrCommentOrVote.content) {
            // Comment and Post need to add file to ipfs
            const signatureIsVerified = (await verifyPublication(postOrCommentOrVote))[0];
            if (!signatureIsVerified) {
                debug(`Author (${postOrCommentOrVote.author.address}) comment's signature is invalid`);
                return { reason: "Invalid signature" };
            }

            const ipnsKeyName = sha256(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));

            if (await this.dbHandler.querySigner(ipnsKeyName, trx)) {
                const msg = `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`;
                debug(msg);
                return { reason: msg };
            } else {
                const ipfsSigner = {
                    ...(await this.plebbit.createSigner()),
                    ipnsKeyName: ipnsKeyName,
                    usage: SIGNER_USAGES.COMMENT
                };
                const [ipfsKey] = await Promise.all([
                    ipfsImportKey(ipfsSigner, this.plebbit),
                    this.dbHandler.insertSigner(ipfsSigner, trx)
                ]);

                postOrCommentOrVote.setCommentIpnsKey(ipfsKey);
                if (postOrCommentOrVote.getType() === "post") {
                    postOrCommentOrVote.setPreviousCid((await this.dbHandler.queryLatestPost(trx))?.cid);
                    postOrCommentOrVote.setDepth(0);
                    const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                    postOrCommentOrVote.setPostCid(file.path);
                    postOrCommentOrVote.setCid(file.path);
                    await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                    debug(`New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
                } else {
                    // Comment
                    const [commentsUnderParent, parent] = await Promise.all([
                        this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                        this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                    ]);
                    if (!parent) {
                        const msg = `User is trying to publish a comment with content (${postOrCommentOrVote.content}) with incorrect parentCid`;
                        debug(msg);
                        return { reason: msg };
                    }
                    postOrCommentOrVote.setPreviousCid(commentsUnderParent[0]?.cid);
                    postOrCommentOrVote.setDepth(parent.depth + 1);
                    const file = await this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                    postOrCommentOrVote.setCid(file.path);
                    await this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx);
                    debug(`New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
                }
            }
        }

        return { publication: postOrCommentOrVote };
    }

    async handleChallengeRequest(msgParsed) {
        const [providedChallenges, reasonForSkippingCaptcha] = await this.provideCaptchaCallback(msgParsed);
        const decryptedPublication = JSON.parse(
            await decrypt(msgParsed.encryptedPublication.encrypted, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey)
        );
        this._challengeToPublication[msgParsed.challengeRequestId] = decryptedPublication;
        debug(`Received a request to a challenge (${msgParsed.challengeRequestId})`);
        if (!providedChallenges) {
            // Subplebbit owner has chosen to skip challenging this user or post
            debug(
                `Skipping challenge for ${msgParsed.challengeRequestId}, add publication to IPFS and respond with challengeVerificationMessage right away`
            );
            await this.dbHandler.upsertChallenge(new ChallengeRequestMessage(msgParsed), undefined);
            const trx = decryptedPublication.vote ? undefined : await this.dbHandler.createTransaction(); // Votes don't need transaction

            const publishedPublication: any = await this.publishPostAfterPassingChallenge(
                decryptedPublication,
                msgParsed.challengeRequestId,
                trx
            );
            await trx?.commit();

            const restOfMsg =
                "publication" in publishedPublication
                    ? {
                          encryptedPublication: await encrypt(
                              JSON.stringify(publishedPublication.publication),
                              (publishedPublication.publication.signature || publishedPublication.publication.editSignature).publicKey
                          )
                      }
                    : publishedPublication;
            const challengeVerification = new ChallengeVerificationMessage({
                reason: reasonForSkippingCaptcha,
                challengeSuccess: Boolean(publishedPublication.publication), // If no publication, this will be false
                challengeAnswerId: msgParsed.challengeAnswerId,
                challengeErrors: undefined,
                challengeRequestId: msgParsed.challengeRequestId,
                ...restOfMsg
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            debug(`Published ${challengeVerification.type} (${challengeVerification.challengeRequestId}) over pubsub`);
        } else {
            const challengeMessage = new ChallengeMessage({
                challengeRequestId: msgParsed.challengeRequestId,
                challenges: providedChallenges
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeMessage, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeMessage)))
            ]);
            debug(`Published ${challengeMessage.type} (${challengeMessage.challengeRequestId}) over pubsub`);
        }
    }

    async handleChallengeAnswer(msgParsed) {
        const [challengeSuccess, challengeErrors] = await this.validateCaptchaAnswerCallback(msgParsed);
        if (challengeSuccess) {
            debug(`Challenge (${msgParsed.challengeRequestId}) has been answered correctly`);
            const storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
            await this.dbHandler.upsertChallenge(new ChallengeAnswerMessage(msgParsed), undefined);
            const trx = storedPublication.vote ? undefined : await this.dbHandler.createTransaction(); // Votes don't need transactions
            const publishedPublication = await this.publishPostAfterPassingChallenge(storedPublication, msgParsed.challengeRequestId, trx); // could contain "publication" or "reason"
            await trx?.commit();
            const restOfMsg =
                "publication" in publishedPublication
                    ? {
                          encryptedPublication: await encrypt(
                              JSON.stringify(publishedPublication.publication),
                              (publishedPublication.publication.editSignature || publishedPublication.publication.signature).publicKey
                          )
                      }
                    : publishedPublication;
            const challengeVerification = new ChallengeVerificationMessage({
                challengeRequestId: msgParsed.challengeRequestId,
                challengeAnswerId: msgParsed.challengeAnswerId,
                challengeSuccess: challengeSuccess,
                challengeErrors: challengeErrors,
                ...restOfMsg
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            debug(`Published successful ${challengeVerification.type} (${challengeVerification.challengeRequestId}) over pubsub`);
        } else {
            debug(`Challenge (${msgParsed.challengeRequestId}) has answered incorrectly`);
            const challengeVerification = new ChallengeVerificationMessage({
                challengeRequestId: msgParsed.challengeRequestId,
                challengeAnswerId: msgParsed.challengeAnswerId,
                challengeSuccess: challengeSuccess,
                challengeErrors: challengeErrors
            });
            await Promise.all([
                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeVerification)))
            ]);
            debug(`Published failed ${challengeVerification.type} (${challengeVerification.challengeRequestId})`);
        }
    }

    async processCaptchaPubsub(pubsubMsg) {
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));

        if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST) await this.handleChallengeRequest(msgParsed);
        else if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER && this._challengeToPublication[msgParsed.challengeRequestId])
            // Only reply to peers who started a challenge request earlier
            await this.handleChallengeAnswer(msgParsed);
    }

    async defaultProvideCaptcha(challengeRequestMessage) {
        // Return question, type
        // Expected return is:
        // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
        const { image, text } = createCaptcha(300, 100);
        this._challengeToSolution[challengeRequestMessage.challengeRequestId] = [text];
        const imageBuffer = (await image).toString("base64");
        return [
            [
                new Challenge({
                    challenge: imageBuffer,
                    type: CHALLENGE_TYPES.IMAGE
                })
            ]
        ];
    }

    async defaultValidateCaptcha(challengeAnswerMessage) {
        const actualSolution = this._challengeToSolution[challengeAnswerMessage.challengeRequestId];
        const answerIsCorrect = JSON.stringify(challengeAnswerMessage.challengeAnswers) === JSON.stringify(actualSolution);
        debug(
            `Challenge (${challengeAnswerMessage.challengeRequestId}): Answer's validity: ${answerIsCorrect}, user's answer: ${challengeAnswerMessage.challengeAnswers}, actual solution: ${actualSolution}`
        );
        const challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
        return [answerIsCorrect, challengeErrors];
    }

    async syncIpnsWithDb(syncIntervalMs) {
        debug("Starting to sync IPNS with DB");
        const syncComment = async (dbComment) => {
            let commentIpns;
            try {
                commentIpns = await loadIpnsAsJson(dbComment.ipnsName, this.plebbit);
            } catch (e) {
                debug(`Comment (${dbComment.cid}) IPNS (${dbComment.ipnsName}) is not loading. Will attempt to publish a new IPNS record`);
            }
            if (!commentIpns || !shallowEqual(commentIpns, dbComment.toJSONCommentUpdate(), ["replies"])) {
                await this._keyv.delete(dbComment.cid);
                if (dbComment.parentCid) await this._keyv.delete(dbComment.parentCid);
                debug(`Comment (${dbComment.cid}) IPNS is outdated`);
                const [sortedReplies, sortedRepliesCids] = await this.sortHandler.generatePagesUnderComment(dbComment, undefined);
                dbComment.setReplies(sortedReplies, sortedRepliesCids);
                dbComment.setUpdatedAt(timestamp());
                await this.dbHandler.upsertComment(dbComment, undefined);
                return dbComment.edit(dbComment.toJSONCommentUpdate());
            }
        };

        try {
            // @ts-ignore
            const dbComments: any = await this.dbHandler.queryComments(undefined);
            await Promise.all([...dbComments.map(async (comment) => syncComment(comment)), this.updateSubplebbitIpns()]);
        } catch (e) {
            debug(`Failed to sync due to error: ${e}`);
        }

        setTimeout(this.syncIpnsWithDb.bind(this, syncIntervalMs), syncIntervalMs);
    }

    async start(syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS) {
        await this.prePublish();
        if (!this.provideCaptchaCallback) {
            debug("Subplebbit owner has not provided any captcha. Will go with default image captcha");
            this.provideCaptchaCallback = this.defaultProvideCaptcha;
            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
        }
        assert(this.dbHandler, "A connection to a database is needed for the hosting a subplebbit");
        assert(this.pubsubTopic, "Pubsub topic need to defined before publishing");
        await this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.pubsubTopic, async (pubsubMessage) => {
            try {
                await this.processCaptchaPubsub(pubsubMessage);
            } catch (e) {
                e.message = "failed process captcha: " + e.message;
                debug(e);
            }
        });
        debug(`Waiting for publications on pubsub topic (${this.pubsubTopic})`);
        await this.syncIpnsWithDb(syncIntervalMs);
    }

    async stopPublishing() {
        this.removeAllListeners();
        await this.stop();
        await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic);
        this.dbHandler?.knex?.destroy();
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
    }
}
