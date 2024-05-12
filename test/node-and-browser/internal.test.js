import Plebbit from "../../dist/node/index.js";
import { parseDbResponses } from "../../dist/node/util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { messages } from "../../dist/node/errors.js";
import { mockRemotePlebbit, isRpcFlagOn } from "../../dist/node/test/test-util.js";

if (!isRpcFlagOn())
    describe("Test util functions", async () => {
        let plebbit, gatewayPlebbit;
        before(async () => {
            plebbit = await mockRemotePlebbit();
            gatewayPlebbit = await Plebbit({
                ipfsGatewayUrls: ["http://127.0.0.1:18080"]
            });
        });

        if (process.env.NO_INTERNET === "1")
            it(`Test environment has no access to internet`, async () => {
                await assert.isRejected(fetch("https://ifconfig.me"));
            });

        describe("loading IPNS", async () => {
            it("Throws if provided with invalid ipns through ipfs P2P", async () => {
                const gibberishIpns = "12345";
                await assert.isRejected(
                    plebbit._clientsManager.resolveIpnsToCidP2P(gibberishIpns),
                    messages.ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS
                );
            });

            it(`Throws if provided with invalid ipns through ipfs gateway`, async () => {
                const gibberishIpns = "12345";
                await assert.isRejected(
                    gatewayPlebbit._clientsManager.fetchFromMultipleGateways({ ipns: gibberishIpns }, "subplebbit"),
                    messages.ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY
                );
            });

            it("Loads an IPNS file as JSON correctly (IPFS Gateway)", async () => {
                const jsonFileTest = { 1234: "1234" };
                const cid = (await plebbit._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(jsonFileTest))).path;
                const jsonFileAsIpns = await plebbit._clientsManager.getDefaultIpfs()._client.name.publish(cid, { allowOffline: true });
                const jsonFileLoaded = JSON.parse(
                    await gatewayPlebbit._clientsManager.fetchFromMultipleGateways({ ipns: jsonFileAsIpns.name }, "subplebbit")
                );
                expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
            });

            it(`Throws an error when file to download is over 1mb and we're loading it via gateway`, async () => {
                const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) };

                const cid = (await plebbit._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(twoMbObject))).path; // Cid of a file with over 1mb size

                const ipns = (
                    await plebbit._clientsManager.getDefaultIpfs()._client.name.publish(cid, {
                        lifetime: "5m",
                        allowOffline: true
                    })
                ).name;

                await assert.isRejected(
                    gatewayPlebbit._clientsManager.fetchFromMultipleGateways({ ipns }, "subplebbit"),
                    messages.ERR_OVER_DOWNLOAD_LIMIT
                );
            });
        });
    });

if (!isRpcFlagOn())
    describe(`Test parsing of database queries`, async () => {
        it(`Can parse regular json object with a field that's json string`, async () => {
            const rawObj = {
                author: '{"address":"12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR","displayName":"Mock Author - 1676110849.7439198"}'
            };
            const parsed = parseDbResponses(rawObj);
            expect(parsed).to.be.a("object");
            expect(parsed.author).to.be.a("object");
            expect(parsed.author.address).to.equal("12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR");
            expect(parsed.author.displayName).to.equal("Mock Author - 1676110849.7439198");
        });

        it(`Can parse regular json object with a boolean field (hardcoded)`, async () => {
            const rawObj = {
                removed: 1
            };
            const parsed = parseDbResponses(rawObj);
            expect(parsed).to.be.a("object");
            expect(parsed.removed).to.equal(true);
        });

        it(`Can parse regular json object with a stringifed array field`, async () => {
            const rawObj = {
                acceptedChallengeTypes: '["test"]'
            };

            const parsed = parseDbResponses(rawObj);
            expect(parsed).to.be.a("object");
            expect(parsed.acceptedChallengeTypes).to.be.a("array");
            expect(parsed.acceptedChallengeTypes[0]).to.equal("test");
        });

        it(`Only parses one level of json strings`, async () => {
            const author = {
                address: "12D3KooWL8oSq4yRKyw1cB83t9GeNcvxrDEQVkdE5F3PjBunzcVq",
                avatar: {
                    address: "0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188",
                    chainTicker: "matic",
                    id: "9842",
                    signature: {
                        signature:
                            '{"domainSeparator":"plebbit-author-avatar","authorAddress":"12D3KooWJsiCyvG9mjRtWzc8TqzS7USKUrFFNs9s2AJuGqNhn9uU","timestamp":1709879936,"tokenAddress":"0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188","tokenId":"9842"}',
                        type: "eip191"
                    }
                }
            };
            const rawComment = {
                author
            };

            const parsedComment = parseDbResponses(rawComment);

            expect(parsedComment).to.be.a("object");
            expect(parsedComment.author).to.be.a("object");
            expect(parsedComment.author.address).to.be.a("string");
            expect(parsedComment.author.avatar).to.be.a("object");
            expect(parsedComment.author.avatar.address).to.be.a("string");
            expect(parsedComment.author.avatar.chainTicker).to.be.a("string");
            expect(parsedComment.author.avatar.id).to.be.a("string");

            expect(parsedComment.author.avatar.signature).to.be.a("object");
            expect(parsedComment.author.avatar.signature.signature).to.be.a("string");
            expect(parsedComment.author.avatar.signature.type).to.be.a("string");
        });
    });
