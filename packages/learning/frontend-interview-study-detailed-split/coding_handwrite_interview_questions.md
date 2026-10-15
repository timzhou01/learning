# Coding & Handwrite

> 目标：覆盖前端 / 全栈面试最主流手写题和基础算法题，优先稳定拿分。  
> 建议学习方式：先只看「完整面试题」自己实现，再展开答案核对。

---

## 4. Promise.all

### 完整面试题

请手写实现一个 `myPromiseAll`，行为类似原生 `Promise.all`。

要求：

1. 接收一个数组。
2. 数组元素可以是 Promise，也可以是普通值。
3. 所有任务成功后 resolve。
4. 最终结果必须保持输入顺序，而不是完成顺序。
5. 任意一个 Promise reject 时，整体立即 reject。
6. 空数组返回 `Promise.resolve([])`。

示例：

```ts
myPromiseAll([
  Promise.resolve(1),
  2,
  new Promise(resolve => {
    setTimeout(() => resolve(3), 100)
  })
]).then(console.log)
```

输出：

```ts
[1, 2, 3]
```

即使第三个 Promise 比第二个晚完成，结果顺序仍然与输入顺序一致。

### 参考答案与原理

```ts
function myPromiseAll(values: any[]) {
  return new Promise((resolve, reject) => {
    const result: any[] = []
    let count = 0

    if (values.length === 0) {
      resolve([])
      return
    }

    values.forEach((value, index) => {
      Promise.resolve(value)
        .then(data => {
          result[index] = data
          count++

          if (count === values.length) {
            resolve(result)
          }
        })
        .catch(reject)
    })
  })
}
```

关键点有三个：

```text
Promise.resolve(value)
result[index] = data
count === values.length
```

使用 `index` 保存结果，保证返回顺序。

### 30 秒面试回答

Promise.all 的核心是聚合多个异步任务。

普通值先使用 `Promise.resolve` 包装；每个结果按照输入 index 保存；全部完成之后 resolve；任何一个 reject 都直接 reject。

### 常见追问

- Promise reject 后，其他 Promise 会取消吗？
- 空数组返回什么？
- 为什么不能直接 `push` result？
- Promise.allSettled 有什么区别？

### 掌握要求

★★★★★

---

## 5. Promise.race / Timeout

### 完整面试题

手写一个 `myPromiseRace`，行为类似原生 `Promise.race`。

要求：

1. 接收一个数组。
2. 元素可以是 Promise 或普通值。
3. 第一个进入 settled 状态的任务决定最终结果。
4. fulfilled 则整体 fulfilled。
5. rejected 则整体 rejected。

例如：

```ts
myPromiseRace([
  new Promise(resolve => {
    setTimeout(() => resolve('slow'), 1000)
  }),
  new Promise(resolve => {
    setTimeout(() => resolve('fast'), 100)
  })
]).then(console.log)
```

输出：

```text
fast
```

然后说明如何利用 `Promise.race` 实现：

```ts
timeout(promise, ms)
```

如果指定 Promise 在 `ms` 内没有完成，则 reject 超时错误。

### 参考答案与原理

```ts
function myPromiseRace(values: any[]) {
  return new Promise((resolve, reject) => {
    values.forEach(value => {
      Promise.resolve(value).then(resolve, reject)
    })
  })
}
```

Timeout：

```ts
function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout'))
    }, ms)
  })

  return Promise.race([
    promise,
    timeoutPromise
  ])
}
```

### 30 秒面试回答

Promise.race 看的是第一个 settled 的 Promise。

注意不是第一个成功，而是第一个 fulfilled 或 rejected。

### 常见追问

- `Promise.race` 和 `Promise.any` 有什么区别？
- Race 结束后其他 Promise 会取消吗？
- 如何真正取消 fetch 请求？

### 掌握要求

★★★★☆

---

## 6. Promisify

### 完整面试题

有一个 Node.js 风格的 error-first callback API：

