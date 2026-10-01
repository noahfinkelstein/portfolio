/* ---------------------------------------------------------------------------
   HOME — "/"

   The sections, top to bottom. Each lives in its own component; the words
   come from src/content/*. Server-only data (the blog feed, skill logos) is
   resolved here and passed down as props.
   --------------------------------------------------------------------------- */

import Loader from "@/components/hero/Loader";
import Hero from "@/components/hero/Hero";
import Titles from "@/components/sections/Titles";
import Latest from "@/components/sections/Latest";
import SelectedProjects from "@/components/projects/SelectedProjects";
import About from "@/components/about/About";
import Experience from "@/components/experience/Experience";
import PageSelect from "@/components/layout/PageSelect";
import { getFeaturedProjects } from "@/content/projects";
import { getFeed } from "@/lib/feed";
import { getResolvedSkills } from "@/lib/icons";

export default function HomePage() {
  return (
    <>
      <Loader />
      <Hero />
      <Titles />
      <SelectedProjects projects={getFeaturedProjects()} />
      <Latest items={getFeed()} />
      <About />
      <Experience skills={getResolvedSkills()} />
      <PageSelect forward={{ href: "/projects", label: "Projects" }} />
    </>
  );
}
