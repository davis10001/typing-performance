# 02 组件与代码映射

| 组件 | 职责 | 承载 FR/NFR |
|---|---|---|
| SEO Page | 路由、metadata、正文、schema、CTA | FR-01/08, NFR-02/08 |
| TestShell | 生命周期 UI、焦点、计时显示和输入适配 | FR-01–03, NFR-01/06/07 |
| Typing Engine | 状态迁移、预期字符匹配、异常信号 | FR-02/03, NFR-03 |
| Scoring | 从完成会话推导不可变成绩 | FR-04, NFR-03 |
| Result/Benchmark | 结果、band、解释、重测 | FR-05/06 |
| History Repository | 本机结果摘要持久化与清除 | FR-07, NFR-04/05 |
| Telemetry Adapter | 最小化匿名事件与错误报告 | FR-09, NFR-04/05 |

建议目录：

```text
app/(marketing)/page.tsx
app/(tests)/[testSlug]/page.tsx
app/(content)/average-wpm/page.tsx
components/typing/{TestShell,TextRenderer,DurationSelector,ResultCard}.tsx
lib/typing-engine/{machine,types}.ts
lib/scoring/{calculate,types}.ts
lib/benchmark/{definitions,interpret}.ts
lib/history/{repository,types}.ts
content/{test-texts,seo}/
lib/telemetry/
tests/{unit,component,e2e}/
```

页面通过配置选择 1/3/5 分钟，不复制 engine。`TextRenderer` 可局部更新；禁止把每个键入提升到全局 React 状态或网络请求。
