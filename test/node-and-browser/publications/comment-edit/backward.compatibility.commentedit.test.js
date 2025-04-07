import { expect } from "chai";
import {
    getRemotePlebbitConfigs,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    setExtraPropOnCommentEditAndSign
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import signers from "../../../fixtures/signers.js";

const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

getRemotePlebbitConfigs().map((config) => {
    describe(`Backward compatibility for CommentEdit - ${config.name}`, async () => {
        // A subplebbit should accept a CommentEdit with unknown props
        // However, it should not process the unknown props, it should strip them out after validation

        let plebbit;
        let commentToEdit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            commentToEdit = await publishRandomPost(signers[0].address, plebbit, {}, false);
            await commentToEdit.update();
            await resolveWhenConditionIsTrue(commentToEdit, () => typeof commentToEdit.updatedAt === "number");
        });

        after(async () => {
            await commentToEdit.stop();
        });

        it(`Publishing commentEdit.extraProp should fail if it's not included in commentEdit.signature.signedPropertyNames`, async () => {
            // Skipped for rpc because it will generate an invalid signature, which will be thrown in rpc server
            const commentEdit = await plebbit.createCommentEdit({
                commentCid: commentToEdit.cid,
                subplebbitAddress: commentToEdit.subplebbitAddress,
                content: "Radn" + Math.random(),
                signer: commentToEdit.signer
            });
            await setExtraPropOnCommentEditAndSign(commentEdit, { extraProp: "1234" }, false);

            const challengeRequestPromise = new Promise((resolve) => commentEdit.once("challengerequest", resolve));
            await publishWithExpectedResult(
                commentEdit,
                false,
                messages.ERR_COMMENT_EDIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
            );
            const challengeRequest = await challengeRequestPromise;
            expect(challengeRequest.commentEdit.extraProp).to.equal("1234");
        });

        it(`publishing commentEdit.extraProp should succeed as an author edit if it's included in commentEdit.signature.signedPropertyNames`, async () => {
            const commentEdit = await plebbit.createCommentEdit({
                commentCid: commentToEdit.cid,
                subplebbitAddress: commentToEdit.subplebbitAddress,
                content: "Radn" + Math.random(),
                signer: commentToEdit.signer
            });
            await setExtraPropOnCommentEditAndSign(commentEdit, { extraProp: "1234" }, true);

            const challengeRequestPromise = new Promise((resolve) => commentEdit.once("challengerequest", resolve));

            await publishWithExpectedResult(commentEdit, true);

            await new Promise((resolve) => commentToEdit.once("update", resolve));
            // if commentToEdit emits update that means the signature of update.edit is correct
            expect(commentToEdit.content).to.equal(commentEdit.content); // should process only content since it's the known field
            expect(commentToEdit.extraProp).to.be.undefined;
            const challengeRequest = await challengeRequestPromise;
            expect(challengeRequest.commentEdit.extraProp).to.equal("1234");
            await plebbit.createCommentEdit(JSON.parse(JSON.stringify(commentEdit))); // Just to test if create will throw because of extra prop
        });

        it(`Publishing commentEdit.reservedField should be rejected`, async () => {
            const commentEdit = await plebbit.createCommentEdit({
                commentCid: commentToEdit.cid,
                subplebbitAddress: commentToEdit.subplebbitAddress,
                content: "Radn" + Math.random(),
                signer: commentToEdit.signer
            });
            await setExtraPropOnCommentEditAndSign(commentEdit, { insertedAt: "1234" }, true);

            const challengeRequestPromise = new Promise((resolve) => commentEdit.once("challengerequest", resolve));
            await publishWithExpectedResult(commentEdit, false, messages.ERR_COMMENT_EDIT_HAS_RESERVED_FIELD);
            const challengeRequest = await challengeRequestPromise;
            expect(challengeRequest.commentEdit.insertedAt).to.equal("1234");
        });

        describe(`Publishing CommentEdit with extra props in author field - ${config.name}`, async () => {
            it(`Publishing with extra prop for author should fail if it's a reserved field`, async () => {
                const commentEdit = await plebbit.createCommentEdit({
                    commentCid: commentToEdit.cid,
                    subplebbitAddress: commentToEdit.subplebbitAddress,
                    deleted: true,
                    signer: signers[3]
                });

                await setExtraPropOnCommentEditAndSign(
                    commentEdit,
                    { author: { ...commentEdit._pubsubMsgToPublish.author, subplebbit: "random" } },
                    true
                );

                const challengeRequestPromise = new Promise((resolve) => commentEdit.once("challengerequest", resolve));

                await publishWithExpectedResult(commentEdit, false, messages.ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD);
                const challengerequest = await challengeRequestPromise;
                expect(challengerequest.commentEdit.author.subplebbit).to.equal("random");
            });
            it(`Publishing with extra prop for author should succeed`, async () => {
                const commentEdit = await plebbit.createCommentEdit({
                    commentCid: commentToEdit.cid,
                    subplebbitAddress: commentToEdit.subplebbitAddress,
                    spoiler: true,
                    signer: commentToEdit.signer
                });
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentEditAndSign(
                    commentEdit,
                    { author: { ...commentEdit._pubsubMsgToPublish.author, ...extraProps } },
                    true
                );

                await plebbit.createCommentEdit(JSON.parse(JSON.stringify(commentEdit))); // Just to test if create will throw because of extra prop

                const challengeRequestPromise = new Promise((resolve) => commentEdit.once("challengerequest", resolve));

                await publishWithExpectedResult(commentEdit, true);
                const challengeRequest = await challengeRequestPromise;
                expect(challengeRequest.commentEdit.author.extraProp).to.equal(extraProps.extraProp);
            });
        });
    });
});
