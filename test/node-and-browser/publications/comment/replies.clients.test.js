import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import { mockRemotePlebbit, mockGatewayPlebbit, describeSkipIfRpc, describeIfRpc } from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describe(`comment.replies.clients`, async () => {
    let plebbit, gatewayPlebbit;
    let commentCid;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();

        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        commentCid = subplebbit.posts.pages.hot.comments.find((comment) => comment.replyCount > 0).cid;
        expect(commentCid).to.be.a("string");
    });
    describeSkipIfRpc(`comment.replies.clients.kuboRpcClients`, async () => {
        it(`comment.replies.clients.kuboRpcClients is {} for gateway plebbit`, async () => {
            const comment = await gatewayPlebbit.getComment(commentCid);
            const sortTypes = Object.keys(comment.replies.clients.kuboRpcClients);
            expect(sortTypes).to.deep.equal(["topAll", "new", "controversialAll", "old"]);

            for (const sortType of sortTypes) expect(comment.replies.clients.kuboRpcClients[sortType]).to.deep.equal({}); // should be empty
        });

        it(`comment.replies.clients.kuboRpcClients[sortType][url] is stopped by default`, async () => {
            const comment = await plebbit.getComment(commentCid);
            const ipfsUrl = Object.keys(comment.clients.kuboRpcClients)[0];
            expect(Object.keys(comment.replies.clients.kuboRpcClients["new"]).length).to.equal(1);
            expect(comment.replies.clients.kuboRpcClients["new"][ipfsUrl].state).to.equal("stopped");
        });

        it(`Correct state of 'new' sort is updated after fetching from comment.replies.pageCids.new`, async () => {
            const comment = await plebbit.getComment(commentCid);
            await comment.update();
            await new Promise((resolve) => comment.once("update", resolve));
            const ipfsUrl = Object.keys(comment.clients.kuboRpcClients)[0];

            const expectedStates = ["fetching-ipfs", "stopped"];
            const actualStates = [];
            comment.replies.clients.kuboRpcClients["new"][ipfsUrl].on("statechange", (newState) => {
                actualStates.push(newState);
            });

            await comment.replies.getPage(comment.replies.pageCids.new);
            await comment.stop();
            expect(actualStates).to.deep.equal(expectedStates);
        });
    });

    describeSkipIfRpc(`comment.replies.clients.ipfsGateways`, async () => {
        it(`comment.replies.clients.ipfsGateways[sortType][url] is stopped by default`, async () => {
            const comment = await gatewayPlebbit.getComment(commentCid);
            const gatewayUrl = Object.keys(comment.clients.ipfsGateways)[0];
            // add tests here
            expect(Object.keys(comment.replies.clients.ipfsGateways["new"]).length).to.equal(1);
            expect(comment.replies.clients.ipfsGateways["new"][gatewayUrl].state).to.equal("stopped");
        });

        it(`Correct state of 'new' sort is updated after fetching from comment.replies.pageCids.new`, async () => {
            const comment = await gatewayPlebbit.getComment(commentCid);
            await comment.update();
            await new Promise((resolve) => comment.once("update", resolve));

            const gatewayUrl = Object.keys(comment.clients.ipfsGateways)[0];

            const expectedStates = ["fetching-ipfs", "stopped"];
            const actualStates = [];
            comment.replies.clients.ipfsGateways["new"][gatewayUrl].on("statechange", (newState) => {
                actualStates.push(newState);
            });

            await comment.replies.getPage(comment.replies.pageCids.new);
            await comment.stop();
            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct state of 'new' sort is correct after fetching from responsive and unresponsive gateway `, async () => {
            // RPC exception
            const gateways = [
                "http://localhost:13417", // This gateway will take 10s to respond
                "http://localhost:18080" // This one is immediate
            ];
            const multipleGatewayPlebbit = await Plebbit({ ipfsGatewayUrls: gateways, httpRoutersOptions: [] });

            const comment = await multipleGatewayPlebbit.getComment(commentCid);
            comment.update();
            if (!comment.updatedAt) await new Promise((resolve) => comment.once("update", resolve));
            await comment.stop();

            const expectedStates = {
                [gateways[0]]: [
                    "fetching-ipfs",
                    "stopped" // It stopped after fetching the IPFS
                ],
                [gateways[1]]: [
                    "fetching-ipfs",
                    "stopped" // It stopped after it was aborted
                ]
            };

            const actualStates = { [gateways[0]]: [], [gateways[1]]: [] };
            for (const gatewayUrl of gateways)
                comment.replies.clients.ipfsGateways["new"][gatewayUrl].on("statechange", (newState) => {
                    actualStates[gatewayUrl].push(newState);
                });

            multipleGatewayPlebbit._clientsManager.getGatewayTimeoutMs = () => 10 * 1000; // Change timeout to 10s
            const timeBefore = Date.now();
            await comment.replies.getPage(comment.replies.pageCids.new);
            const timeItTookInMs = Date.now() - timeBefore;
            expect(timeItTookInMs).to.be.lessThan(9000);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            expect(actualStates).to.deep.equal(expectedStates);
        });
    });

    describeIfRpc(`comment.replies.clients.plebbitRpcClients`, async () => {
        it(`comment.replies.clients.plebbitRpcClients[sortType][url] is stopped by default`, async () => {
            const comment = await plebbit.getComment(commentCid);
            const rpcUrl = Object.keys(comment.clients.plebbitRpcClients)[0];
            // add tests here
            expect(Object.keys(comment.replies.clients.plebbitRpcClients["new"]).length).to.equal(1);
            expect(comment.replies.clients.plebbitRpcClients["new"][rpcUrl].state).to.equal("stopped");
        });

        it(`Correct state of 'new' sort is updated after fetching from comment.replies.pageCids.new`, async () => {
            const comment = await plebbit.getComment(commentCid);
            await comment.update();
            await new Promise((resolve) => comment.once("update", resolve));
            if (!comment.updatedAt) await new Promise((resolve) => comment.once("update", resolve));

            const rpcUrl = Object.keys(comment.clients.plebbitRpcClients)[0];

            const expectedStates = ["fetching-ipfs", "stopped"];
            const actualStates = [];
            comment.replies.clients.plebbitRpcClients["new"][rpcUrl].on("statechange", (newState) => {
                actualStates.push(newState);
            });

            await comment.replies.getPage(comment.replies.pageCids.new);
            await comment.stop();
            expect(actualStates).to.deep.equal(expectedStates);
        });
    });
});
