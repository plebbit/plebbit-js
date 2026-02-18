import { getPlebbitAddressFromPublicKey } from "../../../../../../signer/util.js";
import type { ChainTicker } from "../../../../../../types.js";
import type { PublicationWithSubplebbitAuthorFromDecryptedChallengeRequest } from "../../../../../../pubsub-messages/types.js";
import type {
    ChallengeFileInput,
    ChallengeInput,
    ChallengeResultInput,
    GetChallengeArgsInput,
    SubplebbitChallengeSetting
} from "../../../../../../subplebbit/types.js";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import Logger from "@plebbit/plebbit-logger";
import type { Plebbit } from "../../../../../../plebbit/plebbit.js";
import { derivePublicationFromChallengeRequest, isStringDomain } from "../../../../../../util.js";
import { normalize } from "viem/ens";

const optionInputs = <NonNullable<ChallengeFileInput["optionInputs"]>>[
    {
        option: "chainTicker",
        label: "chainTicker",
        default: "eth",
        description: "The chain ticker",
        placeholder: "eth",
        required: true
    },
    {
        option: "address",
        label: "Address",
        default: "",
        description: "The contract address.",
        placeholder: "0x...",
        required: true
    },
    {
        option: "abi",
        label: "ABI",
        default: "",
        description: "The ABI of the contract method.",
        placeholder: '{"constant":true,"inputs":[{"internalType":"address","name":"account...',
        required: true
    },
    {
        option: "condition",
        label: "Condition",
        default: "",
        description: "The condition the contract call response must pass.",
        placeholder: ">1000",
        required: true
    },
    {
        option: "error",
        label: "Error",
        default: `Contract call response doesn't pass condition.`,
        description: "The error to display to the author."
    }
];

const description = "The response from an EVM contract call passes a condition, e.g. a token balance challenge.";

// Unrelated to challenges API
//prettier-ignore
const nftAbi = [
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}  
  ];

const supportedConditionOperators = ["=", ">", "<"];

const _getChainProviderWithSafety = (plebbit: Plebbit, chainTicker: ChainTicker) => {
    const chainProvider = plebbit.chainProviders[chainTicker];
    if (!chainProvider) throw Error("plebbit.chainProviders[chainTicker] is not defined");
    return chainProvider;
};

