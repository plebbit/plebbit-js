import { Chain } from "./types";
import * as chains from "viem/chains";
export declare const viemPublicClient: {
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
    batch?: {
        multicall?: boolean | import("viem/dist/types/clients/createPublicClient").MulticallBatchOptions;
    };
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
    createContractEventFilter: <TAbi extends readonly unknown[] | import("viem").Abi, TEventName extends string, TArgs extends import("viem/dist/types/types/contract").MaybeExtractEventArgsFromAbi<TAbi, TEventName>, TStrict extends boolean = undefined>(args: import("viem").CreateContractEventFilterParameters<TAbi, TEventName, TArgs, TStrict>) => Promise<import("viem").CreateContractEventFilterReturnType<TAbi, TEventName, TArgs, TStrict>>;
    createEventFilter: <TAbiEvent extends import("abitype").AbiEvent, TStrict_1 extends boolean = undefined, _Abi extends readonly unknown[] | import("viem").Abi = [TAbiEvent], _EventName extends string = import("viem/dist/types/types/contract").MaybeAbiEventName<TAbiEvent>, _Args extends import("viem/dist/types/types/contract").MaybeExtractEventArgsFromAbi<_Abi, _EventName> = undefined>(args?: import("viem").CreateEventFilterParameters<TAbiEvent, TStrict_1, _Abi, _EventName, _Args>) => Promise<import("viem/dist/types/types/filter").Filter<"event", _Abi, _EventName, _Args, TStrict_1> extends infer T ? { [K in keyof T]: import("viem/dist/types/types/filter").Filter<"event", _Abi, _EventName, _Args, TStrict_1>[K]; } : never>;
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
    estimateContractGas: <TChain extends chains.Chain, TAbi_1 extends readonly unknown[] | import("viem").Abi, TFunctionName extends string>(args: import("viem").EstimateContractGasParameters<TAbi_1, TFunctionName, TChain>) => Promise<bigint>;
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
    }>) => Promise<bigint>;
    getBalance: (args: import("viem").GetBalanceParameters) => Promise<bigint>;
    getBlock: (args?: import("viem").GetBlockParameters) => Promise<never>;
    getBlockNumber: (args?: import("viem").GetBlockNumberParameters) => Promise<bigint>;
    getBlockTransactionCount: (args?: import("viem").GetBlockTransactionCountParameters) => Promise<number>;
    getBytecode: (args: import("viem").GetBytecodeParameters) => Promise<`0x${string}`>;
    getChainId: () => Promise<number>;
    getEnsAddress: (args: {
        blockNumber?: bigint;
        blockTag?: import("viem").BlockTag;
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
    getFilterChanges: <TFilterType extends import("viem/dist/types/types/filter").FilterType, TAbi_2 extends readonly unknown[] | import("viem").Abi, TEventName_1 extends string, TStrict_2 extends boolean = undefined>(args: import("viem").GetFilterChangesParameters<TFilterType, TAbi_2, TEventName_1, TStrict_2>) => Promise<import("viem").GetFilterChangesReturnType<TFilterType, TAbi_2, TEventName_1, TStrict_2>>;
    getFilterLogs: <TAbi_3 extends readonly unknown[] | import("viem").Abi, TEventName_2 extends string, TStrict_3 extends boolean = undefined>(args: import("viem").GetFilterLogsParameters<TAbi_3, TEventName_2, TStrict_3>) => Promise<import("viem").GetFilterLogsReturnType<TAbi_3, TEventName_2, TStrict_3>>;
    getGasPrice: () => Promise<bigint>;
    getLogs: <TAbiEvent_1 extends import("abitype").AbiEvent, TStrict_4 extends boolean = undefined>(args?: import("viem").GetLogsParameters<TAbiEvent_1, TStrict_4>) => Promise<import("viem").GetLogsReturnType<TAbiEvent_1, TStrict_4>>;
    getStorageAt: (args: import("viem").GetStorageAtParameters) => Promise<`0x${string}`>;
    getTransaction: (args: import("viem").GetTransactionParameters) => Promise<never>;
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
    }>) => Promise<bigint>;
    getTransactionCount: (args: import("viem").GetTransactionCountParameters) => Promise<number>;
    getTransactionReceipt: (args: import("viem").GetTransactionReceiptParameters) => Promise<never>;
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
    }>) => Promise<never>;
    watchBlockNumber: (args: import("viem").WatchBlockNumberParameters) => import("viem").WatchBlockNumberReturnType;
    watchBlocks: (args: import("viem").WatchBlocksParameters<import("viem").HttpTransport, {
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
    }>) => import("viem").WatchBlocksReturnType;
    watchContractEvent: <TAbi_6 extends readonly unknown[] | import("viem").Abi, TEventName_3 extends string, TStrict_5 extends boolean = undefined>(args: import("viem").WatchContractEventParameters<TAbi_6, TEventName_3, TStrict_5>) => import("viem").WatchContractEventReturnType;
    watchEvent: <TAbiEvent_2 extends import("abitype").AbiEvent, TStrict_6 extends boolean = undefined>(args: import("viem").WatchEventParameters<TAbiEvent_2, TStrict_6>) => import("viem").WatchEventReturnType;
    watchPendingTransactions: (args: import("viem").WatchPendingTransactionsParameters<import("viem").HttpTransport>) => import("viem").WatchPendingTransactionsReturnType;
};
export declare class Resolver {
    private plebbit;
    constructor(plebbit: Resolver["plebbit"]);
    toJSON(): any;
    toString(): any;
    _getChainProvider(chainTicker: Chain, chainProviderUrl: string): {
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
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
        batch?: {
            multicall?: boolean | import("viem/dist/types/clients/createPublicClient").MulticallBatchOptions;
        };
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
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
        createContractEventFilter: <TAbi extends readonly unknown[] | import("viem").Abi, TEventName extends string, TArgs extends import("viem/dist/types/types/contract").MaybeExtractEventArgsFromAbi<TAbi, TEventName>, TStrict extends boolean = undefined>(args: import("viem").CreateContractEventFilterParameters<TAbi, TEventName, TArgs, TStrict>) => Promise<import("viem").CreateContractEventFilterReturnType<TAbi, TEventName, TArgs, TStrict>>;
        createEventFilter: <TAbiEvent extends import("abitype").AbiEvent, TStrict_1 extends boolean = undefined, _Abi extends readonly unknown[] | import("viem").Abi = [TAbiEvent], _EventName extends string = import("viem/dist/types/types/contract").MaybeAbiEventName<TAbiEvent>, _Args extends import("viem/dist/types/types/contract").MaybeExtractEventArgsFromAbi<_Abi, _EventName> = undefined>(args?: import("viem").CreateEventFilterParameters<TAbiEvent, TStrict_1, _Abi, _EventName, _Args>) => Promise<import("viem/dist/types/types/filter").Filter<"event", _Abi, _EventName, _Args, TStrict_1> extends infer T ? { [K in keyof T]: import("viem/dist/types/types/filter").Filter<"event", _Abi, _EventName, _Args, TStrict_1>[K]; } : never>;
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
        estimateContractGas: <TChain extends chains.Chain, TAbi_1 extends readonly unknown[] | import("viem").Abi, TFunctionName extends string>(args: import("viem").EstimateContractGasParameters<TAbi_1, TFunctionName, TChain>) => Promise<bigint>;
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
        }>) => Promise<bigint>;
        getBalance: (args: import("viem").GetBalanceParameters) => Promise<bigint>;
        getBlock: (args?: import("viem").GetBlockParameters) => Promise<never>;
        getBlockNumber: (args?: import("viem").GetBlockNumberParameters) => Promise<bigint>;
        getBlockTransactionCount: (args?: import("viem").GetBlockTransactionCountParameters) => Promise<number>;
        getBytecode: (args: import("viem").GetBytecodeParameters) => Promise<`0x${string}`>;
        getChainId: () => Promise<number>;
        getEnsAddress: (args: {
            blockNumber?: bigint;
            blockTag?: import("viem").BlockTag;
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
        getFilterChanges: <TFilterType extends import("viem/dist/types/types/filter").FilterType, TAbi_2 extends readonly unknown[] | import("viem").Abi, TEventName_1 extends string, TStrict_2 extends boolean = undefined>(args: import("viem").GetFilterChangesParameters<TFilterType, TAbi_2, TEventName_1, TStrict_2>) => Promise<import("viem").GetFilterChangesReturnType<TFilterType, TAbi_2, TEventName_1, TStrict_2>>;
        getFilterLogs: <TAbi_3 extends readonly unknown[] | import("viem").Abi, TEventName_2 extends string, TStrict_3 extends boolean = undefined>(args: import("viem").GetFilterLogsParameters<TAbi_3, TEventName_2, TStrict_3>) => Promise<import("viem").GetFilterLogsReturnType<TAbi_3, TEventName_2, TStrict_3>>;
        getGasPrice: () => Promise<bigint>;
        getLogs: <TAbiEvent_1 extends import("abitype").AbiEvent, TStrict_4 extends boolean = undefined>(args?: import("viem").GetLogsParameters<TAbiEvent_1, TStrict_4>) => Promise<import("viem").GetLogsReturnType<TAbiEvent_1, TStrict_4>>;
        getStorageAt: (args: import("viem").GetStorageAtParameters) => Promise<`0x${string}`>;
        getTransaction: (args: import("viem").GetTransactionParameters) => Promise<never>;
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
        }>) => Promise<bigint>;
        getTransactionCount: (args: import("viem").GetTransactionCountParameters) => Promise<number>;
        getTransactionReceipt: (args: import("viem").GetTransactionReceiptParameters) => Promise<never>;
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
        }>) => Promise<never>;
        watchBlockNumber: (args: import("viem").WatchBlockNumberParameters) => import("viem").WatchBlockNumberReturnType;
        watchBlocks: (args: import("viem").WatchBlocksParameters<import("viem").HttpTransport, {
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
        } | import("@wagmi/chains").Chain | {
            readonly id: 42161;
            readonly name: "Arbitrum One";
            readonly network: "arbitrum";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
        } | {
            readonly id: 421613;
            readonly name: "Arbitrum Goerli";
            readonly network: "arbitrum-goerli";
            readonly nativeCurrency: {
                readonly name: "Arbitrum Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://arb-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://arb-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://arbitrum-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://arbitrum-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli-rollup.arbitrum.io/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://goerli.arbiscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 88114;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1313161554;
            readonly name: "Aurora";
            readonly network: "aurora";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-mainnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://aurorascan.dev";
                };
            };
        } | {
            readonly id: 1313161555;
            readonly name: "Aurora Testnet";
            readonly network: "aurora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://aurora-testnet.infura.io/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.aurora.dev"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
                readonly default: {
                    readonly name: "Aurorascan";
                    readonly url: "https://testnet.aurorascan.dev";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 43114;
            readonly name: "Avalanche";
            readonly network: "avalanche";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 11907934;
                };
            };
        } | {
            readonly id: 43113;
            readonly name: "Avalanche Fuji";
            readonly network: "avalanche-fuji";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Avalanche Fuji";
                readonly symbol: "AVAX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.avax-test.network/ext/bc/C/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
                readonly default: {
                    readonly name: "SnowTrace";
                    readonly url: "https://testnet.snowtrace.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7096959;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 84531;
            readonly network: "base-goerli";
            readonly name: "Base Goerli";
            readonly nativeCurrency: {
                readonly name: "Base Goerli";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.base.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://goerli.basescan.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 288;
            readonly name: "Boba Network";
            readonly network: "boba";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Boba";
                readonly symbol: "BOBA";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.boba.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
                readonly default: {
                    readonly name: "BOBAScan";
                    readonly url: "https://bobascan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 446859;
                };
            };
        } | {
            readonly id: 1039;
            readonly name: "Bronos";
            readonly network: "bronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BRO";
                readonly symbol: "BRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://broscan.bronos.org";
                };
            };
        } | {
            readonly id: 1038;
            readonly name: "Bronos Testnet";
            readonly network: "bronos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Bronos Coin";
                readonly symbol: "tBRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://evm-testnet.bronos.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BronoScan";
                    readonly url: "https://tbroscan.bronos.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 56;
            readonly name: "BNB Smart Chain";
            readonly network: "bsc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "BNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/bsc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 15921452;
                };
            };
        } | {
            readonly id: 97;
            readonly name: "Binance Smart Chain Testnet";
            readonly network: "bsc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "BNB";
                readonly symbol: "tBNB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://data-seed-prebsc-1-s1.binance.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
                readonly default: {
                    readonly name: "BscScan";
                    readonly url: "https://testnet.bscscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 17422483;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 7700;
            readonly name: "Canto";
            readonly network: "canto";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Canto";
                readonly symbol: "CANTO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
                readonly public: {
                    readonly http: readonly ["https://canto.slingshot.finance"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Canto EVM Explorer (Blockscout)";
                    readonly url: "https://evm.explorer.canto.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2905789;
                };
            };
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 42220;
            name: "Celo";
            network: "celo";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-mainnet.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.celo.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/mainnet";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://celoscan.io";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 13112599;
                };
            };
            testnet: false;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 44787;
            name: "Alfajores";
            network: "celo-alfajores";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "A-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
                readonly infura: {
                    readonly http: readonly ["https://celo-alfajores.infura.io/v3"];
                };
                readonly public: {
                    readonly http: readonly ["https://alfajores-forno.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/alfajores";
                };
                readonly etherscan: {
                    readonly name: "CeloScan";
                    readonly url: "https://alfajores.celoscan.io/";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 14569001;
                };
            };
            testnet: true;
        } | {
            formatters: {
                block: (data: Partial<import("viem").RpcBlock> & {
                    [key: string]: unknown;
                }) => import("viem").Block<bigint, import("viem").Transaction> & {
                    randomness: {
                        committed: `0x${string}`;
                        revealed: `0x${string}`;
                    };
                } & {
                    nonce: never;
                    difficulty: never;
                    gasLimit: never;
                    mixHash: never;
                    uncles: never;
                };
                transaction: (data: Partial<import("viem").RpcTransaction> & {
                    [key: string]: unknown;
                }) => import("viem").Transaction<bigint, number> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionReceipt: (data: Partial<import("viem").RpcTransactionReceipt> & {
                    [key: string]: unknown;
                }) => import("viem").TransactionReceipt<bigint, number, "success" | "reverted", import("viem").TransactionType> & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: bigint;
                    gatewayFeeRecipient: `0x${string}`;
                };
                transactionRequest: (data: Partial<import("viem").TransactionRequest<bigint, number>> & {
                    [key: string]: unknown;
                }) => import("viem").RpcTransactionRequest & {
                    feeCurrency: `0x${string}`;
                    gatewayFee: `0x${string}`;
                    gatewayFeeRecipient: `0x${string}`;
                };
            };
            id: 17323;
            name: "Cannoli";
            network: "celo-cannoli";
            nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CELO";
                readonly symbol: "C-CELO";
            };
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://forno.cannoli.celo-testnet.org"];
                };
            };
            blockExplorers: {
                readonly default: {
                    readonly name: "Celo Explorer";
                    readonly url: "https://explorer.celo.org/cannoli";
                };
            };
            contracts: {
                readonly multicall3: {
                    readonly address: "0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718";
                    readonly blockCreated: 87429;
                };
            };
            testnet: true;
        } | {
            readonly id: 25;
            readonly name: "Cronos";
            readonly network: "cronos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Cronos";
                readonly symbol: "CRO";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://node.croswap.com/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
                readonly default: {
                    readonly name: "CronosScan";
                    readonly url: "https://cronoscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1963112;
                };
            };
        } | {
            readonly id: 3737;
            readonly network: "crossbell";
            readonly name: "Crossbell";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "CSB";
                readonly symbol: "CSB";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.crossbell.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "CrossScan";
                    readonly url: "https://scan.crossbell.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf";
                    readonly blockCreated: 23499787;
                };
            };
        } | {
            readonly id: 53935;
            readonly name: "DFK Chain";
            readonly network: "dfk";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Jewel";
                readonly symbol: "JEWEL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
                readonly public: {
                    readonly http: readonly ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
                readonly default: {
                    readonly name: "DFKSubnetScan";
                    readonly url: "https://subnets.avax.network/defi-kingdoms";
                };
            };
        } | {
            readonly id: 2000;
            readonly name: "Dogechain";
            readonly network: "dogechain";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Dogechain";
                readonly symbol: "DC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.dogechain.dog"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
                readonly default: {
                    readonly name: "DogeChainExplorer";
                    readonly url: "https://explorer.dogechain.dog";
                };
            };
        } | {
            readonly id: 9001;
            readonly name: "Evmos";
            readonly network: "evmos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.org:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Block Explorer";
                    readonly url: "https://escan.live/";
                };
            };
        } | {
            readonly id: 9000;
            readonly name: "Evmos Testnet";
            readonly network: "evmos-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Evmos";
                readonly symbol: "EVMOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
                readonly public: {
                    readonly http: readonly ["https://eth.bd.evmos.dev:8545"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Evmos Testnet Block Explorer";
                    readonly url: "https://evm.evmos.dev/";
                };
            };
        } | {
            readonly id: 250;
            readonly name: "Fantom";
            readonly network: "fantom";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/fantom"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 33001987;
                };
            };
        } | {
            readonly id: 4002;
            readonly name: "Fantom Testnet";
            readonly network: "fantom-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Fantom";
                readonly symbol: "FTM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.fantom.network"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
                readonly default: {
                    readonly name: "FTMScan";
                    readonly url: "https://testnet.ftmscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 8328688;
                };
            };
        } | {
            readonly id: 314;
            readonly name: "Filecoin Mainnet";
            readonly network: "filecoin-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "filecoin";
                readonly symbol: "FIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://filscan.io";
                };
                readonly filscout: {
                    readonly name: "Filscout";
                    readonly url: "https://filscout.io/en";
                };
                readonly glif: {
                    readonly name: "Glif";
                    readonly url: "https://explorer.glif.io";
                };
            };
        } | {
            readonly id: 3141;
            readonly name: "Filecoin Hyperspace";
            readonly network: "filecoin-hyperspace";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "testnet filecoin";
                readonly symbol: "tFIL";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
                readonly public: {
                    readonly http: readonly ["https://api.hyperspace.node.glif.io/rpc/v1"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Filfox";
                    readonly url: "https://hyperspace.filfox.info/en";
                };
                readonly filscan: {
                    readonly name: "Filscan";
                    readonly url: "https://hyperspace.filscan.io";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Foundry";
            readonly network: "foundry";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                    readonly webSocket: readonly ["ws://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 4689;
            readonly name: "IoTeX";
            readonly network: "iotex";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.mainnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.mainnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://iotexscan.io";
                };
            };
        } | {
            readonly id: 4690;
            readonly name: "IoTeX Testnet";
            readonly network: "iotex-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "IoTeX";
                readonly symbol: "IOTX";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://babel-api.testnet.iotex.io"];
                    readonly webSocket: readonly ["wss://babel-api.testnet.iotex.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "IoTeXScan";
                    readonly url: "https://testnet.iotexscan.io";
                };
            };
        } | {
            readonly id: 5;
            readonly network: "goerli";
            readonly name: "Goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/eth_goerli"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli.etherscan.io";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly ensUniversalResolver: {
                    readonly address: "0x56522D00C410a43BFfDF00a9A569489297385790";
                    readonly blockCreated: 8765204;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 100;
            readonly name: "Gnosis";
            readonly network: "gnosis";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.gnosischain.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Gnosisscan";
                    readonly url: "https://gnosisscan.io/";
                };
                readonly default: {
                    readonly name: "Gnosis Chain Explorer";
                    readonly url: "https://blockscout.com/xdai/mainnet/";
                };
            };
        } | {
            readonly id: 10200;
            readonly name: "Gnosis Chiado";
            readonly network: "chiado";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Gnosis";
                readonly symbol: "xDAI";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chiadochain.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.chiadochain.net";
                };
            };
        } | {
            readonly id: 11235;
            readonly name: "HAQQ Mainnet";
            readonly network: "haqq-mainnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLM";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.haqq.network";
                };
            };
        } | {
            readonly id: 54211;
            readonly name: "HAQQ Testedge 2";
            readonly network: "haqq-testedge-2";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Islamic Coin";
                readonly symbol: "ISLMT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.eth.testedge2.haqq.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "HAQQ Explorer";
                    readonly url: "https://explorer.testedge2.haqq.network";
                };
            };
        } | {
            readonly id: 31337;
            readonly name: "Hardhat";
            readonly network: "hardhat";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1666600000;
            readonly name: "Harmony One";
            readonly network: "harmony";
            readonly nativeCurrency: {
                readonly name: "Harmony";
                readonly symbol: "ONE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.ankr.com/harmony"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Harmony Explorer";
                    readonly url: "https://explorer.harmony.one";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 24185753;
                };
            };
        } | {
            readonly id: 8217;
            readonly name: "Klaytn";
            readonly network: "klaytn";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Klaytn";
                readonly symbol: "KLAY";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
                readonly public: {
                    readonly http: readonly ["https://cypress.fautor.app/archive"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
                readonly default: {
                    readonly name: "KlaytnScope";
                    readonly url: "https://scope.klaytn.com";
                };
            };
        } | {
            readonly id: 59140;
            readonly name: "Linea Goerli Testnet";
            readonly network: "linea-testnet";
            readonly nativeCurrency: {
                readonly name: "Linea Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly infura: {
                    readonly http: readonly ["https://consensys-zkevm-goerli-prealpha.infura.io/v3"];
                    readonly webSocket: readonly ["wss://consensys-zkevm-goerli-prealpha.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.goerli.linea.build"];
                    readonly webSocket: readonly ["wss://rpc.goerli.linea.build"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "BlockScout";
                    readonly url: "https://explorer.goerli.linea.build";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 498623;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1337;
            readonly name: "Localhost";
            readonly network: "localhost";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
                readonly public: {
                    readonly http: readonly ["http://127.0.0.1:8545"];
                };
            };
        } | {
            readonly id: 1088;
            readonly name: "Metis";
            readonly network: "andromeda";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
                readonly public: {
                    readonly http: readonly ["https://andromeda.metis.io/?owner=1088"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Andromeda Explorer";
                    readonly url: "https://andromeda-explorer.metis.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 2338552;
                };
            };
        } | {
            readonly id: 599;
            readonly name: "Metis Goerli";
            readonly network: "metis-goerli";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Metis Goerli";
                readonly symbol: "METIS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.gateway.metisdevops.link"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Metis Goerli Explorer";
                    readonly url: "https://goerli.explorer.metisdevops.link";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1006207;
                };
            };
        } | {
            readonly id: 1287;
            readonly name: "Moonbase Alpha";
            readonly network: "moonbase-alpha";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "DEV";
                readonly symbol: "DEV";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.api.moonbase.moonbeam.network"];
                    readonly webSocket: readonly ["wss://wss.api.moonbase.moonbeam.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonbase.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1850686;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1284;
            readonly name: "Moonbeam";
            readonly network: "moonbeam";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "GLMR";
                readonly symbol: "GLMR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 609002;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 1285;
            readonly name: "Moonriver";
            readonly network: "moonriver";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "MOVR";
                readonly symbol: "MOVR";
            };
            readonly rpcUrls: {
                readonly public: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
                readonly default: {
                    readonly http: readonly ["https://moonriver.public.blastapi.io"];
                    readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
                readonly etherscan: {
                    readonly name: "Moonscan";
                    readonly url: "https://moonriver.moonscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 1597904;
                };
            };
            readonly testnet: false;
        } | {
            readonly id: 4242;
            readonly name: "Nexi";
            readonly network: "nexi";
            readonly nativeCurrency: {
                readonly name: "Nexi";
                readonly symbol: "NEXI";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.chain.nexi.technology"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
                readonly default: {
                    readonly name: "NexiScan";
                    readonly url: "https://www.nexiscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 66;
            readonly name: "OKC";
            readonly network: "okc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "OKT";
                readonly symbol: "OKT";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://exchainrpc.okex.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "oklink";
                    readonly url: "https://www.oklink.com/okc";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 10364792;
                };
            };
        } | {
            readonly id: 10;
            readonly name: "Optimism";
            readonly network: "optimism";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://optimistic.etherscan.io";
                };
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://explorer.optimism.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
            };
        } | {
            readonly id: 420;
            readonly name: "Optimism Goerli";
            readonly network: "optimism-goerli";
            readonly nativeCurrency: {
                readonly name: "Goerli Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://opt-goerli.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://opt-goerli.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://optimism-goerli.infura.io/v3"];
                    readonly webSocket: readonly ["wss://optimism-goerli.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://goerli.optimism.io"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://goerli-optimism.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 49461;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 137;
            readonly name: "Polygon";
            readonly network: "matic";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mainnet.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mainnet.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mainnet.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://polygon-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
        } | {
            readonly id: 80001;
            readonly name: "Polygon Mumbai";
            readonly network: "maticmum";
            readonly nativeCurrency: {
                readonly name: "MATIC";
                readonly symbol: "MATIC";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://polygon-mumbai.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://polygon-mumbai.infura.io/v3"];
                    readonly webSocket: readonly ["wss://polygon-mumbai.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://matic-mumbai.chainstacklabs.com"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://mumbai.polygonscan.com";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 1101;
            readonly name: "Polygon zkEVM";
            readonly network: "polygon-zkevm";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://zkevm-rpc.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://zkevm.polygonscan.com";
                };
            };
        } | {
            readonly id: 1442;
            readonly name: "Polygon zkEVM Testnet";
            readonly network: "polygon-zkevm-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.public.zkevm-test.net"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://explorer.public.zkevm-test.net";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 369;
            readonly network: "pulsechain";
            readonly name: "Pulsechain";
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://scan.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 943;
            readonly network: "pulsechainV4";
            readonly name: "Pulsechain V4";
            readonly testnet: true;
            readonly nativeCurrency: {
                readonly name: "Pulse";
                readonly symbol: "PLS";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.v4.testnet.pulsechain.com"];
                    readonly webSocket: readonly ["wss://ws.v4.testnet.pulsechain.com"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://scan.v4.testnet.pulsechain.com";
                };
            };
            readonly contracts: {
                readonly ensRegistry: {
                    readonly address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
        } | {
            readonly id: 534353;
            readonly name: "Scroll Testnet";
            readonly network: "scroll-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://alpha-rpc.scroll.io/l2"];
                    readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.scroll.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 11155111;
            readonly network: "sepolia";
            readonly name: "Sepolia";
            readonly nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "SEP";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly alchemy: {
                    readonly http: readonly ["https://eth-sepolia.g.alchemy.com/v2"];
                    readonly webSocket: readonly ["wss://eth-sepolia.g.alchemy.com/v2"];
                };
                readonly infura: {
                    readonly http: readonly ["https://sepolia.infura.io/v3"];
                    readonly webSocket: readonly ["wss://sepolia.infura.io/ws/v3"];
                };
                readonly default: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.sepolia.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 6507670;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 391845894;
            readonly name: "SKALE | Block Brawlers";
            readonly network: "skale-brawl";
            readonly nativeCurrency: {
                readonly name: "BRAWL";
                readonly symbol: "BRAWL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1564830818;
            readonly name: "SKALE | Calypso NFT Hub";
            readonly network: "skale-calypso";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 344106930;
            readonly name: "SKALE | Calypso NFT Hub Testnet";
            readonly network: "skale-calypso-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1351057110;
            readonly name: "SKALE | Chaos Testnet";
            readonly network: "skale-chaos-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 1026062157;
            readonly name: "SKALE | CryptoBlades";
            readonly network: "skale-cryptoblades";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Crypto Colosseum";
            readonly network: "skale-crypto-coloseeum";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 2046399126;
            readonly name: "SKALE | Europa Liquidity Hub";
            readonly network: "skale-europa";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/elated-tan-skat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 476158412;
            readonly name: "SKALE | Europa Liquidity Hub Testnet";
            readonly network: "skale-europa-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 2139927552;
            readonly name: "SKALE | Exorde";
            readonly network: "skale-exorde";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/light-vast-diphda"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1273227453;
            readonly name: "SKALE | Human Protocol";
            readonly network: "skale-human-protocol";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/wan-red-ain"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://wan-red-ain.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1482601649;
            readonly name: "SKALE | Nebula Gaming Hub";
            readonly network: "skale-nebula";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 503129905;
            readonly name: "SKALE | Nebula Gaming Hub Testnet";
            readonly network: "skale-nebula-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 278611351;
            readonly name: "SKALE | Razor Network";
            readonly network: "skale-razor";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1350216234;
            readonly name: "SKALE | Titan Community Hub";
            readonly network: "skale-titan";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com";
                };
            };
            readonly contracts: {};
        } | {
            readonly id: 1517929550;
            readonly name: "SKALE | Titan Community Hub Testnet";
            readonly network: "skale-titan-testnet";
            readonly nativeCurrency: {
                readonly name: "sFUEL";
                readonly symbol: "sFUEL";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
                readonly public: {
                    readonly http: readonly ["https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
                readonly default: {
                    readonly name: "SKALE Explorer";
                    readonly url: "https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com";
                };
            };
            readonly contracts: {};
            readonly testnet: true;
        } | {
            readonly id: 8082;
            readonly name: "Shardeum Sphinx";
            readonly network: "shmSphinx";
            readonly nativeCurrency: {
                readonly name: "SHARDEUM";
                readonly symbol: "SHM";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://sphinx.shardeum.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Shardeum Explorer";
                    readonly url: "https://explorer-sphinx.shardeum.org";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 57;
            readonly name: "Syscoin Mainnet";
            readonly network: "syscoin";
            readonly nativeCurrency: {
                readonly decimals: 8;
                readonly name: "Syscoin";
                readonly symbol: "SYS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.syscoin.org"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "SyscoinExplorer";
                    readonly url: "https://explorer.syscoin.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x000562033783B1136159E10d976B519C929cdE8e";
                    readonly blockCreated: 80637;
                };
            };
        } | {
            readonly id: 841;
            readonly name: "Taraxa Mainnet";
            readonly network: "taraxa";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.mainnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.mainnet.taraxa.io";
                };
            };
        } | {
            readonly id: 842;
            readonly name: "Taraxa Testnet";
            readonly network: "taraxa-testnet";
            readonly nativeCurrency: {
                readonly name: "Tara";
                readonly symbol: "TARA";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.testnet.taraxa.io"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Taraxa Explorer";
                    readonly url: "https://explorer.testnet.taraxa.io";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 40;
            readonly name: "Telos";
            readonly network: "telos";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan";
                    readonly url: "https://www.teloscan.io/";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 246530709;
                };
            };
        } | {
            readonly id: 41;
            readonly name: "Telos";
            readonly network: "telosTestnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Telos";
                readonly symbol: "TLOS";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.telos.net/evm"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "Teloscan (testnet)";
                    readonly url: "https://testnet.teloscan.io/";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 997;
            readonly name: "5ireChain Thunder Testnet";
            readonly network: "5ireChain";
            readonly nativeCurrency: {
                readonly name: "5ire Token";
                readonly symbol: "5IRE";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc-testnet.5ire.network"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "5ireChain Explorer";
                    readonly url: "https://explorer.5ire.network";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 888;
            readonly name: "Wanchain";
            readonly network: "wanchain";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WAN";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:56891", "https://gwan2-ssl.wandevs.org"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScan";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB";
                    readonly blockCreated: 25312390;
                };
            };
        } | {
            readonly id: 999;
            readonly name: "Wanchain Testnet";
            readonly network: "wanchainTestnet";
            readonly nativeCurrency: {
                readonly name: "WANCHAIN";
                readonly symbol: "WANt";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
                readonly public: {
                    readonly http: readonly ["https://gwan-ssl.wandevs.org:46891"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
                readonly default: {
                    readonly name: "WanScanTest";
                    readonly url: "https://wanscan.org";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324";
                    readonly blockCreated: 24743448;
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 50;
            readonly name: "XinFin Network";
            readonly network: "xdc";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "XDC";
                readonly symbol: "XDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.xinfin.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.xinfin.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://xdc.blocksscan.io";
                };
            };
        } | {
            readonly id: 51;
            readonly name: "Apothem Network";
            readonly network: "xdc-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "TXDC";
                readonly symbol: "TXDC";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
                readonly public: {
                    readonly http: readonly ["https://erpc.apothem.network"];
                };
            };
            readonly blockExplorers: {
                readonly xinfin: {
                    readonly name: "XinFin";
                    readonly url: "https://explorer.apothem.network";
                };
                readonly default: {
                    readonly name: "Blocksscan";
                    readonly url: "https://apothem.blocksscan.io";
                };
            };
        } | {
            readonly id: 1337803;
            readonly network: "zhejiang";
            readonly name: "Zhejiang";
            readonly nativeCurrency: {
                readonly name: "Zhejiang Ether";
                readonly symbol: "ZhejETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
                readonly public: {
                    readonly http: readonly ["https://rpc.zhejiang.ethpandaops.io"];
                };
            };
            readonly blockExplorers: {
                readonly beaconchain: {
                    readonly name: "Etherscan";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
                readonly blockscout: {
                    readonly name: "Blockscout";
                    readonly url: "https://blockscout.com/eth/zhejiang-testnet";
                };
                readonly default: {
                    readonly name: "Beaconchain";
                    readonly url: "https://zhejiang.beaconcha.in";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 324;
            readonly name: "zkSync Era";
            readonly network: "zksync-era";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "Ether";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://mainnet.era.zksync.io"];
                    readonly webSocket: readonly ["wss://mainnet.era.zksync.io/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
        } | {
            readonly id: 280;
            readonly name: "zkSync Era Testnet";
            readonly network: "zksync-era-testnet";
            readonly nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.era.zksync.dev"];
                    readonly webSocket: readonly ["wss://testnet.era.zksync.dev/ws"];
                };
            };
            readonly blockExplorers: {
                readonly default: {
                    readonly name: "zkExplorer";
                    readonly url: "https://goerli.explorer.zksync.io";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xF9cda624FBC7e059355ce98a31693d299FACd963";
                };
            };
            readonly testnet: true;
        } | {
            readonly id: 999;
            readonly name: "ZORA Goerli Testnet";
            readonly network: "zora-testnet";
            readonly nativeCurrency: {
                readonly decimals: 18;
                readonly name: "ZORA Goerli";
                readonly symbol: "ETH";
            };
            readonly rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
                readonly public: {
                    readonly http: readonly ["https://testnet.rpc.zora.co"];
                    readonly webSocket: readonly ["wss://testnet.rpc.zora.co"];
                };
            };
            readonly blockExplorers: {
                readonly etherscan: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
                readonly default: {
                    readonly name: "ZORA";
                    readonly url: "https://testnet.explorer.zora.co";
                };
            };
            readonly contracts: {
                readonly multicall3: {
                    readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                    readonly blockCreated: 189123;
                };
            };
            readonly testnet: true;
        }>) => import("viem").WatchBlocksReturnType;
        watchContractEvent: <TAbi_6 extends readonly unknown[] | import("viem").Abi, TEventName_3 extends string, TStrict_5 extends boolean = undefined>(args: import("viem").WatchContractEventParameters<TAbi_6, TEventName_3, TStrict_5>) => import("viem").WatchContractEventReturnType;
        watchEvent: <TAbiEvent_2 extends import("abitype").AbiEvent, TStrict_6 extends boolean = undefined>(args: import("viem").WatchEventParameters<TAbiEvent_2, TStrict_6>) => import("viem").WatchEventReturnType;
        watchPendingTransactions: (args: import("viem").WatchPendingTransactionsParameters<import("viem").HttpTransport>) => import("viem").WatchPendingTransactionsReturnType;
    };
    resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null>;
    isDomain(address: string): boolean;
}
