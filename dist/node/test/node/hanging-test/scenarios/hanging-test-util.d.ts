import type { Plebbit } from "../../../../plebbit/plebbit.js";
/**
 * Arguments supplied to each hanging-test scenario from the test harness.
 * `configCode` maps to one of the entries returned by
 * `getAvailablePlebbitConfigsToTestAgainst`.
 */
export interface HangingScenarioArgs {
    configCode: string;
}
/**
 * Resolved context after looking up the config and instantiating a Plebbit
 * instance. Scenarios should call `createScenarioContext` and make sure to
 * `await plebbit.destroy()` in a finally block once their work is done.
 */
export interface HangingScenarioContext {
    plebbit: Plebbit;
    config: {
        name: string;
        testConfigCode: string;
    };
}
export type HangingScenario = (args: HangingScenarioArgs) => Promise<void>;
export interface HangingScenarioDefinition {
    id: string;
    description: string;
    run: HangingScenario;
}
export declare function defineHangingScenario(definition: HangingScenarioDefinition): HangingScenarioDefinition;
export declare function resolveHangingScenarioModule(moduleNamespace: unknown, moduleId: string): HangingScenarioDefinition;
export declare function createScenarioContext(configCode: string): Promise<HangingScenarioContext>;