const verifyAuthorWalletAddress = async (props: {
    publication: PublicationWithSubplebbitAuthorFromDecryptedChallengeRequest;
    chainTicker: string;
    condition: string;
    abi: any;
    error: string;
    contractAddress: string;
    plebbit: Plebbit;
}): Promise<string | undefined> => {
    const log = Logger("plebbit-js:local-subplebbit:evm-contract-call-v1:verifyAuthorWalletAddress");
    const authorWallet = props.publication.author.wallets?.[props.chainTicker];
    if (typeof authorWallet?.address !== "string") return "The author wallet address is not defined";
    // Verify first if the signature and resolved address is correct, before running the smart contract
    if (isStringDomain(authorWallet.address)) {
        // resolve plebbit-author-address and check if it matches publication.signature.publicKey
        const resolvedWalletAddress = await props.plebbit.resolveAuthorAddress({ address: authorWallet.address }); // plebbit address
        const publicationSignatureAddress = await getPlebbitAddressFromPublicKey(props.publication.signature.publicKey);
        if (resolvedWalletAddress !== publicationSignatureAddress) {
            const failedMsg =
                "The author wallet address's plebbit-author-address text record should resolve to the public key of the signature";
            log.error(
                `The author wallet address (${authorWallet.address}) resolves to an incorrect value (${resolvedWalletAddress}), but it should resolve to ${publicationSignatureAddress}`
            );
            return failedMsg;
        }
    }

    // verify the signature of the wallet

    // validate if wallet.signature matches JSON {domainSeparator:"plebbit-author-wallet",authorAddress:"${authorAddress},{timestamp:${wallet.timestamp}"}
    const viemClient = props.plebbit._domainResolver._createViemClientIfNeeded(
        "eth",
        _getChainProviderWithSafety(props.plebbit, "eth").urls[0]
    );

    const messageToBeSigned: any = {};
    messageToBeSigned["domainSeparator"] = "plebbit-author-wallet";
    messageToBeSigned["authorAddress"] = props.publication.author.address;
    messageToBeSigned["timestamp"] = authorWallet.timestamp;

    const valid = await viemClient.verifyMessage({
        address: <"0x${string}">authorWallet.address,
        message: JSON.stringify(messageToBeSigned),
        signature: <"0x${string">authorWallet.signature.signature
    });
    if (!valid) {
        const failedMsg = `The signature of the wallet is invalid`;
        log.error(`The signature of the wallet is invalid`, authorWallet.address);
        return failedMsg;
    }
    // cache the timestamp and validate that no one has used a more recently timestamp with the same wallet.address in the cache
    const cache = await props.plebbit._createStorageLRU({
        cacheName: "challenge_evm_contract_call_v1_wallet_last_timestamp",
        maxItems: Number.MAX_SAFE_INTEGER // We don't want to evacuate
    });
    const cacheKey = props.chainTicker + authorWallet.address;
    const lastTimestampOfAuthor = <number | undefined>await cache.getItem(cacheKey);
    if (typeof lastTimestampOfAuthor === "number" && lastTimestampOfAuthor > authorWallet.timestamp) {
        log.error(`Wallet (${authorWallet.address}) is trying to use an old signature`);
        return "The author is trying to use an old wallet signature";
    }
    if ((lastTimestampOfAuthor || 0) < authorWallet.timestamp) await cache.setItem(cacheKey, authorWallet.timestamp);

    // Validate the contract call and condition here

    const walletValidationFailure = await validateWalletAddressWithCondition({
        authorWalletAddress: authorWallet.address,
        condition: props.condition,
        plebbit: props.plebbit,
        contractAddress: props.contractAddress,
        chainTicker: props.chainTicker,
        abi: props.abi,
        error: props.error
    });

    return walletValidationFailure; // will be a string if error, otherwise undefined
};

const verifyAuthorENSAddress = async (props: Parameters<typeof verifyAuthorWalletAddress>[0]): Promise<string | undefined> => {
    const authorAddress = props.publication.author.address;
    if (!authorAddress.endsWith(".bso") && !authorAddress.endsWith(".eth")) return "Author address is not a .bso/.eth domain";
    const ensAddress = authorAddress.endsWith(".bso") ? authorAddress.slice(0, -4) + ".eth" : authorAddress;
    const viemClient = props.plebbit._domainResolver._createViemClientIfNeeded(
        "eth",
        _getChainProviderWithSafety(props.plebbit, "eth").urls[0]
    );

    const ownerOfAddress = await viemClient.getEnsAddress({
        name: normalize(ensAddress)
    });

    if (!ownerOfAddress) throw Error("Failed to get owner of ENS address of author.address");

    // No need to verify if owner has their plebbit-author-address, it's already part of verifyComment
    const walletValidationFailure = await validateWalletAddressWithCondition({
        authorWalletAddress: ownerOfAddress,
        condition: props.condition,
        plebbit: props.plebbit,
        contractAddress: props.contractAddress,
        chainTicker: props.chainTicker,
        abi: props.abi,
        error: props.error
    });

    return walletValidationFailure; // will be string if error, otherwise undefined
};

