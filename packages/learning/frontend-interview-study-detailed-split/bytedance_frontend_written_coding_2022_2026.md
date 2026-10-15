# 字节跳动前端近 5 年公开面经笔试 / 手写题汇总（2022–2026）

> 范围：字节跳动 / 抖音 / 飞书 / TikTok 前端岗位公开面经中，能够检索并确认来源的笔试、手写、代码输出、CSS / UI Coding 题。
>
> 时间范围：2022–2026。
>
> 说明：
>
> 1. “所有”指当前公开网络中可检索、可确认来源的题目集合，不代表字节内部完整题库。
> 2. 同一道题多次出现时合并，并记录多个年份 / 来源。
> 3. 原面经如果只给了题目名称，没有完整输入输出，我会按真实面试风格补全题干，并标记“题干补全”。
> 4. 本文优先保留前端相关手写题；纯 LeetCode 算法单独放到最后。
> 5. 建议优先掌握 ★★★★★ 和 ★★★★☆。

---

# 一、JavaScript / TypeScript 手写

## Q001 · 手写 Promise.all

> 出现年份：2022、2023、2024、2025，多次出现  
> 来源：字节前端 / 飞书 / 社招 / 实习面经  
> 频率：★★★★★

### 完整题目

请手写实现一个 `myPromiseAll`，行为尽量与原生 `Promise.all` 一致。

要求：

1. 接收一个可迭代的 Promise / 普通值集合。
2. 普通值需要通过 `Promise.resolve` 处理。
3. 所有任务成功后，返回结果数组。
4. 结果顺序必须和输入顺序一致，而不是和完成顺序一致。
5. 任意一个任务 reject，整体立即 reject。
6. 空数组应 resolve 为 `[]`。

示例：

```ts
myPromiseAll([
  Promise.resolve(1),
  2,
  new Promise(resolve => setTimeout(() => resolve(3), 100))
]).then(console.log)

// [1, 2, 3]
```

### 常见追问

- 为什么不能直接 `result.push(value)`？
- 某个 Promise reject 后，其余 Promise 会被取消吗？
- 空数组结果是什么？
- Promise.allSettled 和 Promise.all 区别？

### 来源记录

- 2022 字节飞书前端实习：手写 `Promise.all`
- 2022 字节前端一面：手写 `Promise.all`
- 2023 字节商业化前端：手写 `Promise.all`
- 2024 字节前端日常实习：手写 `Promise.all`
- 2025 字节前端一面：手写 `PromiseAll`

---

## Q002 · 手写 Promise.race

> 出现年份：2026  
> 来源：飞书前端开发面经  
> 频率：★★★★☆

### 完整题目

实现：

```ts
function myPromiseRace(values: any[]): Promise<any>
```

要求：

1. 输入可以包含 Promise 和普通值。
2. 第一个进入 settled 状态的任务决定最终结果。
3. fulfilled 则整体 fulfilled。
4. rejected 则整体 rejected。
5. 空数组返回的 Promise 保持 pending。

示例：

```ts
myPromiseRace([
  new Promise(resolve => setTimeout(() => resolve('slow'), 1000)),
  new Promise(resolve => setTimeout(() => resolve('fast'), 100))
]).then(console.log)

// fast
```

### 常见追问

- `Promise.race` 和 `Promise.any` 区别？
- 如何用 `Promise.race` 实现 timeout？

---

## Q003 · 手写防抖 debounce

> 出现年份：2022、2024、2026  
> 来源：飞书前端、字节业务中台、抖音生活服务  
> 频率：★★★★★

### 完整题目

实现：

```ts
function debounce(fn, delay) {}
```

要求：

1. 高频触发时不断重新计时。
2. 用户停止触发超过 `delay` 后，只执行最后一次。
3. 参数需要透传。
4. 保留调用时的 `this`。

示例：

```ts
const search = debounce((keyword: string) => {
  console.log(keyword)
}, 300)

search('r')
search('re')
search('react')

// 300ms 后只输出 react
```

### 常见追问

- 为什么需要保留 `this`？
- 如何支持 leading？
- 如何实现 cancel？
- debounce 和 throttle 区别？

