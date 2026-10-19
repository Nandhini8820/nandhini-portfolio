import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'portfolio-theme';

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function getInitialTheme(): Theme {
  const fromDocument = document.documentElement.dataset.theme;
  if (fromDocument === 'light' || fromDocument === 'dark') return fromDocument;
  const stored = readStoredTheme();
  if (stored) return stored;
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Light/dark theme stored on <html data-theme> and remembered between visits. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((current) => (current === 'dark' ? 'light' : 'dark')), []);

  return { theme, toggleTheme };
}
