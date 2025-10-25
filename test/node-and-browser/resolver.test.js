import { expect } from "chai";
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

const mockComments = [];

// Clients of RPC will trust the response of RPC and won't validate
// Skip testing for now because they keep failing randomly in github CI tests
describeSkipIfRpc.skip(`Resolving text records`, async () => {
    it.skip(`Can resolve correctly with just viem`, async () => {
        const plebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: ["viem"], chainId: 1 } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["viem"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });

    it.skip(`Can resolve correctly with just ethers.js`, async () => {
        const plebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: ["ethers.js"], chainId: 1 } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["ethers.js"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });
    it.skip(`Can resolve correctly with custom chain provider`, async () => {
        const plebbit = await mockRemotePlebbit({ chainProviders: { eth: { urls: ["https://cloudflare-eth.com/"], chainId: 1 } } }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["https://cloudflare-eth.com/"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });
    it.skip(`Can resolve correctly with viem, ethers.js and a custom chain provider`, async () => {
        const plebbit = await mockRemotePlebbit({
            chainProviders: { eth: { urls: ["https://cloudflare-eth.com/", "viem", "ethers.js"], chainId: 1 } }
        }); // Should have viem defined
        plebbit._storage.setItem = plebbit._storage.getItem = () => undefined;
        expect(plebbit.clients.chainProviders["eth"].urls).to.deep.equal(["https://cloudflare-eth.com/", "viem", "ethers.js"]);
        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress("estebanabaroa.eth");
        expect(resolvedAuthorAddress).to.equal("12D3KooWGC8BJJfNkRXSgBvnPJmUNVYwrvSdtHfcsY3ZXJyK3q1z");
        await plebbit.destroy();
    });

    // We don't need to test resolving solana domains anymore
    describe.skip(`Resolving solana domains`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await mockPlebbitV2({
                plebbitOptions: { chainProviders: { sol: { urls: ["web3.js"], chainId: -1 } } },
                forceMockPubsub: true,
                stubStorage: true,
                mockResolve: false
            }); // Should not mock resolver
        });

        after(async () => {
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

    after(async () => {
        await plebbit.destroy();
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

    itSkipIfRpc(`Subplebbit rejects a comment if plebbit-author-address points to a different address than signer`, async () => {
        // There are two mocks of resovleAuthorAddressIfNeeded, one return null on testgibbreish.eth (server side) and this one returns signers[6]
        // The purpose is to test whether server rejects publications that has different plebbit-author-address and signer address

        const authorAddress = "testgibbreish.eth";
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
        expect(mockPost.author.address).to.equal("testgibbreish.eth");
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
            mockUpdatingCommentResolvingAuthor(comment, (authorAddress) =>
                authorAddress === "plebbit.eth" ? signers[7].address : originalResolvingFunction
            );
            await resolveWhenConditionIsTrue({ toUpdate: comment, predicate: () => comment.author?.address });
            await comment.stop();
            expect(comment.author.address).to.equal(signers[6].address);
            await tempPlebbit.destroy();
        }
    );
});

describe(`Vote with authors as domains`, async () => {
    let plebbit, subplebbit, comment;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
        comment = await publishRandomPost(subplebbit.address, plebbit, {}, false);
    });

    after(async () => {
        await plebbit.destroy();
    });

    itSkipIfRpc(`Subplebbit rejects a Vote with author.address (domain) that resolves to a different signer`, async () => {
        const tempPlebbit = await mockPlebbitV2({ stubStorage: false, remotePlebbit: true });
        const authorAddress = "testgibbreish.eth";
        await mockCacheOfTextRecord({
            plebbit: tempPlebbit,
            domain: authorAddress,
            textRecord: "plebbit-author-address",
            value: signers[6].address
        });

        const vote = await tempPlebbit.createVote({
            author: { address: authorAddress },
            signer: signers[6],
            commentCid: comment.cid,
            vote: -1,
            subplebbitAddress: subplebbit.address
        });
        expect(vote.author.address).to.equal("testgibbreish.eth");

        await publishWithExpectedResult(vote, false, messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE);
        expect(vote.author.address).to.equal("testgibbreish.eth");
        await tempPlebbit.destroy();
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

        const address = "madeupname" + Math.round(Date.now()) + ".eth";

        const subplebbitTextRecordOfAddress = "12D3KooWJJcSwxH2F3sFL7YCNDLD95kBczEfkHpPNdxcjZwR2X2Y"; // made up ipns

        mockViemClient({
            plebbit,
            chainTicker: "eth",
            url: testEthRpc,
            mockedViem: {
                getEnsText: ({ name, key }) => {
                    resolveHit++;
                    if (resolveHit < 4) throw Error("failed to resolve because whatever");
                    else return subplebbitTextRecordOfAddress;
                }
            }
        });

        const resolvedAuthorAddress = await plebbit.resolveAuthorAddress(address);
        expect(resolvedAuthorAddress).to.equal(subplebbitTextRecordOfAddress);
        expect(resolveHit).to.equal(4);
        await plebbit.destroy();
    });
});
