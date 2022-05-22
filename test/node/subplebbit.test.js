const Plebbit = require("../../dist/node");
const { expect } = require("chai");

let plebbit;
let subplebbit;

describe("subplebbit", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
    });

    it("create new subplebbit", async function () {
        const databaseConfig = {
            client: "better-sqlite3", // or 'better-sqlite3'
            connection: {
                filename: ":memory:"
            },
            useNullAsDefault: true
        };
        const signer = await plebbit.createSigner();
        subplebbit = await plebbit.createSubplebbit({
            signer: signer,
            title: `Test subplebbit - ${Date.now() / 1000}`,
            database: databaseConfig
        });

        await subplebbit.start();
        expect(subplebbit.address).to.be.a("string");
        // Should have address now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        expect(subplebbit.toJSON()).to.deep.equal(loadedSubplebbit.toJSON());
    });

    it("subplebbit.edit", async () => {
        return new Promise(async (resolve) => {
            const newTitle = `New title to test subplebbit.edit - ${Date.now()}`;
            const newDescription = `New description to test subplebbit.edit - ${Date.now()}`;
            const newProps = { title: newTitle, description: newDescription };
            await subplebbit.edit(newProps);

            subplebbit.once("update", async () => {
                expect(subplebbit.title).to.equal(newTitle);
                expect(subplebbit.description, newDescription);
                resolve();
            });
            await subplebbit.update();
        });
    });
});
