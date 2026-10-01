# Production release gate

This folder is deliberately **not approved** yet. `npm run release:check` must fail until the product owner records reviewed evidence in `approvals.json` and sets a real HTTPS `NEXT_PUBLIC_SITE_URL`.

- `benchmark`: OQ-01 — centrally provided, reviewed band definition file, source, version and reviewer. Do not publish a numeric average, percentile, ranking, or “verified” claim without source review. `content/benchmark/README.md` documents the empty handoff contract.
- `privacyAndDomain`: OQ-02 — TypingLevel is the confirmed launch brand; `typinglevel.com` is preferred but still requires registrar and basic trademark review. The selected stack is Search Console + GA4 + Vercel Analytics/Speed Insights. A reviewed privacy notice, real GA4 ID, Vercel project enablement and an opt-in decision are still required. Until then `NEXT_PUBLIC_ANALYTICS_MODE=off` and no vendor script loads.
- `testTextLicense`: OQ-03 — the two original passages are listed in `content/test-texts/launch-copy-v1.md` as approved **for Launch Copy V1 review**. Record final text/version and reviewer before enabling a production release.
- `verification`: link or path to CI evidence plus manual keyboard, screen reader, target-browser, performance, SEO and privacy checks.

No automated production deployment is configured. Add one only after the target host and release authority are chosen. The PR/main CI workflow verifies quality but does not bypass these release gates.

For Search Console, create a Domain property after acquiring the domain, then verify control through the DNS record supplied by Google. Do not paste a placeholder verification token into page metadata. GA4 and Vercel scripts are mounted only after an explicit visitor opt-in; declining leaves the test fully functional. Reopening “Analytics choices” and declining after acceptance reloads the page to remove injected vendor scripts. The event adapter accepts only the six documented event names with bucketed data, and Vercel URLs are stripped of query strings and fragments before transmission.

Implementation references: [Search Console Domain property verification](https://support.google.com/webmasters/answer/34592?hl=en), [Google basic vs. advanced consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode), [Next.js GA4 component](https://nextjs.org/docs/app/guides/third-party-libraries), [Vercel Analytics privacy controls](https://vercel.com/docs/analytics/privacy-policy), [Vercel Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy). These are technical references, not a substitute for legal review.
