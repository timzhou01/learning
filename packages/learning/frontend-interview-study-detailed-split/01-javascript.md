# JavaScript

> 目标：只保留高级前端/全栈面试最主流的 JavaScript 知识。

## 1. 数据类型与值/引用
### 完整面试题
JavaScript 有哪些数据类型？对象变量保存的是什么？
### 参考答案与原理
基本类型包括 `string`、`number`、`boolean`、`undefined`、`null`、`symbol`、`bigint`。对象、数组、函数属于对象类型。参数传递本质都是值传递，只是对象变量保存的值是“对象引用”。

### 关键展开
- JavaScript 参数传递始终是**值传递**。对象变量里的“值”恰好是一个引用，所以把对象传给函数后，函数能通过这个引用修改同一个对象。
- `const` 只限制变量不能重新赋值，不代表对象内部不能修改。
- 判断数组用 `Array.isArray()`；`typeof null === "object"` 是历史遗留问题。

```ts
const a = { n: 1 }
const b = a
b.n = 2
console.log(a.n) // 2，因为 a、b 指向同一个对象
```

### 30 秒面试回答
基本类型直接保存值；对象变量保存引用值，所以多个变量可能指向同一对象。
### 常见追问
`typeof null` 为什么是 `object`？数组为什么也是对象？
### 掌握要求
★★★★★

---

## 2. 浅拷贝 / 深拷贝
### 完整面试题
浅拷贝和深拷贝有什么区别？
### 参考答案与原理
展开运算符、`Object.assign` 等只复制第一层，嵌套对象仍共享引用。深拷贝需要复制完整对象图，现代环境优先考虑 `structuredClone`。

### 关键展开
- `{...obj}`、`Object.assign()`、`array.slice()` 都只复制一层；嵌套对象仍共享引用。
- `structuredClone()` 能处理循环引用、Map、Set、Date、ArrayBuffer 等常见结构，但不能克隆函数和 DOM 节点。
- `JSON.parse(JSON.stringify(x))` 会丢失 `undefined`、函数、Symbol，并会改变 Date 等类型，因此不应被当成通用深拷贝。

### 30 秒面试回答
浅拷贝只复制第一层；深拷贝会复制嵌套结构。`JSON.stringify/parse` 有类型丢失等限制。
### 常见追问
`structuredClone` 能复制函数吗？循环引用怎么办？
### 掌握要求
★★★★★

---

## 3. 作用域与闭包
### 完整面试题
什么是 lexical scope？什么是 closure？
### 参考答案与原理
JavaScript 使用词法作用域，函数能访问哪些变量由定义位置决定。函数保留了对外层变量的访问能力，即形成闭包。只要闭包仍可达，它引用的变量就不会被 GC。

### 关键展开
闭包不是“函数里面套函数”这么简单。关键是：**函数离开定义它的作用域后，仍然能访问当时的词法环境**。

```ts
function createCounter() {
  let count = 0
  return () => ++count
}
const next = createCounter()
next() // 1
next() // 2
```

这里 `createCounter` 已经返回，但 `count` 仍被返回函数引用，所以不会被 GC。闭包常用于私有状态、事件回调、debounce；真正的风险是无用闭包长期持有大对象。

### 30 秒面试回答
闭包是函数与其词法环境的组合。闭包本身不是内存泄漏，长期保留无用引用才可能造成泄漏。
### 常见追问
闭包为什么能保存状态？React stale closure 是什么？
### 掌握要求
★★★★★

---

## 4. `this` / call / apply / bind
### 完整面试题
普通函数和箭头函数的 `this` 有什么区别？
### 参考答案与原理
普通函数的 `this` 主要由调用方式决定；箭头函数没有自己的 `this`，使用外层词法 `this`。`call/apply` 立即调用并指定 this；`bind` 返回绑定后的新函数。

### 关键展开
普通函数的 `this` 看**调用方式**：`obj.fn()` 指向 `obj`；独立调用在 strict mode 下是 `undefined`；`call/apply/bind` 可显式指定。箭头函数没有自己的 `this`，它捕获定义位置外层的 `this`。

```ts
const obj = {
  n: 1,
  normal() { console.log(this.n) },
  arrow: () => console.log(this)
}
```

