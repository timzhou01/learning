# Browser / Network / Security

> 目标：掌握前端面试最主流的浏览器、网络、安全知识；不深挖 DNS Prefetch、冷门协议细节等偏门内容。

## 1. URL 到页面显示
### 完整面试题
输入 URL 到页面显示，大体发生了什么？
### 参考答案与原理
URL 解析 → DNS → 建连接 → TLS（HTTPS）→ HTTP request/response → 解析 HTML/CSS → DOM/CSSOM → Render Tree → Layout → Paint → Composite。

### 关键展开
建议面试按两段回答：
**网络阶段**：解析 URL → 查缓存/DNS → TCP 建连 → HTTPS 做 TLS 握手 → 发送 HTTP 请求 → 服务端响应。
**浏览器阶段**：流式解析 HTML 构建 DOM；解析 CSS 构建 CSSOM；计算样式和 Render Tree；Layout 算位置尺寸；Paint 生成绘制记录；Composite 合成图层并显示。

中间还会受缓存、重定向、preload、脚本阻塞、资源优先级等影响。答案不需要把每一个浏览器线程名称背出来，但要能解释 JS/CSS 为什么影响首屏。

### 30 秒面试回答
按“网络阶段 + 渲染阶段”回答最清晰。
### 常见追问
缓存在哪一步参与？JS/CSS 为什么可能阻塞？
### 掌握要求
★★★★★

---

## 2. DOM / CSSOM / Render Tree
### 完整面试题
三者分别是什么？
### 参考答案与原理
DOM 描述文档结构，CSSOM 描述样式规则，Render Tree 结合两者表示实际参与视觉布局的节点。
### 30 秒面试回答
浏览器最终不是直接拿 DOM 去画，而是经过 style calculation 和 render tree。
### 常见追问
`display:none` 和 `visibility:hidden` 有什么不同？
### 掌握要求
★★★★☆

---

## 3. Layout / Paint / Composite
### 完整面试题
三者有什么区别？
### 参考答案与原理
Layout 算尺寸和位置；Paint 记录文字、背景、边框等绘制信息；Composite 合成不同图层。

### 关键展开
- Layout：几何信息变化，需要重新计算元素尺寸和位置；
- Paint：颜色、阴影、文字等视觉内容需要重新绘制；
- Composite：已有图层纹理重新组合。

`transform` / `opacity` 动画在合适条件下可以主要走 composite，因此通常比频繁修改 `top/left/width` 更流畅。但“用了 transform 就一定独立图层”也不是绝对规则，浏览器会自行决定。

### 30 秒面试回答
性能优化时尽量避免高频触发 layout 和大面积 paint。
### 常见追问
为什么 transform/opacity 常用于动画？
### 掌握要求
★★★★☆

---

## 4. script async / defer
### 完整面试题
`async` 和 `defer` 区别？
### 参考答案与原理
二者都可并行下载。`async` 下载完成尽快执行，不保证顺序；`defer` HTML parse 后按文档顺序执行。

### 关键展开
普通 `<script>` 下载和执行都会阻塞 HTML parser。`async`、`defer` 都能并行下载，但执行时机不同：
- `async`：下载完尽快执行，多个 async 不保证文档顺序，适合互不依赖的统计脚本；
- `defer`：等 HTML parse 完成后按文档顺序执行，并在 `DOMContentLoaded` 前完成，适合依赖 DOM/顺序的业务脚本。
- `type="module"` 默认具有类似 defer 的行为，并使用 ESM。

### 30 秒面试回答
独立第三方脚本适合 async；依赖 DOM 和顺序的业务脚本更适合 defer。
### 常见追问
module script 默认行为是什么？
### 掌握要求
★★★★★

---

## 5. Browser Process / Main Thread / Worker
### 完整面试题
浏览器是单线程的吗？
### 参考答案与原理
浏览器是多进程、多线程系统；“JS 单线程”通常指页面主执行上下文主要在 main thread 顺序执行。Web Worker 可运行计算，但不能直接操作 DOM。
### 30 秒面试回答
浏览器整体并非单线程，网络、GPU、worker 等都可并行。
### 常见追问
Web Worker 为什么不能直接操作 DOM？
### 掌握要求
★★★★☆

