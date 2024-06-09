import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import { messages } from "../../../dist/node/errors.js";
import * as remeda from "remeda";
import { mockRemotePlebbit, publishRandomPost, publishWithExpectedResult } from "../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;
const commentToEditCid = "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs";

const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe("CommentEdit", async () => {
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

        expect(JSON.stringify(edit)).to.equal(JSON.stringify(editFromStringifiedEdit));
    });

    it(`(edit: CommentEdit) === await plebbit.createCommentEdit(edit)`, async () => {
        const props = {
            subplebbitAddress: subplebbitAddress,
            commentCid: commentToEditCid,
            reason: "editReason" + Date.now(),
            content: "editedText" + Date.now(),
            signer: signers[7] // Create a new signer, different than the signer of the original comment
        };
        const edit = await plebbit.createCommentEdit(props);
        const editFromEdit = await plebbit.createCommentEdit(remeda.omit(edit, ["signer"]));
        [edit, editFromEdit].forEach((curEdit) => {
            expect(curEdit.subplebbitAddress).to.equal(props.subplebbitAddress);
            expect(curEdit.commentCid).to.equal(props.commentCid);
            expect(curEdit.reason).to.equal(props.reason);
            expect(curEdit.content).to.equal(props.content);
            expect(curEdit.author.address).to.deep.equal(props.signer.address);
        });
        expect(edit.timestamp).to.equal(editFromEdit.timestamp);

        expect(JSON.stringify(edit)).to.equal(JSON.stringify(editFromEdit));
    });
});

describe(`Changing multiple fields simultaneously in one CommentEdit`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`A mod can't mix author and mod edit fields`, async () => {
        // The signer is both an author and a mod
        const modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer }, false);
        const fieldsToChange = {
            removed: true,
            deleted: true,
            pinned: true,
            locked: true,
            spoiler: true,
            content: "Test change multiple fields" + Date.now()
        };

        const edit = await plebbit.createCommentEdit({
            ...fieldsToChange,
            commentCid: modPost.cid,
            signer: roles[2].signer,
            subplebbitAddress
        });

        await publishWithExpectedResult(edit, false, messages.ERR_PUBLISHING_EDIT_WITH_BOTH_MOD_AND_AUTHOR_FIELDS);
    });

    it(`A mod publishing multiple mod edit fields`, async () => {
        const modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer }, false);
        const fieldsToChange = {
            removed: true,
            pinned: true,
            locked: true,
            spoiler: true,
            reason: "Testing as a mod" + Date.now()
        };

        const edit = await plebbit.createCommentEdit({
            ...fieldsToChange,
            commentCid: modPost.cid,
            signer: roles[2].signer,
            subplebbitAddress
        });
        await publishWithExpectedResult(edit, true);
        modPost.update();

        await new Promise((resolve) =>
            modPost.on("update", () => {
                if (modPost.removed === true) resolve();
            })
        );
        await modPost.stop();
        expect(modPost.locked).to.be.true;
        expect(modPost._rawCommentUpdate.locked).to.be.true;

        expect(modPost.pinned).to.be.true;
        expect(modPost._rawCommentUpdate.pinned).to.be.true;

        expect(modPost.removed).to.be.true;
        expect(modPost._rawCommentUpdate.removed).to.be.true;

        expect(modPost.removed).to.be.true;
        expect(modPost._rawCommentUpdate.spoiler).to.be.true;

        expect(modPost.reason).to.equal(fieldsToChange.reason);
        expect(modPost._rawCommentUpdate.reason).to.equal(fieldsToChange.reason);
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
            signer: authorPost._signer,
            subplebbitAddress
        });
        await publishWithExpectedResult(edit, true);
        authorPost.update();

        await new Promise((resolve) =>
            authorPost.on("update", () => {
                if (authorPost.deleted === true) resolve();
            })
        );
        await authorPost.stop();
        expect(authorPost.deleted).to.be.true;
        expect(authorPost._rawCommentUpdate.edit.deleted).to.be.true;

        expect(authorPost.spoiler).to.be.true;
        expect(authorPost._rawCommentUpdate.edit.spoiler).to.be.true;

        expect(authorPost.content).to.equal(fieldsToChange.content);
        expect(authorPost._rawCommentUpdate.edit.content).equal(fieldsToChange.content);

        expect(authorPost.reason).to.equal(fieldsToChange.reason);
        expect(authorPost._rawCommentUpdate.edit.reason).equal(fieldsToChange.reason);
    });
});

