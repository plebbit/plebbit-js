const { expect } = require("chai");
const testServerConfig = require("../test-server/config");
const WebSocketClient = require("rpc-websockets").Client;

const waitFor = async (callback) => {
    while (!Boolean(await callback())) {
        await new Promise((r) => setTimeout(r, 10));
    }
};

let webSocketClient;
let webSocketClientCall;
const subscriptionsMessages = {};

describe("plebbit-ws-server", () => {
    before(async () => {
        webSocketClient = new WebSocketClient(`ws://localhost:${testServerConfig.port}`);

        // wait for websocket connection to open
        await new Promise((resolve) => webSocketClient.on("open", resolve));

        // save all subscription messages (ie json rpc messages without 'id', also called json rpc 'notifications')
        // NOTE: it is possible to receive a subscription message before receiving the subscription id
        webSocketClient.socket.on("message", (jsonMessage) => {
            const message = JSON.parse(jsonMessage);
            const subscriptionId = message?.params?.subscription;
            if (subscriptionId) {
                if (!subscriptionsMessages[subscriptionId]) {
                    subscriptionsMessages[subscriptionId] = [];
                }
                // in production, don't keep all messages forever, expire them after some time
                subscriptionsMessages[subscriptionId].push(message);
            }
        });

        // util function for better error logs
        webSocketClientCall = async (...args) => {
            try {
                const res = await webSocketClient.call(...args);
                return res;
            } catch (e) {
                e.message = e.message + `: ${e.data}`;
                throw e;
            }
        };

        // debug raw JSON RPC messages in console (optional)
        webSocketClient.socket.on("message", (message) => console.log("from server:", message.toString()));
    });

    after(async () => {
        webSocketClient.close();
    });

    it("getComment", async () => {
        const commentCid = "comment cid";
        const comment = await webSocketClientCall("getComment", [{ cid: commentCid }]);
        expect(comment?.cid).to.equal(commentCid);
        expect(typeof comment?.timestamp).to.equal("number");
        expect(comment?.updatedAt).to.equal(undefined);
    });

    it("getSubplebbitPage", async () => {
        const pageCid = "pageCid";
        const subplebbitAddress = "subplebbit address";
        const page = await webSocketClientCall("getSubplebbitPage", [{ cid: pageCid, subplebbitAddress }]);
        expect(typeof page?.nextCid).to.equal("string");
        expect(page?.comments?.length).to.be.greaterThan(0);
    });

    it("createSubplebbit", async () => {
        const createSubplebbitOptions = {
            title: "title",
            description: "description"
        };
        const subplebbit = await webSocketClientCall("createSubplebbit", [createSubplebbitOptions]);
        expect(typeof subplebbit?.address).to.equal("string");
        expect(subplebbit?.title).to.equal(createSubplebbitOptions.title);
        expect(subplebbit?.description).to.equal(createSubplebbitOptions.description);
    });

    it("startSubplebbit", async () => {
        const subplebbitAddress = "subplebbit address " + Math.random();
        const subscriptionId = await webSocketClientCall("startSubplebbit", [{ address: subplebbitAddress }]);
        expect(subscriptionId).to.be.a("number");

        // try to start the same sub again but fail
        let error;
        try {
            await webSocketClientCall("startSubplebbit", [{ address: subplebbitAddress }]);
        } catch (e) {
            error = e;
        }
        expect(error?.message).to.include(`subplebbit '${subplebbitAddress}' already started`);
    });

    it("stopSubplebbit", async () => {
        const subplebbitAddress = "started subplebbit address";
        const res = await webSocketClientCall("stopSubplebbit", [{ address: subplebbitAddress }]);
        expect(res).to.equal(true);
    });

    it("editSubplebbit", async () => {
        const createSubplebbitOptions = {
            title: "title",
            description: "description"
        };
        const subplebbit = await webSocketClientCall("createSubplebbit", [createSubplebbitOptions]);
        expect(typeof subplebbit?.address).to.equal("string");
        expect(subplebbit?.title).to.equal(createSubplebbitOptions.title);
        expect(subplebbit?.description).to.equal(createSubplebbitOptions.description);

        const editSubplebbitOptions = {
            title: "edited title"
        };
        const editedSubplebbit = await webSocketClientCall("editSubplebbit", [subplebbit.address, editSubplebbitOptions]);
        expect(editedSubplebbit?.title).to.equal(editSubplebbitOptions.title);
        expect(editedSubplebbit?.description).to.equal(createSubplebbitOptions.description);

        // edit the sub back to previous so it works when tests run multiple times with the same server instance
        const editedSubplebbit2 = await webSocketClientCall("editSubplebbit", [subplebbit.address, createSubplebbitOptions]);
        expect(editedSubplebbit2?.title).to.equal(createSubplebbitOptions.title);
        expect(editedSubplebbit2?.description).to.equal(createSubplebbitOptions.description);
    });

    it("deleteSubplebbit", async () => {
        const subplebbit = await webSocketClientCall("createSubplebbit", []);
        expect(typeof subplebbit?.address).to.equal("string");

        // sub is in listSubplebbits
        let res = await webSocketClientCall("listSubplebbits", []);
        expect(res.includes(subplebbit.address)).to.equal(true);

        // delete sub
        res = await webSocketClientCall("deleteSubplebbit", [{ address: subplebbit.address }]);
        expect(res).to.equal(true);

        // sub was deleted, is no longer in listSubplebbits
        res = await webSocketClientCall("listSubplebbits", []);
        expect(res.includes(subplebbit.address)).to.equal(false);

        // try to delete the deleted sub again
        let error;
        try {
            await webSocketClientCall("deleteSubplebbit", [subplebbit.address]);
        } catch (e) {
            error = e;
        }
        expect(error?.message).to.include(`not found in plebbit.listSubplebbits()`);

        // try to delete a sub that doesn't exist
        try {
            await webSocketClientCall("deleteSubplebbit", [{ address: `doesn't exist` }]);
        } catch (e) {
            error = e;
        }
        expect(error?.message).to.include(`not found in plebbit.listSubplebbits()`);
    });

    it("deleteSubplebbit started subplebbit", async () => {
        const subplebbit = await webSocketClientCall("createSubplebbit", []);
        expect(typeof subplebbit?.address).to.equal("string");

        // sub is in listSubplebbits
        let res = await webSocketClientCall("listSubplebbits", []);
        expect(res.includes(subplebbit.address)).to.equal(true);

        // start the sub
        res = await webSocketClientCall("startSubplebbit", [subplebbit.address]);
        expect(res).to.be.a("number");

        // delete sub
        res = await webSocketClientCall("deleteSubplebbit", [{ address: subplebbit.address }]);
        expect(res).to.equal(true);

        // sub was deleted, is no longer in listSubplebbits
        res = await webSocketClientCall("listSubplebbits", []);
        expect(res.includes(subplebbit.address)).to.equal(false);
    });

    it("listSubplebbits", async () => {
        const subplebbits = await webSocketClientCall("listSubplebbits", []);
        expect(subplebbits?.[0]).to.equal("list subplebbit address 1");
        expect(subplebbits?.[1]).to.equal("list subplebbit address 2");
    });

    it("fetchCid", async () => {
        const cid = "statscid";
        const res = await webSocketClientCall("fetchCid", [{ cid }]);
        expect(res).to.equal('{"hourActiveUserCount":1}');
    });

    it("commentUpdate", async () => {
        const commentCid = "comment cid";
        const commentIpns = "comment ipns";
        const subscriptionId = await webSocketClientCall("commentUpdate", [commentCid, commentIpns]);
        expect(typeof subscriptionId).to.equal("number");

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 3);

        expect(subscriptionsMessages[subscriptionId][0].method).to.equal("commentUpdate");
        expect(subscriptionsMessages[subscriptionId][0].params.event).to.equal("updatingstatechange");
        expect(subscriptionsMessages[subscriptionId][0].params.result).to.equal("fetching-ipfs");

        expect(subscriptionsMessages[subscriptionId][1].method).to.equal("commentUpdate");
        expect(subscriptionsMessages[subscriptionId][1].params.event).to.equal("update");
        expect(subscriptionsMessages[subscriptionId][1].params.result.cid).to.equal(commentCid);

        const unsubscribed = await webSocketClientCall("unsubscribe", [subscriptionId]);
        expect(unsubscribed).to.equal(true);
    });

    it("subplebbitUpdate", async () => {
        const subplebbitAddress = "subplebbit address";
        const subscriptionId = await webSocketClientCall("subplebbitUpdate", [{ address: subplebbitAddress }]);
        expect(typeof subscriptionId).to.equal("number");

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 3);

        expect(subscriptionsMessages[subscriptionId][0].method).to.equal("subplebbitUpdate");
        expect(subscriptionsMessages[subscriptionId][0].params.event).to.equal("updatingstatechange");
        expect(subscriptionsMessages[subscriptionId][0].params.result).to.equal("fetching-ipns");

        expect(subscriptionsMessages[subscriptionId][1].method).to.equal("subplebbitUpdate");
        expect(subscriptionsMessages[subscriptionId][1].params.event).to.equal("update");
        expect(subscriptionsMessages[subscriptionId][1].params.result.address).to.equal(subplebbitAddress);

        const unsubscribed = await webSocketClientCall("unsubscribe", [subscriptionId]);
        expect(unsubscribed).to.equal(true);
    });

    it("publishComment", async () => {
        const createCommentOptions = {
            timestamp: 1000,
            content: "content",
            title: "title"
        };
        const subscriptionId = await webSocketClientCall("publishComment", [createCommentOptions]);
        expect(typeof subscriptionId).to.equal("number");

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 2);

        expect(subscriptionsMessages[subscriptionId][0].method).to.equal("publishComment");
        expect(subscriptionsMessages[subscriptionId][0].params.event).to.equal("publishingstatechange");
        expect(subscriptionsMessages[subscriptionId][0].params.result).to.equal("publishing-challenge-request");

        expect(subscriptionsMessages[subscriptionId][1].method).to.equal("publishComment");
        expect(subscriptionsMessages[subscriptionId][1].params.event).to.equal("publishingstatechange");
        expect(subscriptionsMessages[subscriptionId][1].params.result).to.equal("waiting-challenge-answers");

        expect(subscriptionsMessages[subscriptionId][2].method).to.equal("publishComment");
        expect(subscriptionsMessages[subscriptionId][2].params.event).to.equal("challenge");
        expect(subscriptionsMessages[subscriptionId][2].params.result.challenges[0].type).to.equal("text");

        const publishChallengeAnswers = await webSocketClientCall("publishChallengeAnswers", [subscriptionId, ["4"]]);
        expect(publishChallengeAnswers).to.equal(true);

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 4);

        expect(subscriptionsMessages[subscriptionId][5].method).to.equal("publishComment");
        expect(subscriptionsMessages[subscriptionId][5].params.event).to.equal("challengeverification");
        expect(subscriptionsMessages[subscriptionId][5].params.result.challengeSuccess).to.equal(true);
    });

    it("publishVote", async () => {
        const createVoteOptions = {
            commentCid: "comment cid",
            vote: 1
        };
        const subscriptionId = await webSocketClientCall("publishVote", [createVoteOptions]);
        expect(typeof subscriptionId).to.equal("number");

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 2);

        expect(subscriptionsMessages[subscriptionId][0].method).to.equal("publishVote");
        expect(subscriptionsMessages[subscriptionId][0].params.event).to.equal("publishingstatechange");
        expect(subscriptionsMessages[subscriptionId][0].params.result).to.equal("publishing-challenge-request");

        expect(subscriptionsMessages[subscriptionId][1].method).to.equal("publishVote");
        expect(subscriptionsMessages[subscriptionId][1].params.event).to.equal("publishingstatechange");
        expect(subscriptionsMessages[subscriptionId][1].params.result).to.equal("waiting-challenge-answers");

        expect(subscriptionsMessages[subscriptionId][2].method).to.equal("publishVote");
        expect(subscriptionsMessages[subscriptionId][2].params.event).to.equal("challenge");
        expect(subscriptionsMessages[subscriptionId][2].params.result.challenges[0].type).to.equal("text");

        const publishChallengeAnswers = await webSocketClientCall("publishChallengeAnswers", [subscriptionId, ["4"]]);
        expect(publishChallengeAnswers).to.equal(true);

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 4);

        expect(subscriptionsMessages[subscriptionId][5].method).to.equal("publishVote");
        expect(subscriptionsMessages[subscriptionId][5].params.event).to.equal("challengeverification");
        expect(subscriptionsMessages[subscriptionId][5].params.result.challengeSuccess).to.equal(true);
    });

    it("publishCommentEdit", async () => {
        const createCommentEditOptions = {
            commentCid: "comment cid",
            vote: 1
        };
        const subscriptionId = await webSocketClientCall("publishCommentEdit", [createCommentEditOptions]);
        expect(typeof subscriptionId).to.equal("number");

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 2);

        expect(subscriptionsMessages[subscriptionId][0].method).to.equal("publishCommentEdit");
        expect(subscriptionsMessages[subscriptionId][0].params.event).to.equal("publishingstatechange");
        expect(subscriptionsMessages[subscriptionId][0].params.result).to.equal("publishing-challenge-request");

        expect(subscriptionsMessages[subscriptionId][1].method).to.equal("publishCommentEdit");
        expect(subscriptionsMessages[subscriptionId][1].params.event).to.equal("publishingstatechange");
        expect(subscriptionsMessages[subscriptionId][1].params.result).to.equal("waiting-challenge-answers");

        expect(subscriptionsMessages[subscriptionId][2].method).to.equal("publishCommentEdit");
        expect(subscriptionsMessages[subscriptionId][2].params.event).to.equal("challenge");
        expect(subscriptionsMessages[subscriptionId][2].params.result.challenges[0].type).to.equal("text");

        const publishChallengeAnswers = await webSocketClientCall("publishChallengeAnswers", [subscriptionId, ["4"]]);
        expect(publishChallengeAnswers).to.equal(true);

        // wait for all subscription messages to arrive
        await waitFor(() => subscriptionsMessages[subscriptionId]?.length > 4);

        expect(subscriptionsMessages[subscriptionId][5].method).to.equal("publishCommentEdit");
        expect(subscriptionsMessages[subscriptionId][5].params.event).to.equal("challengeverification");
        expect(subscriptionsMessages[subscriptionId][5].params.result.challengeSuccess).to.equal(true);
    });

    it("getPlebbitOptions", async () => {
        let res = await webSocketClientCall("getPlebbitOptions", []);
        expect(res).to.deep.equal({});
        const newPlebbitOptions = {
            ipfsGatewayUrls: ["https://cloudflare-ipfs.com"]
        };
        res = await webSocketClientCall("setPlebbitOptions", [newPlebbitOptions]);
        expect(res).to.equal(true);
        res = await webSocketClientCall("getPlebbitOptions", []);
        expect(res).to.deep.equal(newPlebbitOptions);

        // restore to default options so tests can work with the same server
        await webSocketClientCall("setPlebbitOptions", [{}]);
        res = await webSocketClientCall("getPlebbitOptions", []);
        expect(res).to.deep.equal({});
    });
});
