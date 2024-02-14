declare const PlebbitJs: {
    Plebbit: {
        (plebbitOptions?: import("../../../../types.js").PlebbitOptions): Promise<import("../../../../plebbit.js").Plebbit>;
        setNativeFunctions: (newNativeFunctions: Partial<import("../../../../types.js").NativeFunctions>) => void;
        nativeFunctions: {
            node: import("../../../../types.js").NativeFunctions;
            browser: import("../../../../types.js").NativeFunctions;
        };
        getShortCid: typeof import("../../../../util.js").shortifyCid;
        getShortAddress: typeof import("../../../../util.js").shortifyAddress;
        challenges: Record<string, import("../../../../subplebbit/types.js").ChallengeFileFactory>;
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
