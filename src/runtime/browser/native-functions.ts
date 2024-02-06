import { NativeFunctions } from "../../types.js";

const nativeFunctions: NativeFunctions = {
    //@ts-ignore
    fetch: (...args) => window.fetch(...args)
};

export default nativeFunctions;
