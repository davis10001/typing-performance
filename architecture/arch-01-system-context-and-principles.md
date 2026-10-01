# 01 系统上下文与原则

```text
Anonymous visitor / crawler
        │ HTTPS
        ▼
Next.js application (static SEO pages + client Test UI)
        ├── Browser: typing engine, scoring, local history
        ├── Optional anonymous analytics provider
        ├── Error monitoring provider
        └── P1 only: Supabase (results/certificates/auth/storage)
```

系统负责公开内容、测试交互、客户端计分、结果解释、本机历史与最小化遥测；不负责身份验证、课程、排名、证书或服务器逐击键采集（P0）。SEO 内容服务器/静态渲染，输入路径客户端运行；领域与计分纯函数不依赖 React 或供应商 SDK。

原则：简单单体、离线可完成一次测试、内容与交互解耦、最小数据、渐进接入后端。依赖方向：页面/组件 → application adapter → domain (`typing-engine`/`scoring`)；domain 不反向引用 UI、Next.js、Storage 或网络。