---

## Q004 · 手写节流 throttle

> 出现年份：近 5 年公开汇总中持续出现  
> 来源：字节前端高频面经汇总  
> 频率：★★★★☆

### 完整题目

实现：

```ts
function throttle(fn, delay) {}
```

要求：

1. 高频调用过程中，每 `delay` 时间最多执行一次。
2. 参数透传。
3. 保留 `this`。
4. 可以使用时间戳或 timer 实现。

### 常见追问

- 时间戳版本和 timer 版本差别？
- leading / trailing 怎么实现？
- 第一次调用应该立即执行还是延迟执行？

---

## Q005 · 手写并发控制 Scheduler / batchTask

> 出现年份：2022、2026，多次出现  
> 来源：字节前端经典题、2026 字节前端实习  
> 频率：★★★★★

### 完整题目

实现一个异步任务调度器：

```ts
class Scheduler {
  constructor(limit: number)

  add<T>(task: () => Promise<T>): Promise<T>
}
```

或者：

```ts
function batchTask(
  tasks: Array<() => Promise<any>>,
  num: number
): Promise<any[]>
```

要求：

1. 同一时刻最多运行 `num` 个任务。
2. 超出的任务进入等待队列。
3. 一个任务结束后，立即补充新的任务。
4. 单个任务 reject 不应该阻塞整个调度器继续运行。
5. `add` 返回对应任务的结果。

示例：

```text
limit = 2

task1 start
task2 start
task1 end
task3 start
task2 end
task4 start
```

### 常见追问

- `runNext` 为什么用 `while`？
- `active++` 应该在哪里发生？
- 如何保持最终结果顺序？
- 如何增加 priority？

---

## Q006 · 手写 promisify

> 出现年份：2026  
> 来源：飞书前端开发  
> 频率：★★★★☆

### 完整题目

把 Node.js 风格的 error-first callback API：

```ts
function readFile(
  path: string,
  callback: (err: Error | null, data?: string) => void
) {}
```

转换为：

```ts
const readFileAsync = promisify(readFile)

await readFileAsync('a.txt')
```

实现：

```ts
function promisify(fn) {}
```

要求：

1. 参数正常透传。
2. callback 的 `err` 有值时 reject。
3. 成功时 resolve。
4. 保留调用者 `this`。
5. 如果原函数同步 throw，也应该让返回 Promise reject。

---

## Q007 · 手写 Array.prototype.flat / 数组扁平化

> 出现年份：2022、2025  
> 来源：字节前端实习、2025 字节前端一面  
> 频率：★★★★★

### 完整题目

不使用原生：

```ts
Array.prototype.flat
```

实现数组扁平化。

基础版：

```ts
flatten([1, [2, [3, 4]], 5])
```

返回：

```ts
[1, 2, 3, 4, 5]
```

进阶版支持层级：

```ts
flat([1, [2, [3, 4]]], 1)
// [1, 2, [3, 4]]

flat([1, [2, [3, 4]]], 2)
// [1, 2, 3, 4]
```

### 常见追问

- 递归怎么写？
- `reduce` 怎么写？
- 如何支持 `depth`？
- 时间复杂度是多少？

---

## Q008 · 用 reduce 实现 map

> 出现年份：2024  
> 来源：字节前端日常实习  
> 频率：★★★★☆

### 完整题目

不使用原生 `Array.prototype.map`，使用 `reduce` 实现类似 `map` 的功能。

例如：

```ts
myMap([1, 2, 3], x => x * 2)
```

返回：

```ts
[2, 4, 6]
```

可进一步实现：

```ts
Array.prototype.myMap = function (callback) {}
```

要求：

1. 保持元素顺序。
2. callback 能获得当前元素和 index。
3. 返回新数组。
4. 不修改原数组。

---

## Q009 · 手写 reduce

> 出现年份：2025  
> 来源：字节商业化广告前端实习  
> 频率：★★★☆☆

### 完整题目

不调用原生 `reduce`，实现：

```ts
Array.prototype.myReduce = function (
  callback,
  initialValue?
) {}
```

