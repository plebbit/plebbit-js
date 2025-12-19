import { describe, it } from "vitest";
import { describeSkipIfRpc, getAvailablePlebbitConfigsToTestAgainst } from "../../../../dist/node/test/test-util.js";

const remotePlebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

describeSkipIfRpc('subplebbit.features.anonymityMode="per-reply"', () => {
    describe.sequential("local anonymization", () => {
        it('Spec: sub re-signs every new comment with a fresh anonymized author address when anonymityMode="per-reply"', () => {});
        it("Spec: same signer uses different anonymized author addresses for consecutive replies in the same post", () => {});
        it("Spec: anonymized author addresses are never reused for the same signer across replies", () => {});
        it("Spec: anonymized publication strips author displayName/wallets/avatar/flair fields", () => {});
        it("Spec: anonymized publication omits author.previousCommentCid", () => {});
        it("Spec: comment edit signed by original author is accepted and re-signed with anonymized author key", () => {});
        it("Spec: comment edit is rejected when original author does not match stored anonymization mapping", () => {});
        it("Spec: anonymized comment.signature.publicKey differs from original author's signer publicKey", () => {});
        it("Spec: purging an anonymized comment removes its alias mapping", () => {});
        it("Spec: anonymized publication preserves original author fields in comment.original while public fields are stripped", () => {});
        it("Spec: per-reply alias stays stable across multiple edits to the same reply but is unique per newly created reply", () => {});
        it("Spec: same signer posting replies across different posts gets a fresh anonymized address for each reply (no cross-post reuse)", () => {});
        it("Spec: reply-to-reply (nested) anonymization creates a unique alias distinct from parent/post aliases and still strips author metadata", () => {});
        it("Spec: disabling pseudonymousAuthors stops anonymization for new replies without rewriting previously stored anonymized replies", () => {});
        it("Spec: purging one anonymized reply removes only that reply's alias mapping and leaves other replies (even from the same signer) intact", () => {});
        it("Spec: sub owner can resolve multiple anonymized addresses created by the same signer across several replies and map each back to the original signer", () => {});
        it("Spec: sub owner can resolve anonymized author addresses back to the original author address", () => {});
    });

    describe.concurrent("remote loading with anonymized comments", () => {
        describe("preloaded pages", () => {
            remotePlebbitConfigs.forEach((config) => {
                describe.concurrent(`${config.name} - preloaded`, () => {
                    it("Spec: loads preloaded pages with anonymized posts/replies without failing verification", () => {});
                    it("Spec: getComment on an anonymized reply returns stripped author fields and keeps the per-reply alias stable after comment.update()", () => {});
                });
            });
        });

        describe("paginated pages", () => {
            remotePlebbitConfigs.forEach((config) => {
                describe.sequential(`${config.name} - paginated`, () => {
                    it("Spec: subplebbit.posts.getPage({ cid }) loads a page with anonymized comments", () => {});
                    it("Spec: comment.replies.getPage({ cid }) loads a page with anonymized replies", () => {});
                    it("Spec: paginated replies from the same signer show distinct anonymized addresses per reply with valid signatures across pages", () => {});
                    it("Spec: replies-to-replies fetched via comment.replies.getPage remain anonymized and verifiable (distinct per reply)", () => {});
                });
            });
        });
    });
});
