# 02 信息架构

```text
Home
├─ Typing Test / 1-minute / 3-minute / 5-minute (P-TEST)
│  └─ Result (P-RESULT, 会话态、不可索引)
├─ Average Typing Speed (P-BENCHMARK)
├─ Average WPM (P-BENCHMARK)
└─ Recent results (P-HISTORY，当前浏览器)

P1：Typing Certificate、KPH Test、Data Entry Test
```

全局导航在 P0 仅保留品牌首页、Typing Test、Average Typing Speed、Average WPM；测试页 Running 状态隐藏可能使用户离开的导航，保留明确“结束本次测试”控制。1/3/5 分钟页之间使用同一时长选择器互链；Benchmark 页面只链接相关工具与解释页，不堆砌关键词链接。