要求考虑：

1. 有 `initialValue`。
2. 没有 `initialValue`。
3. 空数组没有 initialValue 时应该如何处理。
4. callback 参数：
   - accumulator
   - currentValue
   - index
   - array

---

## Q010 · 手写 bind，并处理 new

> 出现年份：2023  
> 来源：字节前端实习  
> 频率：★★★★★

### 完整题目

实现：

```ts
Function.prototype.myBind = function (
  context,
  ...args
) {}
```

要求：

1. 返回新函数。
2. 固定 `this`。
3. 支持预置参数。
4. 支持后续调用参数。
5. 需要考虑：

```ts
const Bound = Person.bind(obj)
const p = new Bound()
```

此时 `new` 的优先级高于绑定的 `context`。

### 常见追问

- `call / apply / bind` 区别？
- 为什么普通 bind 实现遇到 new 会出错？
- `this instanceof boundFn` 有什么用途？

---

## Q011 · 手写 new

> 出现年份：2023  
> 来源：字节商业化前端  
> 频率：★★★★★

### 完整题目

实现：

```ts
function myNew(Ctor, ...args) {}
```

模拟：

```ts
new Ctor(...args)
```

要求：

1. 创建新对象。
2. 新对象原型指向 `Ctor.prototype`。
3. 使用新对象作为 `this` 调用构造函数。
4. 如果构造函数显式返回 object / function，则返回该结果。
5. 否则返回创建的新对象。

---

## Q012 · 手写深拷贝

> 出现年份：社招公开面经  
> 来源：字节前端社招  
> 频率：★★★★☆

### 完整题目

实现 `deepClone`。

要求至少支持：

- Object
- Array
- Date
- RegExp

并考虑循环引用。

例如：

```ts
const obj: any = {
  date: new Date(),
  reg: /abc/g,
  arr: [1, 2]
}

obj.self = obj
```

要求：

```ts
const copied = deepClone(obj)

copied !== obj
copied.arr !== obj.arr
copied.self === copied
```

### 常见追问

- 为什么 WeakMap 适合处理循环引用？
- Map / Set 怎么处理？
- Symbol key 怎么处理？

---

## Q013 · 手写 EventHub / EventBus / 发布订阅

> 出现年份：2022、社招面经  
> 来源：字节成都前端、字节社招  
> 频率：★★★★☆

### 完整题目

实现：

```ts
class EventBus {
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  emit(event: string, ...args: any[]): void
}
```

要求：

1. `on` 订阅事件。
2. `emit` 触发该事件所有 handler。
3. `off` 移除指定 handler。
4. 同一个事件可以有多个 handler。

加分：

```ts
once(event, handler)
```

### 常见追问

- 发布订阅和观察者模式有什么区别？
- 如何避免 emit 过程中删除 handler 导致遍历异常？

---

## Q014 · 列表转树 listToTree

> 出现年份：2024  
> 来源：字节前端日常实习  
> 频率：★★★★☆

### 完整题目

给定：

```ts
const list = [
  { id: 1, parentId: null, name: 'A' },
  { id: 2, parentId: 1, name: 'B' },
  { id: 3, parentId: 1, name: 'C' },
  { id: 4, parentId: 2, name: 'D' }
]
```

转换成：

```ts
[
  {
    id: 1,
    parentId: null,
    name: 'A',
    children: [
      {
        id: 2,
        parentId: 1,
        name: 'B',
        children: [
          {
            id: 4,
            parentId: 2,
            name: 'D',
            children: []
          }
        ]
      },
      {
        id: 3,
        parentId: 1,
        name: 'C',
        children: []
      }
    ]
  }
]
```

要求：

- 尽量做到 O(n)。
- 不要每个节点都重新扫描整个数组。

---

## Q015 · 对对象数组进行深度去重

> 出现年份：2023  
> 来源：字节前端实习二面  
> 频率：★★★☆☆

### 原始题型

给定：

```ts
const arr = [
  { a: 2 },
  { a: 2 },
  { a: 2, b: 1 },
  { a: { b: 1, c: { a: 1 } } },
  { a: { b: 1, c: { a: 1 } } }
]
```

