import Plebbit from "@plebbit/plebbit-js";
import { subplebbitsPrivateKeys } from "./secrets.js";

const plebbit = await Plebbit({
    ipfsHttpClientOptions: `http://localhost:5001/api/v0`
});

const subplebbitsProps = [
    {
        title: "Funny",
        description: "Welcome to p/Funny, Plebbit's largest humour depository.",
        signer: await plebbit.createSigner(subplebbitsPrivateKeys[0])
    },
    {
        title: "Politics",
        description: "p/Politics is for news and discussion politics",
        signer: await plebbit.createSigner(subplebbitsPrivateKeys[1])
    },
    {
        title: "Crypto",
        description: "For discussing anything related to cryptocurrencies",
        signer: await plebbit.createSigner(subplebbitsPrivateKeys[2])
    },
    {
        title: "gifs",
        description: 'Funny, animated GIFs: Your favorite computer file type! Officially pronounced with a hard "J"',
        signer: await plebbit.createSigner(subplebbitsPrivateKeys[3])
    },
    {
        title: "Videos",
        description: "Plebbit's main subplebbit for videos",
        signer: await plebbit.createSigner(subplebbitsPrivateKeys[4])
    },
    {
        title: "Pleb whales (plebwhales.bso)",
        description: "For those destined to make it. Minimum 1B PLEB in wallet to post",
        signer: await plebbit.createSigner(subplebbitsPrivateKeys[5])
    }
];

async function runSubplebbit(props) {
    const subplebbit = await plebbit.createSubplebbit(props);
    await subplebbit.start();
    await subplebbit.edit({ roles: { ...subplebbit.roles, "estebanabaroa.bso": { role: "admin" } } });
    subplebbit.once("update", () => console.log(`Subplebbit ${props.title} (${subplebbit.address}) is running now`));
}

await Promise.all(subplebbitsProps.map((prop) => runSubplebbit(prop)));
