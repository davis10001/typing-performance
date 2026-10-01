# 07 架构决策

| ID | 决策（状态：Accepted） | Binds | Prevents | 可验证 Rule |
|---|---|---|---|---|
| AD-01 | P0 使用单一 Next.js TypeScript 应用 | 路由、内容与 UI 在同仓库 | 微服务、独立实时后端 | 架构/依赖评审无独立服务或消息总线 |
| AD-02 | 计时、匹配和计分在浏览器以纯 TS 运行 | `typing-engine`、`scoring` 无框架依赖 | 每击键 API/数据库写入 | 单测可在无 DOM/网络运行；网络面板无逐键请求 |
| AD-03 | 公开 SEO 内容 SSR/SSG，交互为客户端岛 | 公共页面 metadata/正文 | JS 空壳入口页 | 禁用 JS 的响应仍含 H1、正文、canonical |
| AD-04 | P0 结果以本机、有限、可清除摘要保存 | Local history schema/version | 账号/云端历史、原始键入持久化 | storage 仅含 `StoredResultSummary` 白名单字段 |
| AD-05 | 没有真实样本不做 percentile/verified | Result UI、benchmark 文案 | 虚假统计或认证 | UI/内容检查不得出现 percentiles/verified 宣称 |
| AD-06 | 内容文本须有许可元数据与版本 | content schema/build validation | 未知版权来源 | 每个发布文本均有 sourceType/sourceRef/version |
| AD-07 | 可选外部分析经 adapter 和字段白名单 | telemetry module | 供应商 SDK 直接散落页面 | 事件类型/属性通过 adapter 类型检查 |

任何偏离需新增 AD 或更新本表，并在 Epic/Story 中引用；不得仅在代码注释中改变决定。
