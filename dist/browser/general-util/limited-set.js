export class LimitedSet {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.set = new Set();
        this.insertionOrder = []; // To track insertion order
    }
    add(value) {
        // If the value already exists, we need to refresh its position
        if (this.set.has(value)) {
            // Remove from insertion order to refresh position
            const index = this.insertionOrder.indexOf(value);
            if (index !== -1) {
                this.insertionOrder.splice(index, 1);
            }
        }
        else {
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
    has(value) {
        return this.set.has(value);
    }
    delete(value) {
        const result = this.set.delete(value);
        if (result) {
            const index = this.insertionOrder.indexOf(value);
            if (index !== -1) {
                this.insertionOrder.splice(index, 1);
            }
        }
        return result;
    }
    clear() {
        this.set.clear();
        this.insertionOrder = [];
    }
    get size() {
        return this.set.size;
    }
    *[Symbol.iterator]() {
        for (const item of this.set) {
            yield item;
        }
    }
    // Additional methods to make it more compatible with Set interface
    entries() {
        return this.set.entries();
    }
    values() {
        return this.set.values();
    }
    forEach(callbackfn, thisArg) {
        this.set.forEach(callbackfn, thisArg);
    }
}
//# sourceMappingURL=limited-set.js.map