/**
 * ============================================================================
 *  FOOTER  —  bottom bar on every page.
 * ============================================================================
 *
 * Shows copyright + social icon links. Social URLs come from site.config.ts;
 * entries with empty `href` are filtered out (same pattern as Contact section).
 *
 * Server Component (no "use client") — no interactivity needed beyond links.
 */

import { site } from "@/config/site.config";
import { Icon } from "@/components/icons";

export default function Footer() {
  // Hard-coded year avoids server/client hydration mismatch (Date() can differ)
  const year = 2026;

  return (
    <footer className="mt-24 border-t border-border/60 py-10">
      <div className="container-col flex flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-sm text-fg-muted">
          © {year} {site.name}. Built from scratch.
        </p>

        {/* Only show socials that have a real URL */}
        <div className="flex items-center gap-4">
          {site.socials
            .filter((s) => s.href)
            .map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer" // security: don't leak referrer to external sites
                aria-label={s.label}
                className="text-fg-muted transition-colors hover:text-accent"
              >
                <Icon name={s.icon} />
              </a>
            ))}
        </div>
      </div>
    </footer>
  );
}
