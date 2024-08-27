import { z } from "zod";

import { PlebbitParsedOptionsSchema, PlebbitUserOptionsSchema } from "../../schema.js";
import type { Server as HTTPServer } from "http";
import type { Server as HTTPSServer } from "https";
import { ChallengeFileSchema } from "../../subplebbit/schema.js";

// Setting up WS

const WsServerClassOptions = z.object({
    port: z.number().int().positive().optional(),
    server: z.custom<HTTPServer | HTTPSServer>().optional()
});

export const CreatePlebbitWsServerOptionsSchema = z
    .object({
        plebbitOptions: PlebbitUserOptionsSchema.passthrough().optional(),
        authKey: z.string().optional()
    })
    .merge(WsServerClassOptions)
    .passthrough();

// rpc WS

export const SetNewSettingsPlebbitWsServerSchema = z.object({
    plebbitOptions: PlebbitUserOptionsSchema.passthrough()
});

export const PlebbitWsServerSettingsSerializedSchema = z.object({
    plebbitOptions: PlebbitParsedOptionsSchema.passthrough(),
    challenges: z.record(
        z.string(),
        ChallengeFileSchema.omit({ getChallenge: true }) // to avoid throwing because of recursive dependency
    )
});
