## verifyAuthor

This function will take a JSON of either `CommentEdit`, `Vote` or `Comment`. All of them will have an `author` field. The function will split into two parts:

-   Resolving and verifying author domain
    -   The following condition will need to be true
        -   `author.address` is a domain
        -   `plebbit.resolverAuthorAddress` is `true`
        -   Function parameter `returnDerivedAuthorAddressIfInvalid` is `true`
    -   `verifyAuthor` will then resolve the author domain using `ethers` (assumed to be an ENS domain), and compare the resolved address with the address derived from `signature.publicKey`. If they're not equal then `{valid: true, newAddress: derivedAddress}` is returned, where `newAddress` will be used to override `author.address`
-   Validating regular CID address (Qm...)
    -   `author.address` has to be a non-domain
    -   Create a `PeerId` instance for `author.address` and `signature.publicKey`
    -   If they're not equal, then return `{valid: false, reason: "comment.author.address doesn't match comment.signature.publicKey"}`
-   Otherwise, return `{valid: true}`

## verifyPublicationSignature

This function will take a JSON object that has signature field. Could be `CommentEditType | VoteType | CommentType | PostType | CommentUpdate | SubplebbitType | ChallengeRequestMessageType | ChallengeMessageType | ChallengeAnswerMessageType | ChallengeVerificationMessageType`

-   Create an object that has the same properties of the object that was used to create the signature, with the same field order too.
-   call `cborg.encode` on the object
-   Create signature from the encoded object, and compare it with the signature provided by the arguments
-   If they're the same, return `true`
-   Otherwise, return `false`

## verifyPublicationWithAuthor

This function will take a JSON object that has signature field. Could be `CommentEditType | VoteType | CommentType | PostType | CommentUpdate | SubplebbitType | ChallengeRequestMessageType | ChallengeMessageType | ChallengeAnswerMessageType | ChallengeVerificationMessageType`

-   Call `verifyPublicationSignature`, if result is `false` return `{valid: false, reason: "Signature of publication is invalid"}`
-   Otherwise, proceed
-   If `plebbit.resolveAuthorAddresses` is `true`, and JSON argument has an `author` field then:
    -   Call `verifyAuthor`
    -   If `author` is invalid, then return `{valid: false, reason: comment.author.address doesn't match comment.signature.publicKey"}`
    -   Otherwise if `author` is valid, and returned object has `newAddress` defined, return `{ valid: true, newAddress: authorSignatureValidity.newAddress }`
-   Otherwise, return `{valid: true}`

## verifyVote

-   This function will take `Vote` instance or `VoteType` (JSON object that resembles Vote) as a parameter.
-   Create a new object without keys that has undefined properties by calling `removeKeysWithUndefinedValues`
-   Call `verifyPublication`
-   If it return invalid, then return the same object `verifyPublication` returned
-   Otherwise return `{valid: true}`

## verifyCommentEdit

-   Same as [verifyVote](#verifyvote), except `verifyCommentEdit` will take a `CommentEdit` or `CommentEditType` (JSON object that resembles `CommentEdit`) as a parameter.

## verifyComment

-   The function will take a `CommentType` and all its descendants including `Post`, `Comment` and `PostType`. It will also take `overrideAuthorAddressIfInvalid` boolean argument that will override the comment parameter author address if it was invalid.

-   Check if the comment JSON has an `authorEdit` field. If it has one, that means the author has published a `CommentEdit`. `verifyComment` will then verify `comment.authorEdit` with `verifyPublicationWithAuthor`
    -   If result is invalid, return the result of `verifyPublicationWithAuthor`
    -   Else if `overrideAuthorAddressIfInvalid` and result of `verifyPublicationWithAuthor` includes `newAddress`, then override `comment.author.address` with `newAddress` from `verifyPublicationWithAuthor`
-   Recreate the original comment object that was signed by the author. Object will be made of:
    -   The Comment skeleton JSON, `comment.toJSONSkeleton()`
    -   Fields that can be changed by a comment update are handled in a special manner.
        -   `comment.content` will be set to `comment.original.content` if author has published a `CommentEdit` with a new `content`, otherwise it's set to `comment.content`
        -   (incorrect) `comment.author` will be set `comment.original.author` if it's defined, otherwise it's set to `comment.author`
        -   (TODO) `comment.flair`
-   Verify the original Comment object with `verifyPublicationWithAuthor`
-   If result is invalid, return `verifyPublicationWithAuthor` result
-   Else if `overrideAuthorAddressIfInvalid` is `true`, and `verifyPublicationWithAuthor` returns `{newAddress}` then override author address with `newAddress`
-   Else, return `true`

## verifySubplebbit

-   Create a new subplebbit object without keys that has undefined properties by calling `removeKeysWithUndefinedValues`
-   Validate signature of subplebbit object with `verifyPublicationSignature`
-   Return result if invalid
-   If subplebbit address is a domain
    -   Resolve it to a CID address
-   Create a PeerId instance from CID address
-   Compare address PeerId instance with PeerId instance created from public key in signature
-   If they're not equal, return invalid
-   Else, return valid

## verifyPage

-   Takes `PageType` and `Page` for parameter
-   Takes subplebbit address as a parameter.
-   (1) Iterate over the comments within page
    -   If the subplebbit address of comment is not the subplebbit address provided by function argument, `verifyPage` will return invalid
    -   (Skipped by comments with no parent) If `comment.parentCid` does not equal `parent.cid`, return invalid
    -   Call `verifyComment` on comment
        -   If invalid, return invalid
    -   If comment has pages of replies, then iterate through them (go back to (1))
-   Return valid

## verifyCommentUpdate

-   Create a new CommentUpdate object without keys that has undefined properties by calling `removeKeysWithUndefinedValues`
-   Call `verifyPublicationSignature` on CommentUpdate object
-   If invalid, return invalid
-   Else, return valid

## verifyChallengeRequest

Same as [verifyCommentUpdate](#verifyCommentUpdate), except with `ChallengeRequest` For parameter

## verifyChallengeMessage

Same as [verifyCommentUpdate](#verifyCommentUpdate), except with `ChallengeMessage` For parameter

## verifyChallengeAnswer

Same as [verifyCommentUpdate](#verifyCommentUpdate), except with `ChallengeAnswer` For parameter

## verifyChallengeVerification

Same as [verifyCommentUpdate](#verifyCommentUpdate), except with `ChallengeVerification` For parameter
