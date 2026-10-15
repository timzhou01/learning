# AI Engineering

> 目标：服务于 AI-native Software Engineer / Coding Agent 学习，强调工程化，不转 ML 研究。

## 1. Token / Context Window
### 问题
Token 和 Context Window 是什么？
### 核心讲解
模型输入输出按 token 计量；Context Window 是单次调用可处理的总上下文。上下文越长通常成本和 latency 越高，也不代表效果一定更好。
### 面试回答
Context engineering 目标是提供最相关、可靠、结构清晰的信息，而不是塞得越多越好。
### 常见追问
长上下文为什么可能效果下降？历史消息怎么压缩？
### 掌握要求
★★★★★

---

## 2. Structured Output
### 问题
为什么 AI 应用要结构化输出？
### 核心讲解
模型结果要驱动程序流程时，应该约束成明确 schema，便于 validation、branching、logging、eval 和 retry。
### 面试回答
给人读可以自然语言，给程序消费应尽量结构化。
### 常见追问
Schema validation 失败怎么办？
### 掌握要求
★★★★★

---

## 3. Tool Calling
### 问题
LLM Tool Calling 的标准流程是什么？
### 核心讲解
App 提供工具 schema → 模型选择工具和参数 → App 验证并执行真实工具 → 结果返回模型 → 模型继续决策。模型本身并不直接拥有工具。
### 面试回答
Tool Calling 是把概率性语言决策和确定性系统能力连接起来。
### 常见追问
Tool 参数如何校验？权限在哪层控制？
### 掌握要求
★★★★★

---

## 4. Agent Loop
### 问题
Agent 和一次普通 LLM 调用有什么区别？
### 核心讲解
Agent 通常循环执行 Observe → Decide → Tool → Observe Result → Decide，直到完成、失败或达到限制。
### 面试回答
Agent 能持续观察环境并采取动作，而不是只生成一次文本。
### 常见追问
如何避免无限循环？什么时候应该用 workflow 而不是 agent？
### 掌握要求
★★★★★

---

## 5. Planning / State Machine
### 问题
Agent 为什么需要 Planning 和明确状态？
### 核心讲解
复杂任务需要拆步骤并追踪状态，例如 planning → ready → running → waiting_approval → completed/failed。
### 面试回答
Plan 的价值是让多步骤任务可检查、可恢复，状态机则让执行生命周期确定化。
### 常见追问
Plan 如何更新？失败后回哪个状态？
### 掌握要求
★★★★☆

---

## 6. Human in the Loop
### 问题
什么时候必须人工审批？
### 核心讲解
Production deploy、merge、删除、支付、权限升级等高风险 side effect 可以由 Agent 准备，但关键边界等待人工 approval。
### 面试回答
Human in the Loop 应放在风险边界，而不是每一步都确认。
### 常见追问
Rejected 后怎么办？Approval 后如何恢复上下文？
### 掌握要求
★★★★★

---

## 7. Memory
### 问题
短期记忆和长期记忆区别？
### 核心讲解
短期是当前 task/conversation state；长期保存稳定偏好、项目事实、历史决策。长期记忆应按需检索，而不是把全部历史原样塞回 prompt。
### 面试回答
Memory 的核心是持久化和相关检索，不是无限增长聊天记录。
### 常见追问
什么时候写 memory？如何避免错误记忆？
### 掌握要求
★★★★☆

---

## 8. RAG
### 问题
RAG 的完整链路是什么？
### 核心讲解
Document processing → chunk → index/embedding → retrieval → optional rerank → relevant context → generation。
### 面试回答
RAG 的核心瓶颈通常是 retrieval quality，而不仅仅是“用了向量数据库”。
### 常见追问
Chunk size 怎么选？Metadata filter 有什么用？
### 掌握要求
★★★★★

---

## 9. Embedding / Hybrid Search / Rerank
### 问题
Embedding、关键词检索和 Rerank 如何组合？
### 核心讲解
Embedding 做语义相似；Keyword Search 对精确符号、错误码、代码名很强；Hybrid Search 提高 recall，再通过 reranker 提高最终 precision。
### 面试回答
实际 RAG 不应默认只做向量搜索。
### 常见追问
Code Repo 为什么尤其需要 keyword/AST 信息？
### 掌握要求
★★★★☆

---