```ts
function readData(
  path: string,
  callback: (err: Error | null, data?: string) => void
) {
  // ...
}
```

希望把它转换成 Promise 风格：

```ts
const readDataAsync = promisify(readData)

readDataAsync('a.txt')
  .then(data => {
    console.log(data)
  })
  .catch(err => {
    console.error(err)
  })
```

请实现：

```ts
function promisify(fn) {}
```

要求：

1. 原函数参数能够正常传递。
2. callback 第一个参数 `err` 有值时 reject。
3. 成功时 resolve result。
4. 尽量保留原函数调用时的 `this`。

### 参考答案与原理

```ts
function promisify(fn: Function) {
  return function (this: any, ...args: any[]) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err: Error | null, result: any) => {
        if (err) {
          reject(err)
          return
        }

        resolve(result)
      })
    })
  }
}
```

本质就是把：

```text
callback control flow
```

转换成：

```text
Promise state
```

### 30 秒面试回答

Node callback 通常是 error-first callback。

如果 callback 的 `err` 有值就 reject，否则把 result resolve。

### 常见追问

- 如果 callback 返回多个值怎么办？
- 为什么需要保留 `this`？
- Node.js 的 `util.promisify` 是什么？

### 掌握要求

★★★☆☆

---

## 7. myNew / instanceof

### 完整面试题一：手写 new

实现：

```ts
function myNew(Ctor, ...args) {}
```

使其基本模拟 JavaScript `new` 操作符。

例如：

```ts
function Person(this: any, name: string) {
  this.name = name
}

Person.prototype.sayHi = function () {
  return `Hi ${this.name}`
}

const p = myNew(Person, 'Tom')

console.log(p.name) // Tom
console.log(p.sayHi()) // Hi Tom
```

需要考虑：

如果构造函数自己显式返回一个对象：

```ts
function Person() {
  this.name = 'Tom'

  return {
    name: 'Jerry'
  }
}
```

`new` 最终应该返回哪个对象？

### 参考答案与原理

```ts
function myNew(Ctor: Function, ...args: any[]) {
  const obj = Object.create(Ctor.prototype)

  const result = Ctor.apply(obj, args)

  if (
    result !== null &&
    (typeof result === 'object' || typeof result === 'function')
  ) {
    return result
  }

  return obj
}
```

`new` 的核心过程：

```text
1. 创建对象
2. 对象 prototype 指向 Ctor.prototype
3. 使用新对象作为 this 调用构造函数
4. 处理构造函数显式返回值
```

### 完整面试题二：手写 instanceof

不使用原生 `instanceof`，实现：

```ts
function myInstanceof(obj, Ctor) {}
```

例如：

```ts
const p = new Person('Tom')

myInstanceof(p, Person) // true
myInstanceof(p, Array)  // false
```

### 参考答案与原理

```ts
function myInstanceof(obj: any, Ctor: Function) {
  if (obj === null || typeof obj !== 'object') {
    return false
  }

  let proto = Object.getPrototypeOf(obj)

  while (proto) {
    if (proto === Ctor.prototype) {
      return true
    }

    proto = Object.getPrototypeOf(proto)
  }

  return false
}
```

### 30 秒面试回答

`new` 和 `instanceof` 本质都和 prototype chain 有关。

`new` 是创建对象并连接原型；`instanceof` 是沿着对象原型链查找 `Ctor.prototype`。

### 常见追问

- 构造函数返回 primitive 怎么办？
- 构造函数返回 object 怎么办？
- 箭头函数为什么不能 `new`？
- `Object.create` 做了什么？

### 掌握要求

★★★★★

---

## 8. Scheduler 并发限流

### 完整面试题

实现一个异步任务调度器 `Scheduler`。

构造函数接收最大并发数：

```ts
const scheduler = new Scheduler(2)
```

任务形式：

```ts
() => Promise<T>
```

调用：

