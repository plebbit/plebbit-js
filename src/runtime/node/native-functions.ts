import { NativeFunctions } from "../../types";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
const nativeFunctions: NativeFunctions = {
    //@ts-expect-error
    fetch: async (...args) => fetch(...args)
};

export default nativeFunctions;
