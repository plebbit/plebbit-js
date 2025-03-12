export function measurePerformance(thresholdMs = 300) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const isAsync = originalMethod.constructor.name === "AsyncFunction";
        descriptor.value = function (...args) {
            const start = performance.now();
            try {
                const result = originalMethod.apply(this, args);
                if (isAsync || result instanceof Promise) {
                    return result.then((resolvedResult) => {
                        const end = performance.now();
                        const executionTime = end - start;
                        if (executionTime > thresholdMs) {
                            console.warn(`⚠️ Slow execution: ${propertyKey} took ${executionTime.toFixed(2)}ms to execute`);
                        }
                        return resolvedResult;
                    });
                }
                else {
                    const end = performance.now();
                    const executionTime = end - start;
                    if (executionTime > thresholdMs) {
                        console.warn(`⚠️ Slow execution: ${propertyKey} took ${executionTime.toFixed(2)}ms to execute`);
                    }
                    return result;
                }
            }
            catch (error) {
                throw error;
            }
        };
        return descriptor;
    };
}
//# sourceMappingURL=decorator-util.js.map