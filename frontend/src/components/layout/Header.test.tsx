import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

function renderHeader(activeSection = 'home') {
  const onToggleTheme = jest.fn();
  render(
    <>
      <Header name="Nandhini L" activeSection={activeSection} theme="light" onToggleTheme={onToggleTheme} scrolled={false} />
      {['home', 'skills', 'experience', 'projects', 'recognition', 'education', 'contact'].map((id) => (
        <section key={id} id={id}>
          <h2 data-section-heading tabIndex={-1}>
            {id}
          </h2>
        </section>
      ))}
    </>,
  );
  return { onToggleTheme };
}

describe('Header', () => {
  it('lists every section with a working anchor', () => {
    renderHeader();
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0];
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual(['Home', 'Skills', 'Experience', 'Projects', 'Recognition', 'Education', 'Contact']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#home', '#skills', '#experience', '#projects', '#recognition', '#education', '#contact',
    ]);
  });

  it('marks the active section for assistive technology', () => {
    renderHeader('projects');
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0];

    expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'location');
    expect(within(nav).getByRole('link', { name: 'Skills' })).not.toHaveAttribute('aria-current');
  });

  it('scrolls to the section when a link is clicked', async () => {
    renderHeader();
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0];

    await userEvent.click(within(nav).getByRole('link', { name: 'Experience' }));

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#experience');
  });

  it('takes the logo link back to the top', async () => {
    renderHeader('contact');

    await userEvent.click(screen.getByRole('link', { name: /nandhini l/i }));

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('opens the mobile menu, navigates, and closes it', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    const mobileNav = document.getElementById('mobile-menu') as HTMLElement;
    expect(mobileNav).not.toBeVisible();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Close menu');
    expect(mobileNav).toBeVisible();

    await userEvent.click(within(mobileNav).getByRole('link', { name: 'Contact' }));
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNav).not.toBeVisible();
  });

  it('closes the mobile menu with Escape and returns focus to the toggle', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Open menu' });

    await userEvent.click(toggle);
    await userEvent.keyboard('{Escape}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('calls the theme toggle', async () => {
    const { onToggleTheme } = renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
