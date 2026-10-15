# React

> 目标：覆盖 React 18 主流机制与高级前端面试高频问题。React 19 新 API 暂不作为当前重点。
## 3. Fiber
### 完整面试题
Fiber 是什么？为什么 React 要引入 Fiber？
### 参考答案与原理
Fiber 把原来不可中断的大块递归工作拆成可逐步处理的工作单元，使 render 工作可以暂停、恢复、重做并支持优先级调度。

### 关键展开
Fiber Node 是 React 对一个工作单元的内部表示，典型关系包括 `child`、`sibling`、`return`，因此原本递归遍历的树可以被转换为“做一个 Fiber → 决定下一个 Fiber”的循环。

Fiber 解决的是**工作可拆分、可恢复**的问题；Scheduler 解决的是**这些工作什么时候执行、不同优先级如何让步**的问题。二者相关但不是同一个东西。Fiber Tree 也不等于 DOM Tree，例如函数组件本身有 Fiber，但不会生成对应 DOM。

### 30 秒面试回答
Fiber 既是内部数据结构，也是 React 新 reconciliation 架构的基础。
### 常见追问
Fiber Node 和 React Element 区别？Fiber Tree 和 DOM Tree 一样吗？
### 掌握要求
★★★★★

---

## 4. Render Phase / Commit Phase / 双树
### 完整面试题
Render Phase、Commit Phase、Current/WorkInProgress Tree 有什么关系？
### 参考答案与原理
Render Phase 计算新的 Fiber Tree，可以被打断；Commit Phase 把结果写入 DOM，应快速连续完成。Current Tree 表示已提交 UI，WorkInProgress 表示正在计算的新树。

### 关键展开
当前屏幕对应 `current` tree；更新发生时 React 基于它构建 `workInProgress` tree。两个对应 Fiber 通过 `alternate` 关联。Render 完成后，如果这一版结果被接受，Commit 会把它提交；之后新树成为 current，原来的树可在下一次更新中复用为 WIP。

Render 可以被打断，是因为这时还没改用户看到的 DOM；Commit 一旦开始就要连续完成，否则页面可能处在一半新、一半旧的不一致状态。

### 30 秒面试回答
双树机制把“当前稳定 UI”和“正在计算的新 UI”分离，是并发渲染的重要基础。
### 常见追问
alternate 是什么？commit 后两棵树如何变化？
### 掌握要求
★★★★☆

---

## 5. State / Batching / Functional Update
### 完整面试题
为什么 setState 后当前变量不会立即变化？
### 参考答案与原理
State 属于某一次 render 的 snapshot。setter 是安排下一次 render，React 还可能 batching 多次更新。当新状态依赖旧状态时应使用 `setCount(c => c + 1)`。

### 关键展开
每一次 render 里的 state 都是一个**快照**。调用 setter 不是修改当前变量，而是把更新加入队列，触发后续 render。React 18 的 automatic batching 会把更多场景里的多次更新合并，减少重复 render。

```ts
setCount(count + 1)
setCount(count + 1) // 两次都读取同一个旧 count

setCount(c => c + 1)
setCount(c => c + 1) // 按更新队列顺序计算，可得到 +2
```

当新状态依赖旧状态时，函数式更新最稳妥。

### 30 秒面试回答
Functional update 可以避免 batching 和旧闭包导致的丢更新。
### 常见追问
React 18 automatic batching 是什么？
### 掌握要求
★★★★★

---

## 6. useEffect
### 完整面试题
`useEffect` 应该用来做什么？
### 参考答案与原理
Effect 主要用于让 React 和外部系统同步，例如订阅、timer、network connection、第三方 DOM API。能在 render 中直接计算的值通常不需要 effect。

### 关键展开
Effect 的核心不是“组件加载后做点事”，而是**让 React 状态与 React 外部系统保持同步**，例如订阅、WebSocket、timer、第三方 DOM API。

依赖变化时，一般先运行上一轮 cleanup，再运行新的 effect；卸载时也会 cleanup。开发环境 StrictMode 可能通过额外的 setup/cleanup 检查副作用是否正确可恢复，因此不要把“只执行一次”当成 Effect 的语义。

### 30 秒面试回答
Effect 不是“万能生命周期”，而是 external synchronization。
### 常见追问
cleanup 什么时候执行？开发环境为什么可能执行两次？
### 掌握要求
★★★★★

---

## 7. Dependency / Stale Closure
### 完整面试题
Effect dependency 为什么容易出错？什么是 stale closure？
### 参考答案与原理
每次 render 都有自己的变量快照，回调会捕获创建时那次 render 的值。Effect 使用到的 reactive value 应纳入依赖，或通过 functional update/ref 重构。

