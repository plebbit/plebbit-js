declare const PlebbitJs: {
    Plebbit: {
        (plebbitOptions?: import("../../../../types").PlebbitOptions): Promise<import("../../../../plebbit").Plebbit>;
        setNativeFunctions: (newNativeFunctions: Partial<import("../../../../types").NativeFunctions>) => void;
        nativeFunctions: {
            node: import("../../../../types").NativeFunctions;
            browser: import("../../../../types").NativeFunctions;
        };
        getShortCid: typeof import("../../../../util").shortifyCid;
        getShortAddress: typeof import("../../../../util").shortifyAddress;
        challenges: Record<string, import("../../../../subplebbit/types").ChallengeFileFactory>;
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
