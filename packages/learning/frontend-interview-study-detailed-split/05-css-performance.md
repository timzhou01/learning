# CSS & Web Performance

> 目标：覆盖高级前端面试最常见 CSS 布局和性能知识，不深入冷门视觉技巧。

## 1. Box Model / box-sizing
### 完整面试题
标准盒模型包含什么？`content-box` 和 `border-box` 区别？
### 参考答案与原理
盒模型包含 content、padding、border、margin。`content-box` 的 width 只表示 content；`border-box` 的 width 包含 padding 和 border。
### 30 秒面试回答
现代工程中常全局使用 `box-sizing: border-box`，尺寸更直观。
### 常见追问
margin 是否计入 width？box-sizing 是否继承？
### 掌握要求
★★★★☆

---

## 2. Flexbox
### 完整面试题
Flexbox 的核心概念和常用属性有哪些？
### 参考答案与原理
Flex 是一维布局模型，核心是 main axis / cross axis。重点掌握 `justify-content`、`align-items`、`gap`、`flex-grow`、`flex-shrink`、`flex-basis`。
### 30 秒面试回答
Flex 适合导航、工具栏、卡片行等单轴布局。
### 常见追问
`flex: 1` 大体代表什么？如何水平垂直居中？
### 掌握要求
★★★★★

---

## 3. Grid
### 完整面试题
Grid 和 Flex 怎么选？
### 参考答案与原理
Grid 更适合二维布局，同时控制行列；Flex 更偏一维布局。大型页面中两者经常组合。
### 30 秒面试回答
不是二选一，而是按布局维度选择。
### 常见追问
`fr` 是什么？什么时候 Grid 更自然？
### 掌握要求
★★★☆☆

---

## 4. Position / Stacking Context
### 完整面试题
absolute、fixed、sticky 的定位参考是什么？为什么 `z-index:9999` 可能仍盖不住？
### 参考答案与原理
定位元素的 containing block 决定坐标参考。`z-index` 并非全局排名，而是在 stacking context 层级中比较。
### 30 秒面试回答
遇到弹层层级问题，先看父级 stacking context，而不是继续增大 z-index。
### 常见追问
transform 为什么可能创建 stacking context？Portal 为什么常用于 modal？
### 掌握要求
★★★★☆

---

## 5. BFC
### 完整面试题
BFC 有什么实际作用？
### 参考答案与原理
BFC 是独立块级格式化上下文，可用于包含浮动、隔离部分布局影响、处理 margin collapse 等。
### 30 秒面试回答
不需要死背所有触发条件，理解它是“独立块布局上下文”即可。
### 常见追问
`overflow:hidden` 为什么曾常用于清浮动？
### 掌握要求
★★★☆☆

---

## 6. Core Web Vitals
### 完整面试题
LCP、INP、CLS 分别衡量什么？
### 参考答案与原理
LCP 衡量主要内容加载；INP 衡量交互到下一次绘制响应；CLS 衡量视觉稳定性。
### 30 秒面试回答
三个指标分别关注加载、交互、布局稳定。
### 常见追问
FCP、TTFB 和 Core Web Vitals 什么关系？
### 掌握要求
★★★★★

---

## 7. LCP 优化
### 完整面试题
LCP 慢通常怎么排查？
### 参考答案与原理
拆成 TTFB、资源发现、资源下载、渲染延迟。常见优化包括 CDN/cache、preload 首屏资源、图片优化、SSR、减少阻塞 JS/CSS。
### 30 秒面试回答
不要只说“压缩图片”，要按关键路径拆问题。
### 常见追问
首屏 hero image 是否应该 lazy load？
### 掌握要求
★★★★★

---

## 8. CLS / INP
### 完整面试题
CLS 和 INP 常见问题分别是什么？
### 参考答案与原理
CLS 常由图片未预留尺寸、异步插入内容、字体变化引起；INP 常由 main thread 长任务、重 render、同步计算造成。
### 30 秒面试回答
CLS 要稳定布局空间；INP 要减少交互后的主线程阻塞。
### 常见追问
React transition 能否改善部分 INP 场景？
### 掌握要求
★★★★☆

---

## 9. Code Splitting / Lazy Loading
### 完整面试题
为什么要拆 bundle？
### 参考答案与原理
首屏不应该下载、解析和执行暂时用不到的代码。Dynamic import 可以形成异步 chunk，React 可配合 `lazy/Suspense`。
### 30 秒面试回答
目标是按用户真实访问路径加载代码。
### 常见追问
chunk 太碎有什么问题？HTTP/2 是否意味着无限拆包？
### 掌握要求
★★★★★

---

## 10. Tree Shaking
### 完整面试题
Tree Shaking 为什么依赖 ESM？
### 参考答案与原理
ESM import/export 结构静态可分析，Bundler 可识别未使用 export；副作用代码会影响安全删除。
### 30 秒面试回答
Tree Shaking 是静态分析 + production dead-code elimination 的组合。
### 常见追问
`sideEffects` 字段是什么？
### 掌握要求
★★★★☆

