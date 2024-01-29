import { NativeFunctions } from "../../types";

const nativeFunctions: NativeFunctions = {
    //@ts-expect-error
    fetch: async (...args) => fetch(...args)
};

export default nativeFunctions;
