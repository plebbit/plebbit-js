import fetch from 'node-fetch';

class Plebbit {

    constructor(options) {
        this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        this.ipfsApiUrl = options["ipfsApiUrl"];
    }

    setIpfsGatewayUrl(newGatewayUrl) {
        this.ipfsGatewayUrl = newGatewayUrl;
    }

    setIpfsApiUrl(newApiUrl) {
        this.ipfsApiUrl = newApiUrl;
    }

    async getPost(postCid) {
        // TODO add verification
        return new Promise((resolve, reject) => {
            const url = `${this.ipfsApiUrl}/api/v0/cat?arg=${postCid}`;
            fetch(url, {method: "POST"}).then(res => res.json())
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }
}

export default Plebbit;