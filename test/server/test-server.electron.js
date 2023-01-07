import { startSubplebbits } from "../../dist/browser/test/test-util";
import Plebbit from "../../dist/node";
import signers from "../fixtures/signers";

Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("plebbit", () => {
    it(`Run server`, async () =>
        new Promise(async (resolve) => {
            await startSubplebbits({
                dataPath: window.plebbitDataPath,
                signers: signers,
                syncInterval: 100,
                votesPerCommentToPublish: 1,
                numOfCommentsToPublish: 1
            });
            console.log("started subplebbits");
            // Create a server that mocks an ipfs gateway
            // Will return valid content for one cid and invalid content for another
            // The purpose is to test whether plebbit.fetchCid will throw if we retrieved the invalid content

            window.startMaliciousGateway();
        }));
});