```ts
scheduler.add(task1)
scheduler.add(task2)
scheduler.add(task3)
scheduler.add(task4)
```

要求：

1. 同一时刻最多只能有 `limit` 个 Promise 正在运行。
2. 超过并发限制的任务需要进入等待队列。
3. 某个任务完成后，自动开始执行下一个等待任务。
4. `add()` 需要返回 Promise。
5. 调用者能够拿到对应任务最终 resolve 的结果。
6. 某个 task reject 时不能阻塞后面的任务。

例如最大并发为 `2`：

```text
task1 start
task2 start

task1 end
task3 start

task2 end
task4 start
```

任意时刻不能同时出现三个正在执行的任务。

### 参考答案与原理

```ts
class Scheduler {
  private queue: Array<() => void> = []
  private active = 0

  constructor(private readonly limit: number) {}

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = async () => {
        this.active++

        try {
          resolve(await task())
        } catch (e) {
          reject(e)
        } finally {
          this.active--
          this.runNext()
        }
      }

      this.queue.push(run)
      this.runNext()
    })
  }

  private runNext() {
    while (
      this.active < this.limit &&
      this.queue.length
    ) {
      this.queue.shift()?.()
    }
  }
}
```

核心状态：

```ts
queue
active
limit
```

任务真正开始运行时：

```ts
this.active++
```

任务结束时：

```ts
this.active--
this.runNext()
```

### 30 秒面试回答

Scheduler 使用 queue 保存等待任务，使用 active 保存当前运行数量。

只要：

```text
active < limit
```

就从队列启动新任务。

任务结束后 active 减一，并继续调度。

### 常见追问

- `runNext` 用 `if` 可以吗？
- 为什么 `active++` 应该在任务真正开始时做？
- 如何支持 priority？
- 如何取消还没执行的任务？

### 掌握要求

★★★★★

---

## 9. LRU Cache

### 完整面试题

设计并实现一个 LRU Cache。

实现：

```ts
class LRUCache {
  constructor(capacity: number)

  get(key: number): number

  put(key: number, value: number): void
}
```

LRU 表示：

```text
Least Recently Used
```

即容量不足时，淘汰最久没有被访问的数据。

要求：

1. `get` 平均时间复杂度 `O(1)`。
2. `put` 平均时间复杂度 `O(1)`。
3. `get` 一个存在的 key 后，该 key 变成最近使用。
4. `put` 一个已经存在的 key 时，需要更新 value，并变成最近使用。
5. 容量超过 `capacity` 时，删除最久没有使用的数据。
6. key 不存在时 `get` 返回 `-1`。

示例：

```ts
const cache = new LRUCache(2)

cache.put(1, 1)
cache.put(2, 2)

cache.get(1)       // 1

cache.put(3, 3)    // 淘汰 key 2

cache.get(2)       // -1

cache.put(4, 4)    // 淘汰 key 1

cache.get(1)       // -1
cache.get(3)       // 3
cache.get(4)       // 4
```

### 参考答案与原理

经典实现：

```text
HashMap + Doubly Linked List
```

Map：

```text
key → Node
```

负责：

```text
O(1) 查找
```

双向链表负责：

```text
O(1) 删除节点
O(1) 移动节点
```

通常：

```text
head → 最近使用

tail → 最久没有使用
```

前端面试如果允许利用 JS `Map` 的插入顺序，可以写简化版：

```ts
class LRUCache {
  private cache = new Map<number, number>()

  constructor(private capacity: number) {}

  get(key: number): number {
    if (!this.cache.has(key)) {
      return -1
    }

    const value = this.cache.get(key)!

    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    this.cache.set(key, value)

    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value

      this.cache.delete(oldestKey)
    }
  }
}
```

### 30 秒面试回答

标准 LRU 使用 HashMap + 双向链表。

Map 用来 O(1) 查找节点，双向链表负责 O(1) 调整访问顺序。

JS 面试中也可以利用 Map 的插入顺序实现简化版本。

