import { describe, it } from "vitest";

describe('subplebbit.features.anonymityMode="per-author"', () => {
    it('Spec: same signer maps to a stable pseudonymous author address across all posts and replies when anonymityMode="per-author"', () => {});
    it("Spec: two different signers never share the same pseudonymous author address", () => {});
    it("Spec: anonymized publication strips author displayName/wallets/avatar/flair fields", () => {});
    it("Spec: anonymized publication omits author.previousCommentCid", () => {});
    it("Spec: comment edit signed by original author is accepted and re-signed with anonymized author key", () => {});
    it("Spec: comment edit is rejected when original author does not match stored anonymization mapping", () => {});
    it("Spec: anonymized comment.signature.publicKey differs from original author's signer publicKey", () => {});
    it("Spec: purging an anonymized comment removes its alias mapping", () => {});
    it("Spec: loads preloaded pages with anonymized posts/replies without failing verification", () => {});
    it("Spec: subplebbit.posts.getPage({ cid }) loads a page with anonymized comments", () => {});
    it("Spec: comment.replies.getPage({ cid }) loads a page with anonymized replies", () => {});
    it("Spec: disabling pseudonymousAuthors stops anonymization for new comments without rewriting old ones", () => {});
    it("Spec: sub owner can resolve the pseudonymous author address back to the original author address", () => {});
});
