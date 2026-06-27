"use client";

/**
 * ============================================================================
 *  NAV  —  sticky top navigation bar.
 * ============================================================================
 *
 * "use client" is required because this component uses React state (mobile menu
 * open/closed) and onClick handlers — those only work in Client Components.
 *
 * LINKS come from site.config.ts `nav` — edit that file to add/remove/reorder
 * menu items. This component just renders whatever is in the config.
 *
 * LAYOUT: container-col keeps nav aligned with section content. Sticky + z-50
 * keeps it above hero backgrounds (which use z-0) and section content.
 */

import { useState } from "react";
import Link from "next/link";
import { site } from "@/config/site.config";

export default function Nav() {
  // Mobile hamburger menu visibility (desktop uses md:flex and hides the button)
  const [open, setOpen] = useState(false);

  return (
  <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-md">
      <nav className="container-col flex h-16 items-center justify-between">
        {/* Brand — first name only + accent dot. Links to home "/" */}
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
          onClick={() => setOpen(false)} // close mobile menu if open
        >
          {site.name.split(" ")[0]}
          <span className="text-accent">.</span>
        </Link>

        {/* Desktop nav — hidden below md breakpoint */}
        <ul className="hidden items-center gap-7 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm text-fg-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger — only visible on mobile (md:hidden) */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
        >
          {/* Three bars that animate into an X when `open` is true */}
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-fg transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-fg transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-fg transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile dropdown — conditionally rendered when hamburger is open */}
      {open && (
        <ul className="container-col flex flex-col gap-1 pb-4 md:hidden">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-fg-muted hover:bg-bg-soft hover:text-fg"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