### 常见追问

- 为什么需要双向链表？
- 单向链表为什么不好？
- 为什么 Map + 双链表可以 O(1)？
- JS Map 为什么可以简化实现？

### 掌握要求

★★★★★

---

# 高频 LeetCode

---

## 10. Two Sum — LeetCode 1

### 完整面试题

给定一个整数数组：

```ts
nums: number[]
```

和一个整数：

```ts
target: number
```

请返回数组中两个数字的下标，使它们的和等于 `target`。

假设：

1. 每个输入只有一个有效答案。
2. 不能重复使用同一个元素。
3. 返回两个元素的下标即可，顺序不限。

示例：

```ts
nums = [2, 7, 11, 15]
target = 9
```

输出：

```ts
[0, 1]
```

因为：

```text
nums[0] + nums[1]
= 2 + 7
= 9
```

要求尽量实现：

```text
时间复杂度 O(n)
```

### 参考答案与原理

```ts
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>()

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]

    if (map.has(need)) {
      return [map.get(need)!, i]
    }

    map.set(nums[i], i)
  }

  return []
}
```

遍历当前值：

```ts
nums[i]
```

需要寻找：

```ts
target - nums[i]
```

Map 保存：

```text
value → index
```

### 30 秒面试回答

使用 HashMap 保存已经访问过的数字和 index。

每次查找 `target - current` 是否已经存在，所以时间复杂度 O(n)，空间复杂度 O(n)。

### 常见追问

- 如果数组已经排序怎么办？
- 为什么不能先 set 再判断？
- 有重复数字怎么办？

### 掌握要求

★★★★★

---

## 11. Valid Anagram — LeetCode 242

### 完整面试题

给定两个字符串：

```ts
s
t
```

判断 `t` 是否是 `s` 的字母异位词。

字母异位词表示：

两个字符串包含完全相同的字符，并且每个字符出现次数相同，只是排列顺序可能不同。

示例：

```text
s = "anagram"
t = "nagaram"

true
```

示例：

```text
s = "rat"
t = "car"

false
```

假设字符串只包含：

```text
a-z
```

请尽量使用 O(n) 时间完成。

### 参考答案与原理

```ts
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) {
    return false
  }

  const count = new Array(26).fill(0)

  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++
    count[t.charCodeAt(i) - 97]--
  }

  return count.every(n => n === 0)
}
```

本质：

```text
统计字符频率
```

### 30 秒面试回答

两个字符串如果是 Anagram，那么每个字符出现次数必须完全一致。

小写英文字符只有 26 个，所以可以使用长度 26 的数组统计频率。

### 常见追问

- Unicode 怎么处理？
- 可以排序后比较吗？
- 排序方案复杂度是多少？

### 掌握要求

★★★★★

---

## 12. Valid Palindrome — LeetCode 125

### 完整面试题

给定一个字符串 `s`。

判断它在：

1. 忽略大小写；
2. 忽略所有非字母数字字符；

之后是否为回文字符串。

示例：

```text
"A man, a plan, a canal: Panama"
```

返回：

```text
true
```

因为处理后为：

```text
amanaplanacanalpanama
```

示例：

```text
"race a car"
```

返回：

```text
false
```

要求：

尽量不要创建完整的新字符串，可以使用双指针完成。

### 参考答案与原理

```ts
function isPalindrome(s: string): boolean {
  let left = 0
  let right = s.length - 1

  const isValid = (c: string) => {
    return /[a-zA-Z0-9]/.test(c)
  }

  while (left < right) {
    while (left < right && !isValid(s[left])) {
      left++
    }

    while (left < right && !isValid(s[right])) {
      right--
    }

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false
    }

    left++
    right--
  }

  return true
}
```

### 30 秒面试回答

使用左右双指针。

遇到非法字符就跳过；比较合法字符时统一转成小写。

左右指针都只移动一次，所以整体 O(n)。

### 常见追问

