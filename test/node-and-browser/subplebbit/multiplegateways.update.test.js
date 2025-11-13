import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import { messages } from "../../../dist/node/errors.js";

const subplebbitAddress = signers[0].address;

import {
    publishRandomPost,
    getAvailablePlebbitConfigsToTestAgainst,
    waitTillPostInSubplebbitPages,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { describe, it } from "vitest";

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe.concurrent(`Test fetching subplebbit record from multiple gateways`, async () => {
        // these test gateways will be set in test-server.js
        const stallingGateway = "http://localhost:14000"; // This gateaway will wait for 11s then respond
        const normalGateway = `http://localhost:18080`; // from test-server.js, should fetch records with minimal latency. Will fetch the latest record because it's the same node running the subs
        const errorGateway = `http://localhost:13416`; // this gateway will respond with an error immedietly
        const normalWithStallingGateway = `http://localhost:14002`; // This gateway will fetch from normal gateway, await some time (less than 10s) than respond
        const errorGateway2 = `http://localhost:14003`; // this gateway will respond with an error immedietly

        // These two gateways will respond with old record
        const thirtyMinuteLateGateway = `http://localhost:14004`; // This gateway will respond immedietly with subplebbitRecordThirtyMinuteOld
        const hourLateGateway = `http://localhost:14005`; // This gateway will respond immedietly with subplebbitRecordHourOld;
        const twoHoursLateGateway = `http://localhost:14006`; // This gateway will respond immedietly with subplebbitRecordHourOld;

        const subAddress = signers[0].address;

        const fetchLatestSubplebbitJson = async () => {
            const plebbitRunningSubs = await config.plebbitInstancePromise({ plebbitOptions: { ipfsGatewayUrls: [normalGateway] } });
            const subRecord = (await plebbitRunningSubs.getSubplebbit(subAddress)).toJSONIpfs();
            await plebbitRunningSubs.destroy();
            return subRecord;
        };
        let regularKuboPlebbit;
        before(async () => {
            regularKuboPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        });
        after(async () => {
            await regularKuboPlebbit.destroy();
        });

        it(`plebbit.getSubplebbit times out if a single gateway is not responding (timeout)`, async () => {
            const customPlebbit = await config.plebbitInstancePromise({ plebbitOptions: { ipfsGatewayUrls: [stallingGateway] } });
            customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s
            try {
                await customPlebbit.getSubplebbit(subAddress);
                expect.fail("Should not fulfill");
            } catch (e) {
                expect(e.details.gatewayToError[stallingGateway].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
                expect(e.message).to.equal(messages["ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS"]);
            }
            await customPlebbit.destroy();
        });
        it(`updating a subplebbit through working gateway and another gateway that is timing out`, async () => {
            const customPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: { ipfsGatewayUrls: [normalGateway, stallingGateway] }
            });
            customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s
            // should succeed and return the result from normalGateway
            const subFromGateway = await customPlebbit.getSubplebbit(subplebbitAddress);
            const latestSub = await fetchLatestSubplebbitJson();
            expect(subFromGateway.toJSONIpfs()).to.deep.equal(latestSub);
            await customPlebbit.destroy();
        });
        it(`updating a subplebbit through working gateway and another gateway that is throwing an error`, async () => {
            const customPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: { ipfsGatewayUrls: [normalGateway, errorGateway] }
            });
            // should succeed and return the result from normalGateway
            const [latestSub, sub] = await Promise.all([fetchLatestSubplebbitJson(), customPlebbit.getSubplebbit(subplebbitAddress)]);
            expect(sub.toJSONIpfs()).to.deep.equal(latestSub);
            expect(sub.updatedAt).to.be.a("number");
            await customPlebbit.destroy();
        });

        it(`all gateways are throwing an error`, async () => {
            const customPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: { ipfsGatewayUrls: [errorGateway, errorGateway2, stallingGateway] }
            });
            customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s

            try {
                await customPlebbit.getSubplebbit(subAddress);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
            }
            await customPlebbit.destroy();
        });

        it(`Fetching algo resolves immedietly if a gateway responds with a record that has been published in the last 60 min`, async () => {
            const post = await publishRandomPost(subAddress, regularKuboPlebbit); // Force sub to publish a new update
            await waitTillPostInSubplebbitPages(post, regularKuboPlebbit);
            // normalWithStallingGateway gateway will return the latest SubplebbitIpfs

            // gateway that responds quickly with updatedAt > 2 min => thirtyMinuteLateGateway
            // gateway that respondes after taking sometime with updatedAt < 2 min => normalWithStallingGateway
            // should wait for normalWithStallingGateway
            // Should go with maximum updatedAt, which is normal with stalling gateway
            const customPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: { ipfsGatewayUrls: [normalWithStallingGateway, hourLateGateway] }
            });
            customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s

            const buffer = customPlebbit._timeouts["subplebbit-ipns"] * 5;
            const base = Math.round(Date.now() / 1000);
            const sub = await customPlebbit.getSubplebbit(subplebbitAddress);
            expect(sub.updatedAt)
                .to.be.lessThanOrEqual(base + buffer)
                .greaterThanOrEqual(base - buffer);
            await customPlebbit.destroy();
        });

        // at the moment we changed the algo so it would resolve the first record to get as long as it's higher than updatedAt
        // there's no freshness window anymore
        it(`Fetching algo goes with the highest updatedAt of records if all of them are older than 60 min`, async () => {
            const customPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: { ipfsGatewayUrls: [hourLateGateway, twoHoursLateGateway] }
            });
            const sub = await customPlebbit.getSubplebbit(subplebbitAddress);
            await sub.update();

            // should go with the hour old, not the two hours
            const bufferSeconds = 10;
            await resolveWhenConditionIsTrue({
                toUpdate: sub,
                predicate: () => {
                    const timestampHourAgo = Math.round(Date.now() / 1000) - 60 * 60;
                    return (
                        typeof sub.updatedAt === "number" &&
                        sub.updatedAt >= timestampHourAgo - bufferSeconds &&
                        sub.updatedAt <= timestampHourAgo + bufferSeconds
                    );
                }
            });
            const timestampHourAgo = Math.round(Date.now() / 1000) - 60 * 60;

            expect(sub.updatedAt)
                .to.greaterThanOrEqual(timestampHourAgo - bufferSeconds)
                .lessThanOrEqual(timestampHourAgo + bufferSeconds);
            await customPlebbit.destroy();
        });
        it(`fetching algo gets the highest updatedAt with 5 gateways`, async () => {
            // the problem here is that the normalGateway cache IPNS for 3s, and when we do getSubplebbit it's gonna use the cache
            const post = await publishRandomPost(subplebbitAddress, regularKuboPlebbit); // should publish a new record after
            await waitTillPostInSubplebbitPages(post, regularKuboPlebbit);
            const customPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: {
                    ipfsGatewayUrls: [normalGateway, normalWithStallingGateway, thirtyMinuteLateGateway, errorGateway, stallingGateway]
                },
                remotePlebbit: true
            });
            // await new Promise((resolve) => setTimeout(resolve, customPlebbit.publishInterval * 3)); // wait for the cache to expire
            customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s

            const [gatewaySub, latestSub] = await Promise.all([
                customPlebbit.getSubplebbit(subplebbitAddress),
                fetchLatestSubplebbitJson()
            ]);
            const diff = latestSub.updatedAt - gatewaySub.updatedAt;
            const buffer = 10;
            expect(diff).to.be.lessThan(buffer);
            await customPlebbit.destroy();
        });
    });
});
