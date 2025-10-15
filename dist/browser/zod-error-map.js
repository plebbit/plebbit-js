import { z } from "zod";
const defaultLocaleError = z.locales.en().localeError;
const friendlyErrorMap = (rawIssue) => {
    const pathSegments = rawIssue.path ?? [];
    const path = pathSegments.length ? pathSegments.map((segment) => segment.toString()).join(".") : "";
    const baseMessage = rawIssue.message ?? defaultLocaleError(rawIssue) ?? "Invalid input";
    return path ? { message: `${path}: ${baseMessage}` } : { message: baseMessage };
};
z.setErrorMap(friendlyErrorMap);
//# sourceMappingURL=zod-error-map.js.map