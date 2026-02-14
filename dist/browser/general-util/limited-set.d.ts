export declare class LimitedSet<T> {
    private maxSize;
    private set;
    private insertionOrder;
    constructor(maxSize: number);
    add(value: T): LimitedSet<T>;
    has(value: T): boolean;
    delete(value: T): boolean;
    clear(): void;
    get size(): number;
    [Symbol.iterator](): IterableIterator<T>;
    entries(): IterableIterator<[T, T]>;
    values(): IterableIterator<T>;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
}