- Regex 预处理怎么写？
- Regex 方案和双指针方案有什么区别？
- Extra space 分别是多少？

### 掌握要求

★★★★★

---

## 13. Merge Two Sorted Lists — LeetCode 21

### 完整面试题

给定两个已经按照升序排列的单链表：

```text
list1
list2
```

请把它们合并成一个新的升序链表，并返回合并后的头节点。

例如：

```text
list1 = 1 → 2 → 4
list2 = 1 → 3 → 4
```

返回：

```text
1 → 1 → 2 → 3 → 4 → 4
```

节点定义：

```ts
class ListNode {
  val: number
  next: ListNode | null

  constructor(val = 0, next: ListNode | null = null) {
    this.val = val
    this.next = next
  }
}
```

### 参考答案与原理

```ts
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  const dummy = new ListNode()
  let current = dummy

  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1
      list1 = list1.next
    } else {
      current.next = list2
      list2 = list2.next
    }

    current = current.next
  }

  current.next = list1 ?? list2

  return dummy.next
}
```

### 30 秒面试回答

使用两个指针遍历两个有序链表，每次选择更小的节点接到结果后面。

Dummy node 可以避免处理 head 的特殊情况。

### 常见追问

- 为什么用 dummy node？
- 递归怎么写？
- K 个升序链表怎么合并？

### 掌握要求

★★★★★

---

## 14. Maximum Subarray — LeetCode 53

### 完整面试题

给定一个整数数组：

```ts
nums: number[]
```

找到一个具有最大和的连续子数组，并返回这个最大和。

例如：

```text
nums = [-2,1,-3,4,-1,2,1,-5,4]
```

最大连续子数组为：

```text
[4,-1,2,1]
```

所以返回：

```text
6
```

要求：

```text
时间复杂度 O(n)
```

### 参考答案与原理

Kadane Algorithm：

```ts
function maxSubArray(nums: number[]): number {
  let current = nums[0]
  let result = nums[0]

  for (let i = 1; i < nums.length; i++) {
    current = Math.max(
      nums[i],
      current + nums[i]
    )

    result = Math.max(result, current)
  }

  return result
}
```

当前位置只有两个选择：

```text
重新从 nums[i] 开始

或者

连接到前面的连续子数组
```

所以：

```ts
current = Math.max(
  nums[i],
  current + nums[i]
)
```

### 30 秒面试回答

`current` 表示以当前位置结尾的最大连续子数组和。

当前位置要么自己重新开始，要么连接前面的最大子数组。

### 常见追问

- 为什么贪心是正确的？
- 如何返回具体区间？
- 全部是负数怎么办？

### 掌握要求

★★★★★

---

## 15. Longest Substring Without Repeating Characters — LeetCode 3

### 完整面试题

给定一个字符串：

```ts
s: string
```

找出其中不包含重复字符的最长连续子串，并返回其长度。

示例：

```text
s = "abcabcbb"
```

返回：

```text
3
```

因为：

```text
"abc"
```

长度为 3。

示例：

```text
s = "bbbbb"
```

返回：

```text
1
```

要求尽量做到：

```text
O(n)
```

### 参考答案与原理

```ts
function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>()

  let left = 0
  let result = 0

  for (let right = 0; right < s.length; right++) {
    const c = s[right]

    if (map.has(c)) {
      left = Math.max(
        left,
        map.get(c)! + 1
      )
    }

    map.set(c, right)

    result = Math.max(
      result,
      right - left + 1
    )
  }

  return result
}
```

Map 保存：

```text
字符 → 最近出现 index
```

### 30 秒面试回答

这是标准 Sliding Window。

右指针持续扩大窗口；发现重复字符后，根据这个字符上一次出现的位置移动左边界。

左右指针都只向前移动，所以整体 O(n)。

### 常见追问

- 为什么 `left` 要使用 `Math.max`？
- Set 方案怎么写？
- Set 和 Map 方案有什么区别？

