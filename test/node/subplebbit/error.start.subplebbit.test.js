import {
    mockPlebbit,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue,
    publishRandomPost,
    waitTillPostInSubplebbitInstancePages,
    describeSkipIfRpc
} from "../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describeSkipIfRpc(`Local subplebbit emits errors properly in the publish loop`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`subplebbit.start() emits errors if the sync loop crashes once`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        const errors = [];
        sub.on("error", (err) => errors.push(err));
        sub._getDbInternalState = async () => {
            throw Error("Failed to load sub from db");
        };
        await publishRandomPost(sub.address, plebbit);
        await resolveWhenConditionIsTrue(sub, () => errors.length === 3, "error");

        await sub.delete();

        expect(errors.length).to.be.greaterThan(0);
        for (const error of errors) {
            expect(error.message).to.equal("Failed to load sub from db");
        }
    });

    it(`subplebbit.start() emits errors if kubo API call  fails`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        const errors = [];
        sub.on("error", (err) => errors.push(err));

        const ipfsClient = sub._clientsManager.getDefaultIpfs()._client;

        ipfsClient.files.cp = () => {
            throw Error("Failed to copy file");
        };
        await publishRandomPost(sub.address, plebbit);

        await resolveWhenConditionIsTrue(sub, () => errors.length === 3, "error");

        await sub.delete();

        expect(errors.length).to.be.greaterThan(0);

        for (const error of errors) {
            expect(error.message).to.equal("Failed to copy a file");
        }
    });

    it(`subplebbit.start() emits errors if subplebbit fails to calculate ipfs path for comment update`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        const errors = [];
        sub.on("error", (err) => errors.push(err));

        sub._calculateIpfsPathForCommentUpdate = () => {
            throw Error("Failed to calculate ipfs path for comment update");
        };
        await publishRandomPost(sub.address, plebbit);

        await resolveWhenConditionIsTrue(sub, () => errors.length === 3, "error");
        await sub.delete();

        expect(errors.length).to.be.greaterThan(0);

        for (const error of errors) {
            expect(error.message).to.equal("Failed to calculate ipfs path for comment update");
        }
    });
});
