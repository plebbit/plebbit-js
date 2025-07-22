import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    getAvailablePlebbitConfigsToTestAgainst,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
const subplebbitAddress = signers[0].address;

const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe("plebbit.createCommentModeration misc - " + config.name, async () => {
        let plebbit;
        let commentToMod;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            commentToMod = await publishRandomPost(subplebbitAddress, plebbit);
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`(commentMod: CommentModeration) === plebbit.createCommentModeration(JSON.parse(JSON.stringify(commentMod)))`, async () => {
            const modProps = {
                subplebbitAddress: subplebbitAddress,
                commentCid: commentToMod.cid,
                commentModeration: { removed: true, reason: "mod Reason" + Date.now() },
                signer: signers[7] // Create a new signer, different than the signer of the original comment
            };
            const commentMod = await plebbit.createCommentModeration(modProps);
            const modFromStringifiedMod = await plebbit.createCommentModeration(JSON.parse(JSON.stringify(commentMod)));
            for (const curMod of [commentMod, modFromStringifiedMod]) {
                expect(curMod.subplebbitAddress).to.equal(modProps.subplebbitAddress);
                expect(curMod.commentModeration).to.deep.equal(modProps.commentModeration);
                expect(curMod.commentCid).to.equal(modProps.commentCid);
                expect(curMod.author.address).to.deep.equal(modProps.signer.address);
            }

            expect(commentMod.timestamp).to.equal(modFromStringifiedMod.timestamp);

            expect(deterministicStringify(commentMod)).to.equal(deterministicStringify(modFromStringifiedMod));
        });

        it(`(commentMod: CommentModeration) === await plebbit.createCommentModeration(commentMod)`, async () => {
            const props = {
                challengeRequest: {
                    challengeCommentCids: ["QmVZR5Ts9MhRc66hr6TsYnX1A2oPhJ2H1fRJknxgjLLwrh"],
                    challengeAnswers: ["test123"]
                },
                subplebbitAddress: subplebbitAddress,
                commentCid: commentToMod.cid,
                commentModeration: { locked: true, reason: "editReason" + Date.now() },
                signer: signers[7] // Create a new signer, different than the signer of the original comment
            };
            const localMod = await plebbit.createCommentModeration(props);
            const recreatedLocalMod = await plebbit.createCommentModeration(JSON.parse(JSON.stringify(localMod)));
            [localMod, recreatedLocalMod].forEach((curMod) => {
                expect(curMod.subplebbitAddress).to.equal(props.subplebbitAddress);
                expect(curMod.commentCid).to.equal(props.commentCid);
                expect(curMod.commentModeration).to.deep.equal(props.commentModeration);
                expect(curMod.author.address).to.deep.equal(props.signer.address);
                expect(curMod.challengeRequest).to.deep.equal(props.challengeRequest);
            });

            const localModJson = JSON.parse(JSON.stringify(localMod));
            const recreatedLocalModJson = JSON.parse(JSON.stringify(recreatedLocalMod));
            expect(localMod.timestamp).to.equal(recreatedLocalMod.timestamp);

            expect(localModJson.signer).to.be.a("object").and.deep.equal(recreatedLocalModJson.signer);

            expect(deterministicStringify(localMod)).to.equal(deterministicStringify(recreatedLocalMod));
        });

        it(`Can publish a CommentModeration that was created from jsonfied CommentModeration instance`, async () => {
            const modProps = {
                subplebbitAddress: subplebbitAddress,
                commentCid: commentToMod.cid,
                commentModeration: { removed: true, reason: "mod Reason" + Date.now() },
                signer: roles[0].signer // mod signer
            };
            const commentMod = await plebbit.createCommentModeration(modProps);
            const modFromStringifiedMod = await plebbit.createCommentModeration(JSON.parse(JSON.stringify(commentMod)));

            const challengeRequestPromise = new Promise((resolve) => modFromStringifiedMod.once("challengerequest", resolve));

            await publishWithExpectedResult(modFromStringifiedMod, true);
            const challengerequest = await challengeRequestPromise;

            expect(challengerequest.commentModeration).to.deep.equal(commentMod.toJSONPubsubMessagePublication());

            expect(commentMod.toJSONPubsubMessagePublication()).to.deep.equal(modFromStringifiedMod.toJSONPubsubMessagePublication());
            expect(commentMod.toJSONPubsubRequestToEncrypt()).to.deep.equal(modFromStringifiedMod.toJSONPubsubRequestToEncrypt());
        });
    });

    describe(`Changing multiple fields simultaneously in one CommentModeration - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`A mod publishing multiple mod edit fields and they all should appear on the comment`, async () => {
            const modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer });
            const fieldsToChange = {
                removed: true,
                pinned: true,
                locked: true,
                spoiler: true,
                nsfw: true,
                reason: "Testing as a mod" + Date.now()
            };

            const commentMod = await plebbit.createCommentModeration({
                commentModeration: fieldsToChange,
                commentCid: modPost.cid,
                signer: roles[2].signer,
                subplebbitAddress
            });
            await publishWithExpectedResult(commentMod, true);
            await modPost.update();

            await resolveWhenConditionIsTrue(modPost, () => modPost.removed === true);
            await modPost.stop();
            expect(modPost.locked).to.be.true;
            expect(modPost.raw.commentUpdate.locked).to.be.true;

            expect(modPost.pinned).to.be.true;
            expect(modPost.raw.commentUpdate.pinned).to.be.true;

            expect(modPost.removed).to.be.true;
            expect(modPost.raw.commentUpdate.removed).to.be.true;

            expect(modPost.spoiler).to.be.true;
            expect(modPost.raw.commentUpdate.spoiler).to.be.true;

            expect(modPost.nsfw).to.be.true;
            expect(modPost.raw.commentUpdate.nsfw).to.be.true;

            expect(modPost.reason).to.equal(fieldsToChange.reason);
            expect(modPost.raw.commentUpdate.reason).to.equal(fieldsToChange.reason);
        });
    });

    describe(`Changing multiple fields in separate comment moderations`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`As a mod`, async () => {
            const modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer });
            const fieldsToChange = {
                removed: true,
                reason: "Testing removing",
                pinned: true,
                locked: true,
                spoiler: true,
                nsfw: true
            };

            const commentModeration1 = await plebbit.createCommentModeration({
                commentModeration: fieldsToChange,
                commentCid: modPost.cid,
                signer: modPost.signer,
                subplebbitAddress
            });
            await publishWithExpectedResult(commentModeration1, true);

            fieldsToChange.removed = false;
            fieldsToChange.reason = "Testing unremoving" + Date.now();
            fieldsToChange.locked = false;
            const commentModeration2 = await plebbit.createCommentModeration({
                commentModeration: fieldsToChange,
                commentCid: modPost.cid,
                signer: modPost.signer,
                subplebbitAddress
            });

            await publishWithExpectedResult(commentModeration2, true);

            await modPost.update();
            await resolveWhenConditionIsTrue(modPost, () => modPost.removed === fieldsToChange.removed);

            await modPost.stop();
            expect(modPost.locked).to.be.false;

            expect(modPost.raw.commentUpdate.edit).to.be.undefined;
            expect(modPost.raw.commentUpdate.locked).to.be.false;

            expect(modPost.pinned).to.be.true;
            expect(modPost.raw.commentUpdate.pinned).to.be.true;

            expect(modPost.removed).to.be.false;
            expect(modPost.raw.commentUpdate.removed).to.be.false;

            expect(modPost.reason).to.equal(fieldsToChange.reason);
            expect(modPost.raw.commentUpdate.reason).equal(fieldsToChange.reason);

            expect(modPost.spoiler).to.be.true;
            expect(modPost.raw.commentUpdate.spoiler).to.be.true;

            expect(modPost.nsfw).to.be.true;
            expect(modPost.raw.commentUpdate.nsfw).to.be.true;
        });

        it(`Correct value of CommentUpdate after author edit, then mod edit`, async () => {
            const authorFieldsToChange = {
                spoiler: true,
                nsfw: true,
                content: "Test new content as author" + Date.now(),
                reason: "Test as an author" + Date.now()
            };

            const authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false); // generate random signer

            const authorEdit = await plebbit.createCommentEdit({
                ...authorFieldsToChange,
                commentCid: authorPost.cid,
                signer: authorPost.signer,
                subplebbitAddress
            });
            await publishWithExpectedResult(authorEdit, true);

            const modFieldsToChange = {
                removed: true,
                reason: "Test remove as mod",
                spoiler: false,
                nsfw: false,
                pinned: true
            };
            const modEdit = await plebbit.createCommentModeration({
                commentModeration: modFieldsToChange,
                commentCid: authorPost.cid,
                signer: roles[2].signer,
                subplebbitAddress
            });

            await publishWithExpectedResult(modEdit, true);

            await authorPost.update();

            await resolveWhenConditionIsTrue(authorPost, () => authorPost.removed === modFieldsToChange.removed);

            await authorPost.stop();

            // check mod changes here
            expect(authorPost.removed).to.equal(modFieldsToChange.removed);
            expect(authorPost.raw.commentUpdate.removed).to.equal(modFieldsToChange.removed);
            expect(authorPost.reason).to.equal(modFieldsToChange.reason);
            expect(authorPost.raw.commentUpdate.reason).to.equal(modFieldsToChange.reason);

            expect(authorPost.spoiler).to.equal(modFieldsToChange.spoiler);
            expect(authorPost.raw.commentUpdate.spoiler).to.equal(modFieldsToChange.spoiler);

            expect(authorPost.nsfw).to.equal(modFieldsToChange.nsfw);
            expect(authorPost.raw.commentUpdate.nsfw).to.equal(modFieldsToChange.nsfw);

            expect(authorPost.pinned).to.equal(modFieldsToChange.pinned);
            expect(authorPost.raw.commentUpdate.pinned).to.equal(modFieldsToChange.pinned);

            // Check author changes here

            expect(authorPost.raw.commentUpdate.edit.spoiler).to.equal(authorFieldsToChange.spoiler);
            expect(authorPost.edit.spoiler).to.equal(authorFieldsToChange.spoiler);

            expect(authorPost.raw.commentUpdate.edit.nsfw).to.equal(authorFieldsToChange.nsfw);
            expect(authorPost.edit.nsfw).to.equal(authorFieldsToChange.nsfw);

            expect(authorPost.content).to.equal(authorFieldsToChange.content);
            expect(authorPost.edit.content).to.equal(authorFieldsToChange.content);
            expect(authorPost.raw.commentUpdate.edit.content).to.equal(authorFieldsToChange.content);

            expect(authorPost.edit.reason).to.equal(authorFieldsToChange.reason);
            expect(authorPost.raw.commentUpdate.edit.reason).to.equal(authorFieldsToChange.reason);
        });

        it(`Correct value of CommentUpdate after mod edit, then author edit`, async () => {
            const authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false); // generate random signer

            const modFieldsToChange = {
                reason: "Test setting spoiler as mod",
                spoiler: true,
                nsfw: true,
                pinned: true
            };
            const modEdit = await plebbit.createCommentModeration({
                commentModeration: modFieldsToChange,
                commentCid: authorPost.cid,
                signer: roles[2].signer,
                subplebbitAddress
            });

            await publishWithExpectedResult(modEdit, true);

            const authorFieldsToChange = {
                spoiler: false,
                nsfw: false,
                content: "Test new content as author" + Date.now(),
                reason: "Test as an author" + Date.now()
            };
            const authorEdit = await plebbit.createCommentEdit({
                ...authorFieldsToChange,
                commentCid: authorPost.cid,
                signer: authorPost.signer,
                subplebbitAddress
            });
            await publishWithExpectedResult(authorEdit, true);

            await authorPost.update();

            await resolveWhenConditionIsTrue(authorPost, () => authorPost?.edit?.spoiler === authorFieldsToChange.spoiler);

            await authorPost.stop();

            // check mod changes here
            expect(authorPost.removed).to.equal(modFieldsToChange.removed);
            expect(authorPost.raw.commentUpdate.removed).to.equal(modFieldsToChange.removed);
            expect(authorPost.reason).to.equal(modFieldsToChange.reason);
            expect(authorPost.raw.commentUpdate.reason).to.equal(modFieldsToChange.reason);

            expect(authorPost.spoiler).to.equal(modFieldsToChange.spoiler);
            expect(authorPost.raw.commentUpdate.spoiler).to.equal(modFieldsToChange.spoiler);

            expect(authorPost.nsfw).to.equal(modFieldsToChange.nsfw);
            expect(authorPost.raw.commentUpdate.nsfw).to.equal(modFieldsToChange.nsfw);

            expect(authorPost.pinned).to.equal(modFieldsToChange.pinned);
            expect(authorPost.raw.commentUpdate.pinned).to.equal(modFieldsToChange.pinned);

            // Check author changes here

            expect(authorPost.raw.commentUpdate.edit.spoiler).to.equal(authorFieldsToChange.spoiler);
            expect(authorPost.edit.spoiler).to.equal(authorFieldsToChange.spoiler);

            expect(authorPost.raw.commentUpdate.edit.nsfw).to.equal(authorFieldsToChange.nsfw);
            expect(authorPost.edit.nsfw).to.equal(authorFieldsToChange.nsfw);

            expect(authorPost.content).to.equal(authorFieldsToChange.content);
            expect(authorPost.edit.content).to.equal(authorFieldsToChange.content);
            expect(authorPost.raw.commentUpdate.edit.content).to.equal(authorFieldsToChange.content);

            expect(authorPost.edit.reason).to.equal(authorFieldsToChange.reason);
            expect(authorPost.raw.commentUpdate.edit.reason).to.equal(authorFieldsToChange.reason);
        });
    });
});
