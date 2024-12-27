import signers from "../../../fixtures/signers.js";
import {
    getRemotePlebbitConfigs,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe("plebbit.createCommentEdit - " + config.name, async () => {
        let plebbit;
        let commentToEdit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            commentToEdit = await publishRandomPost(subplebbitAddress, plebbit);
            expect(commentToEdit.cid).to.be.a("string");
        });
        it(`(edit: CommentEdit) === plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)))`, async () => {
            const props = {
                subplebbitAddress: subplebbitAddress,
                commentCid: commentToEdit.cid,
                reason: "editReason" + Date.now(),
                content: "editedText" + Date.now(),
                signer: signers[7] // Create a new signer, different than the signer of the original comment
            };
            const edit = await plebbit.createCommentEdit(props);
            const editFromStringifiedEdit = await plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)));
            for (const curEdit of [edit, editFromStringifiedEdit]) {
                expect(curEdit.subplebbitAddress).to.equal(props.subplebbitAddress);
                expect(curEdit.commentCid).to.equal(props.commentCid);
                expect(curEdit.reason).to.equal(props.reason);
                expect(curEdit.content).to.equal(props.content);
                expect(curEdit.author.address).to.deep.equal(props.signer.address);
            }

            expect(edit.timestamp).to.equal(editFromStringifiedEdit.timestamp);

            expect(deterministicStringify(edit)).to.equal(deterministicStringify(editFromStringifiedEdit));
        });

        it(`(edit: CommentEdit) === await plebbit.createCommentEdit(edit)`, async () => {
            const props = {
                challengeRequest: { challengeCommentCids: ["QmVZR5Ts9MhRc66hr6TsYnX1A2oPhJ2H1fRJknxgjLLwrh"], challengeAnswers: ["1234"] },
                subplebbitAddress: subplebbitAddress,
                commentCid: commentToEdit.cid,
                reason: "editReason" + Date.now(),
                content: "editedText" + Date.now(),
                signer: signers[7] // Create a new signer, different than the signer of the original comment
            };
            const localEdit = await plebbit.createCommentEdit(props);
            const recreatedLocalEdit = await plebbit.createCommentEdit(JSON.parse(JSON.stringify(localEdit)));
            [localEdit, recreatedLocalEdit].forEach((curEdit) => {
                expect(curEdit.subplebbitAddress).to.equal(props.subplebbitAddress);
                expect(curEdit.commentCid).to.equal(props.commentCid);
                expect(curEdit.reason).to.equal(props.reason);
                expect(curEdit.content).to.equal(props.content);
                expect(curEdit.author.address).to.deep.equal(props.signer.address);
                expect(curEdit.challengeRequest).to.deep.equal(props.challengeRequest);
            });

            expect(localEdit.toJSONPubsubRequestToEncrypt()).to.deep.equal(recreatedLocalEdit.toJSONPubsubRequestToEncrypt());

            const localEditJson = JSON.parse(JSON.stringify(localEdit));
            const recreatedLocalEditJson = JSON.parse(JSON.stringify(recreatedLocalEdit));
            expect(localEdit.timestamp).to.equal(recreatedLocalEdit.timestamp);

            expect(localEditJson.signer).to.be.a("object").and.deep.equal(recreatedLocalEditJson.signer);

            expect(deterministicStringify(localEdit)).to.equal(deterministicStringify(recreatedLocalEdit));
        });

        it(`Can publish a CommentEdit that was created from jsonfied CommentEdit instance`, async () => {
            const props = {
                subplebbitAddress: subplebbitAddress,
                commentCid: commentToEdit.cid,
                reason: "editReason" + Date.now(),
                content: "editedText" + Date.now(),
                signer: commentToEdit.signer
            };
            const edit = await plebbit.createCommentEdit(props);
            const editFromStringifiedEdit = await plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)));

            const challengeRequestPromise = new Promise((resolve) => editFromStringifiedEdit.once("challengerequest", resolve));
            await publishWithExpectedResult(editFromStringifiedEdit, true);
            const challengerequest = await challengeRequestPromise;

            expect(challengerequest.commentEdit).to.deep.equal(edit.toJSONPubsubMessagePublication());
            expect(edit.toJSONPubsubMessagePublication()).to.deep.equal(editFromStringifiedEdit.toJSONPubsubMessagePublication());
            expect(edit.toJSONPubsubRequestToEncrypt()).to.deep.equal(editFromStringifiedEdit.toJSONPubsubRequestToEncrypt());
        });
    });

    describe(`Changing multiple fields simultaneously in one CommentEdit - ` + config.name, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        it(`An author publishing multiple author edit fields`, async () => {
            const authorPost = await publishRandomPost(subplebbitAddress, plebbit); // random signer

            const fieldsToChange = {
                deleted: true,
                spoiler: true,
                nsfw: true,
                content: "Test new content as author" + Date.now(),
                reason: "Test as an author" + Date.now()
            };

            const edit = await plebbit.createCommentEdit({
                ...fieldsToChange,
                commentCid: authorPost.cid,
                signer: authorPost.signer,
                subplebbitAddress
            });
            await publishWithExpectedResult(edit, true);
            await authorPost.update();
            await resolveWhenConditionIsTrue(authorPost, () => authorPost.deleted);
            await authorPost.stop();
            expect(authorPost.deleted).to.be.true;
            expect(authorPost._rawCommentUpdate.edit.deleted).to.be.true;

            expect(authorPost.spoiler).to.be.true;
            expect(authorPost._rawCommentUpdate.edit.spoiler).to.be.true;

            expect(authorPost.nsfw).to.be.true;
            expect(authorPost._rawCommentUpdate.edit.nsfw).to.be.true;

            expect(authorPost.content).to.equal(fieldsToChange.content);
            expect(authorPost._rawCommentUpdate.edit.content).equal(fieldsToChange.content);

            expect(authorPost.edit.reason).to.equal(fieldsToChange.reason);
            expect(authorPost._rawCommentUpdate.edit.reason).equal(fieldsToChange.reason);
            expect(authorPost.reason).to.be.undefined;
            expect(authorPost._rawCommentUpdate.reason).to.be.undefined;
        });
    });

    describe(`Changing multiple edit fields in separate edits - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        it(`as an author`, async () => {
            const firstEditProps = {
                spoiler: true,
                nsfw: true,
                content: "Test new content as author" + Date.now(),
                reason: "Test as an author" + Date.now()
            };

            const authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}); // generate random signer

            const edit1 = await plebbit.createCommentEdit({
                ...firstEditProps,
                commentCid: authorPost.cid,
                signer: authorPost.signer,
                subplebbitAddress
            });
            await publishWithExpectedResult(edit1, true);

            const secondEditProps = {
                ...firstEditProps,
                deleted: true,
                reason: "Testing undeleting" + Date.now(),
                content: "Test new content" + Date.now()
            };
            const edit2 = await plebbit.createCommentEdit({
                ...secondEditProps,
                commentCid: authorPost.cid,
                signer: authorPost.signer,
                subplebbitAddress
            });

            await publishWithExpectedResult(edit2, true);

            await authorPost.update();
            await resolveWhenConditionIsTrue(authorPost, () => authorPost.deleted === secondEditProps.deleted);

            await authorPost.stop();
            expect(authorPost.deleted).to.equal(secondEditProps.deleted);
            expect(authorPost._rawCommentUpdate.edit.deleted).to.equal(secondEditProps.deleted);

            expect(authorPost.edit.reason).to.equal(secondEditProps.reason);
            expect(authorPost._rawCommentUpdate.edit.reason).to.equal(secondEditProps.reason);

            expect(authorPost.reason).to.be.undefined; // reserved for mods
            expect(authorPost._rawCommentUpdate.reason).to.be.undefined;

            expect(authorPost.content).to.equal(secondEditProps.content);
            expect(authorPost._rawCommentUpdate.edit.content).to.equal(secondEditProps.content);

            expect(authorPost.spoiler).to.equal(firstEditProps.spoiler);
            expect(authorPost._rawCommentUpdate.edit.spoiler).to.equal(firstEditProps.spoiler);
            expect(authorPost._rawCommentUpdate.spoiler).to.be.undefined;

            expect(authorPost.nsfw).to.equal(firstEditProps.nsfw);
            expect(authorPost._rawCommentUpdate.edit.nsfw).to.equal(firstEditProps.nsfw);
            expect(authorPost._rawCommentUpdate.nsfw).to.be.undefined;
        });
    });
});