---

## 6. Service Worker
### 完整面试题
Service Worker 是什么？
### 参考答案与原理
它是页面之外的事件驱动 worker，可拦截 fetch，常用于离线缓存、PWA、Push 等。它使用 Cache API，不是 LocalStorage。
### 30 秒面试回答
可以把它理解为浏览器里的可编程网络代理。
### 常见追问
为什么通常要求 HTTPS？Cache API 和 HTTP Cache 区别？
### 掌握要求
★★★☆☆

---

## 7. HTTP Request / Response / Status
### 完整面试题
HTTP 请求响应由什么构成？常见状态码有哪些？
### 参考答案与原理
请求包含 method、URL、headers、body；响应包含 status、headers、body。重点状态码：200、201、204、304、400、401、403、404、409、429、500、502、503。
### 30 秒面试回答
不用背全部状态码，但要理解常见语义。
### 常见追问
401 和 403 区别？304 有没有 body？
### 掌握要求
★★★★★

---

## 8. HTTP Method / Idempotency
### 完整面试题
GET/POST/PUT/PATCH/DELETE 常见语义？
### 参考答案与原理
GET 读取；POST 创建或动作；PUT 常表示整体替换并倾向幂等；PATCH 部分更新；DELETE 删除。
### 30 秒面试回答
HTTP method 是 API 语义约定，要和资源模型结合。
### 常见追问
GET 能有 body 吗？哪些 method 通常幂等？
### 掌握要求
★★★★☆

---

## 9. HTTP/1.1 vs HTTP/2
### 完整面试题
HTTP/2 主要改进什么？
### 参考答案与原理
二进制分帧、多路复用、Header Compression，使一个连接可并发多个 stream，降低 HTTP/1.1 多连接和应用层队头问题。

### 关键展开
HTTP/1.1 的一个连接在请求排队上存在限制，浏览器通常需要多个 TCP 连接并行。HTTP/2 在单连接上把数据拆成 frame，并通过 stream 多路复用，同时支持 HPACK 头部压缩。

但 HTTP/2 仍跑在 TCP 上，一个 TCP 丢包会影响该连接上的多个 stream，这也是 HTTP/3 改用 QUIC 的重要原因之一。面试里不要简单回答“HTTP/2 完全没有队头阻塞”。

### 30 秒面试回答
最重要的是 multiplexing。
### 常见追问
TCP 层还有 HOL blocking 吗？HTTP/3 为什么用 QUIC？
### 掌握要求
★★★★☆

---

## 10. 强缓存 / 协商缓存
### 完整面试题
Cache-Control、ETag、Last-Modified 分别做什么？
### 参考答案与原理
强缓存有效期内直接本地使用；过期后可用 ETag/Last-Modified 向服务器验证，未变化返回 304。

### 关键展开
强缓存命中时浏览器可以直接使用本地资源，不向服务器询问，常由 `Cache-Control: max-age` 控制。过期后进入协商缓存：浏览器带上 `If-None-Match` / `If-Modified-Since`，服务器判断资源未变化时返回 `304`。

工程上常见策略：带内容 hash 的静态资源设置很长的 `max-age, immutable`；HTML 则较短缓存或协商缓存，确保能及时拿到引用新 hash 的入口文件。

### 30 秒面试回答
强缓存不需要请求服务器；协商缓存需要请求但可避免重传 body。
### 常见追问
`no-cache` 和 `no-store` 区别？
### 掌握要求
★★★★★

---

## 11. DNS
### 完整面试题
DNS 查询大体怎么进行？
### 参考答案与原理
先查浏览器/OS/Resolver 缓存；必要时由 recursive resolver 查询 Root、TLD、Authoritative DNS 获得 IP。
### 30 秒面试回答
真实系统高度依赖多级缓存，不是每次走完整链路。
### 常见追问
CDN 如何利用 DNS？
### 掌握要求
★★★★☆

---