请对数组中的对象去重。

限制：

```text
不能使用 JSON.stringify()
```

需要自行判断两个对象的内容是否相等。

### 常见追问

- key 顺序不同怎么办？
- Array 怎么比较？
- Date / RegExp 怎么比较？
- 循环引用怎么办？

---

## Q016 · 手写 JSX → React.createElement 转换

> 出现年份：2023  
> 来源：字节前端实习二面  
> 频率：★★★☆☆

### 完整题目

给出简单 JSX：

```jsx
<div id="app">
  <span>Hello</span>
</div>
```

请说明 / 手写它应该如何转换为类似：

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

面试可能继续要求：

实现一个简化转换函数，处理：

- tag
- props
- children

不要求完整实现 Babel parser。

---

## Q017 · 日期格式化函数

> 出现年份：2022  
> 来源：字节广告前端实习  
> 频率：★★★☆☆

### 完整题目

实现：

```ts
format(
  new Date('2022-09-06 08:05:03'),
  'YYYY-MM-DD HH:mm:ss'
)
```

返回：

```text
2022-09-06 08:05:03
```

至少支持：

```text
YYYY
MM
DD
HH
mm
ss
```

要求不足两位时补 `0`。

---

## Q018 · 正则匹配手机号 / 邮箱

> 出现年份：2022  
> 来源：字节广告前端实习  
> 频率：★★★☆☆

### 完整题目

分别写一个正则，用于基础校验：

1. 中国大陆手机号。
2. 常见邮箱格式。

例如：

```ts
isPhone('13800138000') // true

isEmail('test@example.com') // true
```

面试重点通常不是覆盖所有 RFC 邮箱情况，而是考察：

- `^` / `$`
- 字符组
- 数量限定
- 转义
- 分组

---

## Q019 · 手写 sleep

> 出现年份：2022  
> 来源：字节抖音前端  
> 频率：★★★☆☆

### 完整题目

实现：

```ts
function sleep(ms: number): Promise<void>
```

使：

```ts
async function run() {
  console.log(1)

  await sleep(1000)

  console.log(2)
}
```

`2` 大约在一秒后输出。

不能阻塞 JS 主线程。

---

## Q020 · 随机字符串

> 出现年份：2022 届公开面经  
> 来源：字节前端  
> 频率：★★☆☆☆

### 完整题目

输入一个整数 `n`：

```ts
randomString(8)
```

返回长度为 `8` 的随机字符串，例如：

```text
aX3pk9Qz
```

字符可以从：

```text
a-z
A-Z
0-9
```

中随机选择。

### 常见追问

- `Math.random()` 是否适合安全 token？
- 如果要求唯一怎么办？

---

## Q021 · 前端版本号排序

> 出现年份：2026  
> 来源：抖音生活服务前端  
> 频率：★★★★☆

### 完整题目

给定版本号：

```ts
[
  '1.2.0',
  '1.10.0',
  '2.0.0',
  '1.2.3'
]
```

请按照版本大小排序。

正确顺序：

```ts
[
  '1.2.0',
  '1.2.3',
  '1.10.0',
  '2.0.0'
]
```

不能直接使用字符串字典序比较，因为：

```text
"1.10.0"
```

应该大于：

```text
"1.2.0"
```

### 加分

如果支持：

```text
1.0.0-alpha
1.0.0-beta
1.0.0
```

说明应该如何比较 prerelease。

---

## Q022 · 交通信号灯状态模拟

> 出现年份：2026  
> 来源：字节前端开发岗  
> 频率：★★★☆☆

### 完整题目（根据面经补全）

有一个交通信号灯：

```text
红灯 3 秒
绿灯 2 秒
黄灯 1 秒
```

不断循环：

```text
红 → 绿 → 黄 → 红
```

请实现状态切换。

一种形式：

```ts
startTrafficLight()
```

按照指定时间输出：

```text
red
green
yellow
red
...
```

另一种可能形式：

```ts
getLight(time)
```

