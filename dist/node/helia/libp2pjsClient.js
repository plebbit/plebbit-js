import { hideClassPrivateProps } from "../util.js";
export class Libp2pJsClient {
    constructor(libp2pJsClientOptions) {
        this._helia = libp2pJsClientOptions.helia;
        this._heliaUnixfs = libp2pJsClientOptions.heliaUnixfs;
        this._heliaIpnsRouter = libp2pJsClientOptions.heliaIpnsRouter;
        this.heliaWithKuboRpcClientFunctions = libp2pJsClientOptions.heliaWithKuboRpcClientFunctions;
        this._libp2pJsClientOptions = libp2pJsClientOptions.libp2pJsClientOptions;
        this._mergedHeliaOptions = libp2pJsClientOptions.mergedHeliaOptions;
        this.key = libp2pJsClientOptions.key;
        this.countOfUsesOfInstance = libp2pJsClientOptions.countOfUsesOfInstance;
        hideClassPrivateProps(this);
    }
}
//# sourceMappingURL=libp2pjsClient.js.map