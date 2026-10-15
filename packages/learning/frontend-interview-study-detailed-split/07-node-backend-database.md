# Node / Backend / Database

> 目标：达到 Full-stack Senior/Staff 面试需要的后端基础，不追求纯后端专家级深度。


## 5. Database Index / B+ Tree
### 完整面试题
索引为什么能加速查询？为什么常用 B+ Tree？
### 参考答案与原理
索引用额外存储和写成本换查询效率。B+ Tree fan-out 高、树低、叶子有序，适合 page I/O、point query 和 range scan。

### 关键展开
索引本质是“用额外空间和写入成本换查询速度”。B+ Tree 节点有序且分支多，树高低，适合磁盘/页存储；叶子节点按 key 有序，因此既支持等值查找，也支持范围扫描。

索引并不是越多越好：INSERT/UPDATE/DELETE 需要维护索引；低选择性字段、函数包裹列、错误的数据类型转换都可能让优化器放弃或无法充分使用索引。实际判断要看执行计划。

### 30 秒面试回答
索引不是越多越好，要按真实 query pattern 设计。
### 常见追问
Hash Index 为什么不适合 range query？什么列适合索引？
### 掌握要求
★★★★★

---

## 6. Composite Index
### 完整面试题
联合索引和 Leftmost Prefix 是什么？
### 参考答案与原理
索引 `(a,b,c)` 先按 a 排，再按 b、c 排。后续列能否有效使用取决于前面列如何限制查询范围。

### 关键展开
联合索引 `(a,b,c)` 会按 a，再 b，再 c 排序。所谓最左前缀，重点是**查询条件能否利用这个排序结构**。例如只查 b 通常无法直接利用 a 的有序分组；一旦前面的列进入范围条件，后续列对继续缩小索引扫描范围的能力可能受限。

面试不要机械背“必须按顺序写 WHERE”；SQL 条件书写顺序通常不是关键，真正关键是索引列的组织和优化器执行计划。

### 30 秒面试回答
联合索引列顺序必须结合查询条件和排序方式设计。
### 常见追问
只查 b 能否利用 `(a,b)`？Covering Index 是什么？
### 掌握要求
★★★★★

---

## 7. Transaction / ACID / Isolation
### 完整面试题
ACID 和事务隔离级别有哪些？
### 参考答案与原理
ACID：Atomicity、Consistency、Isolation、Durability。隔离级别重点理解 Dirty Read、Non-repeatable Read、Phantom Read，以及 Read Committed、Repeatable Read、Serializable 等。

### 关键展开
ACID：Atomicity 保证事务要么全成要么全回滚；Consistency 是约束在事务前后保持成立；Isolation 控制并发事务彼此可见程度；Durability 保证提交后数据不会因普通故障丢失。

隔离级别是在并发正确性与吞吐之间做权衡。实际数据库还会结合 MVCC、锁、日志实现，并不意味着“高隔离级别就是把所有请求串行化”。

### 30 秒面试回答
隔离级别是在一致性需求和并发性能之间取舍。
### 常见追问
PostgreSQL 默认隔离级别？Serializable 代价？
### 掌握要求
★★★★★

---

## 8. MVCC
### 完整面试题
什么是 MVCC？
### 参考答案与原理
通过记录多个版本和 snapshot，让很多读操作无需与写操作相互阻塞。具体实现因数据库而异。

### 关键展开
MVCC 的目标是让“读”和“写”尽量不要互相阻塞。典型实现会保留行版本信息，并根据事务可见性规则决定当前事务能看到哪个版本。

因此普通一致性读可以读取符合 snapshot 的历史版本，而更新操作仍需要锁和冲突处理。MVCC 不是“完全不用锁”，它主要解决的是多版本读取问题。

### 30 秒面试回答
MVCC 是现代关系数据库提高读写并发的重要机制。
### 常见追问
snapshot 是什么？旧版本怎么清理？
### 掌握要求
★★★★☆

---

## 9. Lost Update / Optimistic / Pessimistic Lock
### 完整面试题
两个请求同时更新同一条记录怎么办？
### 参考答案与原理
可用 version 字段做 Optimistic Lock，也可 `SELECT ... FOR UPDATE` 做 Pessimistic Lock。低冲突场景通常乐观锁更轻。

### 关键展开
Lost Update 的典型过程是两个请求都读取 balance=100，各自计算后写回，其中一次覆盖另一次。

- 悲观锁：先锁行再读改写，如 `SELECT ... FOR UPDATE`，适合冲突高、必须串行修改的关键资源；
- 乐观锁：读取 version，更新时 `WHERE id=? AND version=?`，受影响行数为 0 就说明冲突，需要重试或返回失败；
- 还可以直接用数据库原子更新 `SET stock = stock - 1 WHERE stock > 0` 减少读改写窗口。

### 30 秒面试回答
先判断冲突概率和失败重试成本，再选锁策略。
### 常见追问
CAS 是什么？乐观锁失败怎么处理？
### 掌握要求
★★★★★

---

## 10. Idempotency / Retry
### 完整面试题
为什么关键写操作必须考虑幂等？Retry 有什么风险？
### 参考答案与原理
网络请求可能重复。常用 idempotency key、unique constraint、状态机等防重复。Retry 需要幂等、timeout、exponential backoff、jitter 和次数限制。

