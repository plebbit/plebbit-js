import signers from "../fixtures/signers.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { messages } from "../../dist/node/errors.js";
import {
    mockRemotePlebbit,
    publishWithExpectedResult,
    publishRandomPost,
    isRpcFlagOn,
    mockPlebbit
} from "../../dist/node/test/test-util.js";
import { v4 as uuidV4 } from "uuid";
import * as resolverClass from "../../dist/node/resolver.js";

const mockComments = [];

// Clients of RPC will trust the response of RPC and won't validate
describe(`Resolving text records`, async () => {
    it(`Can resolve correctly with just viem`, async () => {
        const plebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: ["viem"], chainId: 1 } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["viem"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
    });

    it(`Can resolve correctly with just ethers.js`, async () => {
        const plebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: ["ethers.js"], chainId: 1 } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["ethers.js"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
    });
    it(`Can resolve correctly with custom chain provider`, async () => {
        const plebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: ["https://cloudflare-eth.com/"], chainId: 1 } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["https://cloudflare-eth.com/"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
    });
    it(`Can resolve correctly with viem, ethers.js and a custom chain provider`, async () => {
        const plebbit = await mockRemotePlebbit({
            chainProviders: { eth: { urls: ["https://cloudflare-eth.com/", "viem", "ethers.js"], chainId: 1 } }
        }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["https://cloudflare-eth.com/", "viem", "ethers.js"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
    });

    describe(`Resolving solana domains`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await mockPlebbit({}, true, true, false); // Should not mock resolver
        });

        it(`A solana domain that has no subplebbit-address will return null when resolved`, async () => {
            const subAddress = "randomdomain.sol";
            const ipnsAddress = await plebbit._clientsManager.resolveSubplebbitAddressIfNeeded(subAddress);
            expect(ipnsAddress).to.be.null;
        });

        it(`Can resolve A solana domain with correct subplebbit-address subdomain correctly`, async () => {
            const plebbit = await mockPlebbit({}, true, true, false); // Should not mock resolver
            const subAddress = "redditdeath.sol";
            const ipnsAddress = await plebbit._clientsManager.resolveSubplebbitAddressIfNeeded(subAddress);
            expect(ipnsAddress).to.equal("12D3KooWKuojPWVJRMsQGMHzKKHY8ZVbU84vaetkaiymoqvDMe9z");
        });

        it(`Can resolve A solana domain with correct plebbit-author-address subdomain correctly`, async () => {
            const plebbit = await mockPlebbit({}, true, true, false); // Should not mock resolver
            const authorAddress = "redditdeath.sol";
            const ipnsAddress = await plebbit.resolveAuthorAddress(authorAddress);
            expect(ipnsAddress).to.equal("12D3KooWAszaoiJKCZCSeeKsjycPDrjdYG1zABbFdsgVenxdi9ma");
        });
    });
});

describe("Comments with Authors as domains", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it(`Sub accepts posts with author.address as a domain that resolves to comment signer `, async () => {
        // I've mocked plebbit.resolver.resolveAuthorAddressIfNeeded to return signers[6] address for plebbit.eth
        const mockPost = await plebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.eth" },
            signer: signers[6],
            content: `Mock post - ${Date.now()}`,
            title: "Mock post title",
            subplebbitAddress: signers[0].address
        });
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress(mockPost.author.address);
        expect(resolvedAuthorAddress).to.equal(signers[6].address);

        expect(mockPost.author.address).to.equal("plebbit.eth");

        await publishWithExpectedResult(mockPost, true);

        expect(mockPost.author.address).to.equal("plebbit.eth");
        expect(mockPost.ipnsKeyName).to.be.undefined;
        mockComments.push(mockPost);
    });

    if (!isRpcFlagOn())
        it(`Subplebbit rejects a comment if plebbit-author-address points to a different address than signer`, async () => {
            // There are two mocks of resovleAuthorAddressIfNeeded, one return null on testgibbreish.eth (server side) and this one returns signers[6]
            // The purpose is to test whether server rejects publications that has different plebbit-author-address and signer address
            const testEthRpc = `testEthRpc${uuidV4()}.com`;

            const authorAddress = "testgibbreish.eth";
            const tempPlebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: [testEthRpc] } } });

            resolverClass.viemClients["eth" + testEthRpc] = {
                getEnsText: ({ name, key }) => {
                    if (name === authorAddress && key === "plebbit-author-address") return signers[6].address;
                    else return null;
                }
            };

            const mockPost = await tempPlebbit.createComment({
                author: { displayName: `Mock Author - ${Date.now()}`, address: authorAddress },
                signer: signers[6],
                content: `Mock comment - ${Date.now()}`,
                title: "Mock post Title",
                subplebbitAddress: signers[0].address
            });

            expect(mockPost.author.address).to.equal(authorAddress);

            await publishWithExpectedResult(mockPost, false, messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
            expect(mockPost.author.address).to.equal("testgibbreish.eth");
        });

    if (!isRpcFlagOn())
        it(`comment.update() corrects author.address to derived address in case plebbit-author-address points to another address`, async () => {
            const tempPlebbit = await mockRemotePlebbit();
            const comment = await tempPlebbit.createComment({ cid: mockComments[mockComments.length - 1].cid });
            comment._clientsManager.resolveAuthorAddressIfNeeded = async (authorAddress) =>
                authorAddress === "plebbit.eth" ? signers[7].address : authorAddress;
            // verifyComment in comment.update should overwrite author.address to derived address
            await comment.update();
            await new Promise((resolve) => comment.once("update", resolve));
            await comment.stop();
            expect(comment.author.address).to.equal(signers[6].address);
        });
});

describe(`Vote with authors as domains`, async () => {
    let plebbit, subplebbit, comment;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
        comment = await publishRandomPost(subplebbit.address, plebbit, {}, false);
    });

    if (!isRpcFlagOn())
        it(`Subplebbit rejects a Vote with author.address (domain) that resolves to a different signer`, async () => {
            const testEthRpc = `testEthRpc${uuidV4()}.com`;
            const tempPlebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: [testEthRpc] } } });

            resolverClass.viemClients["eth" + testEthRpc] = {
                getEnsText: ({ name, key }) => {
                    if (name === authorAddress && key === "plebbit-author-address") return signers[6].address;
                    else return null;
                }
            };
            const vote = await tempPlebbit.createVote({
                author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
                signer: signers[6],
                commentCid: comment.cid,
                vote: -1,
                subplebbitAddress: subplebbit.address
            });
            expect(vote.author.address).to.equal("testgibbreish.eth");

            await publishWithExpectedResult(vote, false, messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
            expect(vote.author.address).to.equal("testgibbreish.eth");
        });
});

// This code won't run in rpc clients
describe(`Resolving resiliency`, async () => {
    it(`Resolver retries four times before throwing error`, async () => {
        const testEthRpc = `testEthRpc${uuidV4()}.com`;
        const plebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: [testEthRpc] } } });

        let resolveHit = 0;

        const address = "madeupname" + Math.round(Date.now()) + ".eth";

        const subplebbitTextRecordOfAddress = "12D3KooWJJcSwxH2F3sFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // made up ipns

        resolverClass.viemClients["eth" + testEthRpc] = {
            getEnsText: ({ name, key }) => {
                resolveHit++;
                if (resolveHit < 4) throw Error("failed to resolve because whatever");
                else return subplebbitTextRecordOfAddress;
            }
        };

        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress(address);
        expect(resolvedAuthorAddress).to.equal(subplebbitTextRecordOfAddress);
        expect(resolveHit).to.equal(4);
    });
});
