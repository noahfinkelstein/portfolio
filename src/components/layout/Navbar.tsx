"use client";

/* ---------------------------------------------------------------------------
   Navbar — the running head: the top line of every page, set like the head
   of a journal page. In the normal flow of the page (it scrolls away with
   it), no background, nothing hidden at any width.

     left   the wordmark "Noah Finkelstein", linking home
     right  Work, Writing (only when there are posts), CV, then the theme
            toggle ("Dark" / "Light")

   The current page's link carries aria-current="page" and an underline. On
   narrow screens the links wrap onto a second line under the wordmark. A 1px
   rule runs under the head across the text measure (inside .container's
   gutters), not the full viewport.

   Props:
     hasWriting  false hides "Writing" (no posts yet). The layout passes it.
   Links come from getNav() in src/content/site.ts. A client component only
   for usePathname (the aria-current marking).
   --------------------------------------------------------------------------- */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNav, site, type NavItem } from "@/content/site";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./Navbar.module.css";

export type NavbarProps = {
  hasWriting?: boolean;
};

function isCurrent(item: NavItem, pathname: string): boolean {
  const path = item.activePath ?? item.href.split("#")[0];
  if (!path || path === "/") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar({ hasWriting = true }: NavbarProps) {
  const nav = getNav({ hasWriting });
  const pathname = usePathname() ?? "/";

  return (
    <header className="container" data-print-hide>
      <nav className={styles.head} aria-label="Primary">
        <Link href="/" className={styles.wordmark}>
          {site.name}
        </Link>

        <ul className={styles.links} role="list">
          {nav.map((item) => {
            const current = isCurrent(item, pathname);
            return (
              <li key={item.href}>
                <Link className={styles.link} href={item.href} aria-current={current ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className={styles.toggleItem}>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
