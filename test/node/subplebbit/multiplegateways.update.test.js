import http from "http";
import { expect } from "chai";
import { describe, it, beforeAll, afterAll } from "vitest";
import { mockGatewayPlebbit, mockPlebbit, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import { signSubplebbit } from "../../../dist/node/signer/signatures.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { messages } from "../../../dist/node/errors.js";
import { convertBase58IpnsNameToBase36Cid } from "../../../dist/node/signer/util.js";

describe("Test fetching subplebbit record from multiple gateways (isolated)", async () => {
    // Mock gateway ports (chosen to avoid conflicts with test-server.js ports)
    // test-server.js uses 13415-13418, 14000-14006, 14952-14953, 15001-15006, 18080-18085, 20001, 24001-24006, 30001
    const STALLING_GATEWAY_PORT = 25000;
    const NORMAL_GATEWAY_PORT = 25001;
    const ERROR_GATEWAY_PORT = 25002;
    const NORMAL_WITH_STALLING_GATEWAY_PORT = 25003;
    const ERROR_GATEWAY_2_PORT = 25004;
    const THIRTY_MIN_LATE_GATEWAY_PORT = 25005;
    const HOUR_LATE_GATEWAY_PORT = 25006;
    const TWO_HOURS_LATE_GATEWAY_PORT = 25007;

    // Gateway URLs
    const stallingGateway = `http://localhost:${STALLING_GATEWAY_PORT}`;
    const normalGateway = `http://localhost:${NORMAL_GATEWAY_PORT}`;
    const errorGateway = `http://localhost:${ERROR_GATEWAY_PORT}`;
    const normalWithStallingGateway = `http://localhost:${NORMAL_WITH_STALLING_GATEWAY_PORT}`;
    const errorGateway2 = `http://localhost:${ERROR_GATEWAY_2_PORT}`;
    const thirtyMinuteLateGateway = `http://localhost:${THIRTY_MIN_LATE_GATEWAY_PORT}`;
    const hourLateGateway = `http://localhost:${HOUR_LATE_GATEWAY_PORT}`;
    const twoHoursLateGateway = `http://localhost:${TWO_HOURS_LATE_GATEWAY_PORT}`;

    let servers = [];
    let testSigner;
    let subAddress;
    let expectedBase36;

    // Create an HTTP server helper
    const createServer = (port, handler) => {
        return new Promise((resolve, reject) => {
            const server = http.createServer(handler);
            server.on("error", reject);
            server.listen(port, () => {
                servers.push(server);
                resolve(server);
            });
        });
    };

    // Check if request is for our test subplebbit
    const isRequestForTestSub = (req) => {
        if (!req.url.includes("/ipns/")) return false;
        const base36Address = req.url.split("/ipns/")[1]?.split("?")[0];
        if (!base36Address) return false;
        return base36Address === expectedBase36;
    };

    // Generate a fresh subplebbit record
    const generateFreshRecord = () => {
        const now = Math.round(Date.now() / 1000);
        return {
            address: subAddress,
            challenges: [],
            createdAt: now - 3600, // Created 1 hour ago
            updatedAt: now, // Updated now (fresh)
            encryption: {
                publicKey: testSigner.publicKey,
                type: "ed25519-aes-gcm"
            },
            pubsubTopic: subAddress,
            statsCid: "QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f", // Dummy CID
            protocolVersion: "1.0.0"
        };
    };

    // Sign a subplebbit record
    const signRecord = async (record) => {
        const signature = await signSubplebbit({ subplebbit: record, signer: testSigner });
        return { ...record, signature };
    };

    // Generate a record with modified updatedAt and re-sign it
    const generateRecordWithAge = async (ageInSeconds) => {
        const record = generateFreshRecord();
        record.updatedAt = Math.round(Date.now() / 1000) - ageInSeconds;
        return signRecord(record);
    };

    beforeAll(async () => {
        // Create a unique signer for this test to ensure complete isolation
        const plebbit = await mockPlebbit();
        testSigner = await plebbit.createSigner();
        subAddress = testSigner.address;
        expectedBase36 = convertBase58IpnsNameToBase36Cid(subAddress);
        await plebbit.destroy();

        // Stalling gateway - waits 11s before responding
        await createServer(STALLING_GATEWAY_PORT, async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (!isRequestForTestSub(req)) {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 11000));
            const freshRecord = await signRecord(generateFreshRecord());
            const freshRecordJson = JSON.stringify(freshRecord);
            const freshRecordCid = await calculateIpfsHash(freshRecordJson);
            res.setHeader("x-ipfs-roots", freshRecordCid);
            res.setHeader("etag", freshRecordCid);
            res.end(freshRecordJson);
        });

        // Normal gateway - responds immediately with fresh record
        await createServer(NORMAL_GATEWAY_PORT, async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (!isRequestForTestSub(req)) {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            const freshRecord = await signRecord(generateFreshRecord());
            const freshRecordJson = JSON.stringify(freshRecord);
            const freshRecordCid = await calculateIpfsHash(freshRecordJson);
            res.setHeader("x-ipfs-roots", freshRecordCid);
            res.setHeader("etag", freshRecordCid);
            res.end(freshRecordJson);
        });

        // Error gateway - returns 429 immediately
        await createServer(ERROR_GATEWAY_PORT, (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.statusCode = 429;
            res.statusMessage = "Too Many Requests";
            res.end();
        });

        // Normal with stalling gateway - waits 3s then responds with fresh record
        await createServer(NORMAL_WITH_STALLING_GATEWAY_PORT, async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (!isRequestForTestSub(req)) {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const freshRecord = await signRecord(generateFreshRecord());
            const freshRecordJson = JSON.stringify(freshRecord);
            const freshRecordCid = await calculateIpfsHash(freshRecordJson);
            res.setHeader("x-ipfs-roots", freshRecordCid);
            res.setHeader("etag", freshRecordCid);
            res.end(freshRecordJson);
        });

        // Error gateway 2 - returns 430 immediately
        await createServer(ERROR_GATEWAY_2_PORT, (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.statusCode = 430;
            res.statusMessage = "Error";
            res.end();
        });

        // Thirty minute late gateway - responds immediately with 30-min old record
        await createServer(THIRTY_MIN_LATE_GATEWAY_PORT, async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (!isRequestForTestSub(req)) {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            const oldRecord = await generateRecordWithAge(30 * 60);
            const oldRecordJson = JSON.stringify(oldRecord);
            const oldRecordCid = await calculateIpfsHash(oldRecordJson);
            res.setHeader("x-ipfs-roots", oldRecordCid);
            res.setHeader("etag", oldRecordCid);
            res.end(oldRecordJson);
        });

        // Hour late gateway - responds immediately with 60-min old record
        await createServer(HOUR_LATE_GATEWAY_PORT, async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (!isRequestForTestSub(req)) {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            const oldRecord = await generateRecordWithAge(60 * 60);
            const oldRecordJson = JSON.stringify(oldRecord);
            const oldRecordCid = await calculateIpfsHash(oldRecordJson);
            res.setHeader("x-ipfs-roots", oldRecordCid);
            res.setHeader("etag", oldRecordCid);
            res.end(oldRecordJson);
        });

        // Two hours late gateway - responds immediately with 120-min old record
        await createServer(TWO_HOURS_LATE_GATEWAY_PORT, async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (!isRequestForTestSub(req)) {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            const oldRecord = await generateRecordWithAge(2 * 60 * 60);
            const oldRecordJson = JSON.stringify(oldRecord);
            const oldRecordCid = await calculateIpfsHash(oldRecordJson);
            res.setHeader("x-ipfs-roots", oldRecordCid);
            res.setHeader("etag", oldRecordCid);
            res.end(oldRecordJson);
        });
    });

    afterAll(async () => {
        // Close all mock servers
        for (const server of servers) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    it(`plebbit.getSubplebbit times out if a single gateway is not responding (timeout)`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [stallingGateway] } });
        customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s
        try {
            await customPlebbit.getSubplebbit({ address: subAddress });
            expect.fail("Should not fulfill");
        } catch (e) {
            expect(e.details.gatewayToError[stallingGateway].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
            expect(e.message).to.equal(messages["ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS"]);
        } finally {
            await customPlebbit.destroy();
        }
    });

    it(`updating a subplebbit through working gateway and another gateway that is timing out`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [normalGateway, stallingGateway] } });
        customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s
        try {
            const subFromGateway = await customPlebbit.getSubplebbit({ address: subAddress });
            // Verify it's our test subplebbit with the expected structure
            expect(subFromGateway.address).to.equal(subAddress);
            expect(subFromGateway.updatedAt).to.be.a("number");
            // Verify it's fresh (within the last 10 seconds)
            const now = Math.round(Date.now() / 1000);
            expect(subFromGateway.updatedAt).to.be.closeTo(now, 10);
        } finally {
            await customPlebbit.destroy();
        }
    });

    it(`updating a subplebbit through working gateway and another gateway that is throwing an error`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [normalGateway, errorGateway] } });
        try {
            const sub = await customPlebbit.getSubplebbit({ address: subAddress });
            expect(sub.address).to.equal(subAddress);
            expect(sub.updatedAt).to.be.a("number");
        } finally {
            await customPlebbit.destroy();
        }
    });

    it(`all gateways are throwing an error`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [errorGateway, errorGateway2, stallingGateway] } });
        customPlebbit._timeouts["subplebbit-ipns"] = 5 * 1000; // change timeout from 5min to 5s

        try {
            await customPlebbit.getSubplebbit({ address: subAddress });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
        } finally {
            await customPlebbit.destroy();
        }
    });

    it(`Fetching algo resolves immedietly if a gateway responds with a record that has been published in the last 60 min`, async () => {
        // Algorithm: returns the first valid record that's newer than current state (which is 0 for new fetch)
        // hourLateGateway responds immediately with 60-min old record, normalWithStallingGateway delays 3s
        // Since any record with updatedAt > 0 is accepted, the algorithm returns the hour-old record immediately
        const customPlebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [normalWithStallingGateway, hourLateGateway] } });
        customPlebbit._timeouts["subplebbit-ipns"] = 10 * 1000; // change timeout from 5min to 10s

        try {
            const bufferSeconds = 10;
            const timestampHourAgo = Math.round(Date.now() / 1000) - 60 * 60;
            const sub = await customPlebbit.getSubplebbit({ address: subAddress });
            // Algorithm returns the first valid record (hour-old from hourLateGateway)
            expect(sub.updatedAt)
                .to.greaterThanOrEqual(timestampHourAgo - bufferSeconds)
                .lessThanOrEqual(timestampHourAgo + bufferSeconds);
        } finally {
            await customPlebbit.destroy();
        }
    });

    it(`Fetching algo goes with the highest updatedAt of records if all of them are older than 60 min`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [hourLateGateway, twoHoursLateGateway] } });
        try {
            const sub = await customPlebbit.getSubplebbit({ address: subAddress });
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
        } finally {
            await customPlebbit.destroy();
        }
    });

    it(`fetching algo gets the highest updatedAt with 5 gateways`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ plebbitOptions: {
            ipfsGatewayUrls: [normalGateway, normalWithStallingGateway, thirtyMinuteLateGateway, errorGateway, stallingGateway]
        } });
        customPlebbit._timeouts["subplebbit-ipns"] = 10 * 1000; // change timeout from 5min to 10s

        try {
            const gatewaySub = await customPlebbit.getSubplebbit({ address: subAddress });
            // Should get the fresh record (within 10 seconds of now)
            const now = Math.round(Date.now() / 1000);
            const diff = now - gatewaySub.updatedAt;
            const buffer = 10;
            expect(diff).to.be.lessThan(buffer);
        } finally {
            await customPlebbit.destroy();
        }
    });
});