### 关键展开
函数组件每次 render 都创建一套新的局部变量和回调。回调捕获的是**创建它的那次 render** 中的值，所以异步回调里很容易读到旧 state，这就是 stale closure 的常见来源。

解决思路不是删 dependency，而是：需要基于旧值更新时用 functional update；需要保存不触发 render 的最新值时用 ref；Effect 依赖了 reactive value 就应如实声明。

### 30 秒面试回答
不要通过少写 dependency 来“控制 effect”，而应保证依赖正确。
### 常见追问
interval 如何读最新 state？为什么 ref 可以解决一部分问题？
### 掌握要求
★★★★★

---

## 8. useEffect vs useLayoutEffect
### 完整面试题
二者区别是什么？
### 参考答案与原理
`useLayoutEffect` 在 DOM mutation 后、浏览器 paint 前同步执行，会阻塞绘制；`useEffect` 更适合绝大多数副作用。

### 关键展开
`useLayoutEffect` 在 DOM 已变更、浏览器绘制前同步执行，因此适合“先测量 DOM → 立即修正位置 → 用户只看到最终结果”的场景，例如 tooltip 定位。代价是它会阻塞 paint。

普通数据请求、订阅、日志等几乎都应使用 `useEffect`，否则会无谓延迟页面绘制。

### 30 秒面试回答
只有必须读取布局并立即修正 UI 时才优先考虑 layout effect。
### 常见追问
tooltip positioning 为什么可能用它？
### 掌握要求
★★★★☆

---

## 9. useRef
### 完整面试题
`useRef` 有哪些典型用途？
### 参考答案与原理
一是引用 DOM，二是保存跨 render 持久但不触发 render 的 mutable value。修改 `ref.current` 不会触发重新渲染。
### 30 秒面试回答
如果值变化需要反映到 UI，用 state；如果只是保存 mutable reference，可用 ref。
### 常见追问
forwardRef 是什么？
### 掌握要求
★★★★★

---

## 10. memo / useMemo / useCallback
### 完整面试题
三者分别优化什么？
### 参考答案与原理
`React.memo` 缓存组件 render；`useMemo` 缓存计算结果；`useCallback` 缓存函数引用。它们都有维护成本，不应默认到处使用。

### 关键展开
三者解决的是**不必要的重复工作**，不是业务正确性：
- `React.memo(Component)`：props 浅比较没有变化时，可跳过组件 render；
- `useMemo(fn, deps)`：缓存 `fn()` 的结果；
- `useCallback(fn, deps)`：缓存函数引用，本质可理解为缓存函数本身。

如果父组件每次都创建 `{}`、`[]` 或新函数，引用会变化，可能让 memo 失效。优化前最好先用 Profiler 找真实热点。

### 30 秒面试回答
只有存在昂贵计算或引用稳定性确实影响下游 memoization 时才使用。
### 常见追问
inline object 为什么可能让 memo 失效？
### 掌握要求
★★★★☆

---

## 11. Context / Reducer / External Store
### 完整面试题
Context、useReducer、Zustand/Redux 类 store 分别适合什么？
### 参考答案与原理
Context 解决跨层传值；Reducer 适合复杂状态转移；外部 store 适合更独立、细粒度的大型共享状态。`useSyncExternalStore` 是 React 订阅外部 store 的标准底层接口。

### 关键展开
Context 更像“依赖注入/跨层传值”，不是完整状态管理方案。Provider 的 value 改变时，消费它的组件会收到更新；如果把大量频繁变化的状态塞进一个 Context，很容易扩大 re-render 范围。

Reducer 适合把复杂状态变更集中成明确的 `state + action -> nextState`；Redux/Zustand 等外部 store 进一步解决大型共享状态、选择性订阅、DevTools 等问题。Server state（请求缓存）通常交给 TanStack Query 这类库，而不是塞入全局 client store。

### 30 秒面试回答
不要把所有业务状态都塞进一个 Context。
### 常见追问
Context 为什么可能导致大范围 re-render？tearing 是什么？
### 掌握要求
★★★★☆

---

## 12. Suspense / lazy / useTransition
### 完整面试题
Suspense、lazy 和 transition 分别做什么？
### 参考答案与原理
`lazy + Suspense` 常用于组件代码分割；`useTransition` 把某些更新标记为非紧急，让输入等高优先级交互优先响应。

### 关键展开
`lazy(() => import(...))` 让组件代码按需加载；加载期间可以由最近的 Suspense boundary 显示 fallback。`useTransition` 则用于把某些 UI 更新标成非紧急，让输入等 urgent update 优先。

