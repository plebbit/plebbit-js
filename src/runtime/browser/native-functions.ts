import { NativeFunctions } from "../../types";


const nativeFunctions: NativeFunctions = {
    //@ts-ignore
    fetch: (...args) => window.fetch(...args)
};

export default nativeFunctions;
