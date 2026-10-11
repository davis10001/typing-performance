# TypingLevel · launch verification · 2026-10-11

## Scope and approval

- Launch brand: TypingLevel; production domain: `how-type.com`.
- Product owner confirmed all 67 current English passages for launch, excluded public benchmark values, and chose to keep GA4 and Vercel Analytics / Speed Insights off.
- Product owner approved the English `/privacy` notice and attested in chat on 2026-10-11 that the manual screen-reader, target-browser/device, performance, SEO, and privacy acceptance checks had been completed. This document records that attestation; it does not claim those manual checks were independently repeated by the implementation agent.

## Independently verified in this checkout

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: 33 tests passed across 8 files.
- `npm run test:e2e -- --workers=1 --reporter=line`: 125 tests passed across desktop, tablet, mobile, Firefox, and WebKit. The suite covers keyboard test flow, local-history failure and clearing, accessibility checks, no horizontal overflow, SEO routes, and absence of analytics vendors while disabled. A mobile toolbar overlap found during the first run was fixed before this clean serial run.
- `NEXT_PUBLIC_SITE_URL=https://how-type.com NEXT_PUBLIC_ANALYTICS_MODE=off npx next build --webpack`: passed; `/privacy` is statically rendered. The local default Turbopack build could not bind a worker port in the sandbox, but Vercel's remote Turbopack build completed successfully for production deployment `dpl_AL7yGgrn9ZdrZwExB8SNENoxRKbw` after correcting the Vercel project preset to Next.js. The first deployment (`dpl_78cJxikW6BDqNaGFYKVvzpydaG4b`) had incorrectly used the Other preset and did not serve the site; it was superseded.
- Generated HTML has the `https://how-type.com/privacy` canonical. The deployed sitemap uses the production HTTPS origin and includes `/privacy`.
- The public Vercel alias `https://typing-level.vercel.app` returned HTTP 200 for `/`, `/privacy`, `/sitemap.xml`, `/robots.txt`, and `/1-minute-typing-test` after the corrected deployment.
- After the product owner updated Spaceship DNS, direct queries to its authoritative `launch1.spaceship.net` server returned apex A records `216.198.79.1` and `64.29.17.1`. Vercel domain verification reported `configured_correctly`. No Spaceship DNS change was made by the implementation agent.
- An HTTPS certificate for `how-type.com` was issued in Vercel. All launch routes (`/`, `/privacy`, `/typing-test`, five timed test pages, two explanatory pages, `/sitemap.xml`, and `/robots.txt`) returned HTTP 200 over valid HTTPS on the production domain. The production sitemap lists canonical `https://how-type.com` URLs including `/privacy`.

## Post-deployment checks

- Confirm in a real browser that no analytics requests and no raw typed text or keystroke content leave the page; automated prelaunch checks passed, but this production network inspection has not been repeated here.
- Monitor real-user LCP / CLS / INP targets only when an approved privacy-compatible measurement method is available; prelaunch tests cannot establish production p75 values.
