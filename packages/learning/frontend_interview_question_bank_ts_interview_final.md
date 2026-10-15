
# React


# 工程化 / 性能

# 算法 / 手写
## Q068 · 实现 LRU Cache。

### 题目描述
请实现一个 `LRUCache`，支持以下操作：

```ts
const cache = new LRUCache(2)

cache.put(1, 1)
cache.put(2, 2)
cache.get(1)    // 1
cache.put(3, 3) // 淘汰 key=2
cache.get(2)    // -1
```

要求：
1. `get(key)`：存在则返回 value，并把该 key 标记为最近使用；不存在返回 `-1`。
2. `put(key, value)`：插入或更新数据，并标记为最近使用。
3. 超过容量时淘汰“最久未使用”的元素。
4. `get` 和 `put` 平均时间复杂度都必须为 `O(1)`。
5. 不直接依赖 JavaScript `Map` 的插入顺序实现淘汰逻辑。





> 公司：快手 ｜ 年份：2025 ｜ 来源：[S06]\(https\://www\.nowcoder.com/discuss/790612044448796672)



### 答案
```ts
class LRUCache {
  private capacity: number
  private map: Map<number, number>

  constructor(capacity: number) {
    this.capacity = capacity
    this.map = new Map()
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1

    const value = this.map.get(key)!

    this.map.delete(key)
    this.map.set(key, value)

    return value
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    }

    this.map.set(key, value)

    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey)
      }
    }
  }
}
```

JS 的 `Map` 保留插入顺序，所以命中后“删除再插入”即可把它移动到最新位置。

`get/put` 平均时间复杂度 `O(1)`，空间复杂度 `O(capacity)`。

## Q069 · 求最长公共子序列（LCS）。

### 题目描述
给定两个字符串 `text1` 和 `text2`，返回它们的最长公共子序列长度。

子序列可以删除若干字符，但不能改变剩余字符的相对顺序。

示例：

```ts
longestCommonSubsequence('abcde', 'ace') // 3
// 最长公共子序列为 "ace"
```

要求：
1. 给出动态规划状态定义和转移方程。
2. 给出可运行代码。
3. 分析时间/空间复杂度。
4. 说明如何把空间从 `O(mn)` 优化到 `O(n)`。





> 公司：快手 ｜ 年份：2025 ｜ 来源：[S06]\(https\://www\.nowcoder.com/discuss/790612044448796672)



### 答案
```ts
function longestCommonSubsequence(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from(
    { length: m + 1 },
    () => new Array(n + 1).fill(0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[m][n]
}
```

`dp[i][j]` 表示 `a` 的前 `i` 个字符和 `b` 的前 `j` 个字符的最长公共子序列长度。

时间复杂度 `O(mn)`，空间复杂度 `O(mn)`。

## Q071 · 实现数组 reverse。

### 题目描述
不使用 `Array.prototype.reverse()`，请原地反转一个数组并返回该数组。

示例：

```ts
reverseArray([1, 2, 3, 4])
// [4, 3, 2, 1]
```

要求：
1. 原地修改数组。
2. 额外空间复杂度必须为 `O(1)`。
3. 说明空数组、单元素数组的处理。





> 公司：字节 ｜ 年份：2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
```ts
function reverse<T>(arr: T[]): T[] {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    ;[arr[left], arr[right]] = [arr[right], arr[left]]
    left++
    right--
  }

  return arr
}
```

双指针从两端向中间交换即可。

时间复杂度 `O(n)`，额外空间复杂度 `O(1)`。

## Q072 · 比较版本号。

### 题目描述
给定两个版本号字符串 `version1` 和 `version2`，比较它们的大小。

版本号由 `.` 分隔的非负整数 revision 组成。比较时从左到右逐段比较，缺失的段按 `0` 处理，revision 的前导零忽略。

返回：
- `1`：`version1 > version2`
- `-1`：`version1 < version2`
- `0`：相等

示例：

```ts
compareVersion('1.01', '1.001') // 0
compareVersion('1.0', '1.0.0')  // 0
compareVersion('1.10', '1.2')   // 1
```





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S09]\(https\://www\.nowcoder.com/discuss/792499554623979520)



### 答案
```ts
function compareVersion(v1: string, v2: string): number {
  const a = v1.split('.')
  const b = v2.split('.')
  const len = Math.max(a.length, b.length)

  for (let i = 0; i < len; i++) {
    const n1 = Number(a[i] ?? 0)
    const n2 = Number(b[i] ?? 0)

    if (n1 > n2) return 1
    if (n1 < n2) return -1
  }

  return 0
}
```

逐段转成数字比较，缺失段按 `0` 处理。不能直接比较字符串，因为 `1.10` 应大于 `1.2`。

## Q073 · 把整数 123 反向输出成 321，不能转字符串。

### 题目描述
给定一个 32 位有符号整数 `x`，不允许把数字转换成字符串，请将其十进制数字反转。

示例：

```ts
reverseInteger(123)  // 321
reverseInteger(-120) // -21
```

要求：
1. 不能使用字符串转换。
2. 正确处理负数。
3. 若反转结果超出 32 位有符号整数范围 `[-2^31, 2^31 - 1]`，返回 `0`。





> 公司：小红书 ｜ 年份：2025 ｜ 来源：[S15]\(https\://www\.nowcoder.com/discuss/722506328911904768?sourceSSR=dynamic)



### 答案
```ts
function reverseNumber(n: number): number {
  const sign = n < 0 ? -1 : 1
  n = Math.abs(n)

  let result = 0

  while (n > 0) {
    const digit = n % 10
    result = result * 10 + digit
    n = Math.floor(n / 10)
  }

  return result * sign
}
```

每次通过 `% 10` 取末位，再通过 `Math.floor(n / 10)` 去掉末位。

时间复杂度 `O(log n)`，空间复杂度 `O(1)`。

## Q074 · 大数相加。

### 题目描述
给定两个只包含非负整数的十进制字符串 `num1` 和 `num2`，返回它们的和，结果仍然用字符串表示。

不能直接把整个字符串转换成 JavaScript `Number` / `BigInt`。

示例：

```ts
addStrings('456', '77') // '533'
addStrings('999', '1')  // '1000'
```

要求处理不同长度和最终进位。





> 公司：腾讯 ｜ 年份：2025 ｜ 来源：[S28]\(https\://www\.nowcoder.com/creation/subject/b2fc38726e87415cbd0d5a267b24b764)



### 答案
```ts
function addStrings(a: string, b: string): string {
  let i = a.length - 1
  let j = b.length - 1
  let carry = 0
  const result: string[] = []

  while (i >= 0 || j >= 0 || carry > 0) {
    const x = i >= 0 ? Number(a[i]) : 0
    const y = j >= 0 ? Number(b[j]) : 0
    const sum = x + y + carry

    result.push(String(sum % 10))
    carry = Math.floor(sum / 10)

    i--
    j--
  }

  return result.reverse().join('')
}
```

从两个字符串尾部逐位相加并维护进位。

时间复杂度 `O(max(m, n))`，空间复杂度 `O(max(m, n))`。

## Q075 · 统计字符串中出现次数最多的字符及次数。

### 题目描述
给定一个字符串，统计出现次数最多的字符以及出现次数。

示例：

```ts
mostFrequentChar('abbcccaa')
// { char: 'c', count: 3 }
```

要求：
1. 只遍历字符串一次完成计数和最大值更新。
2. 如果有多个字符并列最多，返回最先达到最大频次的字符（也可以明确采用其他规则，但必须说明）。
3. 空字符串返回 `null`。





> 公司：腾讯 ｜ 年份：2025 ｜ 来源：[S28]\(https\://www\.nowcoder.com/creation/subject/b2fc38726e87415cbd0d5a267b24b764)



### 答案
```ts
function maxChar(str: string): { char: string; count: number } {
  const countMap: Record<string, number> = {}
  let max = 0
  let char = ''

  for (const ch of str) {
    countMap[ch] = (countMap[ch] ?? 0) + 1

    if (countMap[ch] > max) {
      max = countMap[ch]
      char = ch
    }
  }

  return { char, count: max }
}
```

用哈希表统计频次，同时维护当前最大值即可。

时间复杂度 `O(n)`，空间复杂度 `O(k)`，`k` 为不同字符数量。

## Q076 · 股票 II：可以多次买卖，求最大收益。

### 题目描述
给定数组 `prices`，其中 `prices[i]` 表示第 `i` 天的股票价格。你可以进行任意多次买卖，但同一时间最多只能持有一股。

返回能够获得的最大利润。

示例：

```ts
maxProfit([7, 1, 5, 3, 6, 4]) // 7
// 1 买 5 卖 + 3 买 6 卖 = 7
```

要求给出 `O(n)` 时间、`O(1)` 空间实现。





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S08]\(https\://www\.nowcoder.com/feed/main/detail/f594a753894148bda1a6981f90983a27)



### 答案
```ts
function maxProfit(prices: number[]): number {
  let profit = 0

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1]
    }
  }

  return profit
}
```

把所有相邻的正收益累加，相当于抓住每一段上涨。

时间复杂度 `O(n)`，空间复杂度 `O(1)`。

## Q077 · 三数之和。

### 题目描述
给定整数数组 `nums`，找出所有满足：

```text
nums[i] + nums[j] + nums[k] = 0
```

且 `i、j、k` 互不相同的三元组。

结果中不能包含重复三元组。

示例：

```ts
threeSum([-1, 0, 1, 2, -1, -4])
// [[-1, -1, 2], [-1, 0, 1]]
```

要求时间复杂度优于 `O(n³)`。





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S08]\(https\://www\.nowcoder.com/feed/main/detail/f594a753894148bda1a6981f90983a27)



### 答案
```ts
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b)
  const result: number[][] = []

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue

    let left = i + 1
    let right = nums.length - 1

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]])
        left++
        right--

        while (left < right && nums[left] === nums[left - 1]) left++
        while (left < right && nums[right] === nums[right + 1]) right--
      } else if (sum < 0) {
        left++
      } else {
        right--
      }
    }
  }

  return result
}
```

排序后枚举第一个数，再用左右双指针寻找另外两个数，并跳过重复值。

时间复杂度 `O(n²)`。

## Q078 · 层序遍历二叉树。

### 题目描述
给定一棵二叉树的根节点 `root`，返回其按层遍历的节点值。

示例：

```text
    3
   / \
  9  20
     /  \
    15   7
```

返回：

```ts
[[3], [9, 20], [15, 7]]
```

请使用 BFS 实现，并分析复杂度。





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S11]\(https\://www\.nowcoder.com/feed/main/detail/d907f9186dc34f48a9b78b92fee2339c)



### 答案
```ts
type TreeNode = {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return []

  const result: number[][] = []
  const queue: TreeNode[] = [root]

  while (queue.length > 0) {
    const size = queue.length
    const level: number[] = []

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!
      level.push(node.val)

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(level)
  }

  return result
}
```

使用 BFS。每轮先记录当前队列长度，这个长度就是当前层节点数。

时间复杂度 `O(n)`，空间复杂度最坏 `O(n)`。

## Q079 · 原地合并两个有序数组。

### 题目描述
给定两个非递减数组 `nums1` 和 `nums2`。`nums1` 的长度为 `m + n`，其中前 `m` 个元素有效，尾部 `n` 个位置预留为 `0`；`nums2` 有 `n` 个有效元素。

请把 `nums2` 原地合并进 `nums1`，最终 `nums1` 仍然非递减。

示例：

```ts
nums1 = [1,2,3,0,0,0], m = 3
nums2 = [2,5,6], n = 3

// nums1 => [1,2,2,3,5,6]
```

要求 `O(m+n)` 时间、`O(1)` 额外空间。





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S10]\(https\://www\.nowcoder.com/feed/main/detail/88e498284c1144a6b5f6f65168464580)



### 答案
```ts
function merge(
  nums1: number[],
  m: number,
  nums2: number[],
  n: number
): void {
  let i = m - 1
  let j = n - 1
  let k = m + n - 1

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i]
      i--
    } else {
      nums1[k] = nums2[j]
      j--
    }
    k--
  }
}
```

从后往前写入 `nums1`，可以避免覆盖尚未处理的数据。

时间复杂度 `O(m+n)`，额外空间复杂度 `O(1)`。

## Q080 · 求最小 K 个数。

### 题目描述
给定整数数组 `arr` 和整数 `k`，返回数组中最小的 `k` 个数。

示例：

```ts
getLeastNumbers([3, 2, 1, 5, 6, 4], 3)
// [1, 2, 3]，返回顺序可不要求
```

要求：
1. 说明直接排序的复杂度。
2. 实现一种更适合 `k << n` 的方案。
3. 说明最大堆和 Quickselect 两种思路的复杂度。





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S10]\(https\://www\.nowcoder.com/feed/main/detail/88e498284c1144a6b5f6f65168464580)



### 答案
```ts
function getLeastNumbers(arr: number[], k: number): number[] {
  if (k <= 0) return []
  if (k >= arr.length) return [...arr]

  return [...arr].sort((a, b) => a - b).slice(0, k)
}
```

这是面试现场最直接且正确的版本，时间复杂度 `O(n log n)`。

如果面试官继续要求优化，可以再说明：使用大小为 `k` 的最大堆可做到 `O(n log k)`，Quick Select 平均可以做到 `O(n)`。

## Q081 · 前 K 个高频单词。

### 题目描述
给定字符串数组 `words` 和整数 `k`，返回出现频率最高的 `k` 个单词。

排序规则：
1. 频率高的排在前面；
2. 频率相同时，字典序较小的排在前面。

示例：

```ts
topKFrequent(
  ['i', 'love', 'leetcode', 'i', 'love', 'coding'],
  2
)
// ['i', 'love']
```

请给出一种可运行实现并分析复杂度。





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S10]\(https\://www\.nowcoder.com/feed/main/detail/88e498284c1144a6b5f6f65168464580)



### 答案
```ts
function topKFrequent(words: string[], k: number): string[] {
  const count = new Map<string, number>()

  for (const word of words) {
    count.set(word, (count.get(word) ?? 0) + 1)
  }

  return [...count.keys()]
    .sort((a, b) => {
      const diff = count.get(b)! - count.get(a)!
      return diff !== 0 ? diff : a.localeCompare(b)
    })
    .slice(0, k)
}
```

先统计频次，再按“频次降序、字典序升序”排序。

这个版本简单且适合现场手写。若要求更优，再讨论最小堆。

## Q082 · 复原 IP 地址。

### 题目描述
给定只包含数字的字符串 `s`，请返回所有可能的合法 IPv4 地址。

合法 IPv4 地址由四段十进制数组成，每段：
- 范围为 `0~255`
- 长度为 `1~3`
- 除数字 `0` 本身外，不能有前导零

示例：

```ts
restoreIpAddresses('25525511135')
// ['255.255.11.135', '255.255.111.35']
```

请使用回溯实现，并进行必要剪枝。





> 公司：美团 ｜ 年份：2025 ｜ 来源：[S10]\(https\://www\.nowcoder.com/feed/main/detail/88e498284c1144a6b5f6f65168464580)



### 答案
```ts
function restoreIpAddresses(s: string): string[] {
  const result: string[] = []

  function dfs(start: number, path: string[]): void {
    if (path.length === 4) {
      if (start === s.length) {
        result.push(path.join('.'))
      }
      return
    }

    for (let len = 1; len <= 3; len++) {
      if (start + len > s.length) break

      const part = s.slice(start, start + len)

      if (part.length > 1 && part[0] === '0') break
      if (Number(part) > 255) continue

      dfs(start + len, [...path, part])
    }
  }

  dfs(0, [])
  return result
}
```

每一段只能是 `1~3` 位、范围 `0~255`，并且除了单独的 `0` 之外不能有前导零。

## Q083 · 实现并发请求调度器，最多同时 N 个请求。

### 题目描述
请实现一个并发请求调度器 `Scheduler`。

要求：
1. 构造函数接收最大并发数 `limit`。
2. `add(task)` 接收一个返回 Promise 的任务函数，而不是已经执行的 Promise。
3. 任意时刻处于运行状态的任务数量不能超过 `limit`。
4. `add(task)` 返回 Promise，并把任务自身的成功值或异常透传给调用者。
5. 无论任务成功还是失败，都必须继续调度队列中的下一个任务。
6. 多个任务按照加入顺序开始执行。

示例：

```ts
const scheduler = new Scheduler(2)

scheduler.add(() => request(1))
scheduler.add(() => request(2))
scheduler.add(() => request(3))

// 1、2 可以同时开始；3 必须等待其中一个结束
```





> 公司：拼多多 ｜ 年份：2025 ｜ 来源：[S25]\(https\://www\.nowcoder.com/feed/main/detail/97c3a35af5e54932b717f1ffd0c06b0f)



### 答案
```ts
class Scheduler {
  private limit: number
  private active = 0
  private queue: Array<() => void> = []

  constructor(limit: number) {
    this.limit = limit
  }

  add(task: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        this.active++

        task()
          .then(resolve, reject)
          .finally(() => {
            this.active--
            this.run()
          })
      })

      this.run()
    })
  }

  private run(): void {
    while (this.active < this.limit && this.queue.length > 0) {
      const task = this.queue.shift()!
      task()
    }
  }
}
```

核心状态只有两个：`active` 表示当前正在执行的任务数，`queue` 保存等待任务。任务无论成功还是失败，都必须在 `finally` 中释放并发名额并继续调度。

# Node / Backend / 系统设计
## Q086 · RESTful API 如何设计？

### 题目描述
RESTful API 如何设计？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：字节/飞书 ｜ 年份：2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
资源用名词 URI，HTTP method 表达动作，合理状态码；分页/过滤/排序参数统一；错误格式稳定；幂等性、版本、鉴权、缓存和并发控制按业务需求设计。


## Q088 · JWT 的原理是什么？项目里怎么用？

### 题目描述
JWT 的原理是什么？项目里怎么用？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：字节 ｜ 年份：2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
JWT 由 header.payload.signature 组成，签名保证完整性而非加密；服务端验证签名和 exp/aud/iss 等声明。不要在 payload 放敏感明文。浏览器认证需权衡 HttpOnly Cookie 与其他存储方案。


## Q089 · 向量数据库和 MySQL 有什么区别？

### 题目描述
向量数据库和 MySQL 有什么区别？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：字节 ｜ 年份：2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
MySQL 擅长结构化关系、事务和精确查询；向量库围绕 embedding 的近似最近邻检索，优化相似度搜索。实际系统常组合：结构化过滤/事实存 MySQL，语义检索存向量索引。


## Q090 · RAG 为什么要混合向量检索和 BM25？

### 题目描述
RAG 为什么要混合向量检索和 BM25？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：字节 ｜ 年份：2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
向量检索擅长语义相似，BM25 擅长关键词/专有名词/精确词匹配；混合召回可互补，再用融合排序或 reranker 提升召回与相关性。


## Q091 · 多轮对话 Memory 怎么设计？

### 题目描述
多轮对话 Memory 怎么设计？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：字节 ｜ 年份：2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
区分短期上下文、摘要记忆、长期结构化/向量记忆；写入前做抽取与去重，检索按当前任务相关性而不是全量灌入，并考虑时效、权限和可删除性。


## Q092 · Agent 如何判断任务完成并避免死循环？

### 题目描述
你正在实现一个可以连续调用工具完成任务的 AI Agent。如何判断 Agent 已经完成任务，并避免因为模型不断重复调用工具而进入死循环？

请从以下方面回答：
1. 成功终止条件如何定义。
2. 最大 step / token / 时间 / 工具调用次数如何限制。
3. 如何检测重复动作和无进展状态。
4. 工具失败后何时重试、何时重新规划、何时终止。
5. 为什么重要任务需要外部 verifier，而不能只相信模型自己说“完成了”。





> 公司：字节 ｜ 年份：2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
定义明确终止条件/成功判据；限制最大步骤、时间、token 和工具调用；记录状态避免重复动作；失败时重规划/降级；关键任务加入验证器或外部可观察结果。


## Q094 · 仓库里有 100 个 Skills，如何避免把全部工具说明塞进上下文？

### 题目描述
仓库里有 100 个 Skills，如何避免把全部工具说明塞进上下文？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯音乐 ｜ 年份：2026 ｜ 来源：[S03]\(https\://www\.nowcoder.com/discuss/926677494571204608?sourceSSR=home)



### 答案
先做工具/Skill 检索与路由，只把候选子集 schema 注入上下文；可按领域分层索引、元数据搜索、两阶段路由，并缓存高频选择。


## Q095 · 高并发场景如何用线程池？

### 题目描述
高并发场景如何用线程池？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：快手 ｜ 年份：2025 ｜ 来源：[S29]\(https\://www\.nowcoder.com/discuss/791327905203625984)



### 答案
线程池控制并发度，复用线程并通过有界队列、拒绝策略和监控避免无限创建线程。IO/CPU 任务应使用不同规模策略，不能把线程池当作无限扩容。


# CSS / Vue / 响应式
## Q103 · 标准盒模型和 IE 盒模型有什么区别？如何切换？

### 题目描述
标准盒模型和 IE 盒模型有什么区别？如何切换？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯广告 ｜ 年份：2024 ｜ 来源：[S31]\(https\://www\.nowcoder.com/discuss/618481670739587072?sourceSSR=post)



### 答案
标准盒模型的 width/height 只含 content；border-box 还包含 padding 和 border。通过 \`box-sizing: content-box/border-box\` 切换。


## Q104 · \`flex: 1\` 对应哪些属性？\`flex: 1 0 0\` 又表示什么？

### 题目描述
\`flex: 1\` 对应哪些属性？\`flex: 1 0 0\` 又表示什么？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：腾讯 IEG ｜ 年份：2024 ｜ 来源：[S32]\(https\://www\.nowcoder.com/discuss/636182672468885504)



### 答案
\`flex\` 是 grow、shrink、basis 的简写；常见 \`flex: 1\` 计算为 \`1 1 0%\`，\`1 0 0\` 表示可放大、不收缩、基准尺寸为 0。


## Q105 · 什么是 BFC？如何创建？能解决哪些布局问题？

### 题目描述
什么是 BFC？如何创建？能解决哪些布局问题？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯广告 ｜ 年份：2024 ｜ 来源：[S31]\(https\://www\.nowcoder.com/discuss/618481670739587072?sourceSSR=post)



### 答案
BFC 是独立布局区域，可用于包含浮动、隔离外部浮动、避免部分 margin collapse。常见创建方式有 \`display: flow-root\`、非 visible overflow、flex/grid item 等。


## Q106 · 响应式布局有哪些方案？rem、vw/vh、媒体查询如何选择？

### 题目描述
响应式布局有哪些方案？rem、vw/vh、媒体查询如何选择？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯云智 ｜ 年份：2024 ｜ 来源：[S34]\(https\://www\.nowcoder.com/discuss/659109288819900416)



### 答案
媒体查询用于断点布局；rem 以根字号统一缩放；vw/vh 直接相对视口。现代项目通常组合弹性布局、媒体查询、clamp/container query，并注意可访问性和极端尺寸。


## Q107 · Vue 2 和 Vue 3 的响应式原理有什么区别？

### 题目描述
Vue 2 和 Vue 3 的响应式原理有什么区别？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：腾讯云智 / 美团 ｜ 年份：2024 ｜ 来源：[S33]\(https\://www\.nowcoder.com/discuss/608465873279483904?sourceSSR=dynamic)、[S34]\(https\://www\.nowcoder.com/discuss/659109288819900416)



### 答案
Vue 2 主要用 \`Object.defineProperty\` 劫持已有属性；Vue 3 用 Proxy 代理对象，能更自然地覆盖新增/删除属性、数组和集合，并配合 effect 依赖追踪。


## Q108 · Vue 生命周期有哪些？Vue 2 与 Vue 3 如何对应？

### 题目描述
Vue 生命周期有哪些？Vue 2 与 Vue 3 如何对应？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：美团 ｜ 年份：2024 ｜ 来源：[S33]\(https\://www\.nowcoder.com/discuss/608465873279483904?sourceSSR=dynamic)



### 答案
核心阶段是创建、挂载、更新、卸载；Vue 3 Composition API 常用 \`onMounted/onUpdated/onUnmounted\`，并把 Vue 2 的 beforeDestroy/destroyed 改为 beforeUnmount/unmounted。


## Q109 · Vue 2 和 Vue 3 的 diff 有哪些主要变化？

### 题目描述
Vue 2 和 Vue 3 的 diff 有哪些主要变化？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：腾讯云智 ｜ 年份：2024 ｜ 来源：[S34]\(https\://www\.nowcoder.com/discuss/659109288819900416)



### 答案
Vue 3 编译期生成 patch flags 和 block tree，运行时可跳过更多静态节点；对 keyed children 采用头尾同步、key map 与最长递增子序列减少移动。


# React

## Q112 · \`useEffect\` 和 \`useLayoutEffect\` 有什么区别？

### 题目描述
\`useEffect\` 和 \`useLayoutEffect\` 有什么区别？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：小红书 / 腾讯 ｜ 年份：2024–2025 ｜ 来源：[S18]\(https\://www\.nowcoder.com/feed/main/detail/88ce9477e7304679ab671710dd524423)、[S32]\(https\://www\.nowcoder.com/discuss/636182672468885504)



### 答案
\`useLayoutEffect\` 在 DOM 提交后、浏览器绘制前同步执行，可读取布局并立即修正；\`useEffect\` 通常在绘制后异步执行。默认优先 useEffect，避免阻塞绘制。


## Q113 · React 18 的自动批处理和 Concurrent Rendering 是什么？

### 题目描述
React 18 的自动批处理和 Concurrent Rendering 是什么？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：小红书 ｜ 年份：2025 ｜ 来源：[S18]\(https\://www\.nowcoder.com/feed/main/detail/88ce9477e7304679ab671710dd524423)



### 答案
React 18 扩大了自动批处理范围；Concurrent Rendering 是可中断、可按优先级调度的渲染能力，不代表默认多线程。\`startTransition\` 可把非紧急更新标为 transition。


# JavaScript / TypeScript
## Q115 · JavaScript 有哪些判断数据类型的方法？各有什么边界？

### 题目描述
JavaScript 中有哪些常见的数据类型判断方式？请比较：

- `typeof`
- `instanceof`
- `Object.prototype.toString.call`
- `Array.isArray`

并回答：
1. `typeof null` 为什么是 `"object"`。
2. `typeof` 判断函数、数组分别是什么结果。
3. `instanceof` 的原理是什么，跨 iframe / realm 时有什么问题。
4. 如何可靠判断数组。
5. TypeScript 中这些运行时判断如何用于类型收窄。





> 公司：美团 ｜ 年份：2024 ｜ 来源：[S33]\(https\://www\.nowcoder.com/discuss/608465873279483904?sourceSSR=dynamic)



### 答案
常用 \`typeof\`、\`instanceof\`、\`Array.isArray\`、\`Object.prototype.toString.call\`。typeof 对 null 返回 object；instanceof 依赖原型链且跨 realm 有边界。


## Q116 · TypeScript 泛型有什么作用？如何收窄联合类型？

### 题目描述
TypeScript 泛型有什么作用？如何收窄联合类型？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯 IEG ｜ 年份：2024 ｜ 来源：[S32]\(https\://www\.nowcoder.com/discuss/636182672468885504)



### 答案
泛型在保留类型关系的同时复用实现；联合类型可通过 typeof、instanceof、in、字面量判别字段或自定义 type predicate 收窄。


## Q117 · Set 和 Map 有什么区别？WeakSet/WeakMap 又适合什么场景？

### 题目描述
Set 和 Map 有什么区别？WeakSet/WeakMap 又适合什么场景？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：字节 / 美团 ｜ 年份：2025 ｜ 来源：[S08]\(https\://www\.nowcoder.com/feed/main/detail/f594a753894148bda1a6981f90983a27)、[S14]\(https\://www\.nowcoder.com/feed/main/detail/f1fff2efed3e4f638eb31a43424d42c6)



### 答案
Set 存唯一值，Map 存键值映射；WeakSet/WeakMap 的键为对象且不阻止垃圾回收，适合对象关联元数据，但不可枚举。


## Q118 · JavaScript 常见内存泄漏有哪些？如何定位？

### 题目描述
JavaScript 常见内存泄漏有哪些？如何定位？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：美团 ｜ 年份：2025 ｜ 来源：[S08]\(https\://www\.nowcoder.com/feed/main/detail/f594a753894148bda1a6981f90983a27)



### 答案
常见原因有未清理定时器/监听器、闭包持有大对象、脱离 DOM、无限缓存。使用 Chrome Memory heap snapshot、allocation timeline 和 retainers 定位引用链。


# 工程化 / 性能 / 测试
## Q119 · Webpack 从入口到产物的大致构建流程是什么？

### 题目描述
Webpack 从入口到产物的大致构建流程是什么？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：美团 ｜ 年份：2024 ｜ 来源：[S33]\(https\://www\.nowcoder.com/discuss/608465873279483904?sourceSSR=dynamic)



### 答案
读取配置与入口，递归解析依赖并经 loader 转换，形成 module graph/chunk graph，执行优化和代码生成，最后 emit assets；plugin 通过生命周期 hooks 扩展流程。


## Q120 · Webpack loader 和 plugin 有什么区别？如何写一个简单 plugin？

### 题目描述
Webpack loader 和 plugin 有什么区别？如何写一个简单 plugin？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯 IEG / 美团 ｜ 年份：2024 ｜ 来源：[S32]\(https\://www\.nowcoder.com/discuss/636182672468885504)、[S33]\(https\://www\.nowcoder.com/discuss/608465873279483904?sourceSSR=dynamic)



### 答案
loader 面向单个模块内容转换；plugin 订阅 compiler/compilation hooks，影响构建全流程。简单 plugin 实现 \`apply(compiler)\` 并在合适 hook 注册回调。


## Q122 · 如何设计前端监控：错误、性能、请求和用户行为如何串联？

### 题目描述
请设计一套前端监控系统，要求能够把同一次用户访问中的错误、性能、接口请求和关键用户行为关联起来。

请说明：
1. 前端需要采集哪些数据：JS Error、Promise Error、资源错误、接口错误、Web Vitals、用户行为等。
2. 如何设计 sessionId / traceId / requestId，把不同事件串起来。
3. 如何批量上报并避免影响页面性能。
4. 如何处理采样、去重、限流和敏感数据脱敏。
5. Source Map 如何用于线上错误定位。
6. 服务端如何查询和聚合这些数据。





> 公司：字节 / 腾讯 ｜ 年份：2024–2026 ｜ 来源：[S31]\(https\://www\.nowcoder.com/discuss/618481670739587072?sourceSSR=post)、[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
采集 JS/Promise/resource 错误、Web Vitals、请求和关键行为；统一 trace/session/release/user 标签，采样、去重、脱敏、批量上报，并用 sourcemap 还原与告警聚合形成闭环。


# Node / Backend / 数据库 / 系统设计
## Q124 · 数据库为什么常用 B+ Tree 索引？联合索引最左前缀是什么？

### 题目描述
数据库为什么常用 B+ Tree 索引？联合索引最左前缀是什么？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：字节 / 美团 ｜ 年份：2025–2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)、[S30]\(https\://www\.nowcoder.com/discuss/797941590240018432?sourceSSR=post)



### 答案
B+ Tree 分支多、树高低、叶子有序，适合磁盘页和范围扫描。联合索引按列顺序排序，查询通常需从最左列开始形成连续约束；跳过前导列会削弱可用性。


## Q125 · 四种事务隔离级别分别解决什么问题？MVCC 的作用是什么？

### 题目描述
四种事务隔离级别分别解决什么问题？MVCC 的作用是什么？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：字节 / 美团 ｜ 年份：2025–2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)、[S30]\(https\://www\.nowcoder.com/discuss/797941590240018432?sourceSSR=post)



### 答案
RU、RC、RR、Serializable 隔离逐步增强、并发逐步下降。MVCC 通过多版本与可见性规则减少读写冲突；具体能否避免幻读以及锁行为要结合数据库实现回答。


## Q127 · Cache Aside 如何保证数据库与缓存尽量一致？删除缓存失败怎么办？

### 题目描述
Cache Aside 如何保证数据库与缓存尽量一致？删除缓存失败怎么办？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：美团 / 字节 ｜ 年份：2025–2026 ｜ 来源：[S30]\(https\://www\.nowcoder.com/discuss/797941590240018432?sourceSSR=post)、[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)



### 答案
读时先缓存，miss 查 DB 并回填；写时先更新 DB 再删除缓存。删除失败需重试/消息补偿，或通过 CDC 最终修复；配合 TTL，并处理缓存击穿和并发回填覆盖。


## Q128 · 如何设计幂等接口？为什么“先查再插”仍可能重复？

### 题目描述
如何设计幂等接口？为什么“先查再插”仍可能重复？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：字节 / 美团 ｜ 年份：2025–2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)、[S30]\(https\://www\.nowcoder.com/discuss/797941590240018432?sourceSSR=post)



### 答案
先查再插存在竞态，两个请求都可能查不到。使用业务唯一索引或 idempotency key 唯一约束原子防重；记录请求状态和结果，使重试返回同一结果，并处理处理中、失败和过期。


## Q129 · 如何设计一个支持超时、重试、退避和取消的请求层？

### 题目描述
请设计并实现一个前端请求函数 `requestWithRetry`，支持：

1. 超时：单次请求超过 `timeout` 自动取消。
2. 重试：最多重试 `retries` 次。
3. 指数退避：每次重试等待时间递增，并加入随机 jitter。
4. 取消：调用方可以传入自己的 `AbortSignal`。
5. 默认只对网络错误、`429`、`5xx` 等可恢复错误重试；`4xx` 业务错误一般不重试。
6. 对 `POST` 等非幂等请求不能无脑重试，需要说明幂等性或 `Idempotency-Key`。
7. 最终错误应透传给调用方。

请给出核心实现，并解释哪些错误应该重试、哪些不应该。





> 公司：字节 / 腾讯 ｜ 年份：2025–2026 ｜ 来源：[S01]\(https\://www\.nowcoder.com/discuss/923167773570629632?sourceSSR=home)、[S27]\(https\://www\.nowcoder.com/discuss/776401987033145344)



### 答案
```ts
type RequestOptions = RequestInit & {
  timeout?: number
  retries?: number
  baseDelay?: number
}

async function requestWithRetry(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const {
    timeout = 5000,
    retries = 3,
    baseDelay = 300,
    signal: outerSignal,
    ...init
  } = options

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController()

    const abort = () => controller.abort(outerSignal?.reason)
    outerSignal?.addEventListener('abort', abort, { once: true })

    const timer = setTimeout(
      () => controller.abort(new Error('Request timeout')),
      timeout
    )

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      })

      const retryable =
        response.status === 429 ||
        response.status >= 500

      if (!retryable || attempt >= retries) {
        return response
      }
    } catch (error) {
      if (outerSignal?.aborted) throw error
      if (attempt >= retries) throw error
    } finally {
      clearTimeout(timer)
      outerSignal?.removeEventListener('abort', abort)
    }

    const exponential = baseDelay * 2 ** attempt
    const jitter = Math.random() * exponential * 0.2
    await new Promise(resolve =>
      setTimeout(resolve, exponential + jitter)
    )
  }
}
```

关键取舍：
- 网络失败、`429`、`5xx` 通常可以有限重试。
- 参数错误、认证失败等确定性 `4xx` 一般不应重试。
- `GET/HEAD/PUT/DELETE` 等通常具备幂等语义；`POST` 重试前应确认业务幂等，常配合 `Idempotency-Key`。
- 重试必须有限次数并使用 backoff + jitter，避免服务故障时形成重试风暴。
- 生产实现还应加入 trace、指标、熔断和统一错误模型。


# 国际大厂前端 Coding / 系统设计
## Q130 · 实现一个可访问的 Dropdown 下拉选择组件。

### 题目描述
请使用 React 实现一个可访问的单选 Dropdown。

要求：
1. 点击 trigger 打开/关闭列表。
2. 点击选项后更新选中值并关闭。
3. 支持键盘：
   - `ArrowDown / ArrowUp` 移动高亮项；
   - `Enter` 选择；
   - `Escape` 关闭。
4. 打开时要有明确的焦点/高亮状态。
5. 使用正确的 `aria-expanded`、`role="listbox"`、`role="option"`、`aria-selected`。
6. 点击组件外部时关闭。
7. 选项由 props 传入，不能写死。

请给出可运行的核心组件。





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S35]\(https\://www\.reddit.com/r/leetcode/comments/1jqqtak/amazon_frontend_engineer_ii_rejected/)



### 答案
```tsx
import { useEffect, useRef, useState } from 'react'

type Option = {
  value: string
  label: string
}

export function Dropdown({
  options,
  value,
  onChange
}: {
  options: Option[]
  value: string | null
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = options.find(item => item.value === value)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const select = (index: number) => {
    const option = options[index]
    if (!option) return

    onChange(option.value)
    setOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(i => (i + 1) % options.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(i => (i - 1 + options.length) % options.length)
    }

    if (event.key === 'Enter' && open) {
      event.preventDefault()
      select(activeIndex)
    }
  }

  return (
    <div ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        {selected?.label ?? 'Select'}
      </button>

      {open && (
        <div role="listbox">
          {options.map((option, index) => (
            <div
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={event => {
                event.preventDefault()
                select(index)
              }}
            >
              {index === activeIndex ? '› ' : ''}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

核心状态只有：
- `open`
- 当前 `value`
- `activeIndex`

面试时重点说明键盘操作、焦点管理和 ARIA，而不是只实现“点击展开”。生产级组件还应进一步处理 disabled option、typeahead、焦点回到 trigger 等细节。


## Q131 · 实现一个 Contact Form，并完成基础校验和提交状态处理。

### 题目描述
请使用 React 实现一个 Contact Form，包含：
- Name
- Email
- Message
- Submit

要求：
1. 所有字段必填。
2. Email 做基础格式校验。
3. 校验失败时在对应字段旁显示错误。
4. 提交时展示 loading，并禁止重复提交。
5. 提交成功后展示成功状态；失败时展示错误状态。
6. 表单必须具备基本可访问性：`label` 正确关联输入框，错误信息可被识别。
7. 不使用第三方表单库。

假设提交接口为：

```ts
async function submitContact(data): Promise<void>
```





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S35]\(https\://www\.reddit.com/r/leetcode/comments/1jqqtak/amazon_frontend_engineer_ii_rejected/)



### 答案
```tsx
import { FormEvent, useState } from 'react'

type FormValue = {
  name: string
  email: string
  message: string
}

export function ContactForm() {
  const [form, setForm] = useState<FormValue>({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState<Partial<FormValue>>({})
  const [status, setStatus] =
    useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const validate = () => {
    const next: Partial<FormValue> = {}

    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) {
      next.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = 'Invalid email'
    }
    if (!form.message.trim()) next.message = 'Message is required'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate() || status === 'submitting') return

    setStatus('submitting')

    try {
      await submitContact(form)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <label>
        Name
        <input
          value={form.name}
          aria-invalid={Boolean(errors.name)}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </label>
      {errors.name && <p role="alert">{errors.name}</p>}

      <label>
        Email
        <input
          value={form.email}
          aria-invalid={Boolean(errors.email)}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
      </label>
      {errors.email && <p role="alert">{errors.email}</p>}

      <label>
        Message
        <textarea
          value={form.message}
          aria-invalid={Boolean(errors.message)}
          onChange={e => setForm({ ...form, message: e.target.value })}
        />
      </label>
      {errors.message && <p role="alert">{errors.message}</p>}

      <button disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>

      {status === 'success' && <p role="status">Submitted</p>}
      {status === 'error' && <p role="alert">Submit failed</p>}
    </form>
  )
}
```

面试重点是：受控输入、同步校验、异步提交状态、避免重复提交和可访问性。


## Q132 · 实现一个 Tab Bar 组件。

### 题目描述
请使用 React 实现一个 Tab Bar。

输入：

```ts
[
  { key: 'overview', label: 'Overview', content: <Overview /> },
  { key: 'reviews', label: 'Reviews', content: <Reviews /> }
]
```

要求：
1. 点击 Tab 切换内容。
2. 只能有一个 active tab。
3. 支持键盘 `ArrowLeft / ArrowRight` 切换焦点，`Home / End` 跳到首尾。
4. 使用 `role="tablist"`、`role="tab"`、`role="tabpanel"`。
5. 正确维护 `aria-selected`、`aria-controls` 和 `tabIndex`。
6. 不使用第三方组件库。





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S35]\(https\://www\.reddit.com/r/leetcode/comments/1jqqtak/amazon_frontend_engineer_ii_rejected/)



### 答案
```tsx
import { ReactNode, useRef, useState } from 'react'

type Tab = {
  key: string
  label: string
  content: ReactNode
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0)
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const moveFocus = (index: number) => {
    const next = (index + tabs.length) % tabs.length
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <>
      <div role="tablist" aria-label="Sections">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            ref={el => {
              refs.current[index] = el
            }}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={active === index}
            aria-controls={`panel-${tab.key}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') moveFocus(active + 1)
              if (e.key === 'ArrowLeft') moveFocus(active - 1)
              if (e.key === 'Home') moveFocus(0)
              if (e.key === 'End') moveFocus(tabs.length - 1)
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`panel-${tabs[active].key}`}
        role="tabpanel"
        aria-labelledby={`tab-${tabs[active].key}`}
      >
        {tabs[active].content}
      </div>
    </>
  )
}
```

核心是把“当前选中项”和“可聚焦项”保持一致，并使用 roving `tabIndex`。


## Q133 · 接雨水：给定非负整数数组表示柱状图高度，计算能够接住的雨水量。

### 题目描述
给定 `n` 个非负整数表示柱状图中每根柱子的高度，每根柱子的宽度为 `1`。计算下雨后能够接住多少单位的雨水。

示例：

```ts
trap([0,1,0,2,1,0,1,3,2,1,2,1]) // 6
trap([4,2,0,3,2,5])              // 9
```

要求：
1. 先说明暴力/前后缀最大值方案。
2. 最终实现 `O(n)` 时间、`O(1)` 额外空间的双指针解法。





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S35]\(https\://www\.reddit.com/r/leetcode/comments/1jqqtak/amazon_frontend_engineer_ii_rejected/)



### 答案
```ts
function trap(height: number[]): number {
  let left = 0
  let right = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0

  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left])
      water += leftMax - height[left]
      left++
    } else {
      rightMax = Math.max(rightMax, height[right])
      water += rightMax - height[right]
      right--
    }
  }

  return water
}
```

双指针维护左右两侧已经看到的最高柱子。较矮的一侧可以立即确定当前位置能接多少水。

时间复杂度 `O(n)`，空间复杂度 `O(1)`。

## Q134 · 实现一个 Star Rating 评分组件。

### 题目描述
请使用 React 实现一个可交互的 Star Rating 组件。

要求：
1. 默认 5 颗星，最大星数可配置。
2. 点击某颗星后设置评分。
3. 鼠标 hover 时临时预览评分，移出后恢复已选评分。
4. 支持键盘操作。
5. 对屏幕阅读器有可访问名称。
6. 支持受控写法：

```tsx
<StarRating value={3} onChange={setValue} max={5} />
```





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S35]\(https\://www\.reddit.com/r/leetcode/comments/1jqqtak/amazon_frontend_engineer_ii_rejected/)



### 答案
```tsx
import { useState } from 'react'

export function StarRating({
  value,
  onChange,
  max = 5
}: {
  value: number
  onChange: (value: number) => void
  max?: number
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const displayValue = hovered ?? value

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const score = i + 1

        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} star${score > 1 ? 's' : ''}`}
            onMouseEnter={() => setHovered(score)}
            onClick={() => onChange(score)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                onChange(Math.min(max, value + 1))
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                onChange(Math.max(1, value - 1))
              }
            }}
          >
            {score <= displayValue ? '★' : '☆'}
          </button>
        )
      })}
    </div>
  )
}
```

需要区分：
- 已确认值 `value`
- 临时 hover 值 `hovered`

否则鼠标移出时无法恢复用户真正选择的评分。


## Q135 · 前端系统设计：为移动设备设计一个数学选择题游戏。

### 题目描述
前端系统设计：为移动设备设计一个数学选择题游戏。 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S35]\(https\://www\.reddit.com/r/leetcode/comments/1jqqtak/amazon_frontend_engineer_ii_rejected/)



### 答案
先确认题目来源、计时、离线与登录要求；再拆分题目、选项、进度、结果组件和状态机。处理预取、断网恢复、幂等提交、本地进度持久化、触控与无障碍，并定义正确率、完成率和延迟指标。


## Q136 · 实现相对时间组件：接收日期并显示“不到 10 秒、N 分钟前、N 小时前”等，且只在文案需要变化时更新。

### 题目描述
实现一个 React 相对时间组件 `<RelativeTime date={date} />`。

显示规则：
- `< 10 秒`：`just now`
- `< 60 秒`：`N seconds ago`
- `< 60 分钟`：`N minutes ago`
- `< 24 小时`：`N hours ago`
- 其他：`N days ago`

额外要求：不能简单每秒固定 `setInterval` 刷新。应该计算“当前文案下一次什么时候会变化”，只在需要时更新。

请给出核心实现，并说明如何清理 timer。





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S35]\(https\://www\.reddit.com/r/leetcode/comments/1jqqtak/amazon_frontend_engineer_ii_rejected/)



### 答案
```tsx
import { useEffect, useState } from 'react'

function getRelativeTime(date: Date) {
  const diff = Math.max(0, Date.now() - date.getTime())
  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < 10 * second) {
    return {
      text: 'just now',
      nextUpdate: 10 * second - diff
    }
  }

  if (diff < minute) {
    const value = Math.floor(diff / second)
    return {
      text: `${value} seconds ago`,
      nextUpdate: second - (diff % second)
    }
  }

  if (diff < hour) {
    const value = Math.floor(diff / minute)
    return {
      text: `${value} minutes ago`,
      nextUpdate: minute - (diff % minute)
    }
  }

  if (diff < day) {
    const value = Math.floor(diff / hour)
    return {
      text: `${value} hours ago`,
      nextUpdate: hour - (diff % hour)
    }
  }

  const value = Math.floor(diff / day)

  return {
    text: `${value} days ago`,
    nextUpdate: day - (diff % day)
  }
}

export function RelativeTime({ date }: { date: Date }) {
  const [, forceUpdate] = useState(0)
  const { text, nextUpdate } = getRelativeTime(date)

  useEffect(() => {
    const timer = setTimeout(
      () => forceUpdate(v => v + 1),
      Math.max(1, nextUpdate)
    )

    return () => clearTimeout(timer)
  }, [date.getTime(), text, nextUpdate])

  return <time dateTime={date.toISOString()}>{text}</time>
}
```

关键不是高频轮询，而是计算下一个“显示边界”，例如 `12 minutes ago` 到 `13 minutes ago` 之间只需要等待剩余的分钟数。


# 腾讯 2026 新增真题
## Q137 · \`requestAnimationFrame\` 的执行时机和调度原理是什么？

### 题目描述
\`requestAnimationFrame\` 的执行时机和调度原理是什么？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：腾讯 ｜ 年份：2026 ｜ 来源：[S36]\(https\://www\.nowcoder.com/feed/main/detail/86842afbbbeb4c36a06a822ed91603b3)



### 答案
浏览器通常在下一次绘制前执行回调，使视觉更新与刷新节奏对齐；同一帧回调共享时间戳，后台页可能暂停或降频。它不是固定间隔定时器，持续动画需在回调中再次注册；回调过重仍会阻塞主线程并造成掉帧。


## Q138 · 如何验证 \`prefetch\` 是否真正生效？

### 题目描述
如何验证 \`prefetch\` 是否真正生效？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯 ｜ 年份：2026 ｜ 来源：[S36]\(https\://www\.nowcoder.com/feed/main/detail/86842afbbbeb4c36a06a822ed91603b3)



### 答案
在 DevTools Network 中检查预取请求的 Initiator、优先级和时序，再触发目标导航，观察资源是否来自 memory/disk cache、传输字节是否接近 0；也可用 Resource Timing 或服务端日志交叉验证。\`prefetch\` 只是浏览器提示，网络、缓存策略或浏览器决策都可能使其不执行。


## Q139 · 为什么用 LCP 衡量加载体验？它的测量终点固定吗？

### 题目描述
为什么用 LCP 衡量加载体验？它的测量终点固定吗？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：腾讯 ｜ 年份：2026 ｜ 来源：[S36]\(https\://www\.nowcoder.com/feed/main/detail/86842afbbbeb4c36a06a822ed91603b3)



### 答案
LCP 关注视口内最大内容元素何时完成渲染，比单看首字节或首个像素更接近用户感知的主体内容加载。候选元素会随更大内容出现而更新，并非页面打开时就固定；通常在首次输入、滚动或页面进入后台等时机停止报告，线上应通过 \`PerformanceObserver\` 采集并看 P75。


## Q140 · 对单链表排序时，为什么通常选择归并排序？如何实现？

### 题目描述
给定单链表头节点 `head`，请按升序排序链表并返回新的头节点。

要求：
1. 时间复杂度 `O(n log n)`。
2. 尽量减少额外空间。
3. 解释为什么链表排序通常选择归并排序，而不是快速排序。
4. 请实现“快慢指针找中点 + 递归归并”的版本。

示例：

```text
4 -> 2 -> 1 -> 3
```

输出：

```text
1 -> 2 -> 3 -> 4
```





> 公司：腾讯 ｜ 年份：2026 ｜ 来源：[S36]\(https\://www\.nowcoder.com/feed/main/detail/86842afbbbeb4c36a06a822ed91603b3)



### 答案
```ts
type ListNode = {
  val: number
  next: ListNode | null
}

function sortList(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head

  let slow: ListNode = head
  let fast: ListNode | null = head.next

  while (fast && fast.next) {
    slow = slow.next!
    fast = fast.next.next
  }

  const right = slow.next
  slow.next = null

  const leftSorted = sortList(head)
  const rightSorted = sortList(right)

  return mergeList(leftSorted, rightSorted)
}

function mergeList(
  a: ListNode | null,
  b: ListNode | null
): ListNode | null {
  const dummy: ListNode = { val: 0, next: null }
  let current = dummy

  while (a && b) {
    if (a.val <= b.val) {
      current.next = a
      a = a.next
    } else {
      current.next = b
      b = b.next
    }
    current = current.next
  }

  current.next = a ?? b
  return dummy.next
}
```

链表不适合随机访问，因此归并排序比快速排序更自然。快慢指针拆链表，递归排序左右两部分，再线性合并。

时间复杂度 `O(n log n)`，递归栈空间 `O(log n)`。

## Q141 · RAG 为什么采用父子分块，而不是只使用普通滑动窗口？

### 题目描述
RAG 为什么采用父子分块，而不是只使用普通滑动窗口？ 请先给结论，再解释原理，并补充常见使用场景或容易混淆的点。



> 公司：腾讯 ｜ 年份：2026 ｜ 来源：[S36]\(https\://www\.nowcoder.com/feed/main/detail/86842afbbbeb4c36a06a822ed91603b3)



### 答案
用较小的子块做向量检索可提高命中精度，命中后返回其较大的父块，为生成阶段补回上下文。滑动窗口实现简单，但重叠内容会增加索引成本、产生重复结果，窗口过小又容易切断语义。选择应通过召回率、答案忠实度、上下文长度、延迟和成本实验验证。


## Q142 · 复杂交互画布在 DOM、SVG 和 Canvas 之间如何选型？

### 题目描述
复杂交互画布在 DOM、SVG 和 Canvas 之间如何选型？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：腾讯 ｜ 年份：2026 ｜ 来源：[S36]\(https\://www\.nowcoder.com/feed/main/detail/86842afbbbeb4c36a06a822ed91603b3)



### 答案
DOM 适合数量较少、内容复杂且强调可访问性和原生交互的节点；SVG 适合中等数量的矢量图元和逐元素事件；Canvas 适合大量图元及高频重绘，但命中检测、文本编辑和无障碍需自行实现。实际常采用混合架构：Canvas/SVG 绘主体，DOM 承担输入框、菜单和无障碍层，并结合可视区域裁剪与分层缓存。


## Q143 · 低代码或绘图平台的自动吸附能力如何实现？

### 题目描述
假设你在实现一个流程图 / 低代码画布。用户拖动一个节点时，当它接近另一个节点的边缘或中心线，需要出现辅助线并自动吸附。

请设计这个功能，并回答：
1. 如何表示节点的位置和边界框。
2. 拖动时如何计算候选吸附线。
3. 如何定义吸附阈值。
4. 多个候选同时命中时如何选择。
5. 节点很多时，如何避免每次 mousemove 都遍历所有节点。
6. 如何处理缩放、画布坐标转换和性能问题。





> 公司：腾讯 ｜ 年份：2026 ｜ 来源：[S36]\(https\://www\.nowcoder.com/feed/main/detail/86842afbbbeb4c36a06a822ed91603b3)



### 答案
拖拽时计算当前元素的边、中心线和候选参考线，通过网格、R-tree 或四叉树查询阈值内的邻近元素；选出最小偏移量，修正坐标并绘制辅助线。吸附阈值应按缩放比例换算为屏幕像素，处理多候选优先级、迟滞和取消吸附；计算可放入 \`requestAnimationFrame\`，避免每次 pointermove 全量扫描。


## Q144 · 判断下面代码的输出，并解释字符串原始值和包装对象的区别。

### 题目描述
判断下面代码的输出，并解释原因：

```ts
const a = 'hello'
const b = new String('hello')
const c = String('hello')

console.log(typeof a)
console.log(typeof b)
console.log(typeof c)

console.log(a === b)
console.log(a == b)
console.log(Boolean(new String('')))
```

继续回答：
1. 字符串原始值与 `String` 包装对象有什么区别？
2. 为什么 `'abc'.toUpperCase()` 可以调用方法？
3. 为什么业务代码通常不建议主动使用 `new String()`？





> 公司：小红书 ｜ 年份：2026 ｜ 来源：[S37]\(https\://www\.nowcoder.com/feed/main/detail/c16f687faa3944aaa7004e619d5319ad)



### 答案
输出：

```text
string
object
string
false
true
true
```

解释：
- `'hello'` 是字符串原始值，因此 `typeof a === 'string'`。
- `new String('hello')` 创建的是对象，因此 `typeof b === 'object'`。
- `String('hello')` 不带 `new`，执行类型转换，结果仍是原始字符串。
- `a === b` 不会做类型转换，原始值和对象不相等。
- `a == b` 会发生抽象相等比较，包装对象会先转换成原始值，因此结果为 `true`。
- 所有对象都是真值，包括 `new String('')`。

原始字符串调用方法时，JavaScript 会临时进行装箱，让它可以访问 `String.prototype` 上的方法，调用结束后临时对象即可被丢弃。

因此通常不要主动创建 `new String()`，否则会引入 `typeof`、严格相等和真假判断等容易踩坑的行为。


## Q145 · SSR、SPA 和 MPA 分别是什么？如何根据业务场景选择？

### 题目描述
SSR、SPA 和 MPA 分别是什么？如何根据业务场景选择？ 回答时说明核心原理、关键步骤、常见边界/异常场景，以及实际工程中的取舍。



> 公司：小红书 ｜ 年份：2026 ｜ 来源：[S37]\(https\://www\.nowcoder.com/feed/main/detail/c16f687faa3944aaa7004e619d5319ad)



### 答案
SSR 在服务端生成首屏 HTML，再在浏览器 hydrate，适合重视 SEO 和首屏体验的内容页，但增加服务端成本与同构复杂度。SPA 首次加载应用壳，之后由前端路由局部更新，交互连续，适合后台和高交互应用，但需处理首屏体积与 SEO。MPA 每次导航请求新的 HTML 文档，页面隔离和渐进增强较简单，适合内容相对独立的站点；大型产品也可按页面采用混合渲染。


## Q146 · 前端低层设计：设计一个可扩展的搜索自动补全（Autocomplete）功能。

### 题目描述
设计并实现一个可扩展的搜索自动补全（Autocomplete）。

用户输入关键字时向服务端请求候选项：

```ts
GET /search?q=rea
```

要求：
1. 输入变化后做 debounce，避免每个按键都请求。
2. 至少输入 2 个字符才请求。
3. 新请求发出时取消旧请求，避免无意义网络开销。
4. 即使旧请求晚于新请求返回，也不能覆盖新结果。
5. 支持 loading / error / empty 状态。
6. 支持键盘上下选择、Enter 确认、Escape 关闭。
7. 最近查询可做缓存。
8. 说明大规模系统下还可以如何做缓存、埋点和性能优化。

请给出前端核心状态设计和关键代码。





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S38]\(https\://leetcode.com/discuss/post/6722147/amazon-frontend-engineer-2-loop-intervie-erez/)



### 答案
核心状态：

```ts
query
items
status: 'idle' | 'loading' | 'success' | 'error'
activeIndex
```

核心请求逻辑：

```ts
let requestId = 0
let controller: AbortController | null = null

async function search(query: string) {
  if (query.trim().length < 2) {
    return []
  }

  const currentId = ++requestId

  controller?.abort()
  controller = new AbortController()

  const response = await fetch(
    `/search?q=${encodeURIComponent(query)}`,
    { signal: controller.signal }
  )

  const data = await response.json()

  if (currentId !== requestId) {
    return null
  }

  return data
}
```

输入层再套一层 debounce：

```ts
const debouncedSearch = debounce(search, 250)
```

为什么同时需要 AbortController 和 requestId：
- `abort` 用于尽量停止旧请求；
- requestId 用于保证即使旧请求无法及时取消或已经返回，也不会覆盖新状态。

缓存可以使用 `Map<query, result>`，加 TTL/LRU 防止无限增长。生产系统还应考虑服务端限流、热门查询缓存、输入法 composition、键盘可访问性以及搜索转化埋点。


## Q147 · 实现 Amazon 订单历史列表：向下滚动时持续加载旧订单。

### 题目描述
使用 React 实现一个订单历史列表。服务端提供游标分页接口：

```ts
GET /orders?cursor=xxx

{
  items: Order[],
  nextCursor: string | null
}
```

要求：
1. 首次进入页面加载第一批订单。
2. 用户向下滚动接近列表底部时自动加载下一页。
3. 同一页不能重复请求。
4. 请求进行中不能重复触发加载。
5. `nextCursor === null` 时停止加载。
6. 请求失败后允许重试。
7. 订单很多时说明如何避免 DOM 无限增长。
8. 优先使用 `IntersectionObserver`，不要直接高频监听 scroll。





> 公司：Amazon ｜ 年份：2025 ｜ 来源：[S38]\(https\://leetcode.com/discuss/post/6722147/amazon-frontend-engineer-2-loop-intervie-erez/)



### 答案
核心实现：

```tsx
import { useEffect, useRef, useState } from 'react'

function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [cursor, setCursor] = useState<string | null | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = async () => {
    if (loading || cursor === null) return

    setLoading(true)

    try {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
      const response = await fetch(`/orders${query}`)
      const page = await response.json()

      setOrders(prev => [...prev, ...page.items])
      setCursor(page.nextCursor)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    }, {
      rootMargin: '300px'
    })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, cursor])

  return (
    <>
      {orders.map(order => (
        <OrderRow key={order.id} order={order} />
      ))}

      {cursor !== null && <div ref={sentinelRef} />}
      {loading && <p>Loading...</p>}
    </>
  )
}
```

实际面试中还应补充：
- 使用 cursor 比深分页 offset 更稳定；
- 对 `id` 去重，避免后端数据变化导致重复项；
- 超长列表配合虚拟列表；
- 请求失败维护 error 状态和 Retry；
- 可预取下一页，但要限制并发和缓存大小。


## Q148 · 实现一个支持链式调用的 \`UberDriver\`：调用顺序可以任意，但 \`coffeeBreak()\` 必须最先执行，其余任务按声明顺序异步执行。

### 题目描述
实现下面的链式 API：

```ts
new UberDriver('Tom')
  .drive('A')
  .coffeeBreak(1000)
  .drive('B')
```

规则：
1. 所有链式方法调用本身必须同步返回 `this`。
2. 普通任务按照声明顺序执行。
3. `coffeeBreak(ms)` 无论写在链的哪个位置，都必须在所有普通任务之前执行。
4. `coffeeBreak` 完成后，再依次执行普通任务。
5. 任务是异步的，整个执行过程不能阻塞线程。
6. 链式调用结束后自动开始执行，不要求显式调用 `.run()`。

请实现一个最小可运行版本，并解释为什么需要“先收集任务，再执行”。





> 公司：Uber ｜ 年份：2025 ｜ 来源：[S39]\(https\://leetcode.com/discuss/post/7076760/)



### 答案
```ts
class UberDriver {
  private priorityTasks: Array<() => Promise<void>> = []
  private tasks: Array<() => Promise<void>> = []
  private started = false

  constructor(private name: string) {
    queueMicrotask(() => this.start())
  }

  drive(destination: string) {
    this.tasks.push(async () => {
      console.log(`${this.name} drives to ${destination}`)
    })

    return this
  }

  coffeeBreak(ms: number) {
    this.priorityTasks.push(async () => {
      console.log('coffee break')
      await new Promise(resolve => setTimeout(resolve, ms))
    })

    return this
  }

  private async start() {
    if (this.started) return
    this.started = true

    const queue = [
      ...this.priorityTasks,
      ...this.tasks
    ]

    for (const task of queue) {
      await task()
    }
  }
}
```

为什么用 `queueMicrotask`：
构造函数执行完后，当前同步链式调用还会继续：

```ts
new UberDriver().drive().coffeeBreak().drive()
```

把真正执行推迟到微任务，就可以先把整个同步调用链中的任务收集完成，再按照最终优先级排序执行。

如果题目要求多个 `coffeeBreak` 之间仍保持声明顺序，上面的 `priorityTasks.push` 已经满足。


## Q149 · 实现有向无环图的拓扑排序（Kahn 算法）。如果图中存在环，应如何检测？

### 题目描述
给定有向图的节点数 `numNodes` 和边集合 `edges`，实现 Kahn 算法返回一个拓扑排序。

```ts
topologicalSort(
  4,
  [[0,1], [0,2], [1,3], [2,3]]
)
// 例如 [0,1,2,3]
```

要求：
1. 图中可能存在多个入度为 0 的节点。
2. 一个 DAG 可能有多个合法拓扑序，返回任意一个即可。
3. 如果图中存在环，返回空数组。
4. 时间复杂度要求 `O(V + E)`。





> 公司：Uber ｜ 年份：2025 ｜ 来源：[S39]\(https\://leetcode.com/discuss/post/7076760/)



### 答案
```ts
function topologicalSort(n: number, edges: number[][]): number[] {
  const graph: number[][] = Array.from({ length: n }, () => [])
  const indegree: number[] = new Array(n).fill(0)

  for (const [from, to] of edges) {
    graph[from].push(to)
    indegree[to]++
  }

  const queue: number[] = []

  for (let i = 0; i < n; i++) {
    if (indegree[i] === 0) {
      queue.push(i)
    }
  }

  const result: number[] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)

    for (const next of graph[node]) {
      indegree[next]--
      if (indegree[next] === 0) {
        queue.push(next)
      }
    }
  }

  return result.length === n ? result : []
}
```

Kahn 算法不断删除入度为 `0` 的节点。如果最终处理的节点数少于 `n`，说明剩余节点形成了环。

时间复杂度 `O(V+E)`，空间复杂度 `O(V+E)`。

## Q150 · 使用 DFS 检测有向图中是否存在环，并解释为什么只使用 \`visited\` 集合不够。

### 题目描述
给定一个有向图，请使用 DFS 判断图中是否存在环。

要求：
1. 图可能不连通，需要从所有未访问节点开始 DFS。
2. 不能只使用一个 `visited` 集合。
3. 请解释为什么“访问过”不等于“当前 DFS 路径中的祖先”。
4. 时间复杂度要求 `O(V + E)`。

建议使用三色状态：
- `0`：未访问
- `1`：正在当前递归路径中
- `2`：已经完成





> 公司：Uber ｜ 年份：2025 ｜ 来源：[S39]\(https\://leetcode.com/discuss/post/7076760/)



### 答案
```ts
function hasCycle(graph: number[][]): boolean {
  const state: number[] = new Array(graph.length).fill(0)
  // 0 = 未访问，1 = 当前递归路径中，2 = 已完成

  function dfs(node: number): boolean {
    if (state[node] === 1) return true
    if (state[node] === 2) return false

    state[node] = 1

    for (const next of graph[node]) {
      if (dfs(next)) return true
    }

    state[node] = 2
    return false
  }

  for (let i = 0; i < graph.length; i++) {
    if (state[i] === 0 && dfs(i)) {
      return true
    }
  }

  return false
}
```

只使用 `visited` 无法区分“这个节点以前访问过”还是“这个节点正在当前 DFS 路径中”。有向图只有遇到当前递归路径中的节点，才能说明存在环。

## Q151 · 在限定时间内使用 React、JavaScript 和 CSS 实现一个完整的 TodoMVC 应用。

### 题目描述
请在 45～60 分钟内使用 React + JavaScript/TypeScript + CSS 实现一个 TodoMVC。

最低要求：
1. 新增 Todo。
2. 展示 Todo 列表。
3. 标记完成/未完成。
4. 删除 Todo。
5. 双击编辑 Todo，Enter 保存，Escape 取消。
6. 支持 All / Active / Completed 过滤。
7. 显示剩余未完成数量。
8. Clear completed。
9. 输入为空时不能新增。
10. 每个 Todo 使用稳定 id，不能用数组下标作为业务 id。

加分项：
- localStorage 持久化；
- 全选/取消全选；
- 基本键盘可访问性；
- 组件拆分合理，不要过度拆分。

请说明状态结构，并写出核心 reducer/组件逻辑。





> 公司：Apollo.io ｜ 年份：2025 ｜ 来源：[S40]\(https\://leetcode.com/discuss/post/7003517/apolloio-frontend-engineer-wastage-of-ti-yz6d/)



### 答案
推荐状态：

```ts
type Todo = {
  id: string
  text: string
  completed: boolean
}

type State = {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}
```

核心 reducer：

```ts
type Action =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'edit'; id: string; text: string }
  | { type: 'clearCompleted' }
  | { type: 'setFilter'; filter: State['filter'] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const text = action.text.trim()
      if (!text) return state

      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: crypto.randomUUID(),
            text,
            completed: false
          }
        ]
      }
    }

    case 'toggle':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }

    case 'remove':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.id)
      }

    case 'edit':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id
            ? { ...todo, text: action.text.trim() }
            : todo
        )
      }

    case 'clearCompleted':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      }

    case 'setFilter':
      return {
        ...state,
        filter: action.filter
      }
  }
}
```

派生数据不要重复存状态：

```ts
const visibleTodos = state.todos.filter(todo => {
  if (state.filter === 'active') return !todo.completed
  if (state.filter === 'completed') return todo.completed
  return true
})

