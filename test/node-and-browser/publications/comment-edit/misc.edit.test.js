import signers from "../../../fixtures/signers.js";
import {
    mockRemotePlebbit,
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
const commentToEditCid = "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs";

const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe("plebbit.createCommentEdit", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it(`(edit: CommentEdit) === plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)))`, async () => {
        const props = {
            subplebbitAddress: subplebbitAddress,
            commentCid: commentToEditCid,
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
            pubsubMessage: { challengeCommentCids: ["QmVZR5Ts9MhRc66hr6TsYnX1A2oPhJ2H1fRJknxgjLLwrh"], challengeAnswers: ["1234"] },
            subplebbitAddress: subplebbitAddress,
            commentCid: commentToEditCid,
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
            expect(curEdit.challengeAnswers).to.deep.equal(props.pubsubMessage.challengeAnswers);
            expect(curEdit.challengeCommentCids).to.deep.equal(props.pubsubMessage.challengeCommentCids);
        });

        const localEditJson = JSON.parse(JSON.stringify(localEdit));
        const recreatedLocalEditJson = JSON.parse(JSON.stringify(recreatedLocalEdit));
        expect(localEdit.timestamp).to.equal(recreatedLocalEdit.timestamp);

        expect(localEditJson.signer).to.be.a("object").and.deep.equal(recreatedLocalEditJson.signer);

        expect(deterministicStringify(localEdit)).to.equal(deterministicStringify(recreatedLocalEdit));
    });
});

describe(`Changing multiple fields simultaneously in one CommentEdit`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`An author publishing multiple author edit fields`, async () => {
        const authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false); // random signer

        const fieldsToChange = {
            deleted: true,
            spoiler: true,
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

        expect(authorPost.content).to.equal(fieldsToChange.content);
        expect(authorPost._rawCommentUpdate.edit.content).equal(fieldsToChange.content);

        expect(authorPost.edit.reason).to.equal(fieldsToChange.reason);
        expect(authorPost._rawCommentUpdate.edit.reason).equal(fieldsToChange.reason);
        expect(authorPost.reason).to.be.undefined;
        expect(authorPost._rawCommentUpdate.reason).to.be.undefined;
    });
});

describe(`Changing multiple edit fields in separate edits`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`as an author`, async () => {
        const firstEditProps = {
            spoiler: true,
            content: "Test new content as author" + Date.now(),
            reason: "Test as an author" + Date.now()
        };

        const authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false); // generate random signer

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
    });
});
