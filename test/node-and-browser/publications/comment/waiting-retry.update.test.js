import {
    itSkipIfRpc,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs,
    mockPlebbitToReturnSpecificSubplebbit,
    mockCommentToNotUsePagesForUpdates,
    isPlebbitFetchingUsingGateways
} from "../../../../dist/node/test/test-util.js";
import signers from "../../../fixtures/signers.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

getRemotePlebbitConfigs().map((config) => {
    describe(`comment.update() waiting-retry - ${config.name}`, () => {
        itSkipIfRpc(`comment.update() emits waiting-retry and keeps retrying if CommentIpfs loading times out`, async () => {
            // Create a comment with a CID that doesn't exist or will time out
            const plebbit = await config.plebbitInstancePromise();
            const nonExistentCid = "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGzx"; // Random CID that doesn't exist
            const createdComment = await plebbit.createComment({ cid: nonExistentCid });

            plebbit._timeouts["comment-ipfs"] = 100; // reduce timeout to 100ms

            let updateHasBeenEmitted = false;
            createdComment.once("update", () => (updateHasBeenEmitted = true));

            const waitingRetries = [];
            createdComment.on("waiting-retry", (err) => waitingRetries.push(err));

            // Start the update process
            await createdComment.update();

            await resolveWhenConditionIsTrue(createdComment, () => waitingRetries.length === 3, "waiting-retry");

            await createdComment.stop();
            for (const waitingRetryErr of waitingRetries) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(waitingRetryErr.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_IPFS_FROM_GATEWAYS");
                    for (const gatewayUrl of Object.keys(plebbit.clients.ipfsGateways))
                        expect(waitingRetryErr.details.gatewayToError[gatewayUrl].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
                } else {
                    expect(waitingRetryErr.code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
                }
            }

            expect(createdComment.depth).to.be.undefined; // Make sure it did not use any props from CommentIpfs
            expect(createdComment.state).to.equal("stopped");
            expect(createdComment.updatedAt).to.be.undefined;
            expect(updateHasBeenEmitted).to.be.false;
        });

        itSkipIfRpc(`comment.update() emits waiting-retry and keeps retrying if Subplebbit is not loading`, async () => {
            const plebbit = await config.plebbitInstancePromise();

            const sub = await plebbit.createSubplebbit({ address: signers[0].address });

            const updatePromise1 = new Promise((resolve) => sub.once("update", resolve));
            await sub.update();
            // now plebbit._updatingSubplebbits will be defined
            await updatePromise1;
            const subRecord = JSON.parse(JSON.stringify(sub.toJSONIpfs()));

            const updatePromise2 = new Promise((resolve) => sub.once("update", resolve));
            await mockPlebbitToReturnSpecificSubplebbit(plebbit, sub.address, subRecord);
            await updatePromise2;
            const mockPost = await plebbit.createComment({ cid: sub.posts.pages.hot.comments[0].cid });

            const recordedWaitingRetries = [];

            mockPost.on("waiting-retry", (error) => recordedWaitingRetries.push(error));

            await mockPost.update();
            mockCommentToNotUsePagesForUpdates(mockPost);

            await resolveWhenConditionIsTrue(mockPost, () => recordedWaitingRetries.length === 3, "waiting-retry");

            await sub.stop();
            await mockPost.stop();

            for (const waitingRetryErr of recordedWaitingRetries) {
                expect(waitingRetryErr.code).to.equal("ERR_REMOTE_SUBPLEBBIT_RECEIVED_ALREADY_PROCCESSED_RECORD");
            }
        });
    });
});
