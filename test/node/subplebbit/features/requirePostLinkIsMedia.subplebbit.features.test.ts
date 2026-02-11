import {
    mockPlebbit,
    createSubWithNoChallenge,
    generateMockPost,
    publishWithExpectedResult,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { describe, it, beforeAll, afterAll } from "vitest";
import type { Plebbit } from "../../../../dist/node/plebbit/plebbit.js";
import type { LocalSubplebbit } from "../../../../dist/node/runtime/node/subplebbit/local-subplebbit.js";
import type { RpcLocalSubplebbit } from "../../../../dist/node/subplebbit/rpc-local-subplebbit.js";

describe.concurrent(`subplebbit.features.requirePostLinkIsMedia`, async () => {
    let plebbit: Plebbit;
    let remotePlebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    beforeAll(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: async () => typeof subplebbit.updatedAt === "number" });
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it.sequential(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        await subplebbit.edit({ features: { ...subplebbit.features, requirePostLinkIsMedia: true } });

        expect(subplebbit.features?.requirePostLinkIsMedia).to.be.true;
        const remoteSub = await remotePlebbit.getSubplebbit({ address: subplebbit.address });
        await remoteSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: remoteSub, predicate: async () => remoteSub.features?.requirePostLinkIsMedia === true });
        expect(remoteSub.features?.requirePostLinkIsMedia).to.be.true;
        await remoteSub.stop();
    });

    it(`Can't publish a post with link that isn't of a media`, async () => {
        const urlOfNotMedia = "https://google.com";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { link: urlOfNotMedia });
        expect(post.link).to.equal(urlOfNotMedia);
        await publishWithExpectedResult(post, false, messages.ERR_POST_LINK_IS_NOT_OF_MEDIA);
    });
    it(`Can publish a post with valid media link`, async () => {
        const validUrl = "https://img1.wsimg.com/isteam/ip/eb02f20b-e787-4a02-b188-d0fcbc250ba1/blob-6af1ead.png";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { link: validUrl });
        expect(post.link).to.equal(validUrl);
        await publishWithExpectedResult(post, true);
        expect(post.link).to.equal(validUrl);
    });
});
