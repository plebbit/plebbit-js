import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    describeSkipIfRpc,
    publishRandomPost,
    mockPlebbitV2,
    mockCacheOfTextRecord,
    resolveWhenConditionIsTrue,
    mockPlebbit
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`comment.clients.chainProviders`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: undefined }, false, false, true); // do not stub storage
    });
    it(`comment.clients.chainProviders[url][chainTicker].state is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, plebbit);
        expect(Object.keys(mockPost.clients.chainProviders).length).to.equal(1);
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

    it(`Correct order of chainProviders state when updating a comment whose author address is a domain - uncached`, async () => {});

    it(`Correct order of chainProviders state when updating a comment whose author address is a domain - cached`, async () => {});

    it(`correct order of chainProviders state when publishing a comment to a sub with a domain address - uncached`, async () => {
        const mockPost = await generateMockPost("plebbit.eth", plebbit);
        mockPost._clientsManager._getCachedTextRecord = () => undefined;
        const expectedStates = ["resolving-subplebbit-address", "stopped"];

        const actualStates = [];

        const chainProviderUrl = Object.keys(mockPost.clients.chainProviders.eth)[0];

        mockPost.clients.chainProviders["eth"][chainProviderUrl].on("statechange", (newState) => actualStates.push(newState));

        await publishWithExpectedResult(mockPost, true);

        // Sometimes we get no states because ENS is already cached
        if (actualStates.length !== 0) expect(actualStates.slice(0, 2)).to.deep.equal(expectedStates);
    });

    it(`correct order of chainProviders state when publishing a comment to a sub with a domain address - cached`, async () => {});

    it(`Correct order of chainProviders state when comment has a reply with author.address as domain - uncached`, async () => {});

    it(`Correct order of chainProviders state when comment has a reply with author.address as domain - cached`, async () => {});
});
