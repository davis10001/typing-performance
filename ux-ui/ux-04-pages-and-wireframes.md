# 04 页面与线框图

## P-TEST · 统一测试页

```text
[Brand] [Typing Test] [Average Speed] [Average WPM]
H1: {1|3|5}-Minute Typing Test       [duration segmented control]
Short intent copy
┌ Test shell ──────────────────────────────────────┐
│ Ready / countdown / elapsed & remaining           │
│ Text with current / correct / incorrect tokens    │
│ [keyboard input target]                           │
│ Start / End test                                  │
└──────────────────────────────────────────────────┘
How scoring works · contextual FAQ · related pages
```

目标：完成 UJ-01；主操作：Start/End/时长切换；离开 Running 前的导航需有结束确认或被抑制。不同 URL 有独立 H1、介绍、FAQ 与推荐时长场景，Test shell 相同。

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
