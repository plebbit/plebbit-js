import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    mockRemotePlebbitIpfsOnly,
    generatePostToAnswerMathQuestion,
    publishRandomPost,
    describeSkipIfRpc,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util";
import signers from "../../fixtures/signers";
import Sinon from "sinon";
import * as util from "../../../dist/node/constants";
import chai from "chai";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import chaiAsPromised from "chai-as-promised";
import * as chains from "viem/chains"; // This will increase bundle size, should only import needed chains
import { v4 as uuidV4 } from "uuid";

import { createPublicClient, http } from "viem";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`subplebbit.settings.challenges`, async () => {
    let plebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbitIpfsOnly();
    });

    it(`default challenge is captcha-canvas-v3`, async () => {
        // Should be set to default on subplebbit.start()
        const subplebbit = await plebbit.createSubplebbit({});
        // subplebbit?.settings?.challenges should be set to captcha-canvas-v3
        // also subplebbit.challenges should reflect subplebbit.settings.challenges
        expect(subplebbit?.settings?.challenges).to.deep.equal([
            { name: "captcha-canvas-v3", exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }] }
        ]);

        expect(subplebbit._usingDefaultChallenge).to.be.true;

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges[0].type).to.equal("image/png");
            expect(_subplebbit.challenges[0].challenge).to.be.undefined;
            expect(_subplebbit.challenges[0].description).to.equal("make custom image captcha");
            expect(_subplebbit.challenges[0].exclude).to.deep.equal([
                { role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }
            ]);
        }
        // clean up
        await subplebbit.delete();
    });

    it(`settings.challenges as null or undefined is parsed as []`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        expect(subplebbit?.settings?.challenges).to.not.be.undefined; // Should default to captcha-canvas-v3
        expect(subplebbit._usingDefaultChallenge).to.be.true;

        for (const noChallengeValue of [null, undefined, []]) {
            await subplebbit.edit({ settings: { challenges: noChallengeValue } });
            expect(subplebbit._usingDefaultChallenge).to.be.false;
            expect(subplebbit?.settings.challenges).to.deep.equal([]);
            expect(subplebbit.challenges).to.deep.equal([]);
        }

        await subplebbit.delete();
    });

    it(`settings.challenges=[] means sub won't send a challenge`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        await subplebbit.edit({ settings: { challenges: [] } });
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // won't get a challenge

        await subplebbit.delete();
    });

    itSkipIfRpc(`plebbit-js will upgrade default challenge if there is a new one`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        expect(subplebbit.settings.challenges).to.deep.equal([
            { name: "captcha-canvas-v3", exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }] }
        ]);
        expect(subplebbit._usingDefaultChallenge).to.be.true;
        const differentDefaultChallenges = [];
        subplebbit._defaultSubplebbitChallenges = differentDefaultChallenges;
        await subplebbit.start(); // Should check value of default challenge, and upgrade to this one above
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        expect(subplebbit.challenges).to.deep.equal([]);
        expect(subplebbit._usingDefaultChallenge).to.be.true;
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // won't get a challenge
        await subplebbit.delete();
    });

    it(`Can set a basic question challenge system`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        const challenges = [{ name: "question", options: { question: "1+1=?", answer: "2" } }];
        await subplebbit.edit({ settings: { challenges } });
        expect(subplebbit._usingDefaultChallenge).to.be.false;

        expect(subplebbit?.settings?.challenges).to.deep.equal(challenges);

        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");

        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);

        expect(subplebbit.updatedAt).to.equal(remoteSub.updatedAt);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges[0].challenge).to.equal("1+1=?");
            expect(_subplebbit.challenges[0].description).to.equal("Ask a question, like 'What is the password?'");
            expect(_subplebbit.challenges[0].exclude).to.be.undefined;
            expect(_subplebbit.challenges[0].type).to.equal("text/plain");
        }

        const mockPost = await generateMockPost(subplebbit.address, plebbit, false, { challengeAnswers: ["2"] });

        expect(mockPost.challengeAnswers).to.deep.equal(["2"]);

        let receivedChallenge = false;
        mockPost.once("challenge", (msg) => {
            receivedChallenge = true;
        });

        await publishWithExpectedResult(mockPost, true);

        expect(receivedChallenge).to.be.false;

        await subplebbit.delete();
    });

    it(`subplebbit.settings.challenges isn't overridden with subplebbit.start() if it was edited before starting the sub`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        await subplebbit.edit({ settings: { challenges: undefined } });
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        expect(subplebbit._usingDefaultChallenge).to.be.false;
        expect(subplebbit.challenges).to.deep.equal([]);
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) expect(_subplebbit.challenges).to.deep.equal([]);

        await subplebbit.delete();
    });
});