### 掌握要求

★★★★★

---

## 16. Reverse Linked List — LeetCode 206

### 完整面试题

给定一个单链表的头节点：

```ts
head
```

请反转整个链表，并返回新的头节点。

例如：

```text
1 → 2 → 3 → 4 → 5 → null
```

反转后：

```text
5 → 4 → 3 → 2 → 1 → null
```

### 参考答案与原理

```ts
function reverseList(
  head: ListNode | null
): ListNode | null {
  let prev: ListNode | null = null
  let current = head

  while (current) {
    const next = current.next

    current.next = prev

    prev = current
    current = next
  }

  return prev
}
```

三个关键变量：

```text
prev
current
next
```

必须先：

```ts
const next = current.next
```

否则修改：

```ts
current.next
```

之后会丢失剩余链表。

### 30 秒面试回答

遍历链表时先保存 next，然后让 current.next 指向 prev，最后同时向后移动 prev 和 current。

### 常见追问

- 为什么必须先保存 next？
- 递归怎么写？
- 时间和空间复杂度是多少？

### 掌握要求

★★★★★

---

## 17. Binary Search — LeetCode 704

### 完整面试题

给定一个按照升序排列、元素不重复的整数数组：

```ts
nums
```

和目标值：

```ts
target
```

如果 target 存在，返回它的 index。

否则返回：

```text
-1
```

示例：

```text
nums = [-1,0,3,5,9,12]
target = 9
```

返回：

```text
4
```

要求：

```text
时间复杂度 O(log n)
```

### 参考答案与原理

使用闭区间：

```text
[left, right]
```

```ts
function search(nums: number[], target: number): number {
  let left = 0
  let right = nums.length - 1

  while (left <= right) {
    const mid = Math.floor(
      left + (right - left) / 2
    )

    if (nums[mid] === target) {
      return mid
    }

    if (nums[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return -1
}
```

Binary Search 最重要的是：

```text
区间定义必须统一
```

这里使用的是：

```text
[left, right]
```

所以：

```ts
while (left <= right)
```

### 30 秒面试回答

Binary Search 思想不难，最容易错的是边界。

先明确搜索区间是闭区间还是左闭右开，然后所有循环条件和边界更新都遵循同一个 invariant。

### 常见追问

- `[left,right]` 和 `[left,right)` 区别？
- 如何找到第一个 `>= target`？
- 为什么 mid 通常写成 `left + (right-left)/2`？

### 掌握要求

★★★★★

---

## 18. Tree DFS / BFS — LeetCode 104 / 102

### 完整面试题一：Maximum Depth of Binary Tree

给定二叉树：

```ts
root
```

返回最大深度。

例如：

```text
      3
     / \
    9   20
       /  \
      15   7
```

最大深度：

```text
3
```

### 参考答案

```ts
function maxDepth(root: TreeNode | null): number {
  if (!root) {
    return 0
  }

  return Math.max(
    maxDepth(root.left),
    maxDepth(root.right)
  ) + 1
}
```

---

### 完整面试题二：Binary Tree Level Order Traversal

给定二叉树，按照层级顺序返回每一层的节点。

例如：

```text
      3
     / \
    9   20
       /  \
      15   7
```

返回：

```ts
[
  [3],
  [9, 20],
  [15, 7]
]
```

### 参考答案

```ts
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) {
    return []
  }

  const result: number[][] = []
  const queue: TreeNode[] = [root]

  while (queue.length) {
    const size = queue.length
    const level: number[] = []

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!

      level.push(node.val)

      if (node.left) {
        queue.push(node.left)
      }

      if (node.right) {
        queue.push(node.right)
      }
    }

    result.push(level)
  }

  return result
}
```

### 30 秒面试回答

树题首先判断问题属于：

```text
递归子问题 → DFS

按层处理 → BFS
```

最大深度是典型 DFS，层序遍历是典型 BFS。

### 常见追问

