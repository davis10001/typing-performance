# TP-103 · TestShell 与定时入口

**Epic**：E1 测试核心 · **状态**：ready-for-dev

## 用户价值

作为访客，我可以在任一时长页无干扰地开始、输入并完成测试。

## 范围与来源

范围：P-TEST、DurationSelector、TextRenderer、焦点与键盘行为、1/3/5 路由复用。非范围：结果历史、benchmark 内容、广告。

来源：FR-01/02/03、NFR-01/06/07、UJ-01、UXF-01、P-TEST、UX 06 视觉规范；AD-02。前置：TP-102。

## 验收条件

1. 三个时长页复用同一 TestShell；其默认时长、H1 和辅助文案匹配 route config。
2. Start 进入 3-2-1 countdown，Running 自动将焦点置于唯一输入目标；计时结束立即冻结输入并把完成 result 交给下游。
3. Running 显示 current/correct/incorrect token，错误不只依赖颜色；允许 Backspace，拒绝粘贴/拖放且提供一次非阻塞提示。
4. 375px 和桌面宽度均无主操作遮挡；全部操作可键盘完成，焦点可见，计时变化不逐字符打断读屏。Ready/Running 符合 UX 06 的黑色框架、白色测试舱与绿色主操作规则。
5. 结束/离开 Running 不产生继续可编辑的 session。

## 开发任务与测试

- 实现 TestShell 与选择器并桥接 engine（AC1–2）。
- 实现按 token 的局部渲染及输入事件适配（AC3）。
- 加 focus 管理、aria 提示、responsive 布局（AC4）。
- RTL 覆盖状态转换/粘贴提示；Playwright 完成各时长短化测试配置的输入与结束（AC1–5）。

## 技术约束

不把每次输入写全局 store 或导致整页渲染；Running 无营销 modal/导航干扰。 
