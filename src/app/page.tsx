/**
 * HOME PAGE — a single scrolling page built from section components.
 *
 * To reorder sections, just move the lines around. To remove one, delete its
 * line (and its nav entry in site.config.ts). To add a new section, make a
 * component in src/components/sections/ and drop it in here.
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
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
