import { expect } from "chai";
import signers from "../../../fixtures/signers.js";

import { describeSkipIfRpc, mockGatewayPlebbit, getRemotePlebbitConfigs, addStringToIpfs } from "../../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;

const clientsFieldName = {
    "remote-kubo-rpc": "kuboRpcClients",
    "remote-libp2pjs": "libp2pJsClients"
};

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    const clientFieldName = clientsFieldName[config.testConfigCode];
    describeSkipIfRpc(`subplebbit.posts.clients.${clientFieldName} - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`subplebbit.posts.clients.${clientFieldName} is undefined for gateway plebbit`, async () => {
            const gatewayPlebbit = await mockGatewayPlebbit();
            const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
            const sortTypes = Object.keys(mockSub.posts.clients[clientFieldName]);
            expect(sortTypes.length).to.be.greaterThan(0);
            for (const sortType of sortTypes) expect(mockSub.posts.clients[clientFieldName][sortType]).to.deep.equal({});
            await gatewayPlebbit.destroy();
        });

        it(`subplebbit.posts.clients.${clientFieldName}[sortType][url] is stopped by default`, async () => {
            const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
            const key = Object.keys(mockSub.clients[clientFieldName])[0];
            // add tests here
            expect(Object.keys(mockSub.posts.clients[clientFieldName]["new"]).length).to.equal(1);
            expect(mockSub.posts.clients[clientFieldName]["new"][key].state).to.equal("stopped");
        });

        it(`Correct state of 'new' sort is updated after fetching from subplebbit.posts.pageCids.new`, async () => {
            const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
            const firstPageMocked = {
                comments: mockSub.posts.pages.hot.comments.slice(0, 10).map((comment) => comment.raw)
            };

            const firstPageMockedCid = await addStringToIpfs(JSON.stringify(firstPageMocked));

            mockSub.posts.pageCids.new = firstPageMockedCid;

            const clientKey = Object.keys(mockSub.clients[clientFieldName])[0];

            const expectedStates = ["fetching-ipfs", "stopped"];
            const actualStates = [];
            mockSub.posts.clients[clientFieldName]["new"][clientKey].on("statechange", (newState) => {
                actualStates.push(newState);
            });

            await mockSub.posts.getPage(mockSub.posts.pageCids.new);
            expect(actualStates).to.deep.equal(expectedStates);
        });

        it("Correct state of 'new' sort is updated after fetching second page of 'new' pages", async () => {
            const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
            const clientKey = Object.keys(mockSub.clients[clientFieldName])[0];

            const secondPageMocked = { comments: mockSub.posts.pages.hot.comments.slice(1, 5).map((comment) => comment.raw) }; // create a slightly different page
            const secondPageCid = await addStringToIpfs(JSON.stringify(secondPageMocked));

            const firstPageMocked = {
                comments: mockSub.posts.pages.hot.comments.slice(0, 10).map((comment) => comment.raw),
                nextCid: secondPageCid
            };

            const firstPageMockedCid = await addStringToIpfs(JSON.stringify(firstPageMocked));

            mockSub.posts.pageCids.new = firstPageMockedCid;

            const expectedStates = ["fetching-ipfs", "stopped", "fetching-ipfs", "stopped"];
            const actualStates = [];
            mockSub.posts.clients[clientFieldName]["new"][clientKey].on("statechange", (newState) => {
                actualStates.push(newState);
            });

            const newFirstPage = await mockSub.posts.getPage(mockSub.posts.pageCids.new);
            expect(newFirstPage.nextCid).to.be.a("string");
            await mockSub.posts.getPage(newFirstPage.nextCid);

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct state of 'new' sort is updated after fetching with a subplebbit created with plebbit.createSubplebbit({address, pageCids})`, async () => {
            const remotePlebbit = await config.plebbitInstancePromise();
            const mockSub = await remotePlebbit.getSubplebbit(subplebbitAddress);

            const firstPageMocked = {
                comments: mockSub.posts.pages.hot.comments.slice(0, 10).map((comment) => comment.raw)
            };

            const firstPageMockedCid = await addStringToIpfs(JSON.stringify(firstPageMocked));

            const fetchSub = await remotePlebbit.createSubplebbit({
                address: subplebbitAddress,
                posts: { pageCids: { ...mockSub.posts.pageCids, new: firstPageMockedCid } }
            });
            expect(fetchSub.updatedAt).to.be.undefined;

            const clientKey = Object.keys(fetchSub.clients[clientFieldName])[0];

            const expectedStates = ["fetching-ipfs", "stopped"];
            const actualStates = [];
            fetchSub.posts.clients[clientFieldName]["new"][clientKey].on("statechange", (newState) => {
                actualStates.push(newState);
            });

            await fetchSub.posts.getPage(fetchSub.posts.pageCids.new);
            expect(actualStates).to.deep.equal(expectedStates);
            await remotePlebbit.destroy();
        });
    });
});