---

## 11. 图片 / CDN / Cache
### 完整面试题
图片和静态资源如何优化？
### 参考答案与原理
正确尺寸、现代格式、responsive image、CDN、合理 lazy/preload、长期 hash cache、设置宽高避免 CLS。
### 30 秒面试回答
静态资源性能要同时看体积、网络距离、缓存、优先级和布局稳定性。
### 常见追问
CDN cache miss 怎么办？hash 文件名为什么适合长缓存？
### 掌握要求
★★★★☆

---

## 12. DevTools 性能排查
### 完整面试题
页面慢时如何使用 Chrome DevTools？
### 参考答案与原理
Network 看 waterfall、TTFB、size、cache、priority；Performance 看 main thread、long task、layout/paint；Lighthouse 可做诊断入口。
### 30 秒面试回答
先判断瓶颈是网络还是 main thread，再进入对应面板定位。
### 常见追问
如何识别 long task？怎么判断缓存命中？
### 掌握要求
★★★★★

---

## 13. 性能指标如何采集：Lab vs Field
### 完整面试题
LCP、CLS、INP 在哪里看？Chrome DevTools、Lighthouse 和真实用户监控有什么区别？为什么不能只看一次本地跑分？
### 参考答案与原理
DevTools Performance 可以分析一次具体页面加载/交互的时间线；Lighthouse 属于 lab data，便于可重复测试；真实用户监控（RUM）通过 Web Vitals API/监控 SDK 收集 field data，更能反映真实设备、网络、用户行为分布。

本地跑分适合定位和回归，但不能代表所有用户。工程上应同时看 lab + field，并按 p75 等分位数而不是只看平均值。
### 30 秒面试回答
我会用 DevTools/Lighthouse 做定位和实验，用 RUM 看真实用户分布。性能指标是验证工具，不应该替代对真实体验和具体瓶颈的判断。
### 常见追问
平均值容易掩盖长尾问题，所以 Web Vitals 常看 p75。
### 掌握要求
★★★★★

---

## 14. Long Task / 主线程阻塞
### 完整面试题
页面点击卡顿但网络很快，你怎么判断是不是主线程被阻塞？Long Task 是什么？有哪些典型优化手段？
### 参考答案与原理
浏览器主线程同时承担大量 JS、style/layout、paint 准备等工作。一个任务执行太久会推迟用户输入处理和渲染，表现为 INP 变差、掉帧。可以在 Performance timeline 中查看长任务和调用栈。

优化方式包括拆分大任务、减少同步计算、列表虚拟化、避免重复 render/layout、把适合的 CPU 工作迁到 Worker，并延后非关键任务。
### 30 秒面试回答
交互卡顿先看 Performance 主线程 flame chart，确认是 JS、layout 还是 paint。不要只看到“函数耗时高”就盲目 memo，要先定位阻塞链路。
### 常见追问
Long Task 通常指占用主线程超过约 50ms 的任务，是诊断信号而非唯一性能目标。
### 掌握要求
★★★★☆

---

## 15. Responsive Design
### 完整面试题
一个后台系统既要支持 1440px 桌面，也要在较窄窗口可用，你会怎么做响应式布局？什么时候用 Flex、Grid、media query？
### 参考答案与原理
响应式设计优先让布局本身具备弹性：百分比、`max-width`、Flex/Grid、`minmax()`、`auto-fit/auto-fill` 等；当布局在某个宽度确实需要发生结构变化时再使用 media query。

不要只按具体设备型号写 breakpoint，而应根据内容什么时候“放不下/不好用”确定断点。图片使用响应式尺寸，文字和交互控件还要考虑缩放与可访问性。
### 30 秒面试回答
我优先使用弹性布局，让内容自然适配；只有结构需要变化时才加 breakpoint。断点由内容驱动，不是背 iPhone/Pad 宽度。
### 常见追问
Container Query 适合“组件根据自身容器尺寸变化”，比只看 viewport 的 media query 更组件化。
### 掌握要求
★★★★☆

---

## 16. Accessibility / Semantic HTML
### 完整面试题
为什么 `<button>` 不应该默认用 `<div onClick>` 替代？前端做 Accessibility 至少要掌握哪些基础？
### 参考答案与原理
语义 HTML 自带键盘行为、focus、role 和辅助技术可理解的语义。例如 button 默认可聚焦、Enter/Space 可触发；用 div 模拟就需要自己补 `tabIndex`、键盘事件、ARIA 等，而且很容易漏。

基础要求包括：语义标签、可见 focus、表单 label、图片 alt、键盘可操作、合理 heading 层级、颜色对比度；ARIA 应在原生语义不足时补充，而不是用来替代正确 HTML。
### 30 秒面试回答
Accessibility 首先从正确语义 HTML 开始。能用原生 button/input 就不要用 div 重造，因为键盘和辅助技术行为已经内建。
### 常见追问
`aria-label` 能提供可访问名称，但不能自动给 div 增加 button 的全部交互行为。
### 掌握要求
★★★★☆
