// This file is to run a subplebbit to be used by other tests

import {IPFS_CLIENT_CONFIGS} from "../secrets.js";
import Plebbit from "../src/index.js";
import {getLatestSubplebbitAddress} from "./MockUtil.js";

const createNewSigner = false;


const plebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});

const subplebbit = createNewSigner ? await plebbit.createSubplebbit({
    "Title": "Some Subplebbit",
    "signer": await plebbit.createSigner()
}) : await plebbit.createSubplebbit({"address": await getLatestSubplebbitAddress()});

subplebbit.setProvideCaptchaCallback(() => [null, null]);

await subplebbit.start();
