import { SubplebbitEditOptionsSchema } from "../../subplebbit/schema.js";
import { CreatePublicationUserOptionsSchema, JsonSignatureSchema, PublicationBaseBeforeSigning } from "../../schema/schema.js";
import * as remeda from "remeda";
import { keysToOmitFromSignedPropertyNames } from "../../signer/constants.js";
export const CreateSubplebbitEditPublicationOptionsSchema = CreatePublicationUserOptionsSchema.extend({
    subplebbitEdit: SubplebbitEditOptionsSchema.strict()
}).strict();
export const SubplebbitEditPublicationSignedPropertyNames = remeda.keys.strict(remeda.omit(CreateSubplebbitEditPublicationOptionsSchema.shape, keysToOmitFromSignedPropertyNames));
const subplebbitEditPublicationPickOptions = (remeda.mapToObj([...SubplebbitEditPublicationSignedPropertyNames, "signature"], (x) => [x, true]));
// Will be used by the sub when parsing request.subplebbitEdit
export const SubplebbitEditPubsubMessagePublicationSchema = CreateSubplebbitEditPublicationOptionsSchema.merge(PublicationBaseBeforeSigning)
    .extend({
    signature: JsonSignatureSchema,
    author: PublicationBaseBeforeSigning.shape.author.loose()
})
    .pick(subplebbitEditPublicationPickOptions)
    .strict();
export const SubplebbitEditPublicationChallengeRequestToEncryptSchema = CreateSubplebbitEditPublicationOptionsSchema.shape.challengeRequest
    .unwrap()
    .extend({
    subplebbitEdit: SubplebbitEditPubsubMessagePublicationSchema.loose()
});
export const SubplebbitEditPublicationPubsubReservedFields = remeda.difference([
    ...remeda.keys.strict(SubplebbitEditPublicationChallengeRequestToEncryptSchema.shape),
    "shortSubplebbitAddress",
    "state",
    "publishingState",
    "signer",
    "clients"
], remeda.keys.strict(SubplebbitEditPubsubMessagePublicationSchema.shape));
//# sourceMappingURL=schema.js.map