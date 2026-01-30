import { beforeAll, afterAll } from "vitest";
import {
    generateMockPost,
    publishWithExpectedResult,
    mockPlebbitV2,
    mockViemClient,
    describeSkipIfRpc,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";

import signers from "../../../fixtures/signers.js";
import Sinon from "sinon";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { PrivateKeyAccount } from "viem/accounts";
import * as chains from "viem/chains"; // This will increase bundle size, should only import needed chains
import { v4 as uuidV4 } from "uuid";

import { createPublicClient, http } from "viem";
import type { PublicClient } from "viem";
import type { Plebbit as PlebbitType } from "../../../../dist/node/plebbit/plebbit.js";
import type { LocalSubplebbit } from "../../../../dist/node/runtime/node/subplebbit/local-subplebbit.js";
import type { DecryptedChallengeVerificationMessageType } from "../../../../dist/node/pubsub-messages/types.js";
import type { SubplebbitSettings } from "../../../../dist/node/subplebbit/types.js";

describeSkipIfRpc(`Test evm-contract challenge`, async () => {
    const viemSandbox = Sinon.createSandbox();

    const settings: SubplebbitSettings = {
        challenges: [
            {
                name: "evm-contract-call",
                options: {
                    chainTicker: "eth",
                    // contract address
                    address: "0xEA81DaB2e0EcBc6B5c4172DE4c22B6Ef6E55Bd8f",
                    // abi of the contract method
                    abi: '{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}',
                    condition: ">1000",
                    // error to display to the user if condition fails
                    error: "PLEB token balance must be greater than 1000."
                }
            }
        ]
    };

    let plebbit: PlebbitType;
    let sub: LocalSubplebbit;

    let actualViemClient: PublicClient;
    let viemAccount: PrivateKeyAccount;
    const viemEthFake: Record<string, Function> = {};
    const viemMaticFake: Record<string, Function> = {};
    beforeAll(async () => {
        const ethRpcUrl = `https://Fake${uuidV4()}eth.com`;
        const maticRpcUrl = `https://Fake${uuidV4()}matic.com`;
        plebbit = await mockPlebbitV2({
            plebbitOptions: {
                resolveAuthorAddresses: false,
                chainProviders: { eth: { urls: [ethRpcUrl], chainId: 1 }, matic: { urls: [maticRpcUrl], chainId: 137 } }
            },
            remotePlebbit: false,
            mockResolve: false
        });
        actualViemClient = createPublicClient({
            chain: chains.mainnet,
            transport: http()
        }) as PublicClient;
        viemMaticFake["verifyMessage"] = viemEthFake["verifyMessage"] = actualViemClient.verifyMessage;

        mockViemClient({ plebbit, chainTicker: "eth", mockedViem: viemEthFake, url: ethRpcUrl });
        mockViemClient({ plebbit, chainTicker: "matic", mockedViem: viemMaticFake, url: maticRpcUrl });

        sub = await plebbit.createSubplebbit() as LocalSubplebbit;
        await sub.edit({ settings });
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: async () => typeof sub.updatedAt === "number" });

        // Set up viem account
        const privateKey = generatePrivateKey();
        viemAccount = privateKeyToAccount(privateKey);
    });

    afterAll(async () => {
        await sub.delete();
        viemSandbox.restore();
        delete plebbit._domainResolver._viemClients["eth" + plebbit.chainProviders["eth"].urls[0]];
        delete plebbit._domainResolver._viemClients["matic" + plebbit.chainProviders["matic"].urls[0]];
        await plebbit.destroy();
    });
    it(`A wallet with over 1000 PLEB passes the challenge`, async () => {
        const authorSigner = await plebbit.createSigner();
        const walletMessageToSign: Record<string, string | number> = {};
        walletMessageToSign.domainSeparator = "plebbit-author-wallet";
        walletMessageToSign.authorAddress = authorSigner.address;
        walletMessageToSign.timestamp = Math.round(Date.now() / 1000);

        const stringifiedMessageToSign = JSON.stringify(walletMessageToSign);

        const walletSignature = await viemAccount.signMessage({ message: stringifiedMessageToSign });

        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: {
                wallets: {
                    eth: {
                        address: viemAccount.address,
                        signature: { signature: walletSignature, type: "eip191" },
                        timestamp: walletMessageToSign.timestamp as number
                    }
                }
            }
        });
        expect(postWithAuthorAddress.author.address).to.equal(authorSigner.address);
        expect(postWithAuthorAddress.signer!.privateKey).to.equal(authorSigner.privateKey);
        expect(postWithAuthorAddress.author.wallets!.eth.address).to.equal(viemAccount.address);

        const isSignatureValid = await actualViemClient.verifyMessage({
            address: postWithAuthorAddress.author.wallets!.eth.address as `0x${string}`,
            message: stringifiedMessageToSign,
            signature: postWithAuthorAddress.author.wallets!.eth.signature.signature as `0x${string}`
        });

        expect(isSignatureValid).to.be.true;

        // viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000865a0735887d15fcf91fa302" }); // mock nft wallet to have 0 pleb

        await publishWithExpectedResult(postWithAuthorAddress, true);
    });

    it(`A wallet with over 0 PLEB fails the challenge`, async () => {
        const authorSigner = await plebbit.createSigner();
        const walletMessageToSign: Record<string, string | number> = {};
        walletMessageToSign.domainSeparator = "plebbit-author-wallet";
        walletMessageToSign.authorAddress = authorSigner.address;
        walletMessageToSign.timestamp = Math.round(Date.now() / 1000);

        const walletSignature = await viemAccount.signMessage({ message: JSON.stringify(walletMessageToSign) }); // corrupt signature by adding "1"

        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: {
                wallets: {
                    eth: {
                        address: viemAccount.address,
                        signature: { signature: walletSignature, type: "eip191" },
                        timestamp: walletMessageToSign.timestamp as number
                    }
                }
            }
        });

        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise<DecryptedChallengeVerificationMessageType>((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.comment).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='PLEB token balance must be greater than 1000.', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='Author has no avatar NFT set'`;
        expect(challengeVerification.challengeErrors).to.deep.equal({ 0: challengeError });
    });

    it(`An author with NFT wallet with over 1000 PLEB should pass the challenge`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign: Record<string, string | number> = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress as string,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId as string,
            timestamp: avatarMessageToSign.timestamp as number,
            signature: { signature: avatarSignature, type: "eip191" as const }
        };
        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: { avatar }
        });

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000865a0735887d15fcf91fa302" }); // mock nft wallet to have more than 100 pleb

        await publishWithExpectedResult(postWithAuthorAddress, true);
    });
    it(`An author with NFT wallet with less than 100 PLEB should fail the challenge`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign: Record<string, string | number> = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress as string,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId as string,
            timestamp: avatarMessageToSign.timestamp as number,
            signature: { signature: avatarSignature, type: "eip191" as const }
        };
        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: { avatar }
        });

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise<DecryptedChallengeVerificationMessageType>((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.comment).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='The author wallet address is not defined', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='PLEB token balance must be greater than 1000.'`;
        expect(challengeVerification.challengeErrors).to.deep.equal({ 0: challengeError });
    });
    it(`An author with no NFT or wallet should fail immeditely`, async () => {
        const post = await generateMockPost(sub.address, plebbit);

        await post.publish();
        const challengeVerification = await new Promise<DecryptedChallengeVerificationMessageType>((resolve) => post.once("challengeverification", resolve));
        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.comment).to.be.undefined;
        const challengeError = `Author (${post.author.address}) has failed all EVM challenges, walletFailureReason='The author wallet address is not defined', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='Author has no avatar NFT set'`;
        expect(challengeVerification.challengeErrors).to.deep.equal({ 0: challengeError });
    });

    it(`An author with wallet with less than 1000 PLEB and an NFT wallet with more than 1000 PLEB should passs`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign: Record<string, string | number> = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress as string,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId as string,
            timestamp: avatarMessageToSign.timestamp as number,
            signature: { signature: avatarSignature, type: "eip191" as const }
        };

        // wallet
        const walletMessageToSign: Record<string, string | number> = {};
        walletMessageToSign.domainSeparator = "plebbit-author-wallet";
        walletMessageToSign.authorAddress = authorSigner.address;
        walletMessageToSign.timestamp = Math.round(Date.now() / 1000);

        const walletSignature = await viemAccount.signMessage({ message: JSON.stringify(walletMessageToSign) }); // corrupt signature by adding "1"

        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: {
                avatar,
                wallets: {
                    eth: {
                        address: viemAccount.address,
                        signature: { signature: walletSignature, type: "eip191" },
                        timestamp: walletMessageToSign.timestamp as number
                    }
                }
            }
        });

        let callCount = 0;
        const fakeCall = async () => {
            callCount++;
            if (callCount === 1)
                return { data: "0x0000000000000000000000000000000000000000000000000000000000000000" }; // for wallet
            else return { data: "0x0000000000000000000000000000000000000000865a0735887d15fcf91fa302" };
        };

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = fakeCall; // mock nft wallet to have more than 100 pleb

        await publishWithExpectedResult(postWithAuthorAddress, true);
    });
    it(`An author with both wallet and NFT having less than 1000 PLEB fails`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign: Record<string, string | number> = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress as string,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId as string,
            timestamp: avatarMessageToSign.timestamp as number,
            signature: { signature: avatarSignature, type: "eip191" as const }
        };

        // wallet
        const walletMessageToSign: Record<string, string | number> = {};
        walletMessageToSign.domainSeparator = "plebbit-author-wallet";
        walletMessageToSign.authorAddress = authorSigner.address;
        walletMessageToSign.timestamp = Math.round(Date.now() / 1000);

        const walletSignature = await viemAccount.signMessage({ message: JSON.stringify(walletMessageToSign) }); // corrupt signature by adding "1"

        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: {
                avatar,
                wallets: {
                    eth: {
                        address: viemAccount.address,
                        signature: { signature: walletSignature, type: "eip191" },
                        timestamp: walletMessageToSign.timestamp as number
                    }
                }
            }
        });

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have more than 100 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise<DecryptedChallengeVerificationMessageType>((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.comment).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='PLEB token balance must be greater than 1000.', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='PLEB token balance must be greater than 1000.'`;
        expect(challengeVerification.challengeErrors).to.deep.equal({ 0: challengeError }); // failed to provide valid NFT
    });

    // Tests on verification of author

    it(`Publication with invalid wallet signature will be rejected`, async () => {
        const authorSigner = await plebbit.createSigner();
        const walletMessageToSign: Record<string, string | number> = {};
        walletMessageToSign.domainSeparator = "plebbit-author-wallet";
        walletMessageToSign.authorAddress = authorSigner.address;
        walletMessageToSign.timestamp = Math.round(Date.now() / 1000);

        const walletSignature = await viemAccount.signMessage({ message: JSON.stringify(walletMessageToSign) + "1" }); // corrupt signature by adding "1"

        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: {
                wallets: {
                    eth: {
                        address: viemAccount.address,
                        signature: { signature: walletSignature, type: "eip191" },
                        timestamp: walletMessageToSign.timestamp as number
                    }
                }
            }
        });

        // viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise<DecryptedChallengeVerificationMessageType>((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.comment).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='The signature of the wallet is invalid', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='Author has no avatar NFT set'`;
        expect(challengeVerification.challengeErrors).to.deep.equal({ 0: challengeError }); // failed to provide valid NFT
    });

    it(`Publication with invalid NFT signature will be rejected`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign: Record<string, string | number> = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) + "1" }); // corrupt signature by adding "1"
        const avatar = {
            address: avatarMessageToSign.tokenAddress as string,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId as string,
            timestamp: avatarMessageToSign.timestamp as number,
            signature: { signature: avatarSignature, type: "eip191" as const }
        };
        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: { avatar }
        });

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise<DecryptedChallengeVerificationMessageType>((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.comment).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='The author wallet address is not defined', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='The signature of the nft avatar is invalid'`;
        expect(challengeVerification.challengeErrors).to.deep.equal({ 0: challengeError }); // failed to provide valid NFT
    });

    // ENS tests
    it(`if user have pleb in their author.address ENS wallet challenge should pass`, async () => {
        const post = await generateMockPost(sub.address, plebbit, false, {
            signer: signers[6],
            author: { address: "plebbit.eth" }
        });

        viemEthFake["getEnsAddress"] = () => viemAccount.address;
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000865a0735887d15fcf91fa302" }); // mock nft wallet to have more than 100 pleb

        await publishWithExpectedResult(post, true);
    });
});
