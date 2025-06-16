import { z } from "zod";
import { PlebbitParsedOptionsSchema, PlebbitUserOptionBaseSchema } from "../../schema.js";
import { ChallengeFileSchema } from "../../subplebbit/schema.js";
// Setting up WS
const WsServerClassOptions = z.object({
    port: z.number().int().positive().optional(),
    server: z.custom().optional()
});
export const CreatePlebbitWsServerOptionsSchema = z
    .object({
    plebbitOptions: z.custom().optional(), // no need to validate here, will be validated with await Plebbit()
    authKey: z.string().optional()
})
    .merge(WsServerClassOptions)
    .passthrough();
// rpc WS
export const SetNewSettingsPlebbitWsServerSchema = z.object({
    plebbitOptions: PlebbitUserOptionBaseSchema.passthrough()
});
export const PlebbitWsServerSettingsSerializedSchema = z.object({
    plebbitOptions: PlebbitParsedOptionsSchema.passthrough(),
    challenges: z.record(z.string(), ChallengeFileSchema.omit({ getChallenge: true }) // to avoid throwing because of recursive dependency
    )
});
//# sourceMappingURL=schema.js.map