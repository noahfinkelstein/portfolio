/* ---------------------------------------------------------------------------
   HOME — "/"

   Three parts, top to bottom:
     Hero               the front matter: name, lede, the two intro
                        paragraphs, contact links, the portrait (Fig. 2) and
                        the knot (Fig. 1)
     SelectedProjects   "Work": the featured projects (section id "work")
     Latest             "Writing": blog posts only (section id "writing");
                        renders nothing while there are no posts
   Each lives in its own component; the words come from src/content/*.
   Server-only data (the blog feed) is read here and passed down as props.
   --------------------------------------------------------------------------- */

import Hero from "@/components/hero/Hero";
import Latest from "@/components/sections/Latest";
import SelectedProjects from "@/components/projects/SelectedProjects";
import { home } from "@/content/home";
import { getFeaturedProjects } from "@/content/projects";
import { getFeed } from "@/lib/feed";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedProjects projects={getFeaturedProjects()} title={home.sections.work} />
      <Latest items={getFeed({ kinds: ["blog"] })} id="writing" title={home.sections.writing} minItems={1} />
    </>
  );
}
