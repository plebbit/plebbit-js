declare const PlebbitJs: {
    Plebbit: {
        (plebbitOptions?: import("../../../../dist/node/types").PlebbitOptions | undefined): Promise<import("../../../../dist/node/plebbit").Plebbit>;
        setNativeFunctions: (newNativeFunctions: Partial<import("../../../../dist/node/types").NativeFunctions>) => void;
        nativeFunctions: {
            node: import("../../../../dist/node/types").NativeFunctions;
            browser: import("../../../../dist/node/types").NativeFunctions;
        };
        getShortCid: typeof import("../../../../dist/node/util").shortifyCid;
        getShortAddress: typeof import("../../../../dist/node/util").shortifyAddress;
        challenges: Record<string, import("../../../../dist/node/subplebbit/types").ChallengeFileFactory>;
    };
};
/**
 * replace PlebbitJs with a different implementation, for
 * example to mock it during unit tests, to add mock content
 * for developing the front-end or to add a PlebbitJs with
 * desktop privileges in the Electron build.
 */
export declare function setPlebbitJs(_Plebbit: any): void;
export declare function restorePlebbitJs(): void;
export default PlebbitJs;
