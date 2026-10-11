# Production release gate

`npm run release:check` verifies the recorded product approvals and requires a real HTTPS `NEXT_PUBLIC_SITE_URL` before production deployment. The current launch approvals and evidence are recorded in `approvals.json` and `verification-2026-10-11.md`.

- `benchmark`: OQ-01 — the product owner chose **no public benchmark in the first launch** on 2026-10-11. A later release may change `mode` to `published` only with a centrally reviewed source, version and definition. Do not publish numeric averages, percentiles, rankings, or “verified” claims without source review.
- `privacyAndDomain`: OQ-02 — TypingLevel remains the launch brand and `how-type.com` is the selected domain. GA4 and Vercel Analytics/Speed Insights are **off for the first launch** by product-owner decision on 2026-10-11. A reviewed privacy notice and domain/launch sign-off remain required; do not turn analytics on without a separate reviewed release.
- `testTextLicense`: OQ-03 — the product owner confirmed the current 67 passages for launch on 2026-10-11. The text set and decision are recorded in `content/test-texts/launch-copy-v1.md`.
- `verification`: link or path to CI evidence plus manual keyboard, screen reader, target-browser, performance, SEO and privacy checks.

No automated production deployment is configured. Add one only after the target host and release authority are chosen. The PR/main CI workflow verifies quality but does not bypass these release gates.

For Search Console, create a Domain property after acquiring the domain, then verify control through the DNS record supplied by Google. Do not paste a placeholder verification token into page metadata. GA4 and Vercel scripts are mounted only after an explicit visitor opt-in; declining leaves the test fully functional. Reopening “Analytics choices” and declining after acceptance reloads the page to remove injected vendor scripts. The event adapter accepts only the six documented event names with bucketed data, and Vercel URLs are stripped of query strings and fragments before transmission.

Implementation references: [Search Console Domain property verification](https://support.google.com/webmasters/answer/34592?hl=en), [Google basic vs. advanced consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode), [Next.js GA4 component](https://nextjs.org/docs/app/guides/third-party-libraries), [Vercel Analytics privacy controls](https://vercel.com/docs/analytics/privacy-policy), [Vercel Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy). These are technical references, not a substitute for legal review.
