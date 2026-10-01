"use client";

/* ---------------------------------------------------------------------------
   Navbar — fixed top bar: "NF" logo, links in heavy caps with an underline
   that grows on hover, and the theme switcher. Slides away when you scroll
   down and comes back when you scroll up. Under 800px the links move into a
   full-screen menu behind a hamburger button.

   Links come from getNav() in src/content/site.ts. No props.
   --------------------------------------------------------------------------- */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNav, site, type NavItem } from "@/content/site";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import styles from "./Navbar.module.css";

const MOBILE_QUERY = "(max-width: 800px)";

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

export default function Navbar() {
  const nav = getNav();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

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

  /* Close the menu on navigation and when the window grows past 800px. */
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

  /* While open: lock page scroll, Escape closes, Tab stays inside. */
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    const firstLink = menuRef.current?.querySelector<HTMLElement>("a, input");
    firstLink?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current || !buttonRef.current) return;
      const focusables = [
        buttonRef.current,
        ...menuRef.current.querySelectorAll<HTMLElement>("a[href], input:checked"),
      ];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={[styles.bar, hidden && !open ? styles.hidden : ""].join(" ")}
        data-print-hide
      >
        <nav className={styles.inner} aria-label="Primary">
          <Link href="/" className={styles.logo} aria-label={`${site.name}, home`}>
            {site.initials}
          </Link>

          <div className={styles.right}>
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
              className={[styles.burger, open ? styles.burgerOpen : ""].join(" ")}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={[styles.menu, open ? styles.menuOpen : ""].join(" ")}
        aria-hidden={!open}
        data-print-hide
      >
        <ul className={styles.menuLinks} role="list">
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                className={styles.menuLink}
                current={isCurrent(item.href)}
                onNavigate={close}
              />
            </li>
          ))}
        </ul>
        <ThemeSwitcher variant="full" />
      </div>
    </>
  );
}
