class LRUCache {
    map = new Map()
    capacity: number
    constructor(capacity: number) {
        this.capacity = capacity
    }

    get(key: number): number {
        const val = this.map.get(key)
        if (val == null) return -1
        this.map.delete(key)
        this.map.set(key, val)
        return val
    }

    put(key: number, value: number): void {
        if (this.map.get(key)) {
            this.map.delete(key)
        }
        if (this.map.size === this.capacity) {
            const head = this.map.keys().next().value
            this.map.delete(head)
        }
        this.map.set(key, value)
    }
}

const cache = new LRUCache(2)

cache.put(1, 1)
cache.put(2, 2)

const val1 = cache.get(1)    // 1

cache.put(3, 3) // 淘汰 key = 2

const val2 = cache.get(2)    // -1

cache.put(4, 4) // 淘汰 key = 1

const val3 = cache.get(1)    // -1
const val4 = cache.get(3)    // 3
const val5 = cache.get(4)    // 4
console.log(1)