- 如何实现右视图？
- DFS 递归栈复杂度？
- BFS queue 最大空间是多少？

### 掌握要求

★★★★★

---

## 19. Number of Islands — LeetCode 200

### 完整面试题

给定一个二维网格：

```ts
grid: string[][]
```

其中：

```text
'1' = land
'0' = water
```

上下左右相邻的 land 属于同一个岛屿。

请计算网格中岛屿数量。

例如：

```text
1 1 0 0
1 1 0 0
0 0 1 0
0 0 0 1
```

返回：

```text
3
```

注意：

只考虑：

```text
上、下、左、右
```

不考虑斜线连接。

### 参考答案与原理

```ts
function numIslands(grid: string[][]): number {
  let count = 0

  const dfs = (r: number, c: number) => {
    if (
      r < 0 ||
      c < 0 ||
      r >= grid.length ||
      c >= grid[0].length ||
      grid[r][c] !== '1'
    ) {
      return
    }

    grid[r][c] = '0'

    dfs(r + 1, c)
    dfs(r - 1, c)
    dfs(r, c + 1)
    dfs(r, c - 1)
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count++
        dfs(r, c)
      }
    }
  }

  return count
}
```

每发现一个新的 land：

```text
岛屿数 +1
```

然后 DFS 把整个岛屿全部标记掉。

### 30 秒面试回答

这是经典 Connected Component 问题。

每次找到一个未访问的 land，就说明发现一个新岛屿，然后 DFS/BFS 把这个岛屿整个标记。

### 常见追问

- DFS 和 BFS 都可以吗？
- 为什么可以直接修改 grid？
- 递归太深怎么办？
- Union Find 能做吗？

### 掌握要求

★★★★★

---

## 20. Top K Frequent Elements — LeetCode 347

### 完整面试题

给定整数数组：

```ts
nums
```

以及整数：

```ts
k
```

返回出现频率最高的 `k` 个元素。

例如：

```text
nums = [1,1,1,2,2,3]
k = 2
```

返回：

```text
[1,2]
```

答案顺序不限。

要求：

尽量优于：

```text
O(n log n)
```

### 参考答案与原理

第一步：

```text
Map 统计频率
```

第二步可以使用：

```text
Min Heap
```

或者：

```text
Bucket Sort
```

Bucket Sort 思路：

出现频率最大不会超过：

```text
nums.length
```

因此可以创建：

```ts
bucket[frequency]
```

例如：

```ts
function topKFrequent(nums: number[], k: number): number[] {
  const count = new Map<number, number>()

  for (const n of nums) {
    count.set(n, (count.get(n) ?? 0) + 1)
  }

  const buckets: number[][] =
    Array.from({ length: nums.length + 1 }, () => [])

  for (const [num, freq] of count) {
    buckets[freq].push(num)
  }

  const result: number[] = []

  for (let i = buckets.length - 1; i >= 0; i--) {
    for (const num of buckets[i]) {
      result.push(num)

      if (result.length === k) {
        return result
      }
    }
  }

  return result
}
```

### 30 秒面试回答

先用 Map 统计 frequency。

然后可以使用 size K 的 Min Heap 得到 O(n log k)，或者利用 frequency 最大为 n 的特点使用 Bucket Sort 做到 O(n)。

### 常见追问

- 为什么 Bucket Sort 可以 O(n)？
- Heap 为什么维护 size K？
- K 很小时应该选哪个？

### 掌握要求

★★★★☆

---

## 21. Climbing Stairs — LeetCode 70

### 完整面试题

你正在爬一个有 `n` 阶的楼梯。

每次可以走：

```text
1 阶
```

或者：

```text
2 阶
```

请问走到第 `n` 阶一共有多少种不同方法？

例如：

```text
n = 2
```

有：

```text
1 + 1
2
```

两种。

所以返回：

```text
2
```

例如：

```text
n = 3
```

有：

```text
1 + 1 + 1
1 + 2
2 + 1
```

