import { expect } from "chai";
import {
    mockPlebbit,
    createSubWithNoChallenge,
    resolveWhenConditionIsTrue,
    publishRandomPost,
    waitTillPostInSubplebbitInstancePages,
    describeSkipIfRpc,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../dist/node/test/test-util.js";
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
        sub._listenToIncomingRequests = async () => {
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

        const originalCp = ipfsClient.files.cp.bind(ipfsClient.files);
        ipfsClient.files.cp = () => {
            throw Error("Failed to copy a file");
        };
        await publishRandomPost(sub.address, plebbit);

        await resolveWhenConditionIsTrue(sub, () => errors.length === 3, "error");

        await sub.delete();
        ipfsClient.files.cp = originalCp;
        expect(errors.length).to.be.greaterThan(0);

        for (const error of errors) {
            expect(error.message).to.equal("Failed to copy a file");
        }
    });

    it(`subplebbit.start can recover if pubsub.ls() fails`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        const errors = [];
        sub.on("error", (err) => errors.push(err));

        const pubsubClient = sub._clientsManager.getDefaultPubsub()._client;

        const originalPubsub = pubsubClient.pubsub.ls.bind(pubsubClient.pubsub);
        pubsubClient.pubsub.ls = () => {
            throw Error("Failed to ls pubsub topics");
        };

        await resolveWhenConditionIsTrue(sub, () => errors.length === 3, "error");

        pubsubClient.pubsub.ls = originalPubsub;

        const remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        await publishRandomPost(sub.address, remotePlebbit); // pubsub topic is working
        await remotePlebbit.destroy();

        await sub.delete();
        expect(errors.length).to.be.greaterThan(0);

        for (const error of errors) {
            expect(error.message).to.equal("Failed to ls pubsub topics");
        }
    });
});
