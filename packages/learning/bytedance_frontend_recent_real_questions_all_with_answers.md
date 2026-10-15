# 字节跳动前端近年真题集（社招优先，含正式岗/实习补充）

> 收录规则：
> - 优先收录 **明确社招 / 有工作经验** 的字节前端公开面经。
> - 其次收录 **正式前端岗，但原帖未明确写“社招”** 的题。
> - 最后附上 **实习 / 校招补充题**，单独标注，不和社招混淆。
> - 很多面经原文只记录“题目名”或“手撕：XXX”，因此本文只把题干补齐到“可以直接做题”的程度，**不冒充逐字原题**。
> - 每题都尽量保留：年份、岗位/业务线、来源标题、来源链接。

---

# A. 明确社招 / 有工作经验真题



## Q018 · 异步限流器

> 年份：**社招公开面经**
> 岗位：**字节前端社招**
> 原面经：**字节跳动 前端社招 三次面试+HR面 (已oc)**
> 来源：https://www.nowcoder.com/discuss/353159379123904512

### 题目

实现一个异步任务限流器：

```ts
scheduler(tasks, limit)
```

要求：

- 同时最多执行 `limit` 个异步任务；
- 某个任务完成后立即补充下一个；
- 最终拿到全部结果。

---

### 参考答案

```ts
async function scheduler(tasks: (() => Promise<any>)[], limit: number) {
  const result: any[] = new Array(tasks.length)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const current = index++
      result[current] = await tasks[current]()
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(limit, tasks.length) },
      () => worker()
    )
  )

  return result
}
```

核心：

```text
启动 limit 个 worker
↓
哪个 worker 先完成
↓
哪个马上领取下一个任务
```

因此不会“一批一批”等待。




## Q021 · 二维数组中的查找

> 年份：**社招公开面经**
> 岗位：**抖音前端社招**
> 原面经：**腾讯、字节等公司前端工程师面经（社招岗）**
> 来源：https://www.nowcoder.com/discuss/353158177761992704

### 题目

二维数组每行从左到右递增，每列从上到下递增。

判断目标值是否存在：

```ts
function findNumber(matrix: number[][], target: number): boolean
```

---

### 参考答案

从右上角开始：

```ts
function findNumber(matrix: number[][], target: number): boolean {
  if (!matrix.length || !matrix[0].length) return false

  let row = 0
  let col = matrix[0].length - 1

  while (row < matrix.length && col >= 0) {
    const value = matrix[row][col]

    if (value === target) return true

    if (value > target) {
      col--
    } else {
      row++
    }
  }

  return false
}
```

时间复杂度：`O(m + n)`  
空间复杂度：`O(1)`



## Q024 · 螺旋矩阵

> 年份：**一年经验社招**
> 岗位：**字节前端社招**
> 原面经：**【字节跳动】一年经验前端社招面经**
> 来源：https://www.nowcoder.com/discuss/353158407664377856

### 题目

给定一个 `m × n` 的矩阵，按照顺时针螺旋顺序返回所有元素。

```ts
function spiralOrder(matrix: number[][]): number[]
```

---

### 参考答案

```ts
function spiralOrder(matrix: number[][]): number[] {
  if (!matrix.length) return []

  const result: number[] = []

  let top = 0
  let bottom = matrix.length - 1
  let left = 0
  let right = matrix[0].length - 1

  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) {
      result.push(matrix[top][i])
    }
    top++

    for (let i = top; i <= bottom; i++) {
      result.push(matrix[i][right])
    }
    right--

    if (top <= bottom) {
      for (let i = right; i >= left; i--) {
        result.push(matrix[bottom][i])
      }
      bottom--
    }

    if (left <= right) {
      for (let i = bottom; i >= top; i--) {
        result.push(matrix[i][left])
      }
      left++
    }
  }

  return result
}
```

时间复杂度：`O(mn)`  
空间复杂度：`O(1)`（不算返回结果）


## Q025 · 矩阵寻找路径 / 回溯

