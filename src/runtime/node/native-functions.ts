import { NativeFunctions } from "../../types";

const nativeFunctions: NativeFunctions = {
    //@ts-expect-error
    fetch: async (args: Parameters<typeof fetch>) => {
        return fetch(...args);
    }
};

export default nativeFunctions;
