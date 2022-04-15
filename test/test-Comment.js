import {Plebbit} from "../src/index.js"
import {IPFS_CLIENT_CONFIGS, TEST_COMMENT_POST_CID} from "../secrets.js";
import assert from 'assert';
import {loadIpfsFileAsJson, timestamp, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {SORTED_COMMENTS_TYPES} from "../src/SortHandler.js";
import {generateMockComment} from "./MockUtil.js";
import {signPublication, verifyPublication} from "../src/Signer.js";

const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});

const post = await clientPlebbit.getPostOrComment(TEST_COMMENT_POST_CID);

const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const subplebbit = await serverPlebbit.createSubplebbit({"subplebbitAddress": post.subplebbitAddress});


const mockComments = [];
describe("Test Post and Comment", async function () {
    before(async () => await unsubscribeAllPubsubTopics([serverPlebbit.ipfsClient, clientPlebbit.ipfsClient]));
    before(async () => {
        subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null]);
        await subplebbit.startPublishing();
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


    it("Can publish new comment under post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post, clientPlebbit);
            await post.update();
            const originalReplyCount = post.replyCount;

            await mockComment.publish();
            post.once("update", async updatedPost => {
                const loadedComment = await clientPlebbit.getPostOrComment(mockComment.commentCid);
                loadedComment.once("update", async updatedMockComment => {
                    assert.equal(updatedMockComment.depth, 1, "Depth of comment under post should be 1");


                    const latestCommentCid = (await loadIpfsFileAsJson(updatedPost.sortedRepliesCids[SORTED_COMMENTS_TYPES.NEW], clientPlebbit.ipfsClient)).comments[0].commentCid;
                    assert.equal(latestCommentCid, updatedMockComment.commentCid);
                    assert.equal(post.replyCount, originalReplyCount + 1, "Failed to update reply count");
                    mockComments.push(mockComment);
                    resolve();

                });
                loadedComment.update();

            });
        });
    });

    it("Publishing a comment with invalid signature fails", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post, clientPlebbit);
            mockComment.signature.signature = mockComment.signature.signature.slice(1);
            await mockComment.publish();
            mockComment.once("challengeverification", async ([challengeVerificationMessage, updatedComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Challenge should not succeed if comment signature is invalid");
                assert.equal(challengeVerificationMessage.reason, "Invalid signature", "There should be an error message that tells the user that comment's signature is invalid");
                resolve();
            });
        });

    });

    it("Can edit a comment", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "edit test";
            await mockComments[0].update();
            const commentEdit = await clientPlebbit.createCommentEdit({
                ...mockComments[0].toJSON(),
                "editedContent": editedText
            });
            await commentEdit.publish();
            commentEdit.once("challengeverification", async ([challengeVerificationMessage, updatedCommentEdit]) => {
                mockComments[0].once("update", async updatedComment => {
                    const loadedPost = await clientPlebbit.getPostOrComment(mockComments[0].commentCid);
                    await loadedPost.update();
                    assert.equal(updatedComment.editedContent, editedText, "Comment has not been edited");
                    resolve();
                });


            });
        });
    });


    it("Can publish new comments under comment", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(mockComments[0], clientPlebbit);
            await mockComments[0].update();
            const originalReplyCount = mockComments[0].replyCount;
            await mockComment.publish();
            mockComments[0].once("update", async updatedParentComment => {
                assert.equal(mockComment.parentCid, updatedParentComment.commentCid);
                assert.equal(mockComment.depth, 2, "Depth of comment under a comment should be 2");
                const parentLatestCommentCid = (await loadIpfsFileAsJson(updatedParentComment.sortedRepliesCids[SORTED_COMMENTS_TYPES.NEW], clientPlebbit.ipfsClient)).comments[0].commentCid;
                assert.equal(parentLatestCommentCid, mockComment.commentCid);
                assert.equal(updatedParentComment.replyCount, originalReplyCount + 1);
                mockComments.push(mockComment);
                resolve();
            });
        });
    });
});