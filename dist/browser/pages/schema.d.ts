import { z } from "zod";
import type { PageIpfsManuallyDefined } from "./types.js";
export declare const PageIpfsSchema: z.ZodType<PageIpfsManuallyDefined>;
export declare const PostSortNameSchema: z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>;
export declare const ReplySortNameSchema: z.ZodUnion<[z.ZodEnum<["topAll", "new", "old", "controversialAll"]>, z.ZodString]>;
export declare const PostsPagesIpfsSchema: z.ZodObject<{
    pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodType<PageIpfsManuallyDefined, z.ZodTypeDef, PageIpfsManuallyDefined>>;
    pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["hot", "new", "topHour", "topDay", "topWeek", "topMonth", "topYear", "topAll", "controversialHour", "controversialDay", "controversialWeek", "controversialMonth", "controversialYear", "controversialAll", "active"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids: Record<string, string>;
}, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids: Record<string, string>;
}>;
export declare const RepliesPagesIpfsSchema: z.ZodObject<{
    pages: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["topAll", "new", "old", "controversialAll"]>, z.ZodString]>, z.ZodType<PageIpfsManuallyDefined, z.ZodTypeDef, PageIpfsManuallyDefined>>;
    pageCids: z.ZodRecord<z.ZodUnion<[z.ZodEnum<["topAll", "new", "old", "controversialAll"]>, z.ZodString]>, z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids: Record<string, string>;
}, {
    pages: Record<string, PageIpfsManuallyDefined>;
    pageCids: Record<string, string>;
}>;
