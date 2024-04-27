import PlebbitWsServer from "../../dist/node/rpc/src/index";
import { mockPlebbit } from "../../dist/node/test/test-util";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`Setting up rpc server`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Rpc server throws is rpc port is already taken`, async () => {
        const rpcServerPort = 9138;
        const options = {
            rpcOptions: { port: rpcServerPort },
            plebbitOptions: {
                ipfsHttpClientsOptions: plebbit.ipfsHttpClientsOptions,
                dataPath: plebbit.plebbitDataPath
            }
        };
        const rpcServer = await PlebbitWsServer.PlebbitWsServer(options); // was able to create an rpc server

        try {
            await PlebbitWsServer.PlebbitWsServer(options);
            expect.fail("Should throw an error");
        } catch (e) {
            expect(e.code).to.equal("ERR_FAILED_TO_CREATE_WS_RPC_SERVER");
            expect(e.details.error.code).to.equal("EADDRINUSE");
        }
        await rpcServer.destroy();
    });
});
