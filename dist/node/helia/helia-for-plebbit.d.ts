import type { ParsedPlebbitOptions } from "../types.js";
import type { IpfsClientForBrowser } from "./types.js";
export declare function createHeliaNode(plebbitOptions: Required<Pick<ParsedPlebbitOptions, "httpRoutersOptions">>): Promise<IpfsClientForBrowser>;
