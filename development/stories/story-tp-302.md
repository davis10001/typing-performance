# TP-302 · 无障碍、端到端验证与发布流水线

**Epic**：E3 上线质量 · **状态**：in-progress（手动验收与发布证据待完成）

## 用户价值

作为用户和维护者，我能确信核心测试在支持设备上可操作、可访问且不会未经检查发布。

## 范围与来源

范围：可访问性修复、跨视口 E2E、SEO/performance smoke、CI 和 preview/prod 门禁。非范围：业务新功能、P1 服务端。

来源：NFR-01–08、UJ-01–05、UX 07；AD-01–07。前置：TP-103、TP-201、TP-202、TP-301。

## 验收条件

1. E2E 覆盖 1/3/5 页面：开始→输入→time-up→Result→重测；覆盖历史 clear 与 content CTA。
2. 在 375px、768px、1280px 宽度下可见主操作、无横向溢出；最新两版目标浏览器 smoke 完成。
3. 自动/手动检查确认键盘顺序、可见焦点、非色彩错误提示、完成公告和 reduced motion；阻塞性 a11y 问题为 0。
4. CI 对 PR 运行 lint、typecheck、unit、关键 E2E、SEO smoke；main 成功后才可部署 Preview/Production 流程。
5. 发布检查要求 OQ-01/02/03 关闭、无线上 P0 禁止项（percentile/verified/逐键上传）并记录 release evidence。

## 开发任务与测试

- 建立 Playwright suites/多视口配置（AC1–2）。
- 使用 axe/手动键盘读屏清单修复问题（AC3）。
- 配置 CI、preview、生产 release checklist（AC4–5）。
- 保存测试摘要和检查证据路径在发布记录（AC4–5）。

## 技术约束

不得用“测试通过”覆盖 OQ-01/02/03 的发布门禁；仅修改状态/文档可不触发重跑全部 E2E。
