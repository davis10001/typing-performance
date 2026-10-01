# 08 指标与实验

## 事件与口径

| 事件 | 触发 | 最小属性 | 用途 |
|---|---|---|---|
| `test_view` | 测试入口呈现 | page, configured_duration | 入口曝光 |
| `test_start` | Countdown 开始 | duration, entry_page | 启动率 |
| `test_complete` | Session Completed | duration, wpm_bucket, accuracy_bucket, anomaly_flags | 完成率；不传原始输入 |
| `result_retest` | 结果页选择重测 | from_duration, to_duration | 重测意愿 |
| `benchmark_click` | 结果页进入解释 | target_page | 解释需求 |
| `history_clear` | 用户清除本地历史 | count_bucket | 隐私/历史使用 |

**指标**：Start Rate = starts/views；Completion Rate = completed/starts；Retest Rate = retest clicks/completed；7-day Return = 完成后 7 日内再次 start 的匿名近似（仅在合规分析工具支持的情况下）。所有指标按入口页和时长切分，不能把不同 intent 混为一个结论。

## 实验与决策

P0 不做主动 A/B 测试。首批数据先形成基线：若某页面产生明显浏览但低启动，优先审查 intent/CTA；若启动高但完成低，优先审查输入体验与时长；若完成高而重测低，审查结果解释与下一步。任何因数据样本不足得出的结论均标注为待验证。

反向信号：输入性能恶化、异常率上升、内容页高跳出但低启动、收集到超出最小化范围的数据。
