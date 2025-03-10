import {
    mockPlebbit,
    createSubWithNoChallenge,
    generateMockPost,
    overrideCommentInstancePropsAndSign,
    publishWithExpectedResult,
    mockRemotePlebbitIpfsOnly,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util";
import { messages } from "../../../dist/node/errors";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`subplebbit.features.requirePostLink`, async () => {
    let plebbit, remotePlebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbitIpfsOnly();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
    });

    after(async () => {
        await subplebbit.delete();
    });

    it(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        const oldUpdatedAt = subplebbit.updatedAt;
        await subplebbit.edit({ features: { ...subplebbit.features, requirePostLink: true } });
        expect(subplebbit.features.requirePostLink).to.be.true;

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt !== oldUpdatedAt); // that means we published a new update
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        expect(remoteSub.features.requirePostLink).to.be.true;
    });

    it(`Can't publish a post with invalid link`, async () => {
        const invalidUrl = "test.com"; // invalid because it has no protocol
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false);
        await overrideCommentInstancePropsAndSign(post, { link: invalidUrl });
        expect(post.link).to.equal(invalidUrl);
        await publishWithExpectedResult(post, false, messages.ERR_POST_HAS_INVALID_LINK_FIELD);
    });
    it(`Can publish a post with valid link`, async () => {
        const validUrl = "https://google.com";
        const post = await generateMockPost(subplebbit.address, remotePlebbit, false, { link: validUrl });
        await publishWithExpectedResult(post, true);
        expect(post.link).to.equal(validUrl);
    });
});

describe(`subplebbit.features.requirePostLinkIsMedia`, async () => {
    let plebbit, remotePlebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbitIpfsOnly();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
    });

    after(async () => {
        await subplebbit.delete();
    });

    it(`Feature is updated correctly in props`, async () => {
        expect(subplebbit.features).to.be.undefined;
        const oldUpdatedAt = subplebbit.updatedAt;
        await subplebbit.edit({ features: { ...subplebbit.features, requirePostLinkIsMedia: true } });
        expect(subplebbit.features.requirePostLinkIsMedia).to.be.true;
        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt !== oldUpdatedAt); // that means we published a new update
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        expect(remoteSub.features.requirePostLinkIsMedia).to.be.true;
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
