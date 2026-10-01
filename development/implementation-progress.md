# P0 实施记录 · 2026-10-01

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
