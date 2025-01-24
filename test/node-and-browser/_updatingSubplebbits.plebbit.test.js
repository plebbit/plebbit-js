import { getRemotePlebbitConfigs, resolveWhenConditionIsTrue } from "../../dist/node/test/test-util.js";
import signers from "../fixtures/signers";
import { expect } from "chai";

const subplebbitAddress = signers[0].address;
getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit._updatingSubplebbits - ${config.name}`, async () => {
        it(`A single subplebbit instance updating will set up plebbit._updatingSubplebbit. Calling stop should clean up all subscriptions and remove plebbit._updatingSubplebbits`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;

            await sub.update();
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.a("object");

            await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.a("object");

            await sub.stop();

            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;
        });

        it(`Multiple subplebbit instances (same address) updating. Calling stop on all of them should clean all subscriptions and remove plebbit._updatingSubplebbits`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const sub1 = await plebbit.createSubplebbit({ address: subplebbitAddress });
            const sub2 = await plebbit.createSubplebbit({ address: subplebbitAddress });
            const sub3 = await plebbit.createSubplebbit({ address: subplebbitAddress });

            await sub1.update();
            await sub2.update();
            await sub3.update();

            await Promise.all([sub1, sub2, sub3].map((sub) => resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number")));

            // all subs have received an update event now
            expect(plebbit._updatingSubplebbits[subplebbitAddress].updatedAt).to.be.a("number");
            expect(plebbit._updatingSubplebbits[subplebbitAddress].state).to.equal("updating");

            expect(plebbit._updatingSubplebbits[subplebbitAddress].listenerCount("update")).to.equal(3);

            await sub1.stop();

            expect(plebbit._updatingSubplebbits[subplebbitAddress].listenerCount("update")).to.equal(2);

            await sub2.stop();

            expect(plebbit._updatingSubplebbits[subplebbitAddress].listenerCount("update")).to.equal(1);

            await sub3.stop();

            await new Promise((resolve) => setTimeout(resolve, 1000));

            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;
        });

        it(`Creating a new sub instance when it's already been updating before should give us latest SubplebbitIpfs on the created sub instance`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const sub1 = await plebbit.createSubplebbit({ address: subplebbitAddress });
            await sub1.update();
            await resolveWhenConditionIsTrue(sub1, () => typeof sub1.updatedAt === "number");

            const sub2 = await plebbit.createSubplebbit({ address: subplebbitAddress });
            expect(sub2.updatedAt).to.be.a("number");

            await sub1.stop();
            await new Promise((resolve) => setTimeout(resolve, 500));
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;
        });

        it(`A single instance fetched with plebbit.getSubplebbit should not keep plebbit._updatingSubplebbits[address]`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            expect(sub.updatedAt).to.be.a("number");
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;
        });

        it(`Comment instance can fetch updates from plebbit._updatingSubplebbits. Calling comment.stop will clean subscriptions and remove plebbit._updatingSubplebbits`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;

            const commentCid = sub.posts.pages.hot.comments[0].cid;
            const comment1 = await plebbit.createComment({ cid: commentCid });
            await comment1.update();
            await resolveWhenConditionIsTrue(comment1, () => typeof comment1.updatedAt === "number");
            expect(plebbit._updatingSubplebbits[subplebbitAddress].listenerCount("update")).to.equal(1);

            await comment1.stop();
            const updatingSubInstance = plebbit._updatingSubplebbits[subplebbitAddress];
            expect(updatingSubInstance).to.be.undefined;
        });

        it(`Multiple comment instances of the same sub updating. Calling stop on all of them should clean all subscriptions and remove plebbit._updatingSubplebbits`, async () => {
            const plebbit = await config.plebbitInstancePromise();
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;
            const sub = await plebbit.getSubplebbit(subplebbitAddress);
            // await new Promise((resolve) => setTimeout(resolve, 300));
            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;

            const commentCid = sub.posts.pages.hot.comments[0].cid;
            const comment1 = await plebbit.createComment({ cid: commentCid });
            const comment2 = await plebbit.createComment({ cid: commentCid });

            await comment1.update();
            await resolveWhenConditionIsTrue(comment1, () => typeof comment1.updatedAt === "number");
            expect(comment1._subplebbitForUpdating).to.be.a("object");
            expect(plebbit._updatingSubplebbits[subplebbitAddress].listenerCount("update")).to.equal(1);

            await comment2.update();
            await resolveWhenConditionIsTrue(comment2, () => typeof comment2.updatedAt === "number");
            expect(comment1._subplebbitForUpdating).to.be.a("object");

            expect(plebbit._updatingSubplebbits[subplebbitAddress].listenerCount("update")).to.equal(2);

            await comment1.stop();

            expect(plebbit._updatingSubplebbits[subplebbitAddress].listenerCount("update")).to.equal(1);

            await comment2.stop();

            expect(plebbit._updatingSubplebbits[subplebbitAddress]).to.be.undefined;
        });
    });
});
