// In this test we're gonna publish a couple of publications to the online sub we started in test-server.js
const Plebbit = require("../../dist/browser");
const { expect } = require("chai");
const { generateMockPost, createOnlinePlebbit } = require("../../dist/node/test/test-util");

// example of browser only tests

describe("plebbit.browserLibp2pJsPublish", () => {
    let subs;
    before(async () => {
        subs = await fetchTestServerSubs();
    });
    it("Can set browserLibp2pJsPublish in Plebbit correctly", async () => {
        const plebbit = await Plebbit({ browserLibp2pJsPublish: true });
        expect(plebbit.browserLibp2pJsPublish).to.be.true;
        expect(Object.keys(plebbit.clients.pubsubClients)).to.deep.equal(["browser-libp2p-pubsub"]);
        expect(plebbit.clients.pubsubClients["browser-libp2p-pubsub"]).to.deep.equal({}); // should not be initialized yet, only when we pubsub publish or subscribe

        JSON.stringify(plebbit); // Will throw an error if circular json
    });

    it(`Can publish a post to online sub and get a challenge back`, async () => {
        const onlinePlebbit = await createOnlinePlebbit({ browserLibp2pJsPublish: true });
        const post = await generateMockPost(subs.onlineSub, onlinePlebbit, false, {});

        await post.publish();

        await new Promise((resolve) =>
            post.once("challenge", () => {
                debugger;
            })
        );
    });
});
