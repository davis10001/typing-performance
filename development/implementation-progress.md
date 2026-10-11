# P0 实施记录 · 2026-10-01

## Learning V1 增量实施 · 2026-10-12

需求与来源审查始于 2026-10-11；以下是新增实施记录，不覆盖原 P0 的历史证据。

| Story | 状态 | 本轮交付 | 尚缺 |
|---|---|---|---|
| TP-401 | Functional baseline complete | 锁定并哈希验证 Keybr/KTouch；规则、输入与 15 课来源审查；GB 最小修复可追溯 | KTouch 文件级许可映射的发布签核 |
| TP-402 | Done | 两模式状态、版本保护、去重、Web Locks、冲突/损坏/清除隔离 | — |
| TP-403 | Done | 原 Guided、模型/词库、TextInput/makeStats、有效结果与解锁轨迹 | — |
| TP-404 | Functional complete | 15 课、KTouch 强制纠错、计分、两类访问和单步解锁 | 许可发布门禁归 TP-406 |
| TP-405 | Done | Learn 入口、两路径、目录/练习/结果/恢复/异常/清除 | — |
| TP-406 | In progress | 单元、浏览器、可访问性、响应式、测速回归和生产构建 | 对应部署源码入口、KTouch 许可签核、实际发布 |

学习代码与页面已在本地项目中实现，但没有执行生产部署或公开仓库操作。现有测速路由、计分与历史保持独立。详细方案：[Learning 实施方案](./learning-implementation-plan.md)。

来源审查运行结果：Keybr 默认参数与 AGPL 校验成功；KTouch US 检出 6 项越界字符问题，GB 检出 1 项大写字符未练问题，脚本按设计退出 1。该失败属于候选素材质量，不伪装成通过。

本轮验证（2026-10-12）：

- `npm run lint`、`npm run typecheck` 通过。
- `npm run test`：20 个文件、90 个测试通过。
- 44 份 Markdown 本地链接检查通过；`git diff --check` 通过。
- `npm run build -- --webpack`：编译、类型检查、33 个静态页面构建通过。
- 默认 `npm run build` 在 Turbopack 的 CSS 编译子进程报 `binding to a port / Operation not permitted`，允许权限重试仍复现；依照当前 Next CLI 文档改用官方 Webpack 构建路径完成验证。未改项目默认构建脚本，不能把默认 `npm run check` 整体写为通过。
- 学习 E2E 覆盖 Chromium 三视口、Firefox/WebKit：两入口、原模型加载、粘贴拒绝、有效结果保存、KTouch 纠错/解锁、清除隔离和 axe。全站 4 worker 首轮 143 通过/4 跳过/13 资源争用超时；13 项以单 worker 重跑全部通过。

---

状态：**核心测试已实现；生产发布未就绪**。本记录将代码与现有 Story 对齐，不替代产品/内容/合规审批。

| Story | 当前结果 | 代码/验证证据 | 尚缺 |
|---|---|---|---|
| TP-101 | Done | Next 静态路由、TypingLevel 品牌 metadata/字标、文本 Zod schema；`npm run check`、SEO E2E | 生产文本许可审批归 OQ-03 |
| TP-102 | Done | `lib/typing-engine/`、`lib/scoring/`；零输入、空 Backspace、无效时间、超时等 unit | — |
| TP-103 | Done | 复用 `TestShell`，3-2-1 倒数、焦点、粘贴拒绝、1/3/5 分钟；三视口 E2E | 后续真实用户输入性能观察 |
| TP-201 | In progress | WPM/Accuracy/Errors、重测、本地历史/清除、空输入不保存；unit + E2E | 说明性 benchmark band 的审校来源与版本 OQ-01 |
| TP-202 | In progress | 两个解释页、独立时长页、canonical/sitemap/robots、SEO smoke | Benchmark 数值/来源审校 OQ-01；不捏造统计 |
| TP-301 | In progress | 事件白名单、bucket、默认 no-op、错误代码/Web Vitals port；GA4 + Vercel 分析同意门、URL 脱敏与组件/浏览器验证 | OQ-02 的真实 GA4 ID、域名、隐私政策与 Vercel 项目启用；正式环境仍保持关闭 |
| TP-302 | In progress | 375/768/1280px Chromium、Firefox/WebKit 桌面 Playwright + axe（Ready/Running/Result）、键盘/无 JS/存储故障回归、GitHub CI、生产门禁脚本 | 最新两个主版本 Chrome/Safari/Firefox/Edge 的真机手动检查、读屏与性能证据；OQ-01/02/03 |

## 本地验证

- `npm run check`：lint、typecheck、19 个 unit/component 测试、production build 全部通过。
- `npm run test:e2e`：55 个用例通过（Chromium 三视口 + Firefox/WebKit 桌面；覆盖时长测试、空输入、历史、存储失败、无 JS SEO、默认无分析脚本、Ready/Running/Result 自动 a11y）。
- 用假 ID 的本机 opt-in 预览：375px 与桌面主 CTA 均无遮挡；同意前外部分析请求为 0，axe 阻塞项为 0。该预览未接入真实 GA/Vercel 项目。
- `npm run release:check`：**按预期失败**，列明未批准的 benchmark、域名/隐私、文本 manifest、验收证据和生产 HTTPS 域名。
- `npm audit`：依赖安装时报告 0 vulnerabilities；上线前需重跑。

## 发布决定

当前不配置自动部署，不上线。`release/approvals.json` 均保持 `approved: false`。TypingLevel 品牌已确认，但 typinglevel.com 仍待注册和基本商标冲突核查；两段文本仅为 Launch Copy V1 送审。只有责任人提供证据并关闭 OQ-01/02/03 后，才能补充 band、启用真实分析、做完整手动验收和生产发布检查。