返回：

```text
3
```

### 参考答案与原理

最后一步只有两种可能：

```text
从 n-1 走 1 步

从 n-2 走 2 步
```

所以：

```text
dp[n] = dp[n-1] + dp[n-2]
```

```ts
function climbStairs(n: number): number {
  if (n <= 2) {
    return n
  }

  let a = 1
  let b = 2

  for (let i = 3; i <= n; i++) {
    const current = a + b

    a = b
    b = current
  }

  return b
}
```

空间可以优化到：

```text
O(1)
```

### 30 秒面试回答

到第 n 阶的最后一步，只可能来自 n-1 或 n-2，所以状态转移是 Fibonacci 形式。

### 常见追问

- 为什么朴素递归很慢？
- Memoization 怎么写？
- Bottom-up DP 怎么写？

### 掌握要求

★★★★★

---

## 22. Array.prototype 扩展：sum / uniq

### 完整面试题

现在希望给 JavaScript 的数组实例增加两个方法：

```ts
sum()
uniq()
```

要求：

```ts
[1, 2, 3].sum()
```

返回：

```text
6
```

以及：

```ts
[1, 1, 2, 2, 3].uniq()
```

返回：

```ts
[1, 2, 3]
```

请实现这两个方法。

同时回答：

1. 为什么应该添加到 `Array.prototype`，而不是直接添加到 `Array`？
2. 在 TypeScript 中为什么直接写：

```ts
Array.prototype.sum = ...
```

可能会报类型错误？
3. TypeScript 中应该如何扩展 `Array` interface？
4. 为什么新增的 prototype 方法最好设置：

```ts
enumerable: false
```

5. `[1,2,3].sum()` 中函数内部的 `this` 指向什么？
6. 实际生产项目中是否推荐修改原生 `Array.prototype`？

### 参考答案与原理

TypeScript 先补充 Array 类型：

```ts
declare global {
  interface Array<T> {
    uniq(): T[]
  }

  interface Array<T> {
    sum(this: number[]): number
  }
}
```

然后实现：

```ts
Object.defineProperty(Array.prototype, 'sum', {
  value: function () {
    return this.reduce(
      (total: number, item: number) => total + item,
      0
    )
  },

  enumerable: false
})

Object.defineProperty(Array.prototype, 'uniq', {
  value: function () {
    return [...new Set(this)]
  },

  enumerable: false
})

export {}
```

为什么加在：

```ts
Array.prototype
```

因为：

```ts
[1,2,3]
```

是数组实例。

访问：

```ts
[1,2,3].sum
```

时会沿原型链寻找：

```text
array instance
↓
Array.prototype
```

如果直接写：

```ts
Array.sum = ...
```

得到的是：

```ts
Array.sum()
```

属于静态方法。

---

`this`：

```ts
[1,2,3].sum()
```

执行时：

```ts
this === [1,2,3]
```

---

为什么：

```ts
enumerable: false
```

因为不希望遍历对象属性时把：

```text
sum
uniq
```

当成普通可枚举属性。

例如某些：

```ts
for...in
```

代码可能受到影响。

---

TypeScript 的两个：

```ts
interface Array<T>
```

会自动进行：

```text
Declaration Merging
```

最终合并到原生 `Array<T>` 类型中。

### 30 秒面试回答

实例方法应该放在 `Array.prototype`，因为数组实例通过原型链访问这些方法。

TypeScript 侧需要通过 interface declaration merging 补充类型。

使用 `Object.defineProperty` 把 `enumerable` 设置为 false，可以避免遍历时把方法当成普通属性。

实际项目中通常不建议随意修改原生 prototype。

### 常见追问

- `this` 是什么？
- Interface 为什么会自动合并？
- `enumerable` 到底是什么意思？
- 为什么生产项目不建议 monkey patch 原生 prototype？
- 静态方法和实例方法有什么区别？

### 掌握要求

★★★★☆