## 12. TCP / UDP
### 完整面试题
TCP 三次握手为什么需要三次？TCP 和 UDP 区别？
### 参考答案与原理
三次握手用于建立双方连接状态并同步初始序列号。TCP 提供可靠、有序字节流；UDP 更轻量，不保证可靠和顺序。
### 30 秒面试回答
TCP 强调可靠性；UDP 更强调轻量，由上层协议自己补能力。
### 常见追问
HTTP/3 为什么基于 UDP？
### 掌握要求
★★★★☆

---

## 13. HTTPS / TLS / CA
### 完整面试题
HTTPS 为什么安全？CA 解决什么问题？
### 参考答案与原理
TLS 提供加密、完整性、身份认证。证书和 CA 体系解决“拿到的公钥到底是不是目标网站的”问题。握手完成后通常用高效对称加密传输数据。

### 关键展开
HTTPS 可以理解为 HTTP 跑在 TLS 之上。TLS 握手阶段用非对称密码学和证书完成服务器身份认证、密钥协商；真正传输大量业务数据时主要使用效率更高的对称加密。

证书不是“CA 给网站加密”，而是 CA 对“这个公钥属于这个域名”进行签名背书。浏览器验证证书链、域名、有效期等，再建立可信连接。现代 TLS 常通过 ECDHE 之类机制协商临时会话密钥，以提供前向保密。

### 30 秒面试回答
HTTPS 不只是加密，还要验证服务器身份并防篡改。
### 常见追问
为什么不全程非对称加密？中间人为什么不能随便伪造证书？
### 掌握要求
★★★★★

---

## 14. Same-Origin / CORS / Preflight
### 完整面试题
同源策略和 CORS 是什么？
### 参考答案与原理
同源通常要求 scheme/host/port 一致。CORS 是服务器通过响应头允许浏览器跨 origin 读取响应的机制；非简单请求可能先发 OPTIONS 预检。

### 关键展开
同源要求 scheme、host、port 都相同。CORS 不是服务器之间的限制，而是浏览器针对跨源前端读取响应实施的安全机制。

满足特定条件的“简单请求”可以直接发送；其他请求通常先发 `OPTIONS` preflight，询问服务端是否允许 method/header/origin。真正是否允许由响应中的 `Access-Control-Allow-*` 决定。需要 cookie 的跨域请求还涉及 `credentials`，且 `Allow-Origin` 不能简单使用 `*`。

### 30 秒面试回答
CORS 是浏览器安全机制，不是服务器之间的限制。
### 常见追问
为什么 Postman 没有 CORS？credential request 有什么要求？
### 掌握要求
★★★★★

---

## 15. XSS / CSRF
### 完整面试题
XSS 和 CSRF 有什么区别？
### 参考答案与原理
XSS 是让恶意脚本在目标 origin 执行；CSRF 是借浏览器自动携带凭证发起用户并不想执行的请求。XSS 重点防不可信内容执行；CSRF 重点 SameSite、CSRF Token、Origin 检查。

### 关键展开
XSS 是攻击者让恶意脚本在你的页面上下文执行，核心防御是输出编码、避免危险 HTML 拼接、必要时配合 CSP。HttpOnly 可以降低 cookie 被脚本直接读取的风险，但不能阻止 XSS 发起用户权限内的请求。

CSRF 是利用浏览器自动携带凭证，让用户在不知情时向目标站点发请求。常见防御是 SameSite cookie、CSRF token、Origin/Referer 校验。二者一个偏“脚本注入”，一个偏“借用户身份伪造请求”。

### 30 秒面试回答
一个偏“执行恶意代码”，一个偏“冒用已有身份发请求”。
### 常见追问
HttpOnly 能防 XSS 吗？JWT 放 header 是否减少 CSRF 风险？
### 掌握要求
★★★★★

---

## 16. Browser Storage
### 完整面试题
Cookie、LocalStorage、SessionStorage、IndexedDB 怎么选？
### 参考答案与原理
Cookie 可随请求发送且支持 HttpOnly/Secure/SameSite；LocalStorage 是同步小型持久 KV；SessionStorage 生命周期更接近 tab；IndexedDB 适合较大结构化客户端数据。

