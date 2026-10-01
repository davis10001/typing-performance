# TP-301 · 匿名观测、隐私与生产护栏

**Epic**：E3 上线质量 · **状态**：ready-for-dev

## 用户价值

作为产品运营者，我可以看见漏斗和故障，同时不把用户的测试内容或身份交给第三方。

## 范围与来源

范围：telemetry adapter、事件白名单、错误脱敏、性能观测、隐私开关/no-op 降级。非范围：选择具体供应商、Cookie 弹窗最终法律文案、服务端用户画像。

来源：FR-09、NFR-02/04/05、UJ-01–05；AD-07。前置：TP-101、TP-201、TP-202。

## 验收条件

1. 只发送 PRD 定义的事件和最小化属性；没有测试原文、逐击键、姓名、邮箱或自由输入。
2. 页面组件不直接引用供应商 SDK；所有事件经类型化 adapter，未配置时无错误降级。
3. 客户端异常可被脱敏报告，过滤 query、测试文本与可能的身份字段；存储/计分失败有可观察计数。
4. Web Vitals 可按页面查看；第三方失败不阻碍测试或结果。

## 开发任务与测试

- 定义 Telemetry port、允许事件 union 和 no-op/provider adapter（AC1–2）。
- 接入 test_view/start/complete/retest/benchmark/history-clear（AC1）。
- 配置错误 scrubber 与 performance hooks（AC3–4）。
- Unit 检查 payload 白名单、无配置降级和 scrubber；浏览器测试确认失败不阻断（AC1–4）。

## 技术约束

在 OQ-02 未关闭前，默认 no-op；不引入跨站或用户身份跟踪。
