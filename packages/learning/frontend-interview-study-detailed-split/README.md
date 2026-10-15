# Frontend / Full-stack / AI Interview Study — Detailed Edition

> 更新时间：2026-10-02
> 定位：Senior / Staff 前端、Full-stack TypeScript、AI-native Software Engineer。
> 原则：覆盖主流高频，不为了“全”塞偏门细节。每个知识点优先写成可直接面试回答的形式。

## 阅读方式

每个知识点统一包含：

1. **完整面试题**：明确面试官真正想让你解释什么；
2. **参考答案与原理**：给出具体机制，不只写一句定义；
3. **关键展开 / 代码示例**：对高频核心点进一步解释“为什么”；
4. **30 秒面试回答**：适合先给结论，再等面试官追问；
5. **常见追问**：用于继续自测；
6. **掌握要求**：★★★★★ 为必须熟练。

## 覆盖范围

| 文件 | 主体内容 | 定位 |
|---|---|---|
| 01-javascript.md | 类型、闭包、this、原型、Event Loop、Promise、模块、GC、类型转换 | 必会 |
| 02-typescript.md | type/interface、narrowing、generic、utility/mapped/conditional、tsconfig/.d.ts | 必会 |
| 03-react.md | reconciliation、Fiber、双树、Hooks、状态、调度、SSR、虚拟列表 | 必会 |
| 04-browser-network-security.md | 渲染、事件、Worker、HTTP/TLS、缓存、CORS、安全、存储、实时通信 | 必会 |
| 05-css-performance.md | CSS 主流基础、Web Vitals、性能定位、Long Task | 高频 |
| 06-frontend-engineering.md | Vite/Webpack、Monorepo、MFE、测试、CI/CD、监控、Source Map | Senior+ 必会 |
| 07-node-backend-database.md | Node、API、Auth、DB/事务/MVCC/锁、缓存、MQ、限流、读写分离 | Full-stack 必会 |
| 08-system-design.md | 设计框架、异步系统、平台、LB/Gateway、Observability、过载保护 | Senior+ 必会 |
| 09-coding-handwrite.md | 高频前端手写 + 核心 LeetCode | 面试必练 |
| 10-ai-engineering.md | Tool/Agent/RAG/MCP/Eval/Tracing/Guardrail/Harness | AI-native 主线 |
| 11-software-design.md | OOP/FP、DI、SOLID、状态机、常见设计模式、抽象时机 | Senior+ 必会 |

## 有意不深挖的内容

暂不把以下内容当主线：DNS Prefetch 等零散资源 hint 细节、极深 React 源码字段、冷门 CSS Hack、竞赛型算法、复杂 TypeScript 类型体操、底层密码学证明。

原因：这些内容对当前 Senior/Staff 前端 + Full-stack 面试的投入产出比低。遇到具体岗位 JD 再定向补。

## 建议复习顺序

```text
JavaScript → React → Browser/Network/Security → Performance
→ Frontend Engineering → Node/DB → System Design
→ Coding 穿插练习 → AI Engineering
```
