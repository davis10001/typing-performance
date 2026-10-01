# Typing Performance · Epics & Stories

**版本**：1.1 · **状态**：READY-FOR-DEVELOPMENT。需求来源：[PRD](../product-requirements/prd/prd-00-index.md)，设计来源：[UX/UI](../ux-ui/ux-00-index.md)，技术约束：[Architecture](../architecture/arch-00-index.md)。

## Epic 总览与顺序

| Epic | 业务价值 | Stories | 前置 |
|---|---|---|---|
| E1 测试核心 | 用户能完成可信的本地定时测试 | TP-101, TP-102, TP-103 | 无 |
| E2 结果与 SEO 闭环 | 用户能理解、重测，搜索页能导入工具 | TP-201, TP-202 | E1 |
| E3 上线质量 | 产品可观察、可访问、可安全发布 | TP-301, TP-302 | E1/E2 |

## Story 清单

| Story | 价值与范围 | FR/NFR/UJ/UX | AD / 依赖 |
|---|---|---|---|
| TP-101 项目骨架与内容契约 | 建立可测 Next.js 项目、路由配置、许可文本契约 | FR-01,08; NFR-02,03,08; UJ-01,04 | AD-01,03,06；无 |
| TP-102 纯打字引擎与计分 | 以纯 TS 实现状态、输入、异常和成绩 | FR-02,03,04; NFR-01,03 | AD-02；TP-101 |
| TP-103 TestShell 与定时入口 | 将 engine 接入 P-TEST，支持 1/3/5 分钟 | FR-01,02,03; NFR-01,06,07; UJ-01; UXF-01 | AD-02；TP-102 |
| TP-201 结果、band 与本地历史 | 完成 P-RESULT、解释、重测和可清除历史 | FR-04–07; NFR-03–05,07; UJ-02,03,05; UXF-02/03/05 | AD-04,05；TP-102/103 |
| TP-202 Benchmark 内容与 SEO 入口 | 交付独立 intent 页面、metadata、sitemap 与互链 | FR-01,05,08; NFR-02,08; UJ-04; UXF-04 | AD-03,06；TP-101/201 |
| TP-301 观测、隐私与生产护栏 | 以白名单事件、脱敏错误与性能预算保障运营 | FR-09; NFR-02,04,05; UJ-01–05 | AD-07；TP-101/201/202 |
| TP-302 无障碍、E2E 与发布流水线 | 验证全闭环，建立可重复的质量门禁 | NFR-01–08; UJ-01–05 | AD-01–07；TP-103/201/202/301 |

## Epic 完成条件

- **E1**：桌面和移动可完成 1/3/5 分钟测试，且纯函数计分所有边界测试通过。
- **E2**：用户能获得解释、重测、查看/清除本机历史；公开入口可被索引且内容并非薄页。
- **E3**：关键旅程 E2E、accessibility/SEO smoke 与 CI 门禁通过；发布前 OQ-01/02/03 的生产范围问题已关闭。

## 覆盖矩阵

| 需求 | 覆盖 Story |
|---|---|
| FR-01 | TP-101, TP-103, TP-202 |
| FR-02–04 | TP-102, TP-103, TP-201 |
| FR-05–07 | TP-201, TP-202 |
| FR-08 | TP-101, TP-202 |
| FR-09 | TP-301 |
| NFR-01 | TP-102, TP-103, TP-302 |
| NFR-02 | TP-101, TP-202, TP-301, TP-302 |
| NFR-03 | TP-101, TP-102, TP-201, TP-302 |
| NFR-04–05 | TP-201, TP-301, TP-302 |
| NFR-06–07 | TP-103, TP-201, TP-302 |
| NFR-08 | TP-101, TP-202, TP-302 |

不存在前向依赖：所有 Story 只依赖同一 Epic 前序或更早 Epic。P1/ P2 不进入本次 Sprint Status。
