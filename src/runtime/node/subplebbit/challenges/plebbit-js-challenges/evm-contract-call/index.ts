import lodash from "lodash";
import { LocalSubplebbit } from "../../../local-subplebbit";
import { getPlebbitAddressFromPublicKey } from "../../../../../../signer/util";
import { DecryptedChallengeRequestMessageType } from "../../../../../../types";
import { Challenge, ChallengeFile, SubplebbitChallengeSettings } from "../../../../../../subplebbit/types";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import Logger from "@plebbit/plebbit-logger";
import { getViemClient } from "../../../../../../constants";

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

const verifyAuthorAddress = async (
    publication: DecryptedChallengeRequestMessageType["publication"],
    chainTicker: string,
    subplebbit: LocalSubplebbit
) => {
    const authorWalletAddress = publication.author.wallets?.[chainTicker]?.address; // could be EVM address or .eth or .sol
    const wallet = publication.author.wallets?.[chainTicker];
    const nftAvatar = publication.author?.avatar;
    if (subplebbit.plebbit.resolver.isDomain(authorWalletAddress)) {
        // resolve plebbit-author-address and check if it matches publication.signature.publicKey
        const resolvedWalletAddress = await subplebbit.plebbit.resolveAuthorAddress(authorWalletAddress); // plebbit address
        const walletSignatureAddress = await getPlebbitAddressFromPublicKey(publication.signature.publicKey);
        if (resolvedWalletAddress !== walletSignatureAddress) return false;
    }
    if (nftAvatar?.signature) {
        // Do we need to validate the signature of NFT here? we're not validating it anywhere else
        // TODO implement this
        // validate if nftAvatar.signature matches authorWalletAddress (how to do that? we need to convert EVM address to public key right?)
        // validate if nftAvatar.signature matches author.wallets[chainTicker].address
        // return true
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
        const mostRecentTimestamp = await subplebbit.dbHandler.queryMostRecentTimestampOfAuthorWallet(authorWalletAddress, chainTicker);
        if ((mostRecentTimestamp || 0) > wallet.timestamp) return false;

        return true;
    }
    return false;
};

const getContractCallResponse = async (props: {
    chainTicker: string;
    contractAddress: string;
    abi: any;
    authorWalletAddress: string;
    subplebbit: LocalSubplebbit;
}) => {
    // mock getting the response from the contract call using the contract address and contract method abi, and the author address as argument

    const log = Logger("plebbit-js:local-subplebbit:challenges:evm-contract-call");

    try {
        const viemClient = await getViemClient(
            props.subplebbit.plebbit,
            props.chainTicker,
            props.subplebbit.plebbit.chainProviders[props.chainTicker].urls[0]
        );

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

const conditionHasUnsafeCharacters = (condition: string) => {
    // condition should only allow true, false, and characters 0-9, <, >, =
    const unsafeCharacters = condition.replace(/true|false|[0-9<>=]/g, "");
    return unsafeCharacters !== "";
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

    if (conditionHasUnsafeCharacters(condition)) {
        throw Error("condition has unsafe characters");
    }

    const publication = challengeRequestMessage.publication;

    const authorWalletAddress = publication.author.wallets?.[chainTicker]?.address;
    if (!authorWalletAddress) {
        return {
            success: false,
            error: `Author doesn't have a wallet set.`
        };
    }

    const verification = await verifyAuthorAddress(publication, chainTicker, subplebbit);
    if (!verification) {
        return {
            success: false,
            error: `Author doesn't signature proof of his wallet address.`
        };
    }

    let contractCallResponse;
    try {
        contractCallResponse = await getContractCallResponse({
            chainTicker,
            contractAddress: address,
            abi,
            authorWalletAddress,
            subplebbit
        });
    } catch (e) {
        return {
            success: false,
            error: `Failed getting contract call response from blockchain.`
        };
    }

    contractCallResponse = String(contractCallResponse);
    if (conditionHasUnsafeCharacters(contractCallResponse)) {
        throw Error("contractCallResponse has unsafe characters");
    }
    if (!eval(`${contractCallResponse} ${condition}`)) {
        return {
            success: false,
            error: error || `Contract call response doesn't pass condition.`
        };
    }

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