> 年份：**一年经验社招**
> 岗位：**字节前端社招**
> 原面经：**【字节跳动】一年经验前端社招面经**
> 来源：https://www.nowcoder.com/discuss/353158407664377856

### 题目

给定二维字符矩阵和字符串，判断该字符串能否由矩阵中相邻单元格依次组成。

同一个单元格不能重复使用。

---

### 参考答案

```ts
function exist(board: string[][], word: string): boolean {
  const rows = board.length
  const cols = board[0].length

  function dfs(row: number, col: number, index: number): boolean {
    if (index === word.length) return true

    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      board[row][col] !== word[index]
    ) {
      return false
    }

    const temp = board[row][col]
    board[row][col] = '#'

    const found =
      dfs(row + 1, col, index + 1) ||
      dfs(row - 1, col, index + 1) ||
      dfs(row, col + 1, index + 1) ||
      dfs(row, col - 1, index + 1)

    board[row][col] = temp

    return found
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (dfs(i, j, 0)) return true
    }
  }

  return false
}
```

核心是 DFS + 回溯。

时间复杂度最坏约 `O(mn * 4^L)`。


# B. 2026 正式前端岗（原帖未明确写“社招”）

## Q026 · 手写 Promise.race

> 年份：**2026-07-31**
> 岗位：**飞书前端开发**
> 原面经：**字节面经-字节跳动前端开发岗面经-01**
> 来源：https://www.nowcoder.com/discuss/923167773570629632

### 题目

实现：

```ts
function myPromiseRace(values: Iterable<any>): Promise<any>
```

要求：

- 第一个 fulfilled 或 rejected 的结果决定最终结果；
- 支持普通值；
- 支持 thenable；
- 空 iterable 时返回一直 pending 的 Promise。

---

### 参考答案

```ts
function myPromiseRace(values: Iterable<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    for (const value of values) {
      Promise.resolve(value).then(resolve, reject)
    }
  })
}
```

谁最先 settle，外层 Promise 就由谁决定。

如果 iterable 为空，循环不会执行，返回的 Promise 会一直 pending。


## Q027 · 手写 promisify

> 年份：**2026-07-29**
> 岗位：**飞书前端开发**
> 原面经：**字节面经-字节跳动前端开发岗面经-01**
> 来源：https://www.nowcoder.com/discuss/923167773570629632

### 题目

将 Node 风格回调函数：

```ts
fn(args..., callback)
```

转换成返回 Promise 的函数：

```ts
const promiseFn = promisify(fn)
```

回调约定：

```ts
callback(error, value)
```

要求保留 `this`。

---

### 参考答案

```ts
function promisify(fn: Function) {
  return function (this: any, ...args: any[]) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err: any, value: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      })
    })
  }
}
```

关键：

```text
callback(err, value)
→ err 有值：reject
→ 否则：resolve
```

使用 `fn.call(this, ...)` 保留原函数执行时的 `this`。



# C. 2026 实习 / 校招补充真题

## Q031 · 爬楼梯优化到 O(1) 空间

> 年份：**2026-08-10**
> 岗位：**字节前端开发实习**
> 原面经：**字节面经-字节跳动前端开发岗面经-01**
> 来源：https://www.nowcoder.com/discuss/923167773570629632

### 题目

每次可以爬 1 或 2 级台阶，求爬到第 `n` 级共有多少种方法。

要求从递归 / DP 优化到：

```text
时间 O(n)
空间 O(1)
```

---

### 参考答案

