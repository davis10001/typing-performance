# 07 架构决策

| ID | 决策（状态：Accepted） | Binds | Prevents | 可验证 Rule |
|---|---|---|---|---|
| AD-01 | P0 使用单一 Next.js TypeScript 应用 | 路由、内容与 UI 在同仓库 | 微服务、独立实时后端 | 架构/依赖评审无独立服务或消息总线 |
| AD-02 | 计时、匹配和计分在浏览器以纯 TS 运行 | `typing-engine`、`scoring` 无框架依赖 | 每击键 API/数据库写入 | 单测可在无 DOM/网络运行；网络面板无逐键请求 |
| AD-03 | 公开 SEO 内容 SSR/SSG，交互为客户端岛 | 公共页面 metadata/正文 | JS 空壳入口页 | 禁用 JS 的响应仍含 H1、正文、canonical |
| AD-04 | P0 结果以本机、有限、可清除摘要保存 | Local history schema/version | 账号/云端历史、原始键入持久化 | storage 仅含 `StoredResultSummary` 白名单字段 |
| AD-05 | 没有真实样本不做 percentile/verified | Result UI、benchmark 文案 | 虚假统计或认证 | UI/内容检查不得出现 percentiles/verified 宣称 |
| AD-06 | 内容文本须有许可元数据与版本 | content schema/build validation | 未知版权来源 | 每个发布文本均有 sourceType/sourceRef/version |
| AD-07 | 可选外部分析经 adapter 和字段白名单；GA4/Vercel 脚本仅在配置齐备且访客明确同意后加载 | telemetry module、AnalyticsGate | 供应商 SDK 直接散落测试组件、未经同意自动加载 | 事件类型/属性通过 adapter 类型检查；默认构建无外部分析脚本；拒绝不影响测试 |

任何偏离需新增 AD 或更新本表，并在 Epic/Story 中引用；不得仅在代码注释中改变决定。

| ID | Learning V1 决策 | 可验证规则 |
|---|---|---|
| AD-08 | 两种学习模式通过薄适配层接入各自来源引擎；不使用 TestSession 近似替代 | 来源版本固定，原测试与固定轨迹对照，学习结果不写入测试历史 |
| AD-09 | 学习以版本化、本机独立进度保存 | 损坏/未知版本保留；模式隔离、陈旧写入检测、存储失败可见 |
| AD-10 | 优先直接复用并履行原许可；课程缺陷显式审查 | 第三方声明、源码交付、原文件/差异/哈希与内容校验；不静默改教学规则 |
