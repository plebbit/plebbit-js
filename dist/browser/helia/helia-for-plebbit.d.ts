import type { ParsedPlebbitOptions } from "../types.js";
import { Libp2pJsClient } from "./libp2pjsClient.js";
export declare function createLibp2pJsClientOrUseExistingOne(plebbitOptions: Required<Pick<ParsedPlebbitOptions, "httpRoutersOptions">> & NonNullable<ParsedPlebbitOptions["libp2pJsClientsOptions"]>[number]): Promise<Libp2pJsClient>;
