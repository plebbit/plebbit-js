import { startSubplebbits } from "../../dist/browser/test/test-util";
import Plebbit from "../../dist/node";
import signers from "../fixtures/signers";
const memoryDatabaseConfig = {
    client: "sqlite3",
    connection: {
        filename: ":memory:"
    },
    useNullAsDefault: true
};

Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("plebbit", () => {
    it(`Run server`, async () =>
        new Promise(async (resolve) => {
            console.log(startSubplebbits);
            await startSubplebbits({
                dataPath: window.plebbitDataPath,
                signers: signers,
                syncInterval: 100,
                database: memoryDatabaseConfig,
                votesPerCommentToPublish: 1,
                numOfCommentsToPublish: 1
            });
            console.log("started subplebbits");
        }));
});

// (async () => {})();
