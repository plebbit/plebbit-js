import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import { generateMockPost, getRemotePlebbitConfigs, publishWithExpectedResult } from "../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe(`comment.state - ${config.name}`, async () => {
        let plebbit, comment;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            comment = await generateMockPost(subplebbitAddress, plebbit);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`state is stopped by default`, async () => {
            expect(comment.state).to.equal("stopped");
        });

        it(`state changes to publishing after calling .publish()`, async () => {
            publishWithExpectedResult(comment, true);
            if (comment.publishingState !== "publishing")
                await new Promise((resolve) =>
                    comment.once("statechange", (state) => {
                        if (state === "publishing") resolve();
                    })
                );
        });

        it(`state changes to updating after calling .update()`, async () => {
            const tempComment = await plebbit.createComment({
                cid: (await plebbit.getSubplebbit(signers[0].address)).posts.pages.hot.comments[0].cid
            });
            await tempComment.update();
            expect(tempComment.state).to.equal("updating");
            await tempComment.stop();
        });
    });
});
