import { Chain } from "./types";
import { PublicClient } from "viem";
import * as chains from "viem/chains";
import { ethers } from "ethers";
export declare const viemPublicClient: {
    account: undefined;
    batch?: {
        multicall?: boolean | {
            batchSize?: number;
            wait?: number;
        };
    };
    cacheTime: number;
    chain: {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    };
    key: string;
    name: string;
    pollingInterval: number;
    request: import("viem").EIP1193RequestFn<import("viem").PublicRpcSchema>;
    transport: import("viem").TransportConfig<"http", import("viem").EIP1193RequestFn> & {
        url?: string;
    };
    type: string;
    uid: string;
    call: (parameters: import("viem").CallParameters<{
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }>) => Promise<import("viem").CallReturnType>;
    createBlockFilter: () => Promise<{
        id: `0x${string}`;
        request: import("viem").EIP1193RequestFn<readonly [{
            Method: "eth_getFilterChanges";
            Parameters: [filterId: `0x${string}`];
            ReturnType: `0x${string}`[] | {
                address: `0x${string}`;
                blockHash: `0x${string}`;
                blockNumber: `0x${string}`;
                data: `0x${string}`;
                logIndex: `0x${string}`;
                transactionHash: `0x${string}`;
                transactionIndex: `0x${string}`;
                removed: boolean;
            }[];
        }, {
            Method: "eth_getFilterLogs";
            Parameters: [filterId: `0x${string}`];
            ReturnType: {
                address: `0x${string}`;
                blockHash: `0x${string}`;
                blockNumber: `0x${string}`;
                data: `0x${string}`;
                logIndex: `0x${string}`;
                transactionHash: `0x${string}`;
                transactionIndex: `0x${string}`;
                removed: boolean;
            }[];
        }, {
            Method: "eth_uninstallFilter";
            Parameters: [filterId: `0x${string}`];
            ReturnType: boolean;
        }]>;
        type: "block";
    }>;
    createContractEventFilter: <TAbi extends readonly unknown[] | import("viem").Abi, TEventName extends string, TArgs extends import("viem/dist/types/types/contract").MaybeExtractEventArgsFromAbi<TAbi, TEventName>, TStrict extends boolean = undefined, TFromBlock extends bigint | import("viem").BlockTag = undefined, TToBlock extends bigint | import("viem").BlockTag = undefined>(args: import("viem").CreateContractEventFilterParameters<TAbi, TEventName, TArgs, TStrict, TFromBlock, TToBlock>) => Promise<import("viem").CreateContractEventFilterReturnType<TAbi, TEventName, TArgs, TStrict, TFromBlock, TToBlock>>;
    createEventFilter: <TAbiEvent extends import("abitype").AbiEvent = undefined, TAbiEvents extends readonly unknown[] | readonly import("abitype").AbiEvent[] = TAbiEvent extends import("abitype").AbiEvent ? [TAbiEvent] : undefined, TStrict_1 extends boolean = undefined, TFromBlock_1 extends bigint | import("viem").BlockTag = undefined, TToBlock_1 extends bigint | import("viem").BlockTag = undefined, _EventName extends string = import("viem/dist/types/types/contract").MaybeAbiEventName<TAbiEvent>, _Args extends import("viem/dist/types/types/contract").MaybeExtractEventArgsFromAbi<TAbiEvents, _EventName> = undefined>(args?: import("viem").CreateEventFilterParameters<TAbiEvent, TAbiEvents, TStrict_1, TFromBlock_1, TToBlock_1, _EventName, _Args>) => Promise<import("viem").Filter<"event", TAbiEvents, _EventName, _Args, TStrict_1, TFromBlock_1, TToBlock_1> extends infer T ? { [K in keyof T]: import("viem").Filter<"event", TAbiEvents, _EventName, _Args, TStrict_1, TFromBlock_1, TToBlock_1>[K]; } : never>;
    createPendingTransactionFilter: () => Promise<{
        id: `0x${string}`;
        request: import("viem").EIP1193RequestFn<readonly [{
            Method: "eth_getFilterChanges";
            Parameters: [filterId: `0x${string}`];
            ReturnType: `0x${string}`[] | {
                address: `0x${string}`;
                blockHash: `0x${string}`;
                blockNumber: `0x${string}`;
                data: `0x${string}`;
                logIndex: `0x${string}`;
                transactionHash: `0x${string}`;
                transactionIndex: `0x${string}`;
                removed: boolean;
            }[];
        }, {
            Method: "eth_getFilterLogs";
            Parameters: [filterId: `0x${string}`];
            ReturnType: {
                address: `0x${string}`;
                blockHash: `0x${string}`;
                blockNumber: `0x${string}`;
                data: `0x${string}`;
                logIndex: `0x${string}`;
                transactionHash: `0x${string}`;
                transactionIndex: `0x${string}`;
                removed: boolean;
            }[];
        }, {
            Method: "eth_uninstallFilter";
            Parameters: [filterId: `0x${string}`];
            ReturnType: boolean;
        }]>;
        type: "transaction";
    }>;
    estimateContractGas: <TChain extends chains.Chain, TAbi_1 extends readonly unknown[] | import("viem").Abi, TFunctionName extends string>(args: import("viem").EstimateContractGasParameters<TAbi_1, TFunctionName, TChain, import("viem").Account>) => Promise<bigint>;
    estimateGas: (args: import("viem").EstimateGasParameters<{
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, import("viem").Account>) => Promise<bigint>;
    getBalance: (args: import("viem").GetBalanceParameters) => Promise<bigint>;
    getBlock: <TIncludeTransactions extends boolean = false, TBlockTag extends import("viem").BlockTag = "latest">(args?: import("viem").GetBlockParameters<TIncludeTransactions, TBlockTag>) => Promise<import("viem").GetBlockReturnType<{
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, TIncludeTransactions, TBlockTag>>;
    getBlockNumber: (args?: import("viem").GetBlockNumberParameters) => Promise<bigint>;
    getBlockTransactionCount: (args?: import("viem").GetBlockTransactionCountParameters) => Promise<number>;
    getBytecode: (args: import("viem").GetBytecodeParameters) => Promise<`0x${string}`>;
    getChainId: () => Promise<number>;
    getEnsAddress: (args: {
        blockNumber?: bigint;
        blockTag?: import("viem").BlockTag;
        coinType?: number;
        name: string;
        universalResolverAddress?: `0x${string}`;
    }) => Promise<`0x${string}`>;
    getEnsAvatar: (args: {
        name: string;
        blockNumber?: bigint;
        blockTag?: import("viem").BlockTag;
        universalResolverAddress?: `0x${string}`;
        gatewayUrls?: import("viem").AssetGatewayUrls;
    }) => Promise<string>;
    getEnsName: (args: {
        blockNumber?: bigint;
        blockTag?: import("viem").BlockTag;
        address: `0x${string}`;
        universalResolverAddress?: `0x${string}`;
    }) => Promise<string>;
    getEnsResolver: (args: {
        blockNumber?: bigint;
        blockTag?: import("viem").BlockTag;
        name: string;
        universalResolverAddress?: `0x${string}`;
    }) => Promise<`0x${string}`>;
    getEnsText: (args: {
        blockNumber?: bigint;
        blockTag?: import("viem").BlockTag;
        name: string;
        key: string;
        universalResolverAddress?: `0x${string}`;
    }) => Promise<string>;
    getFeeHistory: (args: import("viem").GetFeeHistoryParameters) => Promise<import("viem").GetFeeHistoryReturnType>;
    getFilterChanges: <TFilterType extends import("viem/dist/types/types/filter").FilterType, TAbi_2 extends readonly unknown[] | import("viem").Abi, TEventName_1 extends string, TStrict_2 extends boolean = undefined, TFromBlock_2 extends bigint | import("viem").BlockTag = undefined, TToBlock_2 extends bigint | import("viem").BlockTag = undefined>(args: import("viem").GetFilterChangesParameters<TFilterType, TAbi_2, TEventName_1, TStrict_2, TFromBlock_2, TToBlock_2>) => Promise<import("viem").GetFilterChangesReturnType<TFilterType, TAbi_2, TEventName_1, TStrict_2, TFromBlock_2, TToBlock_2>>;
    getFilterLogs: <TAbi_3 extends readonly unknown[] | import("viem").Abi, TEventName_2 extends string, TStrict_3 extends boolean = undefined, TFromBlock_3 extends bigint | import("viem").BlockTag = undefined, TToBlock_3 extends bigint | import("viem").BlockTag = undefined>(args: import("viem").GetFilterLogsParameters<TAbi_3, TEventName_2, TStrict_3, TFromBlock_3, TToBlock_3>) => Promise<import("viem").GetFilterLogsReturnType<TAbi_3, TEventName_2, TStrict_3, TFromBlock_3, TToBlock_3>>;
    getGasPrice: () => Promise<bigint>;
    getLogs: <TAbiEvent_1 extends import("abitype").AbiEvent = undefined, TAbiEvents_1 extends readonly unknown[] | readonly import("abitype").AbiEvent[] = TAbiEvent_1 extends import("abitype").AbiEvent ? [TAbiEvent_1] : undefined, TStrict_4 extends boolean = undefined, TFromBlock_4 extends bigint | import("viem").BlockTag = undefined, TToBlock_4 extends bigint | import("viem").BlockTag = undefined>(args?: import("viem").GetLogsParameters<TAbiEvent_1, TAbiEvents_1, TStrict_4, TFromBlock_4, TToBlock_4>) => Promise<import("viem").GetLogsReturnType<TAbiEvent_1, TAbiEvents_1, TStrict_4, TFromBlock_4, TToBlock_4>>;
    getStorageAt: (args: import("viem").GetStorageAtParameters) => Promise<`0x${string}`>;
    getTransaction: <TBlockTag_1 extends import("viem").BlockTag = "latest">(args: import("viem").GetTransactionParameters<TBlockTag_1>) => Promise<import("viem").GetTransactionReturnType<{
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, TBlockTag_1>>;
    getTransactionConfirmations: (args: import("viem").GetTransactionConfirmationsParameters<{
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }>) => Promise<bigint>;
    getTransactionCount: (args: import("viem").GetTransactionCountParameters) => Promise<number>;
    getTransactionReceipt: (args: import("viem").GetTransactionReceiptParameters) => Promise<any>;
    multicall: <TContracts extends import("viem").ContractFunctionConfig[], TAllowFailure extends boolean = true>(args: import("viem").MulticallParameters<TContracts, TAllowFailure>) => Promise<import("viem").MulticallReturnType<TContracts, TAllowFailure>>;
    readContract: <TAbi_4 extends readonly unknown[] | import("viem").Abi, TFunctionName_1 extends string>(args: import("viem").ReadContractParameters<TAbi_4, TFunctionName_1>) => Promise<import("viem").ReadContractReturnType<TAbi_4, TFunctionName_1>>;
    simulateContract: <TAbi_5 extends readonly unknown[] | import("viem").Abi = import("viem").Abi, TFunctionName_2 extends string = any, TChainOverride extends chains.Chain = undefined>(args: import("viem").SimulateContractParameters<TAbi_5, TFunctionName_2, {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, TChainOverride>) => Promise<import("viem").SimulateContractReturnType<TAbi_5, TFunctionName_2, {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, TChainOverride>>;
    verifyMessage: (args: import("viem/dist/types/actions/public/verifyMessage").VerifyMessageParameters) => Promise<boolean>;
    verifyTypedData: (args: import("viem/dist/types/actions/public/verifyTypedData").VerifyTypedDataParameters) => Promise<boolean>;
    uninstallFilter: (args: import("viem").UninstallFilterParameters) => Promise<boolean>;
    waitForTransactionReceipt: (args: import("viem").WaitForTransactionReceiptParameters<{
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }>) => Promise<any>;
    watchBlockNumber: (args: import("viem").WatchBlockNumberParameters) => import("viem").WatchBlockNumberReturnType;
    watchBlocks: <TIncludeTransactions_1 extends boolean = false, TBlockTag_2 extends import("viem").BlockTag = "latest">(args: import("viem").WatchBlocksParameters<import("viem").HttpTransport, {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, TIncludeTransactions_1, TBlockTag_2>) => import("viem").WatchBlocksReturnType;
    watchContractEvent: <TAbi_6 extends readonly unknown[] | import("viem").Abi, TEventName_3 extends string, TStrict_5 extends boolean = undefined>(args: import("viem").WatchContractEventParameters<TAbi_6, TEventName_3, TStrict_5>) => import("viem").WatchContractEventReturnType;
    watchEvent: <TAbiEvent_2 extends import("abitype").AbiEvent = undefined, TAbiEvents_2 extends readonly unknown[] | readonly import("abitype").AbiEvent[] = TAbiEvent_2 extends import("abitype").AbiEvent ? [TAbiEvent_2] : undefined, TStrict_6 extends boolean = undefined>(args: import("viem").WatchEventParameters<TAbiEvent_2, TAbiEvents_2, TStrict_6>) => import("viem").WatchEventReturnType;
    watchPendingTransactions: (args: import("viem").WatchPendingTransactionsParameters<import("viem").HttpTransport>) => import("viem").WatchPendingTransactionsReturnType;
    extend: <const client extends {
        [x: string]: unknown;
        account?: undefined;
        batch?: undefined;
        cacheTime?: undefined;
        chain?: undefined;
        key?: undefined;
        name?: undefined;
        pollingInterval?: undefined;
        request?: undefined;
        transport?: undefined;
        type?: undefined;
        uid?: undefined;
    }>(fn: (client: import("viem").Client<import("viem").HttpTransport, {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, undefined, import("viem").PublicRpcSchema, import("viem").PublicActions<import("viem").HttpTransport, {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }>>) => client) => import("viem").Client<import("viem").HttpTransport, {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }, undefined, import("viem").PublicRpcSchema, { [K_1 in keyof client]: client[K_1]; } & import("viem").PublicActions<import("viem").HttpTransport, {
        readonly id: 1;
        readonly network: "homestead";
        readonly name: "Ethereum";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly rpcUrls: {
            readonly alchemy: {
                readonly http: readonly ["https://eth-mainnet.g.alchemy.com/v2"];
                readonly webSocket: readonly ["wss://eth-mainnet.g.alchemy.com/v2"];
            };
            readonly infura: {
                readonly http: readonly ["https://mainnet.infura.io/v3"];
                readonly webSocket: readonly ["wss://mainnet.infura.io/ws/v3"];
            };
            readonly default: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
            readonly public: {
                readonly http: readonly ["https://cloudflare-eth.com"];
            };
        };
        readonly blockExplorers: {
            readonly etherscan: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
            readonly default: {
                readonly name: "Etherscan";
                readonly url: "https://etherscan.io";
            };
        };
        readonly contracts: {
            readonly ensRegistry: {
                readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
            };
            readonly ensUniversalResolver: {
                readonly address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62";
                readonly blockCreated: 16966585;
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 14353601;
            };
        };
    } & {
        formatters: import("viem").Formatters;
        serializers: import("viem").Serializers<import("viem").Formatters>;
    }>>;
};
export declare const ethersPublicClient: ethers.AbstractProvider;
export declare class Resolver {
    private plebbit;
    constructor(plebbit: Resolver["plebbit"]);
    toJSON(): any;
    toString(): any;
    _getChainProvider(chainTicker: Chain, chainProviderUrl: string): PublicClient;
    _resolveViaEthers(chainTicker: Chain, address: string, txtRecordName: string): Promise<string>;
    resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null>;
    isDomain(address: string): boolean;
}
