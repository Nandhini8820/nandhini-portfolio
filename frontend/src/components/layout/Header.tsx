import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Theme } from '../../hooks/useTheme';
import { SECTIONS, scrollToSection } from '../../lib/navigation';
import { Icon } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  name: string;
  activeSection: string;
  theme: Theme;
  onToggleTheme: () => void;
  scrolled: boolean;
}

const DESKTOP_QUERY = '(min-width: 960px)';

export function Header({ name, activeSection, theme, onToggleTheme, scrolled }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu with Escape and return focus to the button that opened it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  // If the window grows to desktop width, the mobile menu no longer applies.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setMenuOpen(false);
    scrollToSection(id);
  };

  const links = SECTIONS.map((section) => {
    const isActive = section.id === activeSection;
    return (
      <li key={section.id}>
        <a
          href={`#${section.id}`}
          className={`nav__link ${isActive ? 'nav__link--active' : ''}`}
          aria-current={isActive ? 'location' : undefined}
          onClick={(event) => navigate(event, section.id)}
        >
          {section.label}
        </a>
      </li>
    );
  });

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`} data-site-header>
      <div className="site-header__inner">
        <a href="#home" className="brand" onClick={(event) => navigate(event, 'home')}>
          <span className="brand__mark" aria-hidden="true">
            NL
          </span>
          <span className="brand__name">{name}</span>
        </a>

        <nav className="nav nav--desktop" aria-label="Main">
          <ul className="nav__list">{links}</ul>
        </nav>

        <div className="site-header__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            ref={toggleRef}
            type="button"
            className="icon-button menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        className={`nav nav--mobile ${menuOpen ? 'nav--mobile-open' : ''}`}
        aria-label="Main"
        hidden={!menuOpen}
      >
        <ul className="nav__list">{links}</ul>
      </nav>
    </header>
  );
}
