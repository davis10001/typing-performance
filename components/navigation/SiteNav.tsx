"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNav() {
  const pathname = usePathname();
  const active = pathname === "/" || /^\/(?:[1-9]|10)-minute-typing-test$/.test(pathname) ? "/"
    : pathname.startsWith("/learn") ? "/learn"
      : pathname === "/faq" ? "/faq"
        : ["/good-typing-speed", "/average-typing-speed", "/how-wpm-is-calculated"].includes(pathname) ? "/good-typing-speed"
          : null;
  return <nav className="site-nav" aria-label="Main navigation">
    <Link href="/" aria-current={active === "/" ? "page" : undefined}>Test</Link>
    <Link href="/learn" aria-current={active === "/learn" ? "page" : undefined}>Practice</Link>
    <Link href="/good-typing-speed" aria-current={active === "/good-typing-speed" ? "page" : undefined}>Typing Speed</Link>
    <Link href="/faq" aria-current={active === "/faq" ? "page" : undefined}>FAQ</Link>
  </nav>;
}