给定已经过去的秒数，返回当前灯的状态。

### 考察点

- Promise / async
- timer
- 状态机
- 循环控制

---

# 二、Event Loop / this / JavaScript 输出题

## Q023 · Event Loop 输出顺序

> 出现年份：2022、2023、2024、2025、2026，持续高频  
> 来源：字节 / 抖音 / 飞书 / TikTok 多份面经  
> 频率：★★★★★

### 完整题型

给出包含：

```ts
console.log
setTimeout
Promise.resolve().then
async / await
```

的代码，要求写出完整输出顺序，并解释为什么。

典型结构：

```ts
console.log('start')

setTimeout(() => {
  console.log('timeout')
}, 0)

Promise.resolve().then(() => {
  console.log('promise')
})

async function run() {
  console.log('async 1')
  await Promise.resolve()
  console.log('async 2')
}

run()

console.log('end')
```

要求：

1. 写出输出顺序。
2. 说明同步任务。
3. 说明 microtask。
4. 说明 macrotask。
5. 说明 `await` 后面的代码为什么进入微任务。

### 必须掌握

```text
同步代码
↓
清空 microtask queue
↓
下一 macrotask
```

---

## Q024 · this 输出题

> 出现年份：2023、2025/2026 高频汇总  
> 来源：字节前端 / 抖音  
> 频率：★★★★☆

### 原始题型之一

```ts
var a = function () {
  this.b = 3
}

c = new a()

a.prototype.b = 9

var b = 7

a()

console.log(b)
console.log(c.b)
```

要求：

1. 写输出。
2. 解释普通函数调用时 `this`。
3. 解释 `new` 时的 `this`。
4. 解释实例属性为什么会遮蔽 prototype 属性。

---

## Q025 · var / let / const / 暂时性死区输出题

> 出现年份：2022  
> 来源：飞书前端实习  
> 频率：★★★★☆

### 完整题型

给出类似：

```ts
console.log(a)
var a = 1

console.log(b)
let b = 2
```

要求：

1. 写结果。
2. 解释变量提升。
3. 解释 TDZ。
4. 区分 `var / let / const`。

---

## Q026 · Promise / await 输出题

> 出现年份：2024、2025  
> 来源：字节业务中台、字节一面  
> 频率：★★★★★

### 完整题型

重点考：

```ts
async function foo() {
  console.log(1)

  await bar()

  console.log(2)
}

function bar() {
  console.log(3)
}

foo()

Promise.resolve().then(() => {
  console.log(4)
})

console.log(5)
```

要求：

- 写输出。
- 说明 `await bar()` 中 `bar()` 什么时候执行。
- 说明 `await` 后续代码什么时候执行。
- 说明 Promise microtask 的入队顺序。

---

## Q027 · Object / prototype 输出题

> 出现年份：2022  
> 来源：抖音前端  
> 频率：★★★☆☆

### 完整题型

给定 constructor / prototype / instance 相关代码，要求输出结果。

重点考察：

```text
Own Property
Prototype Property
Prototype Chain
new
constructor
```

建议掌握：

```ts
obj.hasOwnProperty(key)
Object.getPrototypeOf(obj)
Ctor.prototype
```

之间的关系。

---

# 三、CSS / HTML 现场手写

## Q028 · 左固定 100px，右侧自适应两栏布局

> 出现年份：2022  
> 来源：字节前端一面  
> 频率：★★★★☆

### 完整题目

实现：

```text
┌──────────┬─────────────────────────┐
│ 100px    │                         │
│ fixed    │       auto              │
│          │                         │
└──────────┴─────────────────────────┘
```

要求：

- 左侧固定 `100px`。
- 右侧填满剩余空间。

至少写一种方案。

推荐掌握：

- flex
- grid

---

## Q029 · 左右固定 100px，中间自适应三栏布局

> 出现年份：2024  
> 来源：字节前端日常实习  
> 频率：★★★★★

### 完整题目

实现：

```text
┌───────┬───────────────────────┬───────┐
│100px  │                       │100px  │
│       │      flexible         │       │
└───────┴───────────────────────┴───────┘
```

