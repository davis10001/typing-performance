# 架构索引 · Typing Performance

**版本**：1.0 · **状态**：P0 可实施基线。来源：[PRD](../product-requirements/prd/prd-00-index.md)、[UX/UI](../ux-ui/ux-00-index.md)。映射：FR-01/02/03→Test UI + `typing-engine`; FR-04→`scoring`; FR-05/06/07→Result/Local History; FR-08→Next.js SEO 页面；FR-09→匿名 analytics。NFR-01–08 分别由 AD-01–07 与运行规则承载。

## 01 系统上下文与原则

定义边界、参与者、职责和依赖方向。详见：[arch-01-system-context-and-principles.md](./arch-01-system-context-and-principles.md)。

## 02 组件与代码映射

描述可替换的组件、交互和建议目录。详见：[arch-02-components-and-code-mapping.md](./arch-02-components-and-code-mapping.md)。

## 03 数据架构

将 PRD 业务实体映射到客户端/后续持久化模型，明确数据生命周期。详见：[arch-03-data-architecture.md](./arch-03-data-architecture.md)。

## 04 接口与集成

界定 P0 本地接口和 P1 服务端契约的边界。详见：[arch-04-interfaces-and-integrations.md](./arch-04-interfaces-and-integrations.md)。

## 05 安全与运行

规定隐私、反滥用、监控、错误处理和恢复要求。详见：[arch-05-security-and-operations.md](./arch-05-security-and-operations.md)。

## 06 部署与可扩展性

描述环境、部署、容量假设、触发条件与降级方案。详见：[arch-06-deployment-and-scalability.md](./arch-06-deployment-and-scalability.md)。

## 07 架构决策

`AD-*` 记录不可随实现偏离的约束及其验证方式。详见：[arch-07-architecture-decisions.md](./arch-07-architecture-decisions.md)。

## 08 延期决策与开放问题

隔离不影响 P0 的未来选择和发布前配置问题。详见：[arch-08-open-questions-and-deferred-decisions.md](./arch-08-open-questions-and-deferred-decisions.md)。
