# TP-102 · 纯打字引擎与计分

**Epic**：E1 测试核心 · **状态**：ready-for-dev

## 用户价值

作为测试者，我需要成绩由准确、一致的规则计算，使不同页面给我的结果可信。

## 范围与来源

范围：纯 TS 状态机、匹配/Backspace/paste/visibility 异常处理、完成结果和计分。非范围：React 渲染、LocalStorage、网络请求、认证防作弊。

来源：FR-02/03/04、NFR-01/03、UJ-01、UXF-01；AD-02。前置：TP-101 的类型与文本 config。

## 验收条件

1. Session 仅允许 Ready→Countdown→Running→Completed 或 Abandoned；Completed 后输入不改变结果。
2. 使用显式 `startedAt/endedAt` 的真实 elapsed time；不会因 interval 漂移或零时长除零。
3. 正确、错误、Backspace、粘贴拒绝、失焦/隐藏异常均有确定状态；粘贴不会改变 typed buffer。
4. `rawWpm`、`wpm`、`accuracy` 和 errors 遵循 PRD 公式；同一输入产生同一结果。
5. domain package 不导入 React、浏览器 Storage 或网络 SDK。

## 开发任务与测试

- 定义 `TestSession`, `InputEvent`, `TestResult`, `AnomalyFlag`（AC1–4）。
- 实现状态 reducer/transition guard 和 scorer（AC1–4）。
- 为正常、错误、Backspace、零输入、超时、重复完成、粘贴、visibility 建立单测（AC1–4）。
- 以 lint/import boundary 测试或评审检查 domain 纯度（AC5）。

## 技术约束

只使用 `performance.now()` 的 adapter 或可注入时钟；最终结果不可依赖 UI 倒计时。禁止每键 API 写入。完成定义同项目规范。