要求：

- 左边 `100px`
- 右边 `100px`
- 中间占满剩余宽度

使用 Flex：

```css
.container {
  display: flex;
}

.left,
.right {
  width: 100px;
}

.center {
  flex: 1;
}
```

### 常见追问

- `flex: 1` 实际是什么？
- `flex: auto` 和 `flex: 1` 区别？
- 中间内容很长时为什么可能溢出？
- `min-width: 0` 是干什么的？

---

## Q030 · Flex 九宫格

> 出现年份：2023  
> 来源：字节前端  
> 频率：★★★☆☆

### 完整题目

使用 Flex 实现九宫格：

```text
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
├───┼───┼───┤
│ 7 │ 8 │ 9 │
└───┴───┴───┘
```

要求：

1. 每行 3 个。
2. item 等宽。
3. 边框视觉上不能重复变粗。
4. 容器宽度变化时保持三列。

考察：

```text
display:flex
flex-wrap
flex-basis
box-sizing
border
```

---

## Q031 · 画 0.5px 的线

> 出现年份：2022  
> 来源：字节成都前端  
> 频率：★★★☆☆

### 完整题目

在高清屏上实现视觉宽度约为：

```text
0.5px
```

的横线。

说明至少一种方案，例如：

- `transform: scaleY(.5)`
- viewport / DPR 相关处理

并解释为什么直接写：

```css
border: 0.5px solid;
```

在不同设备上表现可能不同。

---

# 四、React / UI Coding

## Q032 · React Autocomplete / Typeahead

> 来源：TikTok Front End Engineer 公开面试记录  
> 频率：★★★★★

### 完整题目

使用 React 实现一个自动补全组件。

提供：

```ts
async function search(keyword: string): Promise<string[]>
```

要求：

1. 输入关键字发送搜索请求。
2. 显示搜索建议。
3. 输入为空时清空结果。
4. 点击结果填回输入框。
5. 请求期间 loading。
6. 无结果 empty state。
7. 使用 debounce。
8. 避免旧请求覆盖新请求。

加分：

- ArrowUp / ArrowDown
- Enter
- Escape
- AbortController
- cache

---

## Q033 · Pagination 分页组件

> 字节 / 抖音前端历史高频 UI Coding  
> 频率：★★★★☆

### 完整题目

实现：

```tsx
<Pagination
  current={3}
  total={100}
  pageSize={10}
  onChange={setPage}
/>
```

要求：

1. 计算总页数。
2. Previous / Next。
3. 当前页高亮。
4. 第一页禁用 Previous。
5. 最后一页禁用 Next。
6. 页数很多时支持：

```text
1 ... 4 [5] 6 ... 20
```

---

## Q034 · Carousel 轮播图

> 字节 / TikTok 前端历史 UI Coding  
> 频率：★★★★☆

### 完整题目

实现：

```tsx
<Carousel images={images} />
```

要求：

1. Previous / Next。
2. 首尾循环。
3. indicator。
4. 自动播放。
5. 组件卸载清理 timer。

追问：

- 如何做无缝循环？
- 为什么 clone 首尾节点？
- `transform` 为什么比 `left` 更适合动画？

---

# 五、场景 / 浏览器相关代码题

## Q035 · 内存泄漏代码定位与修复

> 来源：字节前端社招  
> 频率：★★★☆☆

### 完整题型

给出一段可能存在内存泄漏的前端代码，例如：

```ts
function mount() {
  const data = new Array(1000000).fill('x')

  window.addEventListener('resize', () => {
    console.log(data.length)
  })
}
```

要求：

1. 找出可能泄漏的位置。
2. 解释为什么 GC 无法回收。
3. 修改代码避免泄漏。
4. 说明如何使用 Chrome DevTools 排查。

重点：

- Event Listener
- Timer
- Closure
- Detached DOM
- Heap Snapshot

---

## Q036 · 64 位整数精度问题

> 出现年份：2022  
> 来源：字节成都前端  
> 频率：★★★☆☆

### 完整题目

后端返回一个 64 位整数 ID：

```json
{
  "id": 9223372036854775807
}
```

