/* ---------------------------------------------------------------------------
   One entry in a list: date on the left, everything else on the right.

   Used by experience, projects, blog and education, so they all line up.
   On a phone the date moves above the title.
   --------------------------------------------------------------------------- */

export default function Record({
  date,
  children,
}: {
  date: string;
  children: React.ReactNode;
}) {
  return (
    <article className="record">
      <div className="record__date">{date}</div>
      <div className="record__body">{children}</div>
    </article>
  );
}

/** Optional heading above a group of records. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <h2 className="section__title">{title}</h2>
      {children}
    </section>
  );
}
