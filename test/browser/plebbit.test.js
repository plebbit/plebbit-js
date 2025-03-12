import Plebbit from "../../dist/node/index.js";
import { expect } from "chai";

// example of browser only tests

describe("plebbit", () => {
    it("Plebbit() has default plebbit options", async () => {
        // RPC exception
        const plebbit = await Plebbit({ httpRoutersOptions: [] });
        expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(
            [
                "https://ipfsgateway.xyz",
                "https://ipfs.io",
                "https://dweb.link",
                "https://flk-ipfs.xyz",
                "https://4everland.io",
                "https://gateway.pinata.cloud"
            ].sort()
        );
        expect(Object.keys(plebbit.clients.pubsubKuboRpcClients)).to.deep.equal(["https://pubsubprovider.xyz/api/v0"]);

        // no dataPath in brower
        expect(plebbit.dataPath).to.equal(undefined);
        JSON.stringify(plebbit); // Will throw an error if circular json
    });
});

describe(`Plebbit.subplebbits in browser`, async () => {
    it(`plebbit.subplebbits = [] in browser`, async () => {
        const plebbit = await Plebbit({ httpRoutersOptions: [] });
        expect(plebbit.subplebbits).to.deep.equal([]);
    });
});

describe(`Plebbit.challenges`, async () => {
    it(`Plebbit.challenges = {} in browser environments`, async () => {
        expect(Plebbit.challenges).to.deep.equal({});
    });
});