describe(`Changing multiple edit fields in separate edits`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`As a mod`, async () => {
        const modPost = await publishRandomPost(subplebbitAddress, plebbit, { signer: roles[2].signer }, false);
        const fieldsToChange = {
            removed: true,
            reason: "Testing removing",
            pinned: true,
            locked: true,
            spoiler: true
        };

        const edit1 = await plebbit.createCommentEdit({
            ...fieldsToChange,
            commentCid: modPost.cid,
            signer: modPost._signer,
            subplebbitAddress
        });
        await publishWithExpectedResult(edit1, true);

        fieldsToChange.removed = false;
        fieldsToChange.reason = "Testing unremoving" + Date.now();
        fieldsToChange.locked = false;
        const edit2 = await plebbit.createCommentEdit({
            ...fieldsToChange,
            commentCid: modPost.cid,
            signer: modPost._signer,
            subplebbitAddress
        });

        await publishWithExpectedResult(edit2, true);

        modPost.update();

        await new Promise((resolve) =>
            modPost.on("update", () => {
                if (modPost.removed === fieldsToChange.removed) resolve();
            })
        );
        await modPost.stop();
        expect(modPost.locked).to.be.false;

        expect(modPost._rawCommentUpdate.edit).to.be.undefined;
        expect(modPost._rawCommentUpdate.locked).to.be.false;

        expect(modPost.pinned).to.be.true;
        expect(modPost._rawCommentUpdate.pinned).to.be.true;

        expect(modPost.removed).to.be.false;
        expect(modPost._rawCommentUpdate.removed).to.be.false;

        expect(modPost.reason).to.equal(fieldsToChange.reason);
        expect(modPost._rawCommentUpdate.reason).equal(fieldsToChange.reason);

        expect(modPost.spoiler).to.be.true;
        expect(modPost._rawCommentUpdate.spoiler).to.be.true;
    });

    it(`as an author`, async () => {
        const fieldsToChange = {
            deleted: true,
            spoiler: true,
            content: "Test new content as author" + Date.now(),
            reason: "Test as an author" + Date.now()
        };

        const authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false); // generate random signer

        const edit1 = await plebbit.createCommentEdit({
            ...fieldsToChange,
            commentCid: authorPost.cid,
            signer: authorPost._signer,
            subplebbitAddress
        });
        await publishWithExpectedResult(edit1, true);

        fieldsToChange.deleted = false;
        fieldsToChange.reason = "Testing undeleting" + Date.now();
        fieldsToChange.content = "Test new content" + Date.now();
        const edit2 = await plebbit.createCommentEdit({
            ...fieldsToChange,
            commentCid: authorPost.cid,
            signer: authorPost._signer,
            subplebbitAddress
        });

        await publishWithExpectedResult(edit2, true);

        authorPost.update();

        await new Promise((resolve) =>
            authorPost.on("update", () => {
                if (authorPost.deleted === fieldsToChange.deleted) resolve();
            })
        );
        await authorPost.stop();
        expect(authorPost.deleted).to.be.false;
        expect(authorPost._rawCommentUpdate.edit.deleted).to.be.false;
        expect(authorPost._rawCommentUpdate.deleted).to.be.undefined;

        expect(authorPost.reason).to.equal(fieldsToChange.reason);
        expect(authorPost._rawCommentUpdate.edit.reason).to.equal(fieldsToChange.reason);
        expect(authorPost._rawCommentUpdate.reason).to.be.undefined;

        expect(authorPost.content).to.equal(fieldsToChange.content);
        expect(authorPost._rawCommentUpdate.edit.content).to.equal(fieldsToChange.content);

        expect(authorPost.spoiler).to.be.true;
        expect(authorPost._rawCommentUpdate.edit.spoiler).to.be.true;
        expect(authorPost._rawCommentUpdate.spoiler).to.be.undefined;
    });

    it(`Correct value of CommentUpdate after author edit, then mod edit`, async () => {
        const authorFieldsToChange = {
            spoiler: true,
            content: "Test new content as author" + Date.now(),
            reason: "Test as an author" + Date.now()
        };

        const authorPost = await publishRandomPost(subplebbitAddress, plebbit, {}, false); // generate random signer

        const authorEdit = await plebbit.createCommentEdit({
            ...authorFieldsToChange,
            commentCid: authorPost.cid,
            signer: authorPost._signer,
            subplebbitAddress
        });
        await publishWithExpectedResult(authorEdit, true);

        const modFieldsToChange = {
            removed: true,
            reason: "Test remove as mod",
            spoiler: false,
            pinned: true
        };
        const modEdit = await plebbit.createCommentEdit({
            ...modFieldsToChange,
            commentCid: authorPost.cid,
            signer: roles[2].signer,
            subplebbitAddress
        });

        await publishWithExpectedResult(modEdit, true);

        authorPost.update();

        await new Promise((resolve) =>
            authorPost.on("update", () => {
                if (authorPost.removed === modFieldsToChange.removed) resolve();
            })
        );
        await authorPost.stop();

        // check mod changes here
        expect(authorPost.removed).to.equal(modFieldsToChange.removed);
        expect(authorPost._rawCommentUpdate.removed).to.equal(modFieldsToChange.removed);
        expect(authorPost.reason).to.equal(modFieldsToChange.reason);
        expect(authorPost._rawCommentUpdate.reason).to.equal(modFieldsToChange.reason);

        expect(authorPost.spoiler).to.equal(modFieldsToChange.spoiler);
        expect(authorPost._rawCommentUpdate.spoiler).to.equal(modFieldsToChange.spoiler);
        expect(authorPost.pinned).to.equal(modFieldsToChange.pinned);
        expect(authorPost._rawCommentUpdate.pinned).to.equal(modFieldsToChange.pinned);

        // Check author changes here

        expect(authorPost._rawCommentUpdate.edit.spoiler).to.equal(authorFieldsToChange.spoiler);
        expect(authorPost.edit.spoiler).to.equal(authorFieldsToChange.spoiler);

        expect(authorPost.content).to.equal(authorFieldsToChange.content);
        expect(authorPost.edit.content).to.equal(authorFieldsToChange.content);
        expect(authorPost._rawCommentUpdate.edit.content).to.equal(authorFieldsToChange.content);

        expect(authorPost.edit.reason).to.equal(authorFieldsToChange.reason);
        expect(authorPost._rawCommentUpdate.edit.reason).to.equal(authorFieldsToChange.reason);
    });
});