前端解析后发现数字发生变化。

回答：

1. 为什么？
2. JavaScript 最大安全整数是多少？
3. 如何解决？

考察：

```ts
Number.MAX_SAFE_INTEGER
BigInt
string
```

实际接口通常让后端把大整数 ID 作为字符串返回。

---

# 六、纯算法 / 数据结构手写（公开面经中出现）

> 这一部分不是纯前端，但字节前端面试仍会出现。

## Q037 · 判断链表是否有环

> 出现年份：2022  
> 来源：字节前端、飞书前端  
> 频率：★★★★☆

### 完整题目

给定单链表 head，判断是否存在环。

要求尽量：

```text
时间 O(n)
空间 O(1)
```

提示：快慢指针。

---

## Q038 · 股票买卖 I / II

> 出现年份：2024、社招  
> 来源：字节业务中台 / 社招  
> 频率：★★★☆☆

### 题目一

给定每天股票价格：

```ts
prices: number[]
```

只能买一次、卖一次，返回最大利润。

### 题目二

允许进行多次交易，但同时只能持有一只股票，返回最大利润。

---

## Q039 · 二叉树层序遍历

> 出现年份：2023  
> 来源：字节前端实习  
> 频率：★★★★☆

### 完整题目

给定二叉树：

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

要求使用 BFS。

---

## Q040 · 每一层的最大节点

> 出现年份：2025  
> 来源：字节商业化广告前端实习  
> 频率：★★★☆☆

### 完整题目

给定二叉树，返回每层节点中的最大值。

例如：

```text
      1
     / \
    3   2
   / \
  5   3
```

返回：

```ts
[1, 3, 5]
```

---

## Q041 · 爬楼梯

> 出现年份：2026  
> 来源：字节前端开发实习  
> 频率：★★★☆☆

### 完整题目

一次可以走：

```text
1 阶
2 阶
```

走到第 `n` 阶共有多少种方法？

要求：

- 给出 DP。
- 尽量将空间优化到 O(1)。

---

## Q042 · 全排列

> 出现年份：2025  
> 来源：字节前端一面  
> 频率：★★★☆☆

### 完整题目

给定：

```ts
[1, 2, 3]
```

返回全部排列：

```ts
[
  [1, 2, 3],
  [1, 3, 2],
  [2, 1, 3],
  [2, 3, 1],
  [3, 1, 2],
  [3, 2, 1]
]
```

要求使用回溯。

---

## Q043 · 最大连续子数组和

> 出现年份：2022  
> 来源：字节成都前端  
> 频率：★★★☆☆

### 完整题目

给定：

```ts
[-2,1,-3,4,-1,2,1,-5,4]
```

返回最大连续子数组和：

```text
6
```

对应：

```text
[4,-1,2,1]
```

面试曾继续追问不同解法：

- 暴力
- DP / Kadane
- 分治

---

## Q044 · 移动零

> 来源：字节前端社招  
> 频率：★★★☆☆

### 完整题目

给定：

```ts
[0, 1, 0, 3, 12]
```

原地移动所有 `0` 到数组末尾，并保持非零元素相对顺序：

```ts
[1, 3, 12, 0, 0]
```

尽量：

```text
O(n)
```

---

## Q045 · 版本排序

> 出现年份：2026  
> 来源：抖音生活服务  
> 频率：★★★★☆

见 Q021。

虽然属于字符串 / 排序题，但它非常贴近前端工程，因此建议按前端手写题掌握。

---

# 七、建议优先级

如果目标是字节 / TikTok 前端面试，建议先掌握下面 20 道。

## 第一梯队：必须能现场写

```text
Promise.all
debounce
throttle
Scheduler / batchTask
Array flat
bind
new
Event Loop 输出
Promise / await 输出
this 输出
listToTree
两栏 / 三栏 Flex
Autocomplete
```

## 第二梯队：建议掌握

```text
Promise.race
promisify
deepClone
EventBus
reduce / map
版本号排序
内存泄漏定位
Pagination
Carousel
```

## 第三梯队：知道思路即可

