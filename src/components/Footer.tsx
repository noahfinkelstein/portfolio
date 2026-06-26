/**
 * Site footer — social links + copyright. Links come from site.config.ts.
 */
import { site } from "@/config/site.config";
import { Icon } from "@/components/icons";

export default function Footer() {
  const year = 2026; // hard-coded so server/client render identically.

  return (
    <footer className="mt-24 border-t border-border/60 py-10">
      <div className="container-col flex flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-sm text-fg-muted">
          © {year} {site.name}. Built from scratch.
        </p>

        <div className="flex items-center gap-4">
          {site.socials
            .filter((s) => s.href)
            .map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
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
