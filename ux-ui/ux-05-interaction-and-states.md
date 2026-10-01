# 05 交互与状态

| 区域 | 默认 | 关键状态 | 规则 |
|---|---|---|---|
| Test shell | Ready，Start 可用 | Countdown / Running / Completed / Abandoned | Running 只允许输入、Backspace 与 End；Completed 不可再编辑 |
| 文本 token | 未输入 | current / correct / incorrect | 颜色之外还使用下划线/图标或文本方式区分，不仅依赖颜色 |
| Timer | 显示选择时长 | countdown / remaining / time-up | 读屏以节制频率公告；time-up 必须明确通知 |
| Result | 成绩完整 | storage warning / no benchmark | 缺 benchmark 时展示原始分数和说明，不生成 band |
| History | 最近记录 | empty / unavailable | 可清除；清除前明确本机且不可恢复 |

所有按钮有 disabled、focus、loading（仅异步分析/存储）和错误状态。P0 无登录和角色差异。系统偏好 `prefers-reduced-motion` 时禁用不必要的 countdown 动画。
