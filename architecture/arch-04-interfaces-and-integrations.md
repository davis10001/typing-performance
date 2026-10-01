# 04 接口与集成

## P0 内部契约

`createSession(config, text): TestSession`、`applyInput(session, input): TestSession`、`complete(session, endedAt): TestResult | CompletionError`、`interpret(result, benchmarkVersion): ResultInterpretation`、`history.save(summary)` / `history.clear()`。这些契约为 TypeScript 类型与单元测试，不暴露为 HTTP。

文本内容须在 build 时用 schema 校验：`id, language, difficulty, text, sourceType, sourceRef, version`；任一必需许可元数据缺失则拒绝构建/发布该文本。

## 外部边界

Analytics 与 Error Monitoring 通过 adapter 注入，启用前须有隐私配置；事件白名单只允许 PRD 第 08 章字段。P0 不需要结果写 API。

## P1 预留 HTTP 契约（不在 P0 实现）

`POST /api/results` 只接收汇总、带 schema 版本；服务端重新校验范围，不接收逐击键。`POST /api/certificates` 仅引用合格、非可疑的已保存结果；`GET /certificate/[id]` 只显示公开证书字段。所有写操作需速率限制、Zod 校验、统一错误 `{code,message,requestId}`；不可重试的 4xx 不自动重试，临时 5xx 使用有界重试。