const remaining = state.todos.filter(todo => !todo.completed).length
```

面试重点通常不是 CSS，而是状态建模、编辑态处理、稳定 key、派生状态和交互完整性。


## Q152 · 给定一份 JSON 数据，使用 React 渲染列表，并继续实现搜索和排序。

### 题目描述
给定一份 JSON 数据：

```ts
[
  { "id": 1, "name": "Alice", "age": 30 },
  { "id": 2, "name": "Bob", "age": 24 },
  { "id": 3, "name": "Charlie", "age": 35 }
]
```

请使用 React：
1. 渲染列表。
2. 增加一个输入框，根据 `name` 实时搜索。
3. 支持按 `name` 和 `age` 排序。
4. 再次点击同一列时在升序/降序之间切换。
5. 搜索和排序可以组合使用。
6. 不要把“过滤后的列表”重复存进 state，应从原始数据派生。
7. 数据量较大时说明如何避免每次 render 重复昂贵计算。





> 公司：Datadog ｜ 年份：2025 ｜ 来源：[S41]\(https\://leetcode.com/discuss/post/7080135/)



### 答案
```tsx
import { useMemo, useState } from 'react'

type User = {
  id: number
  name: string
  age: number
}

type SortKey = 'name' | 'age'

export function UserList({ users }: { users: User[] }) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

  const visibleUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return users
      .filter(user =>
        user.name.toLowerCase().includes(normalized)
      )
      .sort((a, b) => {
        const result =
          sortKey === 'name'
            ? a.name.localeCompare(b.name)
            : a.age - b.age

        return direction === 'asc' ? result : -result
      })
  }, [users, query, sortKey, direction])

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection(v => (v === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDirection('asc')
    }
  }

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name"
      />

      <button onClick={() => changeSort('name')}>Sort name</button>
      <button onClick={() => changeSort('age')}>Sort age</button>

      <ul>
        {visibleUsers.map(user => (
          <li key={user.id}>
            {user.name} - {user.age}
          </li>
        ))}
      </ul>
    </>
  )
}
```

这里 `visibleUsers` 是由 `users/query/sort` 派生的数据，不应单独维护一份 state，否则容易产生状态不同步。数据量较大时可使用 `useMemo`；更大数据应改成服务端搜索/排序或虚拟列表。


## Q153 · 判断一个缩写是否是给定单词的有效缩写（Valid Word Abbreviation）。

### 题目描述
给定一个单词 `word` 和缩写 `abbr`，判断 `abbr` 是否是 `word` 的合法缩写。

缩写规则：
- 数字表示跳过对应数量的字符；
- 数字不能以 `0` 开头；
- 数字可以有多位；
- 字母必须和原单词当前位置完全匹配。

示例：

```ts
validWordAbbreviation(
  'internationalization',
  'i12iz4n'
) // true

validWordAbbreviation('apple', 'a2e') // false
validWordAbbreviation('apple', 'a01e') // false
```

要求时间复杂度 `O(word.length + abbr.length)`，额外空间 `O(1)`。





> 公司：Datadog ｜ 年份：2025 ｜ 来源：[S41]\(https\://leetcode.com/discuss/post/7080135/)



### 答案
```ts
function validWordAbbreviation(word: string, abbr: string): boolean {
  let i = 0
  let j = 0

  while (i < word.length && j < abbr.length) {
    if (/[a-zA-Z]/.test(abbr[j])) {
      if (word[i] !== abbr[j]) return false
      i++
      j++
      continue
    }

    if (abbr[j] === '0') return false

    let num = 0

    while (j < abbr.length && /\d/.test(abbr[j])) {
      num = num * 10 + Number(abbr[j])
      j++
    }

    i += num
  }

  return i === word.length && j === abbr.length
}
```

遇到字母就逐字符匹配；遇到数字就解析完整数字并跳过对应数量的字符。数字不能以 `0` 开头。

时间复杂度 `O(word.length + abbr.length)`，空间复杂度 `O(1)`。

