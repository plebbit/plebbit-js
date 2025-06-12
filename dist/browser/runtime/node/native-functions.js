import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
const nativeFunctions = {
    fetch: async (...args) => fetch(...args)
};
export default nativeFunctions;
//# sourceMappingURL=native-functions.js.map