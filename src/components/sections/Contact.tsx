/**
 * ============================================================================
 *  CONTACT SECTION  —  email CTA and social links.
 * ============================================================================
 *
 * EMAIL + SOCIALS: src/config/site.config.ts
 *
 * Centered card layout — mirrors the hero CTA style (accent email button).
 * Social icons use the same Icon component + filter pattern as Footer.
 */

import Section from "@/components/Section";
import { site } from "@/config/site.config";
import { Icon } from "@/components/icons";

export default function Contact() {
  return (
    <Section id="contact" index="05" title="Contact">
      <div className="card flex flex-col items-center gap-6 p-10 text-center">
        <h3 className="font-display text-2xl font-semibold sm:text-3xl">
          Let&apos;s build something.
        </h3>
        <p className="max-w-xl text-fg-muted">
          I&apos;m open to internships, research, and interesting collaborations.
          The fastest way to reach me is email.
        </p>

        {/* mailto: opens the user's email client with your address pre-filled */}
        <a
          href={`mailto:${site.email}`}
          className="rounded-full bg-accent px-7 py-3 font-medium text-bg transition-transform hover:scale-[1.03]"
        >
          {site.email}
        </a>

        <div className="flex items-center gap-5 pt-2">
          {site.socials
            .filter((s) => s.href) // skip socials with empty href
            .map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="text-fg-muted transition-colors hover:text-accent"
              >
                <Icon name={s.icon} width={24} height={24} />
              </a>
            ))}
        </div>
      </div>
    </Section>
  );
}
