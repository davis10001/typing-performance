# TP-201 · 结果、Benchmark Band 与本地历史

**Epic**：E2 结果与 SEO 闭环 · **状态**：in-progress（band 来源待 OQ-01）

## 用户价值

作为完成测试的访客，我能理解成绩、以新时长重测，并在自己的浏览器查看/清除最近结果。

## 范围与来源

范围：P-RESULT、ResultCard、说明性 band、RetestActions、namespaced local history 和清除确认。非范围：percentile、账号、云端存储、证书。

来源：FR-04–07、NFR-03–05/07、UJ-02/03/05、UXF-02/03/05、P-RESULT、UX 06 视觉规范；AD-04/05。前置：TP-102、TP-103。

## 验收条件

1. 完成后显示 WPM、Raw WPM、Accuracy、Errors、实际时长与计分说明；缺失/非法结果不渲染为成功成绩。
2. Result 可显示已版本化的说明性 band 及解释链接；界面和文案不得出现真实 percentile、排名或 verified 宣称。
3. 每个重测 action 明确时长，创建新 Ready Session，不混合前一次输入；测试完成会保存有限的结果摘要。
4. LocalStorage 不可用/写入失败时，Result 和重测仍可用，且显示一次保存提示；读取损坏项安全忽略。
5. 用户可确认清除全部本地历史，清除后列表为空且刷新后不恢复；历史不显示个人身份或测试原文。

## 开发任务与测试

- 建立 ResultCard、band interpreter、RetestActions（AC1–3）。
- 实现 schema-versioned history repository、上限和 clear confirmation（AC3–5）。
- 连接 completed result 到 page/session state，定义安全回退（AC1/4）。
- Unit 覆盖 storage 损坏/失败/clear；RTL 断言无 percentile 文案；E2E 完成→重测→清除（AC1–5）。

## 技术约束

只存 arch-03 的 `StoredResultSummary`；不新增 API 或账号。band 内容须来自版本化配置，具体来源仍受 OQ-01 发布门禁约束。
