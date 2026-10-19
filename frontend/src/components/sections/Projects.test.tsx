import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Project } from '../../types/portfolio';
import { ProjectCard } from './Projects';

const base: Project = {
  id: 'sentinel',
  name: 'Sentinel',
  tagline: 'AI-powered change intelligence agent',
  featured: true,
  description: ['Correlates releases.'],
  tech: ['React', '.NET Core'],
  links: { github: null, demo: null },
};

describe('ProjectCard', () => {
  it('renders no link buttons when no URLs are provided', () => {
    render(<ProjectCard project={base} onAskAbout={jest.fn()} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Code and walkthrough available on request.')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Technologies used in Sentinel' })).toHaveTextContent('.NET Core');
  });

  it('renders working external links when URLs are provided', () => {
    const project = { ...base, links: { github: 'https://github.com/example/sentinel', demo: 'https://demo.example' } };
    render(<ProjectCard project={project} onAskAbout={jest.fn()} />);

    const source = screen.getByRole('link', { name: /source code/i });
    expect(source).toHaveAttribute('href', 'https://github.com/example/sentinel');
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: /live demo/i })).toHaveAttribute('href', 'https://demo.example');
    expect(screen.queryByText('Code and walkthrough available on request.')).not.toBeInTheDocument();
  });

  it('asks about the project', async () => {
    const onAskAbout = jest.fn();
    render(<ProjectCard project={base} onAskAbout={onAskAbout} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ask about Sentinel' }));

    expect(onAskAbout).toHaveBeenCalledWith(base);
  });
});
