# System Design

> 目标：建立稳定的 Senior/Staff 系统设计框架，掌握典型问题和 Trade-off，而不是背大量题。

## 1. 系统设计回答框架
### 完整面试题
拿到一道系统设计题怎么开始？
### 参考答案与原理
推荐：Clarify Requirements → Scale → Entities → API → Data Model → High-level Architecture → Bottleneck → Scaling → Reliability/Security → Trade-off。
### 30 秒面试回答
不要一上来就堆 Redis/Kafka，先从核心读写路径和约束出发。
### 常见追问
什么时候需要估算 QPS？非功能需求怎么问？
### 掌握要求
★★★★★

---

## 2. Scale Estimation
### 完整面试题
为什么要做规模估算？
### 参考答案与原理
估算 DAU、peak QPS、read/write ratio、对象大小、带宽和存储增长，用来判断是否真的需要分片、CDN、异步等方案。
### 30 秒面试回答
估算是为了让架构选择有依据，不是展示心算。
### 常见追问
Peak QPS 怎么估？所有数字都要算吗？
### 掌握要求
★★★★☆

---

## 3. Source of Truth
### 完整面试题
为什么系统设计要明确 Source of Truth？
### 参考答案与原理
例如 DB 是业务 truth，Redis 是 cache，Search Index 是派生 read model。明确 ownership 才知道冲突、恢复和同步怎么处理。
### 30 秒面试回答
任何可重建副本都不应该和 authoritative state 混淆。
### 常见追问
Cache 和 DB 不一致怎么办？Search Index 丢了怎么办？
### 掌握要求
★★★★★

---

## 4. Sync vs Async
### 完整面试题
什么时候同步，什么时候异步？
### 参考答案与原理
当前用户必须立即知道结果的核心逻辑保持同步；耗时、可延迟、副作用型逻辑可异步化。
### 30 秒面试回答
同步路径越短越稳，异步则要补任务状态、重试和失败处理。
### 常见追问
DB 写入和入队如何保证一致性？
### 掌握要求
★★★★★

---

## 5. URL Shortener
### 完整面试题
如何设计短链接系统？
### 参考答案与原理
核心是 short code → URL mapping、高频 redirect、唯一 key、cache、code generation，analytics 可异步。
### 30 秒面试回答
先保证 mapping 正确，再优化 read-heavy redirect path。
### 常见追问
短码怎么生成？冲突怎么办？
### 掌握要求
★★★★☆

---

## 6. Notification System
### 完整面试题
如何设计通知系统？
### 参考答案与原理
Notification API → Preference/Template → Queue → Email/Push/SMS Worker → Provider → Delivery Status。
### 30 秒面试回答
业务方提交 notification intent，channel worker 异步执行，并处理 preference、retry 和 provider failure。
### 常见追问
如何避免重复发送？用户退订如何保证？
### 掌握要求
★★★★☆

---

## 7. File Upload
### 完整面试题
大文件上传怎么设计？
### 参考答案与原理
客户端向业务服务申请 upload session/signed URL，再直接上传 Object Storage；支持 multipart、断点续传和 metadata。
### 30 秒面试回答
不要让 application server 成为大文件流量中转瓶颈。
### 常见追问
如何校验完整性？如何做病毒扫描？
### 掌握要求
★★★★☆

---

## 8. Chat System
### 完整面试题
即时聊天系统的核心组件有哪些？
### 参考答案与原理
WebSocket Gateway、Message Service、Message Store、Online Routing、Ack、Offline Sync。
### 30 秒面试回答
实时连接和 durable storage 是两个不同问题。
### 常见追问
多设备怎么办？消息顺序怎么保证？
### 掌握要求
★★★★☆

---

## 9. Task System
### 完整面试题
如何设计长任务执行系统？
### 参考答案与原理
Task API + DB + Queue + Worker + Retry/DLQ + Logs。Task record 做 source of truth，Worker 幂等地更新状态。
### 30 秒面试回答
要明确 queued/running/succeeded/failed/canceled 状态和 crash recovery。
### 常见追问
Worker crash 怎么办？如何 cancel？如何 heartbeat？
### 掌握要求
★★★★★

---

## 10. 大型后台管理系统
### 完整面试题
企业内部前端平台重点设计什么？
### 参考答案与原理
Route/Permission、Design System、Common Pattern、API Client、Error Handling、Feature Flag、Audit、Monitoring、Micro Frontend Boundary。
### 30 秒面试回答
难点通常是多团队协作、一致性、权限、维护和交付效率，而不是单页面渲染。
### 常见追问
公共库如何治理？权限应该在哪层控制？
### 掌握要求
★★★★★

---

## 11. Micro Frontend Platform
### 完整面试题
公司级 Micro Frontend 平台应提供哪些能力？
### 参考答案与原理
App Registration、Routing、Runtime Loading、Shared Dependency、Auth/Context Bridge、Error Isolation、Version、Monitoring、Deployment Contract。
### 30 秒面试回答
平台价值是提供稳定 contract，让业务团队不重复处理集成问题。
### 常见追问
Remote 崩溃怎么办？Shared version 怎么治理？
### 掌握要求
★★★★★

---

