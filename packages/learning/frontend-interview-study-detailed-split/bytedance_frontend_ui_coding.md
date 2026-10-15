# ByteDance / TikTok Frontend UI Coding

> 目标：准备字节跳动 / TikTok 前端面试中的组件手写、UI Coding、Machine Coding。
>
> 建议优先级：
>
> - ★★★★★：Autocomplete、Pagination、Carousel
> - ★★★★☆：Modal、Transfer List、Infinite Scroll
> - ★★★☆☆：Todo List、Tabs、Async List
>
> 使用方式：先只看题目实现，再对照自己的 React / JavaScript 基础检查状态管理、事件处理、异步控制和边界条件。

---

## 1. Autocomplete / Search Suggestion

### 完整面试题

请使用 React 实现一个搜索自动补全组件 `Autocomplete`。

页面包含一个输入框。当用户输入内容时，需要根据关键字获取搜索建议，并把结果显示在输入框下方。

假设已经提供如下 API：

```ts
async function search(keyword: string): Promise<string[]> {
  // 返回搜索建议
}
```

例如：

```ts
await search('rea')
```

可能返回：

```ts
[
  'react',
  'react native',
  'react router'
]
```

要求：

1. 输入框内容变化时触发搜索。
2. 输入为空时不发送请求，并清空建议列表。
3. 搜索结果显示在输入框下方。
4. 点击某个建议后：
   - 将该建议填入输入框；
   - 关闭建议列表。
5. 请求期间显示：

```text
Loading...
```

6. 没有搜索结果时显示：

```text
No results
```

7. 为搜索请求添加 `debounce`，例如用户停止输入 `300ms` 后再真正发送请求。
8. 避免用户快速输入时出现旧请求覆盖新请求的问题。

例如：

```text
用户先输入：

re

随后快速输入：

react
```

如果：

```text
search("re")
```

比：

```text
search("react")
```

更晚返回，那么页面不能重新显示 `"re"` 的旧结果。

### 初始结构

```tsx
function Autocomplete() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <input />

      <div>
        {/* suggestion list */}
      </div>
    </div>
  )
}
```

### 示例交互

用户输入：

```text
rea
```

页面：

```text
┌─────────────────────┐
│ rea                 │
└─────────────────────┘

react
react native
react router
```

点击：

```text
react native
```

之后：

```text
┌─────────────────────┐
│ react native        │
└─────────────────────┘
```

建议列表关闭。

### 加分要求

支持键盘操作：

```text
ArrowDown
ArrowUp
Enter
Escape
```

例如：

- `ArrowDown`：选择下一条 suggestion。
- `ArrowUp`：选择上一条。
- `Enter`：确认当前选中项。
- `Escape`：关闭列表。

还可以实现：

- 高亮匹配关键字。
- 请求缓存。
- `AbortController` 取消旧请求。

### 常见追问

- 为什么需要 debounce？
- debounce 应该放在哪里？
- 如何避免 stale request？
- `AbortController` 可以解决什么问题？
- 为什么旧请求可能覆盖新请求？
- 如果 keyword 相同，是否可以做缓存？

### 掌握要求

★★★★★

---

## 2. Pagination

### 完整面试题

请使用 React 实现一个分页组件：

```tsx
<Pagination
  current={3}
  total={100}
  pageSize={10}
  onChange={page => {}}
/>
```

参数含义：

```ts
type PaginationProps = {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}
```

其中：

- `current`：当前页。
- `total`：数据总数量。
- `pageSize`：每页条数。
- `onChange`：页码变化回调。

要求：

1. 根据 `total` 和 `pageSize` 计算总页数。
2. 显示：
   - Previous
   - 页码
   - Next
3. 点击页码调用：

```ts
onChange(page)
```

4. 第一页时 Previous disabled。
5. 最后一页时 Next disabled。
6. 当前页需要有选中状态。
7. 当总页数很多时，不要求把所有页码全部显示出来。

例如：

```text
当前第 5 页
总共 20 页
```

可以显示：

```text
Previous  1  ...  4  [5]  6  ...  20  Next
```

而不是：

```text
1 2 3 4 5 6 7 8 ... 20
```

### 示例

```tsx
function App() {
  const [page, setPage] = useState(1)

  return (
    <Pagination
      current={page}
      total={200}
      pageSize={10}
      onChange={setPage}
    />
  )
}
```

### 基础要求

至少实现：

