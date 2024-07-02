import { z } from "zod";
export const SubscriptionIdSchema = z.number().positive().int();
