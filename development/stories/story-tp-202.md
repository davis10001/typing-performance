# TP-202 · Benchmark 内容与 SEO 入口

**Epic**：E2 结果与 SEO 闭环 · **状态**：ready-for-dev

## 用户价值

作为从搜索进入的用户，我能读到与问题匹配的解释，并能直接选择合适测试。

## 范围与来源

范围：P-BENCHMARK (`/average-wpm`, `/average-typing-speed`)、时长页独立 copy/FAQ/内链、metadata/canonical/sitemap/robots 和真实时才有的 schema。非范围：批量文章、动态结果索引、未审校统计数字。

来源：FR-01/05/08、NFR-02/08、UJ-04、UXF-04、P-BENCHMARK、UX 06 视觉规范；AD-03/06。前置：TP-101、TP-201。

## 验收条件

1. 两个 benchmark 页面有独立 H1、解答、测试 CTA 和与测试结果的互链；无 JS 时仍保留可读正文。
2. 1/3/5 页不只替换数字：每页有对应场景说明、FAQ 和相关页面链接。
3. 每一公开页生成独立 title/description/canonical；sitemap 只列公开 canonical 页面，robots 可访问。
4. schema 只在页面存在对应可见内容时输出；不为 Result/History 生成索引 URL。
5. 上线内容使用的数值/band 都可追溯到受审校 source/version；OQ-01 未关闭时，生产构建/发布检查必须失败，不得以任何数字或 band 替代。

## 开发任务与测试

- 实现内容模型、公开路由与相关链接组件（AC1–2）。
- 实现 metadata、sitemap、robots、条件 schema（AC3–4）。
- 加 content source 校验和生产 release check（AC5）。
- SEO smoke 用渲染 HTML 断言 title/H1/canonical/正文/robots/sitemap；Playwright 跑 CTA 到 P-TEST（AC1–5）。

## 技术约束

遵守 AD-03/06；内容不是由关键词模板批量生成，结果页绝不索引。
