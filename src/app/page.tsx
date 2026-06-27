/**
 * ============================================================================
 *  HOME PAGE  —  the main scrolling portfolio at "/".
 * ============================================================================
 *
 * This is a single-page layout: Nav + stacked sections + Footer. There is no
 * routing between sections — each section has an `id` (e.g. id="projects") and
 * nav links use hash URLs like /#projects to scroll there.
 *
 * TO REORDER SECTIONS: move the component lines below (keep nav in site.config
 * consistent if you add/remove sections).
 *
 * TO ADD A SECTION:
 *   1. Create src/components/sections/YourSection.tsx (wrap content in <Section>)
 *   2. Import it here and add it to <main>
 *   3. Add a nav entry in src/config/site.config.ts
 */
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      {/* Sticky top bar — links from site.config.ts `nav` */}
      <Nav />

      {/* All scrollable content lives in <main> for accessibility semantics */}
      <main>
        <Hero />       {/* full-bleed hero with animated background */}
        <About />      {/* bio + portrait */}
        <Projects />   {/* project cards from config/projects.ts */}
        <Experience /> {/* timeline from config/experience.ts */}
        <Education />  {/* schools from config/education.ts */}
        <Contact />    {/* email + social CTA */}
      </main>

      <Footer />
    </>
  );
}
