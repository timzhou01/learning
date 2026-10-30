function topKFrequent(nums: number[], k: number): number[] {
    const map = new Map()
    const heap = new TestMinHeap()
    for (let n of nums) {
        map.set(n, (map.get(n) ?? 0) + 1)
    }
    for (let val of map) {
        heap.push(val)
        if (heap.size() > k) {
            heap.pop()
        }
    }
    return heap.heap.map(val => val[0])
};

class TestMinHeap {
    heap: [number, number][] = []

    push(value: [number, number]) {
        this.heap.push(value)
        this.heapUp()
    }

    size() {
        return this.heap.length
    }

    peak() {
        return this.heap[0]
    }

    pop() {
        if (this.heap.length === 0) {
            return
        }
        const last = this.heap.pop()!
        if (this.heap.length) {
            this.heap[0] = last
            this.heapDown()
        }

    }

    private heapDown() {
        let parent = 0
        while (true) {
            let leftChild = this.getLeftIndex(parent)
            let rightChild = this.getRightIndex(parent)
            let index = parent
            if (leftChild <= this.heap.length - 1 && this.heap[leftChild][1] < this.heap[index][1]) {
                index = leftChild
            }
            if (rightChild <= this.heap.length - 1 && this.heap[rightChild][1] < this.heap[index][1]) {
                index = rightChild
            }

            if (index !== parent) {
                this.swap(parent, index)
                parent = index
            } else {
                break
            }
        }

    }

    private heapUp() {
        let child = this.heap.length - 1
        let parent = this.getParentIndex(child)
        while (parent >= 0 && this.heap[child][1] < this.heap[parent][1]) {
            this.swap(child, parent)
            child = parent
            parent = this.getParentIndex(child)
        }
    }

    private swap(index1: number, index2: number) {
        const val2 = this.heap[index2]
        const val1 = this.heap[index1]
        this.heap[index1] = val2
        this.heap[index2] = val1
    }

    private getParentIndex(index: number) {
        return Math.floor((index - 1) / 2)
    }

    private getLeftIndex(index: number) {
        return (index * 2) + 1
    }
    private getRightIndex(index: number) {
        return (index * 2) + 2
    }
}