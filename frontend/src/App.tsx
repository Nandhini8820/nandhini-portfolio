import { useCallback, useState } from 'react';
import { BackToTop } from './components/layout/BackToTop';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Contact } from './components/sections/Contact';
import type { ContactDraft } from './components/sections/ContactForm';
import { Experience } from './components/sections/Experience';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Education, Recognition } from './components/sections/RecognitionEducation';
import { Skills } from './components/sections/Skills';
import { useActiveSection } from './hooks/useActiveSection';
import { usePortfolio } from './hooks/usePortfolio';
import { useScrolledPast } from './hooks/useScrollPosition';
import { useTheme } from './hooks/useTheme';
import { SECTIONS, scrollToSection } from './lib/navigation';
import type { Project } from './types/portfolio';

const SECTION_IDS = SECTIONS.map((section) => section.id);

export default function App() {
  const { content, source } = usePortfolio();
  const { theme, toggleTheme } = useTheme();
  const activeSection = useActiveSection(SECTION_IDS);
  const scrolled = useScrolledPast(8);
  const showBackToTop = useScrolledPast(640);
  const [draft, setDraft] = useState<ContactDraft | null>(null);

  const askAboutProject = useCallback((project: Project) => {
    setDraft({ message: `Hi Nandhini, I’d like to learn more about ${project.name}.`, key: Date.now() });
    scrollToSection('contact');
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header
        name={content.profile.name}
        activeSection={activeSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        scrolled={scrolled}
      />
      <main id="main" tabIndex={-1}>
        <Hero profile={content.profile} highlight={content.highlight} />
        <Skills skills={content.skills} familiarWith={content.familiarWith} />
        <Experience experience={content.experience} />
        <Projects projects={content.projects} onAskAbout={askAboutProject} />
        <Recognition items={content.recognition} />
        <Education items={content.education} />
        <Contact profile={content.profile} draft={draft} />
      </main>
      <Footer profile={content.profile} source={source} />
      <BackToTop visible={showBackToTop} />
    </>
  );
}
