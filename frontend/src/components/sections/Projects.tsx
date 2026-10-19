import type { Project } from '../../types/portfolio';
import { Icon } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { TagList } from '../ui/Tag';

interface ProjectsProps {
  projects: Project[];
  onAskAbout: (project: Project) => void;
}

export function ProjectCard({ project, onAskAbout }: { project: Project; onAskAbout: (project: Project) => void }) {
  const { github, demo } = project.links;
  const hasLinks = Boolean(github || demo);

  return (
    <article className={`project-card ${project.featured ? 'project-card--featured' : ''}`} aria-labelledby={`project-${project.id}`}>
      <div className="project-card__header">
        <h3 id={`project-${project.id}`} className="project-card__name">
          {project.name}
        </h3>
        <p className="project-card__tagline">{project.tagline}</p>
      </div>
      <div className="project-card__body">
        {project.description.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <TagList items={project.tech} label={`Technologies used in ${project.name}`} />
      <div className="project-card__actions">
        {github ? (
          <a className="button button--secondary button--small" href={github} target="_blank" rel="noopener noreferrer">
            <Icon name="github" />
            Source code<span className="visually-hidden"> for {project.name} (opens in a new tab)</span>
          </a>
        ) : null}
        {demo ? (
          <a className="button button--secondary button--small" href={demo} target="_blank" rel="noopener noreferrer">
            <Icon name="external" />
            Live demo<span className="visually-hidden"> of {project.name} (opens in a new tab)</span>
          </a>
        ) : null}
        {!hasLinks ? <p className="project-card__note">Code and walkthrough available on request.</p> : null}
        <button type="button" className="button button--ghost button--small" onClick={() => onAskAbout(project)}>
          Ask about {project.name}
        </button>
      </div>
    </article>
  );
}

export function Projects({ projects, onAskAbout }: ProjectsProps) {
  return (
    <section id="projects" className="section section--band" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects" title="Projects" intro="AI-powered tools I’ve designed and built end to end." />
        <div className="projects-grid">
          {projects.map((project, index) => (
            <Reveal key={project.id} className="projects-grid__cell" delay={index * 80}>
              <ProjectCard project={project} onAskAbout={onAskAbout} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
