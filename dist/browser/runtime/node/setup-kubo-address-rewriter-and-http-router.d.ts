import { Plebbit } from "../../plebbit/plebbit.js";
export declare function setupKuboAddressesRewriterAndHttpRouters(plebbit: Plebbit): Promise<{
    destroy: () => Promise<void>;
}>;
