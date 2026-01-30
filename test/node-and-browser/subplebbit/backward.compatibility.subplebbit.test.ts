import { messages } from "../../../dist/node/errors.js";

import {
    getAvailablePlebbitConfigsToTestAgainst,
    isPlebbitFetchingUsingGateways,
    publishSubplebbitRecordWithExtraProp,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { describe, it } from "vitest";

import type { PlebbitError } from "../../../dist/node/plebbit-error.js";

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent(`plebbit.createSubplebbit - Backward Compatiblity - ${config.name}`, async () => {
        it(`Can create a subplebbit instance with subplebbit record with extra props`, async () => {
            const opts = { includeExtraPropInSignedPropertyNames: true, extraProps: { extraProp: "1234" } };
            const publishedSub = await publishSubplebbitRecordWithExtraProp(opts);

            const remotePlebbit = await config.plebbitInstancePromise();

            const sub = await remotePlebbit.createSubplebbit(publishedSub.subplebbitRecord);

            expect((sub.toJSONIpfs() as Record<string, unknown>).extraProp).to.equal(publishedSub.subplebbitRecord.extraProp);
            expect(sub.toJSONIpfs()).to.deep.equal(publishedSub.subplebbitRecord);
            expect(sub["extraProp"]).to.equal(publishedSub.subplebbitRecord.extraProp);

            const recreatedSubFromInstance = await remotePlebbit.createSubplebbit(sub);
            expect(recreatedSubFromInstance.toJSONIpfs()).to.deep.equal(publishedSub.subplebbitRecord);
            expect(JSON.parse(JSON.stringify(recreatedSubFromInstance)).extraProp).to.equal(opts.extraProps.extraProp);
            expect(recreatedSubFromInstance["extraProp"]).to.equal(publishedSub.subplebbitRecord.extraProp);

            const recreatedSubFromJson = await remotePlebbit.createSubplebbit(JSON.parse(JSON.stringify(sub)));
            expect(JSON.parse(JSON.stringify(recreatedSubFromJson)).extraProp).to.equal(publishedSub.subplebbitRecord.extraProp);
            expect(recreatedSubFromJson["extraProp"]).to.equal(publishedSub.subplebbitRecord.extraProp);

            await remotePlebbit.destroy();
        });
    });

    describe.concurrent(`subplebbit.update() and backward compatibility - ${config.name}`, async () => {
        it(`subplebbit.update() should have no problem with extra props, as long as they're in subplebbit.signature.signedPropertyNames`, async () => {
            const opts = { includeExtraPropInSignedPropertyNames: true, extraProps: { extraProp: "1234" } };
            const publishedSub = await publishSubplebbitRecordWithExtraProp(opts);

            const remotePlebbit = await config.plebbitInstancePromise();

            const sub = await remotePlebbit.createSubplebbit({ address: publishedSub.subplebbitRecord.address });

            await sub.update();

            await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: async () => typeof sub.updatedAt === "number" });

            expect((sub.toJSONIpfs() as Record<string, unknown>).extraProp).to.equal(opts.extraProps.extraProp);

            expect(sub.toJSONIpfs()).to.deep.equal(publishedSub.subplebbitRecord);

            expect(JSON.parse(JSON.stringify(sub)).extraProp).to.equal(opts.extraProps.extraProp);

            expect(sub["extraProp"]).to.equal(opts.extraProps.extraProp);

            await sub.stop();
            await remotePlebbit.destroy();
        });

        it(`subplebbit.update() emit an error if there are unknown props not included in signature.signedPropertyNames`, async () => {
            const opts = { includeExtraPropInSignedPropertyNames: false, extraProps: { extraProp: "1234" } };

            const publishedSub = await publishSubplebbitRecordWithExtraProp(opts);

            const remotePlebbit = await config.plebbitInstancePromise();

            const sub = await remotePlebbit.createSubplebbit({ address: publishedSub.subplebbitRecord.address });

            const errorPromise = new Promise<PlebbitError>((resolve) => sub.once("error", resolve as (err: Error) => void));

            await sub.update();

            const error = await errorPromise;

            if (isPlebbitFetchingUsingGateways(remotePlebbit)) {
                expect(error.code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
                const gatewayError = error.details.gatewayToError[remotePlebbit.ipfsGatewayUrls[0]] as PlebbitError;
                expect(gatewayError.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                expect(gatewayError.details.signatureValidity.valid).to.be.false;
                expect(gatewayError.details.signatureValidity.reason).to.equal(
                    messages.ERR_SUBPLEBBIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
                );
            } else {
                expect(error.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                expect(error.details.signatureValidity.valid).to.be.false;
                expect(error.details.signatureValidity.reason).to.equal(
                    messages.ERR_SUBPLEBBIT_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
                );
            }

            expect(sub.updatedAt).to.be.undefined; // should not accept update

            await sub.stop();
            await remotePlebbit.destroy();
        });
    });
});
