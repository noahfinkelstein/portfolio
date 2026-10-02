"use client";

/* ---------------------------------------------------------------------------
   Navbar — fixed top bar: the name as a wordmark on the left, the page links
   and the theme switcher on the right. Slides away when you scroll down and
   comes back when you scroll up (and always near the top). Under 800px the
   links move into a panel that drops down under the bar; it scrolls if it
   has to, so nothing is ever out of reach on a short screen.

   Props:
     hasWriting  false hides "Writing" (no posts yet). The layout passes it.
   Links come from getNav() in src/content/site.ts.
   --------------------------------------------------------------------------- */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNav, site, type NavItem } from "@/content/site";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import styles from "./Navbar.module.css";

const MOBILE_QUERY = "(max-width: 800px)";

export type NavbarProps = {
  hasWriting?: boolean;
};

function NavLink({
  item,
  className,
  current,
  onNavigate,
}: {
  item: NavItem;
  className: string;
  current: boolean;
  onNavigate?: () => void;
}) {
  if (item.href.startsWith("mailto:") || /^https?:/.test(item.href)) {
    return (
      <a className={className} href={item.href} onClick={onNavigate}>
        {item.label}
      </a>
    );
  }
  return (
    <Link
      className={className}
      href={item.href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

export default function Navbar({ hasWriting = true }: NavbarProps) {
  const nav = getNav({ hasWriting });
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isCurrent = (href: string) => !href.includes("#") && !href.startsWith("mailto:") && pathname.startsWith(href);

  /* Hide on scroll down, show on scroll up (and always near the top). */
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      if (y < 80) setHidden(false);
      else if (delta > 6) setHidden(true);
      else if (delta < -6) setHidden(false);
      if (Math.abs(delta) > 6 || y < 80) last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  /* Close the panel on navigation and when the window grows past 800px. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      if (!mql.matches) setOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  /* While open: Escape closes, a click outside closes. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className={[styles.bar, hidden && !open ? styles.hidden : ""].join(" ")} data-print-hide>
      <nav className={`container ${styles.inner}`} aria-label="Primary">
        <Link href="/" className={styles.wordmark}>
          {site.name}
        </Link>

        <ul className={styles.links} role="list">
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} className={styles.link} current={isCurrent(item.href)} />
            </li>
          ))}
        </ul>
        <ThemeSwitcher className={styles.switcher} />

        <button
          ref={buttonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <div
        id="site-menu"
        ref={panelRef}
        className={[styles.panel, open ? styles.panelOpen : ""].join(" ")}
        hidden={!open}
      >
        <ul className={`container ${styles.panelLinks}`} role="list">
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} className={styles.panelLink} current={isCurrent(item.href)} onNavigate={close} />
            </li>
          ))}
        </ul>
        <div className={`container ${styles.panelThemes}`}>
          <ThemeSwitcher variant="full" />
        </div>
      </div>
    </header>
  );
}
