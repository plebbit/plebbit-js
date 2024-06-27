import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishWithExpectedResult,
    mockGatewayPlebbit,
    describeSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { domainResolverPromiseCache } from "../../../../dist/node/constants.js";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`comment.clients.chainProviders`, async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
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

    it(`correct order of chainProviders state when publishing a comment to a sub with a domain address`, async () => {
        domainResolverPromiseCache.clear();
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
});