### 关键展开
- Cookie：容量小，会随匹配请求自动携带，适合会话标识；安全属性重点看 HttpOnly / Secure / SameSite。
- localStorage：同步 API、容量较大、长期保存，主线程大量读写可能阻塞，不适合敏感 token 的天然安全存储。
- sessionStorage：按 tab/session 隔离。
- IndexedDB：异步、结构化、容量更大，适合离线数据和大量本地缓存。
- Cache API：常与 Service Worker 配合缓存 Request/Response。

### 30 秒面试回答
选择看是否需要随请求发送、容量、生命周期、安全和查询能力。
### 常见追问
Token 放 localStorage 有什么风险？
### 掌握要求
★★★★★

---

## 17. Polling / SSE / WebSocket
### 完整面试题
三者如何选择？
### 参考答案与原理
Polling 简单但有重复请求；SSE 适合 server→client 单向事件流；WebSocket 适合双向实时通信。

### 关键展开
Polling 最简单但会产生大量空请求；Long Polling 是服务端暂时挂住请求，有结果再返回。SSE 基于普通 HTTP 长连接，服务端单向持续推送文本事件，自带重连语义；WebSocket 建立全双工长连接，适合高频双向通信。

如果只是“服务器持续推日志/进度”，SSE 往往比 WebSocket 简单；聊天、协作等需要高频双向消息时更适合 WebSocket。

### 30 秒面试回答
只需服务端持续推送时 SSE 往往更简单；真正双向实时互动时选 WebSocket。
### 常见追问
Chat 应该选哪个？SSE 是否支持自动重连？
### 掌握要求
★★★★☆

---

## 18. DOM 事件：捕获 / 冒泡 / 委托
### 完整面试题
浏览器事件从点击目标到 listener 执行经历哪些阶段？`target`、`currentTarget`、`stopPropagation()`、`preventDefault()` 分别是什么？为什么事件委托能减少大量 listener？
### 参考答案与原理
DOM 事件通常经历 capture → target → bubble。`event.target` 是实际触发事件的节点；`currentTarget` 是当前正在执行 listener 的节点。`stopPropagation()` 阻止继续传播；`preventDefault()` 阻止默认行为，例如链接跳转。

事件委托把 listener 放在共同祖先，利用冒泡统一处理大量子元素，尤其适合动态列表。
### 30 秒面试回答
事件传播分捕获、目标、冒泡。委托利用冒泡，把很多子节点的相同处理收口到父节点；通过 target 判断真实来源。
### 常见追问
`stopImmediatePropagation()` 还会阻止同一节点后续 listener；不是所有事件都以完全相同方式冒泡。
### 掌握要求
★★★★★

---

## 19. requestAnimationFrame vs setTimeout
### 完整面试题
做动画时为什么常用 `requestAnimationFrame` 而不是 `setTimeout(fn, 16)`？rAF 回调与浏览器渲染是什么关系？
### 参考答案与原理
`setTimeout` 只保证“至少延迟这么久后有资格进入任务队列”，并不与显示器刷新同步，主线程忙时也会继续延后。rAF 则由浏览器在下一次绘制前安排回调，更容易把 DOM 更新和帧节奏对齐；页面不可见时浏览器还可以降低调用频率，节省资源。

rAF 不是精确 16ms timer，也不是后台线程。高刷新率屏幕可能是 120Hz 等，因此动画应基于 timestamp/delta，而不是假设每帧固定 16ms。
### 30 秒面试回答
动画优先 rAF，因为它跟浏览器绘制节奏同步，而 setTimeout 只是普通 timer；rAF 更少无效帧，也更容易得到平滑动画。
### 常见追问
rAF 中连续读写 layout 仍可能造成 layout thrashing，所以 API 选对不代表性能一定好。
### 掌握要求
★★★★☆

---