`call` 和 `apply` 都立即执行；区别只是参数形式。`bind` 不立即执行，而是返回一个绑定后的新函数。

### 30 秒面试回答
普通函数看调用点，箭头函数看定义位置外层环境。
### 常见追问
箭头函数能作为构造函数吗？call 和 apply 差在哪？
### 掌握要求
★★★★★

---

## 5. 原型链 / new / instanceof
### 完整面试题
JavaScript 如何实现继承？`new` 做了什么？
### 参考答案与原理
对象访问不存在的属性时，会沿原型链向上查找。`new` 会创建对象、连接构造函数 `prototype`、绑定 `this`、执行构造函数并处理返回值。`instanceof` 本质是检查构造函数的 `prototype` 是否存在于对象原型链上。

### 关键展开
`new Foo()` 可以简化理解为四步：
1. 创建新对象；
2. 让新对象的原型指向 `Foo.prototype`；
3. 用新对象作为 `this` 调用 `Foo`；
4. 如果构造函数显式返回对象，则返回该对象，否则返回新对象。

`instanceof` 则沿对象原型链向上查找，看能否遇到 `Constructor.prototype`。ES `class` 本质仍建立在 prototype 机制之上。

### 30 秒面试回答
原型链负责属性继承，`new` 负责建立对象和构造函数 prototype 的关系。
### 常见追问
`Object.create` 做什么？class 和 prototype 什么关系？
### 掌握要求
★★★★★

---

## 6. Event Loop
### 完整面试题
Microtask 和 Macrotask 的执行顺序是什么？
### 参考答案与原理
简化流程：执行当前同步任务 → 清空 microtask → 浏览器可能渲染 → 执行下一个 task。Promise callback、`queueMicrotask`、`await` 后续代码属于 microtask；`setTimeout` 属于 task/macrotask。

### 关键展开
浏览器里可以按下面顺序理解一轮事件循环：
1. 执行当前 task 中的同步 JS；
2. 清空 microtask queue；microtask 中新增的 microtask 也继续执行，直到队列为空；
3. 浏览器获得一次渲染机会；
4. 取下一个 task。

```ts
console.log(1)
setTimeout(() => console.log(2))
Promise.resolve().then(() => console.log(3))
console.log(4)
// 1 4 3 2
```

`Promise.then`、`queueMicrotask`、`await` 后续通常进入微任务；timer、MessageChannel、用户事件属于 task。连续制造微任务可能让 timer 和渲染长期得不到机会，即 microtask starvation。

### 30 秒面试回答
当前同步代码执行结束后，会优先清空 microtask，再进入下一轮 task。
### 常见追问
microtask 中继续加 microtask 会怎样？为什么可能 starvation？
### 掌握要求
★★★★★

---

## 7. Promise / async-await
### 完整面试题
为什么 Promise 可以链式调用？`await` 后面的代码何时执行？
### 参考答案与原理
`.then()` 每次都会返回新 Promise；回调返回普通值、Promise 或抛异常都会决定下一 Promise 的状态。`async` 函数总返回 Promise，`await` 后续逻辑会在后续 microtask 中继续。

### 关键展开
Promise 有 `pending / fulfilled / rejected` 三种状态，settled 后不可再次改变。`.then()` **一定返回新的 Promise**，所以链式调用能把值、异常和异步结果继续传下去。

`await expr` 可以近似理解为：先同步计算 `expr`，然后暂停当前 async 函数；等它对应的 Promise settled 后，把后面的代码安排成后续微任务继续。

```ts
async function run() {
  console.log('A')
  await Promise.resolve()
  console.log('B')
}
console.log('1')
run()
console.log('2')
// 1 A 2 B
```

### 30 秒面试回答
`async/await` 是 Promise 的语法层封装，不改变底层异步调度模型。
### 常见追问
`Promise.all`、`allSettled`、`race`、`any` 区别？
### 掌握要求
★★★★★

---

## 8. ESM vs CommonJS
### 完整面试题
ESM 和 CommonJS 有什么区别？
### 参考答案与原理
CommonJS 使用 `require/module.exports`，更偏运行时加载；ESM 使用 `import/export`，依赖结构静态可分析，更利于 Tree Shaking 和浏览器原生模块。

