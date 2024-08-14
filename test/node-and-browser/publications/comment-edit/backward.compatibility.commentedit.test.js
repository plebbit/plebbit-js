import {
    getRemotePlebbitConfigs,
    itSkipIfRpc,
    mockPlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    setExtraPropOnCommentEditAndSign
} from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";

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

        itSkipIfRpc(
            `Publishing commentEdit.extraProp should fail if it's not included in commentEdit.signature.signedPropertyNames`,
            async () => {
                // Skipped for rpc because it will generate an invalid signature, which will be thrown in rpc server
                const commentEdit = await plebbit.createCommentEdit({
                    commentCid: commentToEdit.cid,
                    subplebbitAddress: commentToEdit.subplebbitAddress,
                    content: "Radn" + Math.random(),
                    signer: commentToEdit.signer
                });
                await setExtraPropOnCommentEditAndSign(commentEdit, { extraProp: "1234" }, false);

                await publishWithExpectedResult(
                    commentEdit,
                    false,
                    messages.ERR_COMMENT_EDIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
                );
                expect(commentEdit._publishedChallengeRequests[0].publication.extraProp).to.equal("1234");
            }
        );

        it(`publishing commentEdit.extraProp should succeed as an author edit if it's included in commentEdit.signature.signedPropertyNames`, async () => {
            const commentEdit = await plebbit.createCommentEdit({
                commentCid: commentToEdit.cid,
                subplebbitAddress: commentToEdit.subplebbitAddress,
                content: "Radn" + Math.random(),
                signer: commentToEdit.signer
            });
            await setExtraPropOnCommentEditAndSign(commentEdit, { extraProp: "1234" }, true);

            await publishWithExpectedResult(commentEdit, true);

            await new Promise((resolve) => commentToEdit.once("update", resolve));
            // if commentToEdit emits update that means the signature of update.edit is correct
            expect(commentToEdit.content).to.equal(commentEdit.content); // should process only content since it's the known field
            expect(commentToEdit.extraProp).to.be.undefined;
            expect(commentEdit._publishedChallengeRequests[0].publication.extraProp).to.equal("1234");
        });

        it(`publishing commentEdit.extraProp should succeed as a mod edit if it's included in commentEdit.signature.signedPropertyNames`, async () => {
            const commentEdit = await plebbit.createCommentEdit({
                commentCid: commentToEdit.cid,
                subplebbitAddress: commentToEdit.subplebbitAddress,
                removed: true,
                signer: signers[3]
            });
            await setExtraPropOnCommentEditAndSign(commentEdit, { extraProp: "1234" }, true);

            await publishWithExpectedResult(commentEdit, true);

            await new Promise((resolve) => commentToEdit.once("update", resolve));
            // if commentToEdit emits update that means the signature of update.edit is correct
            expect(commentToEdit.removed).to.be.true; // should process only removed since it's the known field
            expect(commentToEdit.extraProp).to.be.undefined;
            expect(commentEdit._publishedChallengeRequests[0].publication.extraProp).to.equal("1234");
        });

        it(`Publishing commentEdit.reservedField should be rejected`, async () => {
            const commentEdit = await plebbit.createCommentEdit({
                commentCid: commentToEdit.cid,
                subplebbitAddress: commentToEdit.subplebbitAddress,
                content: "Radn" + Math.random(),
                signer: commentToEdit.signer
            });
            await setExtraPropOnCommentEditAndSign(commentEdit, { insertedAt: "1234" }, true);

            await publishWithExpectedResult(commentEdit, false, messages.ERR_COMMENT_EDIT_HAS_RESERVED_FIELD);
            expect(commentEdit._publishedChallengeRequests[0].publication.insertedAt).to.equal("1234");
        });
    });
});