```ts
function climbStairs(n: number): number {
  if (n <= 2) return n

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

因为：

```text
f(n) = f(n - 1) + f(n - 2)
```

当前状态只依赖前两个状态，所以不需要 `dp[]`。

时间复杂度：`O(n)`  
空间复杂度：`O(1)`


## Q032 · debounce

> 年份：**2026-08-05**
> 岗位：**抖音生活服务前端开发实习**
> 原面经：**字节面经-字节跳动前端开发岗面经-01**
> 来源：https://www.nowcoder.com/discuss/923167773570629632

### 题目

实现 `debounce`，并解释为什么要保留 `this` 和参数。

```ts
function debounce(fn, delay) {}
```

---

### 参考答案

```ts
function debounce(fn: Function, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
```

核心：

```text
连续触发
→ 不断清掉旧 timer
→ 只有最后一次真正执行
```

保留 `this` 和 `args` 是为了让包装后的函数行为和原函数一致。


## Q033 · 多数元素

> 年份：**2026-05-06**
> 岗位：**字节前端开发实习**
> 原面经：**字节跳动 前端开发实习 面经（二面已挂）**
> 来源：https://www.nowcoder.com/discuss/899078261152509952

### 题目

给定数组 `nums`，返回出现次数超过 `n / 2` 的元素。

LeetCode 169。

---

### 参考答案

Boyer-Moore 投票算法：

```ts
function majorityElement(nums: number[]): number {
  let candidate = 0
  let count = 0

  for (const num of nums) {
    if (count === 0) {
      candidate = num
    }

    count += num === candidate ? 1 : -1
  }

  return candidate
}
```

时间复杂度：`O(n)`  
空间复杂度：`O(1)`


## Q034 · 实现一个单例对象

> 年份：**2026-05-06**
> 岗位：**字节前端开发实习**
> 原面经：**字节跳动 前端开发实习 面经（二面已挂）**
> 来源：https://www.nowcoder.com/discuss/899078261152509952

### 题目

实现一个对象，使无论调用多少次获取方法，都返回同一个实例。

---

### 参考答案

```ts
class Singleton {
  private static instance: Singleton

  private constructor() {}

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton()
    }

    return Singleton.instance
  }
}

const a = Singleton.getInstance()
const b = Singleton.getInstance()

console.log(a === b) // true
```

核心：构造函数不对外开放，只通过静态方法获取唯一实例。


## Q035 · 超时自动删除的 LRU

> 年份：**2026-05-08**
> 岗位：**字节前端开发实习**
> 原面经：**字节跳动 前端开发实习 面经（二面已挂）**
> 来源：https://www.nowcoder.com/discuss/899078261152509952

### 题目

实现一个 LRU Cache。

除了普通 LRU：

```text
get
put
容量淘汰
```

还要求每个缓存项超过指定时间后自动失效。

---

### 参考答案

简单版本：

```ts
class LRUCache {
  private cache = new Map<any, {
    value: any
    timer: ReturnType<typeof setTimeout>
  }>()

  constructor(
    private capacity: number,
    private ttl: number
  ) {}

  get(key: any) {
    if (!this.cache.has(key)) return -1

    const item = this.cache.get(key)!

    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  put(key: any, value: any) {
    if (this.cache.has(key)) {
      clearTimeout(this.cache.get(key)!.timer)
      this.cache.delete(key)
    }

    const timer = setTimeout(() => {
      this.cache.delete(key)
    }, this.ttl)

    this.cache.set(key, { value, timer })

    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value
      const item = this.cache.get(oldestKey)

      if (item) clearTimeout(item.timer)

      this.cache.delete(oldestKey)
    }
  }
}
```

`Map` 保持插入顺序，访问后删除再插入，就能把该 key 移到最新位置。


## Q036 · useTimeout Hook

> 年份：**2026-09-18**
> 岗位：**字节 Seed 前端实习**
> 原面经：**字节seed一面**
> 来源：https://www.nowcoder.com/feed/main/detail/a3ba705bba5b4ca99010bc6317ef2709

### 题目

实现一个 React Hook：

```ts
useTimeout(callback, delay)
```

要求：

- `delay` 后执行 callback；
- 组件卸载时清理 timer；
- callback 更新时避免闭包拿到旧值。

---

### 参考答案

```ts
import { useEffect, useRef } from 'react'

