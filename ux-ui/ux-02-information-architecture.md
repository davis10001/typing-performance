# 02 信息架构

```text
Home / (P-TEST，进入即可打字)
├─ 时长测试 /1-minute /2-minute /3-minute /5-minute /10-minute (P-TEST)
│  └─ Result (P-RESULT，会话态、不可索引)
├─ Recent results (P-HISTORY，首页下方，当前浏览器)
├─ FAQ /faq (独立页面)
├─ Average Typing Speed (P-BENCHMARK)
└─ Average WPM (P-BENCHMARK)

学习模块已确认，待实现路由：Learn `/learn` → Continuous practice `/learn/practice` / Courses `/learn/courses` → `/learn/courses/[lessonId]`。

仍延期：Race（暂不分配路由）；Typing Certificate、KPH Test、Data Entry Test。
```

全局导航在右侧保持一行文字：Test、Lessons、Race、FAQ。Test 返回首页，FAQ 指向 `/faq`；Lessons 和 Race 在模块上线前只显示文字，不提供空链接。首页首屏直接使用现有测试组件，时长选择器连接各时长 URL；`/typing-test` 永久重定向到 `/`。页脚保留品牌名、Privacy，以及内容页的 Start a Test；Benchmark 解释页由 FAQ、测试结果等相关内容链接进入。Running 时离开页面会结束未完成的会话。

Learning V1 可用时将 Lessons 改为 Learn 并连接 `/learn`；不新增一级导航。两个学习入口平级，运行状态和配置集中在练习区顶部。规则见 [UX 08](./ux-08-learning.md)，在真实模块就绪前不提前启用链接。
