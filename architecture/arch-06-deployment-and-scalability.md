# 06 部署与可扩展性

部署为 Vercel（或等价支持 Next.js 的无服务器平台）上的单一 Next.js 应用：Preview 环境用于 PR，Production 绑定主分支。`main` 仅在 lint、typecheck、unit、关键 E2E 和 SEO smoke 成功后部署。

P0 容量假设：页面和测试在边缘/CDN 静态交付，键入不消耗服务器计算，因此横向瓶颈主要在页面流量与第三方 telemetry。通过压缩文本/代码分割、缓存静态内容和延迟加载非输入区组件处理。触发复核：LCP p75 连续 7 日超过 2.5s、INP p75 超过 200ms、客户端异常率或存储错误超过上线基线时暂停体验扩展并排障。

不使用 Redis、队列、WebSocket 或微服务。只有 P1 出现证书批量生成、邮件或持久化写入峰值后，才基于实际队列深度/失败率评估异步任务；不能提前引入。环境变量最小集：analytics/error-monitoring 的公开 key，P1 才增加 Supabase URL/anon key/服务端密钥；密钥由托管平台管理，不提交仓库。
