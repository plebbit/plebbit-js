type ForageOptions = {
    size: number;
    name: string;
};
export declare const createInstance: (localForageLruOptions: ForageOptions) => {
    getItem: (key: string) => Promise<any>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
    key: (keyIndex: number) => Promise<never>;
    keys: () => Promise<string[]>;
    entries: () => Promise<any[]>;
    length: () => Promise<never>;
};
export {};