## 12. Low-code Platform
### 完整面试题
配置驱动低代码平台如何设计？
### 参考答案与原理
Page Schema、Component Registry、Data Source、Action/Event Model、Editor、Validation、Preview、Version、Publish、Runtime Renderer。
### 30 秒面试回答
真正核心是稳定 schema 和 runtime contract，不是拖拽 UI。
### 常见追问
Schema 如何演进？Runtime Render 还是 Codegen？
### 掌握要求
★★★★★

---

## 13. Feature Flag
### 完整面试题
Feature Flag 系统如何设计？
### 参考答案与原理
Flag Definition、Environment、Target Rule、Percentage Rollout、Config API、SDK、Cache、Audit、Kill Switch。
### 30 秒面试回答
重点是 evaluation 快、规则可审计、发布和代码解耦。
### 常见追问
百分比灰度如何稳定命中？遗留 flag 怎么治理？
### 掌握要求
★★★★☆

---

## 14. Frontend Monitoring System
### 完整面试题
如何设计前端监控平台？
### 参考答案与原理
SDK 采集 error/performance/request/breadcrumb；后端做 ingestion、queue、processing、storage、aggregation、alert、dashboard。
### 30 秒面试回答
SDK 要轻量、可采样，并关联 release/session 等上下文。
### 常见追问
Source Map 如何安全上传？海量事件怎么降成本？
### 掌握要求
★★★★☆

---

## 15. Build vs Buy
### 完整面试题
什么时候自研，什么时候采购？
### 参考答案与原理
考虑差异化价值、开发和维护成本、Vendor Lock-in、合规、规模、集成成本、Time-to-market。
### 30 秒面试回答
如果不是核心竞争力且市场方案成熟，通常优先 buy；只有差异化和控制需求足够强时再 build。
### 常见追问
什么时候值得自研低代码？
### 掌握要求
★★★★★

---

## 16. Consistency / Availability / Abstraction
### 完整面试题
如何讨论一致性、可用性和抽象边界？
### 参考答案与原理
不要机械背 CAP。先问哪些业务 invariant 必须强一致、哪些可 eventual；抽象则看是否存在稳定共同语义，而不是看到代码相似就提公共层。
### 30 秒面试回答
Staff 级重点是说明为什么做这个 trade-off，而不仅是说用了什么技术。
### 常见追问
库存和 Feed 的一致性要求一样吗？什么时候宁可重复代码？
### 掌握要求
★★★★★

---

## 17. Load Balancer / Gateway
### 完整面试题
负载均衡和 API Gateway 分别解决什么？一个请求进入大型系统后，为什么通常不是客户端直接请求任意业务实例？
### 参考答案与原理
Load Balancer 主要把流量分发到多个健康实例，并做健康检查、连接层负载等；API Gateway 更偏应用入口治理，例如认证、路由、限流、灰度、统一日志和协议转换。两者职责可由不同产品实现，也可能部分重叠。

业务服务尽量保持无状态，实例才能自由扩缩容；需要共享的 session/状态放到数据库、Redis 等外部系统。
### 30 秒面试回答
LB 解决“请求发给哪个健康实例”，Gateway 解决“请求进入系统前如何统一治理”。系统设计里我会把入口层和具体业务逻辑分开。
### 常见追问
不要把所有业务规则堆到 Gateway，否则会形成新的巨型单体。
### 掌握要求
★★★★☆

---

## 18. Observability：Logs / Metrics / Traces
### 完整面试题
线上某个 API 偶尔 2 秒，平均延迟却只有 100ms，你怎么排查？日志、指标、Trace 各解决什么问题？
### 参考答案与原理
Metrics 适合看整体趋势和分布，例如 QPS、error rate、p95/p99 latency；Logs 记录离散事件和上下文；Distributed Trace 用 trace/span 串起一次请求跨多个服务的调用链。

排查长尾延迟时先通过指标确认发生在哪个时间段/接口，再用 trace 找慢在哪个 span，最后结合日志看具体输入、错误和依赖状态。三者应通过 request/trace id 关联。
### 30 秒面试回答
Metrics 告诉我“哪里异常”，Trace 告诉我“慢在哪一段”，Logs 帮我看“当时具体发生了什么”。Senior+ 系统设计最好把 observability 当成默认能力。
### 常见追问
平均值对长尾延迟不敏感，线上服务更常关注 p95/p99。
### 掌握要求
★★★★★

---

## 19. Backpressure / Overload Protection
### 完整面试题
下游服务突然变慢，为什么简单无限重试会让事故更严重？系统如何做 overload protection？
### 参考答案与原理
当服务处理速度低于请求进入速度时，请求会在队列、连接和内存中持续堆积。无限重试进一步放大流量，形成 retry storm。常见保护包括 timeout、有限次数 + exponential backoff + jitter、queue length 限制、rate limit、circuit breaker、load shedding。

核心原则是：系统过载时宁可快速拒绝一部分工作，也不要让全部请求一起超时拖垮。
### 30 秒面试回答
可靠性不是“失败就一直重试”。重试必须有限、退避并加 jitter；下游长期异常时要熔断或降级，保护整个系统。
### 常见追问
只有幂等或可安全重复的操作才适合自动重试。
### 掌握要求
★★★★☆
