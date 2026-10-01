# Production release gate

This folder is deliberately **not approved** yet. `npm run release:check` must fail until the product owner records reviewed evidence in `approvals.json` and sets a real HTTPS `NEXT_PUBLIC_SITE_URL`.

- `benchmark`: OQ-01 — approved band source, reviewed text, version, reviewer. Do not publish a numeric average, percentile, ranking, or “verified” claim without source review.
- `privacyAndDomain`: OQ-02 — production domain, privacy policy URL, analytics/cookie decision, reviewer. The current telemetry adapter is no-op; it sends no user events or Web Vitals externally.
- `testTextLicense`: OQ-03 — approved manifest for every enabled passage. Current passages are locally drafted original copy; the product owner must still review the manifest for production use.
- `verification`: link or path to CI evidence plus manual keyboard, screen reader, target-browser, performance, SEO and privacy checks.

No automated production deployment is configured. Add one only after the target host and release authority are chosen. The PR/main CI workflow verifies quality but does not bypass these release gates.
