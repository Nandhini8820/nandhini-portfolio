import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { fallbackContent } from './data/fallbackContent';
import { SECTIONS } from './lib/navigation';
import { jsonResponse } from './test/helpers';

describe('App', () => {
  afterEach(() => {
    delete (globalThis as { fetch?: unknown }).fetch;
  });

  it('renders every navigable section and loads live content from the API', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(200, fallbackContent)) as unknown as typeof fetch;

    render(<App />);

    for (const section of SECTIONS) {
      expect(document.getElementById(section.id)).toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { level: 1, name: 'Nandhini L' })).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/portfolio', expect.anything());
    expect(await screen.findByText('Content served live by the ASP.NET Core API')).toBeInTheDocument();
  });

  it('keeps the portfolio visible when the API is unreachable', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;

    render(<App />);

    expect(await screen.findByText('Showing saved content (API offline)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sentinel' })).toBeInTheDocument();
  });

  it('wires the contact buttons to real destinations', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(200, fallbackContent)) as unknown as typeof fetch;
    render(<App />);
    await screen.findByText('Content served live by the ASP.NET Core API');

    const hero = document.getElementById('home') as HTMLElement;
    expect(within(hero).getByRole('link', { name: /email me/i })).toHaveAttribute('href', `mailto:${fallbackContent.profile.email}`);
    expect(within(hero).getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', fallbackContent.profile.linkedin);
  });

  it('asking about a project scrolls to contact and pre-fills the message', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(200, fallbackContent)) as unknown as typeof fetch;
    render(<App />);
    await screen.findByText('Content served live by the ASP.NET Core API');

    await userEvent.click(screen.getByRole('button', { name: 'Ask about Sentinel' }));

    expect(window.scrollTo).toHaveBeenCalled();
    expect(screen.getByLabelText('Message')).toHaveValue('Hi Nandhini, I’d like to learn more about Sentinel.');
  });

  it('has a skip link to the main content', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(200, fallbackContent)) as unknown as typeof fetch;
    render(<App />);
    await screen.findByText('Content served live by the ASP.NET Core API');

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });
});
