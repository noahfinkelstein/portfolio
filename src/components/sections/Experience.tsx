/**
 * ============================================================================
 *  EXPERIENCE SECTION  —  vertical timeline of roles.
 * ============================================================================
 *
 * DATA: src/config/experience.ts — each entry is one job/research/leadership role.
 *
 * VISUAL: left border + accent dots form the timeline. Optional `photos` on each
 * entry render as a small thumbnail strip under the bullets.
 */

import Section from "@/components/Section";
import SmartImage from "@/components/SmartImage";
import { experience } from "@/config/experience";

export default function Experience() {
  return (
    <Section id="experience" index="03" title="Experience">
      {/* border-l creates the vertical timeline line; pl-6 offsets content */}
      <ol className="relative space-y-10 border-l border-border pl-6 sm:pl-8">
        {experience.map((job) => (
          <li key={`${job.org}-${job.role}`} className="relative">
            {/* Dot on the timeline — negative left positions it on the border */}
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg sm:-left-[35px]" />

            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-display text-lg font-semibold">
                {job.role}{" "}
                <span className="text-accent">@ {job.org}</span>
              </h3>
              <span className="font-mono text-xs text-fg-muted">
                {job.date}
              </span>
            </div>

            {job.location && (
              <p className="mt-0.5 text-sm text-fg-muted">{job.location}</p>
            )}

            {/* Bullet list — marker:text-accent colors the disc bullets */}
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-fg-muted marker:text-accent">
              {job.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            {/* Optional tech/skill tags */}
            {job.tags && job.tags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-bg-softer px-2.5 py-1 font-mono text-[11px] text-fg-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}

            {/* Optional photo strip — paths from experience.ts `photos` array */}
            {job.photos && job.photos.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {job.photos.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-24 w-32 overflow-hidden rounded-lg border border-border"
                  >
                    <SmartImage
                      src={src}
                      alt={`${job.org} photo ${i + 1}`}
                      fill
                      sizes="128px"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
