const { destroyMockIpfsClient } = require("../dist/node/test/mock-ipfs-client");
// Root Mocha hook.
exports.mochaHooks = {
    afterAll: () => {
        console.log("Test running afterAll");
        // destroyMockIpfsClient(); // Need to figure out how to destory io client with parallel mocha
    }
};