## 10. MCP
### 问题
MCP 是什么？
### 核心讲解
MCP（Model Context Protocol）标准化 AI host 连接外部 Tools、Resources、Prompts。典型角色是 MCP Client 和 MCP Server。
### 面试回答
它解决不同 AI 应用与外部能力之间重复定义私有集成协议的问题。
### 常见追问
MCP 和 REST API 区别？Tool 和 Resource 区别？
### 掌握要求
★★★★☆

---

## 11. Coding Agent Workspace
### 问题
为什么 Coding Agent 要在隔离 workspace/worktree 工作？
### 核心讲解
推荐流程：Target Repo → Isolated Workspace → Change → Build/Test → Diff Review → Approval → Apply/Merge → Cleanup。
### 面试回答
隔离 workspace 是执行安全边界，避免未验证修改直接污染主工作区。
### 常见追问
Git worktree 有什么优势？Node_modules 怎么复用？
### 掌握要求
★★★★★

---

## 12. Repo Intelligence
### 问题
Coding Agent 为什么需要 Repo Intelligence？
### 核心讲解
Agent 修改前要理解 repo structure、package boundary、entry point、dependency、symbol、config、test/build command 和 coding convention。不能每次把整个 repo 塞进上下文。
### 面试回答
Repo Intelligence 是把代码库转成可检索、可定位的结构化上下文能力。
### 常见追问
Grep、AST、Semantic Search 如何组合？
### 掌握要求
★★★★★

---

## 13. Repair Loop
### 问题
Agent 修改后 build/test 失败怎么办？
### 核心讲解
Change → Execute Validation → Capture Error → 返回 Error + Diff + Relevant Context → Generate Fix → Rerun，并限制最大 repair 次数。
### 面试回答
真实环境反馈比让模型静态猜测更可靠。
### 常见追问
Repair 是否应该同一 conversation？如何避免越改越乱？
### 掌握要求
★★★★★

---

## 14. AI Code Review
### 问题
已经 build/test 通过，为什么还需要 AI Review？
### 核心讲解
测试只验证已定义行为，不保证 architecture、security、maintainability、diff scope 和未覆盖行为。Review 和 deterministic validation 是互补关系。
### 面试回答
Build/Test 检查“能不能工作”，Review 更多检查“这样改是否合理”。
### 常见追问
Review model 是否要和 Coding model 分开？
### 掌握要求
★★★★☆

---

## 15. Evals
### 问题
AI 应用为什么需要 Evals？
### 核心讲解
模型和 workflow 改动具有概率性，必须有固定 dataset 和 metric 做 regression。Coding Agent 可看 task success、build pass、test pass、unnecessary diff、tool calls 等。
### 面试回答
没有 eval，就无法知道 Prompt/Model/Workflow 的修改到底变好还是变坏。
### 常见追问
LLM-as-a-Judge 有什么问题？Offline 和 Online Eval 区别？
### 掌握要求
★★★★★

---

## 16. Tracing / Observability
### 问题
Agent 应该记录哪些运行信息？
### 核心讲解
Task ID、Model Call、Latency、Token、Tool Call/Result、Retry、Error、State Transition、Final Outcome。多步 Agent 必须可重建执行轨迹。
### 面试回答
要能回答：它做了什么、为什么失败、成本花在哪一步。
### 常见追问
完整 Prompt 能否记录？敏感数据怎么处理？
### 掌握要求
★★★★★

---

## 17. Cost / Latency
### 问题
如何控制 AI 系统成本和延迟？
### 核心讲解
Context reduction、model routing、cache、retrieval filtering、并行独立工具、减少无效 loop、限制输出、离线批处理。
### 面试回答
先通过 trace 找成本和延迟热点，再优化，而不是盲目缩 prompt。
### 常见追问
哪些结果可以 cache？并行工具调用有什么风险？
### 掌握要求
★★★★☆

---

## 18. Guardrails / Permission
### 问题
如何防止 Agent 执行危险操作？
### 核心讲解
不能只靠 system prompt。还需要 tool allowlist、typed schema、filesystem sandbox、command restriction、approval、timeout、quota、secret isolation。
### 面试回答
Prompt 是软约束，真正安全边界必须在执行层实现。
### 常见追问
Shell Tool 怎么限制？Prompt Injection 怎么处理？
### 掌握要求
★★★★★
