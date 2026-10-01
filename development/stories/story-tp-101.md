# TP-101 · 项目骨架与内容契约

**Epic**：E1 测试核心 · **状态**：ready-for-dev

## 用户价值

作为搜索访客，我需要一个可加载、可索引的测试入口，确保后续测试页面有稳定的内容和路由基础。

## 范围与来源

范围：Next.js + TypeScript 项目、测试工具、路由/时长 config、合法文本 content schema、公开页面基础 metadata。非范围：实际 engine、输入 UI、任何数据库或供应商 SDK。

来源：FR-01/08、NFR-02/03/08、UJ-01/04、P-TEST/P-BENCHMARK；AD-01/03/06。无前置 Story。

## 验收条件

1. `/typing-test`、`/1-minute-typing-test`、`/3-minute-typing-test`、`/5-minute-typing-test` 返回不同且正确的页面标题/H1/时长配置，公开正文无需客户端脚本可读。
2. 测试文本 schema 要求 `id, language, difficulty, text, sourceType, sourceRef, version`；无效内容在测试/构建中失败。
3. 项目具备 lint、typecheck、unit test 和 Playwright smoke 命令；CI 本地可运行。
4. 不引入后端、数据库、队列或分析 SDK。

## 开发任务与测试

- 初始化应用、严格 TS、Vitest/RTL/Playwright；添加基础 CI 命令（AC1–3）。
- 建立 route/test config 与 content schema/样例许可文本（AC1–2）。
- 构建静态路由壳与 metadata 工具（AC1）。
- 单测 config/schema，Playwright 检查各 route 的 H1/metadata（AC1–3）。

## 技术约束

遵守 AD-01/03/06；内容与 engine 分离；不要猜测版权来源。完成定义：所有验收与测试通过，实际文件/测试记录在实施后补充。
