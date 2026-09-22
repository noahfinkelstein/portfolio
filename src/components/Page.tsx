/* ---------------------------------------------------------------------------
   The frame every page sits in: header, content column, footer.

   Props:
     title    — the <h1>. Omit on the home page, where the name is the title.
     current  — this page's nav href, so the nav can mark where you are.
   --------------------------------------------------------------------------- */

import Link from "next/link";
import { site } from "@/content/site";

export default function Page({
  title,
  current,
  children,
}: {
  title?: string;
  current: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <div className="site-header__inner">
            <Link href="/" className="site-header__name">
              {site.name}
            </Link>
            <nav className="site-nav">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.href === current ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="wrap">
        {title ? <h1 className="page-title">{title}</h1> : null}
        {children}
      </main>

      <footer className="site-footer">
        <div className="wrap">
          {site.links
            .filter((l) => l.href)
            .map((l, i) => (
              <span key={l.href}>
                {i > 0 ? " · " : null}
                <a href={l.href}>{l.label}</a>
              </span>
            ))}
          {" · "}
          <a href={`mailto:${site.email}`}>Email</a>
        </div>
      </footer>
    </>
  );
}
