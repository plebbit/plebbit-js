import {concat as uint8ArrayConcat} from 'uint8arrays/concat';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import all from 'it-all';
import last from "it-last";

export async function loadIpfsFileAsJson(cid, ipfsClient) {
    return new Promise((resolve, reject) => {
        all(ipfsClient.cat(cid))
            .then(rawData => uint8ArrayConcat(rawData))
            .catch(reject)
            .then(data => {
                const jsonObject = JSON.parse(uint8ArrayToString(data));
                resolve(jsonObject);
            }).catch(reject);
    });
}

export async function loadIpnsAsJson(ipns, ipfsClient) {
    return new Promise(async (resolve, reject) => {
        last(ipfsClient.name.resolve(ipns)).then(cid => {
            loadIpfsFileAsJson(cid, ipfsClient).then(resolve).catch(reject);
        }).catch(reject);
    });
}

