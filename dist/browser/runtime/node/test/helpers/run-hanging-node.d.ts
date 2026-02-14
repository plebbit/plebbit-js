interface RunHangingScenarioInChildProcessOptions {
    configCode: string;
    timeoutMs: number;
    scenarioModuleBaseName: string;
}
export declare function runHangingScenarioInChildProcess({ configCode, timeoutMs, scenarioModuleBaseName }: RunHangingScenarioInChildProcessOptions): Promise<void>;
export {};
