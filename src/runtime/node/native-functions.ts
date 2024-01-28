import { NativeFunctions } from "../../types";

import fetch from "node-fetch";

const nativeFunctions: NativeFunctions = {
    //@ts-ignore
    fetch: async (...args) => {
        const res = await fetch(...args);
        const resObj = {};
        for (const property in res) resObj[property] = typeof res[property] === "function" ? res[property].bind(res) : res[property];

        return resObj;
    }
};

export default nativeFunctions;
