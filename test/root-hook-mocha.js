const { destroyMockIpfsClient } = require("../dist/node/test/mock-ipfs-client");
// Root Mocha hook.
exports.mochaHooks = {
    afterAll: () => {
        console.log("Test running afterAll");
        destroyMockIpfsClient();
    }
};