## 20. preload / prefetch
### 完整面试题
`preload` 和 `prefetch` 有什么区别？浏览器何时会下载？哪些资源适合用？用错有什么代价？
### 参考答案与原理
`preload` 是告诉浏览器“当前页面很快就会用到这个资源，请提高发现优先级”，例如关键字体、首屏图片；需要正确的 `as` 属性。`prefetch` 更偏向“未来导航可能会用到”，通常优先级更低。

二者都是 hint，不是业务逻辑保证。滥用 preload 会抢占真正关键资源的带宽，反而拖慢首屏。
### 30 秒面试回答
preload 服务当前页面关键资源，prefetch 服务未来可能使用的资源。重点不是越多越好，而是资源优先级是否真的合理。
### 常见追问
模块依赖还可见到 modulepreload；现代框架/浏览器也可能自动做一部分预取。
### 掌握要求
★★★★☆

---

## 21. Cookie：HttpOnly / Secure / SameSite
### 完整面试题
登录态 Cookie 常见的 `HttpOnly`、`Secure`、`SameSite` 分别解决什么问题？SameSite=Lax/Strict/None 有什么差别？
### 参考答案与原理
`HttpOnly` 禁止普通 JS 通过 `document.cookie` 读取该 cookie，可降低 XSS 直接盗 cookie 的风险；`Secure` 要求只在 HTTPS 请求中发送；`SameSite` 控制跨站请求中是否自动携带 cookie。

`Strict` 最严格；`Lax` 允许部分顶层导航等较安全跨站场景，是常见默认策略；`None` 表示允许跨站携带，但通常必须同时设置 `Secure`。SameSite 是 CSRF 防御的重要一层，但不应替代全部服务端鉴权设计。
### 30 秒面试回答
HttpOnly 防 JS 直接读 cookie，Secure 限制 HTTPS，SameSite 控制跨站携带。登录 cookie 通常至少考虑 HttpOnly + Secure + 合适的 SameSite。
### 常见追问
HttpOnly 不能防止 XSS 以用户身份发请求，所以仍必须防 XSS。
### 掌握要求
★★★★★

---

## 22. 多 Tab / 多页面通信
### 完整面试题
同源的多个浏览器 Tab 之间怎么通信？如果要同步“用户退出登录”或主题设置，你会怎么做？
### 参考答案与原理
主流方案包括：
- `BroadcastChannel`：同源页面直接广播消息，API 最直观；
- `storage` event：某个页面修改 localStorage，其他同源页面收到事件，兼容性广；
- SharedWorker：多个页面共享一个 worker，适合更复杂的共享后台逻辑；
- Service Worker + client messaging：适合 PWA/离线与网络代理场景。

简单“退出登录同步”优先 BroadcastChannel 或 storage event，不需要为此引入复杂 worker。
### 30 秒面试回答
同源 Tab 通信我优先考虑 BroadcastChannel；需要兼容方案时可用 localStorage 的 storage event。复杂共享后台任务才考虑 SharedWorker/Service Worker。
### 常见追问
storage event 通常在“其他页面”触发，当前修改 localStorage 的页面不会靠这个事件通知自己。
### 掌握要求
★★★★☆

---

## 23. Web Worker
### 完整面试题
Web Worker 解决什么问题？为什么 Worker 不能直接操作 DOM？什么任务适合放 Worker，什么任务不适合？
### 参考答案与原理
Worker 提供独立 JS 执行线程，适合 CPU 密集型计算，例如大数据解析、图片处理、复杂计算，从而避免长期占用主线程。Worker 和主线程通过 `postMessage` 通信，可使用 structured clone 或 transferable object 传数据。

DOM 由浏览器主线程的渲染与事件模型管理，如果多个线程直接并发修改 DOM，会产生复杂同步与一致性问题，所以 Worker 不提供普通 DOM 访问能力。
### 30 秒面试回答
Worker 的价值是把 CPU 重任务移出主线程，不是让普通业务逻辑全部多线程。它不能直接改 DOM，结果通过消息回主线程更新 UI。
### 常见追问
网络请求本身通常是异步 I/O，不会因为放 Worker 就自动更快；真正值得迁移的是重 CPU 工作。
### 掌握要求
★★★★☆
