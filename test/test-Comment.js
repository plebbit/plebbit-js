import Plebbit from "../src/index.js"
import {IPFS_CLIENT_CONFIGS, TEST_COMMENT_POST_CID} from "../secrets.js";
import assert from 'assert';
import {sleep, timestamp, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {REPLIES_SORT_TYPES} from "../src/SortHandler.js";
import {generateMockComment, generateMockPost} from "./MockUtil.js";
import {signPublication, verifyPublication} from "../src/Signer.js";

const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});

const post = await clientPlebbit.getComment(TEST_COMMENT_POST_CID);

const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const subplebbit = await serverPlebbit.createSubplebbit({"address": post.subplebbitAddress});


const mockComments = [];
describe("Test Post and Comment", async function () {
    before(async () => await unsubscribeAllPubsubTopics([serverPlebbit.ipfsClient, clientPlebbit.ipfsClient]));
    before(async () => {
        subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null]);
        await subplebbit.start();
    });
    after(async () => await post.subplebbit.stopPublishing());

    it("Can sign and verify a comment with randomly generated key", async () => {
        const signer = await clientPlebbit.createSigner();
        const comment = {
            subplebbitAddress: post.subplebbitAddress,
            author: {address: signer.address},
            timestamp: timestamp(),
            title: "Test post signature",
            content: 'some content...',
        };
        const signature = await signPublication(comment, signer);
        const signedComment = {"signature": signature.toJSON(), ...comment};
        const [isVerified, failedVerificationReason] = await verifyPublication(signedComment);
        assert.equal(isVerified, true, "Verification of signed comment should be true");

    });

    it("Verification fails when signature is corrupted", async () => {
        const signer = await clientPlebbit.createSigner();
        const comment = {
            subplebbitAddress: post.subplebbitAddress,
            author: {address: signer.address},
            timestamp: timestamp(),
            title: "Test post signature",
            content: 'some content...',
        };
        const signature = await signPublication(comment, signer);
        signature.signature = signature.signature.slice(1); // Corrupt signature by deleting one character
        const signedComment = {...signature.toJSON(), ...comment};
        const [isVerified, failedVerificationReason] = await verifyPublication(signedComment);
        assert.equal(isVerified, false, "Verification of signed comment should be since signature is corrupted");

    });

    it("Can sign and verify a comment with an imported key", async () => {
        const privateKeyPem =
            `-----BEGIN PRIVATE KEY-----
            MIIBVgIBADANBgkqhkiG9w0BAQEFAASCAUAwggE8AgEAAkEAq7BFUpkGp3+LQmlQ
            Yx2eqzDV+xeG8kx/sQFV18S5JhzGeIJNA72wSeukEPojtqUyX2J0CciPBh7eqclQ
            2zpAswIDAQABAkAgisq4+zRdrzkwH1ITV1vpytnkO/NiHcnePQiOW0VUybPyHoGM
            /jf75C5xET7ZQpBe5kx5VHsPZj0CBb3b+wSRAiEA2mPWCBytosIU/ODRfq6EiV04
            lt6waE7I2uSPqIC20LcCIQDJQYIHQII+3YaPqyhGgqMexuuuGx+lDKD6/Fu/JwPb
            5QIhAKthiYcYKlL9h8bjDsQhZDUACPasjzdsDEdq8inDyLOFAiEAmCr/tZwA3qeA
            ZoBzI10DGPIuoKXBd3nk/eBxPkaxlEECIQCNymjsoI7GldtujVnr1qT+3yedLfHK
            srDVjIT3LsvTqw==
            -----END PRIVATE KEY-----`;
        const publicKeyPem =
            "-----BEGIN PUBLIC KEY-----\n" +
            "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKuwRVKZBqd/i0JpUGMdnqsw1fsXhvJM\n" +
            "f7EBVdfEuSYcxniCTQO9sEnrpBD6I7alMl9idAnIjwYe3qnJUNs6QLMCAwEAAQ==\n" +
            "-----END PUBLIC KEY-----\n";
        const signer = await clientPlebbit.createSigner({"privateKey": privateKeyPem, 'type': 'rsa'});
        const comment = {
            subplebbitAddress: post.subplebbitAddress,
            author: {address: signer.address},
            timestamp: timestamp(),
            title: "Test post signature",
            content: 'some content...',
        };
        const signature = await signPublication(comment, signer);
        const signedComment = {"signature": signature.toJSON(), ...comment};
        const [isVerified, failedVerificationReason] = await verifyPublication(signedComment);
        assert.equal(isVerified, true, "Verification of signed comment should be true");
        assert.equal(signedComment.signature.publicKey, publicKeyPem, "Generated public key should be same as provided");
    });

    it("Can publish a post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(subplebbit.address, clientPlebbit);

            await subplebbit.update();
            const originalLatestPostCid = subplebbit.latestPostCid;
            await mockPost.publish();
            mockPost.once("challengeverification", ([challengeVerificationMessage, mockPostWithUpdates]) => {
                subplebbit.once("update", updatedSubplebbit => {
                    assert.equal(mockPost.previousCid, originalLatestPostCid, "Failed to set previousPostCid");
                    assert.equal(mockPost.cid, updatedSubplebbit.latestPostCid, "Failed to set subplebbit.latestPostCid");
                    mockComments.push(mockPost);
                    resolve();
                });


            });
        });
    });

    it("Can edit a comment", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "edit test";
            const editReason = "To test editing a comment";
            const commentToBeEdited = mockComments[0];
            await commentToBeEdited.update();

            const originalContent = commentToBeEdited.content;
            const commentEdit = await clientPlebbit.createCommentEdit({
                "subplebbitAddress": commentToBeEdited.subplebbitAddress,
                "commentCid": commentToBeEdited.cid,
                "editReason": editReason,
                "content": editedText,
                "signer": commentToBeEdited.signer,
            });
            await commentEdit.publish();
            commentEdit.once("challengeverification", async ([challengeVerificationMessage, updatedCommentEdit]) => {
                subplebbit.once("update", async () => {
                    commentToBeEdited.once("update", async updatedCommentToBeEdited => {
                        assert.equal(updatedCommentToBeEdited.content, editedText, "Comment has not been edited");
                        assert.equal(updatedCommentToBeEdited.originalContent, originalContent, "Original content should be preserved");
                        assert.equal(updatedCommentToBeEdited.editReason, editReason, "Edit reason has not been updated");
                        resolve();
                    });
                    await commentToBeEdited.update();
                });
            });
        });
    });

    it(`Can edit an edited comment`, async () => {
        return new Promise(async (resolve, reject) => {
            const editedText = "Double edit test";
            const editReason = "To test double editing a comment";
            const commentToBeEdited = mockComments[0];
            await commentToBeEdited.update();
            const originalContent = commentToBeEdited.originalContent;
            const commentEdit = await clientPlebbit.createCommentEdit({
                "subplebbitAddress": commentToBeEdited.subplebbitAddress,
                "commentCid": commentToBeEdited.cid,
                "editReason": editReason,
                "content": editedText,
                "signer": commentToBeEdited.signer,
            });
            await commentEdit.publish();
            commentEdit.once("challengeverification", async ([challengeVerificationMessage, updatedCommentEdit]) => {
                commentToBeEdited.once("update", async (updatedCommentToBeEdited) => {
                    assert.equal(updatedCommentToBeEdited.content, editedText, "Comment has not been edited");
                    assert.equal(updatedCommentToBeEdited.originalContent, originalContent, "Original content should be preserved");
                    assert.equal(updatedCommentToBeEdited.editReason, editReason, "Edit reason has not been updated");
                    resolve();
                });
            });
        });
    });

    it("Fails to edit a comment if not authorized", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "This should fail";
            const editReason = "To test whether editing a comment fails";
            const commentToBeEdited = mockComments[0];
            await commentToBeEdited.update();
            const commentEdit = await clientPlebbit.createCommentEdit({
                "subplebbitAddress": commentToBeEdited.subplebbitAddress,
                "commentCid": commentToBeEdited.cid,
                "editReason": editReason,
                "content": editedText,
                "signer": await clientPlebbit.createSigner(), // Create a new signer, different than the signer of the original comment
            });
            await commentEdit.publish();
            commentEdit.once("challengeverification", async ([challengeVerificationMessage, updatedCommentEdit]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Editing a comment should fail if signer of CommentEdit is different than original comment");
                if (!challengeVerificationMessage.reason)
                    assert.fail(`Should include a reason for refusing publication of a comment edit`);
                await commentToBeEdited.update();
                assert.notEqual(commentToBeEdited.content, editedText, "edited content should not be edited if user is not authorized");
                assert.notEqual(commentToBeEdited.editReason, editReason, "Edit reason should not be edited if user is not authorized");
                resolve();
            });
        });

    });


    [1, 2, 3, 4].map(depth => it(`Can publish comment with depth = ${depth}`, async () => {
        return new Promise(async (resolve, reject) => {
            await sleep(100000); // Wait for IPNS changes to populate
            const parentComment = mockComments[depth - 1];
            const mockComment = await generateMockComment(parentComment, clientPlebbit);
            await parentComment.update();
            assert.equal(Boolean(parentComment.updatedAt), true, "Comment IPNS hasn't been propagated");
            const originalReplyCount = parentComment.replyCount;
            await mockComment.publish();
            parentComment.once("update", async updatedParentComment => {
                assert.equal(mockComment.parentCid, updatedParentComment.cid);
                assert.equal(mockComment.depth, depth, `Depth of comment should be ${depth}`);
                const parentLatestCommentCid = (await updatedParentComment.replies.getPage(updatedParentComment.replies.pageCids[REPLIES_SORT_TYPES.NEW.type])).comments[0].cid;
                assert.equal(parentLatestCommentCid, mockComment.cid);
                assert.equal(updatedParentComment.replyCount, originalReplyCount + 1);
                mockComments.push(mockComment);
                resolve();
                // mockComment.once("update", () => resolve());
            });

        });

    }));


    it("Publishing a comment with invalid signature fails", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post, clientPlebbit);
            mockComment.signature.signature = mockComment.signature.signature.slice(1); // Corrupts signature by deleting one key
            await mockComment.publish();
            mockComment.once("challengeverification", async ([challengeVerificationMessage, updatedComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Challenge should not succeed if comment signature is invalid");
                assert.equal(challengeVerificationMessage.reason, "Invalid signature", "There should be an error message that tells the user that comment's signature is invalid");
                resolve();
            });
        });

    });


});