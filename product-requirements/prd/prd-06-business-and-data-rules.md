# 06 业务与数据规则

## 测试与计分

1. 状态只允许 `Ready → Countdown → Running → Completed` 或 `Ready/Countdown/Running → Abandoned`；Completed 后不得继续编辑。
2. 结果实际分钟数来自真实运行时间；展示倒计时不得作为唯一计分依据。
3. `Raw WPM = typed characters ÷ 5 ÷ elapsed minutes`；`WPM = correct characters ÷ 5 ÷ elapsed minutes`；`Accuracy = correct keystrokes ÷ total keystrokes × 100`。零击键或零真实时长不得除零，显示为不可得而非伪造 0 WPM。
4. Backspace 允许；粘贴、拖放文本和非预期组合输入必须被忽略并记录为异常信号。P0 的失焦/页面隐藏不阻断结果，但在 Session 中标记。
5. 新测试是新 Session；不得把同一用户多次尝试拼接为一次成绩。

## 展示与数据边界

1. Benchmark Band 只能写为说明性区间，必须有版本与内容来源；不得使用“超过 X% 用户”或相似 percentile 宣称。
2. P0 本地历史仅保存完成成绩摘要、时间、时长及必要异常标志；不保存原文、原始逐击键或可识别身份。
3. 用户清除本地历史后，产品不得在本机恢复该数据。
4. P0 仅使用匿名访客，无需授权/角色体系。P1 Certificate 的可信度、公开展示与撤销规则须在进入范围时补充。
5. 所有 SEO 公开页均为内容或工具入口；个性化结果与 Local History 不得产生可索引的公开 URL。