```text
日期格式化
正则手机号 / 邮箱
JSX → createElement
0.5px
交通灯
随机字符串
深度对象去重
```

---

# 八、近 5 年趋势

## 2022

特点：

```text
Promise.all
debounce
数组 flat
CSS layout
Event Loop
正则
日期格式化
链表
```

偏经典 JavaScript / CSS 基础。

## 2023

明显增加：

```text
bind + new
Promise.all
深度对象比较
JSX 转换
React
Event Loop
UI / CSS 场景
```

## 2024

常见：

```text
reduce 实现 map
listToTree
Promise.all
debounce
Event Loop
Flex 三栏
```

数据转换和异步继续高频。

## 2025

常见：

```text
Array.flat
PromiseAll
Event Loop + await
柯里化
TS 泛型
reduce
```

## 2026

目前公开面经里比较明显的是：

```text
Scheduler / batchTask
Promise.race
promisify
版本号排序
debounce
Event Loop
状态机 / 交通灯
AI + Frontend 场景
```

整体趋势不是“不考基础”，而是：

```text
基础手写
+
异步控制
+
真实工程场景
+
React / UI coding
```

---

# 九、来源

以下为本整理使用的公开面经 / 资料。

1. 牛客：2022.8.8 字节跳动前端一面面经  
   https://www.nowcoder.com/discuss/386452900833247232

2. 牛客：前端实习面经——字节飞书研发一面  
   https://www.nowcoder.com/discuss/364837575637377024

3. 牛客：字节前端实习 / 广告业务面经（正则、日期格式化）  
   https://www.nowcoder.com/discuss/448281792886374400

4. 牛客：再战字节前端面试（成都 offer）  
   https://www.nowcoder.com/discuss/353159178074136576

5. 牛客：字节前端面经 2023  
   https://www.nowcoder.com/discuss/511225079162818560

6. 牛客：24 届字节二面（Promise.all / new / bind / EventLoop）  
   https://www.nowcoder.com/discuss/473245956205449216

7. 牛客：字节前端实习一面 4.24（bind / Promise.all / JSX）  
   https://www.nowcoder.com/discuss/482326408560226304

8. 牛客：字节前端日常凉经 2024（reduce-map / listToTree / Promise.all）  
   https://www.nowcoder.com/feed/main/detail/f67505c1712c4d68b1c286c7b3762de2

9. 牛客：字节前端一面凉经 2024（debounce / EventLoop）  
   https://www.nowcoder.com/feed/main/detail/13feb6402bcd4ef4b62156385069baf9

10. 牛客：字节前端一面 2025（Array.flat / PromiseAll）  
    https://www.nowcoder.com/discuss/799382455135293440

11. 牛客：字节一面 2025（EventLoop / await / 柯里化 / 全排列）  
    https://www.nowcoder.com/feed/main/detail/b6e129ea37d949ff908e93b3823f218c

12. 牛客：字节商业化广告前端实习（reduce / TS / 二叉树）  
    https://www.nowcoder.com/feed/main/detail/500f4c646ce54603b40f23f25cb06b7b

13. 牛客：2026 字节前端一面（batchTask 并发控制）  
    https://www.nowcoder.com/feed/main/detail/7888652055e84f08b3f89395b467ec45

14. 牛客：2026 字节前端开发岗面经合集 01  
    https://www.nowcoder.com/discuss/923167773570629632

15. 牛客：2026 字节前端开发岗面经合集 02  
    https://www.nowcoder.com/discuss/923168327453642752

16. 牛客：27 届前端高频面试题汇总（含字节 / TikTok / 抖音 / 番茄）  
    https://www.nowcoder.com/discuss/889546972099584000

17. Glassdoor：TikTok Front End Engineer — React autocomplete + debounce  
    https://www.glassdoor.com/Interview/-First-round-basic-front-end-questions-such-as-basic-JS-promise-react-and-so-on-Then-proceed-to-the-coding-section-QTN_5799431.htm

18. GreatFrontEnd：ByteDance Front End Interview Guide  
    https://www.greatfrontend.com/interviews/company/bytedance/questions-guides
