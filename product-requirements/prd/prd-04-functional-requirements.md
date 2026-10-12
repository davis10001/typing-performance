# 04 功能需求

| ID | 关联旅程 | 角色 / 触发 | 可观察行为与验收结果 |
|---|---|---|---|
| FR-01 测试入口 | UJ-01,04 | 匿名访客打开 `/typing-test` 或 1/3/5 页面 | 页面说明时长与用途，默认预选该页面时长，并可开始测试 |
| FR-02 测试状态机 | UJ-01 | 访客开始测试 | 依次经历 Ready→Countdown→Running→Completed→Result；Running 以真实计时结束后冻结输入 |
| FR-03 输入与反馈 | UJ-01 | Running 时键盘输入 | 显示当前位置、正确/错误状态和必要计时信息；允许 Backspace；粘贴与拖放不写入答案 |
| FR-04 成绩计算 | UJ-01,02 | 测试完成 | 输出 WPM、Raw WPM、Accuracy、Errors、正确字符、输入字符、实际时长；计算口径可在页面解释 |
| FR-05 结果理解 | UJ-02 | 完成成绩存在 | 结果页首先显示成绩及说明性 benchmark band，提供 Average WPM/Speed 与重测 CTA；无真实数据不显示 percentile |
| FR-06 重测与切换 | UJ-03 | 结果页或历史中选择新时长 | 以新一次测试替换当前会话，保留已完成的本地历史；切换时长不混合两次成绩 |
| FR-07 本地历史 | UJ-05 | 测试完成且存储可用 | 保存有限的成绩摘要、时间和时长；可清除所有本地历史；存储失败不影响测试完成 |
| FR-08 SEO 内容页 | UJ-04 | 爬虫或访客访问公开页 | 公开页具有独立 H1、正文、FAQ（如真实存在）、canonical、内链及明确测试 CTA；各时长页有实质差异 |
| FR-09 匿名分析 | UJ-01–05 | 关键动作发生 | 发送最小化的 view/start/complete/retest/history-clear/benchmark-click 事件；不发送测试文本或逐击键内容 |

FR-01–09 都属于 P0。P1 的 Certificate、KPH、Weak-key 需求在功能进入范围时另行编号，避免把未设计功能伪装成 P0 承诺。

2026-10-11 新增 Learning V1：FR-L01–12 已在 [PRD 10](./prd-10-learning.md) 完整定义，分别覆盖两个入口、原 Guided 规则、原固定课程、输入、结果、本机恢复、清除、开源交付与版本。此扩展独立于 FR-01–09，不改变测速计分口径。
