import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    describeSkipIfRpc,
    publishRandomPost,
    mockPlebbitV2,
    mockCacheOfTextRecord,
    resolveWhenConditionIsTrue,
    publishRandomReply,
    waitTillReplyInParentPages
} from "../../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`comment.clients.chainProviders`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbitV2({
            plebbitOptions: { dataPath: undefined },
            forceMockPubsub: false,
            stubStorage: false,
            mockResolve: true
        });
    });
    after(async () => {
        await plebbit.destroy();
    });
    it(`comment.clients.chainProviders[url][chainTicker].state is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, plebbit);
        expect(Object.keys(mockPost.clients.chainProviders).length).to.be.greaterThanOrEqual(1)
        for (const chain of Object.keys(mockPost.clients.chainProviders)) {
            expect(Object.keys(mockPost.clients.chainProviders[chain]).length).to.be.greaterThan(0);
            for (const chainUrl of Object.keys(mockPost.clients.chainProviders[chain]))
                expect(mockPost.clients.chainProviders[chain][chainUrl].state).to.equal("stopped");
        }
    });

    it(`Correct order of chainProviders state when updating a comment whose sub is a domain - uncached`, async () => {
        const mockPost = await publishRandomPost("plebbit.eth", plebbit);

        await mockPost.stop();

        // domainResolverPromiseCache.clear();

        const differentPlebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true, mockResolve: true }); // using different plebbit to it wouldn't be cached
        await mockCacheOfTextRecord({
            plebbit: differentPlebbit,
            domain: "plebbit.eth",
            textRecord: "subplebbit-address",
            value: undefined
        });
        const updatingPost = await differentPlebbit.createComment({ cid: mockPost.cid });

        const expectedStates = ["resolving-subplebbit-address", "stopped"];

        const actualStates = [];

        const chainProviderUrl = Object.keys(updatingPost.clients.chainProviders.eth)[0];

        updatingPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await updatingPost.update();

        await resolveWhenConditionIsTrue(updatingPost, () => typeof updatingPost.updatedAt === "number");

        await updatingPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);

        await differentPlebbit.destroy();
    });

    it(`Correct order of chainProviders state when updating a comment whose sub is a domain - cached`, async () => {
        const mockPost = await publishRandomPost("plebbit.eth", plebbit);

        await mockPost.stop();

        const updatingPost = await plebbit.createComment({ cid: mockPost.cid });

        await mockCacheOfTextRecord({
            plebbit: mockPost._plebbit,
            domain: "plebbit.eth",
            textRecord: "subplebbit-address",
            value: signers[3].address
        });

        const expectedStates = []; // no state change because it's cached

        const actualStates = [];

        const chainProviderUrl = Object.keys(mockPost.clients.chainProviders.eth)[0];

        updatingPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await updatingPost.update();

        await resolveWhenConditionIsTrue(updatingPost, () => typeof updatingPost.updatedAt === "number");

        await updatingPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of chainProviders state when updating a comment whose author address is a domain - uncached`, async () => {
        // Create a post with a domain as author address, signed with the correct signer
        const plebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true, mockResolve: true });
        const mockPost = await publishRandomPost(subplebbitAddress, plebbit, {
            author: { address: "plebbit.eth" },
            signer: signers[6]
        });

        // Create a new plebbit instance to avoid caching
        const differentPlebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true, mockResolve: true });

        // Clear the cache for the domain
        await mockCacheOfTextRecord({
            plebbit: differentPlebbit,
            domain: "plebbit.eth",
            textRecord: "plebbit-author-address",
            value: undefined
        });

        const updatingPost = await differentPlebbit.createComment({ cid: mockPost.cid });

        const expectedStates = ["resolving-author-address", "stopped"];
        const actualStates = [];

        const chainProviderUrl = Object.keys(updatingPost.clients.chainProviders.eth)[0];

        updatingPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await updatingPost.update();

        await resolveWhenConditionIsTrue(updatingPost, () => typeof updatingPost.updatedAt === "number");

        await updatingPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);

        await differentPlebbit.destroy();
    });

    it(`Correct order of chainProviders state when updating a comment whose author address is a domain - cached`, async () => {
        // Create a post with a domain as author address, signed with the correct signer
        const mockPost = await publishRandomPost(subplebbitAddress, plebbit, {
            author: { address: "plebbit.eth" },
            signer: signers[6]
        });

        // Create a new plebbit instance to avoid caching
        const differentPlebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true, mockResolve: true });

        // Clear the cache for the domain
        await mockCacheOfTextRecord({
            plebbit: differentPlebbit,
            domain: "plebbit.eth",
            textRecord: "plebbit-author-address",
            value: signers[6].address
        });

        const updatingPost = await differentPlebbit.createComment({ cid: mockPost.cid });

        const expectedStates = []; // empty because it's cached
        const actualStates = [];

        const chainProviderUrl = Object.keys(updatingPost.clients.chainProviders.eth)[0];

        updatingPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await updatingPost.update();

        await resolveWhenConditionIsTrue(updatingPost, () => typeof updatingPost.updatedAt === "number");

        await updatingPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);

        await differentPlebbit.destroy();
    });

    it(`correct order of chainProviders state when publishing a comment to a sub with a domain address - uncached`, async () => {
        const plebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true, mockResolve: true }); // need to use different plebbit so it won't use the memory cache of subplebbit for publishing
        const mockPost = await generateMockPost("plebbit.eth", plebbit);
        await mockCacheOfTextRecord({
            plebbit: mockPost._plebbit,
            domain: "plebbit.eth",
            textRecord: "subplebbit-address",
            value: undefined
        });
        const expectedStates = ["resolving-subplebbit-address", "stopped"];

        const actualStates = [];

        const chainProviderUrl = Object.keys(mockPost.clients.chainProviders.eth)[0];

        mockPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
        await plebbit.destroy();
    });

    it(`correct order of chainProviders state when publishing a comment to a sub with a domain address - cached`, async () => {
        const mockPost = await generateMockPost("plebbit.eth", plebbit);
        await mockCacheOfTextRecord({
            plebbit: mockPost._plebbit,
            domain: "plebbit.eth",
            textRecord: "subplebbit-address",
            value: signers[3].address
        });
        const expectedStates = []; // empty because it's cached

        const actualStates = [];

        const chainProviderUrl = Object.keys(mockPost.clients.chainProviders.eth)[0];

        mockPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of chainProviders state when comment has a reply with author.address as domain - uncached`, async () => {
        const mockPost = await publishRandomPost(subplebbitAddress, plebbit);
        const reply = await publishRandomReply(mockPost, plebbit, { author: { address: "plebbit.eth" }, signer: signers[6] });
        await waitTillReplyInParentPages(reply, plebbit); // make sure until reply is in mockPost.replies

        const differentPlebbit = await mockPlebbitV2({
            stubStorage: true, // make sure there's no storage so it won't be cached
            remotePlebbit: true,
            mockResolve: true,
            plebbitOptions: { validatePages: true } // it needs to validate page to resolve author address
        });
        const loadedPost = await differentPlebbit.createComment({ cid: mockPost.cid });
        const expectedStates = ["resolving-author-address", "stopped"];
        const actualStates = [];

        const chainProviderUrl = Object.keys(loadedPost.clients.chainProviders.eth)[0];

        loadedPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await loadedPost.update();

        await resolveWhenConditionIsTrue(loadedPost, () => typeof loadedPost.updatedAt === "number");

        await loadedPost.stop();

        expect(actualStates.slice(0, expectedStates.length)).to.deep.equal(expectedStates);
    });

    it(`Correct order of chainProviders state when comment has a reply with author.address as domain - cached`, async () => {
        const mockPost = await publishRandomPost(subplebbitAddress, plebbit);
        const reply = await publishRandomReply(mockPost, plebbit, { author: { address: "plebbit.eth" }, signer: signers[6] });
        await waitTillReplyInParentPages(reply, plebbit); // make sure until reply is in mockPost.replies

        const differentPlebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true, mockResolve: true });
        await mockCacheOfTextRecord({
            plebbit: plebbit,
            domain: "plebbit.eth",
            textRecord: "plebbit-author-address",
            value: signers[3].address
        });
        const loadedPost = await differentPlebbit.createComment({ cid: mockPost.cid });
        const expectedStates = [];
        const actualStates = [];

        const chainProviderUrl = Object.keys(loadedPost.clients.chainProviders.eth)[0];

        loadedPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await loadedPost.update();

        await resolveWhenConditionIsTrue(loadedPost, () => typeof loadedPost.updatedAt === "number");

        await loadedPost.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });
});