const verifyAuthorNftWalletAddress = async (props: Parameters<typeof verifyAuthorWalletAddress>[0]): Promise<string | undefined> => {
    if (!props.publication.author.avatar) return "Author has no avatar NFT set";
    const log = Logger("plebbit-js:local-subplebbit:evm-contract-call-v1:verifyAuthorNftWalletAddress");

    const nftAvatar = props.publication.author.avatar;
    const chainProvider = props.plebbit.chainProviders[<ChainTicker>nftAvatar.chainTicker];
    if (!chainProvider) return "The subplebbit does not support NFTs from this chain";
    const viemClient = props.plebbit._domainResolver._createViemClientIfNeeded(<ChainTicker>nftAvatar.chainTicker, chainProvider.urls[0]);

    let currentOwner: "0x${string}";
    try {
        currentOwner = <"0x${string}">await viemClient.readContract({
            abi: nftAbi,
            address: <"0x${string}">nftAvatar.address,
            functionName: "ownerOf",
            args: [nftAvatar.id]
        });
    } catch (e) {
        log.error("Failed to read NFT contract", e);
        return "Failed to read NFT contract";
    }

    const messageToBeSigned: any = {};
    // the property names must be in this order for the signature to match
    // insert props one at a time otherwise babel/webpack will reorder
    messageToBeSigned["domainSeparator"] = "plebbit-author-avatar";
    messageToBeSigned["authorAddress"] = props.publication.author.address;
    messageToBeSigned["timestamp"] = nftAvatar.timestamp;
    messageToBeSigned["tokenAddress"] = nftAvatar.address;
    messageToBeSigned["tokenId"] = String(nftAvatar.id); // must be a type string, not number
    const valid = await viemClient.verifyMessage({
        address: currentOwner,
        message: JSON.stringify(messageToBeSigned),
        signature: <"0x${string">nftAvatar.signature.signature
    });
    if (!valid) {
        log.error(`The signature of the nft avatar is invalid`);
        return `The signature of the nft avatar is invalid`;
    }

    // We're done with validation, let's call the contract

    const nftWalletValidationFailure = await validateWalletAddressWithCondition({
        authorWalletAddress: currentOwner,
        condition: props.condition,
        plebbit: props.plebbit,
        contractAddress: props.contractAddress,
        chainTicker: props.chainTicker,
        abi: props.abi,
        error: props.error
    });

    return nftWalletValidationFailure; // will be a string if error, otherwise undefined
};

const getContractCallResponse = async (props: {
    chainTicker: string;
    contractAddress: string;
    abi: any;
    authorWalletAddress: string;
    plebbit: Plebbit;
}) => {
    // mock getting the response from the contract call using the contract address and contract method abi, and the author address as argument

    const log = Logger("plebbit-js:local-subplebbit:challenges:evm-contract-call");
    // TODO res should be cached for each authorWalletAddress at least for 30s

    try {
        const viemClient = props.plebbit._domainResolver._createViemClientIfNeeded(
            <ChainTicker>props.chainTicker,
            _getChainProviderWithSafety(props.plebbit, <ChainTicker>props.chainTicker).urls[0]
        );

        // need to create data first
        const encodedParameters = encodeFunctionData({
            abi: [props.abi], // Not sure if should be array
            args: [props.authorWalletAddress]
        });

        const encodedData = await viemClient.call({
            data: encodedParameters,
            to: <"0x{string}">props.contractAddress
        });
        if (!encodedData.data) throw Error("The call did not return with data");
        const decodedData = decodeFunctionResult({
            abi: [props.abi],
            data: encodedData.data
        });
        return decodedData;
    } catch (e) {
        log.error("Failed to get contract call response", e);
        throw e;
    }
};

const evaluateConditionString = (condition: string, responseValue: any) => {
    const operatorInCondition = supportedConditionOperators.find((op) => condition.startsWith(op));
    if (!operatorInCondition) throw Error("Incorrect condition is set, make sure the condition operator is supported");
    const valueInCondition = condition.split(operatorInCondition)[1];
    const isAllValueNumber = /^\d+$/.test(valueInCondition);
    const conditionValueParsed = isAllValueNumber ? BigInt(valueInCondition) : valueInCondition;
    const responseValueParsed = isAllValueNumber ? BigInt(responseValue) : responseValue;

    if (typeof conditionValueParsed !== typeof responseValueParsed) throw Error("value of condition and response should be the same");
    const result =
        operatorInCondition === "="
            ? responseValueParsed === conditionValueParsed
            : operatorInCondition === ">"
              ? responseValueParsed > conditionValueParsed
              : operatorInCondition === "<"
                ? responseValueParsed < conditionValueParsed
                : undefined;
    if (result === undefined) throw Error("Failed to parse condition. Please double check code and set condition");
    return result;
};