Transition 不等于 `setTimeout`、debounce，也不会让 JS 多线程执行；它影响的是 React 内部更新优先级与是否可以暂时显示旧 UI。Suspense 处理“等待中的 UI”，Error Boundary 处理渲染错误，职责不同。

### 30 秒面试回答
Transition 不是 debounce，也不是简单 setTimeout，而是 React 调度优先级机制的一部分。
### 常见追问
Error Boundary 和 Suspense 区别？transition 会不会让代码变成异步函数？
### 掌握要求
★★★★☆

---

## 13. Controlled / Uncontrolled / Custom Hook
### 完整面试题
受控组件、非受控组件和 Custom Hook 分别是什么？
### 参考答案与原理
受控组件由 React state 做 source of truth；非受控组件更依赖 DOM 自身状态；Custom Hook 复用 stateful logic，而不是复用 UI。
### 30 秒面试回答
表单行为复杂时常用 controlled；Custom Hook 用于抽取可复用行为逻辑。
### 常见追问
Custom Hook 是否共享 state？为什么 Hook 不能条件调用？
### 掌握要求
★★★★☆

---

## 14. Scheduler / 时间切片 / MessageChannel
### 完整面试题
React 并发渲染为什么可以“让出主线程”？React 怎么判断这一小段工作应该暂停？MessageChannel 在这里解决什么问题？它和 `setTimeout`、microtask 有什么区别？
### 参考答案与原理
JavaScript 仍然运行在主线程，React 并没有把 render 变成多线程。核心做法是把 render 工作拆成 Fiber 单元，并在执行一小段后检查当前时间片是否快用完。如果需要让出，就保存当前工作位置，把后续工作安排到未来的 task 中继续。

React Scheduler 的实现细节会随版本变化，但浏览器环境历史上常使用 MessageChannel 等机制安排后续回调。MessageChannel 回调属于 task，不会像 Promise microtask 那样在当前 task 结束后立刻把微任务队列一直清空，因此浏览器可以在 task 之间获得处理其他工作/渲染的机会。`setTimeout(..., 0)` 也能进入未来 task，但受最小延迟和定时器策略影响，不适合作为高频调度的首选实现。

关键区分：**Fiber = 可拆分工作的数据结构/执行模型；Scheduler = 决定什么时候继续做这些工作。**
### 30 秒面试回答
React 不是知道“浏览器已经彻底空闲了”才继续，而是自己给工作设置时间片。Fiber 让 render 可暂停，Scheduler 在时间片快耗尽时让出主线程，再通过未来 task 继续。MessageChannel 常用于快速安排这个后续 task。
### 常见追问
- 为什么不用 microtask？答：微任务会在进入下一个 task 前一直被清空，连续调度可能饿死渲染和用户事件。
- 和 `requestIdleCallback` 一样吗？答：不是。React 有自己的 Scheduler，不应简单等同于 rIC。
### 掌握要求
★★★★★

---

## 15. SSR / CSR / Hydration
### 完整面试题
CSR、SSR 分别是什么？SSR 为什么通常能改善首屏？Hydration 在 React 中做什么？SSR 有哪些代价？
### 参考答案与原理
CSR 通常先下载一个较空的 HTML，再由 JS 请求数据并构建 UI；SSR 在服务器先根据请求生成 HTML，浏览器更早看到可展示内容。React 到浏览器后还需要 hydration：复用已有服务端 HTML，并建立事件处理和客户端组件状态，使页面真正可交互。

SSR 的代价包括服务端渲染成本、缓存策略更复杂、需要处理 server/client 环境差异，以及 hydration 本身仍需下载和执行 JS。SSR 不等于“完全不需要客户端 JS”。
### 30 秒面试回答
SSR 先把可见 HTML 在服务端生成，通常有利于首屏与 SEO；客户端随后 hydration，把已有 DOM 接管成可交互 React 应用。代价是服务端复杂度和 hydration 成本。
### 常见追问
- hydration mismatch：服务端输出和客户端第一次 render 不一致。
- SSG：构建时提前生成 HTML，适合更新频率较低的页面。
### 掌握要求
★★★★☆

---

## 16. 虚拟列表
### 完整面试题
有 10 万条数据需要在前端列表展示，你会怎么设计虚拟列表？固定高度和动态高度分别怎么做？如果用户滚动很快，而下一批数据还没加载出来怎么办？
### 参考答案与原理
虚拟列表的核心不是减少数据量，而是**只渲染视口附近的 DOM**。固定高度时可以用 `startIndex = floor(scrollTop / itemHeight)` 计算起始项，再渲染 `visibleCount + overscan` 条；外层容器保留完整总高度，内部内容通过 translateY 偏移到正确位置。