describeSkipIfRpc(`Test evm-contract challenge`, async () => {
    const viemSandbox = Sinon.createSandbox();

    const settings = {
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

    let plebbit, sub;

    let actualViemClient;
    let viemAccount;
    const viemEthFake = {};
    const viemMaticFake = {};
    before(async () => {
        const ethRpcUrl = `Fake${uuidV4()}eth.com`;
        const maticRpcUrl = `Fake${uuidV4()}matic.com`;
        plebbit = await mockPlebbit({
            resolveAuthorAddresses: false,
            chainProviders: { eth: { urls: [ethRpcUrl] }, matic: { urls: [maticRpcUrl] } }
        });
        actualViemClient = createPublicClient({
            chain: chains.mainnet,
            transport: http()
        });
        viemMaticFake["verifyMessage"] = viemEthFake["verifyMessage"] = actualViemClient.verifyMessage;
        util._viemClients["eth" + plebbit.chainProviders["eth"].urls[0]] = viemEthFake;
        util._viemClients["matic" + plebbit.chainProviders["matic"].urls[0]] = viemMaticFake;

        sub = await plebbit.createSubplebbit();
        await sub.edit({ settings });
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

        // Set up viem account
        const privateKey = generatePrivateKey();
        viemAccount = privateKeyToAccount(privateKey);
    });

    after(async () => {
        await sub.delete();
        viemSandbox.restore();
        delete util._viemClients["eth" + plebbit.chainProviders["eth"].urls[0]];
        delete util._viemClients["matic" + plebbit.chainProviders["matic"].urls[0]];
    });
    it(`A wallet with over 1000 PLEB passes the challenge`, async () => {
        const authorSigner = await plebbit.createSigner();
        const walletMessageToSign = {};
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
                        timestamp: walletMessageToSign.timestamp
                    }
                }
            }
        });

        // viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000865a0735887d15fcf91fa302" }); // mock nft wallet to have 0 pleb

        await publishWithExpectedResult(postWithAuthorAddress, true);
    });

    it(`A wallet with over 0 PLEB fails the challenge`, async () => {
        const authorSigner = await plebbit.createSigner();
        const walletMessageToSign = {};
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
                        timestamp: walletMessageToSign.timestamp
                    }
                }
            }
        });

        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.publication).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='PLEB token balance must be greater than 1000.', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='Author has no avatar NFT set'`;
        expect(challengeVerification.challengeErrors).to.deep.equal([challengeError]);
    });

    it(`An author with NFT wallet with over 1000 PLEB should pass the challenge`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId,
            timestamp: avatarMessageToSign.timestamp,
            signature: { signature: avatarSignature, type: "eip191" }
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
        const avatarMessageToSign = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId,
            timestamp: avatarMessageToSign.timestamp,
            signature: { signature: avatarSignature, type: "eip191" }
        };
        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: { avatar }
        });

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.publication).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='The author wallet address is not defined', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='PLEB token balance must be greater than 1000.'`;
        expect(challengeVerification.challengeErrors).to.deep.equal([challengeError]);
    });
    it(`An author with no NFT or wallet should fail immeditely`, async () => {
        const post = await generateMockPost(sub.address, plebbit);

        await post.publish();
        const challengeVerification = await new Promise((resolve) => post.once("challengeverification", resolve));
        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.publication).to.be.undefined;
        const challengeError = `Author (${post.author.address}) has failed all EVM challenges, walletFailureReason='The author wallet address is not defined', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='Author has no avatar NFT set'`;
        expect(challengeVerification.challengeErrors).to.deep.equal([challengeError]);
    });

    it(`An author with wallet with less than 1000 PLEB and an NFT wallet with more than 1000 PLEB should passs`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId,
            timestamp: avatarMessageToSign.timestamp,
            signature: { signature: avatarSignature, type: "eip191" }
        };

        // wallet
        const walletMessageToSign = {};
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
                        timestamp: walletMessageToSign.timestamp
                    }
                }
            }
        });

        let callCount = 0;
        const fakeCall = async (args) => {
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
        const avatarMessageToSign = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) });
        const avatar = {
            address: avatarMessageToSign.tokenAddress,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId,
            timestamp: avatarMessageToSign.timestamp,
            signature: { signature: avatarSignature, type: "eip191" }
        };

        // wallet
        const walletMessageToSign = {};
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
                        timestamp: walletMessageToSign.timestamp
                    }
                }
            }
        });

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have more than 100 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.publication).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='PLEB token balance must be greater than 1000.', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='PLEB token balance must be greater than 1000.'`;
        expect(challengeVerification.challengeErrors).to.deep.equal([challengeError]); // failed to provide valid NFT
    });

    // Tests on verification of author

    it(`Publication with invalid wallet signature will be rejected`, async () => {
        const authorSigner = await plebbit.createSigner();
        const walletMessageToSign = {};
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
                        timestamp: walletMessageToSign.timestamp
                    }
                }
            }
        });

        // viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.publication).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='The signature of the wallet is invalid', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='Author has no avatar NFT set'`;
        expect(challengeVerification.challengeErrors).to.deep.equal([challengeError]); // failed to provide valid NFT
    });

    it(`Publication with invalid NFT signature will be rejected`, async () => {
        const authorSigner = await plebbit.createSigner();
        const avatarMessageToSign = {};
        avatarMessageToSign.domainSeparator = "plebbit-author-avatar";
        avatarMessageToSign.authorAddress = authorSigner.address;
        avatarMessageToSign.timestamp = Math.round(Date.now() / 1000);
        avatarMessageToSign.tokenAddress = "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED";
        avatarMessageToSign.tokenId = "5404"; // must be a type string, not number

        const avatarSignature = await viemAccount.signMessage({ message: JSON.stringify(avatarMessageToSign) + "1" }); // corrupt signature by adding "1"
        const avatar = {
            address: avatarMessageToSign.tokenAddress,
            chainTicker: "matic",
            id: avatarMessageToSign.tokenId,
            timestamp: avatarMessageToSign.timestamp,
            signature: { signature: avatarSignature, type: "eip191" }
        };
        const postWithAuthorAddress = await generateMockPost(sub.address, plebbit, false, {
            signer: authorSigner,
            author: { avatar }
        });

        viemMaticFake["readContract"] = viemSandbox.fake.resolves(viemAccount.address); // NFT ownerof will resolve to this
        viemEthFake["call"] = viemSandbox.fake.resolves({ data: "0x0000000000000000000000000000000000000000000000000000000000000000" }); // mock nft wallet to have 0 pleb

        await postWithAuthorAddress.publish();
        const challengeVerification = await new Promise((resolve) => postWithAuthorAddress.once("challengeverification", resolve));

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.be.undefined;
        expect(challengeVerification.publication).to.be.undefined;
        const challengeError = `Author (${postWithAuthorAddress.author.address}) has failed all EVM challenges, walletFailureReason='The author wallet address is not defined', ensAuthorAddressFailureReason='Author address is not an ENS domain', nftWalletAddressFailureReason='The signature of the nft avatar is invalid'`;
        expect(challengeVerification.challengeErrors).to.deep.equal([challengeError]); // failed to provide valid NFT
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

describe("Validate props of subplebbit Pubsub messages", async () => {
    let plebbit, subplebbit, commentSigner;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        const challenges = [{ name: "question", options: { question: "1+1=?", answer: "2" } }];
        await subplebbit.edit({ settings: { challenges } });

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
        commentSigner = await plebbit.createSigner(); // We're using the same signer for publishing so that publication.author.subplebbit is defined
    });

    after(async () => {
        await subplebbit.delete();
    });

    it(`Validate props of challengerequest`, async () => {
        const comment = await generateMockPost(subplebbit.address, plebbit, false, { signer: commentSigner });
        await comment.publish();
        const request = await new Promise((resolve) => subplebbit.once("challengerequest", resolve));
        expect(JSON.stringify(request.publication)).to.equal(JSON.stringify(comment.toJSONPubsubMessagePublication()));
        expect(request.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(request.challengeRequestId.length).to.equal(38);
        expect(request.type).to.equal("CHALLENGEREQUEST");
        expect(request.acceptedChallengeTypes).to.be.a("array");
        expect(request.encrypted).to.be.a("object");
        expect(request.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(request.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(request.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(request.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(request.protocolVersion).to.be.a("string");
        expect(request.signature).to.be.a("object");
        expect(request.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(request.signature.signature.length).to.equal(64);
        expect(request.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(request.signature.publicKey.length).to.equal(32);
        expect(request.signature.signedPropertyNames).to.deep.equal([
            "type",
            "challengeRequestId",
            "encrypted",
            "acceptedChallengeTypes",
            "timestamp"
        ]);
        expect(request.signature.type).to.equal("ed25519");
        expect(request.timestamp).to.be.a("number");
        expect(request.userAgent).to.be.a("string");
    });

    it(`Validate props of challenge`, async () => {
        const comment = await generateMockPost(subplebbit.address, plebbit, false, { signer: commentSigner });

        await comment.publish();
        const challenge = await new Promise((resolve) => subplebbit.once("challenge", resolve));
        expect(challenge.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challenge.challengeRequestId.length).to.equal(38);
        expect(challenge.type).to.equal("CHALLENGE");
        expect(challenge.challenges).to.be.a("array");
        expect(challenge.challenges[0].challenge).to.be.a("string");
        expect(challenge.challenges[0].index).to.be.a("number");
        expect(challenge.challenges[0].type).to.equal("text/plain");

        expect(challenge.encrypted).to.be.a("object");
        expect(challenge.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(challenge.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(challenge.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(challenge.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(challenge.protocolVersion).to.be.a("string");
        expect(challenge.signature).to.be.a("object");
        expect(challenge.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challenge.signature.signature.length).to.equal(64);
        expect(challenge.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challenge.signature.publicKey.length).to.equal(32);
        expect(challenge.signature.signedPropertyNames).to.deep.equal(["type", "challengeRequestId", "encrypted", "timestamp"]);
        expect(challenge.signature.type).to.equal("ed25519");
        expect(challenge.timestamp).to.be.a("number");
        expect(challenge.userAgent).to.be.a("string");
    });

    it(`Validate props of challengeanswer`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbit.address, signer: commentSigner }, plebbit);

        await comment.publish();
        const challengeAnswer = await new Promise((resolve) => subplebbit.once("challengeanswer", resolve));
        await new Promise((resolve) => comment.once("challengeverification", resolve));
        expect(challengeAnswer.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.challengeRequestId.length).to.equal(38);
        expect(challengeAnswer.type).to.equal("CHALLENGEANSWER");
        expect(challengeAnswer.challengeAnswers).to.deep.equal(["2"]);
        expect(challengeAnswer.encrypted).to.be.a("object");
        expect(challengeAnswer.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(challengeAnswer.protocolVersion).to.be.a("string");
        expect(challengeAnswer.signature).to.be.a("object");
        expect(challengeAnswer.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.signature.signature.length).to.equal(64);
        expect(challengeAnswer.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.signature.publicKey.length).to.equal(32);
        expect(challengeAnswer.signature.signedPropertyNames).to.deep.equal(["type", "challengeRequestId", "encrypted", "timestamp"]);
        expect(challengeAnswer.signature.type).to.equal("ed25519");
        expect(challengeAnswer.timestamp).to.be.a("number");
        expect(challengeAnswer.userAgent).to.be.a("string");
    });

    it(`Validate props of challengeverification (challengeSuccess=false)`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbit.address, signer: commentSigner }, plebbit);

        comment.removeAllListeners();

        comment.once("challenge", async (challengeMsg) => {
            await comment.publishChallengeAnswers(["12345"]); // wrong answer here
        });
        await comment.publish();
        const challengeVerifcation = await new Promise((resolve) => subplebbit.once("challengeverification", resolve));
        expect(challengeVerifcation.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.challengeRequestId.length).to.equal(38);
        expect(challengeVerifcation.type).to.equal("CHALLENGEVERIFICATION");
        expect(challengeVerifcation.challengeErrors).to.deep.equal(["Wrong answer."]);
        expect(challengeVerifcation.challengeSuccess).to.be.false;
        expect(challengeVerifcation.encrypted).to.be.undefined;
        expect(challengeVerifcation.publication).to.be.undefined;
        expect(challengeVerifcation.reason).to.be.undefined;
        expect(challengeVerifcation.protocolVersion).to.be.a("string");
        expect(challengeVerifcation.signature).to.be.a("object");
        expect(challengeVerifcation.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.signature.length).to.equal(64);
        expect(challengeVerifcation.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.publicKey.length).to.equal(32);
        expect(challengeVerifcation.signature.signedPropertyNames).to.deep.equal([
            "reason",
            "type",
            "challengeRequestId",
            "encrypted",
            "challengeSuccess",
            "challengeErrors",
            "timestamp"
        ]);
        expect(challengeVerifcation.signature.type).to.equal("ed25519");
        expect(challengeVerifcation.timestamp).to.be.a("number");
        expect(challengeVerifcation.userAgent).to.be.a("string");
    });

    it(`Validate props of challengeverification (challengeSuccess=true)`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbit.address, signer: commentSigner }, plebbit);

        await comment.publish();
        const challengeVerifcation = await new Promise((resolve) => subplebbit.once("challengeverification", resolve));
        expect(challengeVerifcation.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.challengeRequestId.length).to.equal(38);
        expect(challengeVerifcation.type).to.equal("CHALLENGEVERIFICATION");
        expect(challengeVerifcation.challengeErrors).to.be.undefined;
        expect(challengeVerifcation.challengeSuccess).to.be.true;
        expect(challengeVerifcation.encrypted).to.be.a("object");
        expect(challengeVerifcation.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(challengeVerifcation.publication).to.be.a("object");
        expect(challengeVerifcation.publication.author.subplebbit).to.be.a("object");
        expect(challengeVerifcation.reason).to.be.undefined;
        expect(challengeVerifcation.protocolVersion).to.be.a("string");
        expect(challengeVerifcation.signature).to.be.a("object");
        expect(challengeVerifcation.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.signature.length).to.equal(64);
        expect(challengeVerifcation.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.publicKey.length).to.equal(32);
        expect(challengeVerifcation.signature.signedPropertyNames).to.deep.equal([
            "reason",
            "type",
            "challengeRequestId",
            "encrypted",
            "challengeSuccess",
            "challengeErrors",
            "timestamp"
        ]);
        expect(challengeVerifcation.signature.type).to.equal("ed25519");
        expect(challengeVerifcation.timestamp).to.be.a("number");
        expect(challengeVerifcation.userAgent).to.be.a("string");
    });
});
