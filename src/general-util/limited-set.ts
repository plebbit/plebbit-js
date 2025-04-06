export class LimitedSet<T> {
    private maxSize: number;
    private set: Set<T>;
    private insertionOrder: T[]; // To track insertion order

    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.set = new Set<T>();
        this.insertionOrder = []; // To track insertion order
    }

    add(value: T): LimitedSet<T> {
        // If the value already exists, we need to refresh its position
        if (this.set.has(value)) {
            // Remove from insertion order to refresh position
            const index = this.insertionOrder.indexOf(value);
            if (index !== -1) {
                this.insertionOrder.splice(index, 1);
            }
        } else {
            // Check if we need to remove the oldest element
            if (this.set.size >= this.maxSize) {
                const oldest = this.insertionOrder.shift(); // Get and remove oldest
                if (oldest !== undefined) {
                    this.set.delete(oldest);
                }
            }
        }

        // Add the new value
        this.set.add(value);
        this.insertionOrder.push(value);

        return this;
    }

    has(value: T): boolean {
        return this.set.has(value);
    }

    delete(value: T): boolean {
        const result = this.set.delete(value);
        if (result) {
            const index = this.insertionOrder.indexOf(value);
            if (index !== -1) {
                this.insertionOrder.splice(index, 1);
            }
        }
        return result;
    }

    clear(): void {
        this.set.clear();
        this.insertionOrder = [];
    }

    get size(): number {
        return this.set.size;
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const item of this.set) {
            yield item;
        }
    }

    // Additional methods to make it more compatible with Set interface
    entries(): IterableIterator<[T, T]> {
        return this.set.entries();
    }

    values(): IterableIterator<T> {
        return this.set.values();
    }

    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
        this.set.forEach(callbackfn, thisArg);
    }
}
