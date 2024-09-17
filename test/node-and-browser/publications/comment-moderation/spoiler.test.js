import signers from "../../../fixtures/signers.js";
import {
    mockRemotePlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";
import { messages } from "../../../../dist/node/errors.js";
import { verifyCommentIpfs, verifyCommentUpdate } from "../../../../dist/node/signer/signatures.js";

const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe(`Mods marking an author comment as spoiler`, async () => {
    let plebbit, randomPost;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        randomPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
        randomPost.update();
    });

    after(async () => {
        await randomPost.stop();
    });

    it(`Mod can mark an author comment as spoiler`, async () => {
        const modSpoilerEdit = await plebbit.createCommentModeration({
            subplebbitAddress: randomPost.subplebbitAddress,
            commentCid: randomPost.cid,
            commentModeration: { spoiler: true, reason: "Mod marking an author comment as spoiler" },
            signer: roles[2].signer
        });
        await publishWithExpectedResult(modSpoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=true`, async () => {
        await resolveWhenConditionIsTrue(randomPost, () => randomPost.spoiler === true);
        expect(randomPost._rawCommentUpdate.reason).to.equal("Mod marking an author comment as spoiler");
        expect(randomPost._rawCommentUpdate.spoiler).to.be.true;
        expect(randomPost._rawCommentUpdate.edit).to.be.undefined;

        expect(randomPost.reason).to.equal("Mod marking an author comment as spoiler");
        expect(randomPost.spoiler).to.be.true;
    });

    it(`Mod can mark unspoiler author comment `, async () => {
        const unspoilerEdit = await plebbit.createCommentModeration({
            subplebbitAddress: randomPost.subplebbitAddress,
            commentCid: randomPost.cid,
            commentModeration: { spoiler: false, reason: "Mod unspoilering an author comment" },
            signer: roles[2].signer
        });
        await publishWithExpectedResult(unspoilerEdit, true);
    });

    it(`A new CommentUpdate is published with spoiler=false`, async () => {
        await resolveWhenConditionIsTrue(randomPost, () => randomPost.spoiler === false);
        expect(randomPost._rawCommentUpdate.reason).to.equal("Mod unspoilering an author comment");
        expect(randomPost._rawCommentUpdate.spoiler).to.be.false;
        expect(randomPost._rawCommentUpdate.edit).to.be.undefined;

        expect(randomPost.reason).to.equal("Mod unspoilering an author comment");
        expect(randomPost.spoiler).to.be.false;
    });
});
