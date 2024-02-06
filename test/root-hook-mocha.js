import { destroyMockIpfsClient } from "../dist/node/test/mock-ipfs-client.js";
// Root Mocha hook.
export const mochaHooks = {
    afterAll: () => {
        console.log("Test running afterAll");
        // destroyMockIpfsClient(); // Need to figure out how to destory io client with parallel mocha
    }
};
