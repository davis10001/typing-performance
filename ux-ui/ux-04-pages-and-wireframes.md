# 04 页面与线框图

## P-HOME / P-TEST · 首页与统一测试页

```text
[Brand]                                 Test  Lessons  Race  FAQ
H1: Start typing. (首页) / {duration}-Minute Typing Test (时长页)
Short intent copy
┌ Test shell ──────────────────────────────────────┐
│ Ready / countdown / elapsed & remaining           │
│ Duration / difficulty / display controls          │
│ Text with current / correct / incorrect tokens    │
│ [keyboard input target]                           │
│ End test                                          │
└──────────────────────────────────────────────────┘
首页：Recent results
时长页：How scoring works · contextual FAQ · related pages
```

目标：完成 UJ-01；主操作是直接输入、End 和时长切换。首页和时长页共用 Test shell；各时长 URL 保留独立 H1、介绍、FAQ 与推荐时长场景。导航在所有页面保持右侧单行文字；Lessons 和 Race 上线前无路由。

## P-FAQ · 独立帮助页

```text
[Brand]                                 Test  Lessons  Race  FAQ
H1: Typing FAQ.
8 组直接展示的问答：速度、WPM、练习、时长、准确率、成绩波动和错误处理
相关解释页、测试时长页与研究出处
```

目标：让用户在不打断首页直接测试流程的情况下找到常见问题。`/faq` 有独立标题和 canonical，8 个关于速度、准确率与计分的问题和答案直接展示。问答使用无底色的细线框，宽屏两列、窄屏一列；首页不再承载 FAQ 区块。

## P-RESULT · 会话结果

```text
H1: Your typing result
[WPM] [Accuracy] [Raw WPM] [Errors] [Duration]
Your result: {band} · What this means [link]
[Retest same duration] [Try 1 min] [Try 3 min] [Try 5 min]
Recent results (if available) · scoring notes
```

目标：完成 UJ-02/03/05；没有历史时隐藏历史列表而显示低干扰的 empty state。Result 不分配 SEO URL。

## P-BENCHMARK · 基准内容/工具页

```text
H1 · answer summary · source / update note
Band explanation · WPM calculator/example · [Take a 1/3/5 minute test]
FAQ · related tests
```

目标：完成 UJ-04；具体统计、来源和更新时间由 OQ-01 关闭后填充。
