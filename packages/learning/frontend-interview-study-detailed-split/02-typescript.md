# TypeScript

> 目标：掌握现代 TypeScript 工程中的主流类型能力，不做极端 Type Challenge。

## 1. type vs interface
### 完整面试题
`type` 和 `interface` 有什么区别？
### 参考答案与原理
两者都能描述对象。`interface` 支持 declaration merging；`type` 还能直接表示 union、tuple、primitive alias 等。
### 30 秒面试回答
对象契约两者都可以；`interface` 偏对象扩展，`type` 表达能力更广。
### 常见追问
interface 能定义 union 吗？大型项目应该统一哪一种？
### 掌握要求
★★★★★

---

## 2. any / unknown / never
### 完整面试题
三者有什么区别？
### 参考答案与原理
`any` 基本关闭检查；`unknown` 表示未知但使用前必须收窄；`never` 表示不可能出现的值，常用于 exhaustive check。
### 30 秒面试回答
需要接收未知外部值时优先 `unknown`，不要轻易用 `any`。
### 常见追问
never 和 void 区别？
### 掌握要求
★★★★★

---

## 3. Union / Intersection / Literal
### 完整面试题
Union 和 Intersection 有什么区别？
### 参考答案与原理
Union 表示“或”，Intersection 表示“且”。Literal Type 适合把业务状态限制为有限值，例如 `"idle" | "loading" | "done"`。
### 30 秒面试回答
状态建模优先考虑 literal union，而不是宽泛 string。
### 常见追问
属性冲突的 intersection 会怎样？
### 掌握要求
★★★★★

---

## 4. Type Narrowing
### 完整面试题
TypeScript 如何缩小类型范围？
### 参考答案与原理
常见方式：`typeof`、`instanceof`、`in`、相等判断、discriminated union、自定义 type guard。
### 30 秒面试回答
Narrowing 是基于运行时分支让编译器缩小静态类型范围。
### 常见追问
type assertion 和 type guard 区别？
### 掌握要求
★★★★★

---

## 5. Discriminated Union
### 完整面试题
为什么它特别适合状态建模？
### 参考答案与原理
用共同字面量字段区分状态，例如 `{type:"success",data}` / `{type:"error",error}`，switch 后 TypeScript 自动收窄。
### 30 秒面试回答
它比多个 optional field 更安全，可以表达“某些状态组合根本不合法”。
### 常见追问
如何做 exhaustive checking？
### 掌握要求
★★★★★

---

## 6. Generics
### 完整面试题
泛型解决什么问题？
### 参考答案与原理
泛型不是简单“未知类型”，而是表达输入和输出类型之间的关系，例如 `identity<T>(value:T):T`。
### 30 秒面试回答
泛型让同一逻辑复用，同时保留具体类型信息。
### 常见追问
泛型和 unknown 区别？constraint 怎么写？
### 掌握要求
★★★★★

---

## 7. keyof / Indexed Access
### 完整面试题
`keyof T` 和 `T[K]` 是什么？
### 参考答案与原理
`keyof T` 得到 key union；`T[K]` 根据 key 获取属性值类型。两者组合可以写类型安全 getter。
### 30 秒面试回答
它们是大量通用工具类型和类型安全 API 的基础。
### 常见追问
`keyof typeof` 有什么用？
### 掌握要求
★★★★★

---

## 8. Utility Types
### 完整面试题
需要掌握哪些 Utility Types？
### 参考答案与原理
重点：`Partial`、`Required`、`Readonly`、`Pick`、`Omit`、`Record`、`Exclude`、`Extract`、`ReturnType`、`Parameters`。
### 30 秒面试回答
Utility Types 本质是常见类型变换的标准封装。
### 常见追问
Partial / Pick 如何实现？
### 掌握要求
★★★★★

---

## 9. Mapped / Conditional / infer
### 完整面试题
这三类高级类型分别解决什么？
### 参考答案与原理
Mapped Type 遍历 key 生成新对象类型；Conditional Type 在类型层做条件分支；`infer` 在条件匹配中提取某部分类型。
### 30 秒面试回答
理解基本机制即可，不需要钻复杂递归类型。
### 常见追问
ReturnType 如何用 infer 实现？
### 掌握要求
★★★☆☆

---

## 10. tsconfig / .d.ts
### 完整面试题
TypeScript 工程最常见配置和声明文件是什么？
### 参考答案与原理
重点理解 `target`、`module`、`moduleResolution`、`strict`、`lib`、`types`、`declaration`、`sourceMap`。`.d.ts` 描述运行时已存在 API 的静态类型，不提供实际代码。
### 30 秒面试回答
tsconfig 决定类型检查和模块解析策略；`.d.ts` 是 JS 世界和 TS 类型系统之间的契约。
### 常见追问
target 和 module 区别？DefinitelyTyped 是什么？
### 掌握要求
★★★★☆
