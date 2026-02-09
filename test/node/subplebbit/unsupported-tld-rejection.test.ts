import { beforeAll, afterAll, describe, it } from "vitest";
import {
    mockPlebbit,
    createSubWithNoChallenge,
    publishWithExpectedResult,
    publishRandomPost,
    resolveWhenConditionIsTrue,
    itSkipIfRpc
} from "../../../dist/node/test/test-util.js";
import { messages } from "../../../dist/node/errors.js";
import signers from "../../fixtures/signers.js";
import type { Plebbit } from "../../../dist/node/plebbit/plebbit.js";
import type { LocalSubplebbit } from "../../../dist/node/runtime/node/subplebbit/local-subplebbit.js";
import type { RpcLocalSubplebbit } from "../../../dist/node/subplebbit/rpc-local-subplebbit.js";
import type { CommentIpfsWithCidDefined } from "../../../dist/node/publications/comment/types.js";

describe("Subplebbit rejects publications with unsupported author TLDs", () => {
    let plebbit: Plebbit;
    let subplebbit: LocalSubplebbit | RpcLocalSubplebbit;
    let validPost: CommentIpfsWithCidDefined;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({
            toUpdate: subplebbit,
            predicate: async () => typeof subplebbit.updatedAt === "number"
        });
        // Publish a valid post for Vote/CommentEdit/CommentModeration tests
        validPost = (await publishRandomPost(subplebbit.address, plebbit)) as CommentIpfsWithCidDefined;
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    itSkipIfRpc("rejects Comment with unsupported TLD (.xyz)", async () => {
        const unsupportedTldAddress = "user.xyz";
        const signer = await plebbit.createSigner();

        const comment = await plebbit.createComment({
            author: { address: unsupportedTldAddress },
            signer,
            title: "Test post with unsupported TLD",
            content: "This should be rejected",
            subplebbitAddress: subplebbit.address
        });

        await publishWithExpectedResult(comment, false, messages.ERR_FAILED_TO_RESOLVE_AUTHOR_DOMAIN);
    });

    itSkipIfRpc("rejects Vote with unsupported TLD (.xyz)", async () => {
        const unsupportedTldAddress = "voter.xyz";
        const signer = await plebbit.createSigner();

        const vote = await plebbit.createVote({
            author: { address: unsupportedTldAddress },
            signer,
            commentCid: validPost.cid,
            vote: 1,
            subplebbitAddress: subplebbit.address
        });

        await publishWithExpectedResult(vote, false, messages.ERR_FAILED_TO_RESOLVE_AUTHOR_DOMAIN);
    });

    itSkipIfRpc("rejects CommentEdit with unsupported TLD (.xyz)", async () => {
        const unsupportedTldAddress = "editor.xyz";
        const signer = await plebbit.createSigner();

        const commentEdit = await plebbit.createCommentEdit({
            author: { address: unsupportedTldAddress },
            signer,
            commentCid: validPost.cid,
            content: "Edited content from unsupported TLD",
            subplebbitAddress: subplebbit.address
        });

        await publishWithExpectedResult(commentEdit, false, messages.ERR_FAILED_TO_RESOLVE_AUTHOR_DOMAIN);
    });

    itSkipIfRpc("rejects CommentModeration with unsupported TLD (.xyz)", async () => {
        const unsupportedTldAddress = "moderator.xyz";
        const signer = await plebbit.createSigner();

        // Add the unsupported TLD address as a moderator
        await subplebbit.edit({
            roles: {
                ...subplebbit.roles,
                [unsupportedTldAddress]: { role: "moderator" }
            }
        });

        const commentModeration = await plebbit.createCommentModeration({
            author: { address: unsupportedTldAddress },
            signer,
            commentCid: validPost.cid,
            commentModeration: { removed: true, reason: "Test moderation from unsupported TLD" },
            subplebbitAddress: subplebbit.address
        });

        await publishWithExpectedResult(commentModeration, false, messages.ERR_FAILED_TO_RESOLVE_AUTHOR_DOMAIN);
    });
});
