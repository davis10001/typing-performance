# 03 数据架构

## PRD 实体映射

| 概念实体 | P0 技术实现 | P1/P2 演进 |
|---|---|---|
| Test Configuration / Test Text | 版本化 JSON 与受校验的 route config | 可继续版本化，不入逐击键表 |
| Test Session | 内存 TypeScript state | 可选匿名汇总提交；不保存 raw keystrokes |
| Test Result | 纯计算对象 + `localStorage` summary | `test_results` 表，`user_id` 可空 |
| Benchmark Definition | 版本化内容配置 | 后续真实样本聚合另建版本，不能覆写 band 语义 |
| Local History | namespaced localStorage，有限条数 | 登录后可迁移为 cloud history（需明确同意） |

P0 `StoredResultSummary`：`id, completedAt, durationSeconds, wpm, rawWpm, accuracy, errors, anomalyFlags, schemaVersion`。不得包含输入全文或逐键数据。读取失败、schema 不兼容或损坏值须安全丢弃该项并保留其余记录。

P1 数据库方向：`test_results(id, user_id nullable, test_type, duration_seconds, wpm, raw_wpm, accuracy, correct_chars, typed_chars, errors, suspicious, created_at)`；证书从已保存结果引用。结果创建是 append-only；P0 本地条目清除不影响任何未来自愿提交的独立服务端记录。
