# 09 Learning V1 · 接入架构

来源：[Learning PRD](../product-requirements/prd/prd-10-learning.md)、[实施方案](../development/learning-implementation-plan.md)。本文件是计划边界；实际完成范围以实施记录为准。

## 模块边界

```text
Learn pages / learning input UI
 ├─ Guided adapter → pinned Keybr Guided core + original resources
 ├─ Course adapter → reviewed KTouch content + source-backed session/pass rules
 ├─ Existing keyboard guide / presentation primitives
 └─ Learning repository → mode-specific versioned browser-local states

Timed Test → existing typing-engine / scoring / test history (separate)
```

两种引擎可共用 UI 和存储运输层，不合并统计语义或教学规则。适配层处理浏览器和上游接口的映射，不能把原算法重写成“简单版”。框架与数据导入的版本读 `lib/learning/source-baseline.json`。

## 计划目录

| 路径 | 职责 |
|---|---|
| `lib/learning/source-baseline.json` | 锁定上游版本、授权选择、审查状态 |
| `lib/learning/course-audit.ts` | 无副作用的课程内容范围与身份审查 |
| `lib/learning/repository.ts` | 隔离的本地学习状态信封及读写错误处理 |
| `scripts/audit-learning-sources.mjs` | 从锁定原版本只读生成审查报告 |
| `vendor/keybr/` | 锁定的 Guided、TextInput、资源及许可证快照；哈希验证 |
| `vendor/ktouch/` | 原 GB 课程、仓库许可证文本与未关闭的文件级许可说明 |
| `lib/learning/guided-*.ts` | 原核心、原输入与状态的薄适配层 |
| `lib/learning/course-*.ts` | 确定性内容转换、KTouch 输入/计分/访问和状态 |
| `components/learning/` / `app/learn/` | 单页默认练习、全课可选目录、结果、说明和本机恢复 |

源码与课程直接复用前保留各自来源、许可、内容哈希；版本更新显式进行。不同引擎的 JSON 状态由对应验证器解析；存储层不推断其业务含义。禁止将上下文中的源码例子或旧帮助文字当成完整算法。

## 数据与一致性

独立 localStorage key；每个模式含规则版本、内容版本和布局。持久化仅包含引擎恢复所需的序列化状态，不含 DOM、原始输入事件或身份数据。来源更新不兼容时保留旧记录并显示需要用户选择的恢复路径，不自动清零。

保存采用读取 token 检查陈旧写入；这只能发现已经发生的跨标签更新，不能单独提供原子 CAS。浏览器接入阶段使用 Web Locks 串行化读改写，配合 storage 事件提示；测试必须覆盖无锁回退，不得宣称强事务保证。

## 开源交付

用户已选择接受相关开源义务。导入源码时加入第三方声明和原许可证；修改保留说明。启用在线学习前准备对应部署的源码获取入口，提供必要构建材料。源码包范围按实际集成和许可确定，不简单声称“只开源一个组件就够了”。未授权自动发布用户现有仓库；当前不执行部署。

## 验证

学习核心以原测试和固定轨迹对照为主，项目测试覆盖数据隔离、内容约束、错误恢复、重复完成及输入边界。浏览器旅程覆盖 Learn 默认练习、粘贴拒绝、有效结果只存一次、任意课次可访问、移动端无溢出和清除隔离。既有测速回归继续运行。
