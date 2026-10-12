# 05 概念领域模型

本模型使用业务语言；数据库表、字段类型和 API 在架构文档定义。

## 术语与实体

| 实体 | 定义与生命周期 |
|---|---|
| Test Configuration | 用户可选择的测试条件：时长、语言、文本难度；P0 为固定英文与 1/3/5 分钟 |
| Test Session | 一次从 Ready 到 Completed/Abandoned 的测试尝试；不能被另一轮测试续写 |
| Test Text | 被输入的许可文本；一次 Session 关联一个文本版本 |
| Keystroke Assessment | 对输入与预期文本在当前位置的正确/错误判断；P0 仅在客户端临时存在 |
| Test Result | 已完成 Session 的汇总成绩与异常标志；它是 Result Page 和 Local History 的业务依据 |
| Benchmark Definition | 对成绩作说明性解释的、可追溯来源的区间定义；不是用户样本 percentile |
| Result Interpretation | Test Result 对应的 score、band、说明与下一步链接 |
| Local History | 当前浏览器持有的一组 Test Result 摘要；可删除、不可跨设备保证 |

## 关系与事件

```text
Test Configuration 1 ── * Test Session * ── 1 Test Text
Test Session (completed) 1 ── 1 Test Result ── 1 Result Interpretation
Benchmark Definition 1 ── * Result Interpretation
Local History 1 ── * Test Result summary
```

关键事件：`TestStarted`、`TestInterrupted`、`TestCompleted`、`ResultInterpreted`、`RetestChosen`、`LocalHistoryCleared`。Session 在 Completed 或 Abandoned 后不可返回 Running；Result 仅由 Completed Session 产生。

## 映射

UJ-01 主要使用 Configuration、Session、Text、Result；UJ-02 使用 Result、Benchmark、Interpretation；UJ-03/05 使用 Local History。FR-02–04 承载 Session/Result，FR-05 承载 Benchmark/Interpretation，FR-07 承载 Local History。

## Learning V1 扩展

Learning Attempt 是一次学习练习，不是 Test Session。Guided Progress 保存 Keybr 原规则所需的有效统计；Course Progress 保存某一来源/版本课程的完成状态。Course 和 Lesson 分别代表有序课程与具体课次；二者都有来源版本和内容版本。某课通过不自动意味着 Guided 解锁。详细生命周期见 [PRD 10](./prd-10-learning.md)。
