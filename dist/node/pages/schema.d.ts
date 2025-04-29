import { z } from "zod";
import type { PageIpfsManuallyDefined } from "./types.js";
export declare const PageIpfsSchema: z.ZodType<PageIpfsManuallyDefined>;
export declare const PostSortNameSchema: z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"]>, z.ZodString]>;
export declare const ReplySortNameSchema: z.ZodUnion<[z.ZodEnum<["best", "new", "old", "newFlat", "oldFlat"]>, z.ZodString]>;
export declare const PostsPagesIpfsSchema: z.ZodObject<{
    pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"]>, z.ZodString]>, z.ZodType<PageIpfsManuallyDefined, z.ZodTypeDef, PageIpfsManuallyDefined>>;
    pageCids: z.ZodOptional<z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>>;
}, "strip", z.ZodTypeAny, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids?: Record<string, string> | undefined;
}, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids?: Record<string, string> | undefined;
}>;
export declare const RepliesPagesIpfsSchema: z.ZodObject<{
    pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["best", "new", "old", "newFlat", "oldFlat"]>, z.ZodString]>, z.ZodType<PageIpfsManuallyDefined, z.ZodTypeDef, PageIpfsManuallyDefined>>;
    pageCids: z.ZodOptional<z.ZodRecord<z.ZodUnion<[z.ZodEnum<["best", "new", "old", "newFlat", "oldFlat"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>>;
}, "strip", z.ZodTypeAny, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids?: Record<string, string> | undefined;
}, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids?: Record<string, string> | undefined;
}>;
