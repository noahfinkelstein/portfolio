/* ---------------------------------------------------------------------------
   HOME  —  "/"
   Words live in src/content/home.ts. The Currently list is pulled from
   experience.ts so it can never drift out of sync with the full record.
   --------------------------------------------------------------------------- */

import Image from "next/image";
import Link from "next/link";
import Page from "@/components/Page";
import Record, { Section } from "@/components/Record";
import { site } from "@/content/site";
import { home } from "@/content/home";
import { experience } from "@/content/experience";

export default function HomePage() {
  const current = home.currently
    .map((role) => experience.find((e) => e.role === role))
    .filter((e): e is (typeof experience)[number] => Boolean(e));

  return (
    <Page current="/">
      <h1 className="page-title page-title--tight">{site.name}</h1>
      <p className="page-lede">{home.lede}</p>

      <div className="intro">
        <figure className="intro__portrait-wrap">
          <div className="intro__frame">
            <Image
              src={home.portrait.src}
              alt={home.portrait.alt}
              width={460}
              height={575}
              priority
              sizes="(max-width: 40rem) 9rem, 7.5rem"
              style={{ objectPosition: home.portrait.position }}
            />
          </div>
          <figcaption className="intro__caption">
            {home.portrait.caption}
          </figcaption>
        </figure>

        <div className="prose">
          {home.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <Section title="Currently">
        {current.map((role) => (
          <Record key={role.role + role.date} date={role.date}>
            <h3 className="record__title">{role.role}</h3>
            <p className="record__meta">
              {role.orgHref ? (
                <a href={role.orgHref}>{role.org}</a>
              ) : (
                role.org
              )}
            </p>
            <p>{role.bullets[0]}</p>
          </Record>
        ))}
        <p className="section__more">
          <Link href="/experience">Full record and education →</Link>
        </p>
      </Section>

      <Section title="Contact">
        <dl className="facts">
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </dd>

          <dt>Elsewhere</dt>
          <dd>
            {site.links
              .filter((l) => l.href)
              .map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
          </dd>

          <dt>Based in</dt>
          <dd>{site.location}</dd>
        </dl>
      </Section>
    </Page>
  );
}
