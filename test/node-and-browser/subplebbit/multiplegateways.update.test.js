import signers from "../../fixtures/signers.js";
import { messages } from "../../../dist/node/errors.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

import {
    describeSkipIfRpc,
    publishRandomPost,
    mockPlebbit,
    mockGatewayPlebbit,
    waitTillPostInSubplebbitPages
} from "../../../dist/node/test/test-util.js";

describeSkipIfRpc(`Test fetching subplebbit record from multiple gateways`, async () => {
    // these test gateways will be set in test-server.js
    const stallingGateway = "http://localhost:14000"; // This gateaway will wait for 11s then respond
    const normalGateway = `http://localhost:18080`; // from test-server.js, should fetch records with minimal latency. Will fetch the latest record
    const errorGateway = `http://localhost:13416`; // this gateway will respond with an error immedietly
    const normalWithStallingGateway = `http://localhost:14002`; // This gateway will fetch from normal gateway, await some time (less than 10s) than respond
    const errorGateway2 = `http://localhost:14003`; // this gateway will respond with an error immedietly

    // These two gateways will respond with old record
    const thirtyMinuteLateGateway = `http://localhost:14004`; // This gateway will respond immedietly with subplebbitRecordThirtyMinuteOld
    const hourLateGateway = `http://localhost:14005`; // This gateway will respond immedietly with subplebbitRecordHourOld;
    const twoHoursLateGateway = `http://localhost:14006`; // This gateway will respond immedietly with subplebbitRecordHourOld;

    const subAddress = signers[0].address;
    let plebbit;

    const fetchLatestSubplebbitJson = async () => {
        const subRecord = (await plebbit.getSubplebbit(subAddress)).toJSONIpfs();
        return subRecord;
    };
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`plebbit.getSubplebbit times out if a single gateway is not responding (timeout)`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [stallingGateway] });
        customPlebbit._clientsManager.getGatewayTimeoutMs = () => 5 * 1000; // change timeout from 5min to 5s
        try {
            await customPlebbit.getSubplebbit(subAddress);
            expect.fails("Should not fulfill");
        } catch (e) {
            expect(e.details.gatewayToError[stallingGateway].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
            expect(e.message).to.equal(messages["ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS"]);
        }
    });
    it(`updating a subplebbit through working gateway and another gateway that is timing out`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [normalGateway, stallingGateway] });
        customPlebbit._clientsManager.getGatewayTimeoutMs = () => 5 * 1000; // change timeout from 5min to 5s
        // should succeed and return the result from normalGateway
        const subFromGateway = await customPlebbit.getSubplebbit(subplebbitAddress);
        const latestSub = await fetchLatestSubplebbitJson();
        expect(subFromGateway.toJSONIpfs()).to.deep.equal(latestSub);
    });
    it(`updating a subplebbit through working gateway and another gateway that is throwing an error`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [normalGateway, errorGateway] });
        // should succeed and return the result from normalGateway
        const [latestSub, sub] = await Promise.all([fetchLatestSubplebbitJson(), customPlebbit.getSubplebbit(subplebbitAddress)]);
        expect(sub.toJSONIpfs()).to.deep.equal(latestSub);
        expect(sub.updatedAt).to.be.a("number");
    });

    it(`all gateways are throwing an error`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [errorGateway, errorGateway2, stallingGateway] });
        customPlebbit._clientsManager.getGatewayTimeoutMs = () => 5 * 1000; // change timeout from 5min to 5s

        // should faill
        await assert.isRejected(customPlebbit.getSubplebbit(subAddress), messages["ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS"]);
    });

    it(`Fetching algo resolves immedietly if a gateway responds with a record that has been published in the last 60 min`, async () => {
        const post = await publishRandomPost(subAddress, plebbit, {}); // Force sub to publish a new update
        await waitTillPostInSubplebbitPages(post, plebbit);
        // normalWithStallingGateway gateway will return the latest SubplebbitIpfs

        // gateway that responds quickly with updatedAt > 2 min => thirtyMinuteLateGateway
        // gateway that respondes after taking sometime with updatedAt < 2 min => normalWithStallingGateway
        // should wait for normalWithStallingGateway
        // Should go with maximum updatedAt, which is normal with stalling gateway
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [normalWithStallingGateway, hourLateGateway] });
        customPlebbit._clientsManager.getGatewayTimeoutMs = () => 5 * 1000; // change timeout from 5min to 5s

        const buffer = customPlebbit._clientsManager.getGatewayTimeoutMs() * 5;
        const base = Math.round(Date.now() / 1000);
        const sub = await customPlebbit.getSubplebbit(subplebbitAddress);
        expect(sub.updatedAt)
            .to.be.lessThanOrEqual(base + buffer)
            .greaterThanOrEqual(base - buffer);
    });

    it(`Fetching algo goes with the highest updatedAt of records if all of them are older than 60 min`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [hourLateGateway, twoHoursLateGateway] });
        const sub = await customPlebbit.getSubplebbit(subplebbitAddress);

        // should go with the hour old, not the two hours
        const timestampHourAgo = Math.round(Date.now() / 1000) - 60 * 60;
        const bufferSeconds = 10;

        expect(sub.updatedAt)
            .to.greaterThanOrEqual(timestampHourAgo - bufferSeconds)
            .lessThanOrEqual(timestampHourAgo + bufferSeconds);
    });
    it(`fetching algo gets the highest updatedAt with 5 gateways`, async () => {
        const post = await publishRandomPost(subplebbitAddress, plebbit, {}); // should publish a new record after
        await waitTillPostInSubplebbitPages(post, plebbit);
        const customPlebbit = await mockGatewayPlebbit({
            ipfsGatewayUrls: [normalGateway, normalWithStallingGateway, thirtyMinuteLateGateway, errorGateway, stallingGateway]
        });
        customPlebbit._clientsManager.getGatewayTimeoutMs = () => 5 * 1000; // change timeout from 5min to 5s

        const gatewaySub = await customPlebbit.getSubplebbit(subplebbitAddress);
        const latestSub = await fetchLatestSubplebbitJson();
        const diff = latestSub.updatedAt - gatewaySub.updatedAt;
        const buffer = 5;
        expect(diff).to.be.lessThan(buffer);
    });
});