### 关键展开
- ESM 用 `import/export`，依赖关系可在构建阶段静态分析，天然适合 tree shaking；导出是 **live binding**。
- CommonJS 用 `require/module.exports`，加载和导出更偏运行时；Node 中模块首次加载后会缓存。
- 循环依赖时，ESM 共享绑定，可能出现 temporal dead zone；CJS 更常见的是拿到“尚未执行完成”的部分 exports。
- 浏览器原生模块与现代前端构建优先 ESM；Node 生态仍可能同时遇到两种模块。

### 30 秒面试回答
ESM 的静态结构是现代前端构建优化的重要基础。
### 常见追问
循环依赖怎么处理？为什么 CJS 更难 Tree Shake？
### 掌握要求
★★★★☆

---

## 9. GC / WeakMap
### 完整面试题
JavaScript 如何判断对象可以回收？WeakMap 为什么不能遍历？
### 参考答案与原理
现代 GC 主要基于可达性：从 GC Root 无法访问的对象可以被回收。WeakMap 对 key 不保持强引用，因此不能提供稳定可枚举 key 集合。

### 关键展开
现代 JS GC 的核心判断是 **reachability**：从全局对象、当前调用栈等 GC Root 出发仍可到达的对象不能回收；不可达对象才有资格被回收，所以循环引用本身并不等于泄漏。

WeakMap 的 key 必须是对象，而且不会因为 WeakMap 自己持有 key 就阻止该对象被 GC。它不能可靠遍历，因为对象何时被回收由 GC 决定。适合给对象挂元数据、缓存与对象生命周期绑定的数据。

### 30 秒面试回答
循环引用本身不是问题，只要整个对象图从 Root 不可达，就可以回收。
### 常见追问
常见内存泄漏来源？WeakMap 适合什么场景？
### 掌握要求
★★★★☆

---

## 10. `==` / `===` / 隐式类型转换
### 完整面试题
`==` 和 `===` 有什么区别？`[] == false`、`null == undefined` 这类表达式为什么会出现反直觉结果？实际项目里应该怎么写？
### 参考答案与原理
`===` 不做跨类型强制转换，类型和值都相同才为 true；`==` 会按 ECMAScript 抽象相等算法做类型转换，因此规则复杂。

常见例子：
```ts
0 == false        // true
'' == false       // true
null == undefined // true
[] == false       // true
```
对象参与比较时通常先发生 ToPrimitive，再继续和 primitive 比较。实际业务代码默认使用 `===` / `!==`；只有非常明确需要同时匹配 `null` 和 `undefined` 时，少量代码会有意使用 `value == null`。
### 30 秒面试回答
`===` 不做类型转换，`==` 会执行一套复杂的隐式转换规则，所以工程代码默认用 `===`。需要解释 `==` 时，我会从 ToPrimitive 和 primitive 类型转换去分析，而不是死记结果。
### 常见追问
- 为什么 `[] == false` 是 true？答：数组转 primitive 后得到空字符串，再经过数值转换，两边最终都可比较为 0。
- `Object.is` 和 `===` 一样吗？答：大部分一样，但 `Object.is(NaN, NaN)` 为 true，且能区分 `+0` 和 `-0`。
### 掌握要求
★★★★★

---

## 11. 事件委托与函数防抖/节流的工程边界
### 完整面试题
一个列表有上千个可点击行，你会给每行绑定事件还是使用事件委托？事件委托依赖什么机制？哪些事件/场景不适合简单委托？
### 参考答案与原理
事件委托把监听器挂在共同祖先上，依赖事件冒泡，通过 `event.target` 找实际触发节点、`event.currentTarget` 找当前监听器节点。它能减少大量相同 listener，并天然覆盖后续动态加入的子节点。

但不是所有事件都按相同方式冒泡；复杂 Shadow DOM、需要捕获阶段处理、或交互逻辑高度独立的组件也不一定适合统一委托。
### 30 秒面试回答
大量同类动态节点优先考虑事件委托；核心是利用冒泡，在父节点用 target 区分来源。是否使用要看事件是否冒泡以及组件边界是否清晰。
### 常见追问
- `target` vs `currentTarget`：前者是事件真正起点，后者是当前 listener 所在节点。
- `stopPropagation`：阻止事件继续传播；`preventDefault`：阻止浏览器默认行为，两者不是一回事。
### 掌握要求
★★★★☆
