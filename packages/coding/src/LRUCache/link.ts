class Node {
    key: number
    val: number
    prev: Node | null = null
    next: Node | null = null
    constructor(key: number, val: number) {
        this.key = key
        this.val = val
    }
}

class LRUCache {
    capacity: number
    head: Node
    tail: Node
    map: Map<number, Node>
    constructor(capacity: number) {
        this.capacity = capacity
        this.head = new Node(0, 0)
        this.tail = new Node(0, 0)
        this.head.next = this.tail
        this.tail.prev = this.head
        this.map = new Map()
    }

    get(key: number): number {
        const node = this.map.get(key)
        if (!node) {
            return -1
        }
        this.delete(node)
        this.appendToHead(node)
        const val = node.val
        return val
    }

    put(key: number, value: number): void {
        const node = this.map.get(key)
        if (node) {
            this.delete(node)
            this.appendToHead(node)
            return
        }
        const newNode = new Node(key, value)
        if ((this.map.size) === this.capacity && this.tail.prev) {
            this.map.delete(this.tail.prev.key)
            this.delete(this.tail.prev)

        }
        this.map.set(key, newNode)
        this.appendToHead(newNode)
    }

    private delete(node: Node) {
        node.prev!.next = node.next
        node.next!.prev = node.prev
    }

    private appendToHead(node: Node) {
        node.next = this.head.next
        node.prev = this.head

        this.head.next!.prev = node
        this.head.next = node

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

export { }