function useTimeout(callback: () => void, delay: number) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const timer = setTimeout(() => {
      callbackRef.current()
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])
}
```

`useRef` 保存最新 callback，避免 timer 回调拿到旧闭包。


## Q037 · 手写 Select 下拉框组件

> 年份：**2026-09-18**
> 岗位：**字节 Seed 前端实习**
> 原面经：**字节seed一面**
> 来源：https://www.nowcoder.com/feed/main/detail/a3ba705bba5b4ca99010bc6317ef2709

### 题目

实现一个基础 Select 下拉框组件。

至少支持：

```text
options
value
onChange
展开 / 收起
选择 option
```

---

### 参考答案

```tsx
function Select({ options, value, onChange }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div>
      <button onClick={() => setOpen(!open)}>
        {value ?? '请选择'}
      </button>

      {open && (
        <ul>
          {options.map(option => (
            <li
              key={option}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

真实面试继续追问时，再补：

```text
点击外部关闭
键盘操作
disabled
受控 / 非受控
ARIA
```


## Q038 · requestLimit 最大并发数 3

> 年份：**2026-09-18**
> 岗位：**字节 Seed 前端实习**
> 原面经：**字节seed一面**
> 来源：https://www.nowcoder.com/feed/main/detail/a3ba705bba5b4ca99010bc6317ef2709

### 题目

实现：

```ts
requestLimit(tasks, 3)
```

要求：

- 同时最多 3 个请求；
- 一个完成后立即启动下一个；
- 最终返回全部结果。

---

### 参考答案

```ts
async function requestLimit(tasks: (() => Promise<any>)[], limit: number) {
  const result: any[] = new Array(tasks.length)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const current = index++
      result[current] = await tasks[current]()
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(limit, tasks.length) },
      () => worker()
    )
  )

  return result
}
```

核心：

```text
启动 limit 个 worker
↓
哪个 worker 先完成
↓
哪个马上领取下一个任务
```

因此不会“一批一批”等待。


# D. 2023–2024 其他字节前端真题补充

## Q039 · 加强版 Promise.all：限制并发并保持顺序

> 年份：**2023**
> 岗位：**字节抖音直播前端**
> 原面经：**字节抖音直播前端**
> 来源：https://www.nowcoder.com/discuss/566251932814188544

### 题目

实现一个加强版 `Promise.all`：

- 可以限制最大并发数量；
- 请求按照任务顺序启动；
- 最终返回结果顺序与任务原始顺序一致。

---

### 参考答案

```ts
async function scheduler(tasks: (() => Promise<any>)[], limit: number) {
  const result: any[] = new Array(tasks.length)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const current = index++
      result[current] = await tasks[current]()
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(limit, tasks.length) },
      () => worker()
    )
  )

  return result
}
```

核心：

```text
启动 limit 个 worker
↓
哪个 worker 先完成
↓
哪个马上领取下一个任务
```

因此不会“一批一批”等待。


## Q040 · 01 背包

> 年份：**2023**
> 岗位：**字节抖音直播前端**
> 原面经：**字节抖音直播前端**
> 来源：https://www.nowcoder.com/discuss/566251932814188544

### 题目

给定一组物品，每个物品有重量和价值，每个物品最多使用一次。

在容量限制下求最大价值。

---

### 参考答案

动态规划：

```ts
function knapsack(
  weights: number[],
  values: number[],
  capacity: number
) {
  const dp = new Array(capacity + 1).fill(0)

  for (let i = 0; i < weights.length; i++) {
    for (let j = capacity; j >= weights[i]; j--) {
      dp[j] = Math.max(
        dp[j],
        dp[j - weights[i]] + values[i]
      )
    }
  }

  return dp[capacity]
}
```

为什么容量要倒序：

> 每个物品只能用一次，如果正序遍历，同一轮可能重复使用当前物品。

时间复杂度：`O(n * capacity)`  
空间复杂度：`O(capacity)`


## Q041 · 深拷贝 + WeakMap

> 年份：**2023**
> 岗位：**字节抖音直播前端**
> 原面经：**字节抖音直播前端**
> 来源：https://www.nowcoder.com/discuss/566251932814188544

### 题目

实现深拷贝，并说明为什么处理循环引用时使用 `WeakMap`。

---

### 参考答案

```ts
function deepClone(obj: any, map = new WeakMap()): any {
  if (obj === null || typeof obj !== 'object') return obj

  if (map.has(obj)) {
    return map.get(obj)
  }

  const result: any = Array.isArray(obj) ? [] : {}

  map.set(obj, result)

  Object.keys(obj).forEach(key => {
    result[key] = deepClone(obj[key], map)
  })

  return result
}
```

为什么 `map.set` 要放在递归之前：

```text
原对象
↓
先记录 原对象 -> 新对象
↓
再递归子属性
```

这样遇到循环引用时才能直接返回已经创建的新对象。

时间复杂度：`O(n)`  
空间复杂度：`O(n)`


## Q042 · 最大并行异步任务 Scheduler

> 年份：**2022**
> 岗位：**字节前端**
> 原面经：**字节4.8前端三面**
> 来源：https://www.nowcoder.com/discuss/353159503262720000

### 题目

实现并发请求限制器：

```ts
const scheduler = new Scheduler(2)

scheduler.add(task1)
scheduler.add(task2)
scheduler.add(task3)
scheduler.add(task4)
```

同时最多执行 2 个任务，一个完成后立即补充下一个。

原面经示例输出顺序：

```text
2、3、1、4
```

---

### 参考答案

```ts
class Scheduler {
  private queue: Array<() => void> = []
  private active = 0

  constructor(private limit: number) {}

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        this.active++

        task()
          .then(resolve, reject)
          .finally(() => {
            this.active--
            this.runNext()
          })
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

注意 `active++` 应该发生在任务真正开始时，而不是 `add()` 时。


## Q043 · 手写 bind，并处理 new bindFn()

> 年份：**2023**
> 岗位：**字节前端实习**
> 原面经：**字节前端实习一面 4.24**
> 来源：https://www.nowcoder.com/discuss/482326408560226304

### 题目

实现：

```ts
Function.prototype.myBind
```

要求：

- 正常调用时绑定 `this`；
- 支持预置参数；
- 使用 `new bindFn()` 时，`this` 应指向新创建的实例，而不是传入的 context。

---

### 参考答案

```ts
Function.prototype.myBind = function (
  context: any,
  ...args1: any[]
) {
  const fn = this

  function bound(this: any, ...args2: any[]) {
    const isNew = this instanceof bound

    return fn.apply(
      isNew ? this : context,
      [...args1, ...args2]
    )
  }

  bound.prototype = Object.create(fn.prototype)

  return bound
}
```

关键：

```text
普通调用
→ this = context

new bound()
→ this 必须是新实例
→ 不能继续绑定 context
```


## Q044 · Promise.all

> 年份：**2023**
> 岗位：**字节前端实习**
> 原面经：**字节前端实习一面 4.24**
> 来源：https://www.nowcoder.com/discuss/482326408560226304

### 题目

手写 `Promise.all`。

---

### 参考答案

```ts
function promiseAll(values: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const result: any[] = new Array(values.length)
    let finished = 0

    if (values.length === 0) {
      resolve([])
      return
    }

    values.forEach((value, index) => {
      Promise.resolve(value)
        .then(res => {
          result[index] = res
          finished++

          if (finished === values.length) {
            resolve(result)
          }
        })
        .catch(reject)
    })
  })
}
```

关键：

```text
Promise.resolve → 支持普通值
result[index]   → 保证顺序
任意 reject     → 整体 reject
```



## Q047 · JSX 转 React.createElement

> 年份：**2023**
> 岗位：**字节前端实习**
> 原面经：**字节前端实习一面 4.24**
> 来源：https://www.nowcoder.com/discuss/482326408560226304

### 题目

实现一个简单转换逻辑，把：

```jsx
<div id="app">
  <span>Hello</span>
</div>
```

转换为等价的：

```ts
React.createElement(...)
```

重点说明 JSX、AST 与 `React.createElement` 的关系。

---

### 参考答案

真实 JSX 转换要经过 parser / AST，这里面试通常说清原理即可。

例如：

```jsx
<div id="app">
  <span>Hello</span>
</div>
```

可以转换成：

```ts
React.createElement(
  'div',
  { id: 'app' },
  React.createElement(
    'span',
    null,
    'Hello'
  )
)
```

核心流程：

```text
JSX source
↓
Parser
↓
JSX AST
↓
Transform
↓
CallExpression AST
↓
Generate
↓
React.createElement(...)
```

现代 React 新 JSX runtime 通常会转换成 `jsx/jsxs` 调用，而不是必须生成 `React.createElement`。


# E. 来源说明

## 2026

1. **字节面经-字节跳动前端开发岗面经-01**
   - 包含：Promise.race、promisify、reverse、版本号排序、交通信号灯、爬楼梯、防抖等。
   - https://www.nowcoder.com/discuss/923167773570629632

2. **字节跳动 前端开发实习 面经（二面已挂）**
   - 包含：多数元素、单例、超时 LRU。
   - https://www.nowcoder.com/discuss/899078261152509952

3. **字节seed一面**
   - 包含：useTimeout、Select 组件、requestLimit。
   - https://www.nowcoder.com/feed/main/detail/a3ba705bba5b4ca99010bc6317ef2709

## 2025

4. **字节跳动商业化广告前端社招面经**
   - 包含：EventEmitter、this/new 输出题。
   - https://www.nowcoder.com/discuss/786037843704479744

5. **字节直播前端一面**
   - 明确写 `社招一年`。
   - 包含：Promise 输出、深拷贝、二叉树最大深度。
   - https://www.nowcoder.com/feed/main/detail/d6507630ef4b41338a19e37a77938174

6. **没刷题的情况下字节前端一面凉经**
   - 包含：版本号、最长无重复子串。
   - https://www.nowcoder.com/feed/main/detail/bd29ded4f74842edb2291f32efcb3f5f

## 2021–2023 社招 / 正式岗历史高频

7. **字节前端社招面经**
   - 包含：买卖股票、Promise.all、EventLoop、EventHub、深拷贝、移动零、Webpack Plugin、Generator 模拟 async/await、最少添加字符构造回文串。
   - https://www.nowcoder.com/feed/main/detail/19a01560190544f783e0c08821282dad
   - https://www.nowcoder.com/discuss/353158296041365504

8. **字节跳动 前端社招 三次面试+HR面 (已oc)**
   - 包含：异步限流器、版本号排序、对象数组去重。
   - https://www.nowcoder.com/discuss/353159379123904512

9. **腾讯、字节等公司前端工程师面经（社招岗）**
   - 抖音部分包含：二维数组查找、先序遍历还原二叉树、版本比较、Cache Request。
   - https://www.nowcoder.com/discuss/353158177761992704

10. **【字节跳动】一年经验前端社招面经**
    - 包含：螺旋矩阵、矩阵路径 / 回溯。
    - https://www.nowcoder.com/discuss/353158407664377856

11. **字节抖音直播前端**
    - 包含：01 背包、加强版 Promise.all / 并发控制、深拷贝。
    - https://www.nowcoder.com/discuss/566251932814188544

12. **字节4.8前端三面**
    - 包含：最大并行异步任务 / Scheduler。
    - https://www.nowcoder.com/discuss/353159503262720000

13. **字节前端实习一面 4.24**
    - 包含：bind、Promise.all、二叉树层序遍历、对象数组深度去重、JSX 转 React.createElement。
    - https://www.nowcoder.com/discuss/482326408560226304

---

# F. 当前统计

当前文件共整理 **47 道** 可明确关联到公开字节前端面经的手写 / 算法 / 输出题。

其中：

```text
A. 明确社招 / 有工作经验：25 道
B. 2026 正式前端岗（社招属性未明示）：5 道
C. 2026 实习 / 校招补充：8 道
D. 2022–2023 其他字节前端补充：9 道
```

> 说明：
> - 有些题在不同年份、不同业务线重复出现，例如 Promise.all、深拷贝、版本号、并发控制。这些重复本身就是“高频”的证据。
> - 文件中没有为了凑数量加入来源无法确认的题。
