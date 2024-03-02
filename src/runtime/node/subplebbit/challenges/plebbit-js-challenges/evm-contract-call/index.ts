import lodash from "lodash";
import { LocalSubplebbit } from "../../../local-subplebbit";
import { getPlebbitAddressFromPublicKey } from "../../../../../../signer/util";
import { DecryptedChallengeRequestMessageType } from "../../../../../../types";
import { Challenge, ChallengeFile, SubplebbitChallengeSettings } from "../../../../../../subplebbit/types";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import Logger from "@plebbit/plebbit-logger";
import { getViemClient } from "../../../../../../constants";
import { Plebbit } from "../../../../../../plebbit";
import { isStringDomain } from "../../../../../../util";

const optionInputs = [
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
const verifyAuthorAddress = async (
    publication: DecryptedChallengeRequestMessageType["publication"],
    chainTicker: string,
    plebbit: Plebbit
) => {
    const authorWalletAddress = publication.author.wallets?.[chainTicker]?.address; // could be EVM address or .eth or .sol
    const wallet = publication.author.wallets?.[chainTicker];
    const nftAvatar = publication.author?.avatar;
    // TOOD should add a test in case of .sol author.address
    if (!wallet?.signature && !nftAvatar?.signature) return false;
    if (isStringDomain(authorWalletAddress)) {
        // resolve plebbit-author-address and check if it matches publication.signature.publicKey
        const resolvedWalletAddress = await plebbit.resolveAuthorAddress(authorWalletAddress); // plebbit address
        const publicationSignatureAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
        if (resolvedWalletAddress !== publicationSignatureAddress) return false;
    }
    if (nftAvatar?.signature) {
        const viemClient = await getViemClient(plebbit, nftAvatar.chainTicker, plebbit.chainProviders[nftAvatar.chainTicker].urls[0]);

        const currentOwner = <"0x${string}">await viemClient.readContract({
            abi: nftAbi,
            address: <"0x${string}">nftAvatar.address,
            functionName: "ownerOf",
            args: [nftAvatar.id]
        });

        const messageToBeSigned = {};
        // the property names must be in this order for the signature to match
        // insert props one at a time otherwise babel/webpack will reorder
        messageToBeSigned["domainSeparator"] = "plebbit-author-avatar";
        messageToBeSigned["authorAddress"] = authorWalletAddress;
        messageToBeSigned["timestamp"] = nftAvatar.timestamp;
        messageToBeSigned["tokenAddress"] = nftAvatar.address;
        messageToBeSigned["tokenId"] = String(nftAvatar.id); // must be a type string, not number
        const valid = await viemClient.verifyMessage({
            address: currentOwner,
            message: JSON.stringify(messageToBeSigned),
            signature: nftAvatar.signature.signature
        });
        if (!valid) return false;
    }
    if (wallet?.signature) {
        // validate if wallet.signature matches JSON {domainSeparator:"plebbit-author-wallet",authorAddress:"${authorAddress},{timestamp:${wallet.timestamp}"}

        const expectedSignature = {
            domainSeparator: "plebbit-author-wallet",
            authorAddress: `${authorWalletAddress}`,
            timestamp: `${wallet.timestamp}`
        };
        if (!lodash.isEqual(wallet.signature, expectedSignature)) return false;
        // cache the timestamp and validate that no one has used a more recently timestamp with the same wallet.address in the cache
        const cache = await plebbit._createStorageLRU({ cacheName: "challenge_evm-contract-call-v1", maxItems: undefined });
        const cacheKey = chainTicker + authorWalletAddress;
        const lastTimestampOfAuthor = <number | undefined>await cache.getItem(cacheKey);
        if (typeof lastTimestampOfAuthor === "number" && lastTimestampOfAuthor > wallet.timestamp) return false;
        if ((lastTimestampOfAuthor || 0) < wallet.timestamp) await cache.setItem(cacheKey, wallet.timestamp);
    }
    return true;
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

    try {
        const viemClient = await getViemClient(props.plebbit, props.chainTicker, props.plebbit.chainProviders[props.chainTicker].urls[0]);

        // need to create data first
        const encodedParameters = encodeFunctionData({
            abi: [props.abi], // Not sure if should be array
            args: [props.authorWalletAddress]
        });

        const encodedData = await viemClient.call({
            data: encodedParameters,
            to: props.contractAddress
        });
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
        return {
            success: false,
            error: `Failed getting contract call response from blockchain.`
        };
    }

    if (!evaluateConditionString(props.condition, contractCallResponse)) {
        return {
            success: false,
            error: props.error || `Contract call response doesn't pass condition.`
        };
    }
    return undefined;
};

const getChallenge = async (
    subplebbitChallengeSettings: SubplebbitChallengeSettings,
    challengeRequestMessage: DecryptedChallengeRequestMessageType,
    challengeIndex: number,
    subplebbit: LocalSubplebbit
) => {
    let { chainTicker, address, abi, condition, error } = subplebbitChallengeSettings?.options || {};

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

    const doesConditionStartWithSupportedOperator = supportedConditionOperators.find((operator) => condition.startsWith(operator));
    if (!doesConditionStartWithSupportedOperator) throw Error(`Condition uses unsupported comparison operator`);
    const publication = challengeRequestMessage.publication;

    const authorWalletAddress = publication.author.wallets?.[chainTicker]?.address;
    const nftAvatar = publication.author.avatar;
    if (!authorWalletAddress && !nftAvatar) {
        return {
            success: false,
            error: `Author doesn't have a wallet or avatar set.`
        };
    }

    const verification = await verifyAuthorAddress(publication, chainTicker, subplebbit);
    if (!verification) {
        return {
            success: false,
            error: `Author doesn't signature proof of his wallet address.`
        };
    }

    // Validate for author wallet address
    if (authorWalletAddress) {
        const walletValidationFailure = await validateWalletAddressWithCondition({
            authorWalletAddress,
            condition,
            plebbit: subplebbit.plebbit,
            contractAddress: address,
            chainTicker,
            abi,
            error
        });
        if (!walletValidationFailure) return { success: true };
        if (walletValidationFailure && !nftAvatar) return walletValidationFailure;
    }

    // Validate for NFT wallet address

    const viemClient = await getViemClient(
        subplebbit.plebbit,
        nftAvatar.chainTicker,
        subplebbit.plebbit.chainProviders[nftAvatar.chainTicker].urls[0]
    );

    const nftWalletAddress = <"0x${string}">await viemClient.readContract({
        abi: nftAbi,
        address: <"0x${string}">nftAvatar.address,
        functionName: "ownerOf",
        args: [nftAvatar.id]
    }); // we're already calling the same method in verifyAuthorAddress, should be cached

    const nftWalletValidationFailure = await validateWalletAddressWithCondition({
        authorWalletAddress: nftWalletAddress,
        condition,
        plebbit: subplebbit.plebbit,
        contractAddress: address,
        chainTicker,
        abi,
        error
    });

    if (nftWalletValidationFailure) return nftWalletValidationFailure;

    return {
        success: true
    };
};

function ChallengeFileFactory(subplebbitChallengeSettings: SubplebbitChallengeSettings): ChallengeFile {
    let { chainTicker } = subplebbitChallengeSettings?.options || {};

    const type = <Challenge["type"]>("chain/" + (chainTicker || "<chainTicker>"));
    return { getChallenge, optionInputs, type, description };
}

export default ChallengeFileFactory;
