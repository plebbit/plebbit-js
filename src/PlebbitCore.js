import {create as createIpfsClient} from "ipfs-http-client";

class PlebbitCore {
    constructor(options, ipfsClient = null) {
        this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        this.ipfsApiUrl = options["ipfsApiUrl"];
        this.ipfsClient = ipfsClient ? ipfsClient : this.ipfsApiUrl ? createIpfsClient(this.ipfsApiUrl) : null;
    }
}

export default PlebbitCore;