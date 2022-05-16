import {IPFS_CLIENT_CONFIGS} from "../secrets.js";
import assert from 'assert';
import Plebbit from "../src/index.js"
import {
    unsubscribeAllPubsubTopics
} from "../src/Util.js";

const startTestTime = Date.now() / 1000;
const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});
let subplebbit;

const mockPosts = [];
describe("Test Subplebbit functionality", async () => {

    before(async () => {
        await unsubscribeAllPubsubTopics([serverPlebbit.ipfsClient, clientPlebbit.ipfsClient]);
    });
    after(async () => await subplebbit.stopPublishing()); // Stop publishing once we're done with tests


    it("New subplebbits can be published", async function () {
        const signer = await serverPlebbit.createSigner();
        subplebbit = await serverPlebbit.createSubplebbit({
            "signer": signer,
            "title": `Test subplebbit - ${startTestTime}`
        });

        await subplebbit.start();
        // Should have address
        const loadedSubplebbit = await clientPlebbit.getSubplebbit(subplebbit.address);
        assert.equal(JSON.stringify(loadedSubplebbit), JSON.stringify(subplebbit), "Failed to publish new subplebbit");
    });

    it("Throws an error when publishing a duplicate post", async function () {
        return new Promise(async (resolve, reject) => {
            const post = await clientPlebbit.createComment(mockPosts[0].toJSONSkeleton());
            subplebbit.setProvideCaptchaCallback(() => [null, null]);

            await post.publish(null);
            post.once("challengeverification", ([challengeVerificationMessage, newComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Challenge should not succeed if post is a duplicate");
                assert.equal(challengeVerificationMessage.reason, "Failed to insert post due to previous post having same ipns key name (duplicate?)", "There should be an error message that tells the user they posted a duplicate");
                resolve();
            });
        });
    });

});