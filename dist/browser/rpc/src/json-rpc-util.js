export function sanitizeRpcNotificationResult(event, result) {
    if (event !== "error" || !result || typeof result !== "object")
        return result;
    const sanitizedResult = { ...result };
    if ("stack" in sanitizedResult)
        delete sanitizedResult.stack;
    if ("details" in sanitizedResult && sanitizedResult.details && typeof sanitizedResult.details === "object") {
        const details = { ...sanitizedResult.details };
        const nestedError = details.error;
        if (nestedError && typeof nestedError === "object") {
            details.error = { ...nestedError };
            if ("stack" in details.error)
                delete details.error.stack;
        }
        sanitizedResult.details = details;
    }
    return sanitizedResult;
}
//# sourceMappingURL=json-rpc-util.js.map