```text
Previous
1 2 3 4 5
Next
```

并保证边界正确。

### 加分要求

实现：

- 省略号。
- 自定义 `pageSize`。
- 总页数动态变化。
- 页码跳转输入框。
- Controlled / Uncontrolled 两种模式。

### 常见追问

- 总页数怎么计算？
- 为什么要用 `Math.ceil`？
- total 变化导致 current 超过最大页数怎么办？
- Controlled Component 是什么？
- 如何设计一个可复用 Pagination API？

### 掌握要求

★★★★★

---

## 3. Carousel / Image Slider

### 完整面试题

请使用 React 实现一个图片轮播组件：

```tsx
<Carousel
  images={[
    '1.jpg',
    '2.jpg',
    '3.jpg'
  ]}
/>
```

要求：

1. 显示当前图片。
2. 有 Previous / Next 按钮。
3. 点击 Next：
   - 当前不是最后一张时显示下一张；
   - 当前是最后一张时回到第一张。
4. 点击 Previous：
   - 当前不是第一张时显示上一张；
   - 当前是第一张时跳到最后一张。
5. 页面显示 indicator：

```text
● ○ ○
```

6. 点击 indicator 可以跳转到对应图片。
7. 支持自动播放，例如每 `3000ms` 自动切换一张。

### 示例

```text
图片：

A
B
C
```

当前：

```text
A
```

点击 Next：

```text
B
```

继续：

```text
C
```

再点击：

```text
A
```

### 自动播放要求

例如：

```ts
setInterval(...)
```

或者使用递归 `setTimeout`。

组件卸载时必须清理 timer。

### 加分要求

实现真正的无限轮播动画。

例如 DOM 可以排列成：

```text
clone(C) A B C clone(A)
```

通过 `transform` 移动。

当动画移动到：

```text
clone(A)
```

后瞬间无动画跳回真实：

```text
A
```

用户视觉上感觉是无限循环。

其他加分点：

- 鼠标 hover 时暂停自动播放。
- swipe / drag。
- transition 动画。
- 图片 lazy loading。

### 常见追问

- `setInterval` 为什么需要 cleanup？
- React 里 timer 如何避免 stale closure？
- 无限轮播为什么通常需要 clone 首尾节点？
- `transform` 和 `left` 做动画有什么区别？
- 自动播放和用户手动操作冲突怎么办？

### 掌握要求

★★★★★

---

## 4. Modal / Dialog

### 完整面试题

请使用 React 实现一个通用 Modal：

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
>
  <div>Hello</div>
</Modal>
```

要求：

1. `open=false` 时不显示。
2. `open=true` 时显示：
   - 遮罩层。
   - 弹窗内容。
3. 点击关闭按钮关闭 Modal。
4. 点击遮罩层关闭 Modal。
5. 点击 Modal 内容本身不能触发关闭。
6. 按下 `Escape` 时关闭。
7. Modal 打开时尽量阻止页面背景滚动。

### 页面结构示例

```text
--------------------------------
|                              |
|          backdrop            |
|      ┌──────────────┐        |
|      │    Modal     │        |
|      │              │        |
|      │    Close     │        |
|      └──────────────┘        |
|                              |
--------------------------------
```

### 加分要求

使用：

```tsx
createPortal(...)
```

将 Modal 渲染到：

```html
<body>
```

或者：

```html
<div id="modal-root"></div>
```

实现：

- focus trap。
- 打开时自动 focus。
- 关闭后恢复原来的 focus。
- 支持多个 Modal。
- animation。

### 常见追问

- 为什么 Modal 经常使用 Portal？
- Event bubbling 会带来什么问题？
- 点击内容区域为什么不能关闭？
- 如何监听 Escape？
- Modal 打开时如何禁止 body scroll？
- 可访问性需要考虑哪些问题？

### 掌握要求

★★★★☆

---

## 5. Transfer List

### 完整面试题

请使用 React 实现一个 Transfer List。

页面左右各有一个列表：

```text
Available              Selected

[ ] React              [ ] Vue
[ ] Angular            [ ] Svelte
[ ] Solid

       >     <
```

要求：

1. 左侧列表显示可选择项目。
2. 右侧列表显示已经选择的项目。
3. 每一项前面有 checkbox。
4. 用户可以在左侧选择多个项目。
5. 点击：

```text
>
```

把选中的项目移动到右侧。
6. 用户可以在右侧选择多个项目。
7. 点击：

```text
<
```

把选中的项目移动回左侧。
8. 移动后 checkbox 状态清空。
9. 同一个 item 不能同时出现在两个列表里。

### 数据结构

可以使用：

```ts
type Item = {
  id: number
  name: string
}
```

例如：

```ts
const items = [
  { id: 1, name: 'React' },
  { id: 2, name: 'Vue' },
  { id: 3, name: 'Angular' },
  { id: 4, name: 'Svelte' }
]
```

### 加分要求

实现：

- Select All。
- 搜索过滤。
- disabled item。
- 保持原始顺序。
- 支持外部 Controlled value。

### 常见追问

- 你会如何设计 state？
- checked state 应该存 item 还是 id？
- 为什么通常存 id 更合适？
- 如何避免两个列表出现重复数据？
- 如果数据量有一万条怎么办？

### 掌握要求

★★★★☆

---

## 6. Infinite Scroll

### 完整面试题

请使用 React 实现一个无限滚动列表。

假设已经提供：

```ts
async function fetchList(
  page: number
): Promise<{
  items: Item[]
  hasMore: boolean
}> {
  // ...
}
```

页面第一次加载时请求：

```text
page = 1
```

当用户滚动到列表底部时自动请求：

```text
page = 2
```

然后：

```text
page = 3
```

直到：

```ts
hasMore === false
```

### 要求

1. 第一次进入页面自动加载第一页。
2. 滚动到底部时加载下一页。
3. 新数据 append 到旧数据后面。
4. 请求过程中显示：

```text
Loading...
```

5. 请求期间不能重复发送同一个 page。
6. `hasMore=false` 后停止请求。

### 示例状态

```ts
const [items, setItems] = useState<Item[]>([])
const [page, setPage] = useState(1)
const [loading, setLoading] = useState(false)
const [hasMore, setHasMore] = useState(true)
```

### 加分要求

优先使用：

```ts
IntersectionObserver
```

而不是直接监听：

```text
scroll
```

可以在列表尾部放：

```tsx
<div ref={sentinelRef} />
```

当 sentinel 进入 viewport 时加载下一页。

其他加分：

- 请求失败 retry。
- 去重。
- AbortController。
- 防止重复 append。
- loading skeleton。

### 常见追问

- 为什么 `IntersectionObserver` 比 scroll listener 更适合？
- scroll listener 如何 throttle？
- 如何避免重复请求？
- React Strict Mode 导致 effect 执行两次怎么办？
- 如果数据非常多怎么办？

### 掌握要求

★★★★☆

---

## 7. Todo List

### 完整面试题

请使用 React 实现一个 Todo List。

每个 Todo：

```ts
type Todo = {
  id: number
  text: string
  completed: boolean
}
```

页面需要包含：

```text
Input
Add button

Todo List

All / Active / Completed
```

### 要求

1. 输入文字。
2. 点击 Add 新增 Todo。
3. 输入为空时不能新增。
4. 每个 Todo 可以切换：
   - completed
   - active
5. 可以删除 Todo。
6. 支持过滤：

```text
All
Active
Completed
```

### 示例

```text
[x] Learn React
[ ] Learn TypeScript
[x] Practice Interview
```

点击：

```text
Active
```

只显示：

```text
Learn TypeScript
```

### 加分要求

实现：

- Enter 添加。
- Edit Todo。
- Clear Completed。
- localStorage 持久化。
- Remaining count。
- React.memo 优化。

### 常见追问

- 为什么修改 state 时不应该直接 mutate array？
- `map / filter` 分别适合哪些操作？
- `key` 为什么应该用 id，而不是 index？
- derived state 是否需要单独存？
- 如何使用 `useMemo`？

### 掌握要求

★★★☆☆

---

## 8. Tabs

### 完整面试题

实现一个通用 Tabs 组件：

```tsx
<Tabs
  items={[
    {
      key: 'home',
      label: 'Home',
      content: <Home />
    },
    {
      key: 'profile',
      label: 'Profile',
      content: <Profile />
    }
  ]}
/>
```

页面：

```text
Home | Profile | Settings
-------------------------
Current Content
```

### 要求

1. 点击 Tab 切换内容。
2. 当前 Tab 显示 active 状态。
3. 默认显示第一个 Tab。
4. Tab 数量由数据动态决定。
5. 不要给每个 Tab 写死逻辑。

### 加分要求

支持 Controlled：

```tsx
<Tabs
  activeKey={activeKey}
  onChange={setActiveKey}
/>
```

以及 Uncontrolled：

```tsx
<Tabs defaultActiveKey="home" />
```

支持：

- disabled tab。
- lazy render。
- URL sync。
- keyboard navigation。

### 常见追问

- Controlled 和 Uncontrolled 有什么区别？
- 为什么组件库通常两种模式都支持？
- key 的作用是什么？
- 切换 Tab 后是否应该卸载内容组件？

### 掌握要求

★★★☆☆

---

## 9. Async Search Result List

### 完整面试题

请实现一个搜索页面。

页面包含：

```text
Search Input
Search Button
Result List
```

假设 API：

```ts
async function searchUsers(
  keyword: string
): Promise<User[]> {
  // ...
}
```

### 要求

1. 输入 keyword。
2. 点击 Search 后请求接口。
3. 请求期间显示 loading。
4. 成功后显示 result list。
5. 没有结果显示 empty state。
6. 请求失败显示 error。
7. 再次搜索时正确更新状态。

### 状态至少包括

```ts
keyword
results
loading
error
```

### 加分要求

支持：

- Enter 搜索。
- debounce 自动搜索。
- request cancellation。
- retry。
- cache。
- loading skeleton。

### 常见追问

- loading / error / data 三种状态如何组织？
- 请求失败后再次搜索应该如何清理旧 error？
- 如何处理请求竞争？
- 是否需要把所有状态都放一个 object？

### 掌握要求

★★★☆☆

---

## 10. Virtual List

### 完整面试题

有一个非常长的列表，例如：

```ts
const items = Array.from(
  { length: 100000 },
  (_, i) => `Item ${i}`
)
```

如果一次性把 10 万个 DOM 节点全部渲染到页面，会出现明显性能问题。

请实现一个简化 Virtual List。

假设：

```text
containerHeight = 500px
itemHeight = 50px
```

要求：

1. 页面只渲染当前 viewport 附近的 item。
2. 整个滚动区域高度仍然等于完整列表高度。
3. 根据：

```text
scrollTop
```

计算：

```text
startIndex
endIndex
```

4. 用户滚动时更新可见区域。

### 核心计算

例如：

```ts
const startIndex = Math.floor(
  scrollTop / itemHeight
)
```

可见数量：

```ts
const visibleCount = Math.ceil(
  containerHeight / itemHeight
)
```

结束位置：

```ts
const endIndex =
  startIndex + visibleCount
```

### DOM 思路

外层：

```text
height = items.length * itemHeight
```

真正渲染的元素通过：

```css
transform: translateY(...)
```

移动到正确位置。

### 加分要求

支持：

```text
overscan
```

例如可见区域上下多渲染 3～5 个 item，避免快速滚动时出现空白。

其他加分：

- 动态高度。
- scrollToIndex。
- ResizeObserver。
- 避免高频 setState。

### 常见追问

- Virtual List 为什么快？
- DOM 节点过多会带来什么问题？
- overscan 是什么？
- 用户快速滚动时出现空白怎么办？
- item 高度不固定怎么办？

### 掌握要求

★★★★☆

---

# 推荐练习顺序

如果目标是字节 / TikTok 前端面试，建议按下面顺序练：

```text
1. Autocomplete
2. Pagination
3. Carousel
4. Modal
5. Transfer List
6. Infinite Scroll
7. Virtual List
8. Todo List
9. Tabs
10. Async Search Result List
```

优先确保前六道可以在没有 AI 的情况下独立写出核心版本。

---

# 面试时统一思考模板

拿到 UI Coding 题，不建议马上开始写。

先明确四件事：

```text
1. State 是什么？
2. Event 是什么？
3. Derived State 是什么？
4. Edge Cases 是什么？
```

例如 Autocomplete：

```text
State:
keyword
results
loading
selectedIndex

Event:
input change
click result
keydown

Derived State:
是否显示列表
是否 empty

Edge Cases:
空字符串
旧请求晚返回
请求失败
组件卸载
```

然后再开始写代码，结构通常会清楚很多。

---

# 掌握目标

对于字节前端面试，不要求把每个组件都写成生产级组件库。

重点是能够在 30～45 分钟内写出：

```text
能运行
核心交互正确
state 设计清楚
边界条件基本完整
能解释为什么这么写
```

然后在面试官追问时继续扩展 debounce、异步竞争、性能、可访问性和组件 API 设计。
