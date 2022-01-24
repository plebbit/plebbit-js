import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import Subplebbit from "../src/Subplebbit.js";
import Plebbit from "../src/Plebbit.js";
import Post from "../src/Post.js";
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL})
const subplebbit = new Subplebbit({
    "title": `Test subplebbit - ${new Date().getMilliseconds()}`,
    "ipfsGatewayUrl": IPFS_GATEWAY_URL,
    "ipfsApiUrl": IPFS_API_URL
});

describe("Test Subplebbit", async () => {

    // Destroy subplebbit once we're done with tests
    after(async () => await subplebbit.destroy());



    it("Can publish new subplebbit to ipfs", async function () {
        await subplebbit.publishAsNewSubplebbit();
        // Should have ipns key now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.ipnsKeyId);
        assert.equal(JSON.stringify(loadedSubplebbit), JSON.stringify(subplebbit), "Failed to publish new subplebbit");
    });
});