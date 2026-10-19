import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { THEME_STORAGE_KEY, useTheme } from './useTheme';

function Harness() {
  const { theme, toggleTheme } = useTheme();
  return <ThemeToggle theme={theme} onToggle={toggleTheme} />;
}

describe('useTheme', () => {
  it('starts from the system preference and toggles, applying and remembering the choice', async () => {
    render(<Harness />);
    expect(document.documentElement.dataset.theme).toBe('light');

    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('restores a saved theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    render(<Harness />);

    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