const validateWalletAddressWithCondition = async (props: {
    authorWalletAddress: string;
    condition: string;
    chainTicker: string;
    contractAddress: string;
    abi: any;
    error: string;
    plebbit: Plebbit;
}) => {
    let contractCallResponse;
    try {
        contractCallResponse = await getContractCallResponse({
            chainTicker: props.chainTicker,
            contractAddress: props.contractAddress,
            abi: props.abi,
            authorWalletAddress: props.authorWalletAddress,
            plebbit: props.plebbit
        });
    } catch (e) {
        return `Failed getting contract call response from blockchain.`;
    }

    if (!evaluateConditionString(props.condition, contractCallResponse)) {
        return props.error || `Contract call response doesn't pass condition.`;
    }
    return undefined;
};

const getChallenge = async ({
    challengeSettings,
    challengeRequestMessage,
    subplebbit
}: GetChallengeArgsInput): Promise<ChallengeResultInput> => {
    let { chainTicker, address, abi, condition, error } = challengeSettings?.options || {};

    if (!chainTicker) {
        throw Error("missing option chainTicker");
    }
    if (!address) {
        throw Error("missing option address");
    }
    if (!abi) {
        throw Error("missing option abi");
    }
    abi = JSON.parse(abi);
    if (!condition) {
        throw Error("missing option condition");
    }

    const log = Logger("plebbit-js:local-subplebbit:evm-contract-call-v1:getChallenge");

    const doesConditionStartWithSupportedOperator = supportedConditionOperators.find((operator) => condition.startsWith(operator));
    if (!doesConditionStartWithSupportedOperator) throw Error(`Condition uses unsupported comparison operator`);
    const publication = derivePublicationFromChallengeRequest(challengeRequestMessage);
    // Run the contract call and validate condition, by this order:
    // - author wallet address (if they have author.wallets set)
    // - ENS author address (if they have author.address as an ENS name)
    // - NFT wallet address (if they have author.avatar set)
    // If any of them pass, then the challenge pass

    // First try to validate author
    const sharedProps = { plebbit: subplebbit._plebbit, abi, condition, error, chainTicker, publication, contractAddress: address };

    const walletFailureReason = await verifyAuthorWalletAddress(sharedProps);
    if (!walletFailureReason)
        return {
            success: true
        };

    // Second try to validate author ENS address
    const ensAuthorAddressFailureReason = await verifyAuthorENSAddress(sharedProps);
    if (!ensAuthorAddressFailureReason) return { success: true };

    // Third, try to validate for NFT wallet address
    const nftWalletAddressFailureReason = await verifyAuthorNftWalletAddress(sharedProps);
    if (!nftWalletAddressFailureReason) return { success: true };

    const errorString =
        `Author (${publication.author.address}) has failed all EVM challenges, ` +
        `walletFailureReason='${walletFailureReason}', ` +
        `ensAuthorAddressFailureReason='${ensAuthorAddressFailureReason}', ` +
        `nftWalletAddressFailureReason='${nftWalletAddressFailureReason}'`;
    log(errorString);
    // author has failed all challenges
    return { success: false, error: errorString };
};

function ChallengeFileFactory({ challengeSettings }: { challengeSettings: SubplebbitChallengeSetting }): ChallengeFileInput {
    let { chainTicker } = challengeSettings?.options || {};

    const type = <ChallengeInput["type"]>("chain/" + (chainTicker || "eth"));
    return { getChallenge, optionInputs, type, description };
}

export default ChallengeFileFactory;
