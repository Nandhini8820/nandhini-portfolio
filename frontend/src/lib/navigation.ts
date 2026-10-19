export const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

export function getHeaderHeight(): number {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  return header ? header.getBoundingClientRect().height : 0;
}

/**
 * Scrolls so the section sits just below the sticky header, updates the URL hash
 * without jumping, and moves keyboard focus to the section so Tab continues from there.
 */
export function scrollToSection(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  const top = id === 'home' ? 0 : target.getBoundingClientRect().top + window.scrollY - getHeaderHeight() - 8;
  window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  if (window.history?.replaceState) {
    window.history.replaceState(null, '', id === 'home' ? window.location.pathname + window.location.search : `#${id}`);
  }

  const focusTarget = target.querySelector<HTMLElement>('[data-section-heading]') ?? target;
  if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
  focusTarget.focus({ preventScroll: true });
  return true;
}

export interface SectionPosition {
  id: string;
  /** Distance from the top of the document, in px. */
  top: number;
}

/**
 * Picks the section the reader is looking at: the last one whose top has passed
 * a line one third of the way down the viewport (below the header). At the very
 * bottom of the page the final section wins, even when it is too short to reach that line.
 */
export function getActiveSectionId(
  sections: SectionPosition[],
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
  headerHeight: number,
): string | null {
  if (sections.length === 0) return null;
  if (scrollY + viewportHeight >= documentHeight - 2) return sections[sections.length - 1].id;

  const line = scrollY + headerHeight + (viewportHeight - headerHeight) / 3;
  let active = sections[0].id;
  for (const section of sections) {
    if (section.top <= line) active = section.id;
  }
  return active;
}
