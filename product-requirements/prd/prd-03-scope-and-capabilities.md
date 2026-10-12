# 03 范围与产品能力

## P0 能力架构

```text
SEO 入口 / 内容页 ─┐
                 ├─> Timed Testing ─> Scoring ─> Result Understanding ─> Retest
本机最近记录 ────────┘                         └─> 本地历史
```

| 能力 | 职责 | P0 边界 |
|---|---|---|
| SEO 入口 | 提供独立 intent 的可索引页面与 CTA | 不批量生成薄页面，不做动态结果索引 |
| Timed Testing | 选择时长、显示文本、接收键盘输入、结束测试 | 英文、1/3/5 分钟、单人、匿名 |
| Scoring | 计算并解释原始成绩 | 不计算 percentile、不做云端逐击键记录 |
| Result Understanding | 呈现成绩、band、解释和下一步 | band 必须可解释且不可伪称真实群体排名 |
| Local History | 保存最近测试汇总 | 仅当前浏览器；用户可清除 |

**当前新增实施范围 Learning V1**：独立 Learn 栏目，Keybr Guided 连续学习与 KTouch 固定课程并列；成熟规则优先、匿名、本机进度。详见 [PRD 10](./prd-10-learning.md)，学习功能不再延期为 P2。

**P1**：可验证证书、KPH/Data Entry、测速结果的错误字符/弱键解释。**P2**：账号/云端历史、真实 percentile、Premium。

**非目标**：完整 K-12 课程、教师后台、多人竞速、排行榜、复杂社交、测试过程中广告、以 AI 文章替代原始产品价值。
