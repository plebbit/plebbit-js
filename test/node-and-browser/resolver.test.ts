import { beforeAll, afterAll, describe, it } from "vitest";
import signers from "../fixtures/signers.js";
import { messages } from "../../dist/node/errors.js";
import {
    mockRemotePlebbit,
    mockUpdatingCommentResolvingAuthor,
    publishWithExpectedResult,
    publishRandomPost,
    itSkipIfRpc,
    describeSkipIfRpc,
    mockViemClient,
    resolveWhenConditionIsTrue,
    mockCacheOfTextRecord,
    mockPlebbitV2
} from "../../dist/node/test/test-util.js";
import { v4 as uuidV4 } from "uuid";
import type { Plebbit } from "../../dist/node/plebbit/plebbit.js";
import type { RemoteSubplebbit } from "../../dist/node/subplebbit/remote-subplebbit.js";
import type { Comment } from "../../dist/node/publications/comment/comment.js";

const mockComments: Comment[] = [];

// Clients of RPC will trust the response of RPC and won't validate
// Skip testing for now because they keep failing randomly in github CI tests
describeSkipIfRpc.skip(`Resolving text records`, async () => {
    it.skip(`Can resolve correctly with just viem`, async () => {
        const plebbit = await mockRemotePlebbit({ plebbitOptions: { chainProviders: { eth: { urls: ["viem"], chainId: 1 } } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["viem"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress({ address: "estebanabaroa.eth" });
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });

    it.skip(`Can resolve correctly with just ethers.js`, async () => {
        const plebbit = await mockRemotePlebbit({ plebbitOptions: { chainProviders: { eth: { urls: ["ethers.js"], chainId: 1 } } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["ethers.js"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress({ address: "estebanabaroa.eth" });
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });
    it.skip(`Can resolve correctly with custom chain provider`, async () => {
        const plebbit = await mockRemotePlebbit({ plebbitOptions: { chainProviders: { eth: { urls: ["https://cloudflare-eth.com/"], chainId: 1 } } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["https://cloudflare-eth.com/"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress({ address: "estebanabaroa.eth" });
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });
    it.skip(`Can resolve correctly with viem, ethers.js and a custom chain provider`, async () => {
        const plebbit = await mockRemotePlebbit({
            plebbitOptions: { chainProviders: { eth: { urls: ["https://cloudflare-eth.com/", "viem", "ethers.js"], chainId: 1 } } }
        }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["https://cloudflare-eth.com/", "viem", "ethers.js"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress({ address: "estebanabaroa.eth" });
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });

    // We don't need to test resolving solana domains anymore
    describe.skip(`Resolving solana domains`, async () => {
        let plebbit: Plebbit;
        beforeAll(async () => {
            plebbit = await mockPlebbitV2({
                plebbitOptions: { chainProviders: { sol: { urls: ["web3.js"], chainId: -1 } } },
                forceMockPubsub: true,
                stubStorage: true,
                mockResolve: false
            }); // Should not mock resolver
        });

        afterAll(async () => {
            await plebbit.destroy();
        });

        it(`A solana domain that has no subplebbit-address will return null when resolved`, async () => {
            const subAddress = "randomdomain.sol";
            const ipnsAddress = await plebbit._clientsManager.resolveSubplebbitAddressIfNeeded(subAddress);
            expect(ipnsAddress).to.be.null;
        });

        it(`Can resolve A solana domain with correct subplebbit-address subdomain correctly`, async () => {
            const subAddress = "redditdeath.sol";
            const ipnsAddress = await plebbit._clientsManager.resolveSubplebbitAddressIfNeeded(subAddress);
            expect(ipnsAddress).to.equal("12D3KooWKuojPWVJRMsQGMHzKKHY8ZVbU84vaetkaiymoqvDMe9z");
        });

        it(`Can resolve A solana domain with correct plebbit-author-address subdomain correctly`, async () => {
            const authorAddress = "redditdeath.sol";
            const ipnsAddress = await plebbit.resolveAuthorAddress({ address: authorAddress });
            expect(ipnsAddress).to.equal("12D3KooWAszaoiJKCZCSeeKsjycPDrjdYG1zABbFdsgVenxdi9ma");
        });
    });
});

describe("Comments with Authors as domains", async () => {
    let plebbit: Plebbit;
    beforeAll(async () => {
        plebbit = await mockRemotePlebbit();
    });

    afterAll(async () => {
        await plebbit.destroy();
    });

    it(`Sub accepts posts with author.address as a domain that resolves to comment signer `, async () => {
        // I've mocked plebbit.resolver.resolveAuthorAddressIfNeeded to return signers[6] address for plebbit.bso
        const mockPost = await plebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.bso" },
            signer: signers[6],
            content: `Mock post - ${Date.now()}`,
            title: "Mock post title",
            subplebbitAddress: signers[0].address
        });
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress({ address: mockPost.author.address });
        expect(resolvedAuthorAddress).to.equal(signers[6].address);

        expect(mockPost.author.address).to.equal("plebbit.bso");

        await publishWithExpectedResult(mockPost, true);

        expect(mockPost.author.address).to.equal("plebbit.bso");
        // ipnsKeyName is an internal property that may not be in the type definition
        expect((mockPost as Comment & { ipnsKeyName?: string }).ipnsKeyName).to.be.undefined;
        mockComments.push(mockPost);
    });

    itSkipIfRpc(`Subplebbit rejects a comment if plebbit-author-address points to a different address than signer`, async () => {
        // There are two mocks of resovleAuthorAddressIfNeeded, one return null on testgibbreish.bso (server side) and this one returns signers[6]
        // The purpose is to test whether server rejects publications that has different plebbit-author-address and signer address

        const authorAddress = "testgibbreish.bso";
        const tempPlebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true });

        await mockCacheOfTextRecord({
            plebbit: tempPlebbit,
            domain: authorAddress,
            textRecord: "plebbit-author-address",
            value: signers[6].address
        });

        const mockPost = await tempPlebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: authorAddress },
            signer: signers[6],
            content: `Mock comment - ${Date.now()}`,
            title: "Mock post Title",
            subplebbitAddress: signers[0].address
        });

        expect(mockPost.author.address).to.equal(authorAddress);

        await publishWithExpectedResult(mockPost, false, messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
        expect(mockPost.author.address).to.equal("testgibbreish.bso");
        await tempPlebbit.destroy();
    });

    itSkipIfRpc(
        `comment.update() corrects author.address to derived address in case plebbit-author-address points to another address`,
        async () => {
            const tempPlebbit = await mockRemotePlebbit();
            const comment = await tempPlebbit.createComment({ cid: mockComments[mockComments.length - 1].cid });
            const originalResolvingFunction = comment._clientsManager.resolveAuthorAddressIfNeeded.bind(comment._clientsManager);
            // verifyComment in comment.update should overwrite author.address to derived address
            await comment.update();
            mockUpdatingCommentResolvingAuthor(comment, async (authorAddress: string) =>
                authorAddress === "plebbit.bso" ? signers[7].address : originalResolvingFunction(authorAddress)
            );
            await resolveWhenConditionIsTrue({ toUpdate: comment, predicate: async () => Boolean(comment.author?.address) });
            await comment.stop();
            expect(comment.author.address).to.equal(signers[6].address);
            await tempPlebbit.destroy();
        }
    );
});

describe(`Vote with authors as domains`, async () => {
    let plebbit: Plebbit;
    let subplebbit: RemoteSubplebbit;
    let comment: Comment;
    beforeAll(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit({ address: signers[0].address });
        comment = await publishRandomPost(subplebbit.address, plebbit, {});
    });

    afterAll(async () => {
        await plebbit.destroy();
    });

    itSkipIfRpc(`Subplebbit rejects a Vote with author.address (domain) that resolves to a different signer`, async () => {
        const tempPlebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true });
        const authorAddress = "testgibbreish.bso";
        await mockCacheOfTextRecord({
            plebbit: tempPlebbit,
            domain: authorAddress,
            textRecord: "plebbit-author-address",
            value: signers[6].address
        });

        const vote = await tempPlebbit.createVote({
            author: { address: authorAddress },
            signer: signers[6],
            commentCid: comment.cid!,
            vote: -1,
            subplebbitAddress: subplebbit.address
        });
        expect(vote.author.address).to.equal("testgibbreish.bso");

        await publishWithExpectedResult(vote, false, messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
        expect(vote.author.address).to.equal("testgibbreish.bso");
        await tempPlebbit.destroy();
    });
});

describeSkipIfRpc(`BSO domain resolution`, async () => {
    it(`.bso subplebbit-address resolves correctly (substitutes to .eth for ENS query)`, async () => {
        const testEthRpc = `https://testEthRpc${uuidV4()}.com`;
        const plebbit = await mockPlebbitV2({
            plebbitOptions: { chainProviders: { eth: { urls: [testEthRpc], chainId: 1 } } },
            remotePlebbit: true,
            mockResolve: false
        });

        const expectedIpns = "12D3KooWJJcSwxH2F3sFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y";

        mockViemClient({
            plebbit,
            chainTicker: "eth",
            url: testEthRpc,
            mockedViem: {
                getEnsText: ({ name, key }: { name: string; key: string }) => {
                    // The resolver should receive .eth, not .bso
                    expect(name).to.equal("plebbit.eth");
                    expect(key).to.equal("subplebbit-address");
                    return expectedIpns;
                }
            }
        });

        const resolved = await plebbit._clientsManager.resolveSubplebbitAddressIfNeeded("plebbit.bso");
        expect(resolved).to.equal(expectedIpns);
        await plebbit.destroy();
    });

    it(`.bso plebbit-author-address resolves correctly`, async () => {
        const testEthRpc = `https://testEthRpc${uuidV4()}.com`;
        const plebbit = await mockPlebbitV2({
            plebbitOptions: { chainProviders: { eth: { urls: [testEthRpc], chainId: 1 } } },
            remotePlebbit: true,
            mockResolve: false
        });

        const expectedAuthorAddress = "12D3KooWJJcSwMHrFvsFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y";

        mockViemClient({
            plebbit,
            chainTicker: "eth",
            url: testEthRpc,
            mockedViem: {
                getEnsText: ({ name, key }: { name: string; key: string }) => {
                    expect(name).to.equal("testauthor.eth");
                    expect(key).to.equal("plebbit-author-address");
                    return expectedAuthorAddress;
                }
            }
        });

        const resolved = await plebbit.resolveAuthorAddress({ address: "testauthor.bso" });
        expect(resolved).to.equal(expectedAuthorAddress);
        await plebbit.destroy();
    });

    it(`Cache key uses original .bso address (independent from .eth cache)`, async () => {
        const testEthRpc = `https://testEthRpc${uuidV4()}.com`;
        const plebbit = await mockPlebbitV2({
            plebbitOptions: { chainProviders: { eth: { urls: [testEthRpc], chainId: 1 } } },
            remotePlebbit: true,
            stubStorage: false,
            mockResolve: false
        });

        const bsoIpns = "12D3KooWJJcSwxH2F3sFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y";
        const ethIpns = "12D3KooWNMYPSuNadceoKsJ6oUQcxGcfiAsHNpVTt1RQ1zSrKKpo";

        // Cache .bso and .eth with different values
        await mockCacheOfTextRecord({ plebbit, domain: "plebbit.bso", textRecord: "subplebbit-address", value: bsoIpns });
        await mockCacheOfTextRecord({ plebbit, domain: "plebbit.eth", textRecord: "subplebbit-address", value: ethIpns });

        // Resolving .bso should return .bso's cached value, not .eth's
        const resolvedBso = await plebbit._clientsManager.resolveSubplebbitAddressIfNeeded("plebbit.bso");
        expect(resolvedBso).to.equal(bsoIpns);

        const resolvedEth = await plebbit._clientsManager.resolveSubplebbitAddressIfNeeded("plebbit.eth");
        expect(resolvedEth).to.equal(ethIpns);

        await plebbit.destroy();
    });
});

describe("Comments with Authors as .bso domains", async () => {
    let plebbit: Plebbit;
    beforeAll(async () => {
        plebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true });
    });

    afterAll(async () => {
        await plebbit.destroy();
    });

    it(`Sub accepts posts with author.address as .bso domain that resolves to comment signer`, async () => {
        // Mock the cache so plebbit.bso resolves to signers[6] address (same as plebbit.eth mock)
        await mockCacheOfTextRecord({
            plebbit,
            domain: "plebbit.bso",
            textRecord: "plebbit-author-address",
            value: signers[6].address
        });

        const mockPost = await plebbit.createComment({
            author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.bso" },
            signer: signers[6],
            content: `Mock post - ${Date.now()}`,
            title: "Mock post title .bso",
            subplebbitAddress: signers[0].address
        });

        expect(mockPost.author.address).to.equal("plebbit.bso");
        await publishWithExpectedResult(mockPost, true);
        expect(mockPost.author.address).to.equal("plebbit.bso");
    });
});

// This code won't run in rpc clients
describeSkipIfRpc(`Resolving resiliency`, async () => {
    it(`Resolver retries four times before throwing error`, async () => {
        const testEthRpc = `https://testEthRpc${uuidV4()}.com`;
        const plebbit = await mockPlebbitV2({
            plebbitOptions: { chainProviders: { eth: { urls: [testEthRpc], chainId: 1 } } },
            remotePlebbit: true,
            mockResolve: false
        });

        let resolveHit = 0;

        const address = "madeupname" + Math.round(Date.now()) + ".bso";

        const subplebbitTextRecordOfAddress = "12D3KooWJJcSwxH2F3sFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // made up ipns

        mockViemClient({
            plebbit,
            chainTicker: "eth",
            url: testEthRpc,
            mockedViem: {
                getEnsText: ({ name, key }: { name: string; key: string }) => {
                    resolveHit++;
                    if (resolveHit < 4) throw Error("failed to resolve because whatever");
                    else return subplebbitTextRecordOfAddress;
                }
            }
        });

        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress({ address: address });
        expect(resolvedAuthorAddress).to.equal(subplebbitTextRecordOfAddress);
        expect(resolveHit).to.equal(4);
        await plebbit.destroy();
    });
});