动态高度更复杂，需要测量已渲染 item 高度并维护 offset/index 映射，常用前缀和或更高效的数据结构辅助查找。

快速滚动 + 数据未到时：可以提前 prefetch 下一页、增加 overscan、显示 skeleton/placeholder，并取消已经无意义的旧请求。不要为了“不能出现空白”一次渲染全部 DOM。
### 30 秒面试回答
虚拟列表只保留视口附近 DOM，通过 scrollTop 算可见区间，并加 overscan 防止快速滚动闪白。远端分页时再配合预取、placeholder 和请求取消。
### 常见追问
- 为什么 key 必须稳定？避免 DOM/state 错配。
- 动态高度难点？index 到 offset 不再是简单乘法，需要维护测量结果。
### 掌握要求
★★★★★

---

## 17. Error Boundary
### 完整面试题
React Error Boundary 能捕获哪些错误？为什么事件处理器里的错误不能靠 Error Boundary 统一捕获？工程上怎么做错误兜底？
### 参考答案与原理
Error Boundary 用来捕获其子树在 render、生命周期/对应提交阶段中抛出的错误，并渲染 fallback UI。它不是通用 `try/catch`，不会自动捕获异步 timer、事件 handler、服务端渲染等所有错误。

工程上通常按页面/关键模块设置边界，并把错误上报到监控系统，附带 release、route、用户操作 breadcrumb 等上下文；局部可恢复模块优先局部 fallback，避免一个小组件导致整页白屏。
### 30 秒面试回答
Error Boundary 是 React 渲染树级别的故障隔离，不是全局异常捕获器。关键是合理划分边界 + fallback + 监控上报。
### 常见追问
函数组件怎么写 Error Boundary？目前常见仍使用 class boundary 或封装库；普通函数组件不能仅靠一个 Hook 实现完全等价的 boundary。
### 掌握要求
★★★★☆

---

## 18. Fetch / AbortController / Request Race
### 完整面试题
一个搜索框输入 `a` 后发请求 A，紧接着输入 `ab` 发请求 B。如果 A 比 B 更晚返回，页面可能被旧结果覆盖。React 中怎么处理这种 request race？AbortController 能解决什么？
### 参考答案与原理
异步请求不会因为组件重新 render 自动取消，所以多个请求可能乱序返回。常见方案有两类：

1. **取消旧请求**：为本轮 fetch 创建 `AbortController`，Effect cleanup 时执行 `controller.abort()`；
2. **忽略旧结果**：给请求加 sequence/id，只有最新请求允许更新 state。

```ts
useEffect(() => {
  const controller = new AbortController()

  async function load() {
    try {
      const res = await fetch(`/api/search?q=${query}`, {
        signal: controller.signal
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') throw err
    }
  }

  load()
  return () => controller.abort()
}, [query])
```

真实项目如果请求缓存、retry、dedupe、invalidation 很多，通常交给 TanStack Query 等 server-state library，而不是每个组件重复手写。
### 30 秒面试回答
请求 race 的关键是“旧请求不能覆盖新状态”。我会在 cleanup 中 abort 旧请求，或用 request id 忽略 stale response；复杂 server state 则交给专门缓存库。
### 常见追问
Abort 只能阻止支持 signal 的工作继续；如果业务异步已经进入其他不可取消阶段，仍可能需要“忽略旧结果”的保护。
### 掌握要求
★★★★★

---

## 19. Client State vs Server State
### 完整面试题
Redux/Zustand 里的 client state 和 API 返回的 server state 有什么本质区别？为什么大量请求数据不一定适合全部塞进全局 store？
### 参考答案与原理
Client state 是前端自己拥有的状态，例如当前 tab、未提交表单、弹窗开关；Server state 的 source of truth 在服务端，前端只是缓存副本，因此会额外面对 stale、refetch、dedupe、retry、pagination、invalidation 等问题。

把所有 server state 手工塞进 Redux 往往会重复实现请求缓存系统。TanStack Query/SWR 这类库专门管理 query key、cache、stale time、refetch 和 mutation 后 invalidation。
### 30 秒面试回答
区分标准是 source of truth 在哪里。前端自己的交互状态是 client state；服务端数据是 server state，更适合 query cache，而不是简单当全局变量管理。
### 常见追问
Server state library 不是替代所有状态管理；复杂本地编辑器状态仍可能需要 reducer/store。
### 掌握要求
★★★★☆
