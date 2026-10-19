import { getActiveSectionId, scrollToSection } from './navigation';

describe('getActiveSectionId', () => {
  const sections = [
    { id: 'home', top: 0 },
    { id: 'skills', top: 900 },
    { id: 'experience', top: 1800 },
    { id: 'contact', top: 2700 },
  ];

  it('returns the first section at the top of the page', () => {
    expect(getActiveSectionId(sections, 0, 800, 3200, 72)).toBe('home');
  });

  it('switches once a section passes a third of the way down the viewport', () => {
    // Reading line = 700 + 72 + (800 - 72) / 3 ≈ 1014.7, past skills (900).
    expect(getActiveSectionId(sections, 700, 800, 3200, 72)).toBe('skills');
    expect(getActiveSectionId(sections, 500, 800, 3200, 72)).toBe('home');
  });

  it('selects the last section at the bottom of the page even if it is short', () => {
    expect(getActiveSectionId(sections, 2400, 800, 3200, 72)).toBe('contact');
  });

  it('returns null when there are no sections', () => {
    expect(getActiveSectionId([], 0, 800, 800, 72)).toBeNull();
  });
});

describe('scrollToSection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header data-site-header></header>
      <section id="projects"><h2 data-section-heading tabindex="-1">Projects</h2></section>`;
    const header = document.querySelector('[data-site-header]') as HTMLElement;
    header.getBoundingClientRect = () => ({ height: 72 }) as DOMRect;
    const section = document.getElementById('projects') as HTMLElement;
    section.getBoundingClientRect = () => ({ top: 1500 }) as DOMRect;
  });

  it('scrolls below the sticky header, updates the hash and focuses the heading', () => {
    expect(scrollToSection('projects')).toBe(true);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1500 - 72 - 8, behavior: 'smooth' });
    expect(window.location.hash).toBe('#projects');
    expect(document.activeElement).toHaveTextContent('Projects');
  });

  it('returns false for a section that does not exist', () => {
    expect(scrollToSection('missing')).toBe(false);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