### 关键展开
Retry 会放大“请求到底执行没执行成功”的不确定性，所以有副作用的接口必须考虑幂等。常见方式是客户端生成 idempotency key，服务端持久化该 key 对应的处理状态/结果；重复请求直接返回同一结果，而不是再次扣款或创建订单。

幂等 key 要有作用域、过期策略，并且“检查 key + 执行业务”本身需要原子性，否则并发重复请求仍可能穿透。

### 30 秒面试回答
不要依赖“前端只点一次”，而要让服务端重复执行也不产生额外副作用。
### 常见追问
4xx 应不应该 retry？Exactly-once 能不能保证？
### 掌握要求
★★★★★

---


## 12. Redis / Cache Aside
### 完整面试题
Cache Aside 怎么工作？
### 参考答案与原理
读：cache → miss → DB → cache。写通常先更新 DB，再删除 cache。Cache 不是 source of truth。

### 关键展开
Cache Aside 常见流程：读时先查 cache，miss 再查 DB 并回填；写时通常先更新 DB，再删除 cache。删除而不是直接更新 cache，能减少并发下“不同更新顺序导致旧值覆盖新值”的问题。

仍需考虑短暂不一致、删除失败、热点 key、TTL 和缓存雪崩等问题。缓存是性能优化层，不应轻易成为唯一 source of truth。

### 30 秒面试回答
缓存设计要接受短时间不一致，并明确 TTL 和失效策略。
### 常见追问
为什么常删除 cache 而不是 update？Cache Stampede 是什么？
### 掌握要求
★★★★★

---

## 13. Cache Penetration / Breakdown / Avalanche
### 完整面试题
缓存穿透、击穿、雪崩区别？
### 参考答案与原理
穿透：查询不存在数据一直 miss；击穿：单个热点 key 失效；雪崩：大量 key 同时失效或缓存系统故障。
### 30 秒面试回答
三者触发模式不同，治理手段也不同。
### 常见追问
Bloom Filter 什么时候用？TTL 随机化有什么用？
### 掌握要求
★★★★☆

---

## 14. Stateless / Horizontal Scaling
### 完整面试题
为什么可扩展服务强调 stateless？
### 参考答案与原理
如果业务状态只在某台服务内存，请求就依赖特定实例。把持久状态放 DB、distributed cache、object storage 后，实例可随时扩缩容和替换。
### 30 秒面试回答
Stateless 能简化 load balancing、auto scaling 和 failover。
### 常见追问
Session 怎么处理？Sticky Session 有什么问题？
### 掌握要求
★★★★☆

---

## 15. API Error Model / Validation
### 完整面试题
你设计 REST API 时，错误响应应该长什么样？业务错误、参数错误、系统错误怎么区分？为什么不能所有失败都返回 HTTP 200？
### 参考答案与原理
API 应同时使用合适 HTTP status 和稳定业务错误结构，例如 `{ code, message, details, requestId }`。400/422 表示客户端输入问题，401/403 表示认证/授权问题，404 资源不存在，409 可表示冲突，5xx 表示服务端故障。

业务 code 应稳定、可被客户端程序判断；message 可以面向展示或调试，但客户端不应靠解析自然语言决定逻辑。`requestId/traceId` 有助于跨前后端排查。
### 30 秒面试回答
HTTP status 表达协议层类别，业务 code 表达稳定业务语义。全部返回 200 会破坏缓存、监控和通用客户端对错误的理解。
### 常见追问
输入 validation 要在边界尽早做，但真正安全约束仍需落到服务端/数据库层。
### 掌握要求
★★★★☆

---

## 16. Rate Limiting
### 完整面试题
如何给一个 API 做限流？固定窗口、滑动窗口、Token Bucket 有什么区别？分布式部署时计数放哪里？
### 参考答案与原理
限流的目的可能是防滥用、保护下游或做套餐配额。固定窗口简单但边界突刺明显；滑动窗口更平滑但成本更高；Token Bucket 允许一定 burst，同时控制长期平均速率。

单机可内存计数，分布式通常需要 Redis/网关等共享状态，并考虑原子操作、key 维度（IP/user/API）和返回 `429 Too Many Requests`。
### 30 秒面试回答
我会先明确限流维度和是否允许 burst，再选算法。互联网 API 常在 gateway/Redis 做分布式计数，超限返回 429，并最好带 retry 信息。
### 常见追问
限流不是鉴权；攻击防护通常还需要 WAF、配额和异常检测等多层措施。
### 掌握要求
★★★★☆

---

## 17. Read Replica / 读写分离
### 完整面试题
数据库读写分离为什么能扩展读能力？刚写完数据立刻去只读副本读取，为什么可能读不到？怎么处理？
### 参考答案与原理
Primary 负责写入，Replica 通过复制日志追赶数据，多个副本可分担读流量。但复制通常存在延迟，所以刚写入 Primary 后立即读 Replica 可能得到旧值，即 read-after-write inconsistency。

解决方式可以是关键路径短时间读主库、会话级 sticky、等待复制位点、或业务层接受最终一致性。不是所有查询都应该无脑打 replica。
### 30 秒面试回答
读写分离提升 read scalability，但引入 replication lag。需要按业务一致性要求决定哪些读可以走 replica，哪些必须读主库。
### 常见追问
副本不是备份的完全替代品；错误写入也会被复制。
### 掌握要求
★★★★☆
