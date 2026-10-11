# 学习来源审查 · 2026-10-11

这是一份可复核的调查记录，不代表全部算法和内容已通过发布审查。脚本 `node scripts/audit-learning-sources.mjs` 只读取锁定版本，课文保留在进程内，不写入产品素材或运行时。

## 锁定版本

通过 `git ls-remote` 获取：

- Keybr：`05a37bc5265f65ff538c59c613db29442f345d51`。
- KTouch：`a3f57d03e6c14956378af1176eef3404430c773e`。

来源登记：`lib/learning/source-baseline.json`。升级须另行审查，不追随浮动 master 自动变化。

## Keybr 核查

[固定版本 settings.ts](https://github.com/aradzie/keybr.com/blob/05a37bc5265f65ff538c59c613db29442f345d51/packages/keybr-lesson/lib/settings.ts) 的 SHA-256：`acec7b460a832a8fb2cb22bf21819b30f2b051c73b7ed0943c5a39b5c3480218`。

| 项目 | 观察值 | 含义 |
|---|---|---|
| 默认模式 | Guided | 连续学习基准 |
| targetSpeed | 175 CPM | 原默认值，不代表教学效果承诺 |
| naturalWords | true | 真实单词优先，不代表没有生成词回退 |
| keyboardOrder | false | 不自行改为 F/J 顺序 |
| recoverKeys | false | 不擅自增加该行为 |
| capitals / punctuators | 0 / 0 | 原配置 |
| repeatWords | 1 | 原配置 |

[LICENSE](https://github.com/aradzie/keybr.com/blob/05a37bc5265f65ff538c59c613db29442f345d51/LICENSE) 已确认 AGPL-3.0。用户已接受相关义务并选择优先直接复用源码。还需审查所用词库、生成资源和依赖的各自许可；不把根许可证当成所有资产的授权结论。原代码导入后保留原声明，改动标注，部署时提供对应源码和构建说明。没有把公开私有仓库作为已获授权操作。

### 已追踪到的核心行为

下列是读取锁定源码及测试后的基准，尚不代表接入代码已通过对照：

| 行为 | 源路径 | 观察结果 |
|---|---|---|
| 字母范围 | `packages/keybr-lesson/lib/guided.ts` | 最小 6 字母；默认按模型频率排序，同频按码点；实际字母从模型读取 |
| 解锁与目标键 | 同上、`guided.test.ts` | 默认 recoverKeys=false，按 bestConfidence；曾达标的键保留，已包含键曾达标后加入下一键；未达标键中选择最弱者 |
| 全部曾达标 | `guided.test.ts` | 默认可没有聚焦键；不能擅自加入“当前速度掉下来就重锁”机制 |
| 生成候选 | `guided.ts`、`dictionary.ts` | 过滤键盘范围和长度大于 2 的词；用可用键/聚焦键筛词，取前 1000；不足 15 个时补充生成词 |
| 片段长度 | `text/fragment.ts` | 默认累计词字符至少 100（不计空格），完成整个末词；不是 100 个单词或定时一分钟 |
| 按键样本 | `packages/keybr-result/lib/keystats.ts` | timeToType>0 才更新该键；调用原 makeFilter(0.1)，保留滤波当前值与历史最佳值；滤波实现仍需完整追踪 |
| 资源 | `keybr-content-words/lib/data/words-en.json`、`keybr-phonetic-model/assets/model-en.data` | 已定位原词库与模型，仍需资源来源/许可与加载对照 |

原 `@keybr/lesson` 声明依赖 code、content、keyboard、lang、math、phonetic-model、rand、result、settings、textinput、unicode 共 11 个内部包；直接依赖数不等于传递依赖规模。不能只复制 guided.ts 就声称算法完成。

2026-10-12 更新：已将 Guided 运行依赖、原 TextInput/统计链路、英文词库和英文音系模型的锁定版本原始快照导入 `vendor/keybr/`，未修改上源文件，不相关语言资源未导入。核心文件、词库、模型与许可证由 `npm run learning:verify-vendor` 校验哈希。项目薄适配层已对照默认输入、错误恢复、首字符统计过滤、有效结果、初始化和 6→7 键解锁轨迹；页面完成后只保存一次有效结果。

## KTouch 课程目录

[US 原文件](https://github.com/KDE/ktouch/blob/a3f57d03e6c14956378af1176eef3404430c773e/data/courses/us.xml) SHA-256：`35e7c33abfb522c3f4ca05b9e846cc7a1f321c9cb539d64733ab2550cfad4c33`。

[GB 原文件](https://github.com/KDE/ktouch/blob/a3f57d03e6c14956378af1176eef3404430c773e/data/courses/gb.xml) SHA-256：`54441dfcc0be7fe11bde1e9b6f74f7b3bc7c6134acbeae5369ef8e0a632df20f`。

两个候选均为 15 课，声明字符顺序相同。以下只列结构性元数据，不复制课文。

| 课次 | 标题 | 声明字符 | 审查发现 |
|---|---|---|---|
| 1 | j and f | jf | 两者范围检查通过 |
| 2 | k and d | kd | US 提前出现 r |
| 3 | l and s | ls | US 提前出现 r |
| 4 | c and a | ca | US 提前出现 r |
| 5 | n and t | nt | US 提前出现 i/r/v |
| 6 | i and v | iv | US 提前出现 r |
| 7 | m and e | me | US 提前出现 r |
| 8 | h and r | hr | 两者范围检查通过 |
| 9 | g and o | go | 两者范围检查通过 |
| 10 | b and p | bp | 两者范围检查通过 |
| 11 | q and u | qu | 两者范围检查通过 |
| 12 | w and n | wn | n 已在第 5 课引入；保留原声明，不自动改序 |
| 13 | c and x | cx | c 已在第 4 课引入；保留原声明，不自动改序 |
| 14 | y and z | yz | 两者范围检查通过 |
| 15 | Capitalisation | A–Z | GB 正文缺少 Q/X/Y |

US 正文约 2,100–2,550 字符/课，GB 约 635–741 字符/课；没有因时长偏好截短课文。两个候选都不能被称为覆盖数字/标点的完整键盘课程。GB 包含截断词，不能宣传为全是真实完整单词；要进一步作内容审查。US 与 GB 的布局标签不能互换。

**脚本结果：预期退出 1**，US 6 项未教授字符问题，GB 1 项新字符未练问题；网络失败 0。检查规则来自 [KTouch 官方课程质量说明](https://docs.kde.org/stable5/en/ktouch/ktouch/extending.html)，并不是我们发明的课程标准。

未在课程文件本身发现许可字段/声明；此结果不能证明其无版权或不可用。软件级许可、素材贡献历史和作者声明仍需确认。当前已保留原 `gb.xml` 并转换进运行时，所以文件级许可映射成为生产发布门禁，不能再描述为“尚未复制”。

2026-10-12 已核对锁定源码：`src/ktouch.kcfg` 默认值确为 180 CPM / 98%；`TrainingStats` 以正确字符数计算整数 CPM，准确率为 `1 - errors / (errors + correct)`；`ScoreScreen.qml` 将准确率四舍五入到 0.1 个百分点后使用 `>=`，速度也使用 `>=`。默认强制纠错：错误字符先进入实际输入并记错，退格删除但不回退统计；换行用 Return。`TrainingWidget.qml` 在失焦时停止计时但不重置正文，重新输入时继续计时。初学者只在通过当前解锁边界时解锁下一课；有经验学习者立即获得所有课次。这些语义已固化为运行代码、边界测试和浏览器旅程。

## 差异与处理

| ID | 事实 | 处理状态 |
|---|---|---|
| LS-01 | 旧 Keybr 帮助说明与当前 naturalWords 默认存在差异 | 以锁定源码为准，已写入需求 |
| LS-02 | US 第 2–7 课范围越界 | 暂不选用；若修复，只处理越界内容并保留前后差异 |
| LS-03 | GB 大写课未覆盖 Q/X/Y | 选用 GB；转换时仅在最后一课追加 `Q X Y`，原文件、原哈希、修复原因和输出版本均保留 |
| LS-04 | 候选 XML 无文件级许可声明 | 未关闭；仓库 GPL 文本和生成器署名已保留，文件级映射仍是发布门禁 |

功能一致性接入已完成到可验收页面；尚未完成的是 LS-04 的发布级许可确认，以及部署版本对应源码的公开获取位置。二者不影响本地功能自测，但阻止把 TP-406 标为生产发布完成。
