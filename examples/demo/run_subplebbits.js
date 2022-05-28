import Plebbit from "@plebbit/plebbit-js";
import { subplebbitsPrivateKeys } from "./secrets.js";
import http from "http";
import path from "path";
import Knex from "knex";

const plebbit = Plebbit({
    ipfsHttpClientOptions: {
        url: `http://localhost:5001/api/v0`,
        agent: new http.Agent({ keepAlive: true, maxSockets: Infinity })
    }
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
    }
];

const CHECK_IF_COMMENTS_SHOULD_BE_DELETED_EVERY = 300000; // Check for comments that need to be deleted every 5 minutes
const DELETE_COMMENTS_THAN_ARE_OLDER_THAN = 60 * 60 * 12; // Delete comments that are older 12 hours

async function runSubplebbit(props) {
    const subplebbit = await plebbit.createSubplebbit(props);
    await subplebbit.start(300000); // Sync every 5 minutes
    console.log(`Subplebbit ${props.title} is running now`);
}

// By default delete comments older 12 hours
async function deleteCommentsOlderThan() {
    await Promise.all(
        subplebbitsProps.map(async (props) => {
            const dbPath = path.join(process.cwd(), ".plebbit", props.signer.address);
            const knex = Knex({
                client: "better-sqlite3",
                connection: {
                    filename: dbPath
                },
                useNullAsDefault: true
            });
            const currentTimestamp = Math.round(Date.now() / 1000.0);
            const limit = currentTimestamp - DELETE_COMMENTS_THAN_ARE_OLDER_THAN;
            // Delete any comments whose timestamp is less than limit
            const commentsToDelete = (await knex("comments").whereBetween("timestamp", [0, limit])).map((comment) => comment.cid);
            const deletedVotes = await knex("votes").whereIn("commentCid", commentsToDelete).delete();
            const numOfDeletedComments = await knex("comments").whereBetween("timestamp", [0, limit]).delete();
            if (numOfDeletedComments > 0)
                console.log(`Deleted ${numOfDeletedComments} comments and ${deletedVotes} votes since they were older than 12 hours`);
            await knex.destroy();
        })
    );
}

setInterval(deleteCommentsOlderThan, CHECK_IF_COMMENTS_SHOULD_BE_DELETED_EVERY);
await Promise.all(subplebbitsProps.map((prop) => runSubplebbit(prop